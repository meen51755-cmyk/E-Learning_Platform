import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Mail, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // รับ email จาก Register หน้าที่แล้ว
  const email = (location.state as any)?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── จัดการกรอก OTP ─────────────────────────────────────────
  const handleChange = (index: number, value: string) => {
    // รับแค่ตัวเลข
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // เลื่อนไปช่องถัดไปอัตโนมัติ
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // กด backspace ให้ถอยหลัง
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    paste.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    // focus ช่องสุดท้ายที่กรอก
    const lastIndex = Math.min(paste.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  // ── ยืนยัน OTP ─────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast({ title: "กรุณากรอกรหัส 6 หลักให้ครบ", variant: "destructive" });
      return;
    }
    if (!email) {
      toast({ title: "ไม่พบอีเมล กรุณาสมัครใหม่", variant: "destructive" });
      navigate("/register");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });
    setLoading(false);

    if (error) {
      toast({
        title: "รหัสไม่ถูกต้องหรือหมดอายุ",
        description: "กรุณาลองใหม่หรือกดส่งรหัสใหม่",
        variant: "destructive",
      });
      // เคลียร์ OTP
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }

    setVerified(true);
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  // ── ส่ง OTP ใหม่ ───────────────────────────────────────────
  const handleResend = async () => {
    if (!email) {
      toast({ title: "ไม่พบอีเมล กรุณาสมัครใหม่", variant: "destructive" });
      navigate("/register");
      return;
    }

    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);

    if (error) {
      toast({ title: "ส่งอีเมลไม่สำเร็จ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ส่งรหัสใหม่แล้ว ✓", description: `ตรวจสอบอีเมล ${email}` });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  // ── หน้ายืนยันสำเร็จ ───────────────────────────────────────
  if (verified) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center container-padding">
        <div className="card-elevated p-8 max-w-md w-full text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">ยืนยันอีเมลสำเร็จ!</h1>
          <p className="text-muted-foreground">บัญชีของคุณพร้อมใช้งานแล้ว กำลังพาไป Dashboard...</p>
          <Link to="/dashboard">
            <Button variant="hero" className="w-full">เข้าสู่ Dashboard เลย</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── หน้ากรอก OTP ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center container-padding">
      <div className="card-elevated p-8 max-w-md w-full text-center space-y-6 animate-fade-in">

        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">LearnHub</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">ยืนยันอีเมลของคุณ</h1>
          <p className="text-muted-foreground text-sm">
            เราได้ส่งรหัส 6 หลักไปที่{" "}
            <strong className="text-foreground">{email || "อีเมลของคุณ"}</strong>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                digit
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            />
          ))}
        </div>

        <div className="space-y-3">
          <Button
            variant="hero"
            className="w-full"
            onClick={handleVerify}
            disabled={loading || otp.join("").length < 6}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> กำลังยืนยัน...
              </span>
            ) : (
              "ยืนยันรหัส"
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> กำลังส่ง...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> ส่งรหัสใหม่
              </span>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          ไม่ได้รับอีเมล? ตรวจสอบโฟลเดอร์ Spam ด้วยนะครับ
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;
