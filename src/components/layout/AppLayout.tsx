import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  FolderOpen,
  FileText,
  Building2,
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
  Shield,
  Settings,
  Wallet,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Overview" },
  { to: "/map", icon: MapPin, label: "Map" },
  { to: "/lifecycle", icon: Route, label: "Lifecycle" },
  { to: "/pipeline", icon: FolderOpen, label: "Pipeline" },
  { to: "/screening", icon: Search, label: "Deal Screening" },
  { to: "/deals", icon: FileText, label: "Loan Book" },
  { to: "/pik-engine", icon: TrendingUp, label: "PIK Engine" },
  { to: "/construction", icon: HardHat, label: "Construction" },
  { to: "/borrowers", icon: Users, label: "Borrower Base" },
  { to: "/due-diligence", icon: ClipboardCheck, label: "Due Diligence" },
  { to: "/approvals", icon: Vote, label: "Approvals" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-slate-200/50 p-4 space-y-2 transition-transform duration-300 lg:relative lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="px-2 mb-8 mt-2">
          <Link to="/" className="flex items-center gap-2 text-lg font-black text-primary">
            <Wallet className="h-6 w-6" />
            <span>CapitalBridge</span>
          </Link>
          <div className="mt-4 flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-white flex items-center justify-center text-[10px] font-bold text-primary shadow-sm border border-slate-100">
              GDF
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.05em] font-bold text-primary leading-none">
                Global Debt Fund I
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Institutional Grade</div>
            </div>
          </div>
        </div>

        {/* Mobile close */}
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 rounded p-1 text-slate-400 hover:text-primary lg:hidden">
          <X className="h-4 w-4" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "sidebar-active text-primary"
                    : "text-slate-600 hover:bg-white/50"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="text-[11px] uppercase tracking-[0.05em] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="pt-4 mt-auto border-t border-slate-200/50">
          <Link
            to="/pipeline"
            className="w-full flex items-center justify-center bg-primary hover:bg-slate-800 text-white py-2.5 rounded text-[11px] uppercase tracking-[0.05em] font-bold transition-colors shadow-sm mb-4"
          >
            New Entry
          </Link>
          <div className="space-y-1">
            <a className="flex items-center space-x-3 text-slate-500 py-1.5 px-3 hover:bg-white/50 rounded text-[11px] font-medium" href="#">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Support</span>
            </a>
            <a className="flex items-center space-x-3 text-slate-500 py-1.5 px-3 hover:bg-white/50 rounded text-[11px] font-medium" href="#">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Documentation</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top nav */}
        <header className="sticky top-0 z-30 w-full bg-slate-50/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-8">
            <button onClick={() => setMobileOpen(true)} className="rounded p-2 text-slate-400 hover:text-primary lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                className="bg-white border border-slate-200 rounded py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary w-64 placeholder:text-slate-400 outline-none"
                placeholder="Search facilities..."
                type="text"
              />
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className={cn(
                "font-semibold text-sm py-1 transition-colors",
                location.pathname === "/" ? "text-primary border-b-2 border-rose-500" : "text-slate-500 hover:text-primary"
              )}>Portfolio</Link>
              <Link to="/borrowers" className={cn(
                "font-medium text-sm py-1 transition-colors",
                location.pathname === "/borrowers" ? "text-primary border-b-2 border-rose-500" : "text-slate-500 hover:text-primary"
              )}>Borrowers</Link>
              <Link to="/approvals" className={cn(
                "font-medium text-sm py-1 transition-colors",
                location.pathname === "/approvals" ? "text-primary border-b-2 border-rose-500" : "text-slate-500 hover:text-primary"
              )}>Compliance</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/pipeline"
              className="bg-primary text-white px-4 py-2 rounded text-xs font-bold transition-all hover:bg-slate-800 hidden sm:block"
            >
              Deploy Capital
            </Link>
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
              <button className="text-slate-500 hover:text-primary p-1.5">
                <Bell className="h-5 w-5" />
              </button>
              <button className="text-slate-500 hover:text-primary p-1.5">
                <UserCircle className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ml-2 border border-slate-100">
                <span className="text-xs font-semibold text-white">AC</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[1400px] p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
