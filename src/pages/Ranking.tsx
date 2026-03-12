import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { sampleRanking } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, Crown, Clock } from "lucide-react";

const Ranking = () => {
  const { profile } = useAuth();

  // TODO: แทนด้วยข้อมูลจาก Supabase เมื่อมี quiz จริง
  // const { data: ranking } = useQuery(['ranking'], () => supabase.from('quiz_attempts').select(...))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold text-foreground">🏆 Ranking</h1>
          <p className="text-muted-foreground mt-2">อันดับผู้เรียนที่ทำคะแนนสูงสุด</p>
        </div>

        {/* Top 3 */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 mb-12">
          {/* อันดับ 2 */}
          <div className="card-elevated p-6 text-center w-full md:w-48 order-2 md:order-1">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center text-lg font-bold text-muted-foreground mb-3">
              {sampleRanking[1]?.name.charAt(0)}
            </div>
            <Medal className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">{sampleRanking[1]?.name}</p>
            <p className="text-2xl font-bold text-foreground">{sampleRanking[1]?.score}</p>
            <p className="text-xs text-muted-foreground">{sampleRanking[1]?.time}</p>
          </div>

          {/* อันดับ 1 */}
          <div className="card-elevated p-8 text-center w-full md:w-56 border-2 border-warning/30 bg-warning/5 order-1 md:order-2">
            <div className="w-20 h-20 rounded-full bg-warning/10 mx-auto flex items-center justify-center text-xl font-bold text-warning mb-3">
              {sampleRanking[0]?.name.charAt(0)}
            </div>
            <Crown className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="font-bold text-foreground">{sampleRanking[0]?.name}</p>
            <p className="text-3xl font-bold text-primary">{sampleRanking[0]?.score}</p>
            <p className="text-xs text-muted-foreground">{sampleRanking[0]?.time}</p>
          </div>

          {/* อันดับ 3 */}
          <div className="card-elevated p-6 text-center w-full md:w-48 order-3">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center text-lg font-bold text-muted-foreground mb-3">
              {sampleRanking[2]?.name.charAt(0)}
            </div>
            <Medal className="w-6 h-6 text-warning/60 mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">{sampleRanking[2]?.name}</p>
            <p className="text-2xl font-bold text-foreground">{sampleRanking[2]?.score}</p>
            <p className="text-xs text-muted-foreground">{sampleRanking[2]?.time}</p>
          </div>
        </div>

        {/* Full ranking table */}
        <div className="card-elevated overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">อันดับ</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">ผู้เรียน</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">คะแนน</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {sampleRanking.map((entry) => {
                // highlight row ถ้าเป็น user ปัจจุบัน (เทียบจากชื่อ mock ชั่วคราว)
                // TODO: เปลี่ยนเป็น entry.userId === user.id เมื่อมีข้อมูลจริง
                const isMe = profile?.full_name === entry.name;
                return (
                  <tr
                    key={entry.rank}
                    className={`border-b border-border transition-colors ${
                      isMe ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="p-4">
                      <span className={`font-bold ${entry.rank <= 3 ? "text-warning" : "text-muted-foreground"}`}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {entry.name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">
                          {entry.name}
                          {isMe && (
                            <span className="ml-2 text-xs text-primary font-normal">(คุณ)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-foreground">{entry.score}</td>
                    <td className="p-4 text-right text-muted-foreground hidden sm:table-cell">
                      <span className="flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        {entry.time}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          อันดับอัปเดตจากคะแนน Quiz จริง เมื่อระบบ Quiz พร้อมใช้งาน
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Ranking;
