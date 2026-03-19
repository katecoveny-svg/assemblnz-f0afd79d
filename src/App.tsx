import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import AgentGrid from "./pages/AgentGrid";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const MarinerLanding = lazy(() => import("./pages/MarinerLanding"));
const EmbedPage = lazy(() => import("./pages/EmbedPage"));
const EmbedChatWidget = lazy(() => import("./pages/EmbedChatWidget"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AgentGrid />} />
            <Route path="/chat/:agentId" element={<ChatPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/mariner" element={<Suspense fallback={null}><MarinerLanding /></Suspense>} />
            <Route path="/embed" element={<Suspense fallback={null}><EmbedPage /></Suspense>} />
            <Route path="/dashboard" element={<Suspense fallback={null}><DashboardPage /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={null}><AdminLogin /></Suspense>} />
            <Route path="/admin/dashboard" element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
