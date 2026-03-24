import { useState, useRef, useEffect, useCallback, lazy, Suspense, useMemo } from "react";

import { useParams, Link, useSearchParams } from "react-router-dom";
import { agents } from "@/data/agents";
import { echoAgent } from "@/data/agents";
import AgentAvatar from "@/components/AgentAvatar";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, ImagePlus, Paperclip, X, FileText, Globe, LayoutGrid, Lock, Sparkles, Shield, Trophy, Leaf, MessageSquare, Mic, MicOff, Volume2, Upload, Loader2, Brain, ListChecks, Phone } from "lucide-react";
import { AGENT_LOADING_MESSAGES } from "@/engine/personality";
import AgentMemoryPanel from "@/components/chat/AgentMemoryPanel";
import ActionQueuePanel from "@/components/chat/ActionQueuePanel";
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
import { agentTemplates } from "@/data/templates";
import { useAuth } from "@/hooks/useAuth";
import AccountDropdown from "@/components/AccountDropdown";
import PaywallModal from "@/components/PaywallModal";
import { NeonLock } from "@/components/NeonIcons";
import AgentWelcome from "@/components/AgentWelcome";
import TemplateTab from "@/components/TemplateTab";
import { TEMPLATE_TAB_AGENTS } from "@/data/templates";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import AITransparencyBadge from "@/components/chat/AITransparencyBadge";
import ConversationExport from "@/components/chat/ConversationExport";
import ResponseSources from "@/components/chat/ResponseSources";
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
import ForgeShowroom from "@/components/forge/ForgeShowroom";
import ForgeSales from "@/components/forge/ForgeSales";
import ForgePartsService from "@/components/forge/ForgePartsService";
import ForgeMarketing from "@/components/forge/ForgeMarketing";
import ForgeEvents from "@/components/forge/ForgeEvents";
import ForgeBrandHub from "@/components/forge/ForgeBrandHub";
import ForgeTeam from "@/components/forge/ForgeTeam";
import ArohaContracts from "@/components/aroha/ArohaContracts";
import ArohaOnboarding from "@/components/aroha/ArohaOnboarding";
import ArohaPayroll from "@/components/aroha/ArohaPayroll";
import ArohaRecruitment from "@/components/aroha/ArohaRecruitment";
import ArohaPeopleCulture from "@/components/aroha/ArohaPeopleCulture";
import ArohaCompanySetup from "@/components/aroha/ArohaCompanySetup";
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
import VoiceAgentLive from "@/components/VoiceAgentLive";
import VoiceAgentModal from "@/components/VoiceAgentModal";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";
import SparkTemplateGrid from "@/components/spark/SparkTemplateGrid";
import KindleCampaignWriter from "@/components/kindle/KindleCampaignWriter";
import KindleMarketplace from "@/components/kindle/KindleMarketplace";
import KindleImpactDashboard from "@/components/kindle/KindleImpactDashboard";
import KindleCorporateDashboard from "@/components/kindle/KindleCorporateDashboard";

const CompletedModelCard = lazy(() => import("@/components/CompletedModelCard"));
import SparkPreview from "@/components/spark/SparkPreview";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  fileName?: string;
}

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
const HELM_COLOR = "#B388FF";

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
      const flagged = match[4]?.includes("⚠️") || match[4]?.includes("uncertain");
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

const ChatPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const agent = agentId === "echo" ? echoAgent : agents.find((a) => a.id === agentId);
  const [messages, setMessages] = useState<Message[]>([]);
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
  const [activeTab, setActiveTab] = useState<"chat" | "templates" | "content_studio" | "tender_writer" | "awards" | "hs_hub" | "esg" | "internal_comms" | "forge_showroom" | "forge_sales" | "forge_parts" | "forge_marketing" | "forge_events" | "forge_brand" | "forge_team" | "aroha_contracts" | "aroha_onboarding" | "aroha_payroll" | "aroha_recruitment" | "aroha_people" | "aroha_company" | "aura_setup" | "aura_reservations" | "aura_guest" | "aura_kitchen" | "aura_marketing" | "aura_events" | "aura_operations" | "aura_team" | "aura_revenue" | "aura_memory" | "aura_sustainability" | "aura_trade" | "aura_pos" | "haven_dashboard" | "haven_properties" | "haven_jobs" | "haven_tradies" | "haven_command" | "haven_compliance" | "haven_costs" | "haven_documents" | "haven_notifications" | "flux_pipeline" | "flux_followups" | "flux_clients" | "prism_campaigns" | "prism_social" | "prism_brand" | "prism_creative" | "prism_video" | "prism_brandlab" | "prism_publisher" | "prism_ads" | "prism_product" | "axis_automations" | "agent_training" | "voice_waitlist" | "helm_week" | "helm_bus" | "helm_timetable" | "helm_inbox" | "helm_review" | "helm_rescue" | "helm_settings" | "kindle_writer" | "kindle_marketplace" | "kindle_impact" | "kindle_corporate">("chat");
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [helmView, setHelmView] = useState<"chat" | "dashboard">("chat");
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
  const [auraPropertyMode, setAuraPropertyMode] = useState<string>(() => sessionStorage.getItem("aura_property_mode") || "luxury_lodge");
  const [selectedModel, setSelectedModel] = useState<string>(() => sessionStorage.getItem("assembl_ai_model") || "gemini-flash");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

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
  const { user, session, isPaid, canUseFeature, incrementMessageCount, dailyMessageCount, dailyLimit, messageLimitReached, role } = useAuth();
  const { teReoPrompt } = useLanguage();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [auraModeKey, setAuraModeKey] = useState(0);

  // Voice input/output state (HELM)
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const universalFileInputRef = useRef<HTMLInputElement>(null);
  const nexusFileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<Record<string, number>>({});

  const isArc = agentId === "architecture" || agentId === "construction";
  const isForge = agentId === "automotive";
  const isAroha = agentId === "hr";
  const isAura = agentId === "hospitality";
  const isHelm = agentId === "operations";
  const isNexus = agentId === "customs";
  const isMarketing = agentId === "marketing";
  const isConstruction = agentId === "construction";
  const isHaven = agentId === "property";
  const isFlux = agentId === "sales";
  const isPrism = agentId === "marketing";
  const isAxis = agentId === "pm";
  const isNonprofit = agentId === "nonprofit";
  const isSpark = agentId === "spark";
  const hasTemplates = !!(agentId && agentTemplates[agentId]?.length);
  const hasTemplateTab = !!(agentId && TEMPLATE_TAB_AGENTS.includes(agentId));

  // Listen for AURA mode changes to refresh tabs
  useEffect(() => {
    const handler = () => setAuraModeKey(k => k + 1);
    window.addEventListener("aura-mode-changed", handler);
    return () => window.removeEventListener("aura-mode-changed", handler);
  }, []);


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

  // Voice output (Text-to-Speech) for HELM
  const speakText = useCallback((text: string, messageIndex: number) => {
    if (isSpeaking === messageIndex) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[-•·]\s/g, "")
      .replace(/\n{2,}/g, ". ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-NZ";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    setIsSpeaking(messageIndex);
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, generations]);

  useEffect(() => { return () => { Object.values(pollingRef.current).forEach(clearInterval); }; }, []);
  useEffect(() => { return () => { if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview); }; }, [pendingImagePreview]);

  // Load conversation history on mount
  useEffect(() => {
    if (!user || !agentId) return;
    supabase
      .from("conversations")
      .select("id, messages")
      .eq("user_id", user.id)
      .eq("agent_id", agentId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const conv = data[0] as any;
          setConversationId(conv.id);
          if (Array.isArray(conv.messages) && conv.messages.length > 0) {
            setMessages(conv.messages as Message[]);
          }
        }
      });
  }, [user, agentId]);

  // Save conversation when messages change
  useEffect(() => {
    if (!user || !agentId || messages.length === 0) return;
    const save = async () => {
      if (conversationId) {
        await supabase.from("conversations").update({ messages: messages as any, updated_at: new Date().toISOString() }).eq("id", conversationId);
      } else {
        const { data } = await supabase.from("conversations").insert({ user_id: user.id, agent_id: agentId, messages: messages as any }).select("id").single();
        if (data) setConversationId((data as any).id);
      }
    };
    save();
  }, [messages, user, agentId, conversationId]);

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

    const urls: string[] = [];
    for (const prompt of prompts) {
      try {
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
        if (data?.imageUrl) urls.push(data.imageUrl);
      } catch (err) {
        console.error("Inline image generation error:", err);
      }
    }

    setInlineImages((prev) => ({
      ...prev,
      [msgIndex]: { status: urls.length > 0 ? "done" : "error", urls },
    }));
  }, [agentId, brandProfile, brandName]);

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
  }, [messages, isSpark, isPrism]);

  const hasLivePreview = isSpark && !!sparkCode;
  const previewAccentColor = isSpark ? "#FF6B00" : "#E040FB";
  const [sparkMobileView, setSparkMobileView] = useState<"chat" | "preview">("chat");

  // Collect agent-specific tabs (must be before early return)
  const agentTabs = useMemo(() => {
    if (!agent) return [];
    const tabs: { id: string; label: string; icon?: React.ReactNode }[] = [];
    if (hasTemplateTab) tabs.push({ id: "templates", label: "Templates", icon: <LayoutGrid size={13} /> });
    if (isMarketing) tabs.push({ id: "content_studio", label: "Content Studio", icon: <Sparkles size={13} /> });
    if (isConstruction) {
      tabs.push({ id: "tender_writer", label: "Tenders", icon: <FileText size={13} /> });
      tabs.push({ id: "awards", label: "Awards", icon: <Trophy size={13} /> });
      tabs.push({ id: "hs_hub", label: "H&S", icon: <Shield size={13} /> });
      tabs.push({ id: "esg", label: "ESG", icon: <Leaf size={13} /> });
    }
    if (isForge) {
      ["Showroom", "Sales", "Parts", "Marketing", "Events", "Team", "Brand Hub"].forEach((label, i) => {
        const ids = ["forge_showroom", "forge_sales", "forge_parts", "forge_marketing", "forge_events", "forge_team", "forge_brand"];
        tabs.push({ id: ids[i], label });
      });
    }
    if (isAroha) {
      ["Contracts", "Onboarding", "Payroll", "Recruitment", "People", "Setup"].forEach((label, i) => {
        const ids = ["aroha_contracts", "aroha_onboarding", "aroha_payroll", "aroha_recruitment", "aroha_people", "aroha_company"];
        tabs.push({ id: ids[i], label });
      });
    }
    if (isAura) {
      const auraMode = auraPropertyMode || "luxury_lodge";

      const allAuraTabs: { id: string; label: string; modes: string[] }[] = [
        { id: "aura_reservations", label: "Reservations", modes: ["luxury_lodge", "boutique_hotel", "accommodation"] },
        { id: "aura_guest", label: "Guest Exp", modes: ["luxury_lodge", "boutique_hotel", "accommodation", "restaurant_bar"] },
        { id: "aura_memory", label: "Guest CRM", modes: ["luxury_lodge", "boutique_hotel", "accommodation"] },
        { id: "aura_kitchen", label: "Kitchen", modes: ["luxury_lodge", "boutique_hotel", "restaurant_bar", "cafe", "catering_events"] },
        { id: "aura_marketing", label: "Marketing", modes: ["luxury_lodge", "boutique_hotel", "accommodation", "restaurant_bar", "cafe", "catering_events"] },
        { id: "aura_events", label: "Events", modes: ["luxury_lodge", "boutique_hotel", "restaurant_bar", "catering_events"] },
        { id: "aura_operations", label: "Operations", modes: ["luxury_lodge", "boutique_hotel", "accommodation", "restaurant_bar", "cafe", "catering_events"] },
        { id: "aura_revenue", label: "Revenue", modes: ["luxury_lodge", "boutique_hotel", "accommodation", "restaurant_bar"] },
        { id: "aura_team", label: "Team", modes: ["luxury_lodge", "boutique_hotel", "accommodation", "restaurant_bar", "cafe", "catering_events"] },
        { id: "aura_sustainability", label: "Sustain", modes: ["luxury_lodge", "boutique_hotel", "accommodation", "restaurant_bar", "cafe", "catering_events"] },
        { id: "aura_trade", label: "Trade", modes: ["luxury_lodge", "boutique_hotel", "accommodation"] },
        { id: "aura_pos", label: "POS", modes: ["restaurant_bar", "cafe", "luxury_lodge", "boutique_hotel", "catering_events"] },
        { id: "aura_setup", label: "Setup", modes: ["luxury_lodge", "boutique_hotel", "accommodation", "restaurant_bar", "cafe", "catering_events"] },
      ];

      allAuraTabs
        .filter(t => t.modes.includes(auraMode))
        .forEach(t => tabs.push({ id: t.id, label: t.label }));
    }
    if (isHaven) {
      ["Dashboard", "Properties", "Jobs", "Tradies", "Command", "Compliance", "Costs", "Docs", "Alerts"].forEach((label, i) => {
        const ids = ["haven_dashboard", "haven_properties", "haven_jobs", "haven_tradies", "haven_command", "haven_compliance", "haven_costs", "haven_documents", "haven_notifications"];
        tabs.push({ id: ids[i], label });
      });
    }
    if (isFlux) {
      ["Pipeline", "Follow-Ups", "Clients"].forEach((label, i) => {
        const ids = ["flux_pipeline", "flux_followups", "flux_clients"];
        tabs.push({ id: ids[i], label });
      });
    }
    if (isPrism) {
      ["Campaigns", "Social", "Brand Voice", "Creative", "Ad Studio", "Product", "Video", "Brand Lab", "Publisher"].forEach((label, i) => {
        const ids = ["prism_campaigns", "prism_social", "prism_brand", "prism_creative", "prism_ads", "prism_product", "prism_video", "prism_brandlab", "prism_publisher"];
        tabs.push({ id: ids[i], label });
      });
    }
    if (isNonprofit) {
      ["Campaign Writer", "Marketplace", "Impact", "Corporate"].forEach((label, i) => {
        const ids = ["kindle_writer", "kindle_marketplace", "kindle_impact", "kindle_corporate"];
        tabs.push({ id: ids[i], label });
      });
    }
    if (isAxis) tabs.push({ id: "axis_automations", label: "Automations" });
    if (isHelm) {
      ["This Week", "Bus", "Timetable", "Inbox", "Review", "Rescue", "Settings"].forEach((label, i) => {
        const ids = ["helm_week", "helm_bus", "helm_timetable", "helm_inbox", "helm_review", "helm_rescue", "helm_settings"];
        tabs.push({ id: ids[i], label });
      });
    }
    // Voice Agent waitlist tab for eligible agents
    if (["hospitality", "property", "automotive", "sales", "aura", "haven", "forge", "flux"].includes(agentId || "")) {
      tabs.push({ id: "voice_waitlist", label: "Voice", icon: <Mic size={13} /> });
    }
    tabs.push({ id: "agent_training", label: "Train", icon: <Brain size={13} /> });
    if (!isHelm && agentId !== "maritime") tabs.push({ id: "internal_comms", label: "Comms", icon: <MessageSquare size={13} /> });
    return tabs;
  }, [agent, agentId, hasTemplateTab, isMarketing, isConstruction, isForge, isAroha, isAura, isHaven, isFlux, isPrism, isNonprofit, isAxis, isHelm, auraModeKey, auraPropertyMode]);

  const accentColor = isHelm ? HELM_COLOR : (agent?.color || "#00E5FF");

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <div className="text-center">
          <p className="mb-4">Agent not found.</p>
          <Link to="/" className="text-primary underline">Back to agents</Link>
        </div>
      </div>
    );
  }

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

      const functionName = isHaven ? "haven-ai" : "chat";

      if (isHaven && !session?.access_token) {
        setMessages((prev) => [...prev, { role: "assistant", content: "🔒 Please sign in to use HAVEN's property management features. Your data is securely linked to your account." }]);
        setIsLoading(false);
        return;
      }

      const body = isHaven
        ? { messages: apiMessages }
        : { agentId: agent.id, messages: apiMessages, brandContext: brandProfile || undefined, brandLogoUrl: brandLogoUrl || undefined, teReoPrompt: teReoPrompt || undefined, propertyMode: isAura ? auraPropertyMode : undefined, model: selectedModel };

      const invokeOptions: any = { body };
      if (isHaven && session?.access_token) {
        invokeOptions.headers = { Authorization: `Bearer ${session.access_token}` };
      }

      const { data, error } = await supabase.functions.invoke(functionName, invokeOptions);

      if (error) throw error;
      const assistantContent = data.content;
      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);

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
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
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

  const showWelcome = messages.length === 0;
  const getGenerationsForIndex = (idx: number) => generations.filter((g) => g.messageIndex === idx);



  // Message counter display for free users
  const showMsgCounter = user && !isPaid;
  const remaining = dailyLimit - dailyMessageCount;

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
              <div key={i} className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-code:text-accent prose-headings:text-foreground prose-strong:text-foreground">
                <ReactMarkdown>{p.content}</ReactMarkdown>
              </div>
            )
          )}
        </>
      );
    }

    return (
      <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-code:text-accent prose-headings:text-foreground prose-strong:text-foreground">
        <ReactMarkdown>{content}</ReactMarkdown>
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
          <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground shrink-0">
            <ArrowLeft size={18} />
          </Link>

          {/* Agent identity */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <AgentAvatar agentId={agent.id} color={agent.color} size={36} showGlow={false} />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background animate-pulse" style={{ backgroundColor: "#00FF88" }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-syne font-bold text-base sm:text-lg text-foreground truncate">{agent.name}</h1>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground shrink-0">{agent.designation}</span>
              </div>
              <p className="text-xs font-jakarta truncate" style={{ color: accentColor }}>{agent.role}</p>
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

            <LanguageSelector agentColor={agent.color} />
            <ConversationExport messages={messages} agentName={agent.name} agentDesignation={agent.designation} agentColor={agent.color} />

            {/* Brand badge */}
            {brandProfile ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: accentColor + "12", color: accentColor, border: `1px solid ${accentColor}20` }}>
                <Globe size={11} />
                <span className="max-w-[60px] truncate">{brandName}</span>
                <button onClick={() => { setBrandProfile(null); setBrandName(null); sessionStorage.removeItem("assembl_brand_profile"); sessionStorage.removeItem("assembl_brand_name"); }} className="hover:opacity-70 ml-0.5"><X size={10} /></button>
              </div>
            ) : (
              <LockedButton feature="brand_scan" onClick={() => setBrandModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: accentColor, border: `1px solid ${accentColor}25` }}>
                <Globe size={12} />
              </LockedButton>
            )}

            {/* Logo badge */}
            {brandLogoUrl ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: accentColor + "12", color: accentColor, border: `1px solid ${accentColor}20` }}>
                <img src={brandLogoUrl} alt="Logo" className="w-4 h-4 rounded-sm object-contain" />
                <button onClick={() => { setBrandLogoUrl(null); sessionStorage.removeItem("assembl_brand_logo"); }} className="hover:opacity-70"><X size={10} /></button>
              </div>
            ) : (
              <LockedButton feature="brand_scan" onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: accentColor, border: `1px solid ${accentColor}25` }}>
                {isUploadingLogo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              </LockedButton>
            )}

            {showMsgCounter && (
              <span className="text-[10px] font-mono px-2 py-1 rounded-full border border-border text-muted-foreground">{remaining}/{dailyLimit}</span>
            )}

            <AgentMemoryPanel agentId={agentId!} agentColor={agent.color} agentName={agent.name} />
            <ActionQueuePanel agentColor={agent.color} />
            <AccountDropdown />
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-2 sm:px-3 pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5">
            {/* Chat tab (always first) */}
            <button
              onClick={() => { setActiveTab("chat"); if (isHelm) setHelmView("chat"); }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0"
              style={{
                backgroundColor: activeTab === "chat" && (!isHelm || helmView === "chat") ? accentColor + "20" : "hsl(var(--muted) / 0.3)",
                color: activeTab === "chat" && (!isHelm || helmView === "chat") ? accentColor : "hsl(var(--muted-foreground))",
                border: activeTab === "chat" && (!isHelm || helmView === "chat") ? `1px solid ${accentColor}35` : "1px solid transparent",
                boxShadow: activeTab === "chat" && (!isHelm || helmView === "chat") ? `0 0 12px ${accentColor}15` : "none",
              }}
            >
              <MessageSquare size={14} />
              Chat
            </button>

            {/* Aura property mode selector */}
            {isAura && (
              <select
                value={auraPropertyMode}
                onChange={(e) => { setAuraPropertyMode(e.target.value); sessionStorage.setItem("aura_property_mode", e.target.value); }}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-muted/30 border cursor-pointer focus:outline-none shrink-0"
                style={{ borderColor: accentColor + "30", color: accentColor }}
              >
                <option value="luxury_lodge" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Luxury Lodge</option>
                <option value="boutique_hotel" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Boutique Hotel</option>
                <option value="restaurant_bar" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Restaurant / Bar</option>
                <option value="cafe" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Café</option>
                <option value="accommodation" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Accommodation (B&B)</option>
                <option value="catering_events" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Catering & Events</option>
              </select>
            )}

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
      {/* HELM Tab Views */}
      {activeTab === "helm_week" && isHelm ? (
        <HelmThisWeek onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "helm_bus" && isHelm ? (
        <HelmBusTracker />
      ) : activeTab === "helm_timetable" && isHelm ? (
        <HelmTimetable onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "helm_inbox" && isHelm ? (
        <HelmInbox onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "helm_review" && isHelm ? (
        <HelmReview />
      ) : activeTab === "helm_rescue" && isHelm ? (
        <HelmRescue />
      ) : activeTab === "helm_settings" && isHelm ? (
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
      ) : activeTab === "prism_campaigns" && isPrism ? (
        <PrismCampaigns onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_social" && isPrism ? (
        <PrismSocialMedia onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_brand" && isPrism ? (
        <PrismBrandVoice onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_creative" && isPrism ? (
        <ContentStudio onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_video" && isPrism ? (
        <PrismVideoStudio onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_brandlab" && isPrism ? (
        <PrismBrandLab onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_ads" && isPrism ? (
        <PrismAdStudio onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_product" && isPrism ? (
        <PrismProductStudio onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
      ) : activeTab === "prism_publisher" && isPrism ? (
        <PrismSocialPublisher onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
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
      ) : activeTab === "voice_waitlist" ? (
        <VoiceAgentLive agentId={agent.id} agentName={agent.name} agentColor={agent.color} />
      ) : activeTab === "agent_training" ? (
        <AgentTraining agentId={agent.id} agentName={agent.name} agentColor={agent.color} />
      ) : activeTab === "aura_setup" && isAura ? (
        <AuraPropertySetup />
      ) : activeTab === "aura_reservations" && isAura ? (
        <AuraReservations onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
      ) : activeTab === "aura_guest" && isAura ? (
        <AuraGuestExperience onGenerate={(p) => { setActiveTab("chat"); sendMessage(p); }} />
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
      ) : activeTab === "aroha_contracts" && isAroha ? (
        <ArohaContracts />
      ) : activeTab === "aroha_onboarding" && isAroha ? (
        <ArohaOnboarding />
      ) : activeTab === "aroha_payroll" && isAroha ? (
        <ArohaPayroll />
      ) : activeTab === "aroha_recruitment" && isAroha ? (
        <ArohaRecruitment />
      ) : activeTab === "aroha_people" && isAroha ? (
        <ArohaPeopleCulture />
      ) : activeTab === "aroha_company" && isAroha ? (
        <ArohaCompanySetup />
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
      ) : activeTab === "internal_comms" ? (
        <InternalComms agentId={agent.id} agentName={agent.name} agentColor={agent.color} isPaid={isPaid} userRole={role || undefined} />
      ) : activeTab === "templates" && hasTemplateTab ? (
        <TemplateTab
          agentId={agent.id}
          agentName={agent.name}
          agentColor={agent.color}
          onGenerate={(prompt) => {
            setActiveTab("chat");
            if (isHelm) setHelmView("chat");
            sendMessage(prompt);
          }}
        />
      ) : isHelm && helmView === "dashboard" ? (
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
                {isSpark ? "⚡ Live Preview" : "🎨 Creative Preview"}
              </button>
            </div>
          )}
          {/* Chat Area */}
          <div className={`${hasLivePreview ? "md:w-[40%] md:min-w-0 md:border-r md:border-border" : ""} ${hasLivePreview && sparkMobileView === "preview" ? "hidden md:flex" : "flex"} flex-col flex-1 min-h-0`}>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {showWelcome ? (
              <div className="flex flex-col items-center justify-center min-h-full text-center gap-4 py-6 opacity-0 animate-fade-up overflow-y-auto" style={{ animationFillMode: "forwards" }}>
                <AgentWelcome agent={agent} />
                {isPrism && <div className="w-full max-w-sm mt-2"><PrismBrandDNA onRescan={() => setBrandModalOpen(true)} /></div>}
                {isSpark && <div className="w-full max-w-md mt-2"><SparkTemplateGrid agentColor={agent.color} onSelectTemplate={(prompt) => sendMessage(prompt)} /></div>}

                {isHelm ? (
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
                    {agent.starters.map((q) => (
                      <button key={q} onClick={() => sendMessage(q)} className="text-left text-xs px-4 py-3 rounded-lg border border-border bg-card hover:border-foreground/10 transition-colors text-foreground/70">
                        {q}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full max-w-sm mt-2">
                    {agent.starters.map((q) => (
                      <button key={q} onClick={() => sendMessage(q)} className="text-left text-xs px-4 py-3 rounded-lg border border-border bg-card hover:border-foreground/10 transition-colors text-foreground/70">
                        {q}
                      </button>
                    ))}
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

                  {messages.map((msg, i) => (
                    <div key={i}>
                      <div
                        className={`flex gap-2 opacity-0 animate-fade-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        style={{ animationDelay: `${i * 30}ms`, animationFillMode: "forwards" }}
                      >
                        {msg.role === "assistant" && <AgentAvatar agentId={agent.id} color={agent.color} size={24} showGlow={false} />}
                        <div
                          className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                            msg.role === "user" ? "text-foreground rounded-br-sm" : "bg-card text-foreground/90 rounded-bl-sm"
                          }`}
                          style={msg.role === "user" ? { background: `linear-gradient(135deg, ${agent.color}18, ${agent.color}08)`, border: `1px solid ${agent.color}15` } : {}}
                        >
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Uploaded" className="rounded-lg mb-2 max-h-48 w-auto object-cover" />
                          )}
                          {msg.fileName && (
                            <div className="flex items-center gap-1.5 mb-2 text-xs text-foreground/60">
                              <FileText size={14} />
                              <span>{msg.fileName}</span>
                            </div>
                          )}
                          {renderMessageContent(msg, i)}
                          {msg.role === "assistant" && (
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <LegislationCard content={msg.content} agentColor={agent.color} />
                                <ResponseSources content={msg.content} />
                                <AITransparencyBadge />
                              </div>
                              <div className="flex items-center gap-1">
                                {isHelm && (
                                  <button
                                    type="button"
                                    onClick={() => speakText(msg.content, i)}
                                    className="p-1 rounded-md transition-colors"
                                    style={{
                                      color: isSpeaking === i ? "#B388FF" : "hsl(var(--muted-foreground))",
                                      background: isSpeaking === i ? "rgba(179,136,255,0.15)" : "transparent",
                                    }}
                                    title={isSpeaking === i ? "Stop speaking" : "Read aloud"}
                                  >
                                    <Volume2 size={14} />
                                  </button>
                                )}
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
                      {/* Inline generated images */}
                      {msg.role === "assistant" && inlineImages[i] && (
                        <div className="ml-8 mt-2">
                          {inlineImages[i].status === "loading" && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(228,160,255,0.08)", border: "1px solid rgba(228,160,255,0.15)", color: "#E4A0FF" }}>
                              <ImagePlus size={14} className="animate-pulse" />
                              <span>Generating visual{inlineImages[i].urls.length > 0 ? `s (${inlineImages[i].urls.length} ready)` : "s"}...</span>
                            </div>
                          )}
                          {inlineImages[i].urls.length > 0 && (
                            <div className="grid gap-2" style={{ gridTemplateColumns: inlineImages[i].urls.length > 1 ? "1fr 1fr" : "1fr" }}>
                              {inlineImages[i].urls.map((url, imgIdx) => (
                                <div key={imgIdx} className="relative group rounded-xl overflow-hidden border border-border">
                                  <img src={url} alt={`Generated visual ${imgIdx + 1}`} className="w-full h-auto rounded-xl" />
                                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={url} download={`assembl-echo-${Date.now()}-${imgIdx}.png`} className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white transition-colors" title="Download">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {inlineImages[i].status === "error" && inlineImages[i].urls.length === 0 && (
                            <div className="text-xs text-muted-foreground px-3 py-2">Image generation failed — try asking again or use PRISM's Content Studio for more options.</div>
                          )}
                        </div>
                      )}
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
                    <div className="flex gap-2 items-center">
                      <AgentAvatar agentId={agent.id} color={agent.color} size={24} showGlow={false} />
                      <div className="flex items-center gap-2 px-3 py-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce-dot" style={{ backgroundColor: agent.color, animationDelay: `${i * 0.2}s` }} />
                          ))}
                        </div>
                        <span className="text-[11px] font-jakarta" style={{ color: agent.color + "90" }}>
                          {AGENT_LOADING_MESSAGES[agent.id] || "Thinking…"}
                        </span>
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
                    <img src={pendingImagePreview} alt="Upload preview" className="h-20 rounded-lg border border-border object-cover" />
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

          {/* Input Bar */}
          <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border shrink-0">
            <div className="max-w-2xl mx-auto flex gap-2 items-center">
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

              {/* Model selector for PRISM */}
              {isPrism && (
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => { setSelectedModel(e.target.value); sessionStorage.setItem("assembl_ai_model", e.target.value); }}
                    className="appearance-none bg-card border border-border rounded-lg px-2 py-2.5 text-[10px] font-mono text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer pr-5 transition-colors"
                    style={{ borderColor: agent.color + "30" }}
                    title="Select AI model"
                  >
                    <option value="gemini-flash">⚡ Gemini Flash</option>
                    <option value="gemini-pro">🧠 Gemini Pro</option>
                    <option value="gemini-flash-lite">💨 Gemini Lite</option>
                    <option value="gpt-5-mini">🤖 GPT-5 Mini</option>
                    <option value="gpt-5">🏆 GPT-5</option>
                  </select>
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 3.5L5 7L8 3.5H2Z"/></svg>
                  </div>
                </div>
              )}

              {isHelm && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className="p-2.5 rounded-lg border transition-all duration-200"
                  style={{
                    borderColor: isListening ? "#B388FF" : "hsl(var(--border))",
                    color: isListening ? "#B388FF" : "hsl(var(--muted-foreground))",
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
                placeholder={isArc && pendingImage ? "Describe the building, or send to generate from image..." : isHelm ? (isListening ? "Listening..." : "Ask HELM anything — meals, budgets, schedules, life admin...") : isNexus ? "Ask NEXUS or upload a document..." : `Ask ${agent.name} anything...`}
                className="flex-1 bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background focus:border-foreground/10 transition-colors"
                aria-label={`Message ${agent.name}`}
                onKeyDown={(e) => { if (e.key === "Escape") inputRef.current?.blur(); }}
              />
              <button type="submit" disabled={(!input.trim() && !pendingImage && !pendingFile) || isLoading || isUploading}
                className="px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-30"
                style={{
                  backgroundColor: input.trim() || pendingImage || pendingFile ? agent.color : "transparent",
                  color: input.trim() || pendingImage || pendingFile ? "#0A0A14" : agent.color,
                  border: `1px solid ${input.trim() || pendingImage || pendingFile ? agent.color : agent.color + "30"}`,
                  boxShadow: input.trim() || pendingImage || pendingFile ? `0 0 16px ${agent.color}30` : "none",
                }}
              >
                <Send size={16} />
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
          {/* Build with SPARK cross-agent CTA */}
          {!isSpark && (
            <div className="px-4 pb-2 flex justify-end relative z-50">
              <Link
                to={`/chat/spark?from=${encodeURIComponent(agent.name)}&context=${encodeURIComponent(messages.filter(m => m.role === "user").slice(-1)[0]?.content || "")}`}
                className="flex items-center gap-1.5 text-[11px] font-mono-jb px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  color: "#FF6B00",
                  background: "rgba(255,107,0,0.08)",
                  border: "1px solid rgba(255,107,0,0.15)",
                }}
              >
                <img src={sparkCtaImg} alt="" className="w-4 h-4 object-contain rounded-sm" />
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

      {/* Voice Agent Modal */}
      <VoiceAgentModal
        open={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        agentId={agent.id}
        agentName={agent.name}
        agentColor={accentColor}
        elevenLabsAgentId={getElevenLabsAgentId(agent.id)}
        onHandoffToChat={(voiceTranscript) => {
          // Inject voice conversation context into text chat
          const contextSummary = voiceTranscript
            .map(t => `${t.role === "user" ? "User" : agent.name}: ${t.text}`)
            .join("\n");
          const handoffMessage: Message = {
            role: "assistant",
            content: `📞 **Voice conversation transferred** — here's what we discussed:\n\n${voiceTranscript.slice(-6).map(t => `> **${t.role === "user" ? "You" : agent.name}:** ${t.text}`).join("\n>\n")}\n\nI'm ready to continue here. You can now upload documents, images, or use any of my full capabilities. What would you like to do next?`,
          };
          setMessages(prev => [...prev, handoffMessage]);
        }}
      />
    </div>
  );
};

export default ChatPage;
