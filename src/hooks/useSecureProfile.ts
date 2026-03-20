// src/hooks/useSecureProfile.ts
// ดึง profile เฉพาะ field ที่จำเป็น — ไม่ expose sensitive data โดยไม่จำเป็น

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Public profile — ใช้แสดงให้คนอื่นเห็น (ไม่มี phone/email)
export interface PublicProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  streak: number;
  total_xp: number;
}

// Private profile — ใช้เฉพาะเจ้าของบัญชี
export interface PrivateProfile extends PublicProfile {
  phone: string | null;
  website: string | null;
  facebook: string | null;
  youtube: string | null;
}

// ── ดึง public profile ของ user คนอื่น ──────────────────────
export const usePublicProfile = (userId: string) => {
  return useQuery({
    queryKey: ["public-profile", userId],
    queryFn: async (): Promise<PublicProfile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, streak, total_xp") // ✅ ไม่ดึง phone/email
        .eq("user_id", userId)
        .single();

      if (error || !data) return null;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

// ── ดึง private profile ของตัวเอง ───────────────────────────
export const usePrivateProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["private-profile", user?.id],
    queryFn: async (): Promise<PrivateProfile | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, streak, total_xp, phone, website, facebook, youtube")
        .eq("user_id", user.id) // ✅ RLS จะป้องกัน user อื่นเข้าถึงได้อยู่แล้ว
        .single();

      if (error || !data) return null;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
};

// ── mask ข้อมูล sensitive สำหรับแสดงบนหน้าจอ ───────────────
export const maskPhone = (phone: string | null): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 3)}-***-${digits.slice(7)}`;
};

export const maskEmail = (email: string | null): string => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const masked = local.slice(0, 2) + "***";
  return `${masked}@${domain}`;
};
