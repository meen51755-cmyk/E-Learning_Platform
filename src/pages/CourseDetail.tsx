import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { sampleCourses } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { checkRateLimit } from "@/lib/sanitize";
import {
  Star, Users, Clock, PlayCircle, BookOpen, Award,
  ChevronDown, ChevronRight, FileText, Video, File,
  CheckCircle, ArrowRight, Lock, Loader2
} from "lucide-react";
import { useState, useEffect } from "react";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { log } = useAuditLog();

  const course = sampleCourses.find((c) => c.id === id) || sampleCourses[0];
  const [expandedModules, setExpandedModules] = useState<string[]>([
    course.modules[0]?.id || "",
  ]);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnroll, setCheckingEnroll] = useState(true);

  // ── เช็คว่า user สมัครแล้วหรือยัง ──────────────────────────
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user) { setCheckingEnroll(false); return; }
      const { data } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .single();
      setIsEnrolled(!!data);
      setCheckingEnroll(false);
    };
    checkEnrollment();
  }, [user, course.id]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((i) => i !== moduleId)
        : [...prev, moduleId]
    );
  };

  // ── Enroll จริงลง Supabase ────────────────────────────────
  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบก่อน",
        description: "คุณต้อง login ก่อนจึงจะลงทะเบียนได้",
        variant: "destructive",
      });
      navigate("/login", { state: { from: `/courses/${course.id}` } });
      return;
    }

    // สมัครแล้ว → ไปเรียนเลย
    if (isEnrolled) {
      navigate(`/learn/${course.id}`);
      return;
    }

    // คอร์สมีค่าใช้จ่าย → ไปหน้า Payment
    if (!course.isFree) {
      navigate(`/payment?course=${course.id}`);
      return;
    }

    // ✅ rate limit
    const rate = checkRateLimit(`enroll-${user.id}`, 10, 3600000);
    if (!rate.allowed) {
      toast({ title: "สมัครถี่เกินไป กรุณารอสักครู่", variant: "destructive" });
      return;
    }

    setEnrolling(true);

    // ✅ บันทึก enrollment ลง Supabase
    const { error } = await supabase
      .from("enrollments")
      .insert({ user_id: user.id, course_id: course.id, progress: 0, completed: false });

    if (error) {
      if (error.code === "23505") {
        setIsEnrolled(true);
        navigate(`/learn/${course.id}`);
        return;
      }
      toast({ title: "สมัครไม่สำเร็จ", description: error.message, variant: "destructive" });
      setEnrolling(false);
      return;
    }

    // ✅ บันทึก notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "new_course",
      title: `✅ ลงทะเบียนสำเร็จ!`,
      message: `คุณได้ลงทะเบียนคอร์ส "${course.title}" แล้ว`,
      link: `/learn/${course.id}`,
    });

    log("register_success", { action: "course_enrolled", course_id: course.id });

    setIsEnrolled(true);
    setEnrolling(false);
    toast({ title: "ลงทะเบียนสำเร็จ! 🎉", description: `ยินดีต้อนรับสู่คอร์ส ${course.title}` });
    navigate(`/learn/${course.id}`);
  };

  const lessonIcons = { video: Video, article: FileText, pdf: File };

  const enrollBtnLabel = () => {
    if (checkingEnroll) return <><Loader2 className="w-4 h-4 animate-spin" /> กำลังโหลด...</>;
    if (enrolling) return <><Loader2 className="w-4 h-4 animate-spin" /> กำลังสมัคร...</>;
    if (isEnrolled) return <>เรียนต่อ <ArrowRight className="w-4 h-4" /></>;
    if (course.isFree) return <>เริ่มเรียนเลย <ArrowRight className="w-4 h-4" /></>;
    return <>ลงทะเบียนเรียน <ArrowRight className="w-4 h-4" /></>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative py-12" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4 text-primary-foreground">
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Link to="/courses" className="hover:underline">คอร์สเรียน</Link>
                <ChevronRight className="w-4 h-4" />
                <span>{course.category}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">{course.title}</h1>
              <p className="text-lg opacity-90">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-warning text-warning" /> {course.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {course.totalStudents.toLocaleString()} ผู้เรียน
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> {course.totalLessons} บทเรียน
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-medium">
                  {course.instructor.charAt(0)}
                </div>
                <span className="text-sm">{course.instructor}</span>
              </div>
            </div>

            <div className="card-elevated p-6 space-y-4 self-start">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-primary" />
              </div>
              <div className="text-center">
                {isEnrolled ? (
                  <div className="text-sm font-medium text-success flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> ลงทะเบียนแล้ว
                  </div>
                ) : course.isFree ? (
                  <div className="text-2xl font-bold text-success">ฟรี</div>
                ) : (
                  <div className="text-2xl font-bold text-foreground">
                    ฿{course.price.toLocaleString()}
                  </div>
                )}
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleEnroll}
                disabled={enrolling || checkingEnroll}
              >
                {enrollBtnLabel()}
              </Button>

              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  <Lock className="w-3 h-3 inline mr-1" />
                  ต้อง{" "}
                  <Link to="/login" className="text-primary hover:underline">เข้าสู่ระบบ</Link>
                  {" "}ก่อนลงทะเบียน
                </p>
              )}

              <div className="space-y-2 text-sm text-muted-foreground">
                {[
                  "เข้าถึงเนื้อหาตลอดชีพ",
                  "Certificate เมื่อเรียนจบ",
                  "แบบทดสอบท้ายบท",
                  "เอกสารประกอบดาวน์โหลด",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto container-padding py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="card-elevated p-6">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">สิ่งที่จะได้เรียนรู้</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["เข้าใจพื้นฐานอย่างแน่น","ปฏิบัติจริงผ่านโปรเจกต์","เตรียมพร้อมสู่การทำงาน","ได้ Certificate รับรอง"].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-4">เนื้อหาคอร์ส</h2>
              {course.modules.length === 0 ? (
                <div className="card-elevated p-8 text-center text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>เนื้อหาคอร์สกำลังเตรียมการ</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.modules.map((module) => (
                    <div key={module.id} className="card-elevated overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedModules.includes(module.id)
                            ? <ChevronDown className="w-5 h-5 text-primary" />
                            : <ChevronRight className="w-5 h-5" />}
                          <span className="font-medium text-foreground text-left">{module.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{module.lessons.length} บทเรียน</span>
                      </button>

                      {expandedModules.includes(module.id) && (
                        <div className="border-t border-border">
                          {module.lessons.map((lesson) => {
                            const LessonIcon = lessonIcons[lesson.type];
                            return (
                              <div key={lesson.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-3">
                                  {lesson.completed
                                    ? <CheckCircle className="w-4 h-4 text-success" />
                                    : <LessonIcon className="w-4 h-4 text-muted-foreground" />}
                                  <span className={`text-sm ${lesson.completed ? "text-muted-foreground" : "text-foreground"}`}>
                                    {lesson.title}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                              </div>
                            );
                          })}
                          {module.quiz && (
                            <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-t border-border">
                              <div className="flex items-center gap-3">
                                <Award className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-primary">{module.quiz.title}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{module.quiz.questions.length} ข้อ</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-display font-bold text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
