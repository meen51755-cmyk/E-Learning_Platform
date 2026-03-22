import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validators, checkRateLimit, validateImageFile } from "@/lib/sanitize";
import {
  BookOpen, ArrowLeft, ArrowRight, Save, Upload,
  DollarSign, Tag, BarChart2, Loader2, Image,
  CheckCircle, Globe, Award, Plus, X, Eye
} from "lucide-react";

const CATEGORIES = [
  "Web Development", "Data Science", "Design",
  "Mobile Development", "Cybersecurity", "Business", "Marketing",
];

const LEVELS = [
  { value: "beginner",     label: "เริ่มต้น",  desc: "ไม่ต้องมีความรู้มาก่อน" },
  { value: "intermediate", label: "กลาง",     desc: "มีพื้นฐานบ้างแล้ว" },
  { value: "advanced",     label: "สูง",      desc: "มีประสบการณ์แล้ว" },
];

const LANGUAGES = ["ไทย", "English", "ไทย + English"];

// ── Step indicator ────────────────────────────────────────────
const StepIndicator = ({ current, steps }: { current: number; steps: string[] }) => (
  <div className="flex items-center gap-0 mb-8">
    {steps.map((label, i) => (
      <div key={i} className="flex items-center flex-1 last:flex-none">
        <div className="flex flex-col items-center gap-1">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            i < current
              ? "bg-success text-white"
              : i === current
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "bg-muted text-muted-foreground"
          }`}>
            {i < current ? <CheckCircle className="w-5 h-5" /> : i + 1}
          </div>
          <span className={`text-xs font-medium whitespace-nowrap ${
            i === current ? "text-primary" : "text-muted-foreground"
          }`}>{label}</span>
        </div>
        {i < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${
            i < current ? "bg-success" : "bg-border"
          }`} />
        )}
      </div>
    ))}
  </div>
);

const STEPS = ["ข้อมูลพื้นฐาน", "รายละเอียด", "ราคา & เผยแพร่"];

