import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import PipelinePage from "./pages/PipelinePage.tsx";
import ScreeningPage from "./pages/ScreeningPage.tsx";
import LoanBookPage from "./pages/LoanBookPage.tsx";
import DealDetailPage from "./pages/DealDetailPage.tsx";
import DueDiligencePage from "./pages/DueDiligencePage.tsx";
import ApprovalsPage from "./pages/ApprovalsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/screening" element={<ScreeningPage />} />
          <Route path="/deals" element={<LoanBookPage />} />
          <Route path="/deals/:id" element={<DealDetailPage />} />
          <Route path="/due-diligence" element={<DueDiligencePage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
