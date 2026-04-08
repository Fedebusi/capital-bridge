import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/database";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, profile, loading, isDemo } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Demo mode or auth not yet configured: always allow
  if (isDemo) return <>{children}</>;

  // Auth configured but not logged in: allow for now (auth enforcement coming later)
  // TODO: Re-enable login redirect once auth setup is complete
  // if (!user || !profile) {
  //   return <Navigate to="/login" replace />;
  // }

  // // Role check
  // if (requiredRoles && !requiredRoles.includes(profile.role)) {
  //   return <Navigate to="/" replace />;
  // }

  return <>{children}</>;
}
