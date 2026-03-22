import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validators } from "@/lib/sanitize";
import UploadContent from "@/components/instructor/UploadContent";

// ── DnD Kit ──────────────────────────────────────────────────
import {
  DndContext, closestCenter, KeyboardSensor,
  PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Plus, Trash2, ArrowLeft, GripVertical,
  Video, FileText, File, Edit2, ChevronDown,
  ChevronRight, Award, Loader2, Check, Upload,
  Eye, EyeOff, Copy, X, Play, Save
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "article" | "pdf";
  duration: string;
  order_index: number;
  is_preview: boolean;
  content_url: string | null;
}

interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

const lessonTypeIcon  = { video: Video, article: FileText, pdf: File };
const lessonTypeLabel = { video: "วิดีโอ", article: "บทความ", pdf: "PDF" };

// ── Sortable Lesson Item ──────────────────────────────────────
const SortableLesson = ({
  lesson, moduleId, isUploading, isEditing,
  onUpload, onEdit, onDelete, onDuplicate, onTogglePreview, onSaveEdit,
}: {
  lesson: Lesson;
  moduleId: string;
  isUploading: boolean;
  isEditing: boolean;
  onUpload: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onTogglePreview: () => void;
  onSaveEdit: (title: string, duration: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const [editTitle, setEditTitle] = useState(lesson.title);
  const [editDuration, setEditDuration] = useState(lesson.duration);
  const LessonIcon = lessonTypeIcon[lesson.type];

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`flex items-center gap-2 px-4 py-3 border-b border-border/50 hover:bg-muted/20 transition-colors ${isDragging ? "bg-muted shadow-lg" : ""}`}>
        {/* Drag handle */}
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted-foreground hover:text-foreground">
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <LessonIcon className="w-3.5 h-3.5 text-primary" />
        </div>

        {/* Inline edit */}
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-7 text-sm input-focus"
              maxLength={200}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit(editTitle, editDuration);
                if (e.key === "Escape") onEdit();
              }}
            />
            <Input
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
              className="h-7 text-sm w-28 input-focus"
              placeholder="เช่น 10 นาที"
              maxLength={20}
            />
            <Button size="icon" variant="ghost" className="w-7 h-7 text-success" onClick={() => onSaveEdit(editTitle, editDuration)}>
              <Check className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="w-7 h-7" onClick={onEdit}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
              {lesson.is_preview && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success">Preview</span>
              )}
              {lesson.content_url && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">✓ มีไฟล์</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {lessonTypeLabel[lesson.type]}{lesson.duration ? ` · ${lesson.duration}` : ""}
            </p>
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon" className="w-7 h-7" title="อัปโหลดไฟล์" onClick={onUpload}>
              <Upload className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7" title={lesson.is_preview ? "ซ่อน Preview" : "ตั้งเป็น Preview"} onClick={onTogglePreview}>
              {lesson.is_preview ? <EyeOff className="w-3.5 h-3.5 text-success" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7" title="แก้ไข" onClick={onEdit}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7" title="ทำสำเนา" onClick={onDuplicate}>
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" title="ลบ" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Upload panel */}
      {isUploading && (
        <div className="px-4 py-4 bg-muted/20 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground mb-3">อัปโหลดไฟล์: {lesson.title}</p>
          <UploadContent
            courseId={useParams().id!}
            lessonId={lesson.id}
            lessonType={lesson.type}
            currentUrl={lesson.content_url}
            onUploaded={() => onUpload()}
          />
        </div>
      )}

      {/* Video preview */}
      {lesson.content_url && lesson.type === "video" && isUploading && (
        <div className="px-4 py-3 bg-black/5 border-b border-border">
          <video
            src={lesson.content_url}
            controls
            className="w-full max-h-48 rounded-lg"
            preload="metadata"
          />
        </div>
      )}
    </div>
  );
};

