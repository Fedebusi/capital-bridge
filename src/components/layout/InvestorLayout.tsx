import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Landmark, BarChart3, FileText, HelpCircle, LogOut, Wallet, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/investor", icon: BarChart3, label: "Portfolio Overview" },
  { to: "/investor/reports", icon: FileText, label: "Reports" },
];

interface InvestorLayoutProps {
  children: React.ReactNode;
}

export default function InvestorLayout({ children }: InvestorLayoutProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { hasRole } = useAuth();
  // Show "Back to Platform" only for platform users (admin/analyst/PM) who navigated here
  // from the platform — not for users who entered directly via investor login
  const showBackLink = hasRole("admin", "analyst", "portfolio_manager") && !searchParams.has("standalone");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/investor" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-[15px] font-extrabold text-primary tracking-tight">CapitalBridge</span>
                <span className="text-[10px] text-emerald-600 font-semibold ml-2 bg-emerald-50 px-2 py-0.5 rounded-full">
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
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {showBackLink && (
              <Link
                to="/dashboard"
                className="text-sm text-slate-500 hover:text-primary font-medium transition-colors flex items-center gap-1.5 mr-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Platform
              </Link>
            )}
            <a href="#" className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-slate-50 transition-all">
              <HelpCircle className="h-4.5 w-4.5" />
            </a>
            <Link
              to="/"
              className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-slate-50 transition-all"
            >
              <LogOut className="h-4.5 w-4.5" />
            </Link>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center ml-1">
              <span className="text-[10px] font-bold text-white">LP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1200px] mx-auto p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-12">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            CapitalBridge Investor Portal — Confidential
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-slate-400 hover:text-primary">Privacy</a>
            <a href="#" className="text-xs text-slate-400 hover:text-primary">Terms</a>
            <a href="#" className="text-xs text-slate-400 hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
