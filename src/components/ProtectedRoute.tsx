import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute — ต้อง login ก่อนถึงเข้าได้
 * ถ้ายังไม่ login จะ redirect ไป /login พร้อม ?from= เพื่อ redirect กลับหลัง login
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // รอ auth state โหลดเสร็จก่อน (ป้องกัน flash redirect)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // เก็บ path ปัจจุบันไว้ใน state เพื่อ redirect กลับหลัง login สำเร็จ
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
