import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminDashboard } from "@/hooks/useDashboard";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import {
  Users, DollarSign, TrendingUp, RefreshCw, Loader2,
  ShieldCheck, BarChart2, Wifi, CreditCard,
  CheckCircle, XCircle, Clock
} from "lucide-react";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

const MiniBarChart = ({ data, field, color }: {
  data: { date: string; new_users: number; active_users: number; new_enrollments: number; revenue: number }[];
  field: "new_users" | "active_users" | "new_enrollments" | "revenue";
  color: string;
}) => {
  if (!data.length) return <div className="h-16 flex items-center justify-center text-xs text-muted-foreground">ไม่มีข้อมูล</div>;
  const values = data.map((d) => Number(d[field]));
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.slice(-14).map((d) => (
        <div key={d.date} className="flex-1 group relative">
          <div
            className={`w-full rounded-sm transition-all duration-300 ${color}`}
            style={{ height: `${(Number(d[field]) / max) * 100}%`, minHeight: "2px" }}
          />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:flex text-xs bg-popover border border-border rounded px-1.5 py-0.5 whitespace-nowrap z-10 shadow-sm">
            {field === "revenue" ? formatCurrency(Number(d[field])) : d[field]}
          </div>
        </div>
      ))}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; label: string }> = {
    success:  { color: "text-emerald-600 bg-emerald-500/10", label: "สำเร็จ" },
    pending:  { color: "text-amber-600 bg-amber-500/10",    label: "รอดำเนินการ" },
    failed:   { color: "text-red-600 bg-red-500/10",        label: "ล้มเหลว" },
    refunded: { color: "text-blue-600 bg-blue-500/10",      label: "คืนเงิน" },
  };
  const s = map[status] ?? { color: "text-muted-foreground bg-muted", label: status };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>;
};

const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { onlineUsers, recentTransactions, dailyStats, totalRevenue, loading, refetch } = useAdminDashboard();

  useSessionGuard(); // ✅ Single session enforcement

  const [graphMetric, setGraphMetric] = useState<"new_users" | "active_users" | "new_enrollments" | "revenue">("active_users");

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Admin";
  const initials = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url;

  const last7 = dailyStats.slice(-7);
  const totalNewUsers7d = last7.reduce((s, d) => s + d.new_users, 0);
  const totalEnroll7d   = last7.reduce((s, d) => s + d.new_enrollments, 0);
  const totalRev7d      = last7.reduce((s, d) => s + Number(d.revenue), 0);

  const metricOptions = [
    { key: "active_users"    as const, label: "ผู้ใช้ Active", color: "bg-blue-500" },
    { key: "new_users"       as const, label: "ผู้ใช้ใหม่",   color: "bg-violet-500" },
    { key: "new_enrollments" as const, label: "สมัครเรียน",   color: "bg-amber-500" },
    { key: "revenue"         as const, label: "รายได้",       color: "bg-emerald-500" },
  ];

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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xl font-bold text-white shadow-md">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Admin Panel 🛡️</p>
              <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Administrator
                </span>
                <span className="flex items-center gap-1 text-xs text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" /> Realtime
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refetch}><RefreshCw className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={signOut}>ออกจากระบบ</Button>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Wifi,        label: "ผู้ใช้ Online ตอนนี้", value: onlineUsers,              color: "sky",     live: true },
            { icon: DollarSign,  label: "รายได้รวม",            value: formatCurrency(totalRevenue), color: "emerald", live: false },
            { icon: Users,       label: "ผู้ใช้ใหม่ (7 วัน)",  value: totalNewUsers7d,          color: "violet",  live: false },
            { icon: TrendingUp,  label: "สมัครเรียนใหม่ (7 วัน)", value: totalEnroll7d,         color: "amber",   live: false },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-border bg-card p-5 space-y-3 relative overflow-hidden hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/10 flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 text-${card.color}-500`} />
                </div>
                {card.live
                  ? <span className="flex items-center gap-1 text-xs text-success font-medium"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" /> Live</span>
                  : <span className="text-xs text-muted-foreground">7 วัน</span>}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Daily Graph ────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-5 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground text-sm">กราฟผู้ใช้รายวัน (14 วันล่าสุด)</h2>
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {metricOptions.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setGraphMetric(m.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    graphMetric === m.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {dailyStats.length === 0 ? (
            <div className="h-20 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
            </div>
          ) : (
            <>
              <MiniBarChart
                data={dailyStats}
                field={graphMetric}
                color={metricOptions.find((m) => m.key === graphMetric)?.color ?? "bg-blue-500"}
              />
              <div className="flex gap-0.5 mt-1">
                {dailyStats.slice(-14).map((d) => (
                  <div key={d.date} className="flex-1 text-center text-[9px] text-muted-foreground/60 truncate">
                    {new Date(d.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "ผู้ใช้ Active", value: dailyStats.at(-1)?.active_users ?? 0, unit: "คน" },
                  { label: "ผู้ใช้ใหม่ (7d)", value: totalNewUsers7d, unit: "คน" },
                  { label: "สมัครใหม่ (7d)", value: totalEnroll7d, unit: "คน" },
                  { label: "รายได้ (7d)", value: formatCurrency(totalRev7d), unit: "" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-bold text-foreground">
                      {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
                      {s.unit && <span className="text-xs text-muted-foreground ml-0.5">{s.unit}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Recent Transactions ────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> ยอดขายล่าสุด
            </h3>
            <span className="flex items-center gap-1 text-xs text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse inline-block" /> Realtime
            </span>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-10 h-10 mx-auto text-muted-foreground opacity-30 mb-3" />
              <p className="text-muted-foreground text-sm">ยังไม่มีรายการ</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    txn.status === "success" ? "bg-emerald-500/10"
                    : txn.status === "pending" ? "bg-amber-500/10"
                    : "bg-red-500/10"
                  }`}>
                    {txn.status === "success" ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                    : txn.status === "pending" ? <Clock className="w-4 h-4 text-amber-500" />
                    : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">Course: {txn.course_id}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {txn.payment_method ?? "—"} · {new Date(txn.created_at).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={txn.status} />
                    <p className={`text-sm font-bold ${txn.status === "success" ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {formatCurrency(txn.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
