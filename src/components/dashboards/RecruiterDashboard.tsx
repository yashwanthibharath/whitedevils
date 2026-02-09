import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, CheckCircle2, Clock } from "lucide-react";

export function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, verified: false, pending: false });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [jobsRes, vrRes] = await Promise.all([
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("recruiter_id", user.id),
        supabase.from("verification_requests").select("status").eq("recruiter_id", user.id).maybeSingle(),
      ]);
      const jobIds = (await supabase.from("jobs").select("id").eq("recruiter_id", user.id)).data?.map(j => j.id) ?? [];
      let appCount = 0;
      if (jobIds.length > 0) {
        const appRes = await supabase.from("applications").select("id", { count: "exact", head: true }).in("job_id", jobIds);
        appCount = appRes.count ?? 0;
      }
      setStats({
        jobs: jobsRes.count ?? 0,
        applications: appCount,
        verified: vrRes.data?.status === "approved",
        pending: vrRes.data?.status === "pending",
      });
    };
    fetch();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Recruiter Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verification</CardTitle>
            {stats.verified ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Clock className="h-5 w-5 text-warning" />}
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{stats.verified ? "Verified" : stats.pending ? "Pending" : "Not Submitted"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Jobs</CardTitle>
            <Briefcase className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.jobs}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{stats.applications}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}
