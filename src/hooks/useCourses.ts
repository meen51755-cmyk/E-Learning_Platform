import { useQuery } from "@tanstack/react-query";
import { sampleCourses, categories } from "@/data/mockData";

// interface ที่ตรงกับ CourseCard ต้องการ
export interface CourseWithDetails {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  price: number;
  is_free: boolean;
  level: string;
  rating: number;
  total_students: number;
  thumbnail_url?: string;
  category_name?: string;
  duration?: string;
  total_lessons?: number;
}

export interface Category {
  id: string;
  name: string;
}

interface UseCoursesOptions {
  search?: string;
  level?: string;
  isFree?: boolean;
}

// map mockData → CourseWithDetails
const toDetails = (c: typeof sampleCourses[0]): CourseWithDetails => ({
  id: c.id,
  title: c.title,
  description: c.description,
  instructor_name: c.instructor,
  price: c.price,
  is_free: c.isFree,
  level: c.level,
  rating: c.rating,
  total_students: c.totalStudents,
  thumbnail_url: c.thumbnail || undefined,
  category_name: c.category,
  duration: c.duration,
  total_lessons: c.totalLessons,
});

export const useCourses = (options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ["courses", options],
    queryFn: async (): Promise<CourseWithDetails[]> => {
      let result = [...sampleCourses];

      if (options.search) {
        const q = options.search.toLowerCase();
        result = result.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.instructor.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q)
        );
      }

      if (options.level) {
        result = result.filter((c) => c.level === options.level);
      }

      if (options.isFree !== undefined) {
        result = result.filter((c) => c.isFree === options.isFree);
      }

      return result.map(toDetails);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      return categories
        .filter((name) => name !== "ทั้งหมด")
        .map((name, i) => ({ id: String(i + 1), name }));
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async (): Promise<CourseWithDetails | null> => {
      const c = sampleCourses.find((c) => c.id === id);
      return c ? toDetails(c) : null;
    },
    enabled: !!id,
  });
};
