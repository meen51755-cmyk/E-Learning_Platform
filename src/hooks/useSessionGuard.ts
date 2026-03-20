// src/hooks/useSessionGuard.ts
// Single Session Enforcement — ตรวจสอบว่า session ปัจจุบันยังถูกต้องอยู่
// ถ้ามีการ login จากที่อื่น → บังคับ logout อัตโนมัติ

import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ── ตรวจจับ device/browser ──────────────────────────────────
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);

  let browser = "Unknown";
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  const deviceType = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";

  return { browser, os, deviceType };
};

// ── สร้าง session fingerprint ────────────────────────────────
const getSessionToken = () => {
  let token = sessionStorage.getItem("learnhub_session_token");
  if (!token) {
    token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("learnhub_session_token", token);
  }
  return token;
};

export const useSessionGuard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const sessionToken = useRef(getSessionToken());
  const isForceLogout = useRef(false);

  // ── บันทึก/อัปเดต session ───────────────────────────────────
  const registerSession = useCallback(async () => {
    if (!user) return;

    const device = getDeviceInfo();
    const token = sessionToken.current;

    await supabase
      .from("user_sessions")
      .upsert({
        user_id: user.id,
        last_seen: new Date().toISOString(),
        // เก็บ session token และ device info ใน metadata
        session_token: token,
        device_type: device.deviceType,
        browser: device.browser,
        os: device.os,
      }, { onConflict: "user_id" });
  }, [user]);

  // ── ตรวจสอบว่า session ยังถูกต้องอยู่ ──────────────────────
  const checkSession = useCallback(async () => {
    if (!user || isForceLogout.current) return;

    // เช็คว่า Supabase session ยังมีอยู่
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Session หมดอายุหรือถูก revoke จากที่อื่น
      isForceLogout.current = true;
      toast({
        title: "⚠️ Session หมดอายุ",
        description: "บัญชีของคุณถูก login จากที่อื่น กรุณา login ใหม่",
        variant: "destructive",
      });
      await signOut();
    }
  }, [user, signOut, toast]);

  // ── ฟัง realtime event เมื่อ session ถูก revoke ─────────────
  useEffect(() => {
    if (!user) return;

    registerSession();

    // ฟัง auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" && !isForceLogout.current) {
          // Session ถูก revoke จากที่อื่น
          toast({
            title: "⚠️ ถูก Logout อัตโนมัติ",
            description: "มีการเข้าสู่ระบบจากอุปกรณ์อื่น",
            variant: "destructive",
          });
        }

        if (event === "TOKEN_REFRESHED") {
          // อัปเดต session ทุกครั้งที่ token refresh
          registerSession();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [user, registerSession, toast]);

  // ── Heartbeat — อัปเดต last_seen ทุก 2 นาที ─────────────────
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      registerSession();
      checkSession();
    }, 2 * 60 * 1000); // 2 นาที

    return () => clearInterval(interval);
  }, [user, registerSession, checkSession]);

  // ── ตรวจเมื่อ tab กลับมา focus ──────────────────────────────
  useEffect(() => {
    if (!user) return;

    const handleFocus = () => {
      checkSession();
      registerSession();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) handleFocus();
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [user, checkSession, registerSession]);
};
