import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Search, Menu, X, BookOpen, Code, User, LogOut,
  LayoutDashboard, GraduationCap, ShieldCheck, Bell
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, roles, signOut, loading } = useAuth();

  const navLinks = [
    { path: "/courses",   label: "คอร์สเรียน" },
    { path: "/ranking",   label: "Ranking" },
    { path: "/community", label: "ชุมชน" },
    { path: "/api-docs",  label: "API Docs", icon: true },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (roles.includes("admin"))       return "/admin/dashboard";
    if (roles.includes("instructor"))  return "/instructor/dashboard";
    return "/dashboard";
  };

  const isInstructor = roles.includes("instructor") || roles.includes("admin");
  const isAdmin      = roles.includes("admin");

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "";
  const avatarUrl   = profile?.avatar_url;
  const initials    = displayName.charAt(0).toUpperCase() || "?";

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="container mx-auto container-padding">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">LearnHub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                  location.pathname.startsWith(link.path)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.icon && <Code className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/courses">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
            </Link>

            {!loading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 pl-1">
                    {/* Avatar */}
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {initials}
                      </div>
                    )}
                    <span className="max-w-[120px] truncate text-sm">{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  {/* Role badge */}
                  <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground font-normal">
                    {isAdmin
                      ? <><ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> Administrator</>
                      : isInstructor
                      ? <><GraduationCap className="w-3.5 h-3.5 text-violet-500" /> Instructor</>
                      : <><User className="w-3.5 h-3.5 text-primary" /> Student</>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Dashboard */}
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>

                  {/* Instructor: คอร์สของฉัน */}
                  {isInstructor && (
                    <DropdownMenuItem onClick={() => navigate("/instructor/courses")}>
                      <GraduationCap className="w-4 h-4 mr-2" /> คอร์สของฉัน
                    </DropdownMenuItem>
                  )}

                  {/* Admin: Admin panel */}
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                      <ShieldCheck className="w-4 h-4 mr-2" /> Admin Panel
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" /> โปรไฟล์
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !loading ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">เข้าสู่ระบบ</Button>
                </Link>
                <Link to="/register">
                  <Button variant="hero" size="sm">สมัครสมาชิก</Button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith(link.path)
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-border space-y-2">
              {user ? (
                <>
                  <Link to={getDashboardPath()} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </Button>
                  </Link>
                  {isInstructor && (
                    <Link to="/instructor/courses" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full" size="sm">
                        <GraduationCap className="w-4 h-4 mr-2" /> คอร์สของฉัน
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">
                      <User className="w-4 h-4 mr-2" /> โปรไฟล์
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">เข้าสู่ระบบ</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="hero" className="w-full" size="sm">สมัครสมาชิก</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
