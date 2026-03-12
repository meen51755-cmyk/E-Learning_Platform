-- =============================================
-- LEARNHUB - SEED DATA
-- =============================================
-- สร้างข้อมูลตัวอย่างสำหรับทดสอบระบบ
-- =============================================

-- =============================================
-- 1. USERS & PROFILES (ผ่าน Supabase Auth)
-- =============================================
-- หมายเหตุ: Users จะถูกสร้างผ่าน Supabase Auth UI หรือ API
-- ข้อมูลด้านล่างนี้สมมติว่ามี users แล้ว 5 คน:
-- 1. Admin: admin@learnhub.com (UUID จะถูกสร้างอัตโนมัติ)
-- 2. Instructor 1: john.doe@learnhub.com
-- 3. Instructor 2: jane.smith@learnhub.com
-- 4. Student 1: alice.wong@learnhub.com
-- 5. Student 2: bob.chen@learnhub.com

-- สำหรับการทดสอบ ให้สร้าง users ผ่าน Supabase Dashboard หรือใช้ script นี้:
/*
ใน Supabase Dashboard → Authentication → Users → Add User:
1. admin@learnhub.com / password: Admin123!
2. john.doe@learnhub.com / password: Teacher123!
3. jane.smith@learnhub.com / password: Teacher123!
4. alice.wong@learnhub.com / password: Student123!
5. bob.chen@learnhub.com / password: Student123!
*/

-- หลังจากสร้าง users แล้ว ให้ update profiles (เปลี่ยน UUID ให้ตรงกับ users จริง)
-- ตัวอย่างการ insert profiles (ใช้หลังจากมี users แล้ว):

-- UPDATE public.profiles SET 
--   full_name = 'Admin User',
--   bio = 'Platform Administrator',
--   streak = 0,
--   total_xp = 0
-- WHERE user_id = '[ADMIN_UUID]';

-- =============================================
-- 2. USER ROLES
-- =============================================
-- เพิ่ม roles สำหรับ users (แทน UUID ด้วย UUID จริงจาก auth.users)

-- ตัวอย่าง (ต้องแทน UUID):
-- INSERT INTO public.user_roles (user_id, role) VALUES
--   ('[ADMIN_UUID]', 'admin'),
--   ('[INSTRUCTOR1_UUID]', 'instructor'),
--   ('[INSTRUCTOR2_UUID]', 'instructor'),
--   ('[STUDENT1_UUID]', 'student'),
--   ('[STUDENT2_UUID]', 'student');

-- =============================================
-- 3. CATEGORIES
-- =============================================
-- Categories ถูกสร้างไว้แล้วใน migration
-- แต่ถ้าต้องการเพิ่ม:

INSERT INTO public.categories (name, slug) VALUES
  ('Programming', 'programming'),
  ('AI & Machine Learning', 'ai-machine-learning'),
  ('Cloud Computing', 'cloud-computing'),
  ('UI/UX Design', 'ui-ux-design')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 4. COURSES
-- =============================================
-- หมายเหตุ: แทน instructor_id ด้วย UUID จริง

-- สำหรับการทดสอบ ให้ใช้ function นี้หาก instructor UUID:
-- SELECT id FROM auth.users WHERE email = 'john.doe@learnhub.com';

