import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Landmark, ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

type AccessMode = "choose" | "admin" | "investor";

export default function LoginPage() {
  const { signIn, signUp, isDemo } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const roleParam = searchParams.get("role");
  const [mode, setMode] = useState<AccessMode>(
    roleParam === "investor" ? "investor" : "choose"
  );

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isDemo) {
      setLoading(false);
      navigate(mode === "investor" ? "/investor?standalone" : "/dashboard");
      return;
    }

    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Signed in successfully");
      navigate(mode === "investor" ? "/investor?standalone" : "/dashboard");
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isDemo) {
      setLoading(false);
      toast.success("Demo mode — redirecting...");
      navigate(mode === "investor" ? "/investor?standalone" : "/dashboard");
      return;
    }

    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Account created! Check your email to confirm, then sign in.");
    }
  }

  // ===== ROLE CHOOSER =====
  if (mode === "choose") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-indigo-400 flex items-center justify-center">
                <span className="text-white text-base font-bold">C</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-primary">CapitalBridge</span>
            </Link>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Welcome</h1>
            <p className="text-slate-500 text-base mt-2">Choose how to access the platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <button
              onClick={() => setMode("admin")}
              className="group relative rounded-3xl bg-white border border-slate-200 p-8 text-left transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/10"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent to-indigo-400 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Platform</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                For analysts, originators, and portfolio managers. Full access to deals, pipeline, and operations.
              </p>
            </button>

            <button
              onClick={() => setMode("investor")}
              className="group relative rounded-3xl bg-white border border-slate-200 p-8 text-left transition-all hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-6">
                <Landmark className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Investor</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                For limited partners and capital providers. Portfolio view, returns, and reporting.
              </p>
            </button>
          </div>

          <div className="text-center mt-10">
            <Link to="/" className="text-sm text-slate-400 hover:text-primary transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== LOGIN / SIGNUP FORM =====
  const isInvestor = mode === "investor";
  const gradient = isInvestor
    ? "from-emerald-500 to-emerald-700"
    : "from-accent to-indigo-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-white text-base font-bold">C</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">CapitalBridge</span>
          </Link>
          <p className="text-sm text-slate-500">
            {isInvestor ? "Investor Portal" : "Portfolio Management Platform"}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isDemo ? "bg-amber-500" : "bg-emerald-500"}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isDemo ? "Demo mode" : "Live mode"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-slate-100 p-1">
              <TabsTrigger value="login" className="rounded-full">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="rounded-full"
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full rounded-full ${isInvestor ? "bg-emerald-600 hover:bg-emerald-700" : "bg-accent hover:bg-accent/90"}`}
                  disabled={loading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <Link
                  to="/reset-password"
                  className="block text-center text-xs text-slate-400 hover:text-primary"
                >
                  Forgot your password?
                </Link>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="Your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 8 characters"
                    minLength={8}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    className="rounded-full"
                  />
                </div>
                <Button
                  type="submit"
                  className={`w-full rounded-full ${isInvestor ? "bg-emerald-600 hover:bg-emerald-700" : "bg-accent hover:bg-accent/90"}`}
                  disabled={loading}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => setMode("choose")}
            className="text-sm text-slate-400 hover:text-primary transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3 w-3" />
            {isInvestor ? "Switch to Platform" : "Switch to Investor"}
          </button>
        </div>
      </div>
    </div>
  );
}
