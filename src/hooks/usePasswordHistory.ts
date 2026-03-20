// src/hooks/usePasswordHistory.ts
// ป้องกันการตั้งรหัสผ่านซ้ำกับ 5 ครั้งล่าสุด
// หมายเหตุ: hash จริงทำฝั่ง server ด้วย bcrypt
// ฝั่ง client เราเก็บ hash แบบ simple เพื่อ UX เตือนก่อน

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Simple hash สำหรับ client-side check (ไม่ใช่ bcrypt)
const simpleHash = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const usePasswordHistory = () => {
  const { user } = useAuth();

  // ตรวจสอบว่ารหัสผ่านใหม่ซ้ำกับ 5 ครั้งล่าสุดไหม
  const checkPasswordHistory = useCallback(async (
    newPassword: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: true };

    try {
      const newHash = await simpleHash(newPassword);

      // ดึง password history 5 รายการล่าสุด
      const { data, error } = await supabase
        .from("password_history")
        .select("password_hash")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error || !data) return { ok: true };

      // เทียบ hash
      const isDuplicate = data.some((row) => row.password_hash === newHash);
      if (isDuplicate) {
        return {
          ok: false,
          error: "ไม่สามารถใช้รหัสผ่านที่เคยใช้ใน 5 ครั้งล่าสุดได้",
        };
      }

      return { ok: true };
    } catch {
      return { ok: true }; // ถ้า check ไม่ได้ให้ผ่านไปก่อน
    }
  }, [user]);

  // บันทึกรหัสผ่านใหม่ลง history
  const savePasswordHistory = useCallback(async (
    newPassword: string
  ): Promise<void> => {
    if (!user) return;

    try {
      const hash = await simpleHash(newPassword);

      await supabase.from("password_history").insert({
        user_id: user.id,
        password_hash: hash,
      });

      // ลบ history เก่าเกิน 5 รายการ
      const { data } = await supabase
        .from("password_history")
        .select("id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data && data.length > 5) {
        const toDelete = data.slice(5).map((r) => r.id);
        await supabase
          .from("password_history")
          .delete()
          .in("id", toDelete);
      }
    } catch {
      console.warn("Password history save failed");
    }
  }, [user]);

  return { checkPasswordHistory, savePasswordHistory };
};
