import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Code, Copy, CheckCircle, Search, ChevronRight,
  Lock, Globe, Zap, BookOpen, Users, Award,
  FileText, Shield, CreditCard, ShieldCheck, Key,
  AlertTriangle, Eye, Fingerprint, Server, RefreshCw
} from "lucide-react";

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth: boolean;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  response?: string;
}

interface ApiCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  endpoints: ApiEndpoint[];
}

const methodColors: Record<string, string> = {
  GET: 'bg-success/10 text-success',
  POST: 'bg-primary/10 text-primary',
  PUT: 'bg-warning/10 text-warning',
  DELETE: 'bg-destructive/10 text-destructive',
  PATCH: 'bg-accent/10 text-accent',
};

const apiCategories: ApiCategory[] = [
  {
    id: 'auth',
    title: 'Authentication',
    icon: Lock,
    description: 'การยืนยันตัวตนและจัดการ session',
    endpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'สมัครสมาชิกใหม่', auth: false, params: [
        { name: 'email', type: 'string', required: true, desc: 'อีเมลผู้ใช้' },
        { name: 'password', type: 'string', required: true, desc: 'รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)' },
        { name: 'name', type: 'string', required: true, desc: 'ชื่อ-นามสกุล' },
      ], response: '{ "user": { "id": "uuid", "email": "...", "role": "student" }, "token": "jwt..." }' },
      { method: 'POST', path: '/api/auth/login', description: 'เข้าสู่ระบบ', auth: false, params: [
        { name: 'email', type: 'string', required: true, desc: 'อีเมล' },
        { name: 'password', type: 'string', required: true, desc: 'รหัสผ่าน' },
      ], response: '{ "token": "jwt...", "user": { "id": "uuid", "role": "student" } }' },
      { method: 'POST', path: '/api/auth/logout', description: 'ออกจากระบบ', auth: true },
      { method: 'POST', path: '/api/auth/forgot-password', description: 'ส่งอีเมลรีเซ็ตรหัสผ่าน', auth: false },
      { method: 'POST', path: '/api/auth/verify-email', description: 'ยืนยันอีเมล', auth: false },
      { method: 'POST', path: '/api/auth/2fa/enable', description: 'เปิดใช้งาน 2FA', auth: true },
    ],
  },
  {
    id: 'courses',
    title: 'Courses',
    icon: BookOpen,
    description: 'จัดการคอร์สเรียน',
    endpoints: [
      { method: 'GET', path: '/api/courses', description: 'ดึงรายการคอร์สทั้งหมด (รองรับ filter, search, pagination)', auth: false, params: [
        { name: 'page', type: 'number', required: false, desc: 'หน้า (default: 1)' },
        { name: 'limit', type: 'number', required: false, desc: 'จำนวนต่อหน้า (default: 20)' },
        { name: 'category', type: 'string', required: false, desc: 'กรองตามหมวดหมู่' },
        { name: 'level', type: 'string', required: false, desc: 'beginner | intermediate | advanced' },
        { name: 'search', type: 'string', required: false, desc: 'ค้นหาด้วยชื่อหรือคำอธิบาย' },
      ], response: '{ "courses": [...], "total": 320, "page": 1, "totalPages": 16 }' },
      { method: 'GET', path: '/api/courses/:id', description: 'ดูรายละเอียดคอร์ส', auth: false },
      { method: 'POST', path: '/api/courses', description: 'สร้างคอร์สใหม่ (Instructor)', auth: true },
      { method: 'PUT', path: '/api/courses/:id', description: 'แก้ไขคอร์ส', auth: true },
      { method: 'DELETE', path: '/api/courses/:id', description: 'ลบคอร์ส (soft delete)', auth: true },
      { method: 'POST', path: '/api/courses/:id/modules', description: 'เพิ่ม Module', auth: true },
      { method: 'POST', path: '/api/courses/:id/modules/:moduleId/lessons', description: 'เพิ่ม Lesson', auth: true },
    ],
  },
  {
    id: 'enrollment',
    title: 'Enrollment',
    icon: Users,
    description: 'ลงทะเบียนเรียนและติดตามความก้าวหน้า',
    endpoints: [
      { method: 'POST', path: '/api/enrollments', description: 'ลงทะเบียนเรียนคอร์ส', auth: true, params: [
        { name: 'courseId', type: 'string', required: true, desc: 'ID ของคอร์ส' },
      ] },
      { method: 'GET', path: '/api/enrollments/my', description: 'ดูคอร์สที่ลงทะเบียนทั้งหมด', auth: true },
      { method: 'PATCH', path: '/api/enrollments/:id/progress', description: 'อัปเดตความก้าวหน้า', auth: true },
      { method: 'GET', path: '/api/enrollments/:id/analytics', description: 'ดู Learning Analytics', auth: true },
    ],
  },
  {
    id: 'assessment',
    title: 'Assessment',
    icon: FileText,
    description: 'ระบบแบบทดสอบและข้อสอบ',
    endpoints: [
      { method: 'GET', path: '/api/quizzes/:id', description: 'ดึงข้อมูลแบบทดสอบ', auth: true },
      { method: 'POST', path: '/api/quizzes/:id/start', description: 'เริ่มทำข้อสอบ', auth: true },
      { method: 'POST', path: '/api/quizzes/:id/submit', description: 'ส่งคำตอบ', auth: true, params: [
        { name: 'answers', type: 'object[]', required: true, desc: 'คำตอบแต่ละข้อ { questionId, answer }' },
      ] },
      { method: 'GET', path: '/api/quizzes/:id/results', description: 'ดูผลสอบ', auth: true },
      { method: 'POST', path: '/api/quizzes', description: 'สร้างแบบทดสอบ (Instructor)', auth: true },
    ],
  },
  {
    id: 'ranking',
    title: 'Ranking & Gamification',
    icon: Award,
    description: 'อันดับ, Badge, Streak, Achievement',
    endpoints: [
      { method: 'GET', path: '/api/ranking', description: 'ดูอันดับผู้เรียน', auth: false, params: [
        { name: 'courseId', type: 'string', required: false, desc: 'กรองตามคอร์ส' },
        { name: 'period', type: 'string', required: false, desc: 'weekly | monthly | all-time' },
      ] },
      { method: 'GET', path: '/api/badges', description: 'ดู Badge ทั้งหมด', auth: true },
      { method: 'GET', path: '/api/streaks/my', description: 'ดู Streak ของตัวเอง', auth: true },
      { method: 'GET', path: '/api/achievements', description: 'ดู Achievement ทั้งหมด', auth: true },
    ],
  },
  {
    id: 'certificate',
    title: 'Certificate',
    icon: Award,
    description: 'ใบรับรองการเรียนจบ',
    endpoints: [
      { method: 'POST', path: '/api/certificates/generate', description: 'สร้าง Certificate', auth: true, params: [
        { name: 'courseId', type: 'string', required: true, desc: 'ID ของคอร์สที่เรียนจบ' },
      ] },
      { method: 'GET', path: '/api/certificates/my', description: 'ดู Certificate ทั้งหมดของฉัน', auth: true },
      { method: 'GET', path: '/api/certificates/:id/verify', description: 'ตรวจสอบ Certificate', auth: false },
      { method: 'GET', path: '/api/certificates/:id/download', description: 'ดาวน์โหลด Certificate (PDF)', auth: true },
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    icon: CreditCard,
    description: 'ชำระเงินและธุรกรรม',
    endpoints: [
      { method: 'POST', path: '/api/payments/checkout', description: 'สร้าง Payment Session', auth: true, params: [
        { name: 'courseId', type: 'string', required: true, desc: 'ID ของคอร์ส' },
        { name: 'couponCode', type: 'string', required: false, desc: 'รหัสคูปอง' },
      ] },
      { method: 'GET', path: '/api/payments/history', description: 'ดูประวัติการชำระเงิน', auth: true },
      { method: 'GET', path: '/api/payments/:id/invoice', description: 'ดูใบเสร็จ', auth: true },
      { method: 'POST', path: '/api/payments/:id/refund', description: 'ขอคืนเงิน', auth: true },
      { method: 'POST', path: '/api/coupons/validate', description: 'ตรวจสอบคูปอง', auth: false },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    icon: Users,
    description: 'กระทู้, ข้อความ, รีวิว',
    endpoints: [
      { method: 'GET', path: '/api/discussions', description: 'ดูกระทู้ทั้งหมด', auth: false },
      { method: 'POST', path: '/api/discussions', description: 'สร้างกระทู้ใหม่', auth: true },
      { method: 'POST', path: '/api/discussions/:id/comments', description: 'ตอบกระทู้', auth: true },
      { method: 'GET', path: '/api/messages', description: 'ดูข้อความ', auth: true },
      { method: 'POST', path: '/api/messages', description: 'ส่งข้อความ', auth: true },
      { method: 'POST', path: '/api/courses/:id/reviews', description: 'รีวิวคอร์ส', auth: true },
    ],
  },
  {
    id: 'admin',
    title: 'Admin',
    icon: Shield,
    description: 'จัดการระบบ (Admin only)',
    endpoints: [
      { method: 'GET', path: '/api/admin/users', description: 'ดูผู้ใช้ทั้งหมด', auth: true },
      { method: 'PATCH', path: '/api/admin/users/:id/role', description: 'เปลี่ยนบทบาทผู้ใช้', auth: true },
      { method: 'POST', path: '/api/admin/users/:id/suspend', description: 'ระงับบัญชี', auth: true },
      { method: 'GET', path: '/api/admin/dashboard', description: 'ดู Dashboard KPI', auth: true },
      { method: 'GET', path: '/api/admin/reports', description: 'ดูรายงานระบบ', auth: true },
      { method: 'GET', path: '/api/admin/audit-log', description: 'ดู Audit Log', auth: true },
      { method: 'POST', path: '/api/admin/coupons', description: 'สร้างคูปอง', auth: true },
    ],
  },
];

const ApiDocs = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState('auth');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const category = apiCategories.find(c => c.id === activeCategory)!;

  const filteredEndpoints = search
    ? apiCategories.flatMap(c => c.endpoints.filter(e =>
        e.path.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase())
      ))
    : category.endpoints;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto container-padding py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Code className="w-8 h-8 text-primary" /> API Documentation
          </h1>
          <p className="text-muted-foreground mt-2">เอกสารอ้างอิง API สำหรับ LearnHub Platform — RESTful API พร้อมตัวอย่างการใช้งาน</p>
        </div>

        {/* Base URL & Auth Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card-elevated p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Globe className="w-4 h-4 text-primary" /> Base URL
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-muted px-3 py-1.5 rounded-lg text-sm font-mono text-foreground flex-1">
                https://api.learnhub.com/v1
              </code>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard('https://api.learnhub.com/v1')}>
                {copiedText === 'https://api.learnhub.com/v1' ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="card-elevated p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lock className="w-4 h-4 text-warning" /> Authentication
            </div>
            <code className="bg-muted px-3 py-1.5 rounded-lg text-sm font-mono text-muted-foreground block">
              Authorization: Bearer {'<token>'}
            </code>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา API endpoint..."
            className="pl-10 input-focus"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          {!search && (
            <div className="lg:w-64 shrink-0">
              <div className="space-y-1 lg:sticky lg:top-20">
                {apiCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      activeCategory === cat.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <cat.icon className="w-4 h-4 shrink-0" />
                    <span>{cat.title}</span>
                    <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">{cat.endpoints.length}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 space-y-4">
            {!search && (
              <div className="mb-4">
                <h2 className="text-xl font-display font-bold text-foreground">{category.title}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            )}

            {filteredEndpoints.map((endpoint, i) => {
              const key = `${endpoint.method}-${endpoint.path}`;
              const isExpanded = expandedEndpoint === key;
              return (
                <div key={i} className="card-elevated overflow-hidden">
                  <button
                    onClick={() => setExpandedEndpoint(isExpanded ? null : key)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/20 transition-colors"
                  >
                    <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${methodColors[endpoint.method]}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-foreground flex-1">{endpoint.path}</code>
                    {endpoint.auth && <Lock className="w-3.5 h-3.5 text-warning" />}
                    <span className="text-sm text-muted-foreground hidden md:block">{endpoint.description}</span>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border p-4 space-y-4 bg-muted/10 animate-fade-in">
                      <p className="text-sm text-foreground">{endpoint.description}</p>

                      {endpoint.auth && (
                        <div className="flex items-center gap-2 text-xs text-warning bg-warning/5 px-3 py-2 rounded-lg">
                          <Lock className="w-3 h-3" /> ต้องมี Bearer Token
                        </div>
                      )}

                      {endpoint.params && endpoint.params.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">Parameters</h4>
                          <div className="space-y-2">
                            {endpoint.params.map((param) => (
                              <div key={param.name} className="flex items-start gap-3 text-sm p-2 rounded bg-muted/30">
                                <code className="font-mono text-primary">{param.name}</code>
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{param.type}</span>
                                {param.required && <span className="text-xs text-destructive">required</span>}
                                <span className="text-muted-foreground flex-1">{param.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {endpoint.response && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-foreground">Response Example</h4>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(endpoint.response!)}>
                              {copiedText === endpoint.response ? <CheckCircle className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                              <span className="ml-1 text-xs">คัดลอก</span>
                            </Button>
                          </div>
                          <pre className="bg-foreground/5 border border-border rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto">
                            {endpoint.response}
                          </pre>
                        </div>
                      )}

                      {/* cURL Example */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-foreground">cURL</h4>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(
                            `curl -X ${endpoint.method} https://api.learnhub.com/v1${endpoint.path}${endpoint.auth ? ' \\\n  -H "Authorization: Bearer <token>"' : ''}`
                          )}>
                            <Copy className="w-3 h-3" />
                            <span className="ml-1 text-xs">คัดลอก</span>
                          </Button>
                        </div>
                        <pre className="bg-foreground/5 border border-border rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto">
{`curl -X ${endpoint.method} https://api.learnhub.com/v1${endpoint.path}${endpoint.auth ? ' \\\n  -H "Authorization: Bearer <token>"' : ''}`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredEndpoints.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ไม่พบ endpoint ที่ตรงกับการค้นหา</p>
              </div>
            )}
          </div>
        </div>

        {/* Rate Limit Info */}
        <div className="mt-12 card-elevated p-6 space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" /> Rate Limiting & Error Codes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Rate Limits</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Free tier: 100 requests/minute</p>
                <p>• Authenticated: 1,000 requests/minute</p>
                <p>• Admin: 5,000 requests/minute</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">HTTP Status Codes</h3>
              <div className="space-y-1 text-sm">
                <p><code className="text-success font-mono">200</code> <span className="text-muted-foreground">สำเร็จ</span></p>
                <p><code className="text-primary font-mono">201</code> <span className="text-muted-foreground">สร้างสำเร็จ</span></p>
                <p><code className="text-warning font-mono">400</code> <span className="text-muted-foreground">Bad Request</span></p>
                <p><code className="text-warning font-mono">401</code> <span className="text-muted-foreground">Unauthorized</span></p>
                <p><code className="text-warning font-mono">403</code> <span className="text-muted-foreground">Forbidden</span></p>
                <p><code className="text-destructive font-mono">404</code> <span className="text-muted-foreground">Not Found</span></p>
                <p><code className="text-destructive font-mono">429</code> <span className="text-muted-foreground">Too Many Requests</span></p>
                <p><code className="text-destructive font-mono">500</code> <span className="text-muted-foreground">Server Error</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-primary" /> ระบบความปลอดภัย (Security)
          </h2>
          <p className="text-muted-foreground">LearnHub ใช้มาตรฐานความปลอดภัยระดับ Enterprise เทียบเท่า Coursera, Skillane และ Future Skill</p>

          {/* Authentication & Authorization */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> Authentication & Authorization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">JWT Token (OAuth 2.0)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Access Token หมดอายุใน 15 นาที</li>
                  <li>• Refresh Token หมดอายุใน 7 วัน</li>
                  <li>• Token Rotation ทุกครั้งที่ refresh</li>
                  <li>• Signed ด้วย RS256 Algorithm</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Role-Based Access Control (RBAC)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <code className="text-primary font-mono">student</code> — เข้าถึงคอร์สที่ลงทะเบียน</li>
                  <li>• <code className="text-primary font-mono">instructor</code> — จัดการคอร์สของตนเอง</li>
                  <li>• <code className="text-primary font-mono">admin</code> — จัดการระบบทั้งหมด</li>
                  <li>• Row-Level Security (RLS) ป้องกันการเข้าถึงข้ามบัญชี</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Multi-Factor Authentication (2FA)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• TOTP (Google Authenticator / Authy)</li>
                  <li>• SMS OTP สำหรับ backup</li>
                  <li>• Recovery codes 10 ชุด</li>
                  <li>• บังคับ 2FA สำหรับ Admin & Instructor</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Session Management</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Single session หรือ multi-device</li>
                  <li>• ดู/ยกเลิก session จากหน้า Profile</li>
                  <li>• Auto-logout เมื่อไม่มีกิจกรรม 30 นาที</li>
                  <li>• IP-based session validation</li>
                </ul>
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-sm font-medium text-foreground mb-2">ตัวอย่าง Token Flow</h4>
              <pre className="bg-foreground/5 border border-border rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto">
{`// 1. Login → ได้รับ Access + Refresh Token
POST /api/auth/login
Response: { "accessToken": "eyJ...", "refreshToken": "dGh...", "expiresIn": 900 }

// 2. เรียก API ด้วย Access Token
GET /api/courses
Authorization: Bearer eyJ...

// 3. Token หมดอายุ → Refresh
POST /api/auth/refresh
Body: { "refreshToken": "dGh..." }
Response: { "accessToken": "eyN...", "refreshToken": "bWt..." }`}
              </pre>
            </div>
          </div>

          {/* Data Protection */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" /> Data Protection & Encryption
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">🔒 Encryption in Transit</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• TLS 1.3 สำหรับทุก connection</li>
                  <li>• HSTS Header บังคับ HTTPS</li>
                  <li>• Certificate Pinning (Mobile)</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">🗄️ Encryption at Rest</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AES-256 สำหรับข้อมูลผู้ใช้</li>
                  <li>• bcrypt (cost 12) สำหรับรหัสผ่าน</li>
                  <li>• Encrypted database backups</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">📋 PDPA / GDPR Compliance</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Consent management</li>
                  <li>• Data export (Right to Portability)</li>
                  <li>• Account deletion (Right to Erasure)</li>
                  <li>• Cookie consent banner</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Anti-Cheat & Content Security */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-warning" /> Anti-Cheat & Content Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">🎯 Quiz Anti-Cheat</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tab Switch Detection — ตรวจจับการสลับหน้าจอ</li>
                  <li>• Fullscreen Enforcement — บังคับโหมดเต็มจอ</li>
                  <li>• Copy/Paste Disabled — ปิดการคัดลอก</li>
                  <li>• Random Question Order — สลับลำดับคำถาม</li>
                  <li>• Time Limit Enforcement — ส่งอัตโนมัติเมื่อหมดเวลา</li>
                  <li>• IP & Device Fingerprinting — ตรวจสอบอุปกรณ์</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">🎬 Video & Content Protection</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• DRM (Widevine / FairPlay) สำหรับวิดีโอ</li>
                  <li>• Signed URL — ลิงก์หมดอายุใน 1 ชม.</li>
                  <li>• Screen Record Detection</li>
                  <li>• Watermark ใน Video (User ID)</li>
                  <li>• Download Prevention — ป้องกันการดาวน์โหลด</li>
                  <li>• HLS Encryption (AES-128)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Security */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" /> API & Infrastructure Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">🛡️ API Protection</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Rate Limiting — จำกัดจำนวน request</li>
                  <li>• CORS — อนุญาตเฉพาะ domain ที่กำหนด</li>
                  <li>• Input Validation (Zod schema)</li>
                  <li>• SQL Injection Prevention (Parameterized queries)</li>
                  <li>• XSS Protection (Content Security Policy)</li>
                  <li>• CSRF Token สำหรับ form submissions</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">🏗️ Infrastructure</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• WAF (Web Application Firewall)</li>
                  <li>• DDoS Protection (Cloudflare)</li>
                  <li>• Automated Security Scanning</li>
                  <li>• Dependency Vulnerability Monitoring</li>
                  <li>• Container Isolation</li>
                  <li>• Automated Backups (Daily + Hourly)</li>
                </ul>
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-sm font-medium text-foreground mb-2">Security Headers</h4>
              <pre className="bg-foreground/5 border border-border rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto">
{`Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()`}
              </pre>
            </div>
          </div>

          {/* Monitoring & Audit */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent" /> Monitoring, Logging & Audit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">📊 Monitoring</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Uptime monitoring 24/7</li>
                  <li>• Error rate alerting ({'<'} 0.1%)</li>
                  <li>• Response time tracking ({'<'} 200ms)</li>
                  <li>• Resource usage dashboards</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">📝 Audit Log</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Login/Logout ทุกครั้ง</li>
                  <li>• Role changes</li>
                  <li>• Course CRUD operations</li>
                  <li>• Payment transactions</li>
                  <li>• Admin actions ทั้งหมด</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">🚨 Incident Response</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Brute-force lock (5 attempts)</li>
                  <li>• Suspicious IP blocking</li>
                  <li>• Auto-suspend on anomaly</li>
                  <li>• Breach notification {'<'} 72 hrs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Security */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-success" /> Payment Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">💳 PCI DSS Compliance</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• ไม่เก็บข้อมูลบัตรเครดิตใน server</li>
                  <li>• Tokenized payments (Stripe / Omise)</li>
                  <li>• 3D Secure 2.0 verification</li>
                  <li>• Fraud detection & scoring</li>
                </ul>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">🔐 Transaction Security</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Webhook signature verification</li>
                  <li>• Idempotency keys ป้องกันจ่ายซ้ำ</li>
                  <li>• Refund audit trail</li>
                  <li>• Amount validation server-side</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ApiDocs;
