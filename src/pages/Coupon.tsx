import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { validators, checkRateLimit } from "@/lib/sanitize";
import {
  Tag, Plus, Trash2, Copy, CheckCircle,
  Percent, ArrowLeft, Loader2, Shield
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount: number;         // เปอร์เซ็นต์
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

// Mock coupons — TODO: แทนด้วย useQuery จาก Supabase
const mockCoupons: Coupon[] = [
  { id: "1", code: "LEARN20", discount: 20, maxUses: 100, usedCount: 45, expiresAt: "2026-12-31", active: true },
  { id: "2", code: "NEWUSER50", discount: 50, maxUses: 50, usedCount: 50, expiresAt: "2026-06-30", active: false },
  { id: "3", code: "FLASH10", discount: 10, maxUses: 200, usedCount: 12, expiresAt: "2026-04-01", active: true },
];

const Coupon = () => {
  const { roles } = useAuth();
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // ── สิทธิ์เข้าถึง ──────────────────────────────────────────
  const canManage = roles.includes("admin") || roles.includes("instructor");

  // ── คัดลอกโค้ด ────────────────────────────────────────────
  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: `คัดลอก ${code} แล้ว ✓` });
  };

  // ── toggle active ──────────────────────────────────────────
  const handleToggle = async (id: string) => {
    // TODO: await supabase.from('coupons').update({ active: !current }).eq('id', id)
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  // ── ลบ coupon ─────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    // TODO: await supabase.from('coupons').delete().eq('id', id)
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "ลบคูปองสำเร็จ" });
  };

  // ── สร้าง coupon ใหม่ ──────────────────────────────────────
  const handleCreate = async () => {
    // ✅ validate รหัสคูปอง
    const codeCheck = validators.couponCode(code);
    if (!codeCheck.ok) {
      toast({ title: codeCheck.error, variant: "destructive" });
      return;
    }

    if (!discount || !maxUses || !expiresAt) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบ", variant: "destructive" });
      return;
    }

    // ✅ validate ส่วนลด 1-100
    const discountNum = Number(discount);
    if (!Number.isInteger(discountNum) || discountNum < 1 || discountNum > 100) {
      toast({ title: "ส่วนลดต้องเป็นจำนวนเต็ม 1-100%", variant: "destructive" });
      return;
    }

    // ✅ validate จำนวนครั้งใช้
    const maxUsesNum = Number(maxUses);
    if (!Number.isInteger(maxUsesNum) || maxUsesNum < 1 || maxUsesNum > 10000) {
      toast({ title: "จำนวนครั้งใช้งานต้องอยู่ระหว่าง 1-10,000", variant: "destructive" });
      return;
    }

    // ✅ validate วันหมดอายุ
    const expDate = new Date(expiresAt);
    if (isNaN(expDate.getTime()) || expDate <= new Date()) {
      toast({ title: "วันหมดอายุต้องเป็นวันในอนาคต", variant: "destructive" });
      return;
    }

    if (coupons.find((c) => c.code === codeCheck.value)) {
      toast({ title: "รหัสคูปองนี้มีอยู่แล้ว", variant: "destructive" });
      return;
    }

    // ✅ rate limit — สร้างได้ 10 คูปอง/ชั่วโมง
    const rate = checkRateLimit("create-coupon", 10, 3600000);
    if (!rate.allowed) {
      toast({ title: "สร้างคูปองถี่เกินไป กรุณารอสักครู่", variant: "destructive" });
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    // TODO: const { data } = await supabase.from('coupons').insert({ code, discount, max_uses: maxUses, expires_at: expiresAt }).select().single()

    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: codeCheck.value!,
      discount: Number(discount),
      maxUses: Number(maxUses),
      usedCount: 0,
      expiresAt,
      active: true,
    };

    setCoupons((prev) => [newCoupon, ...prev]);
    setCode(""); setDiscount(""); setMaxUses(""); setExpiresAt("");
    setShowForm(false);
    setSaving(false);
    toast({ title: `สร้างคูปอง ${newCoupon.code} สำเร็จ ✓` });
  };

  // ── ไม่มีสิทธิ์ ────────────────────────────────────────────
  if (!canManage) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto container-padding py-20 text-center space-y-4">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
          <h1 className="text-xl font-display font-bold text-foreground">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-muted-foreground">หน้านี้สำหรับ Instructor และ Admin เท่านั้น</p>
          <Link to="/dashboard">
            <Button variant="outline">กลับไป Dashboard</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const activeCoupons = coupons.filter((c) => c.active);
  const inactiveCoupons = coupons.filter((c) => !c.active);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/instructor/dashboard"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> กลับ
            </Link>
            <h1 className="text-2xl font-display font-bold text-foreground">จัดการคูปองส่วนลด</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activeCoupons.length} คูปองที่ใช้งานได้ / {coupons.length} ทั้งหมด
            </p>
          </div>
          <Button variant="hero" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" /> สร้างคูปองใหม่
          </Button>
        </div>

        {/* ── สร้างคูปองใหม่ ─────────────────────────────────── */}
        {showForm && (
          <div className="card-elevated p-6 mb-6 space-y-4 animate-fade-in border-2 border-primary/20">
            <h2 className="font-display font-bold text-foreground flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> สร้างคูปองใหม่
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">รหัสคูปอง</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                  placeholder="เช่น SUMMER30"
                  className="input-focus font-mono"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">ส่วนลด (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value.replace(/\D/g, ""))}
                    placeholder="เช่น 20"
                    className="pl-10 input-focus"
                    maxLength={3}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">จำนวนครั้งสูงสุด</label>
                <Input
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value.replace(/\D/g, ""))}
                  placeholder="เช่น 100"
                  className="input-focus"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">วันหมดอายุ</label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="input-focus"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="hero" onClick={handleCreate} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> กำลังสร้าง...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> สร้างคูปอง
                  </span>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>ยกเลิก</Button>
            </div>
          </div>
        )}

        {/* ── รายการคูปอง ───────────────────────────────────── */}
        {coupons.length === 0 ? (
          <div className="card-elevated p-12 text-center space-y-3">
            <Tag className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">ยังไม่มีคูปอง</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => {
              const usagePercent = Math.round((coupon.usedCount / coupon.maxUses) * 100);
              const isExpired = new Date(coupon.expiresAt) < new Date();
              const isFull = coupon.usedCount >= coupon.maxUses;

              return (
                <div
                  key={coupon.id}
                  className={`card-elevated p-5 transition-all ${
                    !coupon.active || isExpired || isFull ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Percent className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-foreground text-lg">
                            {coupon.code}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            -{coupon.discount}%
                          </span>
                          {/* Status badges */}
                          {isExpired && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive">
                              หมดอายุ
                            </span>
                          )}
                          {isFull && !isExpired && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning">
                              ใช้ครบแล้ว
                            </span>
                          )}
                          {coupon.active && !isExpired && !isFull && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">
                              ใช้งานได้
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          ใช้ไปแล้ว {coupon.usedCount}/{coupon.maxUses} ครั้ง •
                          หมดอายุ {new Date(coupon.expiresAt).toLocaleDateString("th-TH")}
                        </p>
                        {/* Usage bar */}
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden w-48">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isFull ? "bg-destructive" : "bg-primary"
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Copy */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(coupon.id, coupon.code)}
                        title="คัดลอกรหัส"
                      >
                        {copiedId === coupon.id ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Toggle active */}
                      <label className="relative inline-flex items-center cursor-pointer" title="เปิด/ปิด">
                        <input
                          type="checkbox"
                          checked={coupon.active}
                          onChange={() => handleToggle(coupon.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      </label>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
                        className="text-muted-foreground hover:text-destructive"
                        title="ลบคูปอง"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Coupon;
