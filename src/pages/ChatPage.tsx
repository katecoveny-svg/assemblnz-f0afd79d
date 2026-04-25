import { useState, useRef, useEffect, useCallback, lazy, Suspense, useMemo } from "react";
import { assemblMark } from "@/assets/brand";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { agents, echoAgent, pilotAgent } from "@/data/agents";
import { useResolvedAgent } from "@/hooks/useAgentOverrides";
import AgentAvatar from "@/components/AgentAvatar";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, ImagePlus, Paperclip, X, FileText, Globe, LayoutGrid, Lock, Sparkles, Shield, Trophy, Leaf, MessageSquare, Mic, MicOff, Volume2, Upload, Loader2, Layers, ListChecks, Phone, Radio, Camera, RotateCcw, Target, AlertCircle, Download, LayoutDashboard } from "lucide-react";
import { AGENT_LOADING_MESSAGES } from "@/engine/personality";
import { agentCapabilities } from "@/data/agentCapabilities";
import AgentMemoryPanel from "@/components/chat/AgentMemoryPanel";
import ActionQueuePanel from "@/components/chat/ActionQueuePanel";
import ImageLightbox from "@/components/chat/ImageLightbox";
import sparkCtaImg from "@/assets/agents/spark.png";
import ReactMarkdown from "react-markdown";
import ModelGenerationCard from "@/components/ModelGenerationCard";
import HelmQuickActions from "@/components/helm/HelmQuickActions";
import HelmChecklist from "@/components/helm/HelmChecklist";
import HelmDashboard from "@/components/helm/HelmDashboard";
import BrandScanModal from "@/components/BrandScanModal";
import TemplateLibrary from "@/components/TemplateLibrary";
import StructuredOutputCard, { detectOutputType } from "@/components/StructuredOutputCard";
import NexusEntryCard from "@/components/nexus/NexusEntryCard";
import NexusJobSheet, { type JobSheetData, type DocumentStatus } from "@/components/nexus/NexusJobSheet";
import HandoffCard, { detectHandoff } from "@/components/HandoffCard";
import ProactiveAlertCards from "@/components/chat/ProactiveAlertCards";
import { agentTemplates } from "@/data/templates";
import { AGENT_LIVE_DATA_MAP } from "@/data/agentLiveDataMap";
import { useAuth } from "@/hooks/useAuth";
import AccountDropdown from "@/components/AccountDropdown";
import PaywallModal from "@/components/PaywallModal";
import { NeonLock } from "@/components/NeonIcons";
import AgentWelcome from "@/components/AgentWelcome";
import { prefillAndSend } from "@/engine/prefillAndSend";
import { getStarterQuestions } from "@/engine/starterQuestions";
import { AgentDebugPanel } from "@/components/dev/AgentDebugPanel";
import { usePersistAgentContext, getLastAgentContext } from "@/hooks/usePersistAgentContext";
import { useGuestChatSync } from "@/hooks/useGuestChatSync";
import TemplateTab from "@/components/TemplateTab";
import { TEMPLATE_TAB_AGENTS } from "@/data/templates";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import AITransparencyBadge from "@/components/chat/AITransparencyBadge";
import ConversationExport from "@/components/chat/ConversationExport";
import ChatSearchBar from "@/components/chat/ChatSearchBar";
import ChatEvidencePackButton from "@/components/chat/ChatEvidencePackButton";
import ResponseSources from "@/components/chat/ResponseSources";
import { uploadGeneratedImage } from "@/lib/uploadGeneratedImage";
import SaveToLibrary from "@/components/chat/SaveToLibrary";
import MessagePDFButton from "@/components/chat/MessagePDFButton";
import LegislationCard from "@/components/chat/LegislationCard";
import LanguageSelector from "@/components/chat/LanguageSelector";
import { useLanguage } from "@/components/chat/TeReoProvider";
import ContentStudio from "@/components/ContentStudio";
import ApexTenderWriter from "@/components/apex/ApexTenderWriter";
import ApexAwardsTracker from "@/components/apex/ApexAwardsTracker";
import ApexHSHub from "@/components/apex/ApexHSHub";
import ApexESGDashboard from "@/components/apex/ApexESGDashboard";
import ApexIoTFieldTech from "@/components/apex/ApexIoTFieldTech";
import BimAnalysisPanel from "@/components/shared/BimAnalysisPanel";
import ForgeShowroom from "@/components/forge/ForgeShowroom";
import OdysseyTravelPlanner from "@/components/hauora/OdysseyTravelPlanner";
import ForgeSales from "@/components/forge/ForgeSales";
import ForgePartsService from "@/components/forge/ForgePartsService";
import ForgeMarketing from "@/components/forge/ForgeMarketing";
import ForgeEvents from "@/components/forge/ForgeEvents";
import ForgeBrandHub from "@/components/forge/ForgeBrandHub";
import ForgeTeam from "@/components/forge/ForgeTeam";
import ForgeAudit from "@/components/forge/ForgeAudit";
// Aroha imports removed — HR module retired
import AuraPropertySetup from "@/components/aura/AuraPropertySetup";
import AuraReservations from "@/components/aura/AuraReservations";
import AuraGuestExperience from "@/components/aura/AuraGuestExperience";
import AuraKitchenFnB from "@/components/aura/AuraKitchenFnB";
import AuraMarketing from "@/components/aura/AuraMarketing";
import AuraEvents from "@/components/aura/AuraEvents";
import AuraOperations from "@/components/aura/AuraOperations";
import AuraTeam from "@/components/aura/AuraTeam";
import AuraRevenue from "@/components/aura/AuraRevenue";
import AuraGuestMemory from "@/components/aura/AuraGuestMemory";
import AuraSustainability from "@/components/aura/AuraSustainability";
import AuraTrade from "@/components/aura/AuraTrade";
import AuraPOS from "@/components/aura/AuraPOS";
import AuraFoodSafety from "@/components/aura/AuraFoodSafety";
import InternalComms from "@/components/InternalComms";
import HavenDashboard from "@/components/haven/HavenDashboard";
import HavenProperties from "@/components/haven/HavenProperties";
import HavenJobs from "@/components/haven/HavenJobs";
import HavenTradies from "@/components/haven/HavenTradies";
import HavenCommandCentre from "@/components/haven/HavenCommandCentre";
import HavenCompliance from "@/components/haven/HavenCompliance";
import HavenCostIntelligence from "@/components/haven/HavenCostIntelligence";
import HavenDocuments from "@/components/haven/HavenDocuments";
import HavenNotifications from "@/components/haven/HavenNotifications";
import FluxLeadPipeline from "@/components/flux/FluxLeadPipeline";
import FluxFollowUps from "@/components/flux/FluxFollowUps";
import FluxClients from "@/components/flux/FluxClients";
import PrismCampaigns from "@/components/prism/PrismCampaigns";
import PrismSocialMedia from "@/components/prism/PrismSocialMedia";
import PrismBrandVoice from "@/components/prism/PrismBrandVoice";
import PrismCreativeStudio from "@/components/prism/PrismCreativeStudio";
import PrismVideoStudio from "@/components/prism/PrismVideoStudio";
import PrismBrandLab from "@/components/prism/PrismBrandLab";
import PrismAdStudio from "@/components/prism/PrismAdStudio";
import PrismProductStudio from "@/components/prism/PrismProductStudio";
import PrismBrandDNA from "@/components/prism/PrismBrandDNA";
import PrismSocialPublisher from "@/components/prism/PrismSocialPublisher";
import PrismAdEngine from "@/components/prism/PrismAdEngine";
import PrismPodcastStudio from "@/components/prism/PrismPodcastStudio";
import AdEngineModal from "@/components/prism/AdEngineModal";
import SparkDeployModal from "@/components/spark/SparkDeployModal";
import AxisAutomations from "@/components/axis/AxisAutomations";
import HelmThisWeek from "@/components/helm/HelmThisWeek";
import HelmBusTracker from "@/components/helm/HelmBusTracker";
import HelmTimetable from "@/components/helm/HelmTimetable";
import HelmInbox from "@/components/helm/HelmInbox";
import HelmReview from "@/components/helm/HelmReview";
import HelmRescue from "@/components/helm/HelmRescue";
import HelmSettings from "@/components/helm/HelmSettings";
import AgentTraining from "@/components/shared/AgentTraining";
import AgentSmsPanel from "@/components/shared/AgentSmsPanel";
import LiveDataPanel from "@/components/shared/LiveDataPanel";
import VoiceAgentLive from "@/components/VoiceAgentLive";
import GeminiLiveVoice from "@/components/GeminiLiveVoice";
import VoiceAgentModal from "@/components/VoiceAgentModal";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";
import SparkTemplateGrid from "@/components/spark/SparkTemplateGrid";
import KindleCampaignWriter from "@/components/kindle/KindleCampaignWriter";
import KindleMarketplace from "@/components/kindle/KindleMarketplace";
import KindleImpactDashboard from "@/components/kindle/KindleImpactDashboard";
import KindleCorporateDashboard from "@/components/kindle/KindleCorporateDashboard";
import TeReoVideoLearner from "@/components/chat/TeReoVideoLearner";
import OraCheckIn from "@/components/care/OraCheckIn";
import TahiTriage from "@/components/care/TahiTriage";
import VitaeCareJourneys from "@/components/care/VitaeCareJourneys";
import ArohaCaregiverWellbeing from "@/components/care/ArohaCaregiverWellbeing";
import HavenHomeSafety from "@/components/care/HavenHomeSafety";

const CompletedModelCard = lazy(() => import("@/components/CompletedModelCard"));
import SparkPreview from "@/components/spark/SparkPreview";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  fileName?: string;
  /** Permanent URLs of images the agent generated for this message. Persisted with the conversation. */
  generatedImageUrls?: string[];
}

type VoiceTranscriptTurn = {
  role: "user" | "agent";
  text: string;
};

interface ThreeDGeneration {
  id: string;
  messageIndex: number;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progress: number;
  prompt?: string;
  taskId?: string;
  modelUrls?: { glb?: string; obj?: string; fbx?: string };
  thumbnailUrl?: string;
  type?: "text-to-3d" | "image-to-3d";
}

interface DashboardItem {
  type: "event" | "meal" | "reminder";
  text: string;
  date?: string;
}

const TRIGGER_PATTERNS = [
  /generate\s+a?\s*3d/i, /create\s+a?\s*3d/i, /build\s+a?\s*3d/i, /make\s+a?\s*3d/i,
  /3d\s*model/i, /visuali[sz]e/i, /\brender\b/i, /show\s+me\s+(what|a)/i, /fly\s*through/i, /walkthrough/i,
];

const MAX_GENERATIONS_PER_SESSION = 5;
const TOROA_COLOR = "#3A6A9C";

function shouldTrigger3D(text: string): boolean {
  return TRIGGER_PATTERNS.some((p) => p.test(text));
}

function hasChecklist(content: string): boolean {
  return /^[-*]\s*\[([ xX])\]/m.test(content);
}

function parseNexusEntry(content: string) {
  if (!/import entry summary/i.test(content)) return null;
  try {
    const lines: any[] = [];
    const linePattern = /(\d+)\.\s+(.+?)[\n\r]+\s*HS Code:\s*(\S+)(.*?)[\n\r]+\s*Origin:\s*(\S+).*?(?:FTA:\s*([^\n|]+))?.*?[\n\r]+\s*Qty:.*?(?:(\d[\d,]*\s*\w*))?.*?Value:\s*\$?([\d,.]+).*?[\n\r]+\s*Duty:.*?=\s*\$?([\d,.]+).*?[\n\r]+\s*GST:.*?=\s*\$?([\d,.]+)/gim;
    let match;
    while ((match = linePattern.exec(content)) !== null) {
      const flagged = match[4]?.includes("") || match[4]?.includes("uncertain");
      lines.push({
        line: parseInt(match[1]),
        description: match[2].trim(),
        hsCode: match[3].trim(),
        origin: match[5].trim(),
        fta: match[6]?.trim() || undefined,
        qty: match[7]?.trim() || undefined,
        valueNZD: "$" + match[8].trim(),
        duty: "$" + match[9].trim(),
        gst: "$" + match[10].trim(),
        flagged,
        flagReason: flagged ? "Uncertain classification — broker review recommended" : undefined,
      });
    }
    if (lines.length === 0) return null;
    const getField = (label: string) => {
      const m = content.match(new RegExp(label + ":\\s*(.+)", "i"));
      return m?.[1]?.trim();
    };
    return {
      supplier: getField("Supplier"),
      consignee: getField("Consignee"),
      invoice: getField("Invoice"),
      transport: getField("Transport"),
      lines,
      totalValue: getField("Customs Value") || getField("Total Customs Value"),
      totalDuty: getField("Total Duty"),
      totalGST: getField("Total GST"),
      totalPayable: getField("TOTAL PAYABLE"),
      flaggedItems: (() => {
        const flaggedItems: string[] = [];
        const flagSection = content.match(/FLAGGED FOR BROKER REVIEW[:\s]*\n([\s\S]*?)(?:\n\n|$)/i);
        if (flagSection) {
          const items = flagSection[1].match(/[•\-*]\s*(.+)/g);
          items?.forEach((item) => flaggedItems.push(item.replace(/^[•\-*]\s*/, "")));
        }
        return flaggedItems.length > 0 ? flaggedItems : undefined;
      })(),
    };
  } catch { return null; }
}

// Parse job sheet data from NEXUS response
function parseJobSheetData(content: string): JobSheetData | null {
  if (!/job sheet|freight|shipping details|consignee|bill of lading/i.test(content)) return null;
  const getField = (label: string) => {
    const m = content.match(new RegExp(label + "[:\\s]+([^\\n]+)", "i"));
    return m?.[1]?.trim();
  };
  const containerMatches = content.match(/[A-Z]{4}\d{7}/g);
  const data: JobSheetData = {
    consignee: getField("Consignee") || getField("Importer"),
    supplier: getField("Supplier") || getField("Shipper") || getField("Exporter"),
    vessel: getField("Vessel") || getField("Ship"),
    billOfLading: getField("B/L") || getField("Bill of Lading") || getField("BL Number"),
    containerNumbers: containerMatches ? [...new Set(containerMatches)] : [],
    origin: getField("Origin") || getField("Country of Origin"),
    weights: getField("Weight") || getField("Gross Weight"),
    packages: getField("Package") || getField("Packages"),
  };
  if (!data.consignee && !data.supplier && !data.billOfLading) return null;
  return data;
}

