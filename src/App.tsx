import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DealsProvider } from "@/hooks/useDeals";
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
import LandingPage from "./pages/LandingPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DealsProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/screening" element={<ScreeningPage />} />
          <Route path="/deals" element={<LoanBookPage />} />
          <Route path="/deals/:id" element={<DealDetailPage />} />
          <Route path="/due-diligence" element={<DueDiligencePage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/borrowers" element={<BorrowersPage />} />
          <Route path="/borrowers/:id" element={<BorrowerDetailPage />} />
          <Route path="/pik-engine" element={<PIKEnginePage />} />
          <Route path="/construction" element={<ConstructionMonitoringPage />} />
          <Route path="/lifecycle" element={<LifecyclePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/investor" element={<InvestorPortalPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </DealsProvider>
    <Analytics />
  </QueryClientProvider>
);

export default App;
