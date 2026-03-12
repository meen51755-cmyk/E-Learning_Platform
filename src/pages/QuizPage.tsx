/**
 * QuizPage — หน้าทำแบบทดสอบ
 * ตอนนี้ใช้ mockData ก่อน พอมี course จริงค่อยสลับตาม comment # TODO
 */
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { sampleCourses } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import {
  Timer, AlertTriangle, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, Flag, ShieldAlert
} from "lucide-react";

const QuizPage = () => {
  const { id } = useParams(); // quiz id
  const { user } = useAuth();
  const navigate = useNavigate();

  // TODO: แทนด้วย useQuery ดึง quiz จาก Supabase เมื่อมี course จริง
  // ตอนนี้ค้นหาจาก mockData ทุก module ของทุก course
  const quizData = sampleCourses
    .flatMap((c) => c.modules)
    .flatMap((m) => (m.quiz ? [m.quiz] : []))
    .find((q) => q.id === id)
    || sampleCourses[0].modules[1]?.quiz; // fallback

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    quizData?.timeLimit ? quizData.timeLimit * 60 : 1800
  );
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // ── Anti-Cheat: Tab Switch ─────────────────────────────────
  useEffect(() => {
    if (!started || submitted) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          if (next >= 3) setSubmitted(true);
          return next;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [started, submitted]);

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (!started || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { setSubmitted(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, submitted]);

  // ── Fullscreen ─────────────────────────────────────────────
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  // ── ส่งคำตอบ (TODO: บันทึกลง Supabase) ────────────────────
  const handleSubmit = async () => {
    // TODO: await supabase.from('quiz_attempts').insert({ user_id: user.id, quiz_id: id, answers, score: percentage })
    setSubmitted(true);
  };

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">ไม่พบแบบทดสอบ</p>
          <Button variant="outline" onClick={() => navigate(-1)}>กลับ</Button>
        </div>
      </div>
    );
  }

  const questions = quizData.questions;
  const question = questions[currentQuestion];

  const score = questions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctAnswer ? 1 : 0);
  }, 0);
  const percentage = Math.round((score / questions.length) * 100);

  // ── หน้าเริ่มต้น ───────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center container-padding">
        <div className="card-elevated p-8 max-w-lg w-full text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Flag className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">{quizData.title}</h1>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>จำนวนข้อ: <span className="text-foreground font-medium">{questions.length} ข้อ</span></p>
            <p>เวลา: <span className="text-foreground font-medium">{quizData.timeLimit} นาที</span></p>
            <p>จำนวนครั้งที่ทำได้: <span className="text-foreground font-medium">{quizData.attemptLimit} ครั้ง</span></p>
          </div>

          <div className="p-4 rounded-lg bg-warning/5 border border-warning/20 text-left">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">กฎการสอบ</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>• ห้ามสลับแท็บระหว่างทำข้อสอบ (สลับ 3 ครั้งส่งอัตโนมัติ)</li>
                  <li>• เมื่อส่งแล้วไม่สามารถแก้ไขได้</li>
                  <li>• ผ่านเกณฑ์ที่ 70%</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => { setStarted(true); enterFullscreen(); }}
          >
            เริ่มทำข้อสอบ <ArrowRight className="w-4 h-4" />
          </Button>

          <button
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← กลับ
          </button>
        </div>
      </div>
    );
  }

  // ── หน้าผลลัพธ์ ────────────────────────────────────────────
  if (submitted) {
    const passed = percentage >= 70;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center container-padding">
        <div className="card-elevated p-8 max-w-lg w-full text-center space-y-6 animate-scale-in">
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${passed ? "bg-success/10" : "bg-destructive/10"}`}>
            {passed
              ? <CheckCircle className="w-10 h-10 text-success" />
              : <XCircle className="w-10 h-10 text-destructive" />
            }
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {passed ? "ยินดีด้วย! คุณผ่าน! 🎉" : "เสียใจด้วย ลองอีกครั้งนะ"}
          </h1>
          <div className="text-5xl font-bold text-primary">{percentage}%</div>
          <p className="text-muted-foreground">คะแนน {score}/{questions.length} ข้อ</p>

          {/* Review */}
          <div className="text-left space-y-3 max-h-64 overflow-y-auto">
            {questions.map((q, i) => {
              const isCorrect = answers[q.id] === q.correctAnswer;
              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-lg border text-sm ${
                    isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <p className="font-medium text-foreground">ข้อ {i + 1}: {q.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    คำตอบของคุณ:{" "}
                    <span className={isCorrect ? "text-success" : "text-destructive"}>
                      {q.choices?.find((c) => c.id === answers[q.id])?.text || "ไม่ได้ตอบ"}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-success mt-0.5">
                      เฉลย: {q.choices?.find((c) => c.id === q.correctAnswer)?.text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Link to="/ranking" className="flex-1">
              <Button variant="outline" className="w-full">ดู Ranking</Button>
            </Link>
            {passed && (
              <Link to="/certificate" className="flex-1">
                <Button variant="hero" className="w-full">รับ Certificate</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── หน้าทำข้อสอบ ───────────────────────────────────────────
  const timeWarning = timeLeft <= 60;

  return (
    <div className="min-h-screen bg-background">
      {/* Anti-cheat warning */}
      {tabSwitchCount > 0 && (
        <div className="sticky top-0 z-[60] bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm">
          <ShieldAlert className="w-4 h-4 inline mr-1" />
          คำเตือน: คุณสลับแท็บแล้ว {tabSwitchCount}/3 ครั้ง
          {tabSwitchCount < 3 && ` — อีก ${3 - tabSwitchCount} ครั้งจะส่งอัตโนมัติ`}
        </div>
      )}

      {/* Timer bar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="container mx-auto max-w-3xl flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{quizData.title}</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              ข้อ {currentQuestion + 1}/{questions.length}
            </span>
            <div className={`flex items-center gap-1 text-sm font-medium ${timeWarning ? "text-destructive animate-pulse" : "text-warning"}`}>
              <Timer className="w-4 h-4" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto container-padding py-8 max-w-3xl">
        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="space-y-6 animate-fade-in" key={question.id}>
          <h2 className="text-xl font-display font-bold text-foreground">
            ข้อ {currentQuestion + 1}. {question.text}
          </h2>

          <div className="space-y-3">
            {question.choices?.map((choice) => {
              const isSelected = answers[question.id] === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() => setAnswers({ ...answers, [question.id]: choice.id })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium shrink-0 transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    }`}>
                      {choice.id.toUpperCase()}
                    </div>
                    <span className="text-foreground">{choice.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            disabled={currentQuestion <= 0}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
          >
            <ArrowLeft className="w-4 h-4" /> ข้อก่อนหน้า
          </Button>
          {currentQuestion < questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
              ข้อถัดไป <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="hero" onClick={handleSubmit}>
              ส่งคำตอบ <Flag className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-8 card-elevated p-4">
          <p className="text-sm font-medium text-foreground mb-3">ตัวนำทาง</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(i)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  i === currentQuestion
                    ? "bg-primary text-primary-foreground"
                    : answers[q.id]
                    ? "bg-success/10 text-success border border-success/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ตอบแล้ว {Object.keys(answers).length}/{questions.length} ข้อ
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
