import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import AgentGrid from "./pages/AgentGrid";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";

const MarinerLanding = lazy(() => import("./pages/MarinerLanding"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AgentGrid />} />
          <Route path="/chat/:agentId" element={<ChatPage />} />
          <Route
            path="/mariner"
            element={
              <Suspense fallback={null}>
                <MarinerLanding />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
