import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Search, 
  FolderOpen, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Building2,
  Menu,
  X,
  ClipboardCheck,
  Vote,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pipeline", icon: FolderOpen, label: "Pipeline" },
  { to: "/screening", icon: Search, label: "Deal Screening" },
  { to: "/deals", icon: FileText, label: "Loan Book" },
  { to: "/due-diligence", icon: ClipboardCheck, label: "Due Diligence" },
  { to: "/approvals", icon: Vote, label: "Approvals" },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:relative",
        collapsed ? "w-16" : "w-60",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-accent" />
              <span className="font-display text-base font-bold text-foreground tracking-tight">APEX CAPITAL</span>
            </Link>
          )}
          {collapsed && <Building2 className="mx-auto h-6 w-6 text-accent" />}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden rounded p-1 text-muted-foreground hover:text-foreground lg:block">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="rounded p-1 text-muted-foreground hover:text-foreground lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="border-t border-sidebar-border p-3">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Demo Mode</p>
              <p>Sample data</p>
            </div>
          </div>
        )}
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded p-2 text-muted-foreground hover:text-foreground lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-foreground">AC</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[1440px] p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
