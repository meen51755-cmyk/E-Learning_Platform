import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useInstructorDashboard } from "@/hooks/useDashboard";
import {
  Users, TrendingUp, DollarSign, BookOpen,
  Star, BarChart2, Zap, RefreshCw, Loader2,
  ChevronUp, CheckCircle, XCircle, Clock,
  Award, Activity
} from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const InstructorDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const {
    todayEnrollments,
    totalRevenue,
    recentQuizResults,
    recentTransactions,
    loading,
    refetch,
  } = useInstructorDashboard();

  const [activeTab, setActiveTab] = useState<"quiz" | "transactions">("quiz");

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Instructor";
  const initials = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url;

  const avgScore =
    recentQuizResults.length > 0
      ? Math.round(recentQuizResults.reduce((sum, q) => sum + q.score, 0) / recentQuizResults.length)
      : 0;
  const passRate =
    recentQuizResults.length > 0
      ? Math.round((recentQuizResults.filter((q) => q.passed).length / recentQuizResults.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">กำลังโหลด Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-14 h-14 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">สวัสดี 👋 ยินดีต้อนรับ</p>
              <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-500">
                  Instructor
                </span>
                <span className="flex items-center gap-1 text-xs text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
                  Realtime
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refetch} title="รีเฟรช">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>ออกจากระบบ</Button>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* ผู้เรียนใหม่วันนี้ */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <span className="flex items-center gap-1 text-xs text-success font-medium">
                <ChevronUp className="w-3 h-3" /> Live
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{todayEnrollments}</p>
              <p className="text-sm text-muted-foreground mt-0.5">ผู้เรียนใหม่วันนี้</p>
            </div>
          </div>

          {/* รายได้สะสม */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="flex items-center gap-1 text-xs text-success font-medium">
                <ChevronUp className="w-3 h-3" /> Live
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-0.5">รายได้สะสม</p>
            </div>
          </div>

          {/* คะแนน Quiz เฉลี่ย */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs text-muted-foreground">เฉลี่ย</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{avgScore}<span className="text-lg text-muted-foreground">/100</span></p>
              <p className="text-sm text-muted-foreground mt-0.5">คะแนน Quiz เฉลี่ย</p>
            </div>
          </div>

          {/* อัตราผ่าน */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-violet-500" />
              </div>
              <span className="text-xs text-muted-foreground">Pass Rate</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{passRate}<span className="text-lg text-muted-foreground">%</span></p>
              <p className="text-sm text-muted-foreground mt-0.5">อัตราผ่าน Quiz</p>
            </div>
          </div>
        </div>

        {/* ── Score Distribution Bar ─────────────────────────── */}
        {recentQuizResults.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground text-sm">การกระจายคะแนน Quiz (10 ครั้งล่าสุด)</h2>
            </div>
            <div className="flex items-end gap-2 h-24">
              {recentQuizResults.map((q, i) => (
                <div key={q.id} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {q.score}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      q.passed ? "bg-gradient-to-t from-emerald-600 to-emerald-400" : "bg-gradient-to-t from-red-600 to-red-400"
                    }`}
                    style={{ height: `${q.score}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> ผ่าน
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> ไม่ผ่าน
              </span>
            </div>
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
          {[
            { id: "quiz" as const, label: "ผลสอบล่าสุด", icon: Activity },
            { id: "transactions" as const, label: "รายการขาย", icon: DollarSign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Quiz Results ──────────────────────────────── */}
        {activeTab === "quiz" && (
          <div className="animate-fade-in">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  ผลสอบนักเรียน (10 ครั้งล่าสุด)
                </h3>
                <span className="flex items-center gap-1 text-xs text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
                  Realtime
                </span>
              </div>
              {recentQuizResults.length === 0 ? (
                <div className="p-12 text-center">
                  <BookOpen className="w-10 h-10 mx-auto text-muted-foreground opacity-30 mb-3" />
                  <p className="text-muted-foreground text-sm">ยังไม่มีผลสอบ</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentQuizResults.map((q) => (
                    <div key={q.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      {/* Score badge */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                        q.score >= 80 ? "bg-emerald-500/10 text-emerald-600"
                        : q.score >= 60 ? "bg-amber-500/10 text-amber-600"
                        : "bg-red-500/10 text-red-600"
                      }`}>
                        {q.score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {q.passed
                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          }
                          <p className="text-sm font-medium text-foreground truncate">
                            Quiz: {q.quiz_id.slice(0, 8)}…
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Course: {q.course_id.slice(0, 8)}…
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-medium justify-end">
                          <Zap className="w-3 h-3" />
                          +{q.xp_earned} XP
                        </div>
                        {q.time_taken && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatTime(q.time_taken)}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(q.created_at).toLocaleDateString("th-TH")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Transactions ──────────────────────────────── */}
        {activeTab === "transactions" && (
          <div className="animate-fade-in">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  รายการขายล่าสุด
                </h3>
                <span className="flex items-center gap-1 text-xs text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" />
                  Realtime
                </span>
              </div>
              {recentTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <DollarSign className="w-10 h-10 mx-auto text-muted-foreground opacity-30 mb-3" />
                  <p className="text-muted-foreground text-sm">ยังไม่มีรายการขาย</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentTransactions.map((txn) => (
                    <div key={txn.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        txn.status === "success" ? "bg-emerald-500"
                        : txn.status === "pending" ? "bg-amber-500"
                        : "bg-red-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          Course: {txn.course_id.slice(0, 12)}…
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {txn.payment_method ?? "—"} · {txn.status}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${txn.status === "success" ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {formatCurrency(txn.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(txn.created_at).toLocaleDateString("th-TH")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default InstructorDashboard;