const CreateCourse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const thumbRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // ── Step 1: ข้อมูลพื้นฐาน ──────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [level, setLevel] = useState("beginner");
  const [language, setLanguage] = useState("ไทย");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // ── Step 2: รายละเอียด ─────────────────────────────────────
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [outcomes, setOutcomes] = useState<string[]>([""]);
  const [hasCertificate, setHasCertificate] = useState(true);

  // ── Step 3: ราคา ───────────────────────────────────────────
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");

  // ── Thumbnail ──────────────────────────────────────────────
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.ok) {
      toast({ title: check.error, variant: "destructive" });
      return;
    }
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // ── Validate แต่ละ step ─────────────────────────────────────
  const validateStep = (s: number): boolean => {
    if (s === 0) {
      const titleCheck = validators.postTitle(title);
      if (!titleCheck.ok) {
        toast({ title: `ชื่อคอร์ส: ${titleCheck.error}`, variant: "destructive" });
        return false;
      }
      if (!description.trim() || description.trim().length < 20) {
        toast({ title: "คำอธิบายต้องมีอย่างน้อย 20 ตัวอักษร", variant: "destructive" });
        return false;
      }
    }
    if (s === 2) {
      if (!isFree) {
        const priceNum = Number(price);
        if (isNaN(priceNum) || priceNum <= 0 || priceNum > 100000) {
          toast({ title: "ราคาต้องอยู่ระหว่าง 1 - 100,000 บาท", variant: "destructive" });
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── บันทึกคอร์ส ────────────────────────────────────────────
  const handleSave = async (status: "draft" | "published") => {
    if (!user) return;
    if (!validateStep(0) || !validateStep(2)) return;

    const rate = checkRateLimit(`create-course-${user.id}`, 5, 3600000);
    if (!rate.allowed) {
      toast({ title: "สร้างคอร์สถี่เกินไป กรุณารอสักครู่", variant: "destructive" });
      return;
    }

    setSaving(true);
    let thumbnailUrl: string | null = null;

    if (thumbnail) {
      setUploadingThumb(true);
      const safeName = thumbnail.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${user.id}/${Date.now()}_${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from("course-thumbnails")
        .upload(path, thumbnail, { upsert: true });
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage
          .from("course-thumbnails").getPublicUrl(path);
        thumbnailUrl = publicUrl;
      }
      setUploadingThumb(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data, error } = await db.from("courses").insert({
      instructor_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      level,
      is_free: isFree,
      price: isFree ? 0 : Number(price),
      thumbnail_url: thumbnailUrl,
      status,
    }).select("id").single();

    setSaving(false);

    if (error) {
      toast({ title: "สร้างคอร์สไม่สำเร็จ", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: status === "published" ? "เผยแพร่คอร์สสำเร็จ! 🎉" : "บันทึก Draft สำเร็จ ✓",
    });
    navigate(`/instructor/courses/${data.id}/edit`);
  };

  // ── List helpers ────────────────────────────────────────────
  const updateList = (list: string[], setList: (v: string[]) => void, idx: number, val: string) => {
    const updated = [...list];
    updated[idx] = val;
    setList(updated);
  };

  const addListItem = (list: string[], setList: (v: string[]) => void) => {
    if (list.length >= 10) return;
    setList([...list, ""]);
  };

  const removeListItem = (list: string[], setList: (v: string[]) => void, idx: number) => {
    if (list.length <= 1) return;
    setList(list.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8 max-w-3xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/instructor/courses">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">สร้างคอร์สใหม่</h1>
            <p className="text-sm text-muted-foreground">Step {step + 1} จาก {STEPS.length}</p>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} steps={STEPS} />

        {/* ── Step 0: ข้อมูลพื้นฐาน ─────────────────────────── */}
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">

            {/* Thumbnail */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" /> รูปภาพปก
              </h3>
              <div
                onClick={() => thumbRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/20 transition-all cursor-pointer overflow-hidden flex items-center justify-center"
              >
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center space-y-2 p-8">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลดรูปภาพ</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP ไม่เกิน 2MB</p>
                    <p className="text-xs text-muted-foreground opacity-60">แนะนำขนาด 1280 x 720px (16:9)</p>
                  </div>
                )}
              </div>
              <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
              {thumbnailPreview && (
                <Button variant="outline" size="sm" onClick={() => { setThumbnail(null); setThumbnailPreview(null); }}>
                  <X className="w-4 h-4 mr-1" /> เปลี่ยนรูป
                </Button>
              )}
            </div>

            {/* ข้อมูลพื้นฐาน */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> ข้อมูลพื้นฐาน
              </h3>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  ชื่อคอร์ส <span className="text-destructive">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ชื่อคอร์สที่ดึงดูดผู้เรียน..."
                  maxLength={100}
                  className="input-focus"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{title.length}/100</p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  คำอธิบายคอร์ส <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายว่าคอร์สนี้สอนอะไร ใครเหมาะกับคอร์สนี้..."
                  rows={5}
                  maxLength={2000}
                  className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{description.length}/2000</p>
              </div>
            </div>

            {/* หมวดหมู่และระดับ */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> หมวดหมู่และระดับ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">หมวดหมู่</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">ภาษา</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-muted rounded-lg pl-10 pr-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">ระดับความยาก</label>
                <div className="grid grid-cols-3 gap-3">
                  {LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLevel(l.value)}
                      className={`p-3 rounded-xl text-left border-2 transition-all ${
                        level === l.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className={`text-sm font-medium ${level === l.value ? "text-primary" : "text-foreground"}`}>
                        {l.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: รายละเอียด ─────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">

            {/* Requirements */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" /> ความรู้ที่ต้องมีก่อนเรียน
              </h3>
              <p className="text-xs text-muted-foreground">เช่น "รู้พื้นฐาน HTML" หรือ "ไม่ต้องมีความรู้มาก่อน"</p>
              <div className="space-y-2">
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    </div>
                    <Input
                      value={req}
                      onChange={(e) => updateList(requirements, setRequirements, i, e.target.value)}
                      placeholder={`ความต้องการข้อที่ ${i + 1}`}
                      maxLength={200}
                      className="input-focus flex-1"
                    />
                    {requirements.length > 1 && (
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"
                        onClick={() => removeListItem(requirements, setRequirements, i)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {requirements.length < 10 && (
                <Button variant="outline" size="sm" onClick={() => addListItem(requirements, setRequirements)}>
                  <Plus className="w-4 h-4 mr-1" /> เพิ่ม
                </Button>
              )}
            </div>

            {/* Outcomes */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" /> สิ่งที่ผู้เรียนจะได้รับ
              </h3>
              <p className="text-xs text-muted-foreground">เช่น "สร้างเว็บแอปได้ด้วยตัวเอง"</p>
              <div className="space-y-2">
                {outcomes.map((out, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    <Input
                      value={out}
                      onChange={(e) => updateList(outcomes, setOutcomes, i, e.target.value)}
                      placeholder={`สิ่งที่ได้รับข้อที่ ${i + 1}`}
                      maxLength={200}
                      className="input-focus flex-1"
                    />
                    {outcomes.length > 1 && (
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"
                        onClick={() => removeListItem(outcomes, setOutcomes, i)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {outcomes.length < 10 && (
                <Button variant="outline" size="sm" onClick={() => addListItem(outcomes, setOutcomes)}>
                  <Plus className="w-4 h-4 mr-1" /> เพิ่ม
                </Button>
              )}
            </div>

            {/* Certificate */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">ใบประกาศนียบัตร</p>
                    <p className="text-xs text-muted-foreground">ผู้เรียนได้รับ Certificate เมื่อเรียนจบ</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCertificate}
                    onChange={(e) => setHasCertificate(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: ราคา & เผยแพร่ ─────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">

            {/* ราคา */}
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" /> ราคา
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsFree(true)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isFree ? "border-success bg-success/5" : "border-border hover:border-success/40"
                  }`}
                >
                  <p className={`text-lg font-bold ${isFree ? "text-success" : "text-foreground"}`}>🎁 ฟรี</p>
                  <p className="text-xs text-muted-foreground mt-1">เข้าถึงได้ทันที ไม่มีค่าใช้จ่าย</p>
                </button>
                <button
                  onClick={() => setIsFree(false)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    !isFree ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className={`text-lg font-bold ${!isFree ? "text-primary" : "text-foreground"}`}>💰 มีค่าใช้จ่าย</p>
                  <p className="text-xs text-muted-foreground mt-1">กำหนดราคาเองได้</p>
                </button>
              </div>

              {!isFree && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">฿</span>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="990"
                    className="pl-8 input-focus text-lg font-bold"
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">แนะนำ: ฿290, ฿490, ฿990, ฿1,490, ฿1,990</p>
                </div>
              )}
            </div>

            {/* Summary preview */}
            <div className="card-elevated p-6 space-y-4 bg-muted/20">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> สรุปคอร์ส
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "ชื่อคอร์ส", value: title || "-" },
                  { label: "หมวดหมู่", value: category },
                  { label: "ระดับ", value: LEVELS.find((l) => l.value === level)?.label || "-" },
                  { label: "ภาษา", value: language },
                  { label: "ราคา", value: isFree ? "ฟรี" : `฿${Number(price).toLocaleString()}` },
                  { label: "Certificate", value: hasCertificate ? "มี ✓" : "ไม่มี" },
                  { label: "สิ่งที่ได้รับ", value: `${outcomes.filter(Boolean).length} ข้อ` },
                  { label: "ความต้องการก่อนเรียน", value: `${requirements.filter(Boolean).length} ข้อ` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium truncate max-w-48">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSave("draft")}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                บันทึก Draft
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={() => handleSave("published")}
                disabled={saving}
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
                  : "เผยแพร่คอร์ส 🚀"}
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </Button>

          {step < STEPS.length - 1 && (
            <Button variant="hero" onClick={handleNext}>
              ถัดไป <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
