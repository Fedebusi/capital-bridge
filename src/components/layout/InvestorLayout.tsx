import { Link, useLocation, useSearchParams } from "react-router-dom";
import { BarChart3, FileText, HelpCircle, LogOut, ArrowLeft, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/investor", icon: BarChart3, label: "Portfolio" },
  { to: "/investor/reports", icon: FileText, label: "Reports" },
];

interface InvestorLayoutProps {
  children: React.ReactNode;
}

export default function InvestorLayout({ children }: InvestorLayoutProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { hasRole, profile } = useAuth();
  const showBackLink = hasRole("admin", "analyst", "portfolio_manager") && !searchParams.has("standalone");

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-8 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <Link to="/investor" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-indigo-400 flex items-center justify-center">
                <span className="text-white text-sm font-bold">C</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-primary">CapitalBridge</span>
                <span className="text-[11px] text-accent font-semibold bg-accent/10 px-2.5 py-0.5 rounded-full">
                  Investor
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                      isActive
                        ? "bg-accent text-white shadow-sm shadow-accent/20"
                        : "text-slate-500 hover:bg-slate-100 hover:text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {showBackLink && (
              <Link
                to="/dashboard"
                className="text-sm text-slate-500 hover:text-primary font-medium transition-colors flex items-center gap-1.5 mr-3"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Platform
              </Link>
            )}
            <button className="text-slate-400 hover:text-primary hover:bg-slate-100 p-2.5 rounded-full transition-all">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="text-slate-400 hover:text-primary hover:bg-slate-100 p-2.5 rounded-full transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <Link
              to="/"
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Link>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-indigo-400 flex items-center justify-center ml-2">
              <span className="text-xs font-bold text-white">
                {(profile?.full_name || "LP").slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1200px] mx-auto p-8 lg:p-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-16">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            CapitalBridge Investor Portal — Confidential
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-xs text-slate-400 hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-xs text-slate-400 hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-xs text-slate-400 hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
