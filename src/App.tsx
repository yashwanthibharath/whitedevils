import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import MyApplications from "./pages/MyApplications";
import CompanyProfile from "./pages/CompanyProfile";
import Verification from "./pages/Verification";
import MyJobs from "./pages/MyJobs";
import RecruiterApplications from "./pages/RecruiterApplications";
import Messages from "./pages/Messages";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute allowedRoles={["student"]}><Jobs /></ProtectedRoute>} />
            <Route path="/my-applications" element={<ProtectedRoute allowedRoles={["student"]}><MyApplications /></ProtectedRoute>} />
            <Route path="/company" element={<ProtectedRoute allowedRoles={["recruiter"]}><CompanyProfile /></ProtectedRoute>} />
            <Route path="/verification" element={<ProtectedRoute allowedRoles={["recruiter"]}><Verification /></ProtectedRoute>} />
            <Route path="/my-jobs" element={<ProtectedRoute allowedRoles={["recruiter"]}><MyJobs /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute allowedRoles={["recruiter"]}><RecruiterApplications /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/admin/verifications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminVerifications /></ProtectedRoute>} />
            <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminJobs /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
