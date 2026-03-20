import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validators, checkRateLimit } from "@/lib/sanitize";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // ✅ validate email
    const emailCheck = validators.email(email);
    if (!emailCheck.ok) {
      toast({ title: emailCheck.error, variant: "destructive" });
      return;
    }

    // ✅ rate limit — ส่งได้ 3 ครั้ง/10 นาที ป้องกัน spam email
    const rate = checkRateLimit("forgot-password", 3, 600000);
    if (!rate.allowed) {
      toast({ title: "ส่งอีเมลถี่เกินไป กรุณารอ 10 นาที", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(emailCheck.value!, {
      // Supabase จะส่ง link ไปที่อีเมล แล้ว redirect มาที่หน้านี้
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center container-padding">
        <div className="card-elevated p-8 max-w-md w-full text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">ส่งอีเมลแล้ว!</h1>
          <p className="text-muted-foreground">
            เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่{" "}
            <strong className="text-foreground">{email}</strong>{" "}
            กรุณาตรวจสอบกล่องอีเมลของคุณ
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center container-padding">
      <div className="card-elevated p-8 max-w-md w-full space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">LearnHub</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">ลืมรหัสผ่าน</h1>
          <p className="text-muted-foreground">กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                type="email"
                placeholder="you@example.com"
                className="pl-10 input-focus"
              />
            </div>
          </div>

          <Button
            variant="hero"
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังส่ง...
              </span>
            ) : (
              "ส่งลิงก์รีเซ็ต"
            )}
          </Button>
        </div>

        <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-3 h-3 inline mr-1" /> กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
