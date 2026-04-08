import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, LogIn, UserPlus, Landmark, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type AccessMode = "choose" | "admin" | "investor";

export default function LoginPage() {
  const { signIn, signUp, isDemo } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Determine initial mode from URL param
  const roleParam = searchParams.get("role");
  const [mode, setMode] = useState<AccessMode>(
    roleParam === "investor" ? "investor" : "choose"
  );

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isDemo) {
      // Demo mode: go directly to the right page
      setLoading(false);
      navigate(mode === "investor" ? "/investor" : "/dashboard");
      return;
    }

    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      navigate(mode === "investor" ? "/investor" : "/dashboard");
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isDemo) {
      setLoading(false);
      toast.success("Demo mode — redirecting...");
      navigate(mode === "investor" ? "/investor" : "/dashboard");
      return;
    }

    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Account created! You can now sign in.");
    }
  }

  // ===== ROLE CHOOSER =====
  if (mode === "choose") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight">CapitalBridge</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              How would you like to access the platform?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Admin / Platform */}
            <button
              onClick={() => setMode("admin")}
              className="group relative rounded-2xl border-2 border-slate-200 bg-white p-8 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-slate-600 flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Platform</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                For deal originators, analysts, and portfolio managers. Full access to pipeline, deals, and operations.
              </p>
              <div className="mt-4 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Continue →
              </div>
            </button>

            {/* Investor */}
            <button
              onClick={() => setMode("investor")}
              className="group relative rounded-2xl border-2 border-slate-200 bg-white p-8 text-left transition-all hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-5">
                <Landmark className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Investor</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                For limited partners and capital providers. View portfolio performance, returns, and reports.
              </p>
              <div className="mt-4 text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Continue →
              </div>
            </button>
          </div>

          <div className="text-center mt-8">
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
  const accentColor = isInvestor ? "emerald" : "primary";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            {isInvestor ? (
              <Landmark className="h-8 w-8 text-emerald-600" />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
            <span className="text-2xl font-bold tracking-tight">CapitalBridge</span>
          </Link>
          <p className="text-muted-foreground text-sm">
            {isInvestor ? "Investor Portal" : "Portfolio Management Platform"}
          </p>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>
                    {isInvestor ? "Investor Sign In" : "Welcome back"}
                  </CardTitle>
                  <CardDescription>
                    {isInvestor
                      ? "Access your portfolio and reports"
                      : "Sign in to manage deals and operations"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
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
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className={`w-full ${isInvestor ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    disabled={loading}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle>Create account</CardTitle>
                  <CardDescription>
                    {isInvestor
                      ? "Request investor access to CapitalBridge"
                      : "Request platform access"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Your full name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
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
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className={`w-full ${isInvestor ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    disabled={loading}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {loading ? "Creating..." : "Request Access"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <button
            onClick={() => setMode("choose")}
            className="text-sm text-slate-400 hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            {isInvestor ? "Switch to Platform access" : "Switch to Investor access"}
          </button>
        </div>
      </div>
    </div>
  );
}
