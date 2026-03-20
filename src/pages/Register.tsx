import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import { BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validators, checkRateLimit } from "@/lib/sanitize";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // ── Google Sign In ─────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setIsLoading(false);
    if (error) {
      toast({
        title: "สมัครด้วย Google ไม่สำเร็จ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ── Email Register ─────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ rate limit — สมัครได้ไม่เกิน 5 ครั้ง/10 นาที ป้องกัน bot
    const rate = checkRateLimit("register", 5, 600000);
    if (!rate.allowed) {
      toast({ title: "ลองใหม่ในอีก 10 นาที", variant: "destructive" });
      return;
    }

    // ✅ validate ทุก field
    const nameCheck = validators.fullName(fullName);
    if (!nameCheck.ok) {
      toast({ title: nameCheck.error, variant: "destructive" });
      return;
    }

    const emailCheck = validators.email(email);
    if (!emailCheck.ok) {
      toast({ title: emailCheck.error, variant: "destructive" });
      return;
    }

    const passCheck = validators.password(password);
    if (!passCheck.ok) {
      toast({ title: passCheck.error, variant: "destructive" });
      return;
    }

    if (!agreed) {
      toast({ title: "กรุณายอมรับเงื่อนไขการใช้บริการ", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(emailCheck.value!, passCheck.value!, nameCheck.value!, role);
    setIsLoading(false);

    if (error) {
      toast({
        title: "สมัครไม่สำเร็จ",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "สมัครสำเร็จ!",
        description: "กรุณาตรวจสอบอีเมลเพื่อยืนยันรหัส OTP",
      });
      // ส่ง email ไปด้วยเพื่อใช้ใน EmailVerification
      navigate("/verify-email", { state: { email } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-16 container-padding">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">สมัครสมาชิก</h1>
            <p className="text-muted-foreground">เริ่มต้นการเรียนรู้วันนี้ ฟรี!</p>
          </div>

          <form onSubmit={handleRegister} className="card-elevated p-6 space-y-4">
            {/* Role selector */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  role === "student"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                ผู้เรียน
              </button>
              <button
                type="button"
                onClick={() => setRole("instructor")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  role === "instructor"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                ผู้สอน
              </button>
            </div>

            {/* ชื่อ */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ชื่อ-นามสกุล</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ชื่อ นามสกุล"
                  className="pl-10 input-focus"
                />
              </div>
            </div>

            {/* อีเมล */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10 input-focus"
                  type="email"
                />
              </div>
            </div>

            {/* รหัสผ่าน */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className="pl-10 pr-10 input-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ยอมรับเงื่อนไข */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="rounded mt-1"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="text-sm text-muted-foreground">
                ฉันยอมรับ{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">
                  เงื่อนไขการใช้บริการ
                </Link>{" "}
                และ{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </span>
            </div>

            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                "กำลังสมัคร..."
              ) : (
                <span className="flex items-center gap-2">
                  สมัครสมาชิก <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">หรือ</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              สมัครด้วย Google
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            มีบัญชีแล้ว?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
