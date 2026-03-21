// วางไว้ใน public/theme-init.js
// รัน script นี้ก่อน React load เพื่อป้องกัน flash of wrong theme
(function() {
  try {
    var theme = localStorage.getItem("learnhub_theme") || "system";
    var isDark = theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) document.documentElement.classList.add("dark");
  } catch(e) {}
})();
