import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AppRow {
  id: string;
  status: string;
  cover_message: string | null;
  created_at: string;
  student_id: string;
  jobs: { title: string } | null;
  profiles: { full_name: string } | null;
}

export default function RecruiterApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppRow[]>([]);

  const fetchApps = async () => {
    if (!user) return;
    // Get recruiter's job ids first
    const { data: jobs } = await supabase.from("jobs").select("id").eq("recruiter_id", user.id);
    if (!jobs || jobs.length === 0) { setApps([]); return; }
    const jobIds = jobs.map((j) => j.id);
    const { data } = await supabase
      .from("applications")
      .select("*, jobs(title)")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });
    
    // Fetch profiles for each student
    const studentIds = [...new Set((data ?? []).map((a: any) => a.student_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", studentIds);
    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    
    setApps((data ?? []).map((a: any) => ({ ...a, profiles: profileMap.get(a.student_id) ?? null })));
  };

  useEffect(() => { fetchApps(); }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Application ${status}`); fetchApps(); }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Applications Received</h1>
      {apps.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No applications received yet.</p>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{app.profiles?.full_name ?? "Student"}</p>
                    <p className="text-sm text-muted-foreground">Applied to: {app.jobs?.title ?? "Job"}</p>
                    {app.cover_message && <p className="text-sm mt-1 text-muted-foreground">{app.cover_message}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{app.status}</Badge>
                    {app.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => updateStatus(app.id, "accepted")}>Accept</Button>
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(app.id, "rejected")}>Reject</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
