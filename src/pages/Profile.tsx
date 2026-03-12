import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  User, Lock, Shield, Bell, Globe,
  Camera, Save, Smartphone, Loader2, Eye, EyeOff,
  Phone, Link as LinkIcon, Facebook, Youtube
} from "lucide-react";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

  // ── Profile state ──────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ── Security state ─────────────────────────────────────────
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Notification state ─────────────────────────────────────
  const [notifSettings, setNotifSettings] = useState({
    new_course: true,
    promotion: true,
    community: false,
    email_summary: true,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
      // TODO: ดึงจาก profiles table เมื่อเพิ่ม column phone, website, facebook, youtube
      // setPhone(profile.phone ?? "");
      // setWebsite(profile.website ?? "");
      // setFacebook(profile.facebook ?? "");
      // setYoutube(profile.youtube ?? "");
    }
  }, [profile]);

  // ── อัปโหลด Avatar ─────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "ไฟล์ใหญ่เกินไป", description: "กรุณาเลือกไฟล์ไม่เกิน 2MB", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    const filePath = `avatars/${user.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "อัปโหลดรูปไม่สำเร็จ", description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "บันทึกรูปไม่สำเร็จ", description: updateError.message, variant: "destructive" });
    } else {
      setAvatarUrl(publicUrl);
      await refreshProfile();
      toast({ title: "อัปเดตรูปโปรไฟล์สำเร็จ ✓" });
    }
    setUploadingAvatar(false);
  };

  // ── validate เบอร์โทร ──────────────────────────────────────
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  // ── บันทึกข้อมูลส่วนตัว ────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      toast({ title: "กรุณากรอกชื่อ", variant: "destructive" });
      return;
    }

    // ตรวจเบอร์โทร (ถ้ากรอก)
    const phoneDigits = phone.replace(/\D/g, "");
    if (phone && phoneDigits.length !== 10) {
      toast({ title: "เบอร์โทรต้องมี 10 หลัก", variant: "destructive" });
      return;
    }

    setSavingProfile(true);

    // 1. อัปเดต profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        bio: bio.trim(),
        // TODO: เพิ่ม column เหล่านี้ใน migration แล้วค่อย uncomment
        // phone: phoneDigits || null,
        // website: website.trim() || null,
        // facebook: facebook.trim() || null,
        // youtube: youtube.trim() || null,
      })
      .eq("user_id", user.id);

    // 2. อัปเดต auth metadata → Supabase Dashboard แสดงชื่อถูกต้อง
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        display_name: fullName.trim(),
        phone: phoneDigits || undefined,
      },
    });

    setSavingProfile(false);

    if (profileError || authError) {
      toast({
        title: "บันทึกไม่สำเร็จ",
        description: profileError?.message || authError?.message,
        variant: "destructive",
      });
    } else {
      await refreshProfile();
      toast({ title: "บันทึกข้อมูลสำเร็จ ✓" });
    }
  };

  // ── เปลี่ยนรหัสผ่าน ────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบทุกช่อง", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "รหัสผ่านใหม่ไม่ตรงกัน", variant: "destructive" });
      return;
    }
    if (oldPassword === newPassword) {
      toast({ title: "รหัสผ่านใหม่ต้องไม่เหมือนรหัสเก่า", variant: "destructive" });
      return;
    }

    setSavingPassword(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: oldPassword,
    });

    if (signInError) {
      setSavingPassword(false);
      toast({
        title: "รหัสผ่านเก่าไม่ถูกต้อง",
        description: "กรุณาตรวจสอบรหัสผ่านเก่าอีกครั้ง",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);

    if (error) {
      toast({ title: "เปลี่ยนรหัสผ่านไม่สำเร็จ", description: error.message, variant: "destructive" });
    } else {
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      toast({ title: "เปลี่ยนรหัสผ่านสำเร็จ ✓" });
    }
  };

  const initials = fullName
    ? fullName.trim().charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "?";

  const tabs = [
    { id: "profile" as const, label: "ข้อมูลส่วนตัว", icon: User },
    { id: "security" as const, label: "ความปลอดภัย", icon: Shield },
    { id: "notifications" as const, label: "การแจ้งเตือน", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8 max-w-3xl">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">ตั้งค่าบัญชี</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-muted rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab: ข้อมูลส่วนตัว ─────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-fade-in">

            {/* Avatar card */}
            <div className="card-elevated p-6 flex items-center gap-6">
              <div className="relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                    {initials}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  {uploadingAvatar
                    ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    : <Camera className="w-4 h-4 text-muted-foreground" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground">{fullName || "ไม่มีชื่อ"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* ── ข้อมูลพื้นฐาน ──────────────────────────────── */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> ข้อมูลพื้นฐาน
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ชื่อ */}
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground mb-1 block">ชื่อ-นามสกุล <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="ชื่อ-นามสกุล" className="pl-10 input-focus" />
                  </div>
                </div>

                {/* อีเมล */}
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground mb-1 block">อีเมล</label>
                  <Input value={user?.email ?? ""} type="email" disabled className="input-focus opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground mt-1">ไม่สามารถเปลี่ยนอีเมลได้</p>
                </div>

                {/* เบอร์โทร */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">เบอร์โทรศัพท์</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="086-123-4567"
                      className="pl-10 input-focus"
                      inputMode="tel"
                    />
                  </div>
                </div>

                {/* ภาษา */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">ภาษา</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select className="w-full bg-muted rounded-lg pl-10 pr-4 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>ไทย</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground mb-1 block">แนะนำตัว (Bio)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="เล่าเกี่ยวกับตัวเองสักนิด..."
                    rows={3}
                    maxLength={200}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{bio.length}/200</p>
                </div>
              </div>
            </div>

            {/* ── โซเชียลมีเดีย ───────────────────────────────── */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" /> โซเชียลมีเดีย & เว็บไซต์
              </h3>

              {/* เว็บไซต์ */}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">เว็บไซต์</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="pl-10 input-focus"
                    type="url"
                  />
                </div>
              </div>

              {/* Facebook */}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Facebook</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1877f2]" />
                  <Input
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="facebook.com/yourpage"
                    className="pl-10 input-focus"
                  />
                </div>
              </div>

              {/* YouTube */}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">YouTube</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff0000]" />
                  <Input
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="youtube.com/@yourchannel"
                    className="pl-10 input-focus"
                  />
                </div>
              </div>
            </div>

            <Button variant="hero" onClick={handleSaveProfile} disabled={savingProfile} className="w-full md:w-auto">
              {savingProfile ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</span>
              ) : (
                <span className="flex items-center gap-2"><Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลง</span>
              )}
            </Button>
          </div>
        )}

        {/* ─── Tab: ความปลอดภัย ─────────────────────────────────── */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fade-in">
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> เปลี่ยนรหัสผ่าน
              </h3>

              {[
                { label: "รหัสผ่านเก่า", value: oldPassword, setter: setOldPassword, show: showOld, toggleShow: () => setShowOld(!showOld) },
                { label: "รหัสผ่านใหม่", value: newPassword, setter: setNewPassword, show: showNew, toggleShow: () => setShowNew(!showNew), hint: "อย่างน้อย 8 ตัวอักษร" },
                { label: "ยืนยันรหัสผ่านใหม่", value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggleShow: () => setShowConfirm(!showConfirm) },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-sm text-muted-foreground mb-1 block">{field.label}</label>
                  <div className="relative">
                    <Input
                      type={field.show ? "text" : "password"}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder={field.hint ?? "••••••••"}
                      className={`input-focus pr-10 ${
                        field.label === "ยืนยันรหัสผ่านใหม่" && confirmPassword && confirmPassword !== newPassword
                          ? "border-destructive" : ""
                      }`}
                    />
                    <button type="button" onClick={field.toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {field.label === "ยืนยันรหัสผ่านใหม่" && confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-destructive mt-1">รหัสผ่านไม่ตรงกัน</p>
                  )}
                </div>
              ))}

              <Button
                variant="hero"
                onClick={handleChangePassword}
                disabled={savingPassword || !oldPassword || !newPassword || !confirmPassword}
              >
                {savingPassword ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> กำลังอัปเดต...</span>
                ) : "อัปเดตรหัสผ่าน"}
              </Button>
            </div>

            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" /> Two-Factor Authentication (2FA)
              </h3>
              <p className="text-sm text-muted-foreground">เพิ่มความปลอดภัยให้บัญชีของคุณด้วยการยืนยันตัวตน 2 ขั้นตอน</p>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">2FA ยังไม่ได้เปิดใช้งาน</p>
                    <p className="text-xs text-muted-foreground">แนะนำให้เปิดเพื่อความปลอดภัย</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">เปิดใช้งาน</Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: การแจ้งเตือน ────────────────────────────────── */}
        {activeTab === "notifications" && (
          <div className="card-elevated p-6 space-y-4 animate-fade-in">
            <h3 className="font-display font-bold text-foreground">ตั้งค่าการแจ้งเตือน</h3>
            {(
              [
                { key: "new_course", label: "แจ้งเตือนคอร์สใหม่", desc: "รับการแจ้งเตือนเมื่อมีคอร์สใหม่" },
                { key: "promotion", label: "แจ้งเตือนโปรโมชั่น", desc: "รับข่าวสารส่วนลดและคูปอง" },
                { key: "community", label: "แจ้งเตือนชุมชน", desc: "รับการแจ้งเตือนจากกระทู้และข้อความ" },
                { key: "email_summary", label: "แจ้งเตือนทางอีเมล", desc: "รับสรุปกิจกรรมรายสัปดาห์" },
              ] as { key: keyof typeof notifSettings; label: string; desc: string }[]
            ).map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings[item.key]}
                    onChange={(e) => setNotifSettings((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            ))}
            <Button variant="hero" onClick={() => toast({ title: "บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ ✓" })}>
              <Save className="w-4 h-4 mr-2" /> บันทึกการตั้งค่า
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
