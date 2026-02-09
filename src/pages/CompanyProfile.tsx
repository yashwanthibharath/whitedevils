import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CompanyProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", description: "", website: "", industry: "", logo_url: "" });
  const [existing, setExisting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("companies").select("*").eq("recruiter_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({ name: data.name, description: data.description ?? "", website: data.website ?? "", industry: data.industry ?? "", logo_url: data.logo_url ?? "" });
        setExisting(true);
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    if (existing) {
      const { error } = await supabase.from("companies").update({ ...form }).eq("recruiter_id", user.id);
      if (error) toast.error(error.message); else toast.success("Company updated!");
    } else {
      const { error } = await supabase.from("companies").insert({ ...form, recruiter_id: user.id });
      if (error) toast.error(error.message); else { toast.success("Company created!"); setExisting(true); }
    }
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Company Profile</h1>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <Input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input placeholder="Logo URL" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
          <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button onClick={handleSave} disabled={saving || !form.name}>{saving ? "Saving…" : existing ? "Update" : "Create"}</Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
