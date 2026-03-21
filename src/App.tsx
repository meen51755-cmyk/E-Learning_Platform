import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleBasedRoute from "@/components/RoleBasedRoute";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LearningPlayer from "./pages/LearningPlayer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QuizPage from "./pages/QuizPage";
import Ranking from "./pages/Ranking";
import Certificate from "./pages/Certificate";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Community from "./pages/Community";
import Payment from "./pages/Payment";
import TransactionHistory from "./pages/TransactionHistory";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerification from "./pages/EmailVerification";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ApiDocs from "./pages/ApiDocs";
import CreateCourse from "./pages/CreateCourse";
import MyCourses from "./pages/MyCourses";
import CourseEditor from "./pages/CourseEditor";
import QuizBuilder from "./pages/QuizBuilder";
import StudentList from "./pages/StudentList";
import Coupon from "./pages/Coupon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ─── Public Routes ──────────────────────────────────── */}
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/api-docs" element={<ApiDocs />} />

            {/* ─── Protected Routes (ต้อง login) ──────────────────── */}
            <Route
              path="/learn/:id"
              element={
                <ProtectedRoute>
                  <LearningPlayer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:id"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificate"
              element={
                <ProtectedRoute>
                  <Certificate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* ─── Instructor Routes (ต้อง role: instructor หรือ admin) */}
            <Route
              path="/instructor/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["instructor", "admin"]}>
                    <InstructorDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/create-course"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["instructor", "admin"]}>
                    <CreateCourse />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/coupons"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["instructor", "admin"]}>
                    <Coupon />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            {/* ── Instructor: คอร์สของฉัน ── */}
            <Route
              path="/instructor/courses"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["instructor", "admin"]}>
                    <MyCourses />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/create"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["instructor", "admin"]}>
                    <CreateCourse />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/:id/edit"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["instructor", "admin"]}>
                    <CourseEditor />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/:id/quiz"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["instructor", "admin"]}>
                    <QuizBuilder />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/:id/students"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["instructor", "admin"]}>
                    <StudentList />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            {/* ─── Admin Routes (ต้อง role: admin เท่านั้น) ─────────── */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["admin"]} redirectTo="/dashboard">
                    <AdminDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            {/* ─── 404 ─────────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
