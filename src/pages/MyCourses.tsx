import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus, BookOpen, Users, Edit2, Trash2,
  Eye, EyeOff, Loader2, BarChart2, DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  is_free: boolean;
  price: number;
  status: string;
  thumbnail_url: string | null;
  total_lessons: number;
  total_students: number;
  rating: number;
  created_at: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

const MyCourses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const fetchCourses = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false });
    setCourses(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, [user]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`my-courses-${user.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "courses",
        filter: `instructor_id=eq.${user.id}`,
      }, () => fetchCourses())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Toggle publish/draft
  const handleToggleStatus = async (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("courses")
      .update({ status: newStatus })
      .eq("id", courseId);
    if (error) {
      toast({ title: "เปลี่ยน status ไม่สำเร็จ", variant: "destructive" });
    } else {
      toast({ title: newStatus === "published" ? "เผยแพร่แล้ว ✓" : "ซ่อนคอร์สแล้ว ✓" });
    }
  };

  // Delete course
  const handleDelete = async (courseId: string) => {
    if (!confirm("ยืนยันการลบคอร์สนี้?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) {
      toast({ title: "ลบไม่สำเร็จ", variant: "destructive" });
    } else {
      toast({ title: "ลบคอร์สสำเร็จ ✓" });
    }
  };

  const filtered = courses.filter((c) =>
    filter === "all" ? true : c.status === filter
  );

  const totalStudents = courses.reduce((s, c) => s + c.total_students, 0);
  const totalRevenue = courses.reduce((s, c) => s + (c.is_free ? 0 : c.price * c.total_students), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">คอร์สของฉัน</h1>
            <p className="text-sm text-muted-foreground">{courses.length} คอร์สทั้งหมด</p>
          </div>
          <Link to="/instructor/courses/create">
            <Button variant="hero">
              <Plus className="w-4 h-4" /> สร้างคอร์สใหม่
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, label: "คอร์สทั้งหมด", value: courses.length, color: "text-primary", bg: "bg-primary/10" },
            { icon: Users, label: "ผู้เรียนทั้งหมด", value: totalStudents.toLocaleString(), color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: DollarSign, label: "รายได้ประมาณ", value: formatCurrency(totalRevenue), color: "text-success", bg: "bg-success/10" },
          ].map((s) => (
            <div key={s.label} className="card-elevated p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
          {[
            { id: "all" as const, label: "ทั้งหมด" },
            { id: "published" as const, label: "เผยแพร่แล้ว" },
            { id: "draft" as const, label: "Draft" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === f.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Course list */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-elevated p-16 text-center space-y-4">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">ยังไม่มีคอร์ส</p>
            <Link to="/instructor/courses/create">
              <Button variant="hero">สร้างคอร์สแรกเลย</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((course) => (
              <div key={course.id} className="card-elevated p-5 flex items-center gap-4 hover:shadow-md transition-all flex-wrap">
                {/* Thumbnail */}
                <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-muted-foreground opacity-40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">{course.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      course.status === "published"
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {course.status === "published" ? "เผยแพร่แล้ว" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{course.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {course.total_lessons} บทเรียน
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {course.total_students} ผู้เรียน
                    </span>
                    <span>•</span>
                    <span className={course.is_free ? "text-success font-medium" : "text-foreground font-medium"}>
                      {course.is_free ? "ฟรี" : formatCurrency(course.price)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/instructor/courses/${course.id}/students`}>
                    <Button variant="ghost" size="icon" title="ดูผู้เรียน">
                      <BarChart2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={course.status === "published" ? "ซ่อน" : "เผยแพร่"}
                    onClick={() => handleToggleStatus(course.id, course.status)}
                  >
                    {course.status === "published"
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </Button>
                  <Link to={`/instructor/courses/${course.id}/edit`}>
                    <Button variant="ghost" size="icon" title="แก้ไข">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="ลบ"
                    onClick={() => handleDelete(course.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
