import { useState, useRef, useEffect, useCallback, lazy, Suspense, useMemo } from "react";

import { useParams, Link, useSearchParams } from "react-router-dom";
import { agents } from "@/data/agents";
import { echoAgent } from "@/data/agents";
import AgentAvatar from "@/components/AgentAvatar";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, ImagePlus, Paperclip, X, FileText, Globe, LayoutGrid, Lock, Sparkles, Shield, Trophy, Leaf, MessageSquare, Mic, MicOff, Volume2 } from "lucide-react";
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
import AxisAutomations from "@/components/axis/AxisAutomations";
import HelmThisWeek from "@/components/helm/HelmThisWeek";
import HelmBusTracker from "@/components/helm/HelmBusTracker";
import HelmTimetable from "@/components/helm/HelmTimetable";
import HelmInbox from "@/components/helm/HelmInbox";
import HelmReview from "@/components/helm/HelmReview";
import HelmRescue from "@/components/helm/HelmRescue";
import HelmSettings from "@/components/helm/HelmSettings";
import AgentTraining from "@/components/shared/AgentTraining";

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
  const [activeTab, setActiveTab] = useState<"chat" | "templates" | "content_studio" | "tender_writer" | "awards" | "hs_hub" | "esg" | "internal_comms" | "forge_showroom" | "forge_sales" | "forge_parts" | "forge_marketing" | "forge_events" | "forge_brand" | "forge_team" | "aroha_contracts" | "aroha_onboarding" | "aroha_payroll" | "aroha_recruitment" | "aroha_people" | "aroha_company" | "aura_setup" | "aura_reservations" | "aura_guest" | "aura_kitchen" | "aura_marketing" | "aura_events" | "aura_operations" | "aura_team" | "aura_revenue" | "aura_memory" | "aura_sustainability" | "aura_trade" | "haven_dashboard" | "haven_properties" | "haven_jobs" | "haven_tradies" | "haven_command" | "haven_compliance" | "haven_costs" | "haven_documents" | "haven_notifications" | "flux_pipeline" | "flux_followups" | "flux_clients" | "prism_campaigns" | "prism_social" | "prism_brand" | "prism_creative" | "prism_video" | "axis_automations" | "agent_training" | "helm_week" | "helm_bus" | "helm_timetable" | "helm_inbox" | "helm_review" | "helm_rescue" | "helm_settings">("chat");
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
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [paywallType, setPaywallType] = useState<"preview" | "daily_limit" | null>(null);
  const [auraPropertyMode, setAuraPropertyMode] = useState<string>(() => sessionStorage.getItem("aura_property_mode") || "luxury_lodge");

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

  const { user, session, isPaid, canUseFeature, incrementMessageCount, dailyMessageCount, dailyLimit, messageLimitReached, role } = useAuth();
  const { teReoPrompt } = useLanguage();
  const [conversationId, setConversationId] = useState<string | null>(null);

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
  const isSpark = agentId === "spark";
  const hasTemplates = !!(agentId && agentTemplates[agentId]?.length);
  const hasTemplateTab = !!(agentId && TEMPLATE_TAB_AGENTS.includes(agentId));

  // Voice input (Speech-to-Text) for HELM
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
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-3d?taskId=${taskId}&type=${type}`,
            { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
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

  // Extract latest code from SPARK responses for live preview
  const sparkCode = useMemo(() => {
    if (!isSpark) return null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        const content = messages[i].content;
        // Try fenced code block first
        const fenced = content.match(/```(?:html|HTML)?\s*\n([\s\S]*?)```/);
        if (fenced) return fenced[1];
        // Try raw HTML (<!DOCTYPE or <html)
        const raw = content.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
        if (raw) return raw[1];
      }
    }
    return null;
  }, [messages, isSpark]);

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

    if (imageFile && isArc) {
      setIsUploading(true);
      try { uploadedImageUrl = await uploadImage(imageFile); }
      catch (err) { console.error("Image upload error:", err); setIsUploading(false); return; }
      setIsUploading(false);
    }

    const displayContent = content.trim() || (uploadedImageUrl ? "Generate a 3D model from this image" : docFile ? `[file] ${docFile.name}` : imageFile ? "Uploaded image" : "");
    const userMessage: Message = {
      role: "user",
      content: displayContent,
      imageUrl: uploadedImageUrl || (imageFile && !isArc ? URL.createObjectURL(imageFile) : undefined),
      fileName: docFile?.name,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    clearPendingImage();
    clearPendingFile();
    setIsLoading(true);

    const msgIndex = newMessages.length;
    const should3D = isArc && (!!uploadedImageUrl || shouldTrigger3D(userMessage.content));

    try {
      if (imageFile && !isArc) {
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
      const body = isHaven
        ? { messages: apiMessages }
        : { agentId: agent.id, messages: apiMessages, brandContext: brandProfile || undefined, teReoPrompt: teReoPrompt || undefined, propertyMode: isAura ? auraPropertyMode : undefined };

      const invokeOptions: any = { body };
      if (isHaven && session?.access_token) {
        invokeOptions.headers = { Authorization: `Bearer ${session.access_token}` };
      }

      const { data, error } = await supabase.functions.invoke(functionName, invokeOptions);

      if (error) throw error;
      const assistantContent = data.content;
      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);

      // Process NEXUS workflow data from response
      if (isNexus && nexusWorkflowActive) {
        processNexusResponse(assistantContent);
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

  const renderMessageContent = (msg: Message) => {
    const content = msg.content;

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
      {/* Header */}
      <header className="flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 border-b border-border shrink-0 overflow-x-auto scrollbar-hide">
        <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <AgentAvatar agentId={agent.id} color={agent.color} size={28} showGlow={false} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-syne font-bold text-sm text-foreground">{agent.name}</span>
            <span className="font-mono-jb text-[10px] text-muted-foreground">{agent.designation}</span>
          </div>
          <p className="text-[11px] font-jakarta truncate" style={{ color: agent.color }}>{agent.role}</p>
        </div>

        {/* Templates button (legacy modal for non-tab agents) */}
        {hasTemplates && !hasTemplateTab && (
          <LockedButton
            feature="templates"
            onClick={() => setTemplateModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors hover:opacity-80 shrink-0"
            style={{ color: agent.color, border: `1px solid ${agent.color}20` }}
            title="View templates"
          >
            <LayoutGrid size={10} />
            <span className="hidden sm:inline">Templates</span>
          </LockedButton>
        )}

        {/* Language Selector */}
        <LanguageSelector agentColor={agent.color} />

        {/* Conversation Export */}
        <ConversationExport messages={messages} agentName={agent.name} agentDesignation={agent.designation} agentColor={agent.color} />

        {/* Brand badge or add button */}
        {brandProfile ? (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium shrink-0"
            style={{ backgroundColor: agent.color + "15", color: agent.color, border: `1px solid ${agent.color}25` }}
          >
            <Globe size={10} />
            <span className="max-w-[60px] truncate">{brandName}</span>
            <button onClick={() => { setBrandProfile(null); setBrandName(null); sessionStorage.removeItem("assembl_brand_profile"); sessionStorage.removeItem("assembl_brand_name"); }} className="hover:opacity-70 ml-0.5">
              <X size={10} />
            </button>
          </div>
        ) : (
          <LockedButton
            feature="brand_scan"
            onClick={() => setBrandModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors hover:opacity-80 shrink-0"
            style={{ color: agent.color, border: `1px solid ${agent.color}20` }}
            title="Add your website for tailored advice"
          >
            <Globe size={10} />
          </LockedButton>
        )}

        {/* Tab Toggle */}
        {(hasTemplateTab || isHelm || isMarketing || isConstruction || true) && (
          <div className="flex rounded-lg overflow-x-auto border border-border shrink-0 max-w-[45vw] sm:max-w-fit scrollbar-hide">
            <button
              onClick={() => { setActiveTab("chat"); if (isHelm) setHelmView("chat"); }}
              className="px-2.5 py-1 text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: activeTab === "chat" && (!isHelm || helmView === "chat") ? agent.color + "20" : "transparent",
                color: activeTab === "chat" && (!isHelm || helmView === "chat") ? agent.color : "hsl(var(--muted-foreground))",
              }}
            >Chat</button>
            {(hasTemplateTab) && (
              <button
                onClick={() => { setActiveTab("templates"); if (isHelm) setHelmView("chat"); }}
                className="px-2.5 py-1 text-[10px] font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === "templates" ? agent.color + "20" : "transparent",
                  color: activeTab === "templates" ? agent.color : "hsl(var(--muted-foreground))",
                }}
              >Templates</button>
            )}
            {isMarketing && (
              <button
                onClick={() => setActiveTab("content_studio")}
                className="px-2.5 py-1 text-[10px] font-medium transition-colors flex items-center gap-1"
                style={{
                  backgroundColor: activeTab === "content_studio" ? agent.color + "20" : "transparent",
                  color: activeTab === "content_studio" ? agent.color : "hsl(var(--muted-foreground))",
                }}
              ><Sparkles size={10} /> Content Studio</button>
            )}
            {isConstruction && (
              <>
                <button onClick={() => setActiveTab("tender_writer")} className="px-2 py-1 text-[10px] font-medium transition-colors flex items-center gap-1"
                  style={{ backgroundColor: activeTab === "tender_writer" ? agent.color + "20" : "transparent", color: activeTab === "tender_writer" ? agent.color : "hsl(var(--muted-foreground))" }}>
                  <FileText size={9} /> Tenders
                </button>
                <button onClick={() => setActiveTab("awards")} className="px-2 py-1 text-[10px] font-medium transition-colors flex items-center gap-1"
                  style={{ backgroundColor: activeTab === "awards" ? agent.color + "20" : "transparent", color: activeTab === "awards" ? agent.color : "hsl(var(--muted-foreground))" }}>
                  <Trophy size={9} /> Awards
                </button>
                <button onClick={() => setActiveTab("hs_hub")} className="px-2 py-1 text-[10px] font-medium transition-colors flex items-center gap-1"
                  style={{ backgroundColor: activeTab === "hs_hub" ? agent.color + "20" : "transparent", color: activeTab === "hs_hub" ? agent.color : "hsl(var(--muted-foreground))" }}>
                  <Shield size={9} /> H&S
                </button>
                <button onClick={() => setActiveTab("esg")} className="px-2 py-1 text-[10px] font-medium transition-colors flex items-center gap-1"
                  style={{ backgroundColor: activeTab === "esg" ? agent.color + "20" : "transparent", color: activeTab === "esg" ? agent.color : "hsl(var(--muted-foreground))" }}>
                  <Leaf size={9} /> ESG
                </button>
              </>
            )}
            {isForge && (
              <>
                {([
                  { id: "forge_showroom" as const, label: "Showroom" },
                  { id: "forge_sales" as const, label: "Sales" },
                  { id: "forge_parts" as const, label: "Parts" },
                  { id: "forge_marketing" as const, label: "Marketing" },
                  { id: "forge_events" as const, label: "Events" },
                  { id: "forge_team" as const, label: "Team" },
                  { id: "forge_brand" as const, label: "Brand Hub" },
                ]).map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className="px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap"
                    style={{ backgroundColor: activeTab === t.id ? agent.color + "20" : "transparent", color: activeTab === t.id ? agent.color : "hsl(var(--muted-foreground))" }}>
                    {t.label}
                  </button>
                ))}
              </>
            )}
            {isAroha && (
              <>
                {([
                  { id: "aroha_contracts" as const, label: "Contracts" },
                  { id: "aroha_onboarding" as const, label: "Onboarding" },
                  { id: "aroha_payroll" as const, label: "Payroll" },
                  { id: "aroha_recruitment" as const, label: "Recruitment" },
                  { id: "aroha_people" as const, label: "People" },
                  { id: "aroha_company" as const, label: "Setup" },
                ]).map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className="px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap"
                    style={{ backgroundColor: activeTab === t.id ? agent.color + "20" : "transparent", color: activeTab === t.id ? agent.color : "hsl(var(--muted-foreground))" }}>
                    {t.label}
                  </button>
                ))}
              </>
            )}
            {isAura && (
              <>
                <select
                  value={auraPropertyMode}
                  onChange={(e) => { setAuraPropertyMode(e.target.value); sessionStorage.setItem("aura_property_mode", e.target.value); }}
                  className="px-2 py-1 rounded-md text-[10px] font-medium bg-transparent border shrink-0 cursor-pointer focus:outline-none"
                  style={{ borderColor: agent.color + "40", color: agent.color }}
                >
                  <option value="luxury_lodge" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Luxury Lodge</option>
                  <option value="boutique_hotel" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Boutique Hotel</option>
                  <option value="restaurant_bar" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Restaurant / Bar</option>
                  <option value="cafe" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Café</option>
                  <option value="accommodation" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Accommodation (B&B)</option>
                  <option value="catering_events" style={{ background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>Catering & Events</option>
                </select>
                <div className="w-px h-4 bg-border shrink-0" />
                {([
                  { id: "aura_reservations" as const, label: "Reservations" },
                  { id: "aura_guest" as const, label: "Guest Exp" },
                  { id: "aura_memory" as const, label: "Guest CRM" },
                  { id: "aura_kitchen" as const, label: "Kitchen" },
                  { id: "aura_marketing" as const, label: "Marketing" },
                  { id: "aura_events" as const, label: "Events" },
                  { id: "aura_operations" as const, label: "Operations" },
                  { id: "aura_revenue" as const, label: "Revenue" },
                  { id: "aura_team" as const, label: "Team" },
                  { id: "aura_sustainability" as const, label: "Sustain" },
                  { id: "aura_trade" as const, label: "Trade" },
                  { id: "aura_setup" as const, label: "Setup" },
                ]).map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className="px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap"
                    style={{ backgroundColor: activeTab === t.id ? agent.color + "20" : "transparent", color: activeTab === t.id ? agent.color : "hsl(var(--muted-foreground))" }}>
                    {t.label}
                  </button>
                ))}
              </>
            )}
            {isHaven && (
              <>
                {([
                  { id: "haven_dashboard" as const, label: "Dashboard" },
                  { id: "haven_properties" as const, label: "Properties" },
                  { id: "haven_jobs" as const, label: "Jobs" },
                  { id: "haven_tradies" as const, label: "Tradies" },
                  { id: "haven_command" as const, label: "Command" },
                  { id: "haven_compliance" as const, label: "Compliance" },
                  { id: "haven_costs" as const, label: "Costs" },
                  { id: "haven_documents" as const, label: "Docs" },
                  { id: "haven_notifications" as const, label: "Alerts" },
                ]).map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className="px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap"
                    style={{ backgroundColor: activeTab === t.id ? agent.color + "20" : "transparent", color: activeTab === t.id ? agent.color : "hsl(var(--muted-foreground))" }}>
                    {t.label}
                  </button>
                ))}
              </>
            )}
            {isFlux && (
              <>
                {([
                  { id: "flux_pipeline" as const, label: "Pipeline" },
                  { id: "flux_followups" as const, label: "Follow-Ups" },
                  { id: "flux_clients" as const, label: "Clients" },
                ]).map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className="px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap"
                    style={{ backgroundColor: activeTab === t.id ? agent.color + "20" : "transparent", color: activeTab === t.id ? agent.color : "hsl(var(--muted-foreground))" }}>
                    {t.label}
                  </button>
                ))}
              </>
            )}
            {isPrism && (
              <>
                {([
                  { id: "prism_campaigns" as const, label: "Campaigns" },
                  { id: "prism_social" as const, label: "Social" },
                  { id: "prism_brand" as const, label: "Brand Voice" },
                  { id: "prism_creative" as const, label: "Creative" },
                  { id: "prism_video" as const, label: "Video" },
                ]).map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className="px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap"
                    style={{ backgroundColor: activeTab === t.id ? agent.color + "20" : "transparent", color: activeTab === t.id ? agent.color : "hsl(var(--muted-foreground))" }}>
                    {t.label}
                  </button>
                ))}
              </>
            )}
            {isAxis && (
              <>
                {([
                  { id: "axis_automations" as const, label: "Automations" },
                ]).map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className="px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap"
                    style={{ backgroundColor: activeTab === t.id ? agent.color + "20" : "transparent", color: activeTab === t.id ? agent.color : "hsl(var(--muted-foreground))" }}>
                    {t.label}
                  </button>
                ))}
              </>
            )}
            {/* Agent Training tab for all agents */}
            <button onClick={() => setActiveTab("agent_training")} className="px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap"
              style={{ backgroundColor: activeTab === "agent_training" ? agent.color + "20" : "transparent", color: activeTab === "agent_training" ? agent.color : "hsl(var(--muted-foreground))" }}>
              Train
            </button>
            {!isHelm && agentId !== "maritime" && (
              <button onClick={() => setActiveTab("internal_comms")} className="px-2 py-1 text-[10px] font-medium transition-colors flex items-center gap-1"
                style={{ backgroundColor: activeTab === "internal_comms" ? agent.color + "20" : "transparent", color: activeTab === "internal_comms" ? agent.color : "hsl(var(--muted-foreground))" }}>
                <MessageSquare size={9} /> Comms
              </button>
            )}
            {isHelm && (
              <>
                {([
                  { id: "helm_week" as const, label: "This Week" },
                  { id: "helm_bus" as const, label: "Bus" },
                  { id: "helm_timetable" as const, label: "Timetable" },
                  { id: "helm_inbox" as const, label: "Inbox" },
                  { id: "helm_review" as const, label: "Review" },
                  { id: "helm_rescue" as const, label: "Rescue" },
                  { id: "helm_settings" as const, label: "Settings" },
                ]).map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className="px-2 py-1 text-[10px] font-medium transition-colors whitespace-nowrap"
                    style={{ backgroundColor: activeTab === t.id ? HELM_COLOR + "20" : "transparent", color: activeTab === t.id ? HELM_COLOR : "hsl(var(--muted-foreground))" }}>
                    {t.label}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Message counter for free users */}
        {showMsgCounter && (
          <span className="text-[9px] font-mono-jb px-2 py-1 rounded-full border border-border text-muted-foreground shrink-0">
            {remaining}/{dailyLimit}
          </span>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ backgroundColor: "#00FF88", boxShadow: "0 0 6px #00FF88" }} />
          <span className="text-[10px] font-mono-jb text-foreground/50">LIVE</span>
        </div>

        <AccountDropdown />
      </header>

      {/* Modals */}
      <BrandScanModal agentName={agent.name} agentColor={agent.color} open={brandModalOpen} onClose={() => setBrandModalOpen(false)}
        onBrandLoaded={(profile, name) => {
          setBrandProfile(profile);
          setBrandName(name);
          sessionStorage.setItem("assembl_brand_profile", profile);
          sessionStorage.setItem("assembl_brand_name", name);
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
        <FluxLeadPipeline />
      ) : activeTab === "flux_followups" && isFlux ? (
        <FluxFollowUps />
      ) : activeTab === "flux_clients" && isFlux ? (
        <FluxClients />
      ) : activeTab === "prism_campaigns" && isPrism ? (
        <PrismCampaigns />
      ) : activeTab === "prism_social" && isPrism ? (
        <PrismSocialMedia />
      ) : activeTab === "prism_brand" && isPrism ? (
        <PrismBrandVoice />
      ) : activeTab === "prism_creative" && isPrism ? (
        <ContentStudio isPaid={isPaid} userRole={role || undefined} />
      ) : activeTab === "prism_video" && isPrism ? (
        <PrismVideoStudio />
      ) : activeTab === "axis_automations" && isAxis ? (
        <AxisAutomations />
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
        <ContentStudio isPaid={isPaid} userRole={role || undefined} />
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
        <div className={isSpark && sparkCode ? "flex flex-row flex-1 min-h-0 overflow-hidden" : "flex flex-col flex-1 min-h-0"}>
          {/* Chat Area */}
          <div className={`${isSpark && sparkCode ? "w-[40%] min-w-0 border-r border-border" : ""} flex flex-col flex-1 min-h-0`}>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {showWelcome ? (
              <div className="flex flex-col items-center justify-center min-h-full text-center gap-4 py-6 opacity-0 animate-fade-up overflow-y-auto" style={{ animationFillMode: "forwards" }}>
                <AgentWelcome agent={agent} />

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
                          {renderMessageContent(msg)}
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
                                <SaveToLibrary content={msg.content} agentId={agent.id} agentName={agent.name} agentColor={agent.color} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {msg.role === "assistant" && (() => {
                        const handoffId = detectHandoff(msg.content);
                        return handoffId ? <div className="ml-8 mt-1"><HandoffCard agentId={handoffId} /></div> : null;
                      })()}
                      {msg.role === "assistant" &&
                        getGenerationsForIndex(i).map((gen) => (
                          <div key={gen.id} className="mt-2 ml-8">
                            {gen.status === "SUCCEEDED" && gen.modelUrls?.glb ? (
                              <Suspense fallback={<ModelGenerationCard status="IN_PROGRESS" progress={99} prompt={gen.prompt} color={agent.color} />}>
                                <CompletedModelCard
                                  glbUrl={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-model?url=${encodeURIComponent(gen.modelUrls.glb)}`}
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
                      <div className="flex gap-1 px-3 py-2">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce-dot" style={{ backgroundColor: agent.color, animationDelay: `${i * 0.2}s` }} />
                        ))}
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
              {/* ARC: dedicated image upload for 3D */}
              {isArc && (
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

              {/* HELM: Voice mic button */}
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
                <Sparkles size={12} />
                Build with SPARK →
              </Link>
            </div>
          )}
          </div>
          {/* SPARK Live Preview Panel */}
          {isSpark && sparkCode && (
            <div className="hidden md:flex w-[60%] flex-col min-h-0 p-2">
              <SparkPreview code={sparkCode} onIterate={() => setInput("Make these changes: ")} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