// Parse MPI alerts from NEXUS response
function parseMPIAlerts(content: string): { item: string; reason: string; requirement: string }[] {
  const alerts: { item: string; reason: string; requirement: string }[] = [];
  const mpiSection = content.match(/(?:MPI|biosecurity|quarantine)[^]*?(?=\n\n|\n#+|$)/i);
  if (!mpiSection) return alerts;
  const items = mpiSection[0].match(/[•\-*]\s*\*?\*?(.+?)(?:\*?\*?)\s*[-–:]\s*(.+)/g);
  if (items) {
    items.forEach((item) => {
      const parts = item.replace(/^[•\-*]\s*\*?\*?/, "").split(/[-–:]\s*/);
      if (parts.length >= 2) {
        alerts.push({
          item: parts[0].replace(/\*+/g, "").trim(),
          reason: parts[1]?.trim() || "May require MPI clearance",
          requirement: parts[2]?.trim() || "Submit to MPI for assessment prior to goods release",
        });
      }
    });
  }
  return alerts;
}

// Detect document types from content
function detectDocumentType(content: string): Partial<DocumentStatus> {
  const lower = content.toLowerCase();
  const detected: Partial<DocumentStatus> = {};
  if (/job sheet|freight instruction|shipping instruction/i.test(lower)) detected.jobSheet = true;
  if (/commercial invoice|invoice no|invoice number|inv[\s-]*\d/i.test(lower)) detected.commercialInvoice = true;
  if (/packing list|pack list|carton list/i.test(lower)) detected.packingList = true;
  if (/bill of lading|b\/l|bl number|ocean bill|airway bill|awb/i.test(lower)) detected.billOfLading = true;
  if (/certificate of origin|origin cert|form [a-e]|preferential/i.test(lower)) detected.certificateOfOrigin = true;
  if (/phytosanitary|plant health/i.test(lower)) detected.phytosanitaryCert = true;
  if (/fumigation|methyl bromide|ispm\s*15/i.test(lower)) detected.fumigationCert = true;
  return detected;
}

async function imageToBase64(file: File, maxDim = 1024): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL(file.type || "image/jpeg", 0.85);
        resolve({ base64: dataUrl.split(",")[1], mediaType: file.type || "image/jpeg" });
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const BINARY_FILE_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];

// Re-export from shared module so the routing-integrity test can validate links.
import { SLUG_TO_ID } from "@/lib/agentSlugMap";

const ChatPage = () => {
  const { agentId: rawAgentId } = useParams<{ agentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const agentId = rawAgentId ? (SLUG_TO_ID[rawAgentId] ?? rawAgentId) : rawAgentId;
  const rawAgent = agentId === "echo" ? echoAgent : agentId === "pilot" ? pilotAgent : agents.find((a) => a.id === agentId);
  const agent = useResolvedAgent(rawAgent ?? agents[0]);
  const safeAgentName = agent?.name ?? "Assistant";
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const displayedMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => (m.content || "").toLowerCase().includes(q));
  }, [messages, searchQuery]);
  const [input, setInput] = useState(() => {
    const from = searchParams.get("from");
    const context = searchParams.get("context");
    if (agentId === "spark" && from && context) {
      return `Build a ${from.toLowerCase()}-style app based on this: ${context}`;
    }
    if (agentId === "spark" && from) {
      return `Build a ${from.toLowerCase()}-style app`;
    }
    return "";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generations, setGenerations] = useState<ThreeDGeneration[]>([]);
  const [genCount, setGenCount] = useState(0);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "templates" | "content_studio" | "tender_writer" | "awards" | "hs_hub" | "esg" | "iot_field" | "bim_analyze" | "bim_clash" | "bim_schedule" | "bim_3d" | "internal_comms" | "forge_showroom" | "forge_sales" | "forge_parts" | "forge_marketing" | "forge_events" | "forge_brand" | "forge_team" | "forge_audit" | "aroha_contracts" | "aroha_onboarding" | "aroha_payroll" | "aroha_recruitment" | "aroha_people" | "aroha_company" | "aroha_retention" | "aroha_caregiver" | "aura_setup" | "aura_reservations" | "aura_guest" | "aura_kitchen" | "aura_marketing" | "aura_events" | "aura_operations" | "aura_team" | "aura_revenue" | "aura_memory" | "aura_sustainability" | "aura_trade" | "aura_pos" | "aura_food_safety" | "haven_dashboard" | "haven_properties" | "haven_jobs" | "haven_tradies" | "haven_command" | "haven_compliance" | "haven_costs" | "haven_documents" | "haven_notifications" | "haven_safety" | "flux_pipeline" | "flux_followups" | "flux_clients" | "prism_campaigns" | "prism_social" | "prism_brand" | "prism_creative" | "prism_video" | "prism_brandlab" | "prism_publisher" | "prism_ads" | "prism_product" | "prism_adengine" | "prism_podcast" | "axis_automations" | "agent_training" | "voice_waitlist" | "agent_sms" | "helm_week" | "helm_bus" | "helm_timetable" | "helm_inbox" | "helm_review" | "helm_rescue" | "helm_settings" | "kindle_writer" | "kindle_marketplace" | "kindle_impact" | "kindle_corporate" | "turf_events" | "turf_membership" | "turf_facilities" | "turf_sponsorship" | "turf_performance" | "turf_compliance" | "odyssey_planner" | "live_data" | "te_reo_learn" | "ora_checkin" | "ora_dashboard" | "tahi_triage" | "vitae_journeys">("chat");
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [toroaView, setToroaView] = useState<"chat" | "dashboard">("chat");
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [brandProfile, setBrandProfile] = useState<string | null>(
    () => sessionStorage.getItem("assembl_brand_profile")
  );
  const [brandName, setBrandName] = useState<string | null>(
    () => sessionStorage.getItem("assembl_brand_name")
  );
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(
    () => sessionStorage.getItem("assembl_brand_logo")
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [paywallType, setPaywallType] = useState<"preview" | "daily_limit" | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(() => sessionStorage.getItem("assembl_ai_model") || "gemini-flash");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState<"elevenlabs" | "gemini">("elevenlabs");
  const [historyReady, setHistoryReady] = useState(false);
  const [showOnboardingTooltip, setShowOnboardingTooltip] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // PRISM quick image generation modal
  const [prismImageModalOpen, setPrismImageModalOpen] = useState(false);
  const [prismImagePrompt, setPrismImagePrompt] = useState("");
  const [prismImageAspect, setPrismImageAspect] = useState<"1:1" | "16:9" | "9:16" | "4:3">("1:1");
  const [prismImageGenerating, setPrismImageGenerating] = useState(false);
  const [adEngineOpen, setAdEngineOpen] = useState(false);

  // NEXUS Job Sheet workflow state
  const [nexusWorkflowActive, setNexusWorkflowActive] = useState(false);
  const [nexusWorkflowStep, setNexusWorkflowStep] = useState(0);
  const [nexusJobSheetData, setNexusJobSheetData] = useState<JobSheetData | null>(null);
  const [nexusDocStatus, setNexusDocStatus] = useState<DocumentStatus>({
    jobSheet: false, commercialInvoice: false, packingList: false,
    billOfLading: false, certificateOfOrigin: false, phytosanitaryCert: false,
    fumigationCert: false, other: false,
  });
  const [nexusMPIAlerts, setNexusMPIAlerts] = useState<{ item: string; reason: string; requirement: string }[]>([]);
  const [nexusContainerNumbers, setNexusContainerNumbers] = useState<string[]>([]);

  // Inline image generation state (ECHO visual outputs)
  const [inlineImages, setInlineImages] = useState<Record<number, { status: "loading" | "done" | "error"; urls: string[] }>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const { user, session, isPaid, canUseFeature, incrementMessageCount, dailyMessageCount, dailyLimit, messageLimitReached, role } = useAuth();
  const { teReoPrompt } = useLanguage();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [auraModeKey, setAuraModeKey] = useState(0);

  // Voice input/output state (TORO)
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const universalFileInputRef = useRef<HTMLInputElement>(null);
  const nexusFileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<Record<string, number>>({});
  const processedVoiceHandoffRef = useRef<string | null>(null);

  // Agent type detection — using canonical IDs from agents.ts
  const isArc = agentId === "ata" || agentId === "arc";
  const isForge = agentId === "motor" || agentId === "forge";
  const isAroha = agentId === "aroha";
  const isAura = agentId === "aura";
  const isToroa = agentId === "toroa";
  const isNexus = agentId === "gateway";
  const isMarketing = agentId === "prism" || agentId === "market";
  const isConstruction = ["arai", "ata", "kaupapa", "rawa", "whakaaē", "pai", "arc", "terra", "pinnacle"].includes(agentId || "");
  const isHanga = isConstruction;
  const isHaven = agentId === "haven";
  const isFlux = agentId === "flux";
  const isPrism = agentId === "prism";
  const isAxis = agentId === "sage";
  const isNonprofit = agentId === "anchor";
  const isSpark = agentId === "spark";
  const isSports = agentId === "turf" || agentId === "league";
  const isOra = agentId === "vitals";
  const isTahi = agentId === "remedy";
  const isVitae = agentId === "vitae";
  // Live Data tab visible for any agent registered in the live-data map
  const hasLiveDataTab = !!(agentId && AGENT_LIVE_DATA_MAP[agentId]?.length);

  const hasTemplates = !!(agentId && agentTemplates[agentId]?.length);
  const hasTemplateTab = !!(agentId && TEMPLATE_TAB_AGENTS.includes(agentId));

  // First-time onboarding tooltip
  useEffect(() => {
    if (!agentId) return;
    const key = `assembl_onboarded_${agentId}`;
    if (!localStorage.getItem(key)) {
      const timer = setTimeout(() => setShowOnboardingTooltip(true), 800);
      return () => clearTimeout(timer);
    }
  }, [agentId]);

  // Persist resolved agent context (id, color, name) for cross-refresh recovery
  usePersistAgentContext(rawAgentId, agent);

  const dismissOnboarding = () => {
    if (onboardingStep < 2) {
      setOnboardingStep(s => s + 1);
    } else {
      setShowOnboardingTooltip(false);
      if (agentId) localStorage.setItem(`assembl_onboarded_${agentId}`, "1");
    }
  };

  // Listen for AURA mode changes to refresh tabs
  useEffect(() => {
    const handler = () => setAuraModeKey(k => k + 1);
    window.addEventListener("aura-mode-changed", handler);
    return () => window.removeEventListener("aura-mode-changed", handler);
  }, []);

  // ECHO Receptionist Mode
  const [receptionistMode, setReceptionistMode] = useState(() => sessionStorage.getItem("assembl_receptionist_mode") === "true");

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-NZ";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // Voice output (Text-to-Speech) via ElevenLabs for all agents
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const speakText = useCallback(async (text: string, messageIndex: number) => {
    if (isSpeaking === messageIndex) {
      activeAudioRef.current?.pause();
      activeAudioRef.current = null;
      setIsSpeaking(null);
      return;
    }
    // Stop any currently playing audio
    activeAudioRef.current?.pause();
    activeAudioRef.current = null;

    const cleanText = text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[-•·]\s/g, "")
      .replace(/\n{2,}/g, ". ")
      .slice(0, 4000); // ElevenLabs limit

    setIsSpeaking(messageIndex);

    try {
      const session = await supabase.auth.getSession();
      const tkn = session.data.session?.access_token;

      // Determine voice style based on agent
      const AGENT_VOICE_STYLES: Record<string, string> = {
        hospitality: "warm", operations: "mate", sales: "mate",
        marketing: "warm", hr: "warm", echo: "mate", customs: "professional",
        automotive: "professional", construction: "professional", sports: "mate",
      };
      const voiceStyle = AGENT_VOICE_STYLES[agentId || ""] || "professional";

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${tkn}`,
        },
        body: JSON.stringify({ text: cleanText, voiceId: "JBFqnCBsd6RMkjVDRZzb", voiceStyle }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      activeAudioRef.current = audio;
      audio.onended = () => { setIsSpeaking(null); activeAudioRef.current = null; URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsSpeaking(null); activeAudioRef.current = null; };
      await audio.play();
    } catch {
      // Fallback to browser TTS if ElevenLabs fails
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-NZ";
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeaking, agentId]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      activeAudioRef.current?.pause();
      activeAudioRef.current = null;
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, generations]);

  useEffect(() => { return () => { Object.values(pollingRef.current).forEach(clearInterval); }; }, []);
  useEffect(() => { return () => { if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview); }; }, [pendingImagePreview]);

  // Load conversation history on mount (DB for signed-in users, localStorage fallback for guests)
  useEffect(() => {
    let isActive = true;

    // Reset state when agent changes to prevent cross-contamination
    setMessages([]);
    setConversationId(null);

    if (!agentId) {
      setHistoryReady(true);
      return;
    }

    setHistoryReady(false);

    const loadConversation = async () => {
      try {
        if (user) {
          const { data } = await supabase
            .from("conversations")
            .select("id, messages")
            .eq("user_id", user.id)
            .eq("agent_id", agentId)
            .order("updated_at", { ascending: false })
            .limit(1);

          if (!isActive) return;

          if (data && data.length > 0) {
            const conv = data[0] as any;
            setConversationId(conv.id);
            if (Array.isArray(conv.messages) && conv.messages.length > 0) {
              setMessages(conv.messages as Message[]);
              return;
            }
          }
        }

        // Guest fallback: restore from localStorage
        try {
          const stored = localStorage.getItem(`assembl_chat_${agentId}`);
          if (stored && isActive) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed as Message[]);
            }
          }
        } catch {
          // ignore parse errors
        }
      } finally {
        if (isActive) setHistoryReady(true);
      }
    };

    void loadConversation();

    return () => {
      isActive = false;
    };
  }, [user, agentId]);

  // Save conversation when messages change (DB for signed-in users, localStorage for guests)
  useEffect(() => {
    if (!agentId || messages.length === 0) return;

    if (user) {
      const save = async () => {
        if (conversationId) {
          await supabase.from("conversations").update({ messages: messages as any, updated_at: new Date().toISOString() }).eq("id", conversationId);
        } else {
          const { data } = await supabase.from("conversations").insert({ user_id: user.id, agent_id: agentId, messages: messages as any }).select("id").single();
          if (data) setConversationId((data as any).id);
        }
      };
      save();
      return;
    }

    // Guest persistence: cap to last 50 messages to avoid bloating storage
    try {
      const trimmed = messages.slice(-50);
      localStorage.setItem(`assembl_chat_${agentId}`, JSON.stringify(trimmed));
    } catch {
      // localStorage may be full or disabled — silently ignore
    }
  }, [messages, user, agentId, conversationId]);

  // Cross-tab sync for guest sessions: instantly mirror updates from other tabs.
  useGuestChatSync({
    agentId,
    isGuest: !user,
    messages,
    setMessages,
  });

  // Process NEXUS assistant responses for workflow data
  const processNexusResponse = useCallback((content: string) => {
    // Extract job sheet data
    const jsData = parseJobSheetData(content);
    if (jsData) {
      setNexusJobSheetData((prev) => ({ ...prev, ...jsData }));
      if (jsData.containerNumbers?.length) {
        setNexusContainerNumbers((prev) => [...new Set([...prev, ...(jsData.containerNumbers || [])])]);
      }
    }

    // Detect document types mentioned
    const docTypes = detectDocumentType(content);
    setNexusDocStatus((prev) => ({ ...prev, ...docTypes }));

    // Parse MPI alerts
    const alerts = parseMPIAlerts(content);
    if (alerts.length > 0) {
      setNexusMPIAlerts((prev) => {
        const existing = new Set(prev.map((a) => a.item));
        return [...prev, ...alerts.filter((a) => !existing.has(a.item))];
      });
    }

    // Advance workflow step based on content
    if (/import entry summary/i.test(content)) {
      setNexusWorkflowStep(3); // Review entry
    } else if (docTypes.commercialInvoice || docTypes.packingList || docTypes.billOfLading) {
      setNexusWorkflowStep((s) => Math.max(s, 2));
    } else if (jsData) {
      setNexusWorkflowStep((s) => Math.max(s, 1));
    }
  }, []);

  const pollStatus = useCallback(
    (genId: string, taskId: string, type: "text-to-3d" | "image-to-3d" = "text-to-3d") => {
      const interval = setInterval(async () => {
        try {
          const session = (await supabase.auth.getSession()).data.session;
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-3d?taskId=${taskId}&type=${type}`,
            { headers: { 
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            } }
          );
          const data = await res.json();
          setGenerations((prev) =>
            prev.map((g) =>
              g.id === genId
                ? { ...g, status: data.status, progress: data.progress ?? g.progress, modelUrls: data.modelUrls || g.modelUrls, thumbnailUrl: data.thumbnailUrl || g.thumbnailUrl }
                : g
            )
          );
          if (data.status === "SUCCEEDED" || data.status === "FAILED") {
            clearInterval(interval);
            delete pollingRef.current[genId];
          }
        } catch { /* silent retry */ }
      }, 5000);
      pollingRef.current[genId] = interval as unknown as number;
    }, []
  );

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("chat-images").upload(filePath, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("chat-images").getPublicUrl(filePath);
    return data.publicUrl;
  }, []);

  // Logo upload handler
  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit
    setIsUploadingLogo(true);
    try {
      const url = await uploadImage(file);
      setBrandLogoUrl(url);
      sessionStorage.setItem("assembl_brand_logo", url);
    } catch (err) {
      console.error("Logo upload error:", err);
    } finally {
      setIsUploadingLogo(false);
      if (e.target) e.target.value = "";
    }
  }, [uploadImage]);

  // Inline image generation from [GENERATE_IMAGE: ...] tags
  const triggerInlineImages = useCallback(async (content: string, msgIndex: number, userQuality?: string) => {
    const imageTagRegex = /\[GENERATE_IMAGE:\s*(.*?)\]/g;
    const prompts: string[] = [];
    let match;
    while ((match = imageTagRegex.exec(content)) !== null) {
      prompts.push(match[1].trim());
    }
    if (prompts.length === 0) return;

    setInlineImages((prev) => ({ ...prev, [msgIndex]: { status: "loading", urls: [] } }));

    // Design-related agents get higher quality by default
    const DESIGN_AGENTS: Record<string, { quality: string; platform: string; contentType: string; context: string }> = {
      marketing: { quality: "pro", platform: "brand_marketing", contentType: "brand_asset", context: "Professional brand marketing asset. Create agency-quality visuals with premium aesthetics, sophisticated composition, and commercial-grade polish." },
      hospitality: { quality: "flash_pro", platform: "hospitality_marketing", contentType: "guest_experience", context: "Luxury hospitality visual — elegant, premium, aspirational. Think 5-star lodge marketing material." },
      tourism: { quality: "flash_pro", platform: "tourism_marketing", contentType: "destination_visual", context: "NZ tourism marketing asset — breathtaking landscapes, adventure, cultural depth. Aspirational travel imagery." },
      automotive: { quality: "flash_pro", platform: "automotive_marketing", contentType: "vehicle_showcase", context: "Automotive dealership marketing — sleek vehicle imagery, showroom aesthetic, professional dealership branding." },
      retail: { quality: "flash_pro", platform: "retail_marketing", contentType: "product_visual", context: "Retail marketing visual — eye-catching product displays, promotional graphics, seasonal campaign imagery." },
      style: { quality: "flash_pro", platform: "fashion_lifestyle", contentType: "style_visual", context: "Fashion and style visual — curated wardrobe imagery, style guides, seasonal lookbooks." },
      construction: { quality: "flash_pro", platform: "construction_marketing", contentType: "project_showcase", context: "Construction industry visual — project showcases, safety signage, tender cover pages, professional documentation graphics." },
      architecture: { quality: "flash_pro", platform: "architecture_portfolio", contentType: "design_visual", context: "Architectural design visual — building renders, concept presentations, portfolio-quality project imagery." },
      sales: { quality: "flash_pro", platform: "sales_materials", contentType: "proposal_graphic", context: "Professional sales visual — pipeline graphics, proposal covers, client-facing presentation materials." },
      property: { quality: "flash_pro", platform: "property_marketing", contentType: "listing_visual", context: "Property marketing visual — listing graphics, maintenance dashboards, portfolio overviews." },
      spark: { quality: "flash_pro", platform: "app_preview", contentType: "app_mockup", context: "App UI mockup — professional screenshot of a web application with clean modern design." },
      energy: { quality: "flash_pro", platform: "sustainability", contentType: "report_visual", context: "Energy and sustainability visual — carbon reports, solar ROI graphics, environmental dashboards." },
      nonprofit: { quality: "flash_pro", platform: "nonprofit_comms", contentType: "impact_visual", context: "Nonprofit impact visual — community engagement imagery, grant application graphics, impact report visuals." },
    };

    const agentConfig = agentId ? DESIGN_AGENTS[agentId] : undefined;
    const quality = userQuality || agentConfig?.quality || "flash_pro";

    const imageResults = await Promise.allSettled(
      prompts.map(async (prompt) => {
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: {
            prompt,
            platform: agentConfig?.platform || "marketing_material",
            contentType: agentConfig?.contentType || "visual_asset",
            agentContext: agentConfig?.context || "Professional visual asset for Assembl brand marketing.",
            quality,
            brandContext: brandProfile ? { business_name: brandName || "Assembl", tone: "professional", industry: "technology" } : undefined,
          },
        });

        if (error) throw error;
        if (!data?.imageUrl) throw new Error("No image returned");

        return { prompt, url: data.imageUrl };
      })
    );

    const successfulImages = imageResults.flatMap((result) => {
      if (result.status === "fulfilled") return [result.value];
      console.error("Inline image generation error:", result.reason);
      return [];
    });

    const urls = successfulImages.map((item) => item.url);

    setInlineImages((prev) => ({
      ...prev,
      [msgIndex]: { status: urls.length > 0 ? "done" : "error", urls },
    }));

    // Upload images to permanent storage, log to exported_outputs, and persist URLs on the message
    if (urls.length > 0 && user) {
      try {
        const permanentUrls: string[] = [];
        for (let idx = 0; idx < urls.length; idx++) {
          const permanentUrl = await uploadGeneratedImage(urls[idx], user.id, agentId || "echo");
          if (permanentUrl) permanentUrls.push(permanentUrl);
          await supabase.from("exported_outputs").insert({
            user_id: user.id,
            agent_id: agentId || "echo",
            agent_name: agent?.name || "ECHO",
            output_type: "generated_image",
            title: successfulImages[idx]?.prompt?.substring(0, 100) || `Generated Image ${idx + 1}`,
            content_preview: successfulImages[idx]?.prompt?.substring(0, 300) || "AI-generated visual",
            format: "png",
            image_url: permanentUrl,
          });
        }
        // Write permanent URLs back onto the assistant message so they survive reload.
        if (permanentUrls.length > 0) {
          setMessages((prev) => {
            if (!prev[msgIndex] || prev[msgIndex].role !== "assistant") return prev;
            const next = [...prev];
            next[msgIndex] = { ...next[msgIndex], generatedImageUrls: permanentUrls };
            return next;
          });
          setInlineImages((prev) => ({ ...prev, [msgIndex]: { status: "done", urls: permanentUrls } }));
        }
      } catch { /* silent */ }
    }
  }, [agentId, agent, brandProfile, brandName, user]);

  // PRISM direct image generation via camera button
  const handlePrismDirectImageGen = useCallback(async () => {
    if (!prismImagePrompt.trim()) return;
    setPrismImageGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: prismImagePrompt,
          platform: "brand_marketing",
          contentType: "brand_asset",
          agentContext: "Professional brand marketing asset. Create agency-quality visuals with premium aesthetics, sophisticated composition, and commercial-grade polish.",
          quality: "pro",
          brandContext: brandProfile ? { business_name: brandName || "Assembl", tone: "professional", industry: "technology" } : undefined,
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        const msgIndex = messages.length;
        setMessages((prev) => [...prev,
          { role: "user", content: `Generate image: ${prismImagePrompt} (${prismImageAspect})` },
          { role: "assistant", content: "Here's your generated image:" },
        ]);
        setInlineImages((prev) => ({ ...prev, [msgIndex + 1]: { status: "done", urls: [data.imageUrl] } }));
        // Upload to permanent storage, log to exports, and persist URL on the message
        if (user) {
          uploadGeneratedImage(data.imageUrl, user.id, "marketing").then((permanentUrl) => {
            if (permanentUrl) {
              setMessages((prev) => {
                const target = msgIndex + 1;
                if (!prev[target] || prev[target].role !== "assistant") return prev;
                const next = [...prev];
                next[target] = { ...next[target], generatedImageUrls: [permanentUrl] };
                return next;
              });
              setInlineImages((prev) => ({ ...prev, [msgIndex + 1]: { status: "done", urls: [permanentUrl] } }));
            }
            supabase.from("exported_outputs").insert({
              user_id: user.id,
              agent_id: "marketing",
              agent_name: "PRISM",
              output_type: "generated_image",
              title: prismImagePrompt.substring(0, 100),
              content_preview: prismImagePrompt,
              format: "png",
              image_url: permanentUrl,
            }).then(() => {});
          });
        }
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Image generation didn't return a result. Try a simpler prompt." }]);
      }
    } catch (err: any) {
      console.error("Prism image gen error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: `Image generation failed: ${err.message || "Unknown error"}. Try again or use a different prompt.` }]);
    } finally {
      setPrismImageGenerating(false);
      setPrismImageModalOpen(false);
      setPrismImagePrompt("");
    }
  }, [prismImagePrompt, prismImageAspect, brandProfile, brandName, messages, user]);

  const trigger3DGeneration = useCallback(
    async (userPrompt: string, msgIndex: number, imageUrl?: string) => {
      if (genCount >= MAX_GENERATIONS_PER_SESSION) {
        setGenerations((prev) => [...prev, { id: crypto.randomUUID(), messageIndex: msgIndex, status: "FAILED", progress: 0, prompt: "You've reached the generation limit for this session." }]);
        return;
      }
      const genId = crypto.randomUUID();
      const isImage = !!imageUrl;
      setGenCount((c) => c + 1);
      setGenerations((prev) => [...prev, { id: genId, messageIndex: msgIndex, status: "PENDING", progress: 0, prompt: isImage ? "Generating from uploaded image..." : undefined, type: isImage ? "image-to-3d" : "text-to-3d" }]);
      try {
        const body = isImage ? { imageUrl } : { userPrompt };
        const { data, error } = await supabase.functions.invoke("generate-3d", { body });
        if (error) throw error;
        const genType = data.type || (isImage ? "image-to-3d" : "text-to-3d");
        setGenerations((prev) => prev.map((g) => g.id === genId ? { ...g, status: "PENDING", prompt: data.prompt, taskId: data.taskId, type: genType } : g));
        if (data.taskId) pollStatus(genId, data.taskId, genType);
      } catch (err) {
        console.error("3D generation error:", err);
        setGenerations((prev) => prev.map((g) => (g.id === genId ? { ...g, status: "FAILED", progress: 0 } : g)));
      }
    }, [genCount, pollStatus]
  );

  // Extract latest code from SPARK or PRISM responses for live preview
   const sparkCode = useMemo(() => {
    if (!isSpark) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        const content = messages[i].content;
        // Try fenced code block (html, jsx, react, tsx, or untagged)
        const fenced = content.match(/```(?:html|HTML|jsx|tsx|react)?\s*\n([\s\S]*?)```/);
        if (fenced) return fenced[1];
        // Try raw HTML with closing tag
        const raw = content.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
        if (raw) return raw[1];
        // Try raw HTML without closing tag (truncated responses)
        const rawOpen = content.match(/(<!DOCTYPE[\s\S]{200,})/i);
        if (rawOpen) return rawOpen[1];
        // Try <html> tag
        const htmlTag = content.match(/(<html[\s\S]{200,})/i);
        if (htmlTag) return htmlTag[1];
      }
    }
    return null;
  }, [messages, isSpark]);

  const hasLivePreview = isSpark && !!sparkCode;
  const previewAccentColor = isSpark ? "#5AADA0" : "#E040FB";
  const [sparkMobileView, setSparkMobileView] = useState<"chat" | "preview">("chat");

  // Collect agent-specific tabs (must be before early return)
   const agentTabs = useMemo(() => {
    if (!agent) return [];
    const tabs: { id: string; label: string; icon?: React.ReactNode }[] = [];

    // Consolidate all agent-specific tool tabs under a "Tools" mega-tab
    const toolTabs: { id: string; label: string }[] = [];
    if (hasTemplateTab) toolTabs.push({ id: "templates", label: "Templates" });
    if (isMarketing) toolTabs.push({ id: "content_studio", label: "Content Studio" });
    if (isConstruction) {
      ["tender_writer:Tenders", "awards:Awards", "hs_hub:H&S", "esg:ESG", "iot_field:IoT"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isHanga) {
      ["bim_analyze:BIM Analysis", "bim_clash:Clash Detection", "bim_schedule:4D Schedule", "bim_3d:3D Model"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isForge) {
      ["forge_showroom:Showroom", "forge_sales:Sales", "forge_parts:Parts", "forge_marketing:Marketing", "forge_events:Events", "forge_team:Team", "forge_brand:Brand Hub", "forge_audit:Audit"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isAroha) {
      ["aroha_contracts:Contracts", "aroha_onboarding:Onboarding", "aroha_payroll:Payroll", "aroha_recruitment:Recruitment", "aroha_retention:Retention", "aroha_people:People", "aroha_company:Setup"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isAura) {
      ["aura_food_safety:Food Safety", "aura_kitchen:Menu Builder", "aura_team:Staff Rostering", "aura_guest:Guest Experience", "aura_operations:Compliance"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isHaven) {
      ["haven_dashboard:Dashboard", "haven_properties:Properties", "haven_jobs:Jobs", "haven_tradies:Tradies", "haven_command:Command", "haven_compliance:Compliance", "haven_costs:Costs", "haven_documents:Docs", "haven_notifications:Alerts"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isFlux) {
      ["flux_pipeline:Pipeline", "flux_followups:Follow-Ups", "flux_clients:Clients"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isPrism) {
      ["prism_creative:Studio", "prism_brand:Brand", "prism_video:Video", "prism_adengine:Ad Engine", "prism_podcast:Podcast"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isNonprofit) {
      ["kindle_writer:Campaign Writer", "kindle_marketplace:Marketplace", "kindle_impact:Impact", "kindle_corporate:Corporate"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isAxis) toolTabs.push({ id: "axis_automations", label: "Automations" });
    if (isOra) {
      ["ora_checkin:Check-in", "ora_dashboard:Dashboard"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isTahi) toolTabs.push({ id: "tahi_triage", label: "Triage" });
    if (isVitae) toolTabs.push({ id: "vitae_journeys", label: "Journeys" });
    if (isAroha) toolTabs.push({ id: "aroha_caregiver", label: "Caregiver" });
    if (isHaven) toolTabs.push({ id: "haven_safety", label: "Home Safety" });
    if (isToroa) {
      ["helm_week:This Week", "helm_bus:Bus", "helm_timetable:Timetable", "helm_inbox:Inbox", "helm_review:Review", "helm_rescue:Rescue", "helm_settings:Settings"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (isSports) {
      ["turf_events:Events", "turf_membership:Membership", "turf_facilities:Facilities", "turf_sponsorship:Sponsorship", "turf_performance:Performance", "turf_compliance:Compliance"].forEach(s => { const [id, label] = s.split(":"); toolTabs.push({ id, label }); });
    }
    if (agentId === "odyssey") {
      toolTabs.push({ id: "odyssey_planner", label: "Trip Planner" });
    }
    if (hasLiveDataTab) toolTabs.push({ id: "live_data", label: "Live Data" });
    // Te Reo Video Learner for TORO, ECHO, and Te Kāhui Reo agents
    const teReoAgents = ["family", "echo", "tiriti"];
    if (teReoAgents.includes(agentId || "")) toolTabs.push({ id: "te_reo_learn", label: "Mārama" });
    if (!isToroa && !isSports && agentId !== "maritime") toolTabs.push({ id: "internal_comms", label: "Comms" });

    // Top-level tabs: Chat is always shown separately; these are the other 4
    if (toolTabs.length > 0) tabs.push(...toolTabs.map(t => ({ id: t.id, label: t.label })));

    // Voice tab
    tabs.push({ id: "voice_waitlist", label: "Voice", icon: <Mic size={13} /> });
    // SMS tab
    tabs.push({ id: "agent_sms", label: "SMS", icon: <MessageSquare size={13} /> });
    // Settings/Train tab
    tabs.push({ id: "agent_training", label: "Settings", icon: <Layers size={13} /> });
    return tabs;
  }, [agent, agentId, hasTemplateTab, isMarketing, isConstruction, isHanga, isForge, isAroha, isAura, isHaven, isFlux, isPrism, isNonprofit, isAxis, isToroa, isSports, isOra, isTahi, isVitae, hasLiveDataTab, auraModeKey]);

  const accentColor = isToroa ? TOROA_COLOR : (agent?.color || "#3A6A9C");

  const handleUniversalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUseFeature("upload")) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const isImageFile = file.type.startsWith("image/");
    const maxSize = isImageFile ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large. Maximum ${isImageFile ? "5MB" : "10MB"} for ${isImageFile ? "images" : "documents"}.`);
      return;
    }
    if (isImageFile) {
      if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
      setPendingImage(file);
      setPendingImagePreview(URL.createObjectURL(file));
    } else {
      setPendingFile(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUseFeature("upload")) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
    setPendingImage(file);
    setPendingImagePreview(URL.createObjectURL(file));
  };

  const handleNexusJobSheetUpload = () => {
    nexusFileInputRef.current?.click();
  };

  const handleNexusFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Activate workflow
    setNexusWorkflowActive(true);
    // Treat as a document upload with a job sheet processing instruction
    const isImageFile = file.type.startsWith("image/");
    if (isImageFile) {
      if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
      setPendingImage(file);
      setPendingImagePreview(URL.createObjectURL(file));
    } else {
      setPendingFile(file);
    }
    const docType = nexusWorkflowStep === 0 ? "job sheet" : "supporting document";
    sendMessage(`Process this ${docType} and extract all shipping, freight, and goods details. Flag any MPI/biosecurity requirements.`, isImageFile ? file : null, !isImageFile ? file : null);
    if (nexusFileInputRef.current) nexusFileInputRef.current.value = "";
  };

  const clearPendingImage = () => {
    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
    setPendingImage(null);
    setPendingImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (universalFileInputRef.current) universalFileInputRef.current.value = "";
  };

  const clearPendingFile = () => {
    setPendingFile(null);
    if (universalFileInputRef.current) universalFileInputRef.current.value = "";
  };

  const buildVoiceHandoffPrompt = useCallback((voiceTranscript: VoiceTranscriptTurn[]) => {
    const condensedTranscript = voiceTranscript
      .slice(-12)
      .map((entry) => `${entry.role === "user" ? "User" : safeAgentName}: ${entry.text}`)
      .join("\n");

    return [
      "Continue from this voice conversation. Save all concrete details the user shared.",
      "Treat any instructions, requests, or information they provided as actionable items to capture and confirm back clearly.",
      "",
      "Voice transcript:",
      condensedTranscript,
    ].join("\n");
  }, [safeAgentName]);

  const sendMessage = async (content: string, imageFile?: File | null, docFile?: File | null) => {
    if ((!content.trim() && !imageFile && !docFile) || isLoading) return;

    // Check message limits
    const allowed = await incrementMessageCount();
    if (!allowed) {
      setPaywallType(user ? "daily_limit" : "preview");
      return;
    }

    let uploadedImageUrl: string | undefined;
    let apiMessages: any[] = [];

    if (imageFile && (isArc || isPrism)) {
      setIsUploading(true);
      try { uploadedImageUrl = await uploadImage(imageFile); }
      catch (err) { console.error("Image upload error:", err); setIsUploading(false); return; }
      setIsUploading(false);
    }

    const displayContent = content.trim() || (uploadedImageUrl ? "Generate a 3D model from this image" : docFile ? `[file] ${docFile.name}` : imageFile ? "Uploaded image" : "");
    const userMessage: Message = {
      role: "user",
      content: displayContent,
      imageUrl: uploadedImageUrl || (imageFile && !isArc && !isPrism ? URL.createObjectURL(imageFile) : undefined),
      fileName: docFile?.name,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    clearPendingImage();
    clearPendingFile();
    setIsLoading(true);

    const msgIndex = newMessages.length;
    const should3D = (isArc || isPrism) && (!!uploadedImageUrl || shouldTrigger3D(userMessage.content));

    try {
      if (imageFile && !isArc && !isPrism) {
        const { base64, mediaType } = await imageToBase64(imageFile);
        const textContent = content.trim() || "Please analyse this image and provide relevant advice.";
        const historyMsgs = messages.map((m) => ({ role: m.role, content: m.content || "(attachment)" }));
        apiMessages = [
          ...historyMsgs,
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: textContent },
            ],
          },
        ];
      } else if (docFile) {
        if (docFile.type.startsWith("image/")) {
          const { base64, mediaType } = await imageToBase64(docFile);
          const textContent = content.trim() || "Please analyse this document and provide relevant advice.";
          const historyMsgs = messages.map((m) => ({ role: m.role, content: m.content || "(attachment)" }));
          apiMessages = [
            ...historyMsgs,
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
                { type: "text", text: textContent },
              ],
            },
          ];
        } else if (BINARY_FILE_TYPES.includes(docFile.type)) {
          // PDFs, DOCX, XLSX — send as base64 document for AI to read
          const base64 = await fileToBase64(docFile);
          const textContent = content.trim() || `Please analyse this document (${docFile.name}) and provide relevant advice.`;
          const historyMsgs = messages.map((m) => ({ role: m.role, content: m.content || "(attachment)" }));
          apiMessages = [
            ...historyMsgs,
            {
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: docFile.type, data: base64 } },
                { type: "text", text: textContent },
              ],
            },
          ];
        } else {
          const fileText = await readFileAsText(docFile);
          const textContent = content.trim() || "Please analyse this document and provide relevant advice.";
          const fullText = `${textContent}\n\n---\n\nDocument content (${docFile.name}):\n\n${fileText}`;
          apiMessages = [
            ...messages.map((m) => ({ role: m.role, content: m.content || "(attachment)" })),
            { role: "user", content: fullText },
          ];
        }
      } else {
        apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content || "(attachment)" }));
      }

      // Use agent-router with streaming for all agents (except HAVEN which has its own function)
      const functionName = isHaven ? "haven-ai" : "agent-router";

      if (isHaven && !session?.access_token) {
        setMessages((prev) => [...prev, { role: "assistant", content: " Please sign in to use HAVEN's property management features. Your data is securely linked to your account." }]);
        setIsLoading(false);
        return;
      }

      // Detect @mentions to include cross-agent context
      const mentionRegex = /@([A-Z]{2,15})\b/g;
      const mentionedAgents: string[] = [];
      let mentionMatch;
      while ((mentionMatch = mentionRegex.exec(content)) !== null) {
        const mentionedAgent = [...agents, echoAgent, pilotAgent].find(a => a.name.toUpperCase() === mentionMatch![1]);
        if (mentionedAgent) mentionedAgents.push(mentionedAgent.id);
      }

      if (isHaven) {
        // HAVEN uses non-streaming invoke
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: { messages: apiMessages },
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        });
        if (error) throw error;
        if (!data || data.error) throw new Error(data?.error || "No response from AI agent");
        const assistantContent = data.content;
        if (!assistantContent) throw new Error("Empty response from AI agent — please try again");
        setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
      } else {
        // All other agents use streaming agent-router
        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-router`;
        const routerBody = {
          message: content,
          agentId: agent.id,
          messages: apiMessages.slice(0, -1).map((m: any) => ({ role: m.role, content: typeof m.content === "string" ? m.content : "(attachment)" })),
          packId: agent.pack || undefined,
          ...(conversationId ? { conversationId } : {}),
          ...(user?.id ? { userId: user.id } : {}),
        };

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(routerBody),
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errData.error || `AI error: ${resp.status}`);
        }

        // Read agent metadata from response headers
        const respondingAgent = decodeURIComponent(resp.headers.get("X-Agent-Name") || agent.name);
        const respondingIcon = resp.headers.get("X-Agent-Icon") || "Layers";

        // Stream SSE response token by token
        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantSoFar = "";
        let streamDone = false;

        // Add initial empty assistant message
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") { streamDone = true; break; }

            try {
              const parsed = JSON.parse(jsonStr);
              const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (deltaContent) {
                assistantSoFar += deltaContent;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantSoFar };
                  return updated;
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Final flush
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (deltaContent) {
                assistantSoFar += deltaContent;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantSoFar };
                  return updated;
                });
              }
            } catch { /* ignore partial leftovers */ }
          }
        }
      }

      const assistantContent = (() => {
        // Get the last assistant message content for post-processing
        let content = "";
        setMessages((prev) => { content = prev[prev.length - 1]?.content || ""; return prev; });
        return content;
      })();

      // Auto-save ALL agent outputs to exported_outputs for dashboard
      if (user && assistantContent && assistantContent.length > 100) {
        const titleMatch = content.match(/^(?:Create|Write|Generate|Design|Build|Draft|Prepare|Analyse|Review)\s+(?:a\s+)?(.{10,60})/i);
        const autoTitle = titleMatch?.[1]?.trim() || `${agent.name} output — ${new Date().toLocaleDateString("en-NZ")}`;
        const outputType = detectOutputType(assistantContent) || "chat_output";
        supabase.from("exported_outputs").insert({
          user_id: user.id,
          agent_id: agent.id,
          agent_name: agent.name,
          title: autoTitle,
          output_type: outputType,
          format: "markdown",
          content_preview: assistantContent.substring(0, 300),
        }).then(() => {});
      }

      // Write business context to shared_context when key facts detected
      if (user && assistantContent) {
        const userText = content.toLowerCase();
        const contextWrites: { key: string; value: any }[] = [];
        
        // Detect business identity facts from user messages
        const bizNameMatch = content.match(/(?:my (?:business|company|shop|store|firm|practice) (?:is|called|named))\s+["']?([^"'\n,.]+)/i);
        if (bizNameMatch) contextWrites.push({ key: "business_name", value: bizNameMatch[1].trim() });
        
        const industryMatch = content.match(/(?:we're|we are|i'm|i am|we run|i run)\s+(?:a|an|in)\s+(construction|hospitality|retail|automotive|legal|property|sports|agriculture|tourism|tech|marketing|nonprofit|logistics|finance|healthcare|education)\b/i);
        if (industryMatch) contextWrites.push({ key: "industry", value: industryMatch[1].toLowerCase() });
        
        const teamMatch = content.match(/(\d+)\s+(?:staff|employees|people|team members)/i);
        if (teamMatch) contextWrites.push({ key: "team_size", value: parseInt(teamMatch[1]) });
        
        const locationMatch = content.match(/(?:based in|located in|we're in|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
        if (locationMatch) contextWrites.push({ key: "location", value: locationMatch[1] });

        // Write detected facts to shared_context
        for (const ctx of contextWrites) {
          supabase.from("shared_context").upsert({
            user_id: user.id,
            context_key: ctx.key,
            context_value: ctx.value,
            source_agent: agentId || "echo",
            confidence: 0.8,
          }, { onConflict: "user_id,context_key" }).then(() => {});
        }

        // Write agent-specific memory for the current agent
        const agentMemoryWrites: { key: string; value: any }[] = [];

        const nameMatch = content.match(/(?:my name is|i'm called|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        if (nameMatch) agentMemoryWrites.push({ key: "user_name", value: nameMatch[1].trim() });

        const roleMatch = content.match(/(?:i'm|i am)\s+(?:a|an|the)\s+(owner|manager|director|ceo|founder|developer|consultant|designer|operator|farmer|builder)/i);
        if (roleMatch) agentMemoryWrites.push({ key: "user_role", value: roleMatch[1].toLowerCase() });

        // Also carry over shared context into agent memory
        for (const ctx of contextWrites) {
          agentMemoryWrites.push({ key: ctx.key, value: ctx.value });
        }

        for (const mem of agentMemoryWrites) {
          supabase.from("agent_memory").upsert({
            user_id: user.id,
            agent_id: agentId || agent.id,
            memory_key: mem.key,
            memory_value: mem.value,
          }, { onConflict: "user_id,agent_id,memory_key" }).then(() => {});
        }

        // Write conversation summary every 10 messages for cross-agent awareness
        if (newMessages.length > 0 && newMessages.length % 10 === 0) {
          const recentUserMsgs = newMessages.filter(m => m.role === "user").slice(-3).map(m => m.content).join("; ");
          supabase.from("conversation_summaries").insert({
            user_id: user.id,
            agent_id: agentId || agent.id,
            summary: recentUserMsgs.substring(0, 500),
            key_facts_extracted: contextWrites.map(c => ({ key: c.key, value: c.value })),
          }).then(() => {});
        }
      }

      // Process NEXUS workflow data from response
      if (isNexus && nexusWorkflowActive) {
        processNexusResponse(assistantContent);
      }

      // Trigger inline image generation for ECHO and other agents
      if (/\[GENERATE_IMAGE:/i.test(assistantContent)) {
        const currentMsgIndex = newMessages.length;
        const qualityMatch = input.match(/\[QUALITY:(fast|pro)\]/i);
        const userQuality = qualityMatch ? qualityMatch[1].toLowerCase() : undefined;
        triggerInlineImages(assistantContent, currentMsgIndex, userQuality);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      // Surface specific error messages from edge function
      let errorMsg = "Sorry, I'm having trouble connecting right now. Please try again.";
      
      // Try to extract error from various error shapes
      const errMsg = err?.message || "";
      const errStatus = err?.status || err?.code;
      
      // Check context body first (supabase SDK wraps edge function responses)
      if (err?.context?.body) {
        try {
          const body = typeof err.context.body === "string" ? JSON.parse(err.context.body) : err.context.body;
          if (body?.error) errorMsg = body.error;
        } catch {}
      }
      
      // Override with specific known errors
      if (errMsg.includes("Rate limit") || errMsg.includes("429") || errStatus === 429) {
        errorMsg = "I'm receiving too many requests right now. Please wait a moment and try again.";
      } else if (errMsg.includes("402") || errMsg.includes("credits") || errStatus === 402) {
        errorMsg = "AI credits have been exhausted. Please contact your administrator.";
      } else if (errMsg.includes("Unknown agent") || errMsg.includes("400")) {
        errorMsg = `Agent "${agent?.name || agentId}" is not available right now. Please try another agent.`;
      } else if (errMsg.includes("Failed to send") || errMsg.includes("NetworkError") || errMsg.includes("fetch")) {
        errorMsg = "Network error — please check your connection and try again.";
      }
      
      setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }

    if (should3D) trigger3DGeneration(userMessage.content, msgIndex, uploadedImageUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input, pendingImage, pendingFile);
  };

  const handleRefine = (refinement: string) => sendMessage(`Refine the 3D model: ${refinement}`);
  const handleAddReminder = (text: string) => setDashboardItems((prev) => [...prev, { type: "reminder", text }]);

  useEffect(() => {
    const handoffKey = searchParams.get("voiceHandoff");
    if (!handoffKey || !historyReady || !agentId) return;
    if (processedVoiceHandoffRef.current === handoffKey) return;

    processedVoiceHandoffRef.current = handoffKey;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("voiceHandoff");
    setSearchParams(nextParams, { replace: true });

    const rawHandoff = sessionStorage.getItem(handoffKey);
    if (!rawHandoff) return;

    sessionStorage.removeItem(handoffKey);

    try {
      const parsed = JSON.parse(rawHandoff) as { agentId?: string; transcript?: VoiceTranscriptTurn[] };
      if (parsed.agentId && parsed.agentId !== agentId) return;
      if (!parsed.transcript?.length) return;

      void sendMessage(buildVoiceHandoffPrompt(parsed.transcript));
    } catch (error) {
      console.error("Failed to restore voice handoff:", error);
    }
  }, [agentId, buildVoiceHandoffPrompt, historyReady, searchParams, sendMessage, setSearchParams]);

  if (!agent) {
    const lastAgent = getLastAgentContext();
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-medium text-foreground mb-2">
            Agent not found
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            We couldn't find an agent matching{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs">
              {rawAgentId ?? "this URL"}
            </code>
            .
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            It may have been renamed or retired.
          </p>

          {lastAgent && lastAgent.rawSlug !== rawAgentId && (
            <Link
              to={`/chat/${lastAgent.rawSlug}`}
              className="mb-3 inline-flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.01]"
              style={{
                background: `${lastAgent.color}15`,
                border: `1px solid ${lastAgent.color}40`,
                color: lastAgent.color,
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: lastAgent.color }}
              />
              Resume with {lastAgent.name}
            </Link>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/agents"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to agent grid
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const showWelcome = messages.length === 0;
  const getGenerationsForIndex = (idx: number) => generations.filter((g) => g.messageIndex === idx);



  // Message counter display for free users
  const showMsgCounter = user && !isPaid;
  const remaining = dailyLimit - dailyMessageCount;

  // Render @AGENT_NAME mentions as colored pills
  const renderWithMentions = (text: string) => {
    const ALL_AGENTS_LIST = [echoAgent, pilotAgent, ...agents];
    const mentionRegex = /@([A-Z]{2,15})\b/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      const mentionName = match[1];
      const mentionedAgent = ALL_AGENTS_LIST.find(a => a.name.toUpperCase() === mentionName);
      if (mentionedAgent) {
        parts.push(
          <Link key={match.index} to={`/chat/${mentionedAgent.id}`}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold no-underline hover:opacity-80 transition-opacity mx-0.5"
            style={{ backgroundColor: mentionedAgent.color + "20", color: mentionedAgent.color, border: `1px solid ${mentionedAgent.color}30` }}>
            @{mentionedAgent.name}
          </Link>
        );
      } else {
        parts.push(match[0]);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length > 0 ? <>{parts}</> : text;
  };

  const mdComponents = useMemo(() => ({
    a: ({ href, children, ...props }: any) => {
      if (href && href.startsWith("/")) {
        return (
          <Link
            to={href}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold no-underline transition-all duration-200 hover:scale-105"
            style={{
              background: `${agent.color}20`,
              color: agent.color,
              border: `1px solid ${agent.color}30`,
            }}
          >
            {children} →
          </Link>
        );
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
    },
  }), [agent.color]);

  const renderMessageContent = (msg: Message, msgIndex?: number) => {
    // Strip [GENERATE_IMAGE: ...] tags from displayed content
    const content = msg.content.replace(/\[GENERATE_IMAGE:\s*.*?\]/g, "").trim();
    if (msg.role === "assistant") {
      if (agentId === "customs") {
        const entryData = parseNexusEntry(content);
        if (entryData) {
          return <NexusEntryCard data={entryData} color={agent.color} />;
        }
      }

      const outputType = detectOutputType(content);
      if (outputType) {
        return (
          <StructuredOutputCard
            title={outputType}
            content={content}
            agentName={agent.name}
            agentColor={agent.color}
            hasChecklist={hasChecklist(content)}
          />
        );
      }
    }

    if (hasChecklist(content)) {
      const lines = content.split("\n");
      const parts: { type: "text" | "checklist"; content: string }[] = [];
      let currentText = "";
      let checklistLines: string[] = [];

      const flushText = () => { if (currentText.trim()) { parts.push({ type: "text", content: currentText }); currentText = ""; } };
      const flushChecklist = () => { if (checklistLines.length) { parts.push({ type: "checklist", content: checklistLines.join("\n") }); checklistLines = []; } };

      for (const line of lines) {
        if (/^[-*]\s*\[([ xX])\]/.test(line.trim())) { flushText(); checklistLines.push(line); }
        else { flushChecklist(); currentText += line + "\n"; }
      }
      flushText();
      flushChecklist();

      return (
        <>
          {parts.map((p, i) =>
            p.type === "checklist" ? (
              <HelmChecklist key={i} content={p.content} />
            ) : (
              <div key={i} className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-code:text-accent [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140] [&_h1]:text-[#3D4250] [&_h2]:text-[#3D4250] [&_h3]:text-[#3D4250]">
                <ReactMarkdown components={mdComponents}>{p.content}</ReactMarkdown>
              </div>
            )
          )}
        </>
      );
    }

    // Check for @mentions in user messages — render as pills
    if (msg.role === "user" && /@[A-Z]{2,15}\b/.test(content)) {
      return <div className="text-sm leading-relaxed">{renderWithMentions(content)}</div>;
    }

    return (
      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-code:text-accent [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140] [&_h1]:text-[#3D4250] [&_h2]:text-[#3D4250] [&_h3]:text-[#3D4250]">
        <ReactMarkdown components={mdComponents}>{content}</ReactMarkdown>
      </div>
    );
  };

  // Locked feature button helper
  const LockedButton = ({ children, feature, onClick, className, style, title }: {
    children: React.ReactNode;
    feature: "upload" | "templates" | "brand_scan" | "pdf_download";
    onClick: () => void;
    className?: string;
    style?: React.CSSProperties;
    title?: string;
  }) => {
    const locked = !canUseFeature(feature);
    if (locked) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button className={`${className} opacity-50 cursor-not-allowed`} style={style} disabled>
              <NeonLock size={12} />
              {children}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Upgrade to Pro to unlock
          </TooltipContent>
        </Tooltip>
      );
    }
    return (
      <button onClick={onClick} className={className} style={style} title={title}>
        {children}
      </button>
    );
  };



  return (
    <div className="h-screen flex flex-col bg-background relative">
      {/* Premium Header */}
      <header className="shrink-0 relative" style={{ background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}>
        {/* Top glow line */}
        <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor}40 50%, transparent 100%)` }} />

        <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <img loading="lazy" decoding="async" src={assemblMark} alt="Assembl" className="w-7 h-7 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="font-display font-light tracking-[2px] lowercase text-[13px] text-foreground/70 group-hover:text-foreground transition-colors hidden sm:inline">assembl</span>
          </Link>
          <div className="w-px h-5 bg-border/30 hidden sm:block" />

          {/* Agent identity */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <AgentAvatar agentId={agent.id} color={agent.color} size={36} showGlow={false} />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background animate-pulse" style={{ backgroundColor: "#5AADA0" }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base sm:text-lg text-foreground truncate">{agent.name}</h1>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground shrink-0">{agent.designation}</span>
              </div>
              <p className="text-xs font-body truncate" style={{ color: accentColor }}>{agent.role}</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Templates button (legacy modal) */}
            {hasTemplates && !hasTemplateTab && (
              <LockedButton feature="templates" onClick={() => setTemplateModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: accentColor, border: `1px solid ${accentColor}25` }}>
                <LayoutGrid size={12} />
              </LockedButton>
            )}

            {/* Workspace link — opens this agent's full workspace */}
            {rawAgentId && (
              <Link
                to={`/app/${rawAgentId}/workspace`}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80 shrink-0"
                style={{ color: accentColor, border: `1px solid ${accentColor}25` }}
                title={`Open ${agent.name}'s workspace`}
              >
                <LayoutDashboard size={12} />
                <span className="hidden md:inline">Workspace</span>
              </Link>
            )}

            <LanguageSelector agentColor={agent.color} />

            {/* New Chat button */}
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  setConversationId(null);
                  setGenerations([]);
                  setGenCount(0);
                  setInput("");
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-body font-medium transition-colors hover:opacity-80 shrink-0"
                style={{ color: accentColor, border: `1px solid ${accentColor}20` }}
                title="Start new conversation (current is auto-saved)"
              >
                <RotateCcw size={10} />
                <span className="hidden sm:inline">New</span>
              </button>
            )}

            <ChatSearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              matchCount={displayedMessages.length}
              totalCount={messages.length}
              accentColor={agent.color}
            />
            <ConversationExport messages={messages} agentName={agent.name} agentDesignation={agent.designation} agentColor={agent.color} agentId={agent.id} />
            <ChatEvidencePackButton messages={messages} agentName={agent.name} agentDesignation={agent.designation} agentColor={agent.color} />

            {/* Brand badge — hidden on mobile */}
            {brandProfile ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: accentColor + "12", color: accentColor, border: `1px solid ${accentColor}20` }}>
                <Globe size={11} />
                <span className="max-w-[60px] truncate">{brandName}</span>
                <button onClick={() => { setBrandProfile(null); setBrandName(null); sessionStorage.removeItem("assembl_brand_profile"); sessionStorage.removeItem("assembl_brand_name"); }} className="hover:opacity-70 ml-0.5"><X size={10} /></button>
              </div>
            ) : (
              <LockedButton feature="brand_scan" onClick={() => setBrandModalOpen(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: accentColor, border: `1px solid ${accentColor}25` }}>
                <Globe size={12} />
              </LockedButton>
            )}

            {/* Logo badge — hidden on mobile */}
            {brandLogoUrl ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: accentColor + "12", color: accentColor, border: `1px solid ${accentColor}20` }}>
                <img loading="lazy" decoding="async" src={brandLogoUrl} alt="Logo" className="w-4 h-4 rounded-sm object-contain" />
                <button onClick={() => { setBrandLogoUrl(null); sessionStorage.removeItem("assembl_brand_logo"); }} className="hover:opacity-70"><X size={10} /></button>
              </div>
            ) : (
              <LockedButton feature="brand_scan" onClick={() => logoInputRef.current?.click()}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: accentColor, border: `1px solid ${accentColor}25` }}>
                {isUploadingLogo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              </LockedButton>
            )}

            {showMsgCounter && (
              <span className="text-[10px] font-mono px-2 py-1 rounded-full border border-border text-muted-foreground">{remaining}/{dailyLimit}</span>
            )}

            <span className="hidden sm:block"><AgentMemoryPanel agentId={agentId!} agentColor={agent.color} agentName={agent.name} /></span>
            <span className="hidden sm:block"><ActionQueuePanel agentColor={agent.color} /></span>
            <AccountDropdown />
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-2 sm:px-3 pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5">
            {/* Chat tab (always first) */}
            <button
              onClick={() => { setActiveTab("chat"); if (isToroa) setToroaView("chat"); }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0"
              style={{
                backgroundColor: activeTab === "chat" && (!isToroa || toroaView === "chat") ? accentColor + "20" : "hsl(var(--muted) / 0.3)",
                color: activeTab === "chat" && (!isToroa || toroaView === "chat") ? accentColor : "hsl(var(--muted-foreground))",
                border: activeTab === "chat" && (!isToroa || toroaView === "chat") ? `1px solid ${accentColor}35` : "1px solid transparent",
                boxShadow: activeTab === "chat" && (!isToroa || toroaView === "chat") ? `0 0 12px ${accentColor}15` : "none",
              }}
            >
              <MessageSquare size={14} />
              Chat
            </button>

            {/* Aura property mode selector removed — AURA is a general NZ hospitality agent */}

            {/* Agent-specific tabs */}
            {agentTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0"
                style={{
                  backgroundColor: activeTab === t.id ? accentColor + "20" : "hsl(var(--muted) / 0.3)",
                  color: activeTab === t.id ? accentColor : "hsl(var(--muted-foreground))",
                  border: activeTab === t.id ? `1px solid ${accentColor}35` : "1px solid transparent",
                  boxShadow: activeTab === t.id ? `0 0 12px ${accentColor}15` : "none",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom border glow */}
        <div className="h-[1px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor}20 30%, ${accentColor}20 70%, transparent 100%)` }} />
      </header>

      {/* First-time onboarding tooltip */}
      {showOnboardingTooltip && agent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-4" onClick={dismissOnboarding}>
          <div className="w-full max-w-sm rounded-2xl p-5 space-y-4 animate-scale-in" style={{ background: "transparent", border: `1px solid ${accentColor}30`, boxShadow: `0 0 40px ${accentColor}15` }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= onboardingStep ? accentColor : "rgba(255,255,255,0.06)" }} />
              ))}
            </div>
            {onboardingStep === 0 && (
              <div className="text-center space-y-2">
                <AgentAvatar agentId={agent.id} color={agent.color} size={48} />
                <h3 className="text-sm font-bold text-foreground">Welcome to {agent.name}</h3>
                <p className="text-xs text-muted-foreground">{agent.tagline}</p>
              </div>
            )}
            {onboardingStep === 1 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground text-center">What I can do for you</h3>
                <div className="space-y-1.5">
                  {(agentCapabilities[agentId || ""] || []).slice(0, 3).map((cap) => (
                    <div key={cap.title} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: `${accentColor}08` }}>
                      <cap.icon size={13} style={{ color: accentColor }} />
                      <span className="text-[11px] text-foreground/80">{cap.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="space-y-2 text-center">
                <h3 className="text-sm font-bold text-foreground">Try asking me...</h3>
                <p className="text-xs text-muted-foreground italic px-4">"{agent.starters[0]}"</p>
              </div>
            )}
            <button onClick={dismissOnboarding}
              className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}25` }}>
              {onboardingStep < 2 ? "Next" : "Get Started"}
            </button>
          </div>
        </div>
      )}

      {/* Hidden logo file input */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={handleLogoUpload}
        className="hidden"
      />

      {/* Modals */}
      <BrandScanModal agentName={agent.name} agentColor={agent.color} open={brandModalOpen} onClose={() => setBrandModalOpen(false)}
        onBrandLoaded={(profile, name, dna) => {
          setBrandProfile(profile);
          setBrandName(name);
          sessionStorage.setItem("assembl_brand_profile", profile);
          sessionStorage.setItem("assembl_brand_name", name);
          if (dna) sessionStorage.setItem("assembl_brand_dna", JSON.stringify(dna));
        }} />
      <TemplateLibrary agentId={agent.id} agentName={agent.name} agentColor={agent.color} open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)} onSelect={(prompt) => sendMessage(prompt)} />
      <PaywallModal
        type={paywallType || "preview"}
        agentName={agent.name}
        open={paywallType !== null}
        onClose={() => setPaywallType(null)}
      />

      {/* Hidden NEXUS file input */}
      {isNexus && (
        <input
          ref={nexusFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.pdf,.csv,.xlsx,.xls,.txt,.text,.md,.doc,.docx"
          onChange={handleNexusFileSelect}
          className="hidden"
        />
      )}

      {/* Tab Views */}
      {/* TORO Tab Views */}
      {activeTab === "helm_week" && isToroa ? (
        <HelmThisWeek onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "helm_bus" && isToroa ? (
        <HelmBusTracker />
      ) : activeTab === "helm_timetable" && isToroa ? (
        <HelmTimetable onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "helm_inbox" && isToroa ? (
        <HelmInbox onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "helm_review" && isToroa ? (
        <HelmReview />
      ) : activeTab === "helm_rescue" && isToroa ? (
        <HelmRescue />
      ) : activeTab === "helm_settings" && isToroa ? (
        <HelmSettings />
      ) : activeTab === "haven_dashboard" && isHaven ? (
        <HavenDashboard />
      ) : activeTab === "haven_properties" && isHaven ? (
        <HavenProperties onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "haven_jobs" && isHaven ? (
        <HavenJobs onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "haven_tradies" && isHaven ? (
        <HavenTradies onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "haven_command" && isHaven ? (
        <HavenCommandCentre />
      ) : activeTab === "haven_compliance" && isHaven ? (
        <HavenCompliance />
      ) : activeTab === "haven_costs" && isHaven ? (
        <HavenCostIntelligence />
      ) : activeTab === "haven_documents" && isHaven ? (
        <HavenDocuments onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "haven_notifications" && isHaven ? (
        <HavenNotifications />
      ) : activeTab === "flux_pipeline" && isFlux ? (
        <FluxLeadPipeline onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "flux_followups" && isFlux ? (
        <FluxFollowUps />
      ) : activeTab === "flux_clients" && isFlux ? (
        <FluxClients />
      ) : activeTab === "prism_creative" && isPrism ? (
        <ContentStudio onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_brand" && isPrism ? (
        <PrismBrandVoice onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_video" && isPrism ? (
        <PrismVideoStudio onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_adengine" && isPrism ? (
        <PrismAdEngine onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_podcast" && isPrism ? (
        <PrismPodcastStudio onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "ora_checkin" && isOra ? (
        <OraCheckIn onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "tahi_triage" && isTahi ? (
        <TahiTriage onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "vitae_journeys" && isVitae ? (
        <VitaeCareJourneys onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "aroha_caregiver" && isAroha ? (
        <ArohaCaregiverWellbeing onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "haven_safety" && isHaven ? (
        <HavenHomeSafety onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "axis_automations" && isAxis ? (
        <AxisAutomations />
      ) : activeTab === "kindle_writer" && isNonprofit ? (
        <KindleCampaignWriter onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "kindle_marketplace" && isNonprofit ? (
        <KindleMarketplace onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "kindle_impact" && isNonprofit ? (
        <KindleImpactDashboard />
      ) : activeTab === "kindle_corporate" && isNonprofit ? (
        <KindleCorporateDashboard onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "agent_sms" ? (
        <AgentSmsPanel agentId={agent.id} agentName={agent.name} agentColor={agent.color} />
      ) : activeTab === "voice_waitlist" ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Voice provider toggle */}
          <div className="flex items-center justify-center gap-2 px-4 pt-3 pb-1">
            <button
              onClick={() => setVoiceProvider("elevenlabs")}
              className="px-3 py-1 rounded-full text-[10px] font-medium transition-all"
              style={{
                background: voiceProvider === "elevenlabs" ? agent.color + "20" : "rgba(255,255,255,0.03)",
                border: `1px solid ${voiceProvider === "elevenlabs" ? agent.color + "40" : "rgba(255,255,255,0.06)"}`,
                color: voiceProvider === "elevenlabs" ? agent.color : "rgba(255,255,255,0.5)",
              }}
            >
              ElevenLabs TTS
            </button>
            <button
              onClick={() => setVoiceProvider("gemini")}
              className="px-3 py-1 rounded-full text-[10px] font-medium transition-all"
              style={{
                background: voiceProvider === "gemini" ? agent.color + "20" : "rgba(255,255,255,0.03)",
                border: `1px solid ${voiceProvider === "gemini" ? agent.color + "40" : "rgba(255,255,255,0.06)"}`,
                color: voiceProvider === "gemini" ? agent.color : "rgba(255,255,255,0.5)",
              }}
            >
              Gemini Live
            </button>
          </div>
          {voiceProvider === "gemini" ? (
            <GeminiLiveVoice agentId={agent.id} agentName={agent.name} agentColor={agent.color} />
          ) : (
            <VoiceAgentLive agentId={agent.id} agentName={agent.name} agentColor={agent.color} />
          )}
        </div>
      ) : activeTab === "agent_training" ? (
        <AgentTraining agentId={agent.id} agentName={agent.name} agentColor={agent.color} />
      ) : activeTab === "aura_reservations" && isAura ? (
        <AuraReservations onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_guest" && isAura ? (
        <AuraGuestExperience onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_food_safety" && isAura ? (
        <AuraFoodSafety onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_kitchen" && isAura ? (
        <AuraKitchenFnB onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_marketing" && isAura ? (
        <AuraMarketing onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_events" && isAura ? (
        <AuraEvents onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_operations" && isAura ? (
        <AuraOperations onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_team" && isAura ? (
        <AuraTeam onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_revenue" && isAura ? (
        <AuraRevenue onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_memory" && isAura ? (
        <AuraGuestMemory onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_sustainability" && isAura ? (
        <AuraSustainability onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_trade" && isAura ? (
        <AuraTrade onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_pos" && isAura ? (
        <AuraPOS onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "forge_showroom" && isForge ? (
        <ForgeShowroom />
      ) : activeTab === "forge_sales" && isForge ? (
        <ForgeSales />
      ) : activeTab === "forge_parts" && isForge ? (
        <ForgePartsService />
      ) : activeTab === "forge_marketing" && isForge ? (
        <ForgeMarketing />
      ) : activeTab === "forge_events" && isForge ? (
        <ForgeEvents />
      ) : activeTab === "forge_brand" && isForge ? (
        <ForgeBrandHub />
      ) : activeTab === "forge_team" && isForge ? (
        <ForgeTeam />
      ) : activeTab === "forge_audit" && isForge ? (
        <ForgeAudit />
      ) : activeTab === "content_studio" && isMarketing ? (
        <ContentStudio onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "tender_writer" && isConstruction ? (
        <ApexTenderWriter isPaid={isPaid} userRole={role || undefined} onSendMessage={sendMessage} />
      ) : activeTab === "awards" && isConstruction ? (
        <ApexAwardsTracker isPaid={isPaid} userRole={role || undefined} />
      ) : activeTab === "hs_hub" && isConstruction ? (
        <ApexHSHub isPaid={isPaid} userRole={role || undefined} />
      ) : activeTab === "esg" && isConstruction ? (
        <ApexESGDashboard isPaid={isPaid} userRole={role || undefined} />
      ) : activeTab === "iot_field" && isConstruction ? (
        <ApexIoTFieldTech />
      ) : activeTab === "bim_analyze" && isHanga ? (
        <div className="flex-1 overflow-y-auto p-4"><BimAnalysisPanel agentId={agentId || "bim"} agentName={agent?.name || "ATA"} /></div>
      ) : activeTab === "bim_clash" && isHanga ? (
        <div className="flex-1 overflow-y-auto p-4"><BimAnalysisPanel agentId={agentId || "bim"} agentName={agent?.name || "ATA"} /></div>
      ) : activeTab === "bim_schedule" && isHanga ? (
        <div className="flex-1 overflow-y-auto p-4"><BimAnalysisPanel agentId={agentId || "bim"} agentName={agent?.name || "ATA"} /></div>
      ) : activeTab === "bim_3d" && isHanga ? (
        <div className="flex-1 overflow-y-auto p-4"><BimAnalysisPanel agentId={agentId || "bim"} agentName={agent?.name || "ATA"} /></div>
      ) : activeTab === "odyssey_planner" ? (
        <div className="flex-1 overflow-y-auto p-4"><OdysseyTravelPlanner /></div>
      ) : activeTab.startsWith("turf_") && isSports ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h2 className="text-sm font-bold" style={{ color: "#3D4250" }}>
            {activeTab === "turf_events" ? "Event Manager" : activeTab === "turf_membership" ? "Membership" : activeTab === "turf_facilities" ? "Facilities" : activeTab === "turf_sponsorship" ? "Sponsorship" : activeTab === "turf_performance" ? "Performance" : "Compliance"}
          </h2>
          <p className="text-xs" style={{ color: "#6B7280" }}>
            Use TURF chat to manage {activeTab.replace("turf_", "")} — ask anything about your club's {activeTab.replace("turf_", "")} needs.
          </p>
          <button onClick={() => { setActiveTab("chat"); setInput(`Help me with ${activeTab.replace("turf_", "")} management for my sports club. `); inputRef.current?.focus(); }}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98] flex items-center gap-2"
            style={{ background: `${agent.color}20`, color: agent.color, border: `1px solid ${agent.color}30` }}>
            <Sparkles size={14} /> Open in Chat
          </button>
        </div>
      ) : activeTab === "te_reo_learn" ? (
        <TeReoVideoLearner agentColor={accentColor} onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "live_data" && hasLiveDataTab ? (
        <LiveDataPanel agentId={agent.id} agentName={agent.name} agentColor={accentColor} onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "internal_comms" ? (
        <InternalComms agentId={agent.id} agentName={agent.name} agentColor={agent.color} isPaid={isPaid} userRole={role || undefined} />
      ) : activeTab === "templates" && hasTemplateTab ? (
        <TemplateTab
          agentId={agent.id}
          agentName={agent.name}
          agentColor={agent.color}
          onGenerate={(prompt) => {
            setActiveTab("chat");
            if (isToroa) setToroaView("chat");
            sendMessage(prompt);
          }}
        />
      ) : isToroa && toroaView === "dashboard" ? (
        <div className="flex-1 overflow-y-auto">
          <HelmDashboard items={dashboardItems} onAddReminder={handleAddReminder} />
        </div>
      ) : (
        <div className={hasLivePreview ? "flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden" : "flex flex-col flex-1 min-h-0"}>
          {/* Mobile SPARK toggle */}
          {hasLivePreview && (
            <div className="flex md:hidden border-b border-border shrink-0">
              <button
                onClick={() => setSparkMobileView("chat")}
                className="flex-1 py-2 text-xs font-medium transition-colors"
                style={{
                  background: sparkMobileView === "chat" ? `${previewAccentColor}15` : "transparent",
                  color: sparkMobileView === "chat" ? previewAccentColor : "hsl(var(--muted-foreground))",
                  borderBottom: sparkMobileView === "chat" ? `2px solid ${previewAccentColor}` : "2px solid transparent",
                }}
              >
                Chat
              </button>
              <button
                onClick={() => setSparkMobileView("preview")}
                className="flex-1 py-2 text-xs font-medium transition-colors"
                style={{
                  background: sparkMobileView === "preview" ? `${previewAccentColor}15` : "transparent",
                  color: sparkMobileView === "preview" ? previewAccentColor : "hsl(var(--muted-foreground))",
                  borderBottom: sparkMobileView === "preview" ? `2px solid ${previewAccentColor}` : "2px solid transparent",
                }}
              >
                {isSpark ? " Live Preview" : " Creative Preview"}
              </button>
            </div>
          )}
          {/* Chat Area */}
          <div className={`${hasLivePreview ? "md:w-[40%] md:min-w-0 md:border-r md:border-border" : ""} ${hasLivePreview && sparkMobileView === "preview" ? "hidden md:flex" : "flex"} flex-col flex-1 min-h-0`}>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Proactive cross-agent alerts */}
            {agentId && <ProactiveAlertCards currentAgentId={agentId} accentColor={accentColor} />}

            {showWelcome ? (
              <div className="flex flex-col items-center justify-center min-h-full text-center gap-4 py-6 opacity-0 animate-fade-up overflow-y-auto" style={{ animationFillMode: "forwards" }}>
                <AgentWelcome agent={agent} onStarterClick={(prompt) => prefillAndSend({ prompt, setInput, send: sendMessage, focusRef: inputRef })} />
                {isPrism && (
                  <div className="w-full max-w-sm mt-2 space-y-3">
                    {brandLogoUrl && (
                      <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl" style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}15` }}>
                        <img loading="lazy" decoding="async" src={brandLogoUrl} alt="Your brand logo" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="text-xs text-muted-foreground">Brand logo active</span>
                      </div>
                    )}
                    <PrismBrandDNA onRescan={() => setBrandModalOpen(true)} />
                  </div>
                )}
                {isSpark && <div className="w-full max-w-md mt-2"><SparkTemplateGrid agentColor={agent.color} onSelectTemplate={(prompt) => sendMessage(prompt)} /></div>}

                {isToroa ? (
                  <HelmQuickActions onSelect={(msg) => sendMessage(msg)} />
                ) : isNexus ? (
                  <div className="flex flex-col gap-2 w-full max-w-sm mt-2">
                    <button
                      onClick={handleNexusJobSheetUpload}
                      className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]"
                      style={{
                        background: `linear-gradient(135deg, ${agent.color}25, ${agent.color}10)`,
                        border: `2px solid ${agent.color}50`,
                        color: agent.color,
                        boxShadow: `0 0 20px ${agent.color}15`,
                      }}
                    >
                      <FileText size={18} />
                      Process Job Sheet
                    </button>
                    <p className="text-[10px] text-muted-foreground">
                      Upload a job sheet, freight instructions, or commercial invoice to start processing
                    </p>
                    <div className="border-t border-border my-1" />
                    {getStarterQuestions(agent).map((q) => (
                      <button key={q} onClick={() => prefillAndSend({ prompt: q, setInput, send: sendMessage, focusRef: inputRef })} className="text-left text-xs px-4 py-3 rounded-lg border border-border bg-card hover:border-foreground/10 transition-colors text-foreground/70">
                        {q}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg mt-2">
                    {(() => {
                      const caps = (agentCapabilities[agentId || ""] || []).slice(0, 4);
                      if (caps.length > 0) {
                        return caps.map((cap) => (
                          <button key={cap.prompt} onClick={() => sendMessage(cap.prompt)}
                            className="text-left rounded-xl p-3.5 transition-all duration-200 hover:scale-[1.01] group relative overflow-hidden"
                            style={{
                              background: "rgba(14,14,26,0.7)",
                              backdropFilter: "blur(16px)",
                              WebkitBackdropFilter: "blur(16px)",
                              border: `1px solid ${agent.color}15`,
                              boxShadow: `0 0 0 0 ${agent.color}00`,
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = agent.color + "40"; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${agent.color}10`; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = agent.color + "15"; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${agent.color}00`; }}
                          >
                            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }} />
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${agent.color}12`, border: `1px solid ${agent.color}20` }}>
                                <cap.icon size={14} style={{ color: agent.color }} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground mb-0.5">{cap.title}</p>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">{cap.description}</p>
                              </div>
                            </div>
                          </button>
                        ));
                      }
                      return agent.starters.map((q) => (
                        <button key={q} onClick={() => sendMessage(q)}
                          className="text-left rounded-xl p-3.5 transition-all duration-200 hover:scale-[1.01]"
                          style={{
                            background: "rgba(14,14,26,0.7)",
                            backdropFilter: "blur(16px)",
                            border: `1px solid ${agent.color}15`,
                          }}
                        >
                          <p className="text-xs text-foreground/70">{q}</p>
                        </button>
                      ));
                    })()}
                  </div>
                )}

                {!user && (
                  <p className="text-[10px] text-muted-foreground mt-4">
                    Free preview: {3 - parseInt(sessionStorage.getItem("assembl_preview_msgs") || "0", 10)} messages remaining · <Link to="/signup" className="text-primary hover:underline">Sign up for more</Link>
                  </p>
                )}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto flex gap-4">
                {/* NEXUS Sidebar — workflow cards */}
                {isNexus && nexusWorkflowActive && (
                  <div className="hidden md:block w-72 shrink-0 space-y-3">
                    <NexusJobSheet
                      color={agent.color}
                      onUploadJobSheet={handleNexusJobSheetUpload}
                      workflowStep={nexusWorkflowStep}
                      jobSheetData={nexusJobSheetData}
                      documentStatus={nexusDocStatus}
                      mpiAlerts={nexusMPIAlerts}
                      containerNumbers={nexusContainerNumbers}
                      isProcessing={isLoading}
                    />
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 space-y-3">
                  {/* Mobile: inline NEXUS workflow cards */}
                  {isNexus && nexusWorkflowActive && (
                    <div className="md:hidden">
                      <NexusJobSheet
                        color={agent.color}
                        onUploadJobSheet={handleNexusJobSheetUpload}
                        workflowStep={nexusWorkflowStep}
                        jobSheetData={nexusJobSheetData}
                        documentStatus={nexusDocStatus}
                        mpiAlerts={nexusMPIAlerts}
                        containerNumbers={nexusContainerNumbers}
                        isProcessing={isLoading}
                      />
                    </div>
                  )}

                  {searchQuery.trim() && (
                    <div className="text-[11px] text-assembl-text-secondary px-1 py-0.5">
                      {displayedMessages.length === 0
                        ? `No messages match "${searchQuery}"`
                        : `Showing ${displayedMessages.length} of ${messages.length} messages matching "${searchQuery}"`}
                    </div>
                  )}
                  {displayedMessages.map((msg, i) => (
                    <div key={i}>
                      <div
                        className={`flex gap-2.5 opacity-0 animate-fade-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        style={{ animationDelay: `${i * 30}ms`, animationFillMode: "forwards" }}
                      >
                        {msg.role === "assistant" && (
                          <div className="mt-1 shrink-0">
                            <AgentAvatar agentId={agent.id} color={agent.color} size={28} showGlow={false} />
                          </div>
                        )}
                        <div
                          className={`max-w-[82%] text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "px-4 py-3 rounded-2xl rounded-br-md text-foreground"
                          : "px-4 py-3 rounded-2xl rounded-bl-md"
                          }`}
                          style={msg.role === "user"
                            ? { background: `linear-gradient(135deg, ${agent.color}20, ${agent.color}10)`, border: `1px solid ${agent.color}18`, color: "#3D4250" }
                            : { background: "rgba(255,255,255,0.85)", border: "1px solid rgba(74,165,168,0.15)", color: "#3D4250" }
                          }
                        >
                          {msg.imageUrl && (
                            <img loading="lazy" decoding="async" src={msg.imageUrl} alt="Uploaded" className="rounded-xl mb-2 max-h-48 w-auto object-cover" />
                          )}
                          {msg.fileName && (
                            <div className="flex items-center gap-1.5 mb-2 text-xs text-foreground/60">
                              <FileText size={14} />
                              <span>{msg.fileName}</span>
                            </div>
                          )}
                          {renderMessageContent(msg, i)}
                          {msg.role === "assistant" && (
                            <div className="flex items-start justify-between gap-2 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                              <div className="flex-1">
                                <LegislationCard content={msg.content} agentColor={agent.color} />
                                <ResponseSources content={msg.content} />
                                <AITransparencyBadge />
                                <p className="text-[9px] mt-1 leading-relaxed" style={{ color: "#9CA3AF" }}>
                                  AI-generated · verify before acting
                                </p>
                              </div>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => speakText(msg.content, i)}
                                    className="p-1 rounded-md transition-colors"
                                    style={{
                                      color: isSpeaking === i ? agent.color : "hsl(var(--muted-foreground))",
                                      background: isSpeaking === i ? `${agent.color}15` : "transparent",
                                    }}
                                    title={isSpeaking === i ? "Stop speaking" : "Read aloud"}
                                  >
                                    <Volume2 size={13} />
                                  </button>
                                <MessagePDFButton content={msg.content} agentId={agent.id} agentName={agent.name} agentDesignation={agent.designation} agentColor={agent.color} />
                                <SaveToLibrary content={msg.content} agentId={agent.id} agentName={agent.name} agentColor={agent.color} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {msg.role === "assistant" && (() => {
                        const handoffId = detectHandoff(msg.content);
                        if (!handoffId) return null;
                        // Pass last user message as context for the handoff
                        const lastUserMsg = messages.slice(0, i).reverse().find(m => m.role === "user");
                        return <div className="ml-8 mt-1"><HandoffCard agentId={handoffId} context={lastUserMsg?.content} /></div>;
                      })()}
                      {/* Inline generated images — merge live state with persisted URLs from message history */}
                      {msg.role === "assistant" && (() => {
                        const live = inlineImages[i];
                        const persistedUrls = msg.generatedImageUrls ?? [];
                        const urls = live?.urls?.length ? live.urls : persistedUrls;
                        const status = live?.status ?? (persistedUrls.length > 0 ? "done" : undefined);
                        if (!status && urls.length === 0) return null;
                        return (
                        <div className="ml-8 mt-2">
                          {status === "loading" && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(228,160,255,0.08)", border: "1px solid rgba(228,160,255,0.15)", color: "#E4A0FF" }}>
                              <ImagePlus size={14} className="animate-pulse" />
                              <span>Generating visual{urls.length > 0 ? `s (${urls.length} ready)` : "s"}...</span>
                            </div>
                          )}
                          {urls.length > 0 && (
                            <div className="grid gap-2" style={{ gridTemplateColumns: urls.length > 1 ? "1fr 1fr" : "1fr" }}>
                              {urls.map((url, imgIdx) => {
                                const downloadImage = async () => {
                                  try {
                                    const res = await fetch(url);
                                    const blob = await res.blob();
                                    const pngBlob = new Blob([blob], { type: "image/png" });
                                    const blobUrl = URL.createObjectURL(pngBlob);
                                    const a = document.createElement("a");
                                    a.href = blobUrl;
                                    a.download = `assembl-${agent?.name?.toLowerCase() || "image"}-${Date.now()}-${imgIdx}.png`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(blobUrl);
                                  } catch { window.open(url, "_blank"); }
                                };
                                return (
                                  <div key={imgIdx} className="relative group rounded-xl overflow-hidden border border-border">
                                    <img
                                      loading="lazy"
                                      decoding="async"
                                      src={url}
                                      alt={`Generated visual ${imgIdx + 1}`}
                                      onClick={() => setLightboxUrl(url)}
                                      className="w-full h-auto rounded-xl cursor-zoom-in transition-transform hover:scale-[1.005]"
                                    />
                                    {/* Always-visible download pill — top-right for easy access on touch + desktop */}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); downloadImage(); }}
                                      className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-body font-medium text-foreground bg-background/90 hover:bg-background backdrop-blur-md border border-border shadow-sm transition-all hover:scale-105"
                                      title="Download as PNG"
                                      aria-label="Download image as PNG"
                                    >
                                      <Download size={12} strokeWidth={2.25} />
                                      <span>PNG</span>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {status === "error" && urls.length === 0 && (
                            <div className="text-xs text-muted-foreground px-3 py-2">Image generation failed — try asking again or use PRISM's Content Studio for more options.</div>
                          )}
                        </div>
                        );
                      })()}
                      {msg.role === "assistant" &&
                        getGenerationsForIndex(i).map((gen) => (
                          <div key={gen.id} className="mt-2 ml-8">
                            {gen.status === "SUCCEEDED" && gen.modelUrls?.glb ? (
                              <Suspense fallback={<ModelGenerationCard status="IN_PROGRESS" progress={99} prompt={gen.prompt} color={agent.color} />}>
                                <CompletedModelCard
                                  glbUrl={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-model?url=${encodeURIComponent(gen.modelUrls.glb)}${session?.access_token ? `&token=${session.access_token}` : ""}`}
                                  modelUrls={gen.modelUrls} prompt={gen.prompt} color={agent.color} onRefine={handleRefine}
                                />
                              </Suspense>
                            ) : (
                              <ModelGenerationCard status={gen.status} progress={gen.progress} prompt={gen.prompt} color={agent.color} />
                            )}
                          </div>
                        ))}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2.5 items-start">
                      <div className="mt-1 shrink-0">
                        <AgentAvatar agentId={agent.id} color={agent.color} size={28} showGlow={false} />
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce-dot" style={{ backgroundColor: agent.color, animationDelay: `${i * 0.2}s` }} />
                            ))}
                          </div>
                          <span className="text-[11px] font-body" style={{ color: agent.color + "90" }}>
                            {AGENT_LOADING_MESSAGES[agent.id] || "Thinking…"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* File Preview */}
          {(pendingImagePreview || pendingFile) && (
            <div className="px-4 pb-1 shrink-0">
              <div className="max-w-2xl mx-auto flex gap-2">
                {pendingImagePreview && (
                  <div className="relative inline-block">
                    <img loading="lazy" decoding="async" src={pendingImagePreview} alt="Upload preview" className="h-20 rounded-lg border border-border object-cover" />
                    <button onClick={clearPendingImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                      <X size={12} />
                    </button>
                  </div>
                )}
                {pendingFile && (
                  <div className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
                    <FileText size={16} className="text-foreground/60" />
                    <span className="text-xs text-foreground/70 max-w-[150px] truncate">{pendingFile.name}</span>
                    <button onClick={clearPendingFile} className="w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center ml-1">
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ECHO Receptionist Mode Toggle + Quick Actions Bar */}
          {messages.length > 0 && (
            <div className="px-4 py-1.5 shrink-0">
              <div className="max-w-2xl mx-auto flex gap-1.5 items-center overflow-x-auto scrollbar-hide">
                {agentId === "echo" && (
                  <button
                    onClick={() => {
                      const next = !receptionistMode;
                      setReceptionistMode(next);
                      sessionStorage.setItem("assembl_receptionist_mode", String(next));
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                      receptionistMode
                        ? "bg-[#E4A0FF] text-black shadow-[0_0_12px_rgba(228,160,255,0.4)]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={!receptionistMode ? { background: `${agent.color}10`, border: `1px solid ${agent.color}20` } : undefined}
                  >
                    <Phone size={11} />
                    Receptionist Mode
                  </button>
                )}
                {(() => {
                  const quickActions = (agentCapabilities[agentId || ""] || []).slice(0, 3);
                  return quickActions.map((qa) => (
                    <button key={qa.title} onClick={() => sendMessage(qa.prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap shrink-0 transition-all hover:scale-[1.02]"
                      style={{ background: `${agent.color}10`, color: agent.color, border: `1px solid ${agent.color}20` }}>
                      <qa.icon size={11} />
                      {qa.title}
                    </button>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form onSubmit={handleSubmit} className="px-3 py-2.5 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="max-w-2xl mx-auto flex gap-1.5 items-center rounded-2xl px-2 py-1" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}>
              {/* ARC / PRISM: dedicated image upload for 3D */}
              {(isArc || isPrism) && (
                <>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
                  {canUseFeature("upload") ? (
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isUploading}
                      className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/10 transition-colors disabled:opacity-30" title="Upload a photo for 3D generation">
                      <ImagePlus size={16} />
                    </button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" disabled className="p-2.5 rounded-lg border border-border text-muted-foreground opacity-50 cursor-not-allowed">
                          <Lock size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">Upgrade to Pro</TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}

              {/* Universal file upload for ALL agents */}
              <input
                ref={universalFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.pdf,.csv,.xlsx,.xls,.txt,.text,.md,.doc,.docx"
                onChange={handleUniversalFileSelect}
                className="hidden"
              />
              {canUseFeature("upload") ? (
                <button
                  type="button"
                  onClick={() => universalFileInputRef.current?.click()}
                  disabled={isLoading || isUploading}
                  className="p-2.5 rounded-lg border transition-colors disabled:opacity-30"
                  style={{ borderColor: agent.color + "30", color: agent.color }}
                  title="Upload a document, image, or file"
                >
                  <Paperclip size={16} />
                </button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" disabled className="p-2.5 rounded-lg border border-border text-muted-foreground opacity-50 cursor-not-allowed">
                      <Lock size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Upgrade to Pro</TooltipContent>
                </Tooltip>
              )}

              {/* Model selector for PRISM — hidden on mobile */}
              {isPrism && (
                <div className="relative hidden sm:block">
                  <select
                    value={selectedModel}
                    onChange={(e) => { setSelectedModel(e.target.value); sessionStorage.setItem("assembl_ai_model", e.target.value); }}
                    className="appearance-none bg-card border border-border rounded-lg px-2 py-2.5 text-[10px] font-mono text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer pr-5 transition-colors"
                    style={{ borderColor: agent.color + "30" }}
                    title="Select AI model"
                  >
                    <option value="gemini-flash"> Gemini Flash</option>
                    <option value="gemini-pro"> Gemini Pro</option>
                    <option value="gemini-flash-lite"> Gemini Lite</option>
                    <option value="gpt-5-mini"> GPT-5 Mini</option>
                    <option value="gpt-5"> GPT-5</option>
                  </select>
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 3.5L5 7L8 3.5H2Z"/></svg>
                  </div>
                </div>
              )}

              {/* PRISM: Direct image generation camera button — hidden on mobile */}
              {isPrism && (
                <button
                  type="button"
                  onClick={() => setPrismImageModalOpen(true)}
                  disabled={isLoading || prismImageGenerating}
                  className="hidden sm:flex p-2.5 rounded-lg border transition-all duration-200 hover:scale-105 disabled:opacity-30"
                  style={{ borderColor: agent.color + "30", color: agent.color }}
                  title="Generate image directly"
                >
                  <Camera size={16} />
                </button>
               )}

              {/* PRISM: Ad Engine button — hidden on mobile */}
              {isPrism && (
                <button
                  type="button"
                  onClick={() => setAdEngineOpen(true)}
                  className="hidden sm:flex p-2.5 rounded-lg border transition-all duration-200 hover:scale-105"
                  style={{ borderColor: agent.color + "30", color: agent.color }}
                  title="Ad Engine — Generate ad campaigns"
                >
                  <Target size={16} />
                </button>
              )}

              {isToroa && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className="hidden sm:flex p-2.5 rounded-lg border transition-all duration-200"
                  style={{
                    borderColor: isListening ? "#3A6A9C" : "hsl(var(--border))",
                    color: isListening ? "#3A6A9C" : "hsl(var(--muted-foreground))",
                    background: isListening ? "rgba(179,136,255,0.15)" : "transparent",
                    boxShadow: isListening ? "0 0 16px rgba(179,136,255,0.3)" : "none",
                    animation: isListening ? "pulse 1.5s infinite" : "none",
                  }}
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}

              <input
                ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={isArc && pendingImage ? "Describe the building..." : isToroa ? (isListening ? "Listening..." : "Ask TORO anything...") : isNexus ? "Ask NEXUS or upload..." : `Message ${agent.name}...`}
                className="flex-1 bg-transparent border-none rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors"
                aria-label={`Message ${agent.name}`}
                onKeyDown={(e) => { if (e.key === "Escape") inputRef.current?.blur(); }}
              />
              <button type="submit" disabled={(!input.trim() && !pendingImage && !pendingFile) || isLoading || isUploading}
                className="p-2 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-20"
                style={{
                  backgroundColor: input.trim() || pendingImage || pendingFile ? agent.color : "transparent",
                  color: input.trim() || pendingImage || pendingFile ? "#0A0A14" : agent.color,
                }}
              >
                <Send size={18} />
              </button>
              {/* Voice Agent button */}
              <button
                type="button"
                onClick={() => setVoiceModalOpen(true)}
                className="p-2.5 rounded-lg border transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: accentColor + "30",
                  color: accentColor,
                  background: "transparent",
                }}
                title={`Voice chat with ${agent.name}`}
              >
                <Phone size={16} />
              </button>
            </div>
          </form>
          {/* Build with SPARK cross-agent CTA — subtle inline */}
          {!isSpark && !isAura && messages.length > 0 && (
            <div className="px-4 pb-1.5 flex justify-end">
              <Link
                to={`/chat/spark?from=${encodeURIComponent(agent.name)}&context=${encodeURIComponent(messages.filter(m => m.role === "user").slice(-1)[0]?.content || "")}`}
                className="flex items-center gap-1 text-[9px] font-mono px-2 py-1 rounded-lg transition-all opacity-40 hover:opacity-80"
                style={{ color: "#FF6B00" }}
              >
                <img loading="lazy" decoding="async" src={sparkCtaImg} alt="" className="w-3 h-3 object-contain rounded-sm" />
                Build with SPARK →
              </Link>
            </div>
          )}
          </div>
          {/* Live Preview Panel (SPARK + PRISM) */}
          {hasLivePreview && (
            <div className={`${sparkMobileView === "preview" ? "flex" : "hidden"} md:flex md:w-[60%] flex-col flex-1 min-h-0 p-2`}>
              <SparkPreview code={sparkCode} onIterate={() => setInput(isSpark ? "Make these changes: " : "Update the creative: ")} onDeploy={isSpark ? () => setShowDeployModal(true) : undefined} />
              {isSpark && showDeployModal && (
                <SparkDeployModal htmlContent={sparkCode} onClose={() => setShowDeployModal(false)} />
              )}
            </div>
          )}
        </div>
      )}

      {/* PRISM Image Generation Modal */}
      {prismImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPrismImageModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "transparent", border: "1px solid rgba(74,165,168,0.15)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: "#3D4250" }}>Generate Image</h3>
              <button onClick={() => setPrismImageModalOpen(false)}><X size={16} style={{ color: "#6B7280" }} /></button>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: "#6B7280" }}>Prompt *</label>
              <textarea value={prismImagePrompt} onChange={e => setPrismImagePrompt(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg text-xs bg-transparent border outline-none resize-none"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#3D4250" }} placeholder="Describe the image you want to create..." />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: "#6B7280" }}>Aspect Ratio</label>
              <div className="flex gap-2">
                {(["1:1", "16:9", "9:16", "4:3"] as const).map(ar => (
                  <button key={ar} onClick={() => setPrismImageAspect(ar)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      background: prismImageAspect === ar ? `${agent.color}15` : "rgba(255,255,255,0.03)",
                      color: prismImageAspect === ar ? agent.color : "rgba(255,255,255,0.4)",
                      border: `1px solid ${prismImageAspect === ar ? agent.color + "30" : "rgba(255,255,255,0.05)"}`,
                    }}>
                    {ar}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handlePrismDirectImageGen} disabled={!prismImagePrompt.trim() || prismImageGenerating}
              className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2"
              style={{ background: `${agent.color}20`, color: agent.color, border: `1px solid ${agent.color}30` }}>
              {prismImageGenerating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Camera size={14} /> Generate Image</>}
            </button>
          </div>
        </div>
      )}

      {/* Voice Agent Modal */}
      <VoiceAgentModal
        open={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        agentId={agent.id}
        agentName={agent.name}
        agentColor={accentColor}
        elevenLabsAgentId={getElevenLabsAgentId(agent.id)}
        onHandoffToChat={(voiceTranscript) => {
          if (voiceTranscript.length === 0) return;
          const voiceMessages: Message[] = voiceTranscript.map(t => ({
            role: t.role === "user" ? "user" as const : "assistant" as const,
            content: t.text,
          }));
          setMessages(prev => [...prev, ...voiceMessages]);
          void sendMessage("I've just switched from voice chat. Please continue our conversation here — I may need to upload files or images.");
        }}
      />
      {isPrism && <AdEngineModal open={adEngineOpen} onOpenChange={setAdEngineOpen} />}
      <AgentDebugPanel rawAgentId={rawAgentId} resolvedAgentId={agentId} agent={agent} />
      <ImageLightbox
        url={lightboxUrl}
        alt="Generated visual"
        downloadName={`assembl-${agent?.name?.toLowerCase() || "image"}`}
        onClose={() => setLightboxUrl(null)}
      />
    </div>
  );
};

export default ChatPage;
