import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-fade-in-up">
      <div className="container mx-auto max-w-4xl">
        <div className="card-elevated p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-border shadow-xl">
          <Cookie className="w-8 h-8 text-warning shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium">เว็บไซต์นี้ใช้คุกกี้</p>
            <p className="text-xs text-muted-foreground mt-1">
              เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งาน วิเคราะห์การเข้าชม และแสดงเนื้อหาที่เหมาะสม{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</Link>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={decline}>ปฏิเสธ</Button>
            <Button size="sm" onClick={accept}>ยอมรับทั้งหมด</Button>
          </div>
          <button onClick={decline} className="absolute top-2 right-2 sm:hidden p-1">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
