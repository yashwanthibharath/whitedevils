import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, CheckCircle2, Search, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  deadline: string | null;
  created_at: string;
  company_id: string;
  companies: { name: string; logo_url: string | null } | null;
}

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      let query = supabase
        .from("jobs")
        .select("*, companies(name, logo_url)")
        .eq("status", "approved");

      if (typeFilter !== "all") query = query.eq("job_type", typeFilter);
      if (sortBy === "latest") query = query.order("created_at", { ascending: false });
      else query = query.order("location", { ascending: true });

      const { data } = await query;
      setJobs((data as unknown as Job[]) ?? []);
      setLoading(false);
    };
    fetchJobs();
  }, [typeFilter, sortBy]);

  const filtered = jobs.filter((j) => {
    const s = search.toLowerCase();
    return j.title.toLowerCase().includes(s) || j.companies?.name?.toLowerCase().includes(s) || j.location?.toLowerCase().includes(s);
  });

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Browse Jobs</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search jobs, companies, locations…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="location">Location</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No jobs found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} userId={user?.id} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function JobCard({ job, userId }: { job: Job; userId?: string }) {
  const [coverMessage, setCoverMessage] = useState("");
  const [applying, setApplying] = useState(false);
  const [open, setOpen] = useState(false);

  const handleApply = async () => {
    if (!userId) return;
    setApplying(true);
    const { error } = await supabase.from("applications").insert({ job_id: job.id, student_id: userId, cover_message: coverMessage || null });
    if (error) {
      if (error.code === "23505") toast.error("You already applied to this job");
      else toast.error(error.message);
    } else {
      toast.success("Application submitted!");
      setOpen(false);
    }
    setApplying(false);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              {job.companies?.name ?? "Company"}
            </div>
          </div>
          <Badge variant={job.job_type === "internship" ? "secondary" : "default"} className="capitalize shrink-0">
            {job.job_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
          )}
          {(job.salary_min || job.salary_max) && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} – ₹${job.salary_max.toLocaleString()}` : job.salary_min ? `From ₹${job.salary_min.toLocaleString()}` : `Up to ₹${job.salary_max!.toLocaleString()}`}
            </span>
          )}
          {job.deadline && (
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full mt-2">Apply Now</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply to {job.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea placeholder="Cover message (optional)" value={coverMessage} onChange={(e) => setCoverMessage(e.target.value)} />
              <Button onClick={handleApply} disabled={applying} className="w-full">
                {applying ? "Submitting…" : "Submit Application"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
