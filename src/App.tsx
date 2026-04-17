import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import * as Sentry from "@sentry/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DealsProvider } from "@/hooks/useDeals";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Initialize Sentry for error tracking in production
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
}
import Index from "./pages/Index.tsx";
import PipelinePage from "./pages/PipelinePage.tsx";
import ScreeningPage from "./pages/ScreeningPage.tsx";
import LoanBookPage from "./pages/LoanBookPage.tsx";
import DealDetailPage from "./pages/DealDetailPage.tsx";
import DueDiligencePage from "./pages/DueDiligencePage.tsx";
import ApprovalsPage from "./pages/ApprovalsPage.tsx";
import BorrowersPage from "./pages/BorrowersPage.tsx";
import BorrowerDetailPage from "./pages/BorrowerDetailPage.tsx";
import PIKEnginePage from "./pages/PIKEnginePage.tsx";
import ConstructionMonitoringPage from "./pages/ConstructionMonitoringPage.tsx";
import LifecyclePage from "./pages/LifecyclePage.tsx";
import MapPage from "./pages/MapPage.tsx";
import InvestorPortalPage from "./pages/InvestorPortalPage.tsx";
import TermSheetPage from "./pages/TermSheetPage.tsx";
import ITInstructionsPage from "./pages/ITInstructionsPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <DealsProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/pipeline" element={<ProtectedRoute><PipelinePage /></ProtectedRoute>} />
          <Route path="/screening" element={<ProtectedRoute><ScreeningPage /></ProtectedRoute>} />
          <Route path="/deals" element={<ProtectedRoute><LoanBookPage /></ProtectedRoute>} />
          <Route path="/deals/:id" element={<ProtectedRoute><DealDetailPage /></ProtectedRoute>} />
          <Route path="/due-diligence" element={<ProtectedRoute><DueDiligencePage /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute requiredRoles={["admin","analyst","portfolio_manager"]}><ApprovalsPage /></ProtectedRoute>} />
          <Route path="/borrowers" element={<ProtectedRoute><BorrowersPage /></ProtectedRoute>} />
          <Route path="/borrowers/:id" element={<ProtectedRoute><BorrowerDetailPage /></ProtectedRoute>} />
          <Route path="/pik-engine" element={<ProtectedRoute><PIKEnginePage /></ProtectedRoute>} />
          <Route path="/construction" element={<ProtectedRoute><ConstructionMonitoringPage /></ProtectedRoute>} />
          <Route path="/lifecycle" element={<ProtectedRoute><LifecyclePage /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/investor" element={<ProtectedRoute><InvestorPortalPage /></ProtectedRoute>} />
          <Route path="/investor/reports" element={<ProtectedRoute><InvestorPortalPage /></ProtectedRoute>} />
          <Route path="/term-sheets" element={<ProtectedRoute><TermSheetPage /></ProtectedRoute>} />
          <Route path="/it-instructions" element={<ProtectedRoute requiredRoles={["admin"]}><ITInstructionsPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </DealsProvider>
    </AuthProvider>
    <Analytics />
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
