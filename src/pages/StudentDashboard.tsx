import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentDashboard } from "@/hooks/useDashboard";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { sampleCourses } from "@/data/mockData";
import {
  BookOpen, Trophy, Flame, Star, Bell, BellOff,
  ChevronRight, Play, CheckCircle, Zap,
  TrendingUp, Award, Target, Loader2, RefreshCw
} from "lucide-react";

const getLevel = (xp: number) => {
  const level = Math.floor(xp / 500) + 1;
  const currentLevelXp = (level - 1) * 500;
  const nextLevelXp = level * 500;
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return { level, progress, nextLevelXp };
};

const StudentDashboard = () => {
  const { user, profile, signOut } = useAuth();
  useSessionGuard(); // ✅ Single session enforcement

  const {
    enrollments, notifications, recentQuiz,
    loading, unreadCount, completedCourses,
    inProgressCourses, streak, totalXp,
    markAsRead, markAllRead, refetch,
  } = useStudentDashboard();

  const [showNotif, setShowNotif] = useState(false);
  const [activeTab, setActiveTab] = useState<"learning" | "achievements">("learning");

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "ผู้เรียน";
  const avatarUrl = profile?.avatar_url;
  const initials = displayName.charAt(0).toUpperCase();
  const { level, progress: xpProgress, nextLevelXp } = getLevel(totalXp);

  const enrolledCourses = enrollments.map((enroll) => ({
    ...enroll,
    course: sampleCourses.find((c) => c.id === enroll.course_id),
  })).filter((e) => e.course);

  const enrolledIds = enrollments.map((e) => e.course_id);
  const suggestedCourses = sampleCourses.filter((c) => !enrolledIds.includes(c.id)).slice(0, 3);

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
      <div className="container mx-auto container-padding py-8 max-w-6xl">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-14 h-14 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground shadow-md">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">ยินดีต้อนรับกลับมา 👋</p>
              <h1 className="text-2xl font-display font-bold text-foreground">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Level {level}
                </span>
                <span className="text-xs text-muted-foreground">{totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <Button variant="outline" size="icon" onClick={() => setShowNotif(!showNotif)} className="relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {showNotif && (
                <div className="absolute right-0 top-12 w-80 card-elevated shadow-xl z-50 rounded-xl overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground text-sm">การแจ้งเตือน</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                        อ่านทั้งหมด
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <BellOff className="w-8 h-8 mx-auto text-muted-foreground opacity-30 mb-2" />
                        <p className="text-sm text-muted-foreground">ไม่มีการแจ้งเตือน</p>
                      </div>
                    ) : notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors ${!notif.is_read ? "bg-primary/5" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.is_read ? "bg-primary" : "bg-muted"}`} />
                          <div>
                            <p className="text-sm font-medium text-foreground">{notif.title}</p>
                            {notif.message && <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>}
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {new Date(notif.created_at).toLocaleDateString("th-TH")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={refetch} title="รีเฟรช">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>ออกจากระบบ</Button>
          </div>
        </div>

        {/* ── Stats Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Flame, label: "Streak", value: `${streak} วัน`, sub: "เรียนต่อเนื่อง", color: "text-orange-500", bg: "bg-orange-500/10" },
            { icon: Zap, label: "XP ทั้งหมด", value: totalXp.toLocaleString(), sub: `Level ${level}`, color: "text-yellow-500", bg: "bg-yellow-500/10" },
            { icon: CheckCircle, label: "เรียนจบแล้ว", value: `${completedCourses} คอร์ส`, sub: "สำเร็จแล้ว", color: "text-success", bg: "bg-success/10" },
            { icon: BookOpen, label: "กำลังเรียน", value: `${inProgressCourses} คอร์ส`, sub: "อยู่ระหว่างเรียน", color: "text-primary", bg: "bg-primary/10" },
          ].map((stat) => (
            <div key={stat.label} className="card-elevated p-4 space-y-2">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <div>
                <p className="text-xs font-medium text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── XP Progress ──────────────────────────────────── */}
        <div className="card-elevated p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Level {level} → Level {level + 1}</span>
            </div>
            <span className="text-xs text-muted-foreground">{totalXp} / {nextLevelXp} XP</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">อีก {nextLevelXp - totalXp} XP จะขึ้น Level {level + 1}</p>
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
          {[
            { id: "learning" as const, label: "คอร์สของฉัน", icon: BookOpen },
            { id: "achievements" as const, label: "ความสำเร็จ", icon: Trophy },
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

        {/* ── Tab: คอร์สของฉัน ─────────────────────────────── */}
        {activeTab === "learning" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" /> กำลังเรียนอยู่
              </h2>
              {enrolledCourses.length === 0 ? (
                <div className="card-elevated p-12 text-center space-y-4">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">ยังไม่ได้สมัครคอร์สเลย</p>
                  <Link to="/courses"><Button variant="hero">เลือกดูคอร์สเลย</Button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledCourses.map((enroll) => (
                    <div key={enroll.id} className="card-elevated p-5 space-y-4 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{enroll.course?.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{enroll.course?.instructor}</p>
                        </div>
                        {enroll.completed && <CheckCircle className="w-5 h-5 text-success shrink-0" />}
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>ความคืบหน้า</span>
                          <span className="font-medium text-foreground">{enroll.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${enroll.completed ? "bg-success" : "bg-gradient-to-r from-primary to-violet-500"}`}
                            style={{ width: `${enroll.progress}%` }}
                          />
                        </div>
                      </div>
                      <Link to={`/learn/${enroll.course_id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Play className="w-3 h-3" />
                          {enroll.completed ? "ทบทวนอีกครั้ง" : "เรียนต่อ"}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {recentQuiz && (
              <div>
                <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> ผลสอบล่าสุด
                </h2>
                <div className="card-elevated p-5 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${recentQuiz.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {recentQuiz.score}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{recentQuiz.passed ? "✅ ผ่านแล้ว!" : "❌ ยังไม่ผ่าน"}</p>
                    <p className="text-xs text-muted-foreground">ได้ +{recentQuiz.xp_earned} XP • {new Date(recentQuiz.created_at).toLocaleDateString("th-TH")}</p>
                  </div>
                  <Link to={`/quiz/${recentQuiz.quiz_id}`}>
                    <Button variant="outline" size="sm">ทำอีกครั้ง</Button>
                  </Link>
                </div>
              </div>
            )}

            {suggestedCourses.length > 0 && (
              <div>
                <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" /> คอร์สแนะนำ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestedCourses.map((course) => (
                    <div key={course.id} className="card-elevated p-4 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm line-clamp-2">{course.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">⭐ {course.rating} • {course.totalStudents.toLocaleString()} คน</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${course.isFree ? "text-success" : "text-foreground"}`}>
                          {course.isFree ? "ฟรี" : `฿${course.price.toLocaleString()}`}
                        </span>
                        <Link to={`/courses/${course.id}`}>
                          <Button variant="outline" size="sm">ดูคอร์ส <ChevronRight className="w-3 h-3" /></Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: ความสำเร็จ ───────────────────────────────── */}
        {activeTab === "achievements" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> ความสำเร็จของคุณ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: "🎯", title: "เรียนครั้งแรก", desc: "เริ่มต้นเรียนคอร์สแรก", unlocked: enrollments.length > 0 },
                { icon: "🔥", title: "Streak 7 วัน", desc: "เรียนต่อเนื่อง 7 วัน", unlocked: streak >= 7 },
                { icon: "⚡", title: "XP 500", desc: "สะสม XP ถึง 500", unlocked: totalXp >= 500 },
                { icon: "🏆", title: "จบคอร์สแรก", desc: "เรียนจบคอร์สแรก", unlocked: completedCourses >= 1 },
                { icon: "📚", title: "นักเรียนตัวยง", desc: "สมัคร 3 คอร์สขึ้นไป", unlocked: enrollments.length >= 3 },
                { icon: "🌟", title: "Level 5", desc: "เลื่อนระดับถึง Level 5", unlocked: level >= 5 },
              ].map((badge) => (
                <div key={badge.title} className={`card-elevated p-4 flex items-center gap-4 transition-all ${!badge.unlocked ? "opacity-40 grayscale" : ""}`}>
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl">{badge.icon}</div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{badge.title}</p>
                    <p className="text-xs text-muted-foreground">{badge.desc}</p>
                    {badge.unlocked && <p className="text-xs text-success mt-0.5 font-medium">✓ ปลดล็อกแล้ว</p>}
                  </div>
                </div>
              ))}
            </div>

            {completedCourses > 0 && (
              <div className="card-elevated p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">ใบประกาศนียบัตร</p>
                    <p className="text-xs text-muted-foreground">คุณเรียนจบ {completedCourses} คอร์สแล้ว</p>
                  </div>
                </div>
                <Link to="/certificate"><Button variant="hero" size="sm">ดูใบประกาศ</Button></Link>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
