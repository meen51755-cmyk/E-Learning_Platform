import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CourseWithDetails {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  is_free: boolean;
  level: string;
  status: string;
  tags: string[];
  duration: string | null;
  total_lessons: number;
  rating: number;
  total_students: number;
  created_at: string;
  instructor_id: string;
  category_id: string | null;
  instructor_name?: string;
  category_name?: string;
}

export const useCourses = (filters?: {
  category?: string;
  level?: string;
  search?: string;
  isFree?: boolean;
}) => {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select(`
          *,
          categories ( name )
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (filters?.category && filters.category !== "ทั้งหมด") {
        query = query.eq("categories.name", filters.category);
      }
      if (filters?.level) {
        query = query.eq("level", filters.level as any);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.isFree !== undefined) {
        query = query.eq("is_free", filters.isFree);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch instructor names separately
      const courses = data || [];
      const instructorIds = [...new Set(courses.map((c: any) => c.instructor_id))];
      
      let profilesMap: Record<string, string> = {};
      if (instructorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", instructorIds);
        if (profiles) {
          profilesMap = Object.fromEntries(profiles.map(p => [p.user_id, p.full_name]));
        }
      }

      return courses.map((course: any) => ({
        ...course,
        instructor_name: profilesMap[course.instructor_id] || "ผู้สอน",
        category_name: course.categories?.name || "",
      })) as CourseWithDetails[];
    },
  });
};

export const useCourseDetail = (id: string) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .select(`
          *,
          categories ( name ),
          modules (
            *,
            lessons ( * ),
            quizzes (
              *,
              questions ( * )
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch instructor profile separately
      let instructor = null;
      if (course?.instructor_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", course.instructor_id)
          .single();
        instructor = profile;
      }

      return { ...course, profiles: instructor };
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });
};
