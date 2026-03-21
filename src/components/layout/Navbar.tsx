import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Search, Menu, X, BookOpen, Code, User, LogOut,
  LayoutDashboard, GraduationCap, ShieldCheck, Bell, BellOff,
  Sun, Moon, Monitor
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SearchModal from "@/components/SearchModal";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, roles, signOut, loading } = useAuth();

  // ── Keyboard shortcut: "/" เพื่อเปิด search ────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT","TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // ── Notifications realtime ──────────────────────────────────
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Array<{
    id: string; title: string; message: string | null;
    is_read: boolean; created_at: string; link: string | null;
  }>>([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { setUnreadCount(0); setNotifications([]); return; }

    const fetchNotifs = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, is_read, created_at, link")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };
    fetchNotifs();

    const channel = supabase
      .channel(`navbar-notif-${user.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new as any, ...prev.slice(0, 9)]);
        setUnreadCount((prev) => prev + 1);
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, () => fetchNotifs())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    await supabase.from("notifications").update({ is_read: true })
      .eq("user_id", user.id).eq("is_read", false);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleNotifClick = async (notif: typeof notifications[0]) => {
    if (!notif.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
    }
    setShowNotif(false);
    if (notif.link) navigate(notif.link);
  };

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
    <>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              title="ค้นหา (กด /)"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Theme toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="เปลี่ยน Theme">
                  {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setTheme("light")} className={theme === "light" ? "text-primary" : ""}>
                  <Sun className="w-4 h-4 mr-2" /> Light {theme === "light" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className={theme === "dark" ? "text-primary" : ""}>
                  <Moon className="w-4 h-4 mr-2" /> Dark {theme === "dark" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className={theme === "system" ? "text-primary" : ""}>
                  <Monitor className="w-4 h-4 mr-2" /> System {theme === "system" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotif(!showNotif)}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>

                {showNotif && (
                  <div className="absolute right-0 top-11 w-80 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-semibold text-foreground">การแจ้งเตือน</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                          อ่านทั้งหมด
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <BellOff className="w-8 h-8 mx-auto text-muted-foreground opacity-30 mb-2" />
                          <p className="text-sm text-muted-foreground">ไม่มีการแจ้งเตือน</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors ${!notif.is_read ? "bg-primary/5" : ""}`}
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.is_read ? "bg-primary" : "bg-muted"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground line-clamp-1">{notif.title}</p>
                              {notif.message && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                              )}
                              <p className="text-xs text-muted-foreground/60 mt-1">
                                {new Date(notif.created_at).toLocaleDateString("th-TH")}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