// ── Sortable Module ───────────────────────────────────────────
const SortableModule = ({
  module, courseId, expanded, onToggle,
  onDeleteModule, onAddLesson, onDeleteLesson,
  onDuplicateLesson, onSaveLesson, onReorderLessons,
  onTogglePreview, uploadingLesson, editingLesson,
  onSetUploading, onSetEditing, onUpdateModuleTitle,
}: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [newLesson, setNewLesson] = useState({ title: "", type: "video" as "video" | "article" | "pdf", duration: "" });
  const [addingLesson, setAddingLesson] = useState(false);
  const [editModuleTitle, setEditModuleTitle] = useState(false);
  const [moduleTitle, setModuleTitle] = useState(module.title);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const bulkRef = useRef<HTMLInputElement>(null);

  // Bulk upload
  const handleBulkUpload = async (files: File[]) => {
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[^.]+$/, "");
      await onAddLesson(module.id, safeName, "video", "");
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="card-elevated overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/10">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground">
          <GripVertical className="w-4 h-4" />
        </button>

        <button onClick={onToggle} className="flex items-center gap-2 flex-1 text-left">
          {expanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4" />}
          {editModuleTitle ? (
            <Input
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="h-7 text-sm font-semibold input-focus"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUpdateModuleTitle(module.id, moduleTitle);
                  setEditModuleTitle(false);
                }
                if (e.key === "Escape") setEditModuleTitle(false);
              }}
              maxLength={200}
            />
          ) : (
            <span className="font-semibold text-foreground">{module.title}</span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{module.lessons.length} บทเรียน</span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setEditModuleTitle(!editModuleTitle)}>
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive"
            onClick={() => onDeleteModule(module.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Lessons */}
      {expanded && (
        <div>
          <DndContext
            sensors={useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))}
            collisionDetection={closestCenter}
            onDragEnd={(event: DragEndEvent) => {
              const { active, over } = event;
              if (active.id !== over?.id) {
                const oldIdx = module.lessons.findIndex((l: Lesson) => l.id === active.id);
                const newIdx = module.lessons.findIndex((l: Lesson) => l.id === over?.id);
                onReorderLessons(module.id, arrayMove(module.lessons, oldIdx, newIdx));
              }
            }}
          >
            <SortableContext items={module.lessons.map((l: Lesson) => l.id)} strategy={verticalListSortingStrategy}>
              {module.lessons.map((lesson: Lesson) => (
                <SortableLesson
                  key={lesson.id}
                  lesson={lesson}
                  moduleId={module.id}
                  isUploading={uploadingLesson === lesson.id}
                  isEditing={editingLesson === lesson.id}
                  onUpload={() => onSetUploading(uploadingLesson === lesson.id ? null : lesson.id)}
                  onEdit={() => onSetEditing(editingLesson === lesson.id ? null : lesson.id)}
                  onDelete={() => onDeleteLesson(lesson.id)}
                  onDuplicate={() => onDuplicateLesson(module.id, lesson)}
                  onTogglePreview={() => onTogglePreview(lesson.id, !lesson.is_preview)}
                  onSaveEdit={(title, duration) => {
                    onSaveLesson(lesson.id, title, duration);
                    onSetEditing(null);
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add lesson form */}
          {addingLesson ? (
            <div className="p-4 bg-muted/10 space-y-3 border-b border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  placeholder="ชื่อบทเรียน"
                  maxLength={200}
                  className="input-focus md:col-span-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onAddLesson(module.id, newLesson.title, newLesson.type, newLesson.duration);
                      setNewLesson({ title: "", type: "video", duration: "" });
                      setAddingLesson(false);
                    }
                  }}
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
                <Button variant="outline" size="sm" onClick={() => setAddingLesson(false)}>ยกเลิก</Button>
                <Button variant="hero" size="sm" onClick={() => {
                  onAddLesson(module.id, newLesson.title, newLesson.type, newLesson.duration);
                  setNewLesson({ title: "", type: "video", duration: "" });
                  setAddingLesson(false);
                }}>
                  <Check className="w-3.5 h-3.5" /> บันทึก
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex border-b border-border">
              <button
                onClick={() => setAddingLesson(true)}
                className="flex-1 py-3 text-sm text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> เพิ่มบทเรียน
              </button>
              <button
                onClick={() => bulkRef.current?.click()}
                className="px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors flex items-center gap-2 border-l border-border"
                title="Bulk upload วิดีโอหลายไฟล์"
              >
                <Upload className="w-4 h-4" /> Bulk Upload
              </button>
              <input
                ref={bulkRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) handleBulkUpload(files);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main CourseEditor ─────────────────────────────────────────
const CourseEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<{ title: string; status: string } | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [uploadingLesson, setUploadingLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: courseData }, { data: modulesData }] = await Promise.all([
      db.from("courses").select("title, status").eq("id", id).single(),
      db.from("course_modules").select("*").eq("course_id", id).order("order_index"),
    ]);
    if (courseData) setCourse(courseData);
    if (modulesData) {
      const withLessons = await Promise.all(
        (modulesData as any[]).map(async (m) => {
          const { data: lessons } = await db.from("lessons").select("*")
            .eq("module_id", m.id).order("order_index");
          return { ...m, lessons: (lessons ?? []) as Lesson[] };
        })
      );
      setModules(withLessons as Module[]);
      setExpandedModules(new Set(withLessons.map((m: any) => m.id)));
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!id || modules.length === 0) return;
      setAutoSaving(true);
      await new Promise((r) => setTimeout(r, 500));
      setAutoSaving(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [id, modules]);

  // ── Module actions ────────────────────────────────────────
  const handleAddModule = async () => {
    const check = validators.postTitle(newModuleTitle);
    if (!check.ok) { toast({ title: check.error, variant: "destructive" }); return; }
    setAddingModule(true);
    const { data, error } = await db.from("course_modules").insert({
      course_id: id, title: check.value, order_index: modules.length,
    }).select().single();
    setAddingModule(false);
    if (error) { toast({ title: "เพิ่ม Module ไม่สำเร็จ", variant: "destructive" }); return; }
    const newModule = { ...data, lessons: [] } as Module;
    setModules((prev) => [...prev, newModule]);
    setExpandedModules((prev) => new Set([...prev, data.id]));
    setNewModuleTitle("");
    toast({ title: "เพิ่ม Module สำเร็จ ✓" });
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("ลบ Module นี้และบทเรียนทั้งหมด?")) return;
    await db.from("course_modules").delete().eq("id", moduleId);
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
    toast({ title: "ลบ Module สำเร็จ ✓" });
  };

  const handleUpdateModuleTitle = async (moduleId: string, title: string) => {
    await db.from("course_modules").update({ title }).eq("id", moduleId);
    setModules((prev) => prev.map((m) => m.id === moduleId ? { ...m, title } : m));
    toast({ title: "บันทึกชื่อ Module สำเร็จ ✓" });
  };

  // ── Lesson actions ────────────────────────────────────────
  const handleAddLesson = async (moduleId: string, title: string, type: string, duration: string) => {
    if (!title.trim()) { toast({ title: "กรุณากรอกชื่อบทเรียน", variant: "destructive" }); return; }
    const module = modules.find((m) => m.id === moduleId);
    const { data, error } = await db.from("lessons").insert({
      module_id: moduleId, course_id: id,
      title: title.trim(), type, duration: duration || null,
      order_index: module?.lessons.length ?? 0,
    }).select().single();
    if (error) { toast({ title: "เพิ่มบทเรียนไม่สำเร็จ", variant: "destructive" }); return; }
    setModules((prev) => prev.map((m) =>
      m.id === moduleId ? { ...m, lessons: [...m.lessons, data as Lesson] } : m
    ));
    toast({ title: "เพิ่มบทเรียนสำเร็จ ✓" });
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await db.from("lessons").delete().eq("id", lessonId);
    setModules((prev) => prev.map((m) => ({
      ...m, lessons: m.lessons.filter((l) => l.id !== lessonId)
    })));
    toast({ title: "ลบบทเรียนสำเร็จ ✓" });
  };

  const handleDuplicateLesson = async (moduleId: string, lesson: Lesson) => {
    const module = modules.find((m) => m.id === moduleId);
    const { data, error } = await db.from("lessons").insert({
      module_id: moduleId, course_id: id,
      title: `${lesson.title} (สำเนา)`,
      type: lesson.type, duration: lesson.duration,
      order_index: module?.lessons.length ?? 0,
      is_preview: false,
    }).select().single();
    if (error) { toast({ title: "ทำสำเนาไม่สำเร็จ", variant: "destructive" }); return; }
    setModules((prev) => prev.map((m) =>
      m.id === moduleId ? { ...m, lessons: [...m.lessons, data as Lesson] } : m
    ));
    toast({ title: "ทำสำเนาสำเร็จ ✓" });
  };

  const handleSaveLesson = async (lessonId: string, title: string, duration: string) => {
    await db.from("lessons").update({ title, duration }).eq("id", lessonId);
    setModules((prev) => prev.map((m) => ({
      ...m, lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, title, duration } : l)
    })));
    toast({ title: "บันทึกสำเร็จ ✓" });
  };

  const handleTogglePreview = async (lessonId: string, isPreview: boolean) => {
    await db.from("lessons").update({ is_preview: isPreview }).eq("id", lessonId);
    setModules((prev) => prev.map((m) => ({
      ...m, lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, is_preview: isPreview } : l)
    })));
    toast({ title: isPreview ? "ตั้งเป็น Preview ✓" : "ซ่อน Preview ✓" });
  };

  // ── Reorder ───────────────────────────────────────────────
  const handleReorderModules = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = modules.findIndex((m) => m.id === active.id);
    const newIdx = modules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modules, oldIdx, newIdx);
    setModules(reordered);
    // อัปเดต order_index ใน DB
    await Promise.all(reordered.map((m, i) =>
      db.from("course_modules").update({ order_index: i }).eq("id", m.id)
    ));
  };

  const handleReorderLessons = async (moduleId: string, reordered: Lesson[]) => {
    setModules((prev) => prev.map((m) => m.id === moduleId ? { ...m, lessons: reordered } : m));
    await Promise.all(reordered.map((l, i) =>
      db.from("lessons").update({ order_index: i }).eq("id", l.id)
    ));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

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
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  course?.status === "published" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}>
                  {course?.status === "published" ? "เผยแพร่แล้ว" : "Draft"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {modules.length} modules · {totalLessons} บทเรียน
                </span>
                {autoSaving && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" /> Auto-saving...
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link to={`/instructor/courses/${id}/quiz`}>
            <Button variant="outline">
              <Award className="w-4 h-4" /> จัดการ Quiz
            </Button>
          </Link>
        </div>

        {/* Drag hint */}
        {modules.length > 1 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 px-2">
            <GripVertical className="w-4 h-4" />
            ลากที่ไอคอน ≡ เพื่อเรียงลำดับ Module และบทเรียน
          </div>
        )}

        {/* Modules with DnD */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorderModules}>
          <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4 mb-6">
              {modules.map((module) => (
                <SortableModule
                  key={module.id}
                  module={module}
                  courseId={id}
                  expanded={expandedModules.has(module.id)}
                  onToggle={() => setExpandedModules((prev) => {
                    const next = new Set(prev);
                    if (next.has(module.id)) next.delete(module.id);
                    else next.add(module.id);
                    return next;
                  })}
                  onDeleteModule={handleDeleteModule}
                  onAddLesson={handleAddLesson}
                  onDeleteLesson={handleDeleteLesson}
                  onDuplicateLesson={handleDuplicateLesson}
                  onSaveLesson={handleSaveLesson}
                  onReorderLessons={handleReorderLessons}
                  onTogglePreview={handleTogglePreview}
                  uploadingLesson={uploadingLesson}
                  editingLesson={editingLesson}
                  onSetUploading={setUploadingLesson}
                  onSetEditing={setEditingLesson}
                  onUpdateModuleTitle={handleUpdateModuleTitle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

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
