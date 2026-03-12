import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  /** roles ที่อนุญาต เช่น ["admin"] หรือ ["instructor", "admin"] */
  allowedRoles: string[];
  /** redirect ไปที่ไหนถ้า role ไม่ตรง (default: "/") */
  redirectTo?: string;
}

/**
 * RoleBasedRoute — ตรวจสอบ role ก่อนเข้าหน้า
 * ต้องใช้ซ้อนกับ ProtectedRoute เสมอ (ตรวจแค่ role ไม่ตรวจ login)
 *
 * ตัวอย่าง:
 * <ProtectedRoute>
 *   <RoleBasedRoute allowedRoles={["admin"]}>
 *     <AdminDashboard />
 *   </RoleBasedRoute>
 * </ProtectedRoute>
 */
const RoleBasedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/",
}: RoleBasedRouteProps) => {
  const { roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  const hasAccess = allowedRoles.some((role) => roles.includes(role));

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
