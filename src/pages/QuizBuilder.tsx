import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validators } from "@/lib/sanitize";
import {
  Plus, Trash2, ArrowLeft, Save, Award,
  CheckCircle, Loader2, HelpCircle, Clock,
  ChevronDown, ChevronUp
} from "lucide-react";

interface Choice { id: string; text: string; }
interface Question {
  id: string;
  question_text: string;
  choices: Choice[];
  correct_answer: string;
  explanation: string;
  time_limit: number;
  order_index: number;
}

const QuizBuilder = () => {
  const { id } = useParams(); // course id
  const { toast } = useToast();

  const [courseName, setCourseName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // New question template
  const newQuestionTemplate = (): Omit<Question, "id"> => ({
    question_text: "",
    choices: [
      { id: "a", text: "" },
      { id: "b", text: "" },
      { id: "c", text: "" },
      { id: "d", text: "" },
    ],
    correct_answer: "a",
    explanation: "",
    time_limit: 30,
    order_index: questions.length,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);

    const [{ data: course }, { data: qs }] = await Promise.all([
      db.from("courses").select("title").eq("id", id).single(),
      db.from("quiz_questions").select("*").eq("course_id", id).order("order_index"),
    ]);

    if (course) setCourseName(course.title);
    if (qs) {
      setQuestions((qs as any[]).map((q) => ({
        ...q,
        choices: q.choices ?? [],
        explanation: q.explanation ?? "",
      })));
      if (qs.length > 0) setExpanded(new Set([qs[0].id]));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  // ── เพิ่มคำถามใหม่ ──────────────────────────────────────────
  const handleAddQuestion = async () => {
    const template = newQuestionTemplate();
    const { data, error } = await db
      .from("quiz_questions")
      .insert({
        course_id: id,
        question_text: "คำถามใหม่",
        choices: template.choices,
        correct_answer: "a",
        explanation: "",
        time_limit: 30,
        order_index: questions.length,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "เพิ่มคำถามไม่สำเร็จ", variant: "destructive" });
      return;
    }
    const newQ = { ...data, choices: data.choices ?? [], explanation: data.explanation ?? "" };
    setQuestions((prev) => [...prev, newQ]);
    setExpanded((prev) => new Set([...prev, data.id]));
  };

  // ── บันทึกคำถาม ─────────────────────────────────────────────
  const handleSaveQuestion = async (q: Question) => {
    const check = validators.postContent(q.question_text);
    if (!check.ok) {
      toast({ title: check.error, variant: "destructive" });
      return;
    }
    if (q.choices.some((c) => !c.text.trim())) {
      toast({ title: "กรุณากรอกตัวเลือกให้ครบทุกข้อ", variant: "destructive" });
      return;
    }

    setSaving(q.id);
    const { error } = await db
      .from("quiz_questions")
      .update({
        question_text: check.value,
        choices: q.choices,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        time_limit: q.time_limit,
      })
      .eq("id", q.id);
    setSaving(null);

    if (error) toast({ title: "บันทึกไม่สำเร็จ", variant: "destructive" });
    else toast({ title: "บันทึกสำเร็จ ✓" });
  };

  // ── ลบคำถาม ─────────────────────────────────────────────────
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("ลบคำถามนี้?")) return;
    const { error } = await db.from("quiz_questions").delete().eq("id", qId);
    if (error) toast({ title: "ลบไม่สำเร็จ", variant: "destructive" });
    else {
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
      toast({ title: "ลบคำถามสำเร็จ ✓" });
    }
  };

  // ── อัปเดต state ────────────────────────────────────────────
  const updateQuestion = (qId: string, field: keyof Question, value: any) => {
    setQuestions((prev) => prev.map((q) => q.id === qId ? { ...q, [field]: value } : q));
  };

  const updateChoice = (qId: string, choiceId: string, text: string) => {
    setQuestions((prev) => prev.map((q) => q.id === qId
      ? { ...q, choices: q.choices.map((c) => c.id === choiceId ? { ...c, text } : c) }
      : q
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link to={`/instructor/courses/${id}/edit`}>
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Quiz Builder</h1>
              <p className="text-sm text-muted-foreground">{courseName} · {questions.length} คำถาม</p>
            </div>
          </div>
          <Button variant="hero" onClick={handleAddQuestion}>
            <Plus className="w-4 h-4" /> เพิ่มคำถาม
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="card-elevated p-16 text-center space-y-4">
            <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">ยังไม่มีคำถาม</p>
            <Button variant="hero" onClick={handleAddQuestion}>
              <Plus className="w-4 h-4" /> เพิ่มคำถามแรก
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="card-elevated overflow-hidden">
                {/* Question header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(q.id)) next.delete(q.id); else next.add(q.id);
                    return next;
                  })}
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {idx + 1}
                  </div>
                  <p className="flex-1 text-sm font-medium text-foreground line-clamp-1">
                    {q.question_text || "คำถามใหม่..."}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {q.time_limit}s
                    </span>
                    {expanded.has(q.id)
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Question editor */}
                {expanded.has(q.id) && (
                  <div className="p-5 border-t border-border space-y-4">
                    {/* Question text */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">คำถาม <span className="text-destructive">*</span></label>
                      <textarea
                        value={q.question_text}
                        onChange={(e) => updateQuestion(q.id, "question_text", e.target.value)}
                        placeholder="พิมพ์คำถาม..."
                        rows={2}
                        maxLength={500}
                        className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    {/* Choices */}
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground block">ตัวเลือก (เลือกตัวเลือกที่ถูกต้อง)</label>
                      {q.choices.map((choice) => (
                        <div key={choice.id} className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuestion(q.id, "correct_answer", choice.id)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                              q.correct_answer === choice.id
                                ? "border-success bg-success text-white"
                                : "border-border text-muted-foreground hover:border-success/50"
                            }`}
                          >
                            {q.correct_answer === choice.id
                              ? <CheckCircle className="w-4 h-4" />
                              : choice.id.toUpperCase()}
                          </button>
                          <Input
                            value={choice.text}
                            onChange={(e) => updateChoice(q.id, choice.id, e.target.value)}
                            placeholder={`ตัวเลือก ${choice.id.toUpperCase()}`}
                            maxLength={200}
                            className={`input-focus flex-1 ${q.correct_answer === choice.id ? "border-success/50 bg-success/5" : ""}`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Explanation + Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">คำอธิบายเฉลย</label>
                        <Input
                          value={q.explanation}
                          onChange={(e) => updateQuestion(q.id, "explanation", e.target.value)}
                          placeholder="อธิบายว่าทำไมถึงถูก..."
                          maxLength={300}
                          className="input-focus"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">เวลา (วินาที/ข้อ)</label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={q.time_limit}
                            onChange={(e) => updateQuestion(q.id, "time_limit", Number(e.target.value))}
                            type="number"
                            min={10}
                            max={300}
                            className="input-focus"
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">วินาที</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        <Trash2 className="w-4 h-4" /> ลบคำถาม
                      </Button>
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleSaveQuestion(q)}
                        disabled={saving === q.id}
                      >
                        {saving === q.id
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> บันทึก...</>
                          : <><Save className="w-3.5 h-3.5" /> บันทึก</>}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBuilder;
