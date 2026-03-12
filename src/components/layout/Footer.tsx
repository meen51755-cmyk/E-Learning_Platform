import { Link } from "react-router-dom";
import { BookOpen, Facebook, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto container-padding section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold">LearnHub</span>
            </div>
            <p className="text-sm opacity-70">
              แพลตฟอร์มการเรียนรู้ออนไลน์ที่ดีที่สุด เรียนได้ทุกที่ทุกเวลา
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">เรียนรู้</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/courses" className="hover:opacity-100 transition-opacity">คอร์สทั้งหมด</Link></li>
              <li><Link to="/ranking" className="hover:opacity-100 transition-opacity">Ranking</Link></li>
              <li><Link to="/certificate" className="hover:opacity-100 transition-opacity">Certificates</Link></li>
              <li><Link to="/api-docs" className="hover:opacity-100 transition-opacity">API Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">สำหรับผู้สอน</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/instructor/dashboard" className="hover:opacity-100 transition-opacity">เริ่มสอน</Link></li>
              <li><Link to="/community" className="hover:opacity-100 transition-opacity">ชุมชน</Link></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">คู่มือผู้สอน</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">ช่วยเหลือ</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/profile" className="hover:opacity-100 transition-opacity">ตั้งค่าบัญชี</Link></li>
              <li><Link to="/privacy-policy" className="hover:opacity-100 transition-opacity">นโยบายความเป็นส่วนตัว</Link></li>
              <li><Link to="/terms-of-service" className="hover:opacity-100 transition-opacity">เงื่อนไขการใช้บริการ</Link></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">ติดต่อเรา</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-50">
          <p>© 2026 LearnHub. All rights reserved.</p>
          <p>Made with ❤️ in Thailand</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