-- ตัวอย่าง courses (ต้องแทน instructor_id):
/*
INSERT INTO public.courses (
  instructor_id, 
  title, 
  description, 
  thumbnail_url,
  price, 
  is_free, 
  level, 
  category_id, 
  status,
  tags,
  duration,
  total_lessons,
  rating
) VALUES
(
  '[INSTRUCTOR1_UUID]',
  'Complete Web Development Bootcamp 2024',
  'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build 10+ real-world projects and become a professional full-stack developer.',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
  2990,
  false,
  'beginner',
  (SELECT id FROM public.categories WHERE slug = 'web-development'),
  'published',
  ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
  '40 hours',
  120,
  4.8
),
(
  '[INSTRUCTOR1_UUID]',
  'Python for Data Science',
  'Master Python programming for data analysis, visualization, and machine learning. Learn NumPy, Pandas, Matplotlib, and Scikit-learn.',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
  1990,
  false,
  'intermediate',
  (SELECT id FROM public.categories WHERE slug = 'data-science'),
  'published',
  ARRAY['Python', 'Data Science', 'Machine Learning'],
  '25 hours',
  80,
  4.7
),
(
  '[INSTRUCTOR2_UUID]',
  'UI/UX Design Fundamentals',
  'Learn the principles of user interface and user experience design. Master Figma, create wireframes, prototypes, and design systems.',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5',
  0,
  true,
  'beginner',
  (SELECT id FROM public.categories WHERE slug = 'design'),
  'published',
  ARRAY['UI/UX', 'Figma', 'Design'],
  '15 hours',
  50,
  4.9
),
(
  '[INSTRUCTOR2_UUID]',
  'Advanced React Patterns',
  'Deep dive into React hooks, context, custom hooks, performance optimization, and advanced patterns for building scalable applications.',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
  2490,
  false,
  'advanced',
  (SELECT id FROM public.categories WHERE slug = 'web-development'),
  'published',
  ARRAY['React', 'JavaScript', 'Advanced'],
  '30 hours',
  90,
  4.6
),
(
  '[INSTRUCTOR1_UUID]',
  'Introduction to Cybersecurity',
  'Learn the basics of cybersecurity, ethical hacking, network security, and how to protect systems from common threats.',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
  1490,
  false,
  'beginner',
  (SELECT id FROM public.categories WHERE slug = 'cybersecurity'),
  'published',
  ARRAY['Security', 'Ethical Hacking', 'Networks'],
  '20 hours',
  60,
  4.5
);
*/

-- =============================================
-- 5. SEED DATA SCRIPT สำหรับใช้จริง
-- =============================================
-- Script นี้จะ insert ข้อมูลโดยอัตโนมัติหลังจากมี users

DO $$
DECLARE
  admin_id UUID;
  instructor1_id UUID;
  instructor2_id UUID;
  student1_id UUID;
  student2_id UUID;
  
  course1_id UUID;
  course2_id UUID;
  course3_id UUID;
  
  module1_id UUID;
  module2_id UUID;
  
  lesson1_id UUID;
  lesson2_id UUID;
  
  quiz1_id UUID;
  
  cat_webdev_id UUID;
  cat_datascience_id UUID;
  cat_design_id UUID;
