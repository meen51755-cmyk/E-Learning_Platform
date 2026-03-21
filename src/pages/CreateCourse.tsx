import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validators, checkRateLimit, validateImageFile } from "@/lib/sanitize";
import {
  BookOpen, ArrowLeft, Save, Upload,
  DollarSign, Tag, BarChart2, Loader2, Image
} from "lucide-react";

const CATEGORIES = [
  "Web Development", "Data Science", "Design",
  "Mobile Development", "Cybersecurity", "Business", "Marketing",
];

const LEVELS = [
  { value: "beginner", label: "เริ่มต้น" },
  { value: "intermediate", label: "กลาง" },
  { value: "advanced", label: "สูง" },
];

const CreateCourse = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [level, setLevel] = useState("beginner");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // ── อัปโหลด Thumbnail ──────────────────────────────────────
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

  // ── บันทึกคอร์ส ────────────────────────────────────────────
  const handleSave = async (status: "draft" | "published") => {
    if (!user) return;

    // ✅ validate
    const titleCheck = validators.fullName(title);
    if (!titleCheck.ok) {
      toast({ title: `ชื่อคอร์ส: ${titleCheck.error}`, variant: "destructive" });
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      toast({ title: "คำอธิบายต้องมีอย่างน้อย 20 ตัวอักษร", variant: "destructive" });
      return;
    }
    if (!isFree) {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum <= 0 || priceNum > 100000) {
        toast({ title: "ราคาต้องอยู่ระหว่าง 1 - 100,000 บาท", variant: "destructive" });
        return;
      }
    }

    // ✅ rate limit
    const rate = checkRateLimit(`create-course-${user.id}`, 5, 3600000);
    if (!rate.allowed) {
      toast({ title: "สร้างคอร์สถี่เกินไป กรุณารอสักครู่", variant: "destructive" });
      return;
    }

    setSaving(true);
    let thumbnailUrl: string | null = null;

    // อัปโหลด thumbnail ถ้ามี
    if (thumbnail) {
      setUploadingThumb(true);
      const safeName = thumbnail.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `course-thumbnails/${user.id}/${Date.now()}_${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, thumbnail, { upsert: true });

      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        thumbnailUrl = publicUrl;
      }
      setUploadingThumb(false);
    }

    // บันทึกลง Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data, error } = await db
      .from("courses")
      .insert({
        instructor_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        level,
        is_free: isFree,
        price: isFree ? 0 : Number(price),
        thumbnail_url: thumbnailUrl,
        status,
      })
      .select("id")
      .single();

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8 max-w-3xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/instructor/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">สร้างคอร์สใหม่</h1>
            <p className="text-sm text-muted-foreground">กรอกข้อมูลพื้นฐานของคอร์ส</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* ── Thumbnail ─────────────────────────────────────── */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-display font-bold text-foreground flex items-center gap-2">
              <Image className="w-4 h-4 text-primary" /> รูปภาพปก
            </h3>
            <div
              className="aspect-video bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
              onClick={() => document.getElementById("thumb-input")?.click()}
            >
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="thumbnail" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลดรูปภาพ</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP ไม่เกิน 2MB</p>
                </div>
              )}
            </div>
            <input
              id="thumb-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />
          </div>

          {/* ── ข้อมูลพื้นฐาน ──────────────────────────────────── */}
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
                placeholder="อธิบายว่าคอร์สนี้สอนอะไร ใครเหมาะกับคอร์สนี้ และผู้เรียนจะได้อะไร..."
                rows={5}
                maxLength={2000}
                className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{description.length}/2000</p>
            </div>
          </div>

          {/* ── หมวดหมู่และระดับ ──────────────────────────────── */}
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
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">ระดับความยาก</label>
                <div className="flex gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLevel(l.value)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                        level === l.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── ราคา ──────────────────────────────────────────── */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-display font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> ราคา
            </h3>

            <div className="flex gap-3">
              <button
                onClick={() => setIsFree(true)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                  isFree ? "border-success bg-success/10 text-success" : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                🎁 ฟรี
              </button>
              <button
                onClick={() => setIsFree(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                  !isFree ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                💰 มีค่าใช้จ่าย
              </button>
            </div>

            {!isFree && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">฿</span>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="990"
                  className="pl-8 input-focus"
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>
            )}
          </div>

          {/* ── Actions ───────────────────────────────────────── */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleSave("draft")}
              disabled={saving}
            >
              {saving && uploadingThumb
                ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังอัปโหลด...</>
                : <><Save className="w-4 h-4" /> บันทึก Draft</>
              }
            </Button>
            <Button
              variant="hero"
              className="flex-1"
              onClick={() => handleSave("published")}
              disabled={saving}
            >
              {saving && !uploadingThumb
                ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
                : "เผยแพร่คอร์ส 🚀"
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
