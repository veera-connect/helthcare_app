import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

// Public
import { LandingPage } from "./pages/LandingPage";

// Auth
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

// Patient
import { PatientDashboard } from "./pages/patient/PatientDashboard";
import { AppointmentsPage } from "./pages/patient/AppointmentsPage";
import { BookAppointmentPage } from "./pages/patient/BookAppointmentPage";
import { DoctorsPage } from "./pages/patient/DoctorsPage";
import { AIAssistantPage } from "./pages/patient/AIAssistantPage";
import { PatientProfilePage } from "./pages/patient/PatientProfilePage";
import { PatientMessagesPage } from "./pages/patient/PatientMessagesPage";
import { MedicalRecordsPage } from "./pages/patient/MedicalRecordsPage";
import { LabResultsPage } from "./pages/patient/LabResultsPage";
import { MedicationsPage } from "./pages/patient/MedicationsPage";
import { BillingPage } from "./pages/patient/BillingPage";
import { NotificationsPage } from "./pages/patient/NotificationsPage";

// Doctor
import { DoctorDashboard } from "./pages/doctor/DoctorDashboard";
import { DoctorPatientsPage } from "./pages/doctor/DoctorPatientsPage";
import { DoctorPrescriptionsPage } from "./pages/doctor/DoctorPrescriptionsPage";
import { DoctorAppointmentsPage } from "./pages/doctor/DoctorAppointmentsPage";
import { DoctorProfilePage } from "./pages/doctor/DoctorProfilePage";
import { DoctorSettingsPage } from "./pages/doctor/DoctorSettingsPage";
import { DoctorMessagesPage } from "./pages/doctor/DoctorMessagesPage";
import { DoctorLabOrdersPage } from "./pages/doctor/DoctorLabOrdersPage";
import { DoctorEarningsPage } from "./pages/doctor/DoctorEarningsPage";

// Admin
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminPatientsPage } from "./pages/admin/AdminPatientsPage";
import { AdminDoctorsPage } from "./pages/admin/AdminDoctorsPage";
import { AdminAuditLogsPage } from "./pages/admin/AdminAuditLogsPage";
import { AdminAnalyticsPage } from "./pages/admin/AdminAnalyticsPage";
import { AdminServicesPage } from "./pages/admin/AdminServicesPage";
import { AdminAppointmentsPage } from "./pages/admin/AdminAppointmentsPage";
import { AdminSpecializationsPage } from "./pages/admin/AdminSpecializationsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { AdminNotificationsPage } from "./pages/admin/AdminNotificationsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/home" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (role === "doctor") return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient routes */}
            <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/appointments" element={<AppointmentsPage />} />
                <Route path="/patient/appointments/book" element={<BookAppointmentPage />} />
                <Route path="/patient/records" element={<MedicalRecordsPage />} />
                <Route path="/patient/lab-results" element={<LabResultsPage />} />
                <Route path="/patient/medications" element={<MedicationsPage />} />
                <Route path="/patient/doctors" element={<DoctorsPage />} />
                <Route path="/patient/billing" element={<BillingPage />} />
                <Route path="/patient/notifications" element={<NotificationsPage />} />
                <Route path="/patient/messages" element={<PatientMessagesPage />} />
                <Route path="/patient/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/patient/profile" element={<PatientProfilePage />} />
                {/* legacy redirects */}
                <Route path="/dashboard" element={<Navigate to="/patient/dashboard" replace />} />
                <Route path="/appointments" element={<Navigate to="/patient/appointments" replace />} />
                <Route path="/doctors" element={<Navigate to="/patient/doctors" replace />} />
                <Route path="/ai-assistant" element={<Navigate to="/patient/ai-assistant" replace />} />
              </Route>
            </Route>

            {/* Doctor routes */}
            <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
                <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
                <Route path="/doctor/prescriptions" element={<DoctorPrescriptionsPage />} />
                <Route path="/doctor/lab-orders" element={<DoctorLabOrdersPage />} />
                <Route path="/doctor/messages" element={<DoctorMessagesPage />} />
                <Route path="/doctor/earnings" element={<DoctorEarningsPage />} />
                <Route path="/doctor/profile" element={<DoctorProfilePage />} />
                <Route path="/doctor/settings" element={<DoctorSettingsPage />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route element={<AppLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/patients" element={<AdminPatientsPage />} />
                <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
                <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
                <Route path="/admin/services" element={<AdminServicesPage />} />
                <Route path="/admin/specializations" element={<AdminSpecializationsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              </Route>
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: "12px", fontSize: "14px" },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