BEGIN
  -- หา user IDs จาก email (ถ้ามี users แล้ว)
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@learnhub.com' LIMIT 1;
  SELECT id INTO instructor1_id FROM auth.users WHERE email = 'john.doe@learnhub.com' LIMIT 1;
  SELECT id INTO instructor2_id FROM auth.users WHERE email = 'jane.smith@learnhub.com' LIMIT 1;
  SELECT id INTO student1_id FROM auth.users WHERE email = 'alice.wong@learnhub.com' LIMIT 1;
  SELECT id INTO student2_id FROM auth.users WHERE email = 'bob.chen@learnhub.com' LIMIT 1;

  -- ถ้าไม่มี users ให้ skip (จะต้องสร้าง users ก่อน)
  IF admin_id IS NULL THEN
    RAISE NOTICE 'Please create users first via Supabase Auth Dashboard';
    RETURN;
  END IF;

  -- อัพเดท profiles
  UPDATE public.profiles SET 
    full_name = 'Admin User',
    bio = 'Platform Administrator',
    total_xp = 1000
  WHERE user_id = admin_id;

  UPDATE public.profiles SET 
    full_name = 'John Doe',
    bio = 'Full-Stack Developer & Instructor with 10+ years of experience',
    total_xp = 5000
  WHERE user_id = instructor1_id;

  UPDATE public.profiles SET 
    full_name = 'Jane Smith',
    bio = 'UI/UX Designer & Creative Director',
    total_xp = 4500
  WHERE user_id = instructor2_id;

  UPDATE public.profiles SET 
    full_name = 'Alice Wong',
    bio = 'Aspiring Web Developer',
    total_xp = 800,
    streak = 5
  WHERE user_id = student1_id;

  UPDATE public.profiles SET 
    full_name = 'Bob Chen',
    bio = 'Data Science Enthusiast',
    total_xp = 1200,
    streak = 10
  WHERE user_id = student2_id;

  -- เพิ่ม roles
  INSERT INTO public.user_roles (user_id, role) VALUES
    (admin_id, 'admin'),
    (instructor1_id, 'instructor'),
    (instructor2_id, 'instructor')
  ON CONFLICT DO NOTHING;

  -- หา category IDs
  SELECT id INTO cat_webdev_id FROM public.categories WHERE slug = 'web-development';
  SELECT id INTO cat_datascience_id FROM public.categories WHERE slug = 'data-science';
  SELECT id INTO cat_design_id FROM public.categories WHERE slug = 'design';

  -- สร้าง courses
  INSERT INTO public.courses (
    instructor_id, title, description, thumbnail_url, price, is_free, 
    level, category_id, status, tags, duration, total_lessons, rating, total_students
  ) VALUES
  (
    instructor1_id,
    'Complete Web Development Bootcamp 2024',
    'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build 10+ real-world projects and become a professional full-stack developer.',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    2990, false, 'beginner', cat_webdev_id, 'published',
    ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    '40 hours', 120, 4.8, 1250
  ),
  (
    instructor1_id,
    'Python for Data Science',
    'Master Python programming for data analysis, visualization, and machine learning.',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    1990, false, 'intermediate', cat_datascience_id, 'published',
    ARRAY['Python', 'Data Science', 'ML'],
    '25 hours', 80, 4.7, 980
  ),
  (
    instructor2_id,
    'UI/UX Design Fundamentals - FREE',
    'Learn the principles of user interface and user experience design. Master Figma.',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    0, true, 'beginner', cat_design_id, 'published',
    ARRAY['UI/UX', 'Figma', 'Design'],
    '15 hours', 50, 4.9, 2100
  )
  RETURNING id INTO course1_id;

  -- ดึง course IDs
  SELECT id INTO course1_id FROM public.courses WHERE title LIKE 'Complete Web%' LIMIT 1;
  SELECT id INTO course2_id FROM public.courses WHERE title LIKE 'Python for%' LIMIT 1;
  SELECT id INTO course3_id FROM public.courses WHERE title LIKE 'UI/UX Design%' LIMIT 1;

  -- สร้าง modules สำหรับ course 1
  INSERT INTO public.modules (course_id, title, sort_order) VALUES
    (course1_id, 'Introduction to Web Development', 1),
    (course1_id, 'HTML & CSS Fundamentals', 2),
    (course1_id, 'JavaScript Basics', 3),
    (course1_id, 'React Framework', 4),
    (course1_id, 'Backend with Node.js', 5)
  RETURNING id INTO module1_id;

  SELECT id INTO module1_id FROM public.modules WHERE course_id = course1_id ORDER BY sort_order LIMIT 1;
  SELECT id INTO module2_id FROM public.modules WHERE course_id = course1_id ORDER BY sort_order OFFSET 1 LIMIT 1;

  -- สร้าง lessons สำหรับ module 1
  INSERT INTO public.lessons (module_id, title, type, content_url, duration, sort_order) VALUES
    (module1_id, 'Welcome to the Course', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '5:30', 1),
    (module1_id, 'What is Web Development?', 'article', NULL, '10:00', 2),
    (module1_id, 'Setting Up Your Environment', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', '12:45', 3),
    (module1_id, 'Course Resources', 'pdf', NULL, '5:00', 4);

  -- สร้าง lessons สำหรับ module 2  
  INSERT INTO public.lessons (module_id, title, type, content_url, duration, sort_order) VALUES
    (module2_id, 'HTML Basics', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', '15:20', 1),
    (module2_id, 'CSS Introduction', 'video', NULL, '18:30', 2),
    (module2_id, 'Building Your First Page', 'article', NULL, '20:00', 3);

  SELECT id INTO lesson1_id FROM public.lessons WHERE module_id = module1_id LIMIT 1;

  -- สร้าง quiz
  INSERT INTO public.quizzes (course_id, module_id, title, time_limit, attempt_limit) VALUES
    (course1_id, module1_id, 'Introduction Quiz', 15, 3)
  RETURNING id INTO quiz1_id;

  -- สร้าง questions
  INSERT INTO public.questions (quiz_id, text, type, choices, correct_answer, sort_order) VALUES
    (
      quiz1_id,
      'What does HTML stand for?',
      'multiple-choice',
      '[
        {"id": "a", "text": "Hyper Text Markup Language"},
        {"id": "b", "text": "High Tech Modern Language"},
        {"id": "c", "text": "Home Tool Markup Language"},
        {"id": "d", "text": "Hyperlinks and Text Markup Language"}
      ]'::jsonb,
      'a',
      1
    ),
    (
      quiz1_id,
      'Which language is used for styling web pages?',
      'multiple-choice',
      '[
        {"id": "a", "text": "HTML"},
        {"id": "b", "text": "CSS"},
        {"id": "c", "text": "JavaScript"},
        {"id": "d", "text": "Python"}
      ]'::jsonb,
      'b',
      2
    ),
    (
      quiz1_id,
      'What is your goal in learning web development?',
      'essay',
      '[]'::jsonb,
      NULL,
      3
    );

  -- สร้าง enrollments
  INSERT INTO public.enrollments (user_id, course_id, progress, completed) VALUES
    (student1_id, course1_id, 25, false),
    (student1_id, course3_id, 60, false),
    (student2_id, course2_id, 10, false),
    (student2_id, course3_id, 100, true);

  -- สร้าง lesson progress
  INSERT INTO public.lesson_progress (user_id, lesson_id, completed, completed_at) VALUES
    (student1_id, lesson1_id, true, NOW() - INTERVAL '2 days');

  -- สร้าง quiz attempt
  INSERT INTO public.quiz_attempts (user_id, quiz_id, answers, score, started_at, submitted_at, tab_switches) VALUES
    (
      student1_id, 
      quiz1_id, 
      '[{"question_id": 1, "answer": "a"}, {"question_id": 2, "answer": "b"}]'::jsonb,
      100,
      NOW() - INTERVAL '1 day',
      NOW() - INTERVAL '23 hours',
      0
    );

  -- สร้าง reviews
  INSERT INTO public.reviews (user_id, course_id, rating, comment) VALUES
    (student1_id, course3_id, 5, 'Amazing course! Very clear explanations and great examples.'),
    (student2_id, course3_id, 5, 'Perfect for beginners. Highly recommended!');

  -- สร้าง discussions
  INSERT INTO public.discussions (user_id, course_id, title, content, likes) VALUES
    (student1_id, course1_id, 'Question about React Hooks', 'Can someone explain the difference between useState and useEffect?', 5),
    (student2_id, course2_id, 'Best resources for practicing Python?', 'What are some good platforms to practice Python coding?', 3);

  -- สร้าง badges
  INSERT INTO public.badges (name, description, icon, xp_required) VALUES
    ('First Steps', 'Complete your first lesson', '🎯', 0),
    ('Quiz Master', 'Score 100% on any quiz', '🏆', 100),
    ('Course Completer', 'Complete your first course', '🎓', 500),
    ('Streak Warrior', 'Maintain a 7-day learning streak', '🔥', 200),
    ('Community Helper', 'Get 10 likes on your discussion posts', '❤️', 300);

  -- สร้าง user badges
  INSERT INTO public.user_badges (user_id, badge_id) VALUES
    (student1_id, (SELECT id FROM public.badges WHERE name = 'First Steps')),
    (student2_id, (SELECT id FROM public.badges WHERE name = 'First Steps')),
    (student2_id, (SELECT id FROM public.badges WHERE name = 'Course Completer'));

  -- สร้าง coupons
  INSERT INTO public.coupons (code, discount_percent, max_uses, expires_at, is_active) VALUES
    ('WELCOME50', 50, 100, NOW() + INTERVAL '30 days', true),
    ('STUDENT20', 20, NULL, NOW() + INTERVAL '90 days', true),
    ('FLASH30', 30, 50, NOW() + INTERVAL '7 days', true);

  -- สร้าง payments (สำหรับ student ที่ซื้อคอร์ส)
  INSERT INTO public.payments (user_id, course_id, amount, status, payment_method, transaction_ref) VALUES
    (student1_id, course1_id, 1495, 'completed', 'credit_card', 'TXN-' || gen_random_uuid()::text),
    (student2_id, course2_id, 1990, 'completed', 'promptpay', 'TXN-' || gen_random_uuid()::text);

  -- สร้าง certificate
  INSERT INTO public.certificates (user_id, course_id, certificate_url) VALUES
    (student2_id, course3_id, 'https://example.com/certificates/cert-' || student2_id::text || '.pdf');

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Admin: admin@learnhub.com';
  RAISE NOTICE 'Instructor 1: john.doe@learnhub.com';
  RAISE NOTICE 'Instructor 2: jane.smith@learnhub.com';
  RAISE NOTICE 'Student 1: alice.wong@learnhub.com (enrolled in 2 courses)';
  RAISE NOTICE 'Student 2: bob.chen@learnhub.com (completed 1 course)';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RAISE NOTICE 'Make sure users are created in Supabase Auth first!';
END $$;