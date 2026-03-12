import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null); // null = กำลังตรวจ

  const { toast } = useToast();
  const navigate = useNavigate();

  // ตรวจสอบว่า Supabase ส่ง session มาจาก email link หรือเปล่า
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session);
    });

    // รับ event จาก Supabase เมื่อ user กดลิงก์จากอีเมล
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบ", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "รหัสผ่านไม่ตรงกัน", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      return;
    }

    setDone(true);
    // Auto redirect หลัง 3 วินาที
    setTimeout(() => navigate("/login"), 3000);
  };

  // ─── Loading state ─────────────────────────────────────────
  if (validSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">กำลังตรวจสอบลิงก์...</p>
        </div>
      </div>
    );
  }

  // ─── Link หมดอายุหรือไม่ถูกต้อง ───────────────────────────
  if (!validSession) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center container-padding">
        <div className="card-elevated p-8 max-w-md w-full text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">ลิงก์ไม่ถูกต้อง</h1>
          <p className="text-muted-foreground">
            ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือใช้ไปแล้ว กรุณาขอลิงก์ใหม่อีกครั้ง
          </p>
          <Link to="/forgot-password">
            <Button variant="hero" className="w-full">ขอลิงก์ใหม่</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── เสร็จแล้ว ─────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center container-padding">
        <div className="card-elevated p-8 max-w-md w-full text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">เปลี่ยนรหัสผ่านสำเร็จ!</h1>
          <p className="text-muted-foreground">
            กำลังพาคุณไปหน้าเข้าสู่ระบบใน 3 วินาที...
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">ไปหน้าเข้าสู่ระบบเลย</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ─── ฟอร์มตั้งรหัสผ่านใหม่ ─────────────────────────────────
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
          <h1 className="text-2xl font-display font-bold text-foreground">ตั้งรหัสผ่านใหม่</h1>
          <p className="text-muted-foreground">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
        </div>

        <div className="space-y-4">
          {/* รหัสผ่านใหม่ */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">รหัสผ่านใหม่</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="รหัสผ่านใหม่"
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

          {/* ยืนยันรหัสผ่าน */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">ยืนยันรหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                type={showConfirm ? "text" : "password"}
                placeholder="ยืนยันรหัสผ่านใหม่"
                className={`pl-10 pr-10 input-focus ${
                  confirmPassword && confirmPassword !== password
                    ? "border-destructive"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* inline error */}
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-destructive mt-1">รหัสผ่านไม่ตรงกัน</p>
            )}
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
                กำลังบันทึก...
              </span>
            ) : (
              "ยืนยันรหัสผ่านใหม่"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
