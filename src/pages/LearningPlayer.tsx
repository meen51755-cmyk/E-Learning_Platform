import { useParams, Link } from "react-router-dom";
import { sampleCourses } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validators, checkRateLimit } from "@/lib/sanitize";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft, ChevronRight, PlayCircle, FileText, File,
  CheckCircle, Award, MessageSquare, Bookmark,
  StickyNote, Menu, X, Download, Loader2, Trophy
} from "lucide-react";

const LearningPlayer = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const course = sampleCourses.find((c) => c.id === id) || sampleCourses[0];

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeLesson, setActiveLesson] = useState(course.modules[0]?.lessons[0]?.id || "");
  const [notes, setNotes] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState(true);

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson);
  const currentLesson = allLessons[currentIndex];
  const progress = allLessons.length > 0
    ? Math.round((completedLessons.size / allLessons.length) * 100)
    : 0;
  const lessonIcons = { video: PlayCircle, article: FileText, pdf: File };

  // ── โหลด progress เดิมจาก Supabase ──────────────────────────
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) { setLoadingProgress(false); return; }
      setLoadingProgress(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const { data } = await client
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .eq("completed", true);

      if (data) {
        const ids: string[] = (data as Array<{ lesson_id: string }>).map((r) => r.lesson_id);
        setCompletedLessons(new Set(ids));
      }
      setLoadingProgress(false);
    };
    loadProgress();
  }, [user, course.id]);

  // ── Mark lesson complete ──────────────────────────────────────
  // ✅ ใช้ ref เก็บ latest values เพื่อหลีกเลี่ยง infinite type instantiation
  const completedRef = useRef(completedLessons);
  completedRef.current = completedLessons;

  const markComplete = useCallback(async (lessonId: string) => {
    if (!lessonId || completedRef.current.has(lessonId)) return;

    setCompletedLessons((prev) => new Set([...prev, lessonId]));

    if (!user) return;

    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      course_id: course.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });

    const newProgress = Math.round(
      ((completedRef.current.size + 1) / allLessons.length) * 100
    );

    await supabase
      .from("enrollments")
      .update({ progress: newProgress, completed: newProgress >= 100 })
      .eq("user_id", user.id)
      .eq("course_id", course.id);

    if (newProgress >= 100) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "achievement",
        title: "🎉 เรียนจบคอร์สแล้ว!",
        message: `ยินดีด้วย! คุณเรียนจบคอร์ส "${course.title}" แล้ว`,
        link: "/certificate",
      });
      toast({
        title: "🎉 ยินดีด้วย! เรียนจบคอร์สแล้ว",
        description: "กดรับใบประกาศนียบัตรได้เลย",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, course.id, course.title, allLessons.length]);

  // mark อัตโนมัติเมื่อเปลี่ยนบท (article/pdf)
  useEffect(() => {
    if (currentLesson?.type !== "video") {
      markComplete(currentLesson?.id || "");
    }
  }, [activeLesson]);

  // ── บันทึก note ───────────────────────────────────────────────
  const handleSaveNote = async () => {
    if (!user) return;

    const check = validators.postContent(notes);
    if (!check.ok) {
      toast({ title: check.error, variant: "destructive" });
      return;
    }

    const rate = checkRateLimit(`save-note-${user.id}`, 10, 60000);
    if (!rate.allowed) {
      toast({ title: "บันทึก note ถี่เกินไป", variant: "destructive" });
      return;
    }

    setSavingNote(true);
    // TODO: สร้าง lesson_notes table แล้ว upsert จริง
    // await supabase.from("lesson_notes").upsert({
    //   user_id: user.id,
    //   lesson_id: activeLesson,
    //   course_id: course.id,
    //   content: check.value,
    // }, { onConflict: "user_id,lesson_id" });
    await new Promise((r) => setTimeout(r, 400));
    setSavingNote(false);
    toast({ title: "บันทึก note แล้ว ✓" });
  };

  // ── Navigation ────────────────────────────────────────────────
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

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>

          {/* Certificate button ถ้าจบแล้ว */}
          {progress >= 100 && (
            <Link to="/certificate">
              <Button variant="hero" size="sm">
                <Trophy className="w-4 h-4" /> รับ Certificate
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Main Content ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* Content Area */}
          <div className="bg-black aspect-video w-full flex items-center justify-center shrink-0">
            {loadingProgress ? (
              <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            ) : currentLesson?.type === "video" ? (
              <div className="text-center space-y-4">
                <PlayCircle className="w-20 h-20 text-white/30 mx-auto" />
                <p className="text-white/50 text-sm">{currentLesson.title}</p>
                <p className="text-white/30 text-xs">Video จะแสดงที่นี่เมื่อเชื่อมต่อ Storage</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white/60 hover:text-white hover:border-white/40"
                  onClick={() => markComplete(currentLesson.id)}
                  disabled={completedLessons.has(currentLesson.id)}
                >
                  {completedLessons.has(currentLesson.id)
                    ? <><CheckCircle className="w-4 h-4 mr-1 text-success" /> เสร็จแล้ว</>
                    : <><CheckCircle className="w-4 h-4 mr-1" /> Mark เสร็จแล้ว</>
                  }
                </Button>
              </div>
            ) : currentLesson?.type === "article" ? (
              <div className="bg-background w-full h-full overflow-y-auto p-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  {currentLesson.title}
                </h2>
                <p className="text-muted-foreground">
                  เนื้อหาบทความจะแสดงที่นี่เมื่อเชื่อมต่อ Database
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
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
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  {currentLesson?.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  บทที่ {currentIndex + 1} จาก {allLessons.length}
                  {completedLessons.has(currentLesson?.id ?? "")
                    ? " · ✅ เรียนแล้ว" : ""}
                </p>
              </div>
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
                  {savingNote
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : "บันทึก"}
                </Button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="จดบันทึกระหว่างเรียน..."
                maxLength={2000}
                className="w-full h-24 bg-muted rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground text-right">{notes.length}/2000</p>
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
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedLessons.size}/{allLessons.length} บทเรียน · {progress}%
              </p>
            </div>

            {course.modules.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">ยังไม่มีเนื้อหา</div>
            ) : (
              course.modules.map((module) => (
                <div key={module.id}>
                  <div className="p-3 bg-muted/30 border-b border-border">
                    <span className="text-sm font-medium text-foreground">{module.title}</span>
                  </div>
                  {module.lessons.map((lesson) => {
                    const LessonIcon = lessonIcons[lesson.type];
                    const isActive = activeLesson === lesson.id;
                    const isDone = completedLessons.has(lesson.id) || lesson.completed;
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
                        {isDone
                          ? <CheckCircle className="w-4 h-4 text-success shrink-0" />
                          : <LessonIcon className="w-4 h-4 text-muted-foreground shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate ${isActive ? "text-primary font-medium" : "text-foreground"}`}>
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
                          {module.quiz.questions.length} ข้อ · {module.quiz.timeLimit} นาที
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
