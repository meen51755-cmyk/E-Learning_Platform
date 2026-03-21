import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validators } from "@/lib/sanitize";
import UploadContent from "@/components/instructor/UploadContent";
import {
  Plus, Trash2, ArrowLeft, Save, GripVertical,
  Video, FileText, File, Edit2, ChevronDown,
  ChevronRight, BookOpen, Award, Loader2, Check, Upload
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "article" | "pdf";
  duration: string;
  order_index: number;
  is_preview: boolean;
}

interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

const lessonTypeIcon = { video: Video, article: FileText, pdf: File };
const lessonTypeLabel = { video: "วิดีโอ", article: "บทความ", pdf: "PDF" };

const CourseEditor = () => {
  const { id } = useParams(); // course id
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<{ title: string; status: string } | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // New module form
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);

  // New lesson form
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [uploadingLesson, setUploadingLesson] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: "", type: "video" as "video" | "article" | "pdf", duration: "" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);

    const [{ data: courseData }, { data: modulesData }] = await Promise.all([
      db.from("courses").select("title, status").eq("id", id).single(),
      db.from("course_modules").select("*").eq("course_id", id).order("order_index"),
    ]);

    if (courseData) setCourse(courseData);

    if (modulesData) {
      const modulesWithLessons = await Promise.all(
        (modulesData as any[]).map(async (m) => {
          const { data: lessons } = await db
            .from("lessons")
            .select("*")
            .eq("module_id", m.id)
            .order("order_index");
          return { ...m, lessons: (lessons ?? []) as any[] };
        })
      );
      setModules(modulesWithLessons as any);
      if (modulesWithLessons.length > 0) {
        setExpandedModules(new Set([modulesWithLessons[0].id]));
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  // ── เพิ่ม Module ───────────────────────────────────────────
  const handleAddModule = async () => {
    const check = validators.postTitle(newModuleTitle);
    if (!check.ok) {
      toast({ title: check.error, variant: "destructive" });
      return;
    }
    setAddingModule(true);
    const { error } = await db.from("course_modules").insert({
      course_id: id,
      title: check.value,
      order_index: modules.length,
    });
    setAddingModule(false);
    if (error) {
      toast({ title: "เพิ่ม Module ไม่สำเร็จ", variant: "destructive" });
      return;
    }
    setNewModuleTitle("");
    toast({ title: "เพิ่ม Module สำเร็จ ✓" });
    fetchData();
  };

  // ── ลบ Module ──────────────────────────────────────────────
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("ลบ Module นี้และบทเรียนทั้งหมดในนั้น?")) return;
    const { error } = await db.from("course_modules").delete().eq("id", moduleId);
    if (error) toast({ title: "ลบไม่สำเร็จ", variant: "destructive" });
    else { toast({ title: "ลบ Module สำเร็จ ✓" }); fetchData(); }
  };

  // ── เพิ่ม Lesson ───────────────────────────────────────────
  const handleAddLesson = async (moduleId: string) => {
    const check = validators.postTitle(newLesson.title);
    if (!check.ok) {
      toast({ title: check.error, variant: "destructive" });
      return;
    }
    const module = modules.find((m) => m.id === moduleId);
    const { error } = await db.from("lessons").insert({
      module_id: moduleId,
      course_id: id,
      title: check.value,
      type: newLesson.type,
      duration: newLesson.duration || null,
      order_index: module?.lessons.length ?? 0,
    });
    if (error) {
      toast({ title: "เพิ่มบทเรียนไม่สำเร็จ", variant: "destructive" });
      return;
    }
    setNewLesson({ title: "", type: "video", duration: "" });
    setAddingLessonTo(null);
    toast({ title: "เพิ่มบทเรียนสำเร็จ ✓" });
    fetchData();
  };

  // ── ลบ Lesson ──────────────────────────────────────────────
  const handleDeleteLesson = async (lessonId: string) => {
    const { error } = await db.from("lessons").delete().eq("id", lessonId);
    if (error) toast({ title: "ลบบทเรียนไม่สำเร็จ", variant: "destructive" });
    else { toast({ title: "ลบบทเรียนสำเร็จ ✓" }); fetchData(); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link to="/instructor/courses">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{course?.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  course?.status === "published" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}>
                  {course?.status === "published" ? "เผยแพร่แล้ว" : "Draft"}
                </span>
                <span className="text-xs text-muted-foreground">{modules.length} modules · {modules.reduce((s, m) => s + m.lessons.length, 0)} บทเรียน</span>
              </div>
            </div>
          </div>
          <Link to={`/instructor/courses/${id}/quiz`}>
            <Button variant="outline">
              <Award className="w-4 h-4" /> จัดการ Quiz
            </Button>
          </Link>
        </div>

        {/* Modules */}
        <div className="space-y-4 mb-6">
          {modules.map((module, mIdx) => (
            <div key={module.id} className="card-elevated overflow-hidden">
              {/* Module header */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <button
                  onClick={() => toggleModule(module.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  {expandedModules.has(module.id)
                    ? <ChevronDown className="w-4 h-4 text-primary" />
                    : <ChevronRight className="w-4 h-4" />}
                  <span className="font-semibold text-foreground">
                    Module {mIdx + 1}: {module.title}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {module.lessons.length} บทเรียน
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleDeleteModule(module.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Lessons */}
              {expandedModules.has(module.id) && (
                <div>
                  {module.lessons.map((lesson, lIdx) => {
                    const LessonIcon = lessonTypeIcon[lesson.type];
                    return (
                      <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border/50">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <LessonIcon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {lIdx + 1}. {lesson.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lessonTypeLabel[lesson.type]}
                            {lesson.duration && ` · ${lesson.duration}`}
                            {lesson.is_preview && " · 🔓 Preview"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="w-7 h-7">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add lesson form */}
                  {addingLessonTo === module.id ? (
                    <div className="p-4 bg-muted/20 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                          placeholder="ชื่อบทเรียน"
                          maxLength={200}
                          className="md:col-span-1 input-focus"
                        />
                        <select
                          value={newLesson.type}
                          onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value as any })}
                          className="bg-muted rounded-lg px-3 py-2 text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="video">🎬 วิดีโอ</option>
                          <option value="article">📝 บทความ</option>
                          <option value="pdf">📄 PDF</option>
                        </select>
                        <Input
                          value={newLesson.duration}
                          onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                          placeholder="ระยะเวลา เช่น 15 นาที"
                          maxLength={20}
                          className="input-focus"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setAddingLessonTo(null)}>ยกเลิก</Button>
                        <Button variant="hero" size="sm" onClick={() => handleAddLesson(module.id)}>
                          <Check className="w-3.5 h-3.5" /> บันทึก
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingLessonTo(module.id)}
                      className="w-full py-3 text-sm text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> เพิ่มบทเรียน
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Module */}
        <div className="card-elevated p-5 space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> เพิ่ม Module ใหม่
          </h3>
          <div className="flex gap-3">
            <Input
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="ชื่อ Module เช่น บทนำ - HTML พื้นฐาน"
              maxLength={200}
              className="input-focus flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
            />
            <Button variant="hero" onClick={handleAddModule} disabled={addingModule}>
              {addingModule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              เพิ่ม
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;
