import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, ShieldCheck, Flag } from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, pending: 0, reports: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, jobsRes, pendingRes, reportsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({
        users: usersRes.count ?? 0,
        jobs: jobsRes.count ?? 0,
        pending: pendingRes.count ?? 0,
        reports: reportsRes.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Total Jobs", value: stats.jobs, icon: Briefcase, color: "text-primary" },
    { label: "Pending Verifications", value: stats.pending, icon: ShieldCheck, color: "text-warning" },
    { label: "Pending Reports", value: stats.reports, icon: Flag, color: "text-destructive" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
