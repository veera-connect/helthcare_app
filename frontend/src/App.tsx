import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { PatientDashboard } from "./pages/patient/PatientDashboard";
import { AppointmentsPage } from "./pages/patient/AppointmentsPage";
import { DoctorsPage } from "./pages/patient/DoctorsPage";
import { AIAssistantPage } from "./pages/patient/AIAssistantPage";
import { DoctorDashboard } from "./pages/doctor/DoctorDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (role === "doctor") return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient routes */}
            <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<PatientDashboard />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
              </Route>
            </Route>

            {/* Doctor routes */}
            <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/appointments" element={<AppointmentsPage />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
