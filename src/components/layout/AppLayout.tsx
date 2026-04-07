import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  UserCircle,
  HelpCircle,
  BookOpen,
  Landmark,
  Wallet,
  MapPin,
  Plus,
  ChevronRight,
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
  { to: "/pik-engine", icon: TrendingUp, label: "PIK Engine", group: "ops" },
  { to: "/construction", icon: HardHat, label: "Construction", group: "ops" },
  { to: "/borrowers", icon: Users, label: "Borrowers", group: "ops" },
  { to: "/due-diligence", icon: ClipboardCheck, label: "Due Diligence", group: "ops" },
  { to: "/approvals", icon: Vote, label: "Approvals", group: "ops" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderNavGroup = (group: string, label: string) => {
    const items = navItems.filter(i => i.group === group);
    return (
      <div>
        <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</p>
        <div className="space-y-0.5">
          {items.map(item => {
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-white text-primary shadow-sm font-semibold"
                    : "text-slate-500 hover:bg-white/60 hover:text-primary"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-500")} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-3 w-3 ml-auto text-slate-300" />}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col bg-gradient-to-b from-slate-50 to-blue-50/30 border-r border-slate-200/60 transition-transform duration-300 lg:relative lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-slate-600 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-[15px] font-extrabold text-primary tracking-tight">CapitalBridge</span>
            </div>
          </Link>
        </div>

        {/* Fund card */}
        <div className="mx-4 mb-5 rounded-xl bg-gradient-to-br from-primary to-slate-700 p-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-white/15 flex items-center justify-center text-[9px] font-bold backdrop-blur-sm">
              GDF
            </div>
            <div>
              <p className="text-[11px] font-bold leading-none">Global Debt Fund I</p>
              <p className="text-[9px] text-white/60 font-medium mt-0.5">Institutional Grade</p>
            </div>
          </div>
        </div>

        {/* Mobile close */}
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 rounded p-1 text-slate-400 hover:text-primary lg:hidden">
          <X className="h-4 w-4" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-5">
          {renderNavGroup("main", "Dashboard")}
          {renderNavGroup("deals", "Deal Management")}
          {renderNavGroup("ops", "Operations")}
        </nav>

        {/* Bottom */}
        <div className="p-3 mt-auto border-t border-slate-200/50">
          <Link
            to="/pipeline"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-colors shadow-sm shadow-emerald-600/20 mb-3"
          >
            <Plus className="h-3.5 w-3.5" />
            New Deal
          </Link>
          <div className="flex gap-1">
            <a className="flex-1 flex items-center justify-center gap-1.5 text-slate-400 py-1.5 hover:bg-white/50 rounded-lg text-[10px] font-medium transition-colors" href="#">
              <HelpCircle className="h-3 w-3" />
              <span>Help</span>
            </a>
            <a className="flex-1 flex items-center justify-center gap-1.5 text-slate-400 py-1.5 hover:bg-white/50 rounded-lg text-[10px] font-medium transition-colors" href="#">
              <BookOpen className="h-3 w-3" />
              <span>Docs</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top nav */}
        <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="mx-auto max-w-[1400px] px-8 py-2.5 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <button onClick={() => setMobileOpen(true)} className="rounded p-2 text-slate-400 hover:text-primary lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  className="bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-72 placeholder:text-slate-400 outline-none transition-all"
                  placeholder="Search facilities, deals, borrowers..."
                  type="text"
                />
              </div>
              <nav className="hidden md:flex space-x-1">
                {[
                  { to: "/dashboard", label: "Portfolio" },
                  { to: "/borrowers", label: "Borrowers" },
                  { to: "/approvals", label: "Compliance" },
                ].map(tab => {
                  const isActive = location.pathname === tab.to;
                  return (
                    <Link key={tab.to} to={tab.to} className={cn(
                      "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                      isActive ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-100 hover:text-primary"
                    )}>{tab.label}</Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-3">
            <Link
              to="/pipeline"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all hover:bg-emerald-700 hidden sm:flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Deploy Capital
            </Link>
            <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
              <button className="text-slate-400 hover:text-primary hover:bg-slate-100 p-2 rounded-lg transition-all relative">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full border border-white" />
              </button>
              <button className="text-slate-400 hover:text-primary hover:bg-slate-100 p-2 rounded-lg transition-all">
                <UserCircle className="h-4.5 w-4.5" />
              </button>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-slate-600 flex items-center justify-center ml-1">
                <span className="text-[10px] font-bold text-white">AC</span>
              </div>
            </div>
          </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50/50">
          <div className="mx-auto max-w-[1400px] p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
