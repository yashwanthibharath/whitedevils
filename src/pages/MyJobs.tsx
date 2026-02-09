import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", location: "", job_type: "full-time", salary_min: "", salary_max: "", deadline: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    if (!user) return;
    const { data } = await supabase.from("jobs").select("*").eq("recruiter_id", user.id).order("created_at", { ascending: false });
    setJobs(data ?? []);
  };

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      const { data: company } = await supabase.from("companies").select("id").eq("recruiter_id", user.id).maybeSingle();
      setCompanyId(company?.id ?? null);
      const { data: vr } = await supabase.from("verification_requests").select("status").eq("recruiter_id", user.id).eq("status", "approved").maybeSingle();
      setVerified(!!vr);
      fetchJobs();
    };
    init();
  }, [user]);

  const handlePost = async () => {
    if (!user || !companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("jobs").insert({
      recruiter_id: user.id,
      company_id: companyId,
      title: form.title,
      description: form.description,
      location: form.location || null,
      job_type: form.job_type,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      deadline: form.deadline || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Job posted!"); setOpen(false); setForm({ title: "", description: "", location: "", job_type: "full-time", salary_min: "", salary_max: "", deadline: "" }); fetchJobs(); }
    setSubmitting(false);
  };

  const statusColor = (s: string) => s === "approved" ? "default" : s === "rejected" ? "destructive" : "secondary";

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        {verified && companyId && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>Post New Job</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Post a Job</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Job Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-3">
                  <Input placeholder="Min Salary" type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
                  <Input placeholder="Max Salary" type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
                </div>
                <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                <Button onClick={handlePost} disabled={submitting || !form.title || !form.description} className="w-full">
                  {submitting ? "Posting…" : "Post Job"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {!verified && <Card className="mb-4"><CardContent className="p-4 text-muted-foreground">You must be verified to post jobs. Please submit a verification request.</CardContent></Card>}
      {jobs.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No jobs posted yet.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">{job.job_type} • {job.location || "Remote"}</p>
                </div>
                <Badge variant={statusColor(job.status)} className="capitalize">{job.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
