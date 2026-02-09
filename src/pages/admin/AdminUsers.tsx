import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserRow {
  user_id: string;
  full_name: string;
  role: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
      setUsers((profiles ?? []).map((p) => ({ ...p, role: roleMap.get(p.user_id) ?? "unknown" })));
    };
    fetch();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.user_id}>
            <CardContent className="flex items-center justify-between p-4">
              <p className="font-medium">{u.full_name || "Unnamed"}</p>
              <Badge variant="secondary" className="capitalize">{u.role}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
