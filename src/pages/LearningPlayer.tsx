/**
 * LearningPlayer — หน้าเรียนบทเรียน
 * ตอนนี้ใช้ mockData ก่อน พอมี course จริงค่อยสลับตาม comment # TODO
 */
import { useParams, Link, useNavigate } from "react-router-dom";
import { sampleCourses } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, PlayCircle, FileText, File,
  CheckCircle, Award, MessageSquare, Bookmark,
  StickyNote, Menu, X, Download, Loader2
} from "lucide-react";

const LearningPlayer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // TODO: แทนด้วย useQuery ดึง course จาก Supabase เมื่อมี course จริง
  const course = sampleCourses.find((c) => c.id === id) || sampleCourses[0];

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLesson, setActiveLesson] = useState(
    course.modules[0]?.lessons[0]?.id || ""
  );
  const [notes, setNotes] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson);
  const currentLesson = allLessons[currentIndex];
  const progress = allLessons.length > 0
    ? Math.round((completedLessons.length / allLessons.length) * 100)
    : 0;

  const lessonIcons = { video: PlayCircle, article: FileText, pdf: File };

  // ── บันทึก note (TODO: เชื่อม Supabase) ──────────────────
  const handleSaveNote = async () => {
    if (!notes.trim()) return;
    setSavingNote(true);
    // TODO: await supabase.from('lesson_notes').upsert({ user_id: user.id, lesson_id: activeLesson, content: notes })
    await new Promise((r) => setTimeout(r, 500)); // mock delay
    setSavingNote(false);
    toast({ title: "บันทึก note แล้ว ✓" });
  };

  // ── mark บทเรียนว่าเสร็จแล้ว ──────────────────────────────
  const markComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
      // TODO: await supabase.from('lesson_progress').upsert({ user_id, lesson_id, completed: true })
    }
  };

  // mark อัตโนมัติเมื่อเปลี่ยนบท (สำหรับ article/pdf)
  useEffect(() => {
    if (currentLesson?.type !== "video") {
      markComplete(currentLesson?.id || "");
    }
  }, [activeLesson]);

  // ── ไปบทถัดไป ─────────────────────────────────────────────
  const goNext = () => {
    markComplete(currentLesson?.id || "");
    if (currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1].id);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setActiveLesson(allLessons[currentIndex - 1].id);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">

      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link
            to={`/courses/${course.id}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> กลับ
          </Link>
          <span className="text-sm font-medium text-foreground hidden md:block truncate max-w-xs">
            {course.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-1.5 bg-muted rounded-full hidden sm:block overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Main Content ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* Content Area */}
          <div className="bg-black aspect-video w-full flex items-center justify-center shrink-0">
            {currentLesson?.type === "video" ? (
              <div className="text-center space-y-4">
                {/*
                  TODO: แทนด้วย video จริง:
                  <video
                    src={videoUrl}   // จาก supabase.storage.from('course-videos').getPublicUrl(...)
                    controls
                    className="w-full h-full"
                    onEnded={() => markComplete(currentLesson.id)}
                  />
                */}
                <PlayCircle className="w-20 h-20 text-white/30 mx-auto" />
                <p className="text-white/50 text-sm">{currentLesson.title}</p>
                <p className="text-white/30 text-xs">Video จะแสดงที่นี่เมื่อเชื่อมต่อ Storage</p>
                {/* ปุ่ม mark เสร็จชั่วคราว สำหรับ video */}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white/60 hover:text-white"
                  onClick={() => markComplete(currentLesson.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Mark เสร็จแล้ว
                </Button>
              </div>
            ) : currentLesson?.type === "article" ? (
              <div className="bg-background w-full h-full overflow-y-auto p-8">
                {/*
                  TODO: แทนด้วยเนื้อหาจริง:
                  <div dangerouslySetInnerHTML={{ __html: lessonContent }} />
                */}
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  {currentLesson.title}
                </h2>
                <p className="text-muted-foreground">
                  เนื้อหาบทความจะแสดงที่นี่เมื่อเชื่อมต่อ Database
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                {/*
                  TODO: แทนด้วย PDF viewer:
                  <iframe src={pdfUrl} className="w-full h-full" />
                */}
                <File className="w-20 h-20 text-white/30 mx-auto" />
                <p className="text-white/50 text-sm">PDF: {currentLesson?.title}</p>
                <Button variant="outline" size="sm" className="border-white/20 text-white/60">
                  <Download className="w-4 h-4 mr-1" /> ดาวน์โหลด PDF
                </Button>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">
                {currentLesson?.title}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium text-foreground">บันทึกของฉัน</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={savingNote || !notes.trim()}
                >
                  {savingNote ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "บันทึก"
                  )}
                </Button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="จดบันทึกระหว่างเรียน..."
                className="w-full h-24 bg-muted rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button variant="outline" disabled={currentIndex <= 0} onClick={goPrev}>
                <ChevronLeft className="w-4 h-4" /> บทก่อนหน้า
              </Button>
              <Button
                disabled={currentIndex >= allLessons.length - 1}
                onClick={goNext}
              >
                บทถัดไป <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="w-80 border-l border-border bg-card overflow-y-auto shrink-0 hidden md:block">
            <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-display font-bold text-foreground">เนื้อหาคอร์ส</h3>
            </div>

            {course.modules.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                ยังไม่มีเนื้อหา
              </div>
            ) : (
              course.modules.map((module) => (
                <div key={module.id}>
                  <div className="p-3 bg-muted/30 border-b border-border">
                    <span className="text-sm font-medium text-foreground">{module.title}</span>
                  </div>
                  {module.lessons.map((lesson) => {
                    const LessonIcon = lessonIcons[lesson.type];
                    const isActive = activeLesson === lesson.id;
                    const isDone = completedLessons.includes(lesson.id) || lesson.completed;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border transition-colors ${
                          isActive
                            ? "bg-primary/5 border-l-2 border-l-primary"
                            : "hover:bg-muted/20"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-success shrink-0" />
                        ) : (
                          <LessonIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm truncate ${
                              isActive ? "text-primary font-medium" : "text-foreground"
                            }`}
                          >
                            {lesson.title}
                          </div>
                          <div className="text-xs text-muted-foreground">{lesson.duration}</div>
                        </div>
                      </button>
                    );
                  })}
                  {module.quiz && (
                    <Link
                      to={`/quiz/${module.quiz.id}`}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <Award className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-primary">{module.quiz.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {module.quiz.questions.length} ข้อ • {module.quiz.timeLimit} นาที
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPlayer;
