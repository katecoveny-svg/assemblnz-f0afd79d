import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // sync fix
import { BrowserRouter, Route, Routes, useParams, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import WaterGlassBackground from "@/components/hero/WaterGlassBackground";
import { AuthProvider } from "@/hooks/useAuth";
import MobileTabBar from "@/components/MobileTabBar";
import EchoChatWidget from "@/components/EchoChatWidget";
import AdminCommandPalette from "@/components/AdminCommandPalette";
import { HighContrastProvider } from "@/components/chat/HighContrastProvider";
import { TeReoProvider } from "@/components/chat/TeReoProvider";
import { PersonalizationProvider } from "@/contexts/PersonalizationContext";
import { BrandDnaProvider } from "@/contexts/BrandDnaContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import PageTransition from "@/components/marama/PageTransition";
import GlobalMotionShell from "@/components/next/GlobalMotionShell";

import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/PearlIndex";

// Wrapper to force full remount when agentId changes (prevents removeChild crash)
const ChatPageKeyed = () => {
  const { agentId } = useParams();
  return <ChatPage key={agentId} />;
};

// Redirect /agents/:agentId → /chat/:agentId (preserves the agent param)
const AgentSlugRedirect = () => {
  const { agentId } = useParams();
  return <Navigate to={`/chat/${agentId}`} replace />;
};

// ─── Lazy imports (aligned pages only) ───────────────────────────────────────
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
const MyAppsPage = lazy(() => import("./pages/MyAppsPage"));
const SparkAppViewer = lazy(() => import("./pages/SparkAppViewer"));
const WorkflowSettings = lazy(() => import("./pages/WorkflowSettings"));
const WorkflowsRunner = lazy(() => import("./pages/WorkflowsRunner"));
const WaihangaWorkflows = lazy(() => import("./pages/WaihangaWorkflows"));
const SectorWorkflows = lazy(() => import("./pages/SectorWorkflows"));
const AdminKbPriorities = lazy(() => import("./pages/AdminKbPriorities"));
const AdminDesignSystem = lazy(() => import("./pages/admin/DesignSystem"));
const AdminKnowledgeBrainPage = lazy(() => import("./pages/AdminKnowledgeBrainPage"));
const PublicKnowledgeBrainPage = lazy(() => import("./pages/PublicKnowledgeBrainPage"));
const PikauCbaffLanding = lazy(() => import("./pages/PikauCbaffLanding"));
const ArtakiMtaLanding = lazy(() => import("./pages/ArtakiMtaLanding"));
const IntegrationHub = lazy(() => import("./pages/IntegrationHub"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FounderPage = lazy(() => import("./pages/FounderPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const AdminHealthDashboard = lazy(() => import("./pages/AdminHealthDashboard"));
const AdminLeadsDashboard = lazy(() => import("./pages/AdminLeadsDashboard"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AdminAnalyticsDashboard = lazy(() => import("./pages/AdminAnalyticsDashboard"));
const AdminMessagesPage = lazy(() => import("./pages/AdminMessagesPage"));
const DevelopersPage = lazy(() => import("./pages/DevelopersPage"));
const AdminMcpLayout = lazy(() => import("./pages/admin/AdminMcpLayout"));
const AdminMcpOverview = lazy(() => import("./pages/admin/mcp/Overview"));
const AdminMcpToolsets = lazy(() => import("./pages/admin/mcp/Toolsets"));
const AdminMcpTools = lazy(() => import("./pages/admin/mcp/Tools"));
const AdminMcpLogs = lazy(() => import("./pages/admin/mcp/Logs"));
const AdminMcpCustomers = lazy(() => import("./pages/admin/mcp/Customers"));
const AdminMcpMigrate = lazy(() => import("./pages/admin/mcp/Migrate"));
const AdminMcpPolicy = lazy(() => import("./pages/admin/mcp/Policy"));
const AdminMcpSecurity = lazy(() => import("./pages/admin/mcp/Security"));
const AdminMcpHousekeeping = lazy(() => import("./pages/admin/mcp/Housekeeping"));
const AdminMcpBilling = lazy(() => import("./pages/admin/mcp/Billing"));
const AdminMcpServer = lazy(() => import("./pages/admin/mcp/Server"));
const DataSovereigntyPage = lazy(() => import("./pages/DataSovereigntyPage"));
const DataPrivacyLegal = lazy(() => import("./pages/DataPrivacyLegal"));
const CommandDashboard = lazy(() => import("./pages/CommandDashboard"));
const BrandGuidelinesPage = lazy(() => import("./pages/BrandGuidelinesPage"));
const VoyageCommandPage = lazy(() => import("./pages/VoyageCommandPage"));
const VoyagePlannerPage = lazy(() => import("./pages/VoyagePlannerPage"));
const PlatformPage = lazy(() => import("./pages/PlatformPage"));

const ToroaLandingPage = lazy(() => import("./pages/ToroaLandingPage"));
const ToroaApp = lazy(() => import("./pages/ToroaApp"));
const ToroaInstallPage = lazy(() => import("./pages/ToroaInstallPage"));
const AgentApp = lazy(() => import("./pages/AgentApp"));
const AdminSmsPage = lazy(() => import("./pages/AdminSmsPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const StatusPage = lazy(() => import("./pages/StatusPage"));
const EvidenceGalleryPage = lazy(() => import("./pages/EvidenceGalleryPage"));
const EvidencePackSharePage = lazy(() => import("./pages/EvidencePackSharePage"));
const AgentMarketplacePage = lazy(() => import("./pages/AgentMarketplacePage"));
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
const SiteCheckinPage = lazy(() => import("./components/hanga/SiteCheckinPage"));
const PhotoDocsPage = lazy(() => import("./components/hanga/PhotoDocsPage"));
const TenderWriterPage = lazy(() => import("./components/hanga/TenderWriterPage"));
const DocIntelPage = lazy(() => import("./components/hanga/DocIntelPage"));
const CommsHubPage = lazy(() => import("./components/hanga/CommsHubPage"));
const VoiceAgentPage = lazy(() => import("./components/hanga/VoiceAgentPage"));

const SampleEvidencePackPage = lazy(() => import("./pages/SampleEvidencePackPage"));
const AuahaLayout = lazy(() => import("./components/auaha/AuahaLayout"));
const AuahaDashboard = lazy(() => import("./components/auaha/AuahaDashboard"));
const AuahaCampaignBuilder = lazy(() => import("./components/auaha/AuahaCampaignBuilder"));
const AuahaCopyStudio = lazy(() => import("./components/auaha/AuahaCopyStudio"));
const PixelImageStudio = lazy(() => import("./pages/auaha/ImageStudio"));
const AuahaVideoStudio = lazy(() => import("./components/auaha/AuahaVideoStudio"));
const AuahaPodcastStudio = lazy(() => import("./components/auaha/AuahaPodcastStudio"));
const AuahaAdManager = lazy(() => import("./components/auaha/AuahaAdManager"));
const AuahaCalendar = lazy(() => import("./components/auaha/AuahaCalendar"));
const AuahaAnalytics = lazy(() => import("./components/auaha/AuahaAnalytics"));
const AuahaBrandIdentity = lazy(() => import("./components/auaha/AuahaBrandIdentity"));
const AuahaWebBuilder = lazy(() => import("./components/auaha/AuahaWebBuilder"));
const AuahaWhaikorero = lazy(() => import("./components/auaha/AuahaWhaikorero"));
const AuahaGenerate = lazy(() => import("./components/auaha/AuahaGenerate"));
const AuahaGallery = lazy(() => import("./components/auaha/AuahaGallery"));
const AuahaTaAudit = lazy(() => import("./components/auaha/AuahaTaAudit"));
const AuahaPromptLibrary = lazy(() => import("./components/auaha/AuahaPromptLibrary"));
const AuahaLoomStudio = lazy(() => import("./components/auaha/AuahaLoomStudio"));
const AuahaSpeechToImage = lazy(() => import("./components/auaha/AuahaSpeechToImage"));
const AppSparkForge = lazy(() => import("./components/auaha/AppSparkForge"));
const AuahaBrandScanner = lazy(() => import("./components/auaha/AuahaBrandScanner"));
const AdminPacksPage = lazy(() => import("./pages/AdminPacksPage"));
const AdminPackAnalytics = lazy(() => import("./pages/AdminPackAnalytics"));
const AdminMessagingDashboard = lazy(() => import("./pages/AdminMessagingDashboard"));
const AdminMessagingLive = lazy(() => import("./pages/AdminMessagingLive"));
const ManaakiDashboard = lazy(() => import("./components/manaaki/ManaakiDashboard"));
const AratakiDashboard = lazy(() => import("./components/arataki/AratakiDashboard"));
const PikauDashboard = lazy(() => import("./components/pikau/PikauDashboard"));
const ToroaDashboard = lazy(() => import("./components/toroa/ToroaDashboard"));
const WorkspaceDashboard = lazy(() => import("./pages/WorkspaceDashboard"));
const WorkspaceConnections = lazy(() => import("./pages/WorkspaceConnections"));
const SignEnvelopePage = lazy(() => import("./pages/SignEnvelopePage"));
const SkillWiringDashboard = lazy(() => import("./components/admin/SkillWiringDashboard"));
const AdminShowcaseVideos = lazy(() => import("./pages/AdminShowcaseVideos"));
const AaaipDashboard = lazy(() => import("./pages/AaaipDashboard"));
const AaaipResearcher = lazy(() => import("./pages/AaaipResearcher"));
const AaaipPitchPrep = lazy(() => import("./pages/AaaipPitchPrep"));
const AaaipLanding = lazy(() => import("./pages/AaaipLanding"));
const AratakiLandingPage = lazy(() => import("./pages/AratakiLandingPage"));
const AratakiFuelOracle = lazy(() => import("./pages/arataki/FuelOracle"));
const AratakiVehicleEconomy = lazy(() => import("./pages/arataki/VehicleEconomy"));
const AratakiRouteIntelligence = lazy(() => import("./pages/arataki/RouteIntelligence"));
const AratakiDriverCompliance = lazy(() => import("./pages/arataki/DriverCompliance"));
const SimulatorHub = lazy(() => import("./pages/SimulatorHub"));
const PikauLandingPage = lazy(() => import("./pages/PikauLandingPage"));
const ManaakiLandingPage = lazy(() => import("./pages/ManaakiLandingPage"));
const HokoLandingPage = lazy(() => import("./pages/HokoLandingPage"));
const AkoLandingPage = lazy(() => import("./pages/AkoLandingPage"));
const AuahaLandingPage = lazy(() => import("./pages/AuahaLandingPage"));
const WaihangaLandingPage = lazy(() => import("./pages/WaihangaLandingPage"));
const ToroaTravelPage = lazy(() => import("./pages/ToroaTravelPage"));
const ToroaChatPage = lazy(() => import("./pages/ToroaChatPage"));
const WaihangaArchitecturePage = lazy(() => import("./pages/WaihangaArchitecturePage"));
const WaihangaWorkflow = lazy(() => import("./pages/WaihangaWorkflow"));
const CaseStudiesPage = lazy(() => import("./pages/CaseStudiesPage"));
const StartPage = lazy(() => import("./pages/StartPage"));
const StartPendingPage = lazy(() => import("./pages/StartPendingPage"));
const AdminComplianceDashboard = lazy(() => import("./pages/AdminComplianceDashboard"));
const AdminTestReports = lazy(() => import("./pages/AdminTestReports"));
const AdminKnowledgeBase = lazy(() => import("./pages/AdminKnowledgeBase"));
const AdminFlintDashboard = lazy(() => import("./pages/AdminFlintDashboard"));
const AdminAgentTestLab = lazy(() => import("./pages/AdminAgentTestLab"));
const RoiCalculatorPage = lazy(() => import("./pages/RoiCalculatorPage"));
const DemosHub = lazy(() => import("./pages/demos/DemosHub"));
const PipelineDemo = lazy(() => import("./pages/demos/PipelineDemo"));
const EvidencePackDemo = lazy(() => import("./pages/demos/EvidencePackDemo"));
const ConfidenceScoringDemo = lazy(() => import("./pages/demos/ConfidenceScoringDemo"));
const KaitiakiGateDemo = lazy(() => import("./pages/demos/KaitiakiGateDemo"));
const PrivacyVault = lazy(() => import("./pages/PrivacyVault"));
const MigrationPage = lazy(() => import("./pages/MigrationPage"));
const ShowcasePage = lazy(() => import("./pages/ShowcasePage"));
const CouncilPage = lazy(() => import("./pages/CouncilPage"));
const SubbiesPage = lazy(() => import("./pages/waihanga/SubbiesPage"));
const ReelsPage = lazy(() => import("./pages/auaha/ReelsPage"));
const KnowledgeCataloguePage = lazy(() => import("./pages/KnowledgeCataloguePage"));
const NextPreview = lazy(() => import("./pages/NextPreview"));
const InvestPage = lazy(() => import("./pages/InvestPage"));

const queryClient = new QueryClient();

const PackSlugRedirect = () => {
  const { packSlug } = useParams();
  return <Navigate to={`/kete/${packSlug ?? ""}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HighContrastProvider>
        <TeReoProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <BrandDnaProvider>
                <PersonalizationProvider>
                  <BusinessProvider>
                    {/* WaterGlassBackground removed — Pearl canvas via index.css body */}
                    <GlobalMotionShell />
                    <div className="pb-14 sm:pb-0 relative z-10">
                      <PageTransition>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/next" element={<Suspense fallback={null}><NextPreview /></Suspense>} />
                        <Route path="/app" element={<Navigate to="/kete" replace />} />
                        <Route path="/chat/:agentId" element={<ChatPageKeyed />} />
                        <Route path="/login" element={<AuthPage mode="login" />} />
                        <Route path="/signup" element={<AuthPage mode="signup" />} />
                        
                        <Route path="/embed/:agentId" element={<Suspense fallback={null}><EmbedChatWidget /></Suspense>} />
                        <Route path="/embed" element={<Suspense fallback={null}><EmbedPage /></Suspense>} />
                        <Route path="/command" element={<Suspense fallback={null}><CommandDashboard /></Suspense>} />
                        <Route path="/voyage/command" element={<Suspense fallback={null}><VoyageCommandPage /></Suspense>} />
                        <Route path="/voyage/plan" element={<Suspense fallback={null}><VoyagePlannerPage /></Suspense>} />
                        <Route path="/voyage/italy" element={<Navigate to="/voyage/command?trip=22222222-2222-2222-2222-222222222222" replace />} />
                        <Route path="/voyage/wanaka" element={<Navigate to="/voyage/command?trip=11111111-1111-1111-1111-111111111111" replace />} />
                        <Route path="/voyage" element={<Navigate to="/voyage/plan" replace />} />
                        <Route path="/dashboard" element={<Suspense fallback={null}><DashboardPage /></Suspense>} />
                        <Route path="/pricing" element={<Suspense fallback={null}><PricingPage /></Suspense>} />
                        <Route path="/platform" element={<Suspense fallback={null}><PlatformPage /></Suspense>} />
                        <Route path="/contact" element={<Suspense fallback={null}><ContactPage /></Suspense>} />
                        <Route path="/how-it-works" element={<Suspense fallback={null}><HowItWorksPage /></Suspense>} />
                        <Route path="/status" element={<Suspense fallback={null}><StatusPage /></Suspense>} />
                        <Route path="/evidence" element={<Suspense fallback={null}><EvidenceGalleryPage /></Suspense>} />
                        <Route path="/evidence/share/:token" element={<Suspense fallback={null}><EvidencePackSharePage /></Suspense>} />
                        
                        <Route path="/agents" element={<Suspense fallback={null}><AgentMarketplacePage /></Suspense>} />
                        <Route path="/tools" element={<Navigate to="/how-it-works" replace />} />
                        

                        <Route path="/admin" element={<Suspense fallback={null}><AdminLogin /></Suspense>} />
                        <Route path="/admin/forgot-password" element={<Suspense fallback={null}><AdminForgotPassword /></Suspense>} />
                        <Route path="/admin/reset-password" element={<Suspense fallback={null}><AdminResetPassword /></Suspense>} />
                        <Route path="/admin/dashboard" element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
                        <Route path="/admin/health" element={<Suspense fallback={null}><AdminHealthDashboard /></Suspense>} />
                        <Route path="/admin/leads" element={<Suspense fallback={null}><AdminLeadsDashboard /></Suspense>} />
                        <Route path="/admin/compliance" element={<Suspense fallback={null}><AdminComplianceDashboard /></Suspense>} />
                        <Route path="/admin/test-reports" element={<Suspense fallback={null}><AdminTestReports /></Suspense>} />
                        <Route path="/admin/knowledge" element={<Suspense fallback={null}><AdminKnowledgeBase /></Suspense>} />
                        <Route path="/admin/flint" element={<Suspense fallback={null}><AdminFlintDashboard /></Suspense>} />
                        <Route path="/admin/test-lab" element={<Suspense fallback={null}><AdminAgentTestLab /></Suspense>} />
                        <Route path="/admin/design-system" element={<Suspense fallback={null}><AdminDesignSystem /></Suspense>} />
                        <Route path="/admin/analytics" element={<Suspense fallback={null}><AdminAnalyticsDashboard /></Suspense>} />
                        <Route path="/admin/messages" element={<Suspense fallback={null}><AdminMessagesPage /></Suspense>} />
                        <Route path="/admin/mcp" element={<Suspense fallback={null}><AdminMcpLayout /></Suspense>}>
                          <Route index element={<Navigate to="/admin/mcp/overview" replace />} />
                          <Route path="overview" element={<Suspense fallback={null}><AdminMcpOverview /></Suspense>} />
                          <Route path="toolsets" element={<Suspense fallback={null}><AdminMcpToolsets /></Suspense>} />
                          <Route path="tools" element={<Suspense fallback={null}><AdminMcpTools /></Suspense>} />
                          <Route path="logs" element={<Suspense fallback={null}><AdminMcpLogs /></Suspense>} />
                          <Route path="customers" element={<Suspense fallback={null}><AdminMcpCustomers /></Suspense>} />
                          <Route path="migrate" element={<Suspense fallback={null}><AdminMcpMigrate /></Suspense>} />
                          <Route path="policy" element={<Suspense fallback={null}><AdminMcpPolicy /></Suspense>} />
                          <Route path="security" element={<Suspense fallback={null}><AdminMcpSecurity /></Suspense>} />
                          <Route path="housekeeping" element={<Suspense fallback={null}><AdminMcpHousekeeping /></Suspense>} />
                          <Route path="billing" element={<Suspense fallback={null}><AdminMcpBilling /></Suspense>} />
                          <Route path="server" element={<Suspense fallback={null}><AdminMcpServer /></Suspense>} />
                        </Route>
                        <Route path="/admin/sms" element={<Suspense fallback={null}><AdminSmsPage /></Suspense>} />
                        <Route path="/admin/messaging" element={<Suspense fallback={null}><AdminMessagingDashboard /></Suspense>} />
                        <Route path="/admin/messaging-live" element={<Suspense fallback={null}><AdminMessagingLive /></Suspense>} />
                        <Route path="/admin/packs" element={<Suspense fallback={null}><AdminPacksPage /></Suspense>} />
                        <Route path="/admin/pack-analytics" element={<Suspense fallback={null}><AdminPackAnalytics /></Suspense>} />
                        <Route path="/admin/skill-wiring" element={<Suspense fallback={null}><SkillWiringDashboard /></Suspense>} />
                        <Route path="/admin/showcase-videos" element={<Suspense fallback={null}><AdminShowcaseVideos /></Suspense>} />

                        <Route path="/roi" element={<Suspense fallback={null}><RoiCalculatorPage /></Suspense>} />
                        <Route path="/about" element={<Suspense fallback={null}><FounderPage /></Suspense>} />
                        <Route path="/founder" element={<Suspense fallback={null}><FounderPage /></Suspense>} />
                        <Route path="/about-platform" element={<Suspense fallback={null}><AboutPage /></Suspense>} />
                        <Route path="/case-studies" element={<Suspense fallback={null}><CaseStudiesPage /></Suspense>} />
                        <Route path="/data-sovereignty" element={<Suspense fallback={null}><DataSovereigntyPage /></Suspense>} />
                        <Route path="/developers" element={<Suspense fallback={null}><DevelopersPage /></Suspense>} />

                        <Route path="/privacy" element={<Suspense fallback={null}><PrivacyPolicy /></Suspense>} />
                        <Route path="/terms" element={<Suspense fallback={null}><TermsOfUse /></Suspense>} />
                        <Route path="/cookies" element={<Suspense fallback={null}><CookiePolicy /></Suspense>} />
                        <Route path="/disclaimer" element={<Suspense fallback={null}><Disclaimer /></Suspense>} />
                        <Route path="/security" element={<Suspense fallback={null}><SecurityPage /></Suspense>} />
                        <Route path="/data-privacy" element={<Suspense fallback={null}><DataPrivacyLegal /></Suspense>} />
                        <Route path="/privacy-vault" element={<Suspense fallback={null}><PrivacyVault /></Suspense>} />
                        <Route path="/migration" element={<Suspense fallback={null}><MigrationPage /></Suspense>} />
                        <Route path="/showcase" element={<Suspense fallback={null}><ShowcasePage /></Suspense>} />
                        <Route path="/council" element={<Suspense fallback={null}><CouncilPage /></Suspense>} />

                        <Route path="/my-apps" element={<Suspense fallback={null}><MyAppsPage /></Suspense>} />
                        <Route path="/apps/:appName" element={<Suspense fallback={null}><SparkAppViewer /></Suspense>} />
                        <Route path="/settings/workflows" element={<Suspense fallback={null}><WorkflowSettings /></Suspense>} />
                        <Route path="/workflows" element={<Suspense fallback={null}><WorkflowsRunner /></Suspense>} />
                        <Route path="/waihanga/workflows" element={<Suspense fallback={null}><WaihangaWorkflows /></Suspense>} />
                        <Route path="/sector/workflows" element={<Suspense fallback={null}><SectorWorkflows /></Suspense>} />
                        <Route path="/admin/kb-priorities" element={<Suspense fallback={null}><AdminKbPriorities /></Suspense>} />
                        <Route path="/admin/knowledge-brain" element={<Suspense fallback={null}><AdminKnowledgeBrainPage /></Suspense>} />
                        <Route path="/knowledge" element={<Suspense fallback={null}><KnowledgeCataloguePage /></Suspense>} />
                        <Route path="/pikau/cbaff" element={<Suspense fallback={null}><PikauCbaffLanding /></Suspense>} />
                        <Route path="/arataki/mta" element={<Suspense fallback={null}><ArtakiMtaLanding /></Suspense>} />
                        <Route path="/settings/integrations" element={<Suspense fallback={null}><IntegrationHub /></Suspense>} />
                        <Route path="/welcome" element={<Navigate to="/onboarding" replace />} />
                        <Route path="/onboarding" element={<Suspense fallback={null}><OnboardingPage /></Suspense>} />
                        <Route path="/try" element={<Navigate to="/contact" replace />} />
                        <Route path="/packs/:packSlug" element={<PackSlugRedirect />} />
                        <Route path="/sample/:kete" element={<Suspense fallback={null}><SampleEvidencePackPage /></Suspense>} />
                        <Route path="/app/:agentId" element={<Suspense fallback={null}><AgentApp /></Suspense>} />
                        <Route path="/care/:seniorId" element={<Suspense fallback={null}><CareDashboard /></Suspense>} />
                        <Route path="/start" element={<Suspense fallback={null}><StartPage /></Suspense>} />
                        <Route path="/start/pending/:id" element={<Suspense fallback={null}><StartPendingPage /></Suspense>} />
                        <Route path="/workspace" element={<Suspense fallback={null}><WorkspaceDashboard /></Suspense>} />
                        <Route path="/workspace/connections" element={<Suspense fallback={null}><WorkspaceConnections /></Suspense>} />
                        <Route path="/sign/:token" element={<Suspense fallback={null}><SignEnvelopePage /></Suspense>} />

                        <Route path="/kete" element={<Suspense fallback={null}><KeteCollectionPage /></Suspense>} />
                        <Route path="/kete/:slug" element={<Suspense fallback={null}><KeteDetailPageNew /></Suspense>} />

                        <Route path="/aaaip" element={<Suspense fallback={null}><AaaipDashboard /></Suspense>} />
                        <Route path="/aaaip/researcher" element={<Suspense fallback={null}><AaaipResearcher /></Suspense>} />
                        <Route path="/aaaip/pitch-prep" element={<Suspense fallback={null}><AaaipPitchPrep /></Suspense>} />
                        <Route path="/aaaip/landing" element={<Suspense fallback={null}><AaaipLanding /></Suspense>} />

                        <Route path="/demos" element={<Suspense fallback={null}><DemosHub /></Suspense>} />
                        <Route path="/demos/pipeline" element={<Suspense fallback={null}><PipelineDemo /></Suspense>} />
                        <Route path="/demos/evidence-pack" element={<Suspense fallback={null}><EvidencePackDemo /></Suspense>} />
                        <Route path="/demos/confidence-scoring" element={<Suspense fallback={null}><ConfidenceScoringDemo /></Suspense>} />
                        <Route path="/demos/kaitiaki-gate" element={<Suspense fallback={null}><KaitiakiGateDemo /></Suspense>} />

                        <Route path="/manaaki" element={<Suspense fallback={null}><ManaakiLandingPage /></Suspense>} />
                        <Route path="/manaaki/dashboard" element={<Suspense fallback={null}><ManaakiDashboard /></Suspense>} />

                        <Route path="/arataki" element={<Suspense fallback={null}><AratakiLandingPage /></Suspense>} />
                        <Route path="/arataki/dashboard" element={<Suspense fallback={null}><AratakiDashboard /></Suspense>} />
                        <Route path="/arataki/fuel-oracle" element={<Suspense fallback={null}><AratakiFuelOracle /></Suspense>} />
                        <Route path="/arataki/vehicle-economy" element={<Suspense fallback={null}><AratakiVehicleEconomy /></Suspense>} />
                        <Route path="/arataki/route-intelligence" element={<Suspense fallback={null}><AratakiRouteIntelligence /></Suspense>} />
                        <Route path="/arataki/driver-compliance" element={<Suspense fallback={null}><AratakiDriverCompliance /></Suspense>} />

                        <Route path="/simulator" element={<Suspense fallback={null}><SimulatorHub /></Suspense>} />

                        <Route path="/pikau" element={<Suspense fallback={null}><PikauLandingPage /></Suspense>} />
                        <Route path="/pikau/dashboard" element={<Suspense fallback={null}><PikauDashboard /></Suspense>} />

                        <Route path="/hoko" element={<Suspense fallback={null}><HokoLandingPage /></Suspense>} />
                        <Route path="/ako" element={<Suspense fallback={null}><AkoLandingPage /></Suspense>} />

                        <Route path="/toro" element={<Suspense fallback={null}><ToroaLandingPage /></Suspense>} />
                        <Route path="/toro/dashboard" element={<Suspense fallback={null}><ToroaDashboard /></Suspense>} />
                        <Route path="/toro/app" element={<Suspense fallback={null}><ToroaApp /></Suspense>} />
                        <Route path="/toro/install" element={<Suspense fallback={null}><ToroaInstallPage /></Suspense>} />
                        <Route path="/toro/travel" element={<Suspense fallback={null}><ToroaTravelPage /></Suspense>} />
                        <Route path="/toro/chat" element={<Suspense fallback={null}><ToroaChatPage /></Suspense>} />

                        <Route path="/waihanga/workflow" element={<Suspense fallback={null}><WaihangaWorkflow /></Suspense>} />
                        <Route path="/waihanga/about" element={<Suspense fallback={null}><WaihangaLandingPage /></Suspense>} />
                        <Route path="/waihanga" element={<Suspense fallback={null}><HangaLayout /></Suspense>}>
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
                          <Route path="architecture" element={<Suspense fallback={null}><WaihangaArchitecturePage /></Suspense>} />
                          <Route path="subbies" element={<SubbiesPage />} />
                        </Route>

                        <Route path="/auaha/about" element={<Suspense fallback={null}><AuahaLandingPage /></Suspense>} />
                        <Route path="/auaha" element={<Suspense fallback={null}><AuahaLayout /></Suspense>}>
                          <Route index element={<AuahaDashboard />} />
                          <Route path="generate" element={<AuahaGenerate />} />
                          <Route path="gallery" element={<AuahaGallery />} />
                          <Route path="audit" element={<AuahaTaAudit />} />
                          <Route path="prompts" element={<AuahaPromptLibrary />} />
                          <Route path="whaikorero" element={<AuahaWhaikorero />} />
                          <Route path="campaign" element={<AuahaCampaignBuilder />} />
                          <Route path="copy" element={<AuahaCopyStudio />} />
                          <Route path="image-studio" element={<PixelImageStudio />} />
                          <Route path="images" element={<Navigate to="/auaha/image-studio" replace />} />
                          <Route path="video" element={<AuahaVideoStudio />} />
                          <Route path="loom" element={<AuahaLoomStudio />} />
                          <Route path="podcast" element={<AuahaPodcastStudio />} />
                          <Route path="ads" element={<AuahaAdManager />} />
                          <Route path="calendar" element={<AuahaCalendar />} />
                          <Route path="analytics" element={<AuahaAnalytics />} />
                          <Route path="brand" element={<AuahaBrandIdentity />} />
                          <Route path="web" element={<AuahaWebBuilder />} />
                          <Route path="speech-image" element={<AuahaSpeechToImage />} />
                          <Route path="app-spark" element={<AppSparkForge />} />
                          <Route path="brand-scan" element={<AuahaBrandScanner />} />
                          <Route path="reels" element={<ReelsPage />} />
                        </Route>

                        <Route path="/hanga" element={<Navigate to="/waihanga" replace />} />
                        <Route path="/hanga/*" element={<Navigate to="/waihanga" replace />} />
                        <Route path="/helm" element={<Navigate to="/toro" replace />} />
                        <Route path="/helm/*" element={<Navigate to="/toro" replace />} />
                        <Route path="/toroa" element={<Navigate to="/toro" replace />} />
                        <Route path="/toroa/*" element={<Navigate to="/toro" replace />} />
                        <Route path="/pakihi" element={<Navigate to="/" replace />} />
                        <Route path="/hangarau" element={<Navigate to="/" replace />} />
                        <Route path="/te-kahui-reo" element={<Navigate to="/" replace />} />
                        <Route path="/aura" element={<Navigate to="/manaaki" replace />} />
                        <Route path="/nexus" element={<Navigate to="/" replace />} />
                        <Route path="/aroha" element={<Navigate to="/" replace />} />
                        <Route path="/aroha/*" element={<Navigate to="/" replace />} />
                        <Route path="/tradie-portal" element={<Navigate to="/waihanga" replace />} />
                        <Route path="/landlord" element={<Navigate to="/" replace />} />
                        <Route path="/agents/:agentId" element={<AgentSlugRedirect />} />
                        <Route path="/fuel-savings" element={<Navigate to="/arataki" replace />} />
                        <Route path="/claims-register" element={<Navigate to="/" replace />} />
                        <Route path="/turf" element={<Navigate to="/" replace />} />
                        <Route path="/turf-5-april-2026" element={<Navigate to="/" replace />} />
                        <Route path="/tikanga" element={<Navigate to="/about" replace />} />
                        <Route path="/skill-hub" element={<Navigate to="/" replace />} />
                        <Route path="/proposal" element={<Suspense fallback={null}><InvestPage /></Suspense>} />
                        <Route path="/invest" element={<Suspense fallback={null}><InvestPage /></Suspense>} />
                        <Route path="/brand-guidelines" element={<Suspense fallback={null}><BrandGuidelinesPage /></Suspense>} />
                        <Route path="/brand-assets" element={<Navigate to="/brand-guidelines" replace />} />
                        <Route path="/logo-stack" element={<Navigate to="/brand-guidelines" replace />} />
                        <Route path="/brand-story" element={<Navigate to="/brand-guidelines" replace />} />
                        <Route path="/te-reo" element={<Navigate to="/about" replace />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      </PageTransition>
                    </div>
                    <EchoChatWidget />
                    <MobileTabBar />
                    <AdminCommandPalette />
                  </BusinessProvider>
                </PersonalizationProvider>
              </BrandDnaProvider>
            </AuthProvider>
          </BrowserRouter>
        </TeReoProvider>
      </HighContrastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
