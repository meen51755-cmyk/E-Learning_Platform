// src/hooks/useAuditLog.ts
// บันทึก audit log ทุกเหตุการณ์สำคัญ

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AuditEvent =
  | "login_success"
  | "login_failed"
  | "logout"
  | "password_changed"
  | "password_change_failed"
  | "profile_updated"
  | "avatar_uploaded"
  | "quiz_submitted"
  | "quiz_passed"
  | "quiz_failed"
  | "course_purchased"
  | "coupon_applied"
  | "register_success"
  | "session_expired"
  | "tab_switch_detected"
  | "rate_limit_hit"
  | "suspicious_input";

export const useAuditLog = () => {
  const { user } = useAuth();

  const log = useCallback(async (
    event: AuditEvent,
    metadata: Record<string, unknown> = {}
  ) => {
    const userId = user?.id;
    if (!userId) return;

    try {
      await supabase.rpc("log_event", {
        p_user_id: userId,
        p_event: event,
        p_metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent.slice(0, 200),
        },
      });
    } catch {
      // ไม่ให้ error จาก audit log กระทบการใช้งาน
      console.warn("Audit log failed:", event);
    }
  }, [user]);

  return { log };
};
