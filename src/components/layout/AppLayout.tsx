import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Search,
  FolderOpen,
  FileText,
  Menu,
  X,
  ClipboardCheck,
  Vote,
  Users,
  TrendingUp,
  HardHat,
  Route,
  Bell,
  BookOpen,
  Landmark,
  LogOut,
  MapPin,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", group: "main" },
  { to: "/investor", icon: Landmark, label: "Investor Portal", group: "main" },
  { to: "/map", icon: MapPin, label: "Map", group: "main" },
  { to: "/pipeline", icon: FolderOpen, label: "Pipeline", group: "deals" },
  { to: "/screening", icon: Search, label: "Screening", group: "deals" },
  { to: "/deals", icon: FileText, label: "Loan Book", group: "deals" },
  { to: "/lifecycle", icon: Route, label: "Lifecycle", group: "deals" },
  { to: "/term-sheets", icon: FileText, label: "Term Sheets", group: "deals" },
  { to: "/pik-engine", icon: TrendingUp, label: "PIK Engine", group: "ops" },
  { to: "/construction", icon: HardHat, label: "Construction", group: "ops" },
  { to: "/borrowers", icon: Users, label: "Borrowers", group: "ops" },
  { to: "/due-diligence", icon: ClipboardCheck, label: "Due Diligence", group: "ops" },
  { to: "/approvals", icon: Vote, label: "Approvals", group: "ops" },
  { to: "/it-instructions", icon: BookOpen, label: "IT Docs", group: "ops" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  const renderNavGroup = (group: string, label: string) => {
    const items = navItems.filter(i => i.group === group);
    return (
      <div>
        <p className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <div className="space-y-0.5">
          {items.map(item => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent text-white shadow-sm shadow-accent/20"
                    : "text-slate-500 hover:bg-slate-100 hover:text-primary"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-white border-r border-slate-100 transition-transform duration-300 lg:relative lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-indigo-400 flex items-center justify-center">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <div>
              <span className="text-lg font-bold text-primary tracking-tight">CapitalBridge</span>
            </div>
          </Link>
        </div>

        {/* Mobile close */}
        <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden">
          <X className="h-4 w-4" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 min-h-0">
          {renderNavGroup("main", "Dashboard")}
          {renderNavGroup("deals", "Deal Management")}
          {renderNavGroup("ops", "Operations")}
        </nav>

        {/* User profile (sempre visibile in basso) */}
        <div className="px-3 py-3 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent to-indigo-400 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">
                {(profile?.full_name || "U").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-slate-400 font-medium truncate">{profile?.email || "viewer"}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all shrink-0"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top nav */}
        <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-100">
          <div className="mx-auto max-w-[1400px] px-8 py-4 flex justify-between items-center gap-6">
            <button onClick={() => setMobileOpen(true)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative flex-1 max-w-2xl hidden sm:block">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-slate-50 border-0 rounded-full py-3 pl-12 pr-5 text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                placeholder="Search funds, deals, borrowers..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/pipeline"
                className="hidden sm:flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm shadow-accent/20"
              >
                <Plus className="h-4 w-4" />
                Add New Deal
              </Link>
              <button className="text-slate-400 hover:text-primary hover:bg-slate-100 p-2.5 rounded-full transition-all relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-white">
          <div className="mx-auto max-w-[1400px] p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
