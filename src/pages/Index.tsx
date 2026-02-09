import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Search, CheckCircle2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>TrustHire</span>
          </div>
          <div className="flex gap-3">
            {user ? (
              <Link to="/dashboard"><Button>Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/auth"><Button variant="ghost">Sign In</Button></Link>
                <Link to="/auth"><Button>Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
          Verified Jobs.{" "}
          <span className="text-primary">Trusted Recruiters.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          A secure platform where only admin-verified recruiters can post jobs. Search, filter, and apply with confidence.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/auth"><Button size="lg">Start Free</Button></Link>
          <Link to="/jobs"><Button size="lg" variant="outline">Browse Jobs</Button></Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-12">Why TrustHire?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Verified Recruiters", desc: "Every recruiter goes through admin verification before posting jobs." },
              { icon: Search, title: "Smart Search", desc: "Filter by type, location, and sort by latest. Find the right opportunity fast." },
              { icon: CheckCircle2, title: "Scam Protection", desc: "Report suspicious listings. Our admin team reviews every report." },
            ].map((f) => (
              <div key={f.title} className="text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>TrustHire © 2026</span>
          </div>
          <p>Built for safe hiring.</p>
        </div>
      </footer>
    </div>
  );
}
