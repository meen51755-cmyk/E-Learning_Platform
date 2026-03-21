import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, Search, CheckCircle, Clock, TrendingUp, Loader2 } from "lucide-react";

interface StudentProgress {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  progress: number;
  completed: boolean;
  enrolled_at: string;
  updated_at: string;
}

const StudentList = () => {
  const { id } = useParams(); // course id
  const [courseName, setCourseName] = useState("");
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;

      const [{ data: course }, { data: enrollments }] = await Promise.all([
        db.from("courses").select("title").eq("id", id).single(),
        db.from("enrollments").select("*").eq("course_id", id).order("enrolled_at", { ascending: false }),
      ]);

      if (course) setCourseName(course.title);

      if (enrollments && enrollments.length > 0) {
        const userIds = enrollments.map((e) => e.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);

        const profileMap = Object.fromEntries(
          (profiles ?? []).map((p) => [p.user_id, p])
        );

        setStudents(
          enrollments.map((e) => ({
            user_id: e.user_id,
            full_name: profileMap[e.user_id]?.full_name ?? "ผู้เรียน",
            avatar_url: profileMap[e.user_id]?.avatar_url ?? null,
            progress: e.progress,
            completed: e.completed,
            enrolled_at: e.enrolled_at,
            updated_at: e.updated_at ?? e.enrolled_at,
          }))
        );
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const filtered = students.filter((s) =>
    (s.full_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const completedCount = students.filter((s) => s.completed).length;
  const avgProgress = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8 max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <Link to="/instructor/courses">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">รายชื่อผู้เรียน</h1>
            <p className="text-sm text-muted-foreground">{courseName}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: "ผู้เรียนทั้งหมด", value: students.length, color: "text-primary", bg: "bg-primary/10" },
            { icon: CheckCircle, label: "เรียนจบแล้ว", value: completedCount, color: "text-success", bg: "bg-success/10" },
            { icon: TrendingUp, label: "ความคืบหน้าเฉลี่ย", value: `${avgProgress}%`, color: "text-amber-500", bg: "bg-amber-500/10" },
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

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาผู้เรียน..."
            className="pl-10 input-focus"
            maxLength={100}
          />
        </div>

        {/* Student list */}
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-elevated p-16 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-3" />
            <p className="text-muted-foreground">ยังไม่มีผู้เรียน</p>
          </div>
        ) : (
          <div className="card-elevated overflow-hidden">
            <div className="divide-y divide-border">
              {filtered.map((student) => (
                <div key={student.user_id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  {/* Avatar */}
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {(student.full_name ?? "?").charAt(0)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{student.full_name ?? "ผู้เรียน"}</p>
                      {student.completed && (
                        <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-32">
                        <div
                          className={`h-full rounded-full transition-all ${student.completed ? "bg-success" : "bg-primary"}`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{student.progress}%</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      สมัคร {new Date(student.enrolled_at).toLocaleDateString("th-TH")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      อัปเดต {new Date(student.updated_at).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
