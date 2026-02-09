import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">TrustHire</h1>
          <p className="text-sm text-muted-foreground">Verified Jobs. Trusted Recruiters.</p>
        </div>
        {isSignUp ? <SignUpForm /> : <SignInForm />}
        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline">
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

function SignInForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) toast.error(error.message);
    setSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SignUpForm() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "recruiter">("student");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signUp(email, password, fullName, role);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Please check your email to verify.");
    }
    setSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Choose your role and get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password (min 6 chars)" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="space-y-2">
            <label className="text-sm font-medium">I am a:</label>
            <div className="flex gap-3">
              {(["student", "recruiter"] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                    role === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
