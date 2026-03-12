# 📊 Seed Data Guide - LearnHub

## 🎯 ข้อมูลที่จะถูกสร้าง

### 👥 Users (5 คน)
1. **Admin**: `admin@learnhub.com` - ผู้ดูแลระบบ
2. **Instructor 1**: `john.doe@learnhub.com` - Full-Stack Developer
3. **Instructor 2**: `jane.smith@learnhub.com` - UI/UX Designer
4. **Student 1**: `alice.wong@learnhub.com` - นักเรียน (enrolled 2 courses)
5. **Student 2**: `bob.chen@learnhub.com` - นักเรียน (completed 1 course)

**Password ทั้งหมด**: ตั้งเองตอนสร้าง user

---

### 📚 Courses (3 คอร์ส)
1. **Complete Web Development Bootcamp 2024** - ฿2,990 (Beginner)
2. **Python for Data Science** - ฿1,990 (Intermediate)
3. **UI/UX Design Fundamentals** - FREE (Beginner)

### 📖 Modules & Lessons
- Course 1: 5 modules, 12+ lessons
- แต่ละ lesson มี video/article/pdf

### ❓ Quizzes
- Introduction Quiz (3 questions: 2 MCQ + 1 Essay)

### 🏆 Badges (5 อัน)
- First Steps 🎯
- Quiz Master 🏆
- Course Completer 🎓
- Streak Warrior 🔥
- Community Helper ❤️

### 💰 Coupons
- WELCOME50 (50% off)
- STUDENT20 (20% off)
- FLASH30 (30% off)

---

## 🚀 วิธีใช้งาน

### ขั้นตอนที่ 1: สร้าง Users ใน Supabase

1. เปิด **Supabase Dashboard**
2. ไปที่ **Authentication** → **Users**
3. คลิก **Add User** → **Create new user**
4. สร้าง users ทั้ง 5 คน:

```
Email: admin@learnhub.com
Password: Admin123! (หรือตามต้องการ)
✅ Auto Confirm User

Email: john.doe@learnhub.com
Password: Teacher123!
✅ Auto Confirm User

Email: jane.smith@learnhub.com
Password: Teacher123!
✅ Auto Confirm User

Email: alice.wong@learnhub.com
Password: Student123!
✅ Auto Confirm User

Email: bob.chen@learnhub.com
Password: Student123!
✅ Auto Confirm User
```

---

### ขั้นตอนที่ 2: Run Seed Script

#### วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ!)

1. ไปที่ **SQL Editor** ใน Supabase Dashboard
2. คลิก **+ New Query**
3. **Copy** โค้ดทั้งหมดจากไฟล์ `seed.sql`
4. **Paste** ลงใน editor
5. คลิก **Run** (หรือกด Ctrl+Enter)

✅ ถ้าสำเร็จจะเห็น:
```
Seed data inserted successfully!
Admin: admin@learnhub.com
Instructor 1: john.doe@learnhub.com
...
```

---

#### วิธีที่ 2: ใช้ Supabase CLI

```bash
# ใน terminal
cd supabase
supabase db reset

# หรือ
psql YOUR_DATABASE_URL < seed.sql
```

---

### ขั้นตอนที่ 3: ตรวจสอบข้อมูล

#### ใน Supabase Dashboard:

1. **Table Editor** → `profiles` - ควรมี 5 profiles
2. **Table Editor** → `courses` - ควรมี 3 courses
3. **Table Editor** → `enrollments` - ควรมี 4 enrollments
4. **Table Editor** → `badges` - ควรมี 5 badges

---

## 🧪 ทดสอบระบบ

### ทดสอบ Login:

```
Student Account:
Email: alice.wong@learnhub.com
Password: Student123! (หรือที่ตั้งไว้)

Instructor Account:
Email: john.doe@learnhub.com
Password: Teacher123!

Admin Account:
Email: admin@learnhub.com
Password: Admin123!
```

### ทดสอบ Features:

✅ **Student (alice.wong@learnhub.com)**:
- มี 2 enrollments
- ทำ quiz ไปแล้ว 1 ครั้ง (คะแนน 100%)
- มี badge "First Steps"
- มี review 1 รายการ
- มี discussion post 1 รายการ

✅ **Student (bob.chen@learnhub.com)**:
- จบคอร์ส 1 คอร์สแล้ว (UI/UX Design)
- มี certificate 1 ใบ
- มี badges 2 อัน
- มี streak 10 วัน

✅ **Instructor (john.doe@learnhub.com)**:
- มี 2 courses
- มี students enrolled

---

## 🔧 Troubleshooting

### ❌ Error: "Please create users first"
**แก้:** สร้าง users ใน Supabase Auth ก่อน (ขั้นตอนที่ 1)

### ❌ Error: "Foreign key violation"
**แก้:** Run migration files ให้ครบก่อน seed

### ❌ Error: "Duplicate key value"
**แก้:** ลบข้อมูลเก่าก่อน:
```sql
-- ระวัง! จะลบข้อมูลทั้งหมด
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.enrollments CASCADE;
TRUNCATE TABLE public.courses CASCADE;
TRUNCATE TABLE public.user_badges CASCADE;
TRUNCATE TABLE public.badges CASCADE;
-- แล้ว run seed.sql อีกครั้ง
```

---

## 📈 ข้อมูลเพิ่มเติม

### จำนวนข้อมูลทั้งหมด:

| ตาราง | จำนวน |
|-------|-------|
| Users | 5 |
| Profiles | 5 |
| Courses | 3 |
| Modules | 5 |
| Lessons | 12 |
| Quizzes | 1 |
| Questions | 3 |
| Enrollments | 4 |
| Lesson Progress | 1 |
| Quiz Attempts | 1 |
| Reviews | 2 |
| Discussions | 2 |
| Badges | 5 |
| User Badges | 3 |
| Coupons | 3 |
| Payments | 2 |
| Certificates | 1 |

---

## 🎓 ตัวอย่างการใช้งาน

### Query ตัวอย่าง:

```sql
-- ดู courses ทั้งหมดพร้อม instructor
SELECT 
  c.title,
  p.full_name as instructor,
  c.price,
  c.total_students,
  c.rating
FROM public.courses c
JOIN public.profiles p ON p.user_id = c.instructor_id
WHERE c.status = 'published';

-- ดู enrollments ของ student
SELECT 
  p.full_name,
  c.title,
  e.progress,
  e.completed
FROM public.enrollments e
JOIN public.courses c ON c.id = e.course_id
JOIN public.profiles p ON p.user_id = e.user_id;

-- ดู leaderboard (top students by XP)
SELECT 
  full_name,
  total_xp,
  streak
FROM public.profiles
ORDER BY total_xp DESC
LIMIT 10;
```

---

## 🎯 Next Steps

หลังจาก seed data แล้ว:
1. ✅ ทดสอบ login ทุก role
2. ✅ ทดสอบ course listing
3. ✅ ทดสอบ enrollment
4. ✅ ทดสอบ dashboard

**พร้อมไปต่อข้อ 2: Protected Routes!** 🚀