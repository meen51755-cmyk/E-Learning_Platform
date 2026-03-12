import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { sampleCourses } from "@/data/mockData";
import {
  CreditCard, Shield, CheckCircle, Lock, ArrowLeft,
  Receipt, Tag, Percent, Loader2
} from "lucide-react";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const courseId = searchParams.get("course") || "2";
  const course = sampleCourses.find((c) => c.id === courseId) || sampleCourses[1];

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [step, setStep] = useState<"checkout" | "success">("checkout");

  // Card fields
  const [cardName, setCardName] = useState(profile?.full_name || "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCvv] = useState("");

  const discount = couponApplied ? Math.round(course.price * 0.2) : 0;
  const total = course.price - discount;

  // ── Format card number ─────────────────────────────────────
  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  // ── ใช้คูปอง ──────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // mock delay
    // TODO: await supabase.from('coupons').select().eq('code', couponCode).single()
    if (couponCode.toUpperCase() === "LEARN20") {
      setCouponApplied(true);
      toast({ title: "ใช้คูปองสำเร็จ! ส่วนลด 20%" });
    } else {
      toast({ title: "รหัสคูปองไม่ถูกต้อง", variant: "destructive" });
    }
    setCouponLoading(false);
  };

  // ── ชำระเงิน ──────────────────────────────────────────────
  const handlePay = async () => {
    if (!user) {
      toast({ title: "กรุณาเข้าสู่ระบบก่อน", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      toast({ title: "กรุณากรอกข้อมูลบัตรให้ครบ", variant: "destructive" });
      return;
    }

    setPayLoading(true);
    await new Promise((r) => setTimeout(r, 1500)); // mock delay
    // TODO: เรียก payment gateway จริง แล้วบันทึกลง Supabase:
    // await supabase.from('transactions').insert({ user_id: user.id, course_id: courseId, amount: total })
    // await supabase.from('enrollments').insert({ user_id: user.id, course_id: courseId })
    setPayLoading(false);
    setStep("success");
  };

  // ── หน้า Success ───────────────────────────────────────────
  if (step === "success") {
    const txnId = `TXN-2569-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto container-padding py-20 max-w-lg text-center">
          <div className="card-elevated p-8 space-y-6 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">ชำระเงินสำเร็จ!</h1>
            <p className="text-muted-foreground">
              คุณสามารถเริ่มเรียนคอร์ส "{course.title}" ได้ทันที
            </p>
            <div className="card-elevated p-4 bg-muted/30 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="text-foreground font-mono text-xs">{txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">จำนวนเงิน</span>
                <span className="text-foreground font-medium">฿{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ผู้ชำระ</span>
                <span className="text-foreground">{profile?.full_name || user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">วันที่</span>
                <span className="text-foreground">{new Date().toLocaleDateString("th-TH")}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={`/learn/${course.id}`} className="flex-1">
                <Button variant="hero" className="w-full">เริ่มเรียนเลย</Button>
              </Link>
              <Link to="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Receipt className="w-4 h-4 mr-1" /> Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── หน้า Checkout ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8 max-w-4xl">
        <Link
          to={`/courses/${course.id}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> กลับไปหน้าคอร์ส
        </Link>

        <h1 className="text-2xl font-display font-bold text-foreground mb-8">ชำระเงิน</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-elevated p-6 space-y-4">
              <h2 className="font-display font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> ข้อมูลการชำระเงิน
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">ชื่อบนบัตร</label>
                  <Input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="ชื่อ-นามสกุล"
                    className="input-focus"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">หมายเลขบัตร</label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="0000 0000 0000 0000"
                    className="input-focus font-mono"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">วันหมดอายุ</label>
                    <Input
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      className="input-focus"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">CVV</label>
                    <Input
                      value={cardCvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="***"
                      type="password"
                      className="input-focus"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="card-elevated p-6 space-y-4">
              <h2 className="font-display font-bold text-foreground flex items-center gap-2">
                <Tag className="w-5 h-5 text-warning" /> คูปองส่วนลด
              </h2>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="ใส่รหัสคูปอง"
                  className="input-focus"
                  disabled={couponApplied}
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={couponApplied || couponLoading}
                >
                  {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ใช้คูปอง"}
                </Button>
              </div>
              {couponApplied ? (
                <div className="flex items-center gap-2 text-sm text-success">
                  <Percent className="w-4 h-4" /> ส่วนลด 20% ถูกใช้แล้ว!
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">ลองใช้: LEARN20</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>การชำระเงินถูกเข้ารหัสด้วย SSL 256-bit</span>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="card-elevated p-6 space-y-4 sticky top-20">
              <h2 className="font-display font-bold text-foreground">สรุปคำสั่งซื้อ</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-16 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.instructor}</p>
                  </div>
                </div>
                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ราคาคอร์ส</span>
                    <span className="text-foreground">฿{course.price.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-success">
                      <span>ส่วนลดคูปอง (20%)</span>
                      <span>-฿{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                    <span className="text-foreground">รวมทั้งหมด</span>
                    <span className="text-foreground">฿{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="hero"
                className="w-full"
                size="lg"
                onClick={handlePay}
                disabled={payLoading}
              >
                {payLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> กำลังดำเนินการ...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" /> ชำระเงิน ฿{total.toLocaleString()}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
