import { AppSidebar } from "./AppSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
