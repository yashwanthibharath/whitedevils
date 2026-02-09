import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);

  const fetchReports = async () => {
    const { data } = await supabase.from("reports").select("*, jobs(title)").order("created_at", { ascending: false });
    setReports(data ?? []);
  };

  useEffect(() => { fetchReports(); }, []);

  const resolve = async (id: string) => {
    const { error } = await supabase.from("reports").update({ status: "resolved" }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Report resolved"); fetchReports(); }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Scam Reports</h1>
      {reports.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No reports.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-medium">Report on: {r.jobs?.title ?? "Job"}</p>
                  <p className="text-sm mt-1">{r.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === "resolved" ? "default" : "secondary"} className="capitalize">{r.status}</Badge>
                  {r.status === "pending" && <Button size="sm" onClick={() => resolve(r.id)}>Resolve</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
