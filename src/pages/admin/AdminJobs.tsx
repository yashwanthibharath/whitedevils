import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminJobs() {
  const [jobs, setJobs] = useState<any[]>([]);

  const fetchJobs = async () => {
    const { data } = await supabase.from("jobs").select("*, companies(name)").order("created_at", { ascending: false });
    setJobs(data ?? []);
  };

  useEffect(() => { fetchJobs(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Job ${status}`); fetchJobs(); }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Job Moderation</h1>
      {jobs.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No jobs to moderate.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.companies?.name ?? "Company"} • {job.job_type} • {job.location || "Remote"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={job.status === "approved" ? "default" : job.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{job.status}</Badge>
                  {job.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(job.id, "approved")}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(job.id, "rejected")}>Reject</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
