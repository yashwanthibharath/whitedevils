import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export default function Verification() {
  const { user } = useAuth();
  const [request, setRequest] = useState<{ status: string; details: string | null; admin_notes: string | null } | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: company } = await supabase.from("companies").select("id").eq("recruiter_id", user.id).maybeSingle();
      setCompanyId(company?.id ?? null);
      if (company) {
        const { data: vr } = await supabase.from("verification_requests").select("status, details, admin_notes").eq("recruiter_id", user.id).maybeSingle();
        setRequest(vr);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("verification_requests").insert({ recruiter_id: user.id, company_id: companyId, details });
    if (error) toast.error(error.message);
    else { toast.success("Verification request submitted!"); setRequest({ status: "pending", details, admin_notes: null }); }
    setSubmitting(false);
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></DashboardLayout>;

  const statusIcon = request?.status === "approved" ? <CheckCircle2 className="h-5 w-5 text-success" /> : request?.status === "rejected" ? <XCircle className="h-5 w-5 text-destructive" /> : <Clock className="h-5 w-5 text-warning" />;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Verification Status</h1>
      {!companyId ? (
        <Card className="max-w-lg"><CardContent className="p-6"><p className="text-muted-foreground">Please create your company profile first before requesting verification.</p></CardContent></Card>
      ) : request ? (
        <Card className="max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              {statusIcon}
              <CardTitle className="capitalize">{request.status}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {request.details && <p className="text-sm"><strong>Your details:</strong> {request.details}</p>}
            {request.admin_notes && <p className="text-sm"><strong>Admin notes:</strong> {request.admin_notes}</p>}
            {request.status === "rejected" && <p className="text-sm text-muted-foreground">You may update your company profile and contact support.</p>}
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-lg">
          <CardHeader><CardTitle>Request Verification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Provide details to verify your company (registration number, website, etc.)" value={details} onChange={(e) => setDetails(e.target.value)} />
            <Button onClick={handleSubmit} disabled={submitting || !details}>{submitting ? "Submitting…" : "Submit Request"}</Button>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
