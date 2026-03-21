// src/components/instructor/UploadContent.tsx
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Upload, Video, FileText, File, X,
  CheckCircle, Loader2, AlertCircle
} from "lucide-react";

interface UploadContentProps {
  courseId: string;
  lessonId: string;
  lessonType: "video" | "article" | "pdf";
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}

const ALLOWED_TYPES = {
  video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  pdf:   ["application/pdf"],
  article: [], // article ใช้ text editor ไม่ต้องอัปโหลด
};

const MAX_SIZE = {
  video: 500 * 1024 * 1024, // 500MB
  pdf:   50  * 1024 * 1024, // 50MB
  article: 0,
};

const UploadContent = ({ courseId, lessonId, lessonType, currentUrl, onUploaded }: UploadContentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null);

  const typeIcon = {
    video:   <Video className="w-8 h-8 text-blue-500" />,
    pdf:     <File className="w-8 h-8 text-red-500" />,
    article: <FileText className="w-8 h-8 text-green-500" />,
  };

  const typeLabel = { video: "วิดีโอ", pdf: "PDF", article: "บทความ" };

  const validateFile = (file: File): string | null => {
    const allowed = ALLOWED_TYPES[lessonType];
    if (allowed.length > 0 && !allowed.includes(file.type)) {
      return `ไฟล์ต้องเป็น ${lessonType === "video" ? "MP4, WebM, MOV" : "PDF"} เท่านั้น`;
    }
    const maxSize = MAX_SIZE[lessonType];
    if (file.size > maxSize) {
      return `ไฟล์ต้องไม่เกิน ${maxSize / (1024 * 1024)}MB`;
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    const error = validateFile(file);
    if (error) {
      toast({ title: error, variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress(0);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${courseId}/${lessonId}/${Date.now()}_${safeName}`;

    try {
      // Simulate progress (Supabase JS ไม่มี onProgress ใน free tier)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 85));
      }, 300);

      const { error: uploadError } = await supabase.storage
        .from("course-content")
        .upload(filePath, file, { upsert: true });

      clearInterval(progressInterval);

      if (uploadError) {
        toast({ title: "อัปโหลดไม่สำเร็จ", description: uploadError.message, variant: "destructive" });
        setUploading(false);
        setProgress(0);
        return;
      }

      setProgress(100);

      const { data: { publicUrl } } = supabase.storage
        .from("course-content")
        .getPublicUrl(filePath);

      // อัปเดต lesson content_url
      await supabase
        .from("lessons")
        .update({ content_url: publicUrl })
        .eq("id", lessonId);

      setUploadedUrl(publicUrl);
      onUploaded(publicUrl);

      toast({ title: `อัปโหลด ${typeLabel[lessonType]} สำเร็จ ✓` });
    } catch (err) {
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    }

    setUploading(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async () => {
    if (!uploadedUrl) return;
    setUploadedUrl(null);
    await supabase.from("lessons").update({ content_url: null }).eq("id", lessonId);
    toast({ title: "ลบไฟล์สำเร็จ ✓" });
  };

  if (lessonType === "article") {
    return (
      <div className="p-4 rounded-xl border border-border bg-muted/30 text-center text-sm text-muted-foreground">
        <FileText className="w-6 h-6 mx-auto mb-2 text-green-500" />
        บทความใช้ Text Editor — ไม่ต้องอัปโหลดไฟล์
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Current file */}
      {uploadedUrl && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-success/30 bg-success/5">
          <CheckCircle className="w-5 h-5 text-success shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              อัปโหลดแล้ว ✓
            </p>
            <p className="text-xs text-muted-foreground truncate">{uploadedUrl}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {lessonType === "video" && (
              <a href={uploadedUrl} target="_blank" rel="noreferrer">
                <Button variant="ghost" size="sm" className="text-xs">ดูวิดีโอ</Button>
              </a>
            )}
            {lessonType === "pdf" && (
              <a href={uploadedUrl} target="_blank" rel="noreferrer">
                <Button variant="ghost" size="sm" className="text-xs">เปิด PDF</Button>
              </a>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive w-7 h-7"
              onClick={handleDelete}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : uploading
            ? "border-border cursor-not-allowed"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-sm font-medium text-foreground">กำลังอัปโหลด... {progress}%</p>
            <div className="h-2 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">{typeIcon[lessonType]}</div>
            <div>
              <p className="text-sm font-medium text-foreground">
                วาง{typeLabel[lessonType]}ที่นี่ หรือ{" "}
                <span className="text-primary underline">เลือกไฟล์</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lessonType === "video"
                  ? "MP4, WebM, MOV — สูงสุด 500MB"
                  : "PDF — สูงสุด 50MB"}
              </p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={lessonType === "video" ? "video/*" : "application/pdf"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </div>
    </div>
  );
};

export default UploadContent;
