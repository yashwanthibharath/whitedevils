import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface VR {
  id: string;
  status: string;
  details: string | null;
  created_at: string;
  recruiter_id: string;
  companies: { name: string } | null;
  profiles: { full_name: string } | null;
}

export default function AdminVerifications() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<VR[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchAll = async () => {
    const { data } = await supabase
      .from("verification_requests")
      .select("*, companies(name)")
      .order("created_at", { ascending: false });
    
    const recruiterIds = [...new Set((data ?? []).map((d: any) => d.recruiter_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", recruiterIds);
    const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    
    setRequests((data ?? []).map((d: any) => ({ ...d, profiles: profileMap.get(d.recruiter_id) ?? null })));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("verification_requests").update({ status, admin_notes: notes[id] || null, reviewed_by: user?.id }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Request ${status}`); fetchAll(); }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Verification Requests</h1>
      {requests.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No verification requests.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((vr) => (
            <Card key={vr.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{vr.companies?.name ?? "Company"}</p>
                    <p className="text-sm text-muted-foreground">Recruiter: {vr.profiles?.full_name ?? vr.recruiter_id}</p>
                    {vr.details && <p className="text-sm mt-1">{vr.details}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(vr.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={vr.status === "approved" ? "default" : vr.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{vr.status}</Badge>
                </div>
                {vr.status === "pending" && (
                  <div className="flex gap-2 items-center">
                    <Input placeholder="Admin notes (optional)" value={notes[vr.id] ?? ""} onChange={(e) => setNotes({ ...notes, [vr.id]: e.target.value })} className="flex-1" />
                    <Button size="sm" onClick={() => handleAction(vr.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction(vr.id, "rejected")}>Reject</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
