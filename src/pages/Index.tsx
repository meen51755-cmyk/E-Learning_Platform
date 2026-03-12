import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseCard from "@/components/course/CourseCard";
import { useCourses } from "@/hooks/useCourses";
import heroImage from "@/assets/hero-learning.jpg";
import {
  BookOpen, Award, BarChart3, Users, Shield,
  Gamepad2, Globe, CheckCircle2, ArrowRight, Star,
  Play, TrendingUp, Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: courses, isLoading } = useCourses();
  const featuredCourses = (courses || []).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="E-Learning" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0" style={{ background: 'var(--hero-gradient)', opacity: 0.08 }} />
        </div>
        <div className="container mx-auto container-padding relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 py-20 lg:py-32">
            <div className="flex-1 space-y-6 text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Zap className="w-4 h-4" />
                แพลตฟอร์มการเรียนรู้ #1 ในประเทศไทย
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-foreground leading-tight">
                เรียนรู้ทักษะใหม่
                <br />
                <span className="gradient-text">ก้าวไปอีกขั้น</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                เรียนรู้จากผู้เชี่ยวชาญ ด้วยคอร์สคุณภาพกว่า 300+ คอร์ส
                พร้อมระบบ Quiz, Certificate, และ Ranking
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/courses">
                  <Button variant="hero" size="xl">
                    เริ่มเรียนเลย
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" size="xl">
                    <Play className="w-5 h-5" />
                    ดูคอร์สทั้งหมด
                  </Button>
                </Link>
              </div>
              {/* Stats */}
              <div className="flex items-center gap-8 justify-center lg:justify-start pt-4">
                <div>
                  <div className="text-2xl font-bold text-foreground">45K+</div>
                  <div className="text-sm text-muted-foreground">ผู้เรียน</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-foreground">300+</div>
                  <div className="text-sm text-muted-foreground">คอร์ส</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <div className="text-2xl font-bold text-foreground">4.8</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    คะแนนเฉลี่ย
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="flex-1 relative hidden lg:block animate-fade-in">
              <div className="relative">
                <img src={heroImage} alt="E-Learning Platform" className="rounded-2xl shadow-2xl w-full" />
                {/* Floating cards */}
                <div className="absolute -left-6 top-1/4 card-elevated p-4 animate-fade-in space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">อัตราสำเร็จ</div>
                      <div className="text-sm font-bold text-foreground">92%</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-6 bottom-1/4 card-elevated p-4 animate-fade-in space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Certificates</div>
                      <div className="text-sm font-bold text-foreground">12K+</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container mx-auto container-padding">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              ทำไมต้องเลือก <span className="gradient-text">LearnHub</span>
            </h2>
            <p className="text-muted-foreground">
              ระบบการเรียนรู้ครบวงจร พร้อมเครื่องมือที่ช่วยให้คุณเรียนรู้ได้อย่างมีประสิทธิภาพ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "คอร์สคุณภาพ", desc: "เนื้อหาจากผู้เชี่ยวชาญ Video, PDF, Article", color: "text-primary" },
              { icon: BarChart3, title: "Learning Analytics", desc: "วิเคราะห์ผลการเรียน ติดตามความก้าวหน้า", color: "text-accent" },
              { icon: Award, title: "Certificate", desc: "ใบรับรองเมื่อเรียนจบ ดาวน์โหลดได้ทันที", color: "text-warning" },
              { icon: Gamepad2, title: "Gamification", desc: "Badge, Streak, Ranking เพิ่มแรงจูงใจ", color: "text-success" },
              { icon: Shield, title: "Anti-Cheat", desc: "ระบบป้องกันโกงข้อสอบ ผลสอบน่าเชื่อถือ", color: "text-destructive" },
              { icon: Globe, title: "หลายภาษา", desc: "รองรับภาษาไทยและภาษาอังกฤษ", color: "text-primary" },
              { icon: Users, title: "Community", desc: "Discussion, Messaging, Course Review", color: "text-accent" },
              { icon: CheckCircle2, title: "ระบบสอบ", desc: "Multiple Choice, Essay, Question Bank", color: "text-warning" },
            ].map((feature, i) => (
              <div key={i} className="card-elevated p-6 text-center space-y-3 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center bg-muted ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground">คอร์สแนะนำ</h2>
              <p className="text-muted-foreground mt-1">คอร์สยอดนิยมที่ผู้เรียนเลือกมากที่สุด</p>
            </div>
            <Link to="/courses">
              <Button variant="outline">
                ดูทั้งหมด <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? [1,2,3].map(i => (
              <div key={i} className="card-elevated">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            )) : featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container mx-auto container-padding">
          <div className="rounded-2xl p-12 text-center text-primary-foreground relative overflow-hidden" style={{ background: 'var(--hero-gradient)' }}>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                พร้อมเริ่มต้นเรียนรู้แล้วหรือยัง?
              </h2>
              <p className="text-primary-foreground/80 text-lg">
                สมัครสมาชิกฟรีวันนี้ เข้าถึงคอร์สฟรีมากมาย พร้อมรับ Certificate
              </p>
              <Link to="/register">
                <Button size="xl" className="bg-background text-foreground hover:bg-background/90 shadow-lg font-semibold mt-4">
                  สมัครฟรี <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
