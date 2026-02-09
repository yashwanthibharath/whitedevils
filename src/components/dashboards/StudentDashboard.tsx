import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ applications: 0, availableJobs: 0 });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [appRes, jobsRes] = await Promise.all([
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("student_id", user.id),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "approved"),
      ]);
      setStats({ applications: appRes.count ?? 0, availableJobs: jobsRes.count ?? 0 });
    };
    fetch();
  }, [user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Link to="/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Jobs</CardTitle>
            <Briefcase className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.availableJobs}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Applications</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.applications}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">All Verified</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent><div className="text-sm text-muted-foreground">All listed jobs are from verified recruiters</div></CardContent>
        </Card>
      </div>
    </div>
  );
}
