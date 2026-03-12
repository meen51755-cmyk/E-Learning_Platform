import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { sampleCourses } from "@/data/mockData";
import { Award, Download, Share2, ArrowLeft, CheckCircle } from "lucide-react";

const Certificate = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const certRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // ดึง courseId จาก URL ?course=1 หรือใช้คอร์สแรกเป็น fallback
  const courseId = searchParams.get("course") || "1";
  const course = sampleCourses.find((c) => c.id === courseId) || sampleCourses[0];

  const recipientName = profile?.full_name || user?.email?.split("@")[0] || "ผู้เรียน";
  const certId = `CERT-${courseId}-${user?.id?.slice(0, 8).toUpperCase() || "XXXXXXXX"}`;
  const issueDate = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Share link ──────────────────────────────────────────────
  const handleShare = async () => {
    const url = `${window.location.origin}/certificate?course=${courseId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Download (print as PDF) ─────────────────────────────────
  const handleDownload = () => {
    window.print();
    // TODO: แทนด้วย html2canvas + jsPDF เมื่อต้องการ PDF จริง:
    // import html2canvas from 'html2canvas'; import jsPDF from 'jspdf';
    // const canvas = await html2canvas(certRef.current);
    // const pdf = new jsPDF('landscape'); pdf.addImage(...); pdf.save('certificate.pdf');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto container-padding py-8 max-w-4xl">
        <Link
          to="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> กลับไป Dashboard
        </Link>

        <div className="text-center mb-8 space-y-2">
          <h1 className="text-2xl font-display font-bold text-foreground">ใบประกาศนียบัตร</h1>
          <p className="text-muted-foreground">ยินดีด้วย! คุณเรียนจบคอร์สนี้แล้ว 🎉</p>
        </div>

        {/* ── Certificate ─────────────────────────────────────── */}
        <div
          ref={certRef}
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none"
          style={{ aspectRatio: "1.414 / 1" }} // A4 landscape ratio
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #f0f4ff 0%, #fefefe 50%, #fff8f0 100%)",
            }}
          />

          {/* Border decoration */}
          <div className="absolute inset-3 rounded-xl border-2 border-primary/20 pointer-events-none" />
          <div className="absolute inset-4 rounded-xl border border-primary/10 pointer-events-none" />

          {/* Corner ornaments */}
          {["top-6 left-6", "top-6 right-6", "bottom-6 left-6", "bottom-6 right-6"].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-8 h-8 text-primary/30 flex items-center justify-center text-xl`}
            >
              ✦
            </div>
          ))}

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-12 py-8 text-center">
            {/* Logo / Icon */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Award className="w-9 h-9 text-primary" />
            </div>

            {/* Header */}
            <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase mb-1">
              LearnHub
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ color: "#1a1a2e", fontFamily: "Georgia, serif" }}
            >
              Certificate of Completion
            </h2>

            <p className="text-sm text-muted-foreground mb-4">ใบประกาศนียบัตรนี้มอบให้แก่</p>

            {/* Recipient */}
            <h3
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: "#1a1a2e",
                fontFamily: "Georgia, serif",
                borderBottom: "2px solid #e2e8f0",
                paddingBottom: "12px",
                minWidth: "300px",
              }}
            >
              {recipientName}
            </h3>

            <p className="text-sm text-muted-foreground mb-2">
              ได้ผ่านการเรียนและสอบผ่านคอร์ส
            </p>

            {/* Course name */}
            <p
              className="text-lg md:text-xl font-semibold mb-1"
              style={{ color: "#2563eb" }}
            >
              {course.title}
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              สอนโดย {course.instructor} • {course.duration} • {course.totalLessons} บทเรียน
            </p>

            {/* Footer row */}
            <div className="flex items-center justify-between w-full max-w-lg">
              <div className="text-center">
                <div
                  className="w-32 border-b-2 border-gray-400 mb-1"
                  style={{ fontFamily: "cursive", fontSize: 20, color: "#1a1a2e" }}
                >
                  LearnHub
                </div>
                <p className="text-xs text-muted-foreground">ผู้อำนวยการ</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <CheckCircle className="w-8 h-8 text-success" />
                <p className="text-xs text-muted-foreground">ผ่านการรับรอง</p>
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">{issueDate}</p>
                <p className="text-xs text-muted-foreground">วันที่ออกใบประกาศ</p>
              </div>
            </div>

            {/* Cert ID */}
            <p className="absolute bottom-4 right-6 text-xs text-muted-foreground/50 font-mono">
              {certId}
            </p>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Button variant="hero" onClick={handleDownload}>
            <Download className="w-4 h-4" /> ดาวน์โหลด PDF
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            {copied ? "คัดลอกลิงก์แล้ว ✓" : "แชร์ใบประกาศ"}
          </Button>
          <Link to="/ranking">
            <Button variant="outline">ดูอันดับของฉัน</Button>
          </Link>
        </div>

        {/* Cert ID display */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          รหัสใบประกาศ: <span className="font-mono">{certId}</span>
        </p>
      </div>

      {/* Print style */}
      <style>{`
        @media print {
          nav, footer, .print\\:hidden { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default Certificate;
