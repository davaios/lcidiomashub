import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout, AuthLayout, AdminLayout } from "@/components/layout";
import { Toaster } from "@/components/ui/toaster";

// Auth pages
import { LoginPage, ForgotPasswordPage } from "@/pages/auth";

// Main pages
import { CoursesPage, CourseDetailPage, ExamPage, ResultsPage } from "@/pages/courses";
import { DashboardPage } from "@/pages/dashboard";
import { ChatPage } from "@/pages/chat";
import { SettingsPage } from "@/pages/settings";

// Admin pages
import { AdminCoursesPage, CourseEditorPage, AdminDashboardPage, UsersPage } from "@/pages/admin";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Main routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/courses" replace />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/courses/:id/exam" element={<ExamPage />} />
            <Route path="/courses/:id/results" element={<ResultsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Admin routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/courses/new" element={<CourseEditorPage />} />
              <Route path="/admin/courses/:id/edit" element={<CourseEditorPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
