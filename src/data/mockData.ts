// Mock data for the e-learning platform
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  price: number;
  isFree: boolean;
  rating: number;
  totalStudents: number;
  totalLessons: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  modules: Module[];
  progress?: number;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz?: Quiz;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'pdf';
  duration: string;
  completed?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  timeLimit: number;
  attemptLimit: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'essay';
  choices?: Choice[];
  correctAnswer?: string;
}

export interface Choice {
  id: string;
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'student' | 'instructor' | 'admin';
  avatar: string;
  enrolledCourses?: string[];
  badges?: Badge[];
  streak?: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

export interface RankingEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  time: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  completionRate: number;
  averageScore: number;
  revenue: number;
}

// Sample courses
export const sampleCourses: Course[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    description: 'เรียนรู้การพัฒนาเว็บแอปพลิเคชันตั้งแต่พื้นฐานจนถึงระดับสูง ครอบคลุม HTML, CSS, JavaScript, React, Node.js',
    instructor: 'อาจารย์สมชาย ใจดี',
    instructorAvatar: '',
    thumbnail: '',
    price: 0,
    isFree: true,
    rating: 4.8,
    totalStudents: 12500,
    totalLessons: 120,
    duration: '42 ชม.',
    level: 'beginner',
    category: 'Web Development',
    tags: ['HTML', 'CSS', 'JavaScript', 'React'],
    modules: [
      {
        id: 'm1',
        title: 'บทนำ - เริ่มต้น Web Development',
        lessons: [
          { id: 'l1', title: 'ทำความรู้จักกับ Web Development', type: 'video', duration: '15 นาที', completed: true },
          { id: 'l2', title: 'ติดตั้งเครื่องมือที่จำเป็น', type: 'video', duration: '20 นาที', completed: true },
          { id: 'l3', title: 'โครงสร้างของเว็บไซต์', type: 'article', duration: '10 นาที' },
        ],
      },
      {
        id: 'm2',
        title: 'HTML พื้นฐาน',
        lessons: [
          { id: 'l4', title: 'แท็ก HTML เบื้องต้น', type: 'video', duration: '25 นาที' },
          { id: 'l5', title: 'ฟอร์มและ Input', type: 'video', duration: '30 นาที' },
          { id: 'l6', title: 'เอกสารอ้างอิง HTML', type: 'pdf', duration: '15 นาที' },
        ],
        quiz: {
          id: 'q1',
          title: 'แบบทดสอบ HTML พื้นฐาน',
          timeLimit: 30,
          attemptLimit: 3,
          questions: [
            {
              id: 'q1-1',
              text: 'แท็ก HTML ใดใช้สำหรับสร้างหัวข้อหลัก?',
              type: 'multiple-choice',
              choices: [
                { id: 'a', text: '<h1>' },
                { id: 'b', text: '<header>' },
                { id: 'c', text: '<head>' },
                { id: 'd', text: '<title>' },
              ],
              correctAnswer: 'a',
            },
            {
              id: 'q1-2',
              text: 'แท็ก <a> ใช้สำหรับทำอะไร?',
              type: 'multiple-choice',
              choices: [
                { id: 'a', text: 'สร้างรูปภาพ' },
                { id: 'b', text: 'สร้างลิงก์' },
                { id: 'c', text: 'สร้างตาราง' },
                { id: 'd', text: 'สร้างรายการ' },
              ],
              correctAnswer: 'b',
            },
          ],
        },
      },
    ],
    progress: 35,
  },
  {
    id: '2',
    title: 'Data Science with Python',
    description: 'เจาะลึก Data Science ด้วย Python ตั้งแต่พื้นฐานไปจนถึง Machine Learning',
    instructor: 'ดร.วิชัย นักวิจัย',
    instructorAvatar: '',
    thumbnail: '',
    price: 1990,
    isFree: false,
    rating: 4.9,
    totalStudents: 8300,
    totalLessons: 85,
    duration: '35 ชม.',
    level: 'intermediate',
    category: 'Data Science',
    tags: ['Python', 'Machine Learning', 'AI'],
    modules: [],
    progress: 0,
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass',
    description: 'ออกแบบ UI/UX อย่างมืออาชีพ เรียนรู้ Figma, Design Thinking, User Research',
    instructor: 'อ.ณัฐพร ดีไซน์',
    instructorAvatar: '',
    thumbnail: '',
    price: 2490,
    isFree: false,
    rating: 4.7,
    totalStudents: 5600,
    totalLessons: 65,
    duration: '28 ชม.',
    level: 'beginner',
    category: 'Design',
    tags: ['Figma', 'UI', 'UX', 'Design'],
    modules: [],
  },
  {
    id: '4',
    title: 'Advanced React & TypeScript',
    description: 'พัฒนาทักษะ React และ TypeScript ระดับสูง พร้อม Design Patterns และ Best Practices',
    instructor: 'อาจารย์สมชาย ใจดี',
    instructorAvatar: '',
    thumbnail: '',
    price: 0,
    isFree: true,
    rating: 4.6,
    totalStudents: 3200,
    totalLessons: 50,
    duration: '20 ชม.',
    level: 'advanced',
    category: 'Web Development',
    tags: ['React', 'TypeScript', 'Advanced'],
    modules: [],
  },
  {
    id: '5',
    title: 'Mobile App Development with Flutter',
    description: 'สร้างแอปมือถือด้วย Flutter สำหรับ iOS และ Android ในโปรเจกต์เดียว',
    instructor: 'อ.ปราโมทย์ โค้ด',
    instructorAvatar: '',
    thumbnail: '',
    price: 1790,
    isFree: false,
    rating: 4.5,
    totalStudents: 4100,
    totalLessons: 72,
    duration: '30 ชม.',
    level: 'intermediate',
    category: 'Mobile Development',
    tags: ['Flutter', 'Dart', 'Mobile'],
    modules: [],
  },
  {
    id: '6',
    title: 'Cybersecurity Fundamentals',
    description: 'เรียนรู้พื้นฐานความปลอดภัยทางไซเบอร์ การป้องกันภัยคุกคาม และ Ethical Hacking',
    instructor: 'อ.ธีรภัทร ซีเคียว',
    instructorAvatar: '',
    thumbnail: '',
    price: 2990,
    isFree: false,
    rating: 4.8,
    totalStudents: 2800,
    totalLessons: 48,
    duration: '22 ชม.',
    level: 'intermediate',
    category: 'Cybersecurity',
    tags: ['Security', 'Hacking', 'Network'],
    modules: [],
  },
];

export const sampleRanking: RankingEntry[] = [
  { rank: 1, userId: 'u1', name: 'สมศักดิ์ เก่งมาก', avatar: '', score: 98, time: '12:30' },
  { rank: 2, userId: 'u2', name: 'สุดา ฉลาดดี', avatar: '', score: 95, time: '14:15' },
  { rank: 3, userId: 'u3', name: 'ประยุทธ์ ขยันเรียน', avatar: '', score: 92, time: '15:45' },
  { rank: 4, userId: 'u4', name: 'นิชา ตั้งใจ', avatar: '', score: 88, time: '18:20' },
  { rank: 5, userId: 'u5', name: 'วรากร พยายาม', avatar: '', score: 85, time: '20:10' },
];

export const categories = [
  'ทั้งหมด',
  'Web Development',
  'Data Science',
  'Design',
  'Mobile Development',
  'Cybersecurity',
  'Business',
  'Marketing',
];

export const dashboardStats: DashboardStats = {
  totalStudents: 45200,
  totalCourses: 320,
  completionRate: 72,
  averageScore: 81,
  revenue: 2450000,
};
