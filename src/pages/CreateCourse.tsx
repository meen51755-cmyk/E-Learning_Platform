/**
 * ============================================================
 * CREATE COURSE PAGE — Instructor Course Builder
 * ============================================================
 * 
 * ## การ Import ไฟล์สอน (Video, PDF, Resources)
 * 
 * เมื่อเชื่อมต่อ Backend แล้ว ให้เปลี่ยนจาก mock เป็นการอัพโหลดจริง:
 * 
 * ```tsx
 * // import { supabase } from "@/integrations/supabase/client";
 * 
 * // อัพโหลด Video:
 * // const { data, error } = await supabase.storage
 * //   .from('course-videos')
 * //   .upload(`courses/${courseId}/${lessonId}.mp4`, videoFile);
 * 
 * // อัพโหลด PDF:
 * // const { data, error } = await supabase.storage
 * //   .from('course-materials')
 * //   .upload(`courses/${courseId}/${lessonId}.pdf`, pdfFile);
 * 
 * // อัพโหลด Thumbnail:
 * // const { data, error } = await supabase.storage
 * //   .from('course-thumbnails')
 * //   .upload(`courses/${courseId}/thumbnail.jpg`, thumbnailFile);
 * 
 * // อัพโหลด Resource (ZIP, Slides):
 * // const { data, error } = await supabase.storage
 * //   .from('course-resources')
 * //   .upload(`courses/${courseId}/${resourceName}`, resourceFile);
 * ```
 * 
 * ## Bucket ที่ต้องสร้าง:
 * - `course-videos`      — เก็บไฟล์ Video (.mp4, .webm)
 * - `course-materials`    — เก็บ PDF, Slides
 * - `course-thumbnails`   — เก็บภาพ Thumbnail
 * - `course-resources`    — เก็บ Downloadable Resources (.zip, .pptx)
 * - `course-certificates` — เก็บ Certificate Templates
 * ============================================================
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Plus, Trash2, GripVertical, Video, FileText,
  File, Upload, Image, ChevronDown, ChevronRight, Save,
  ArrowLeft, Eye, Award, X, HelpCircle
} from "lucide-react";

interface LessonDraft {
  id: string;
  title: string;
  type: 'video' | 'article' | 'pdf' | 'slide';
  duration: string;
  // # import: เมื่อเชื่อมต่อ backend ให้เพิ่ม field นี้:
  // fileUrl?: string;     // URL จาก storage หลังอัพโหลด
  // fileName?: string;    // ชื่อไฟล์ต้นฉบับ
  // fileSize?: number;    // ขนาดไฟล์ (bytes)
}

interface QuizDraft {
  title: string;
  timeLimit: number;
  attemptLimit: number;
  questions: QuestionDraft[];
}

interface QuestionDraft {
  id: string;
  text: string;
  type: 'multiple-choice' | 'essay';
  choices: { id: string; text: string }[];
  correctAnswer: string;
  // # import: สำหรับ essay type
  // rubric?: string;        // เกณฑ์การให้คะแนน
  // maxScore?: number;      // คะแนนเต็ม
}

interface ModuleDraft {
  id: string;
  title: string;
  lessons: LessonDraft[];
  quiz?: QuizDraft;
  expanded: boolean;
}

const CreateCourse = () => {
  const [step, setStep] = useState(1);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [price, setPrice] = useState("0");
  const [isFree, setIsFree] = useState(true);
  // # import: Thumbnail
  // const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  // const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const [modules, setModules] = useState<ModuleDraft[]>([
    {
      id: 'mod-1',
      title: 'Module 1: บทนำ',
      lessons: [
        { id: 'les-1', title: 'บทเรียนที่ 1', type: 'video', duration: '10 นาที' }
      ],
      expanded: true,
    }
  ]);

  const addModule = () => {
    const newId = `mod-${Date.now()}`;
    setModules([...modules, {
      id: newId,
      title: `Module ${modules.length + 1}`,
      lessons: [],
      expanded: true,
    }]);
  };

  const addLesson = (moduleId: string) => {
    setModules(modules.map(m =>
      m.id === moduleId
        ? { ...m, lessons: [...m.lessons, { id: `les-${Date.now()}`, title: 'บทเรียนใหม่', type: 'video', duration: '' }] }
        : m
    ));
  };

  const addQuiz = (moduleId: string) => {
    setModules(modules.map(m =>
      m.id === moduleId
        ? { ...m, quiz: { title: 'แบบทดสอบ', timeLimit: 30, attemptLimit: 3, questions: [
            { id: `q-${Date.now()}`, text: '', type: 'multiple-choice', choices: [
              { id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }
            ], correctAnswer: 'a' }
          ] } }
        : m
    ));
  };

  const removeModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
        : m
    ));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: keyof LessonDraft, value: string) => {
    setModules(modules.map(m =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l) }
        : m
    ));
  };

  const toggleModule = (moduleId: string) => {
    setModules(modules.map(m =>
      m.id === moduleId ? { ...m, expanded: !m.expanded } : m
    ));
  };

  const lessonTypeIcons = { video: Video, article: FileText, pdf: File, slide: FileText };
  const lessonTypeLabels = { video: 'Video', article: 'บทความ', pdf: 'PDF', slide: 'Slide' };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto container-padding flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/instructor/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> กลับ
            </Link>
            <span className="text-sm font-medium text-foreground">สร้างคอร์สใหม่</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Eye className="w-4 h-4" /> ดูตัวอย่าง</Button>
            <Button size="sm"><Save className="w-4 h-4" /> บันทึก</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto container-padding py-8 max-w-4xl">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { num: 1, label: 'ข้อมูลคอร์ส' },
            { num: 2, label: 'เนื้อหา & บทเรียน' },
            { num: 3, label: 'ตั้งค่า & เผยแพร่' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                step === s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-xs font-bold">{s.num}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step 1: Course Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="card-elevated p-6 space-y-5">
              <h2 className="text-lg font-display font-bold text-foreground">ข้อมูลคอร์ส</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">ชื่อคอร์ส *</label>
                <Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="เช่น Complete Web Development Bootcamp" className="input-focus" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">รายละเอียด *</label>
                <textarea
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="อธิบายคอร์สของคุณ..."
                  className="w-full h-32 bg-muted rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">หมวดหมู่</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-muted rounded-lg p-2.5 text-sm text-foreground border border-border"
                  >
                    {['Web Development', 'Data Science', 'Design', 'Mobile Development', 'Cybersecurity', 'Business', 'Marketing'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">ระดับ</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full bg-muted rounded-lg p-2.5 text-sm text-foreground border border-border"
                  >
                    <option value="beginner">เริ่มต้น</option>
                    <option value="intermediate">กลาง</option>
                    <option value="advanced">สูง</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">ภาพ Thumbnail</label>
                {/* # import: เมื่อเชื่อมต่อ backend ให้เปลี่ยนเป็น:
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setThumbnailFile(file);
                        setThumbnailPreview(URL.createObjectURL(file));
                      }
                    }} />
                */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">ลากไฟล์มาวาง หรือ คลิกเพื่อเลือกไฟล์</p>
                  <p className="text-xs text-muted-foreground mt-1">รองรับ JPG, PNG, WebP (สูงสุด 5MB)</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">ราคา</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={isFree} onChange={() => setIsFree(true)} className="text-primary" />
                    <span className="text-sm text-foreground">ฟรี</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={!isFree} onChange={() => setIsFree(false)} className="text-primary" />
                    <span className="text-sm text-foreground">มีค่าใช้จ่าย</span>
                  </label>
                </div>
                {!isFree && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">฿</span>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-40 input-focus" placeholder="0" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>ถัดไป: เนื้อหา <ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 2: Content Builder */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-foreground">เนื้อหาคอร์ส</h2>
              <Button variant="outline" size="sm" onClick={addModule}>
                <Plus className="w-4 h-4" /> เพิ่ม Module
              </Button>
            </div>

            {modules.map((module, mi) => (
              <div key={module.id} className="card-elevated overflow-hidden">
                {/* Module Header */}
                <div className="flex items-center gap-3 p-4 bg-muted/30 border-b border-border">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <button onClick={() => toggleModule(module.id)}>
                    {module.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <Input
                    value={module.title}
                    onChange={(e) => setModules(modules.map(m => m.id === module.id ? { ...m, title: e.target.value } : m))}
                    className="flex-1 bg-transparent border-0 p-0 text-sm font-medium text-foreground focus-visible:ring-0"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeModule(module.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Module Content */}
                {module.expanded && (
                  <div className="p-4 space-y-3">
                    {module.lessons.map((lesson, li) => {
                      const LIcon = lessonTypeIcons[lesson.type];
                      return (
                        <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                          <LIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <Input
                            value={lesson.title}
                            onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                            className="flex-1 bg-transparent border-0 p-0 text-sm text-foreground focus-visible:ring-0"
                            placeholder="ชื่อบทเรียน"
                          />
                          <select
                            value={lesson.type}
                            onChange={(e) => updateLesson(module.id, lesson.id, 'type', e.target.value)}
                            className="text-xs bg-muted rounded px-2 py-1 border border-border text-foreground"
                          >
                            <option value="video">Video</option>
                            <option value="article">บทความ</option>
                            <option value="pdf">PDF</option>
                            <option value="slide">Slide</option>
                          </select>
                          {/* # import: ปุ่มอัพโหลดไฟล์บทเรียน
                              เมื่อเชื่อมต่อ backend ให้เพิ่ม:
                              <input type="file" accept={
                                lesson.type === 'video' ? 'video/*' :
                                lesson.type === 'pdf' ? '.pdf' :
                                lesson.type === 'slide' ? '.pptx,.pdf' :
                                '*'
                              } onChange={(e) => handleLessonFileUpload(module.id, lesson.id, e.target.files?.[0])} />
                          */}
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="อัพโหลดไฟล์">
                            <Upload className="w-3.5 h-3.5" />
                          </Button>
                          <Input
                            value={lesson.duration}
                            onChange={(e) => updateLesson(module.id, lesson.id, 'duration', e.target.value)}
                            className="w-24 bg-transparent border-0 p-0 text-xs text-muted-foreground focus-visible:ring-0"
                            placeholder="ระยะเวลา"
                          />
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeLesson(module.id, lesson.id)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      );
                    })}

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => addLesson(module.id)}>
                        <Plus className="w-3.5 h-3.5" /> เพิ่มบทเรียน
                      </Button>
                      {!module.quiz && (
                        <Button variant="outline" size="sm" onClick={() => addQuiz(module.id)}>
                          <Award className="w-3.5 h-3.5" /> เพิ่มแบบทดสอบ
                        </Button>
                      )}
                    </div>

                    {/* Quiz Builder */}
                    {module.quiz && (
                      <div className="mt-4 p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">แบบทดสอบ</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() =>
                            setModules(modules.map(m => m.id === module.id ? { ...m, quiz: undefined } : m))
                          }>
                            <Trash2 className="w-3.5 h-3.5" /> ลบ
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">เวลา (นาที)</label>
                            <Input type="number" value={module.quiz.timeLimit} className="input-focus h-8 text-sm" onChange={() => {}} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">ทำได้ (ครั้ง)</label>
                            <Input type="number" value={module.quiz.attemptLimit} className="input-focus h-8 text-sm" onChange={() => {}} />
                          </div>
                        </div>

                        {module.quiz.questions.map((q, qi) => (
                          <div key={q.id} className="p-3 rounded-lg bg-background border border-border space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">ข้อ {qi + 1}</span>
                              <select
                                value={q.type}
                                className="text-xs bg-muted rounded px-2 py-1 border border-border text-foreground"
                                onChange={() => {}}
                              >
                                <option value="multiple-choice">Multiple Choice</option>
                                <option value="essay">Essay</option>
                              </select>
                            </div>
                            <Input placeholder="คำถาม..." className="input-focus text-sm" value={q.text} onChange={() => {}} />
                            {q.type === 'multiple-choice' ? (
                              <div className="space-y-2">
                                {q.choices.map((c) => (
                                  <div key={c.id} className="flex items-center gap-2">
                                    <input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === c.id} onChange={() => {}} />
                                    <Input placeholder={`ตัวเลือก ${c.id.toUpperCase()}`} className="input-focus text-sm flex-1" value={c.text} onChange={() => {}} />
                                  </div>
                                ))}
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <HelpCircle className="w-3 h-3" /> เลือก radio button เพื่อระบุคำตอบที่ถูกต้อง
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <textarea
                                  placeholder="เกณฑ์การให้คะแนน (Rubric)..."
                                  className="w-full h-20 bg-muted rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none border border-border"
                                />
                                {/* # import: Essay จะถูกตรวจโดย Instructor ผ่าน Dashboard */}
                              </div>
                            )}
                          </div>
                        ))}

                        <Button variant="outline" size="sm" onClick={() => {
                          // Add question
                        }}>
                          <Plus className="w-3.5 h-3.5" /> เพิ่มคำถาม
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4" /> ก่อนหน้า</Button>
              <Button onClick={() => setStep(3)}>ถัดไป: ตั้งค่า <ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 3: Settings & Publish */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="card-elevated p-6 space-y-5">
              <h2 className="text-lg font-display font-bold text-foreground">ตั้งค่าคอร์ส</h2>

              {/* Certificate Template */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Certificate Template</label>
                {/* # import: อัพโหลด Certificate Template
                    เมื่อเชื่อมต่อ backend:
                    const { data, error } = await supabase.storage
                      .from('course-certificates')
                      .upload(`templates/${courseId}.png`, templateFile);
                */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">อัพโหลด Certificate Template</p>
                  <p className="text-xs text-muted-foreground mt-1">ระบบจะเปลี่ยนเฉพาะ: ชื่อผู้เรียน, ชื่อคอร์ส, วันที่</p>
                </div>
              </div>

              {/* Anti-Cheat Settings */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Anti-Cheat Settings</label>
                <div className="space-y-2">
                  {[
                    { label: 'สลับข้อสอบ (Random Questions)', checked: true },
                    { label: 'สลับตัวเลือก (Random Choices)', checked: true },
                    { label: 'ตรวจจับการสลับแท็บ (Tab Switch Detection)', checked: true },
                    { label: 'บังคับเต็มหน้าจอ (Fullscreen Mode)', checked: false },
                    { label: 'จำกัดจำนวนครั้งที่ทำได้ (Attempt Limit)', checked: true },
                    { label: 'จำกัดเวลา (Time Limit)', checked: true },
                  ].map((setting, i) => (
                    <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                      <input type="checkbox" defaultChecked={setting.checked} className="rounded text-primary" />
                      <span className="text-sm text-foreground">{setting.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Downloadable Resources */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Downloadable Resources</label>
                {/* # import: อัพโหลด Resources
                    const { data, error } = await supabase.storage
                      .from('course-resources')
                      .upload(`courses/${courseId}/${file.name}`, file);
                */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">อัพโหลดไฟล์เสริม (Source Code, Slides, เอกสาร)</p>
                  <p className="text-xs text-muted-foreground mt-1">รองรับ ZIP, PDF, PPTX (สูงสุด 50MB)</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="card-elevated p-6 space-y-3 border-primary/20">
              <h3 className="font-display font-bold text-foreground">สรุป</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">ชื่อคอร์ส:</span> <span className="text-foreground font-medium">{courseTitle || '—'}</span></div>
                <div><span className="text-muted-foreground">หมวดหมู่:</span> <span className="text-foreground font-medium">{category}</span></div>
                <div><span className="text-muted-foreground">ระดับ:</span> <span className="text-foreground font-medium">{level}</span></div>
                <div><span className="text-muted-foreground">ราคา:</span> <span className="text-foreground font-medium">{isFree ? 'ฟรี' : `฿${price}`}</span></div>
                <div><span className="text-muted-foreground">จำนวน Module:</span> <span className="text-foreground font-medium">{modules.length}</span></div>
                <div><span className="text-muted-foreground">จำนวนบทเรียน:</span> <span className="text-foreground font-medium">{modules.reduce((a, m) => a + m.lessons.length, 0)}</span></div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4" /> ก่อนหน้า</Button>
              <div className="flex gap-2">
                <Button variant="outline"><Save className="w-4 h-4" /> บันทึกฉบับร่าง</Button>
                <Button variant="hero">เผยแพร่คอร์ส</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCourse;
