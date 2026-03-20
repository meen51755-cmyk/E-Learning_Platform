// ============================================================
// src/lib/sanitize.ts
// Input Validation & Sanitization Utility
// ============================================================

// ── 1. HTML Sanitizer ────────────────────────────────────────
// ป้องกัน XSS — ลบ HTML tags ทั้งหมดออก
export const stripHtml = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, "")           // ลบ HTML tags
    .replace(/javascript:/gi, "")      // ลบ javascript: protocol
    .replace(/on\w+\s*=/gi, "")        // ลบ event handlers เช่น onclick=
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
};

// ── 2. Safe Text — escape HTML entities ─────────────────────
// ใช้ตอนแสดงผลข้อความที่ user กรอก
export const escapeHtml = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ── 3. Sanitize ทั่วไป ───────────────────────────────────────
export const sanitizeText = (input: string, maxLength = 500): string => {
  return stripHtml(input)
    .slice(0, maxLength)
    .trim();
};

// ── 4. Validators ────────────────────────────────────────────

export const validators = {
  // ชื่อผู้ใช้
  fullName: (value: string) => {
    const cleaned = sanitizeText(value, 100);
    if (!cleaned) return { ok: false, error: "กรุณากรอกชื่อ" };
    if (cleaned.length < 2) return { ok: false, error: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" };
    if (cleaned.length > 100) return { ok: false, error: "ชื่อยาวเกินไป (สูงสุด 100 ตัวอักษร)" };
    // ห้ามมีอักขระพิเศษอันตราย
    if (/[<>{}[\]\\\/]/.test(cleaned)) return { ok: false, error: "ชื่อมีอักขระที่ไม่อนุญาต" };
    return { ok: true, value: cleaned };
  },

  // อีเมล
  email: (value: string) => {
    const cleaned = value.trim().toLowerCase().slice(0, 254);
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!cleaned) return { ok: false, error: "กรุณากรอกอีเมล" };
    if (!emailRegex.test(cleaned)) return { ok: false, error: "รูปแบบอีเมลไม่ถูกต้อง" };
    return { ok: true, value: cleaned };
  },

  // รหัสผ่าน
  password: (value: string) => {
    if (!value) return { ok: false, error: "กรุณากรอกรหัสผ่าน" };
    if (value.length < 8) return { ok: false, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
    if (value.length > 128) return { ok: false, error: "รหัสผ่านยาวเกินไป" };
    if (!/[A-Za-z]/.test(value)) return { ok: false, error: "รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว" };
    if (!/[0-9]/.test(value)) return { ok: false, error: "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว" };
    return { ok: true, value };
  },

  // Bio
  bio: (value: string) => {
    const cleaned = sanitizeText(value, 200);
    return { ok: true, value: cleaned };
  },

  // เบอร์โทร
  phone: (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return { ok: true, value: "" }; // optional
    if (digits.length !== 10) return { ok: false, error: "เบอร์โทรต้องมี 10 หลัก" };
    if (!/^(06|08|09|02)/.test(digits)) return { ok: false, error: "เบอร์โทรไม่ถูกต้อง" };
    return { ok: true, value: digits };
  },

  // URL (website, facebook, youtube)
  url: (value: string) => {
    if (!value.trim()) return { ok: true, value: "" }; // optional
    const cleaned = value.trim().slice(0, 500);
    // ห้าม javascript: protocol
    if (/^javascript:/i.test(cleaned)) return { ok: false, error: "URL ไม่ถูกต้อง" };
    // ต้องขึ้นต้นด้วย http/https หรือ domain
    const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/i;
    if (!urlRegex.test(cleaned)) return { ok: false, error: "รูปแบบ URL ไม่ถูกต้อง" };
    return { ok: true, value: cleaned };
  },

  // หัวข้อโพสต์ community
  postTitle: (value: string) => {
    const cleaned = sanitizeText(value, 200);
    if (!cleaned) return { ok: false, error: "กรุณากรอกหัวข้อ" };
    if (cleaned.length < 5) return { ok: false, error: "หัวข้อสั้นเกินไป (อย่างน้อย 5 ตัวอักษร)" };
    if (cleaned.length > 200) return { ok: false, error: "หัวข้อยาวเกินไป (สูงสุด 200 ตัวอักษร)" };
    return { ok: true, value: cleaned };
  },

  // เนื้อหาโพสต์/คอมเมนต์
  postContent: (value: string) => {
    const cleaned = sanitizeText(value, 5000);
    if (!cleaned) return { ok: false, error: "กรุณากรอกเนื้อหา" };
    if (cleaned.length < 10) return { ok: false, error: "เนื้อหาสั้นเกินไป (อย่างน้อย 10 ตัวอักษร)" };
    return { ok: true, value: cleaned };
  },

  // คะแนน rating
  rating: (value: number) => {
    if (!Number.isInteger(value)) return { ok: false, error: "คะแนนต้องเป็นจำนวนเต็ม" };
    if (value < 1 || value > 5) return { ok: false, error: "คะแนนต้องอยู่ระหว่าง 1-5" };
    return { ok: true, value };
  },

  // ข้อความแชท
  message: (value: string) => {
    const cleaned = sanitizeText(value, 1000);
    if (!cleaned) return { ok: false, error: "กรุณาพิมพ์ข้อความ" };
    return { ok: true, value: cleaned };
  },

  // ชื่อคูปอง
  couponCode: (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
    if (!cleaned) return { ok: false, error: "กรุณากรอกรหัสคูปอง" };
    if (cleaned.length < 3) return { ok: false, error: "รหัสคูปองต้องมีอย่างน้อย 3 ตัวอักษร" };
    return { ok: true, value: cleaned };
  },
};

// ── 5. Rate Limiting (client-side) ──────────────────────────
// ป้องกัน spam submit ฝั่ง UI
const submitTimestamps: Record<string, number[]> = {};

export const checkRateLimit = (
  key: string,
  maxAttempts = 5,
  windowMs = 60000 // 1 นาที
): { allowed: boolean; remainingMs?: number } => {
  const now = Date.now();
  const timestamps = submitTimestamps[key] ?? [];

  // ลบ timestamps ที่เก่าเกิน window
  const recent = timestamps.filter((t) => now - t < windowMs);
  submitTimestamps[key] = recent;

  if (recent.length >= maxAttempts) {
    const oldestInWindow = recent[0];
    const remainingMs = windowMs - (now - oldestInWindow);
    return { allowed: false, remainingMs };
  }

  submitTimestamps[key].push(now);
  return { allowed: true };
};

// ── 6. File Upload Validator ─────────────────────────────────
export const validateImageFile = (file: File): { ok: boolean; error?: string } => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    return { ok: false, error: "รองรับเฉพาะไฟล์ JPG, PNG, WebP, GIF เท่านั้น" };
  }
  if (file.size > maxSize) {
    return { ok: false, error: "ขนาดไฟล์ต้องไม่เกิน 2MB" };
  }
  // ตรวจ file extension ซ้ำอีกชั้น
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext ?? "")) {
    return { ok: false, error: "นามสกุลไฟล์ไม่ถูกต้อง" };
  }
  return { ok: true };
};
