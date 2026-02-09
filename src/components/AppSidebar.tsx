import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Building2, ShieldCheck, Users, Flag,
  MessageSquare, FileText, LogOut, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const studentLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs", icon: Briefcase, label: "Browse Jobs" },
  { to: "/my-applications", icon: FileText, label: "My Applications" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
];

const recruiterLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/company", icon: Building2, label: "Company Profile" },
  { to: "/verification", icon: CheckCircle2, label: "Verification" },
  { to: "/my-jobs", icon: Briefcase, label: "My Jobs" },
  { to: "/applications", icon: FileText, label: "Applications" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
];

const adminLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/verifications", icon: ShieldCheck, label: "Verifications" },
  { to: "/admin/jobs", icon: Briefcase, label: "Job Moderation" },
  { to: "/admin/reports", icon: Flag, label: "Reports" },
  { to: "/admin/users", icon: Users, label: "Users" },
];

export function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();

  const links = role === "admin" ? adminLinks : role === "recruiter" ? recruiterLinks : studentLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <ShieldCheck className="h-7 w-7 text-sidebar-primary" />
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          TrustHire
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-primary">
            {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{profile?.full_name || "User"}</p>
            <p className="text-xs capitalize text-sidebar-foreground/50">{role}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
