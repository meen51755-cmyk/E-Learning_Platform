import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sampleCourses, categories } from "@/data/mockData";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  isFree: boolean;
  level: string;
  rating: number;
  totalStudents: number;
  thumbnail?: string;
  category_name?: string;
  duration?: string;
  totalLessons?: number;
}

export interface Category {
  id: string;
  name: string;
}

interface UseCoursesOptions {
  search?: string;
  level?: string;
  isFree?: boolean;
  category?: string;
}

// ── useCourses ────────────────────────────────────────────────
export const useCourses = (options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ["courses", options],
    queryFn: async (): Promise<Course[]> => {
      // TODO: ดึงจาก Supabase เมื่อมี courses table จริง
      // const { data, error } = await supabase
      //   .from("courses")
      //   .select("*, categories(name)")
      //   .eq(options.isFree !== undefined ? "is_free" : "", options.isFree)
      //   .ilike(options.search ? "title" : "", `%${options.search}%`)

      // ตอนนี้ใช้ mockData ก่อน
      let result = sampleCourses.map((c) => ({
        ...c,
        category_name: c.category,
      }));

      // filter search
      if (options.search) {
        const q = options.search.toLowerCase();
        result = result.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.instructor.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q)
        );
      }

      // filter level
      if (options.level) {
        result = result.filter(
          (c) => c.level.toLowerCase() === options.level!.toLowerCase()
        );
      }

      // filter price
      if (options.isFree !== undefined) {
        result = result.filter((c) => c.isFree === options.isFree);
      }

      return result;
    },
    staleTime: 1000 * 60 * 5, // cache 5 นาที
  });
};

// ── useCategories ─────────────────────────────────────────────
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      // TODO: ดึงจาก Supabase เมื่อมี categories table จริง
      // const { data } = await supabase.from("categories").select("*")

      // ตอนนี้ใช้ mockData ก่อน
      return categories.map((name, i) => ({
        id: String(i + 1),
        name,
      }));
    },
    staleTime: 1000 * 60 * 10,
  });
};

// ── useCourse (single) ────────────────────────────────────────
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async (): Promise<Course | null> => {
      const course = sampleCourses.find((c) => c.id === id);
      if (!course) return null;
      return { ...course, category_name: course.category };
    },
    enabled: !!id,
  });
};