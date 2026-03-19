import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { HighContrastProvider } from "@/components/chat/HighContrastProvider";
import { TeReoProvider } from "@/components/chat/TeReoProvider";
import AgentGrid from "./pages/AgentGrid";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const MarinerLanding = lazy(() => import("./pages/MarinerLanding"));
const EmbedPage = lazy(() => import("./pages/EmbedPage"));
const EmbedChatWidget = lazy(() => import("./pages/EmbedChatWidget"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminForgotPassword = lazy(() => import("./pages/AdminForgotPassword"));
const AdminResetPassword = lazy(() => import("./pages/AdminResetPassword"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HighContrastProvider>
        <TeReoProvider>
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
                <Route path="/embed/:agentId" element={<Suspense fallback={null}><EmbedChatWidget /></Suspense>} />
                <Route path="/embed" element={<Suspense fallback={null}><EmbedPage /></Suspense>} />
                <Route path="/dashboard" element={<Suspense fallback={null}><DashboardPage /></Suspense>} />
                <Route path="/pricing" element={<Suspense fallback={null}><PricingPage /></Suspense>} />
                <Route path="/admin" element={<Suspense fallback={null}><AdminLogin /></Suspense>} />
                <Route path="/admin/forgot-password" element={<Suspense fallback={null}><AdminForgotPassword /></Suspense>} />
                <Route path="/admin/reset-password" element={<Suspense fallback={null}><AdminResetPassword /></Suspense>} />
                <Route path="/admin/dashboard" element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
                <Route path="/privacy" element={<Suspense fallback={null}><PrivacyPolicy /></Suspense>} />
                <Route path="/terms" element={<Suspense fallback={null}><TermsOfUse /></Suspense>} />
                <Route path="/cookies" element={<Suspense fallback={null}><CookiePolicy /></Suspense>} />
                <Route path="/disclaimer" element={<Suspense fallback={null}><Disclaimer /></Suspense>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TeReoProvider>
      </HighContrastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
