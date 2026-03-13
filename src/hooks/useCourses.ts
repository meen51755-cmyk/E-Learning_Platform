import { useQuery } from "@tanstack/react-query";
import { sampleCourses, categories, type Course } from "@/data/mockData";

export type { Course };

export interface Category {
  id: string;
  name: string;
}

interface UseCoursesOptions {
  search?: string;
  level?: string;
  isFree?: boolean;
}

export const useCourses = (options: UseCoursesOptions = {}) => {
  return useQuery({
    queryKey: ["courses", options],
    queryFn: async (): Promise<Course[]> => {
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

      return result;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      // กรอง "ทั้งหมด" ออก เพราะ Courses.tsx จัดการเองอยู่แล้ว
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
    queryFn: async (): Promise<Course | null> => {
      return sampleCourses.find((c) => c.id === id) ?? null;
    },
    enabled: !!id,
  });
};
