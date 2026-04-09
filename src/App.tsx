import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // sync fix
import { BrowserRouter, Route, Routes, useParams, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import MobileTabBar from "@/components/MobileTabBar";
import EchoChatWidget from "@/components/EchoChatWidget";
import { HighContrastProvider } from "@/components/chat/HighContrastProvider";
import { TeReoProvider } from "@/components/chat/TeReoProvider";
import AgentGrid from "./pages/AgentGrid";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Wrapper to force full remount when agentId changes (prevents removeChild crash)
const ChatPageKeyed = () => {
  const { agentId } = useParams();
  return <ChatPage key={agentId} />;
};

// MarinerLanding removed — redirects to /toroa
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
const TradiePortal = lazy(() => import("./pages/TradiePortal"));
const LandlordPortal = lazy(() => import("./pages/LandlordPortal"));
const EchoPage = lazy(() => import("./pages/EchoPage"));
const ContentHub = lazy(() => import("./pages/ContentHub"));
const AgentDetailPage = lazy(() => import("./pages/AgentDetailPage"));
const MyAppsPage = lazy(() => import("./pages/MyAppsPage"));
const SparkAppViewer = lazy(() => import("./pages/SparkAppViewer"));
const WorkflowSettings = lazy(() => import("./pages/WorkflowSettings"));
const IntegrationHub = lazy(() => import("./pages/IntegrationHub"));
// WelcomePage removed — merged into onboarding
const AboutPage = lazy(() => import("./pages/AboutPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const AdminHealthDashboard = lazy(() => import("./pages/AdminHealthDashboard"));
const AdminLeadsDashboard = lazy(() => import("./pages/AdminLeadsDashboard"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TurfDeadlinePage = lazy(() => import("./pages/TurfDeadlinePage"));
const AdminAnalyticsDashboard = lazy(() => import("./pages/AdminAnalyticsDashboard"));
const AdminMessagesPage = lazy(() => import("./pages/AdminMessagesPage"));
const DevelopersPage = lazy(() => import("./pages/DevelopersPage"));
const BrandGuidelinesPage = lazy(() => import("./pages/BrandGuidelinesPage"));
const LogoStackPage = lazy(() => import("./pages/LogoStackPage"));
const BrandStoryPage = lazy(() => import("./pages/BrandStoryPage"));
const DataSovereigntyPage = lazy(() => import("./pages/DataSovereigntyPage"));
const AuraLandingPage = lazy(() => import("./pages/AuraLandingPage"));
const NexusLandingPage = lazy(() => import("./pages/NexusLandingPage"));
const DataPrivacyLegal = lazy(() => import("./pages/DataPrivacyLegal"));
const InvestPage = lazy(() => import("./pages/InvestPage"));
const ToroaLandingPage = lazy(() => import("./pages/ToroaLandingPage"));
const ToroaApp = lazy(() => import("./pages/ToroaApp"));
const ToroaInstallPage = lazy(() => import("./pages/ToroaInstallPage"));
const AgentApp = lazy(() => import("./pages/AgentApp"));
const AdminSmsPage = lazy(() => import("./pages/AdminSmsPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const KeteOverviewPage = lazy(() => import("./pages/KeteOverviewPage"));
const KeteCollectionPage = lazy(() => import("./pages/KeteCollectionPage"));
const KeteDetailPageNew = lazy(() => import("./pages/KeteDetailPage"));
const CareDashboard = lazy(() => import("./pages/CareDashboard"));
const AtaBimDashboard = lazy(() => import("./components/hanga/AtaBimDashboard"));
const KaupapaDashboard = lazy(() => import("./components/hanga/KaupapaDashboard"));
const RawaDashboard = lazy(() => import("./components/hanga/RawaDashboard"));
const WhakaaeDashboard = lazy(() => import("./components/hanga/WhakaaeDashboard"));
const PaiDashboard = lazy(() => import("./components/hanga/PaiDashboard"));
const KanohiDashboard = lazy(() => import("./components/hanga/KanohiDashboard"));
const HangaLayout = lazy(() => import("./components/hanga/HangaLayout"));
const HangaDashboard = lazy(() => import("./components/hanga/HangaDashboard"));
const AraiSafetyPage = lazy(() => import("./components/hanga/AraiSafetyPage"));
const FuelSavingsPage = lazy(() => import("./pages/FuelSavingsPage"));
const SiteCheckinPage = lazy(() => import("./components/hanga/SiteCheckinPage"));
const PhotoDocsPage = lazy(() => import("./components/hanga/PhotoDocsPage"));
const TenderWriterPage = lazy(() => import("./components/hanga/TenderWriterPage"));
const DocIntelPage = lazy(() => import("./components/hanga/DocIntelPage"));
const CommsHubPage = lazy(() => import("./components/hanga/CommsHubPage"));
const VoiceAgentPage = lazy(() => import("./components/hanga/VoiceAgentPage"));
const PackLandingPage = lazy(() => import("./pages/PackLandingPage"));
const AuahaLayout = lazy(() => import("./components/auaha/AuahaLayout"));
const AuahaDashboard = lazy(() => import("./components/auaha/AuahaDashboard"));
const AuahaCampaignBuilder = lazy(() => import("./components/auaha/AuahaCampaignBuilder"));
const AuahaCopyStudio = lazy(() => import("./components/auaha/AuahaCopyStudio"));
const AuahaImageStudio = lazy(() => import("./components/auaha/AuahaImageStudio"));
const PixelImageStudio = lazy(() => import("./pages/auaha/ImageStudio"));
const AuahaVideoStudio = lazy(() => import("./components/auaha/AuahaVideoStudio"));
const AuahaPodcastStudio = lazy(() => import("./components/auaha/AuahaPodcastStudio"));
const AuahaAdManager = lazy(() => import("./components/auaha/AuahaAdManager"));
const AuahaCalendar = lazy(() => import("./components/auaha/AuahaCalendar"));
const AuahaAnalytics = lazy(() => import("./components/auaha/AuahaAnalytics"));
const AuahaBrandIdentity = lazy(() => import("./components/auaha/AuahaBrandIdentity"));
const AuahaWebBuilder = lazy(() => import("./components/auaha/AuahaWebBuilder"));
const AuahaWhaikorero = lazy(() => import("./components/auaha/AuahaWhaikorero"));
const AdminPacksPage = lazy(() => import("./pages/AdminPacksPage"));
const AdminPackAnalytics = lazy(() => import("./pages/AdminPackAnalytics"));
const AdminMessagingDashboard = lazy(() => import("./pages/AdminMessagingDashboard"));
const ManaakiDashboard = lazy(() => import("./components/manaaki/ManaakiDashboard"));
const PakihiDashboard = lazy(() => import("./components/pakihi/PakihiDashboard"));
const HangarauDashboard = lazy(() => import("./components/hangarau/HangarauDashboard"));
const TeKahuiReoDashboard = lazy(() => import("./components/te-kahui-reo/TeKahuiReoDashboard"));
const ToroaDashboard = lazy(() => import("./components/toroa/ToroaDashboard"));
const SkillWiringDashboard = lazy(() => import("./components/admin/SkillWiringDashboard"));
const SkillHubPage = lazy(() => import("./pages/SkillHubPage"));
const AaaipDashboard = lazy(() => import("./pages/AaaipDashboard"));
const AaaipResearcher = lazy(() => import("./pages/AaaipResearcher"));

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
              <div className="pb-14 sm:pb-0">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/app" element={<AgentGrid />} />
                  <Route path="/chat/:agentId" element={<ChatPageKeyed />} />
                  <Route path="/login" element={<AuthPage mode="login" />} />
                  <Route path="/signup" element={<AuthPage mode="signup" />} />
                  <Route path="/mariner" element={<Navigate to="/toroa" replace />} />
                  <Route path="/embed/:agentId" element={<Suspense fallback={null}><EmbedChatWidget /></Suspense>} />
                  <Route path="/embed" element={<Suspense fallback={null}><EmbedPage /></Suspense>} />
                  <Route path="/dashboard" element={<Suspense fallback={null}><DashboardPage /></Suspense>} />
                  <Route path="/pricing" element={<Suspense fallback={null}><PricingPage /></Suspense>} />
                  <Route path="/contact" element={<Suspense fallback={null}><ContactPage /></Suspense>} />
                  <Route path="/how-it-works" element={<Suspense fallback={null}><HowItWorksPage /></Suspense>} />
                  <Route path="/content-hub" element={<Navigate to="/how-it-works" replace />} />
                  <Route path="/agents" element={<Navigate to="/how-it-works" replace />} />
                  <Route path="/tools" element={<Navigate to="/how-it-works" replace />} />
                  <Route path="/founding-pilots" element={<Navigate to="/contact" replace />} />
                  <Route path="/admin" element={<Suspense fallback={null}><AdminLogin /></Suspense>} />
                  <Route path="/admin/forgot-password" element={<Suspense fallback={null}><AdminForgotPassword /></Suspense>} />
                  <Route path="/admin/reset-password" element={<Suspense fallback={null}><AdminResetPassword /></Suspense>} />
                  <Route path="/admin/dashboard" element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
                  <Route path="/admin/health" element={<Suspense fallback={null}><AdminHealthDashboard /></Suspense>} />
                  <Route path="/admin/leads" element={<Suspense fallback={null}><AdminLeadsDashboard /></Suspense>} />
                  <Route path="/privacy" element={<Suspense fallback={null}><PrivacyPolicy /></Suspense>} />
                  <Route path="/terms" element={<Suspense fallback={null}><TermsOfUse /></Suspense>} />
                  <Route path="/cookies" element={<Suspense fallback={null}><CookiePolicy /></Suspense>} />
                  <Route path="/disclaimer" element={<Suspense fallback={null}><Disclaimer /></Suspense>} />
                  <Route path="/security" element={<Suspense fallback={null}><SecurityPage /></Suspense>} />
                  <Route path="/tradie-portal" element={<Suspense fallback={null}><TradiePortal /></Suspense>} />
                  <Route path="/landlord" element={<Suspense fallback={null}><LandlordPortal /></Suspense>} />
                  <Route path="/agents/echo" element={<Suspense fallback={null}><EchoPage /></Suspense>} />
                  <Route path="/agents/:agentId" element={<Suspense fallback={null}><AgentDetailPage /></Suspense>} />
                  <Route path="/content-hub" element={<Suspense fallback={null}><ContentHub /></Suspense>} />
                  <Route path="/my-apps" element={<Suspense fallback={null}><MyAppsPage /></Suspense>} />
                  <Route path="/apps/:appName" element={<Suspense fallback={null}><SparkAppViewer /></Suspense>} />
                  <Route path="/settings/workflows" element={<Suspense fallback={null}><WorkflowSettings /></Suspense>} />
                  <Route path="/settings/integrations" element={<Suspense fallback={null}><IntegrationHub /></Suspense>} />
                  <Route path="/welcome" element={<Navigate to="/onboarding" replace />} />
                  <Route path="/about" element={<Suspense fallback={null}><AboutPage /></Suspense>} />
                  <Route path="/onboarding" element={<Suspense fallback={null}><OnboardingPage /></Suspense>} />
                  <Route path="/turf" element={<Suspense fallback={null}><TurfDeadlinePage /></Suspense>} />
                  <Route path="/turf-5-april-2026" element={<Navigate to="/turf" replace />} />
                  <Route path="/aura" element={<Suspense fallback={null}><AuraLandingPage /></Suspense>} />
                  <Route path="/nexus" element={<Suspense fallback={null}><NexusLandingPage /></Suspense>} />
                  <Route path="/admin/analytics" element={<Suspense fallback={null}><AdminAnalyticsDashboard /></Suspense>} />
                  <Route path="/admin/messages" element={<Suspense fallback={null}><AdminMessagesPage /></Suspense>} />
                  <Route path="/admin/sms" element={<Suspense fallback={null}><AdminSmsPage /></Suspense>} />
                  <Route path="/admin/messaging" element={<Suspense fallback={null}><AdminMessagingDashboard /></Suspense>} />
                  <Route path="/admin/packs" element={<Suspense fallback={null}><AdminPacksPage /></Suspense>} />
                  <Route path="/admin/pack-analytics" element={<Suspense fallback={null}><AdminPackAnalytics /></Suspense>} />
                  <Route path="/admin/skill-wiring" element={<Suspense fallback={null}><SkillWiringDashboard /></Suspense>} />
                  <Route path="/skill-hub" element={<Suspense fallback={null}><SkillHubPage /></Suspense>} />
                  <Route path="/fuel-savings" element={<Suspense fallback={null}><FuelSavingsPage /></Suspense>} />
                  <Route path="/aaaip" element={<Suspense fallback={null}><AaaipDashboard /></Suspense>} />
                  <Route path="/aaaip/researcher" element={<Suspense fallback={null}><AaaipResearcher /></Suspense>} />
                  <Route path="/packs/:packSlug" element={<Suspense fallback={null}><PackLandingPage /></Suspense>} />
                  <Route path="/developers" element={<Suspense fallback={null}><DevelopersPage /></Suspense>} />
                  <Route path="/brand-guidelines" element={<Suspense fallback={null}><BrandGuidelinesPage /></Suspense>} />
                  <Route path="/logo-stack" element={<Suspense fallback={null}><LogoStackPage /></Suspense>} />
                  <Route path="/brand-story" element={<Suspense fallback={null}><BrandStoryPage /></Suspense>} />
                  <Route path="/data-sovereignty" element={<Suspense fallback={null}><DataSovereigntyPage /></Suspense>} />
                  <Route path="/data-privacy" element={<Suspense fallback={null}><DataPrivacyLegal /></Suspense>} />
                  <Route path="/invest" element={<Suspense fallback={null}><InvestPage /></Suspense>} />
                  <Route path="/kete" element={<Suspense fallback={null}><KeteCollectionPage /></Suspense>} />
                  <Route path="/kete/:slug" element={<Suspense fallback={null}><KeteDetailPageNew /></Suspense>} />
                  <Route path="/manaaki" element={<Suspense fallback={null}><ManaakiDashboard /></Suspense>} />
                  <Route path="/pakihi" element={<Suspense fallback={null}><PakihiDashboard /></Suspense>} />
                  <Route path="/hangarau" element={<Suspense fallback={null}><HangarauDashboard /></Suspense>} />
                  <Route path="/te-kahui-reo" element={<Suspense fallback={null}><TeKahuiReoDashboard /></Suspense>} />
                  <Route path="/toroa" element={<Suspense fallback={null}><ToroaLandingPage /></Suspense>} />
                  <Route path="/toroa/dashboard" element={<Suspense fallback={null}><ToroaDashboard /></Suspense>} />
                  <Route path="/toroa/app" element={<Suspense fallback={null}><ToroaApp /></Suspense>} />
                  <Route path="/toroa/install" element={<Suspense fallback={null}><ToroaInstallPage /></Suspense>} />
                  <Route path="/helm" element={<Navigate to="/toroa" replace />} />
                  <Route path="/helm/*" element={<Navigate to="/toroa" replace />} />
                  <Route path="/app/:agentId" element={<Suspense fallback={null}><AgentApp /></Suspense>} />
                  <Route path="/care/:seniorId" element={<Suspense fallback={null}><CareDashboard /></Suspense>} />
                  <Route path="/hanga" element={<Suspense fallback={null}><HangaLayout /></Suspense>}>
                    <Route index element={<HangaDashboard />} />
                    <Route path="arai" element={<AraiSafetyPage />} />
                    <Route path="kaupapa" element={<KaupapaDashboard />} />
                    <Route path="site-checkin" element={<SiteCheckinPage />} />
                    <Route path="photos" element={<PhotoDocsPage />} />
                    <Route path="tender" element={<TenderWriterPage />} />
                    <Route path="docs" element={<DocIntelPage />} />
                    <Route path="comms" element={<CommsHubPage />} />
                    <Route path="voice" element={<VoiceAgentPage />} />
                    <Route path="ata" element={<AtaBimDashboard />} />
                    <Route path="rawa" element={<RawaDashboard />} />
                    <Route path="whakaae" element={<WhakaaeDashboard />} />
                    <Route path="pai" element={<PaiDashboard />} />
                    <Route path="overview" element={<KanohiDashboard />} />
                  </Route>
                  <Route path="/auaha" element={<Suspense fallback={null}><AuahaLayout /></Suspense>}>
                    <Route index element={<AuahaDashboard />} />
                    <Route path="whaikorero" element={<AuahaWhaikorero />} />
                    <Route path="campaign" element={<AuahaCampaignBuilder />} />
                    <Route path="copy" element={<AuahaCopyStudio />} />
                    <Route path="images" element={<AuahaImageStudio />} />
                    <Route path="image-studio" element={<PixelImageStudio />} />
                    <Route path="video" element={<AuahaVideoStudio />} />
                    <Route path="podcast" element={<AuahaPodcastStudio />} />
                    <Route path="ads" element={<AuahaAdManager />} />
                    <Route path="calendar" element={<AuahaCalendar />} />
                    <Route path="analytics" element={<AuahaAnalytics />} />
                    <Route path="brand" element={<AuahaBrandIdentity />} />
                    <Route path="web" element={<AuahaWebBuilder />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <EchoChatWidget />
              <MobileTabBar />
            </AuthProvider>
          </BrowserRouter>
        </TeReoProvider>
      </HighContrastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
