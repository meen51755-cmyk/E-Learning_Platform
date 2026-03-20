import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, Eye, EyeOff, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AnimatedAuth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  // ── Form States ─────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"student" | "instructor">("student");
  const [agreed, setAgreed] = useState(false);

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
        title: isSignUp ? "สมัครด้วย Google ไม่สำเร็จ" : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ── Login Handler ─────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบ", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({ title: "เข้าสู่ระบบไม่สำเร็จ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "เข้าสู่ระบบสำเร็จ!" });
      navigate("/dashboard");
    }
  };

  // ── Register Handler ─────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerFullName || !registerEmail || !registerPassword) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบ", variant: "destructive" });
      return;
    }
    if (registerPassword.length < 8) {
      toast({ title: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร", variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "กรุณายอมรับเงื่อนไขการใช้บริการ", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(registerEmail, registerPassword, registerFullName, registerRole);
    setIsLoading(false);

    if (error) {
      toast({ title: "สมัครไม่สำเร็จ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "สมัครสำเร็จ!", description: "กรุณาตรวจสอบอีเมลเพื่อยืนยันรหัส OTP" });
      navigate("/verify-email", { state: { email: registerEmail } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-4xl h-[600px]">
        <div className="relative w-full h-full flex">
          
          {/* ═══════════════════════════════════════════════════════
              Welcome Panel (Left Side - Slides)
          ═══════════════════════════════════════════════════════ */}
          <div
            className={`absolute inset-y-0 w-1/2 z-10 transition-all duration-700 ease-in-out ${
              isSignUp ? "left-1/2" : "left-0"
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl p-8 flex flex-col justify-center items-center text-white overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />
              
              <div className="relative z-10 text-center space-y-4 px-4">
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center mb-3">
                  <BookOpen className="w-10 h-10" />
                </div>
                
                {!isSignUp ? (
                  <>
                    <h2 className="text-3xl font-bold leading-tight">ยินดีต้อนรับกลับ!</h2>
                    <p className="text-indigo-100 text-base leading-relaxed">
                      เข้าสู่ระบบเพื่อเรียนต่อจากที่ค้างไว้
                    </p>
                    <div className="flex items-center gap-2 justify-center text-indigo-100 pt-2">
                      <Sparkles className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">พัฒนาทักษะของคุณทุกวัน</span>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold leading-tight">สวัสดี!</h2>
                    <p className="text-indigo-100 text-base leading-relaxed">
                      มีบัญชีแล้ว? เข้าสู่ระบบเพื่อเริ่มเรียนเลย
                    </p>
                    <div className="flex items-center gap-2 justify-center text-indigo-100 pt-2">
                      <Sparkles className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">เข้าถึงคอร์สมากกว่า 1,000+ คอร์ส</span>
                    </div>
                  </>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="mt-6 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm h-11"
                >
                  {isSignUp ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              Form Panel (Right Side - Swaps Content)
          ═══════════════════════════════════════════════════════ */}
          <div
            className={`absolute inset-y-0 w-1/2 bg-white rounded-2xl shadow-2xl overflow-y-auto z-0 transition-all duration-700 ease-in-out ${
              isSignUp ? "left-0" : "left-1/2"
            }`}
          >
            <div className="h-full flex flex-col justify-center p-8 py-12">
            
            {/* ─── LOGIN FORM ─────────────────────────────────── */}
            {!isSignUp ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">เข้าสู่ระบบ</h2>
                  <p className="text-gray-600">กรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">อีเมล</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-11 h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">รหัสผ่าน</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-11 pr-11 h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-gray-600">จดจำฉัน</span>
                  </label>
                  <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    ลืมรหัสผ่าน?
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                  {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">หรือ</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full h-11"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  เข้าสู่ระบบด้วย Google
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="text-center space-y-2 mb-4">
                  <h2 className="text-3xl font-bold text-gray-900">สมัครสมาชิก</h2>
                  <p className="text-gray-600">เริ่มต้นการเรียนรู้วันนี้ ฟรี!</p>
                </div>

                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setRegisterRole("student")}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                      registerRole === "student"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600"
                    }`}
                  >
                    ผู้เรียน
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterRole("instructor")}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                      registerRole === "instructor"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600"
                    }`}
                  >
                    ผู้สอน
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={registerFullName}
                      onChange={(e) => setRegisterFullName(e.target.value)}
                      placeholder="ชื่อ นามสกุล"
                      className="pl-11 h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">อีเมล</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-11 h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">รหัสผ่าน</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                      className="pl-11 pr-11 h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span className="text-sm text-gray-600">
                    ฉันยอมรับ <button type="button" className="text-indigo-600 hover:underline">เงื่อนไขการใช้บริการ</button> และ{" "}
                    <button type="button" className="text-indigo-600 hover:underline">นโยบายความเป็นส่วนตัว</button>
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
                  {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">หรือ</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full h-11"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.10z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  สมัครด้วย Google
                </Button>
              </form>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedAuth;
