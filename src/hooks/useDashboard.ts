import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Types ────────────────────────────────────────────────────
export interface Enrollment {
  id: string;
  course_id: string;
  progress: number;
  completed: boolean;
  enrolled_at: string;
  updated_at: string;
}

export interface QuizResult {
  id: string;
  quiz_id: string;
  course_id: string;
  score: number;
  passed: boolean;
  xp_earned: number;
  time_taken: number;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  course_id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
}

export interface DailyStat {
  date: string;
  new_users: number;
  active_users: number;
  new_enrollments: number;
  revenue: number;
}

// ════════════════════════════════════════════════════════════
// 1. useStudentDashboard — สำหรับ Student Dashboard
// ════════════════════════════════════════════════════════════
export const useStudentDashboard = () => {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentQuiz, setRecentQuiz] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: enroll }, { data: notif }, { data: quiz }] = await Promise.all([
      supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    setEnrollments(enroll ?? []);
    setNotifications(notif ?? []);
    setRecentQuiz(quiz ?? null);
    setLoading(false);
  }, [user]);

  // อัปเดต last_seen ทุกครั้งที่เปิด dashboard
  const updateSession = useCallback(async () => {
    if (!user) return;
    await supabase.rpc("upsert_user_session", { p_user_id: user.id });
  }, [user]);

  useEffect(() => {
    fetchData();
    updateSession();
  }, [fetchData, updateSession]);

  // ── Realtime subscriptions ──────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`student-dashboard-${user.id}`)
      // enrollments เปลี่ยน → อัปเดต progress
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "enrollments",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setEnrollments((prev) => [payload.new as Enrollment, ...prev]);
        } else if (payload.eventType === "UPDATE") {
          setEnrollments((prev) =>
            prev.map((e) => e.id === payload.new.id ? payload.new as Enrollment : e)
          );
        } else if (payload.eventType === "DELETE") {
          setEnrollments((prev) => prev.filter((e) => e.id !== payload.old.id));
        }
      })
      // notifications ใหม่
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
      })
      // อ่าน notification แล้ว
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications((prev) =>
          prev.map((n) => n.id === payload.new.id ? payload.new as Notification : n)
        );
      })
      // quiz result ใหม่ → XP อัปเดต
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "quiz_results",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setRecentQuiz(payload.new as QuizResult);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // ── Mark notification as read ───────────────────────────
  const markAsRead = async (notifId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notifId);
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const completedCourses = enrollments.filter((e) => e.completed).length;
  const inProgressCourses = enrollments.filter((e) => !e.completed && e.progress > 0).length;

  return {
    enrollments,
    notifications,
    recentQuiz,
    loading,
    unreadCount,
    completedCourses,
    inProgressCourses,
    streak: profile?.streak ?? 0,
    totalXp: profile?.total_xp ?? 0,
    markAsRead,
    markAllRead,
    refetch: fetchData,
  };
};

// ════════════════════════════════════════════════════════════
// 2. useInstructorDashboard — สำหรับ Instructor Dashboard
// ════════════════════════════════════════════════════════════
export const useInstructorDashboard = () => {
  const { user } = useAuth();
  const [todayEnrollments, setTodayEnrollments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentQuizResults, setRecentQuizResults] = useState<QuizResult[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    const [{ data: todayEnroll }, { data: revenue }, { data: quizzes }, { data: txns }] =
      await Promise.all([
        // enrollments วันนี้
        supabase
          .from("enrollments")
          .select("id", { count: "exact" })
          .gte("enrolled_at", `${today}T00:00:00`),
        // รายได้รวม
        supabase
          .from("transactions")
          .select("amount")
          .eq("status", "success"),
        // quiz results ล่าสุด
        supabase
          .from("quiz_results")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        // transactions ล่าสุด
        supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    setTodayEnrollments(todayEnroll?.length ?? 0);
    setTotalRevenue(revenue?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0);
    setRecentQuizResults(quizzes ?? []);
    setRecentTransactions(txns ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Realtime ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`instructor-dashboard-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "enrollments",
      }, () => {
        setTodayEnrollments((prev) => prev + 1);
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "transactions",
      }, (payload) => {
        const txn = payload.new as Transaction;
        if (txn.status === "success") {
          setTotalRevenue((prev) => prev + Number(txn.amount));
          setRecentTransactions((prev) => [txn, ...prev.slice(0, 4)]);
        }
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "quiz_results",
      }, (payload) => {
        setRecentQuizResults((prev) => [payload.new as QuizResult, ...prev.slice(0, 9)]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return {
    todayEnrollments,
    totalRevenue,
    recentQuizResults,
    recentTransactions,
    loading,
    refetch: fetchData,
  };
};

// ════════════════════════════════════════════════════════════
// 3. useAdminDashboard — สำหรับ Admin Dashboard
// ════════════════════════════════════════════════════════════
export const useAdminDashboard = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // online = last_seen ภายใน 5 นาที
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const [{ data: online }, { data: txns }, { data: stats }, { data: revenue }] =
      await Promise.all([
        supabase
          .from("user_sessions")
          .select("id", { count: "exact" })
          .gte("last_seen", fiveMinAgo),
        supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("daily_stats")
          .select("*")
          .order("date", { ascending: false })
          .limit(30),
        supabase
          .from("transactions")
          .select("amount")
          .eq("status", "success"),
      ]);

    setOnlineUsers(online?.length ?? 0);
    setRecentTransactions(txns ?? []);
    setDailyStats((stats ?? []).reverse()); // เรียงจากเก่าไปใหม่สำหรับ graph
    setTotalRevenue(revenue?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Realtime ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`admin-dashboard-${user.id}`)
      // user online tracking
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "user_sessions",
      }, () => {
        // refetch online count เมื่อมีการเปลี่ยนแปลง
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        supabase
          .from("user_sessions")
          .select("id", { count: "exact" })
          .gte("last_seen", fiveMinAgo)
          .then(({ data }) => setOnlineUsers(data?.length ?? 0));
      })
      // ยอดขายใหม่
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "transactions",
      }, (payload) => {
        const txn = payload.new as Transaction;
        setRecentTransactions((prev) => [txn, ...prev.slice(0, 9)]);
        if (txn.status === "success") {
          setTotalRevenue((prev) => prev + Number(txn.amount));
        }
      })
      // daily stats graph อัปเดต
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "daily_stats",
      }, (payload) => {
        setDailyStats((prev) => {
          const existing = prev.findIndex((s) => s.date === (payload.new as DailyStat).date);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = payload.new as DailyStat;
            return updated;
          }
          return [...prev, payload.new as DailyStat];
        });
      })
      .subscribe();

    // refresh online count ทุก 1 นาที
    const interval = setInterval(() => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      supabase
        .from("user_sessions")
        .select("id", { count: "exact" })
        .gte("last_seen", fiveMinAgo)
        .then(({ data }) => setOnlineUsers(data?.length ?? 0));
    }, 60_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  return {
    onlineUsers,
    recentTransactions,
    dailyStats,
    totalUsers,
    totalRevenue,
    loading,
    refetch: fetchData,
  };
};
