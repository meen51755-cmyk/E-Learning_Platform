// src/hooks/useTheme.ts
import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("learnhub_theme") as Theme) || "system";
    } catch {
      return "system";
    }
  });

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const isDark =
      t === "dark" ||
      (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.classList.toggle("dark", isDark);
  };

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem("learnhub_theme", theme); } catch {}
  }, [theme]);

  // ฟัง system preference เปลี่ยน
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return { theme, setTheme, isDark };
};
