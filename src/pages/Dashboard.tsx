import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { RecruiterDashboard } from "@/components/dashboards/RecruiterDashboard";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";

export default function Dashboard() {
  const { role } = useAuth();

  return (
    <DashboardLayout>
      {role === "admin" && <AdminDashboard />}
      {role === "recruiter" && <RecruiterDashboard />}
      {role === "student" && <StudentDashboard />}
    </DashboardLayout>
  );
}
