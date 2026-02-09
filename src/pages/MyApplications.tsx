import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Application {
  id: string;
  status: string;
  cover_message: string | null;
  created_at: string;
  jobs: { title: string; companies: { name: string } | null } | null;
}

export default function MyApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("applications")
      .select("*, jobs(title, companies(name))")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setApps((data as unknown as Application[]) ?? []));
  }, [user]);

  const statusColor = (s: string) => {
    if (s === "accepted") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      {apps.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No applications yet.</p>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{app.jobs?.title ?? "Job"}</p>
                  <p className="text-sm text-muted-foreground">{app.jobs?.companies?.name ?? "Company"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={statusColor(app.status)} className="capitalize">{app.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
