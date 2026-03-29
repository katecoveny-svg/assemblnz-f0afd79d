import {
  Calendar, Mail, FileText, Sun, Sparkles, Camera,
  CreditCard, MessageSquare, Workflow, Globe, Cloud,
  Building, Shield, Palette, Mic, Radio, Tractor,
  FileSpreadsheet, HardDrive, MessageCircle, Users,
  ShoppingBag, BarChart3, Megaphone, Database, Layers,
  BriefcaseBusiness, Send, Store, Truck
} from "lucide-react";

export interface Integration {
  name: string;
  description: string;
  agents: string[];
  tier: "connected" | "available" | "coming_soon";
  icon: any;
  color: string;
  connected?: boolean;
  configKey?: string;
  connectLabel?: string;
}

export const INTEGRATIONS: Integration[] = [
  // ─── CONNECTED (Live) ───
  { name: "PDF Export", description: "Download any agent output as a branded PDF.", agents: ["All Agents"], tier: "connected", icon: FileText, color: "hsl(var(--primary))", connected: true },
  { name: "Weather (Open-Meteo)", description: "Real-time NZ weather alerts for APEX (site safety), TERRA (farming), TURF (match day), HAVEN (property).", agents: ["APEX", "TERRA", "TURF", "HAVEN"], tier: "connected", icon: Sun, color: "hsl(45 100% 55%)", connected: true },
  { name: "Lovable AI Gateway", description: "Powers all 44 agents via multi-model AI orchestration — Claude, Gemini, GPT-5.", agents: ["All Agents"], tier: "connected", icon: Sparkles, color: "hsl(var(--primary))", connected: true },
  { name: "Image Generation", description: "AI image generation for PRISM creative studio and ECHO content.", agents: ["PRISM", "ECHO"], tier: "connected", icon: Camera, color: "hsl(300 80% 60%)", connected: true },

  // ─── AVAILABLE — Google Workspace ───
  { name: "Google Calendar", description: "Sync events with HELM, AXIS, AURA, FLUX. Agents can read and create calendar events.", agents: ["HELM", "AXIS", "AURA", "FLUX"], tier: "available", icon: Calendar, color: "hsl(217 89% 55%)", configKey: "google_calendar", connectLabel: "Connect with Google" },
  { name: "Gmail", description: "Send emails directly from ECHO and FLUX. Draft → approve → sent.", agents: ["ECHO", "FLUX"], tier: "available", icon: Mail, color: "hsl(4 90% 58%)", configKey: "gmail", connectLabel: "Connect with Google" },
  { name: "Google Drive", description: "Store and retrieve documents from Drive. Agents can save outputs and read shared files.", agents: ["All Agents"], tier: "available", icon: HardDrive, color: "hsl(145 65% 45%)", configKey: "google_drive", connectLabel: "Connect with Google" },
  { name: "Google Sheets", description: "Read and write spreadsheet data. LEDGER syncs financials, AROHA manages rosters, FLUX tracks pipeline.", agents: ["LEDGER", "AROHA", "FLUX", "AXIS"], tier: "available", icon: FileSpreadsheet, color: "hsl(145 65% 45%)", configKey: "google_sheets", connectLabel: "Connect with Google" },

  // ─── AVAILABLE — Communication ───
  { name: "Slack", description: "Push agent alerts, summaries and approvals to Slack channels. Get notified when agents complete tasks.", agents: ["All Agents"], tier: "available", icon: MessageCircle, color: "hsl(330 70% 55%)", configKey: "slack_key", connectLabel: "Connect Slack" },
  { name: "Microsoft Teams", description: "Agent notifications and task approvals via Teams channels. Works with AXIS, AROHA, ECHO.", agents: ["AXIS", "AROHA", "ECHO", "SIGNAL"], tier: "available", icon: Users, color: "hsl(230 80% 55%)", configKey: "teams_webhook", connectLabel: "Connect Teams" },
  { name: "WhatsApp Business", description: "Send WhatsApp messages from HELM (family reminders), AURA (guest messaging), HAVEN (tenant notices).", agents: ["HELM", "AURA", "HAVEN"], tier: "available", icon: MessageSquare, color: "hsl(142 70% 45%)", configKey: "whatsapp_key", connectLabel: "Connect WhatsApp" },

  // ─── AVAILABLE — Business Tools ───
  { name: "Xero", description: "Connect LEDGER to your real accounting data. Import transactions, generate GST returns, sync expenses.", agents: ["LEDGER", "AROHA"], tier: "available", icon: CreditCard, color: "hsl(195 85% 50%)", configKey: "xero_key", connectLabel: "Connect with Xero" },
  { name: "Stripe", description: "Revenue tracking and subscription analytics for LEDGER and FLUX.", agents: ["FLUX", "LEDGER"], tier: "available", icon: CreditCard, color: "hsl(244 75% 60%)", configKey: "stripe_connect", connectLabel: "Connect with Stripe" },
  { name: "HubSpot", description: "Sync FLUX leads and pipeline to HubSpot CRM. Auto-create contacts from qualified leads, log activities.", agents: ["FLUX", "ECHO", "PRISM"], tier: "available", icon: BarChart3, color: "hsl(15 100% 55%)", configKey: "hubspot_key", connectLabel: "Connect HubSpot" },
  { name: "Salesforce", description: "Enterprise CRM sync. Push FLUX opportunities, pull account data, sync contact records across agents.", agents: ["FLUX", "ANCHOR", "ECHO"], tier: "available", icon: Cloud, color: "hsl(210 80% 55%)", configKey: "salesforce_key", connectLabel: "Connect Salesforce" },

  // ─── AVAILABLE — E-Commerce ───
  { name: "Shopify", description: "Sync product catalogues, track orders, manage inventory. FLUX tracks revenue, PRISM creates product content.", agents: ["FLUX", "PRISM", "LEDGER"], tier: "available", icon: ShoppingBag, color: "hsl(80 65% 40%)", configKey: "shopify_key", connectLabel: "Connect Shopify" },
  { name: "WooCommerce", description: "WordPress store integration. Product management, order tracking, and customer data sync.", agents: ["FLUX", "PRISM", "LEDGER"], tier: "available", icon: Store, color: "hsl(270 60% 50%)", configKey: "woocommerce_key", connectLabel: "Connect WooCommerce" },

  // ─── AVAILABLE — Creative ───
  { name: "Canva", description: "Design directly in Canva from PRISM outputs. Export brand assets, social templates, and campaign visuals.", agents: ["PRISM", "ECHO", "KINDLE"], tier: "available", icon: Palette, color: "hsl(195 100% 45%)", configKey: "canva_key", connectLabel: "Connect Canva" },
  { name: "Buffer / Later", description: "ECHO publishes content directly to your social media queue.", agents: ["ECHO", "PRISM"], tier: "available", icon: Megaphone, color: "hsl(195 100% 43%)", configKey: "buffer_key", connectLabel: "Connect Buffer" },

  // ─── AVAILABLE — Automation ───
  { name: "Zapier", description: "Connect Assembl to 5,000+ apps via webhooks. When FLUX qualifies a lead → add to HubSpot → send Slack notification.", agents: ["All Agents"], tier: "available", icon: Workflow, color: "hsl(15 100% 50%)", configKey: "zapier_webhook", connectLabel: "Connect Zapier" },
  { name: "Make.com", description: "Visual workflow automation from agent outputs.", agents: ["All Agents"], tier: "available", icon: Workflow, color: "hsl(270 100% 40%)", configKey: "make_webhook", connectLabel: "Connect Make" },
  { name: "n8n", description: "Self-hosted workflow automation. Connect agent triggers to custom pipelines.", agents: ["All Agents"], tier: "available", icon: Layers, color: "hsl(340 80% 55%)", configKey: "n8n_webhook", connectLabel: "Connect n8n" },

  // ─── COMING SOON — Industry ───
  { name: "Trimble Connect", description: "Import BIM project data into APEX and ARC. Access models, equipment data, estimates.", agents: ["APEX", "ARC"], tier: "coming_soon", icon: Building, color: "hsl(210 60% 50%)" },
  { name: "DroneDeploy", description: "Aerial survey data feeds into APEX — progress photos, volume calculations, site monitoring.", agents: ["APEX"], tier: "coming_soon", icon: Cloud, color: "hsl(200 80% 50%)" },
  { name: "Procore", description: "Safety observations, inspections, and incident data from Procore into APEX for trend analysis.", agents: ["APEX"], tier: "coming_soon", icon: Shield, color: "hsl(220 70% 50%)" },
  { name: "ElevenLabs Voice", description: "Native voice integration — shared brain across chat and voice.", agents: ["ECHO", "AURA", "PRISM"], tier: "coming_soon", icon: Mic, color: "hsl(20 100% 50%)" },
  { name: "Xero Payroll", description: "AROHA generates payroll data that syncs to Xero Payroll.", agents: ["AROHA"], tier: "coming_soon", icon: CreditCard, color: "hsl(195 85% 50%)" },
  { name: "IRD Gateway", description: "LEDGER files GST returns and PAYE directly to IRD.", agents: ["LEDGER"], tier: "coming_soon", icon: Globe, color: "hsl(213 80% 35%)" },
  { name: "Companies Office API", description: "FLUX pulls competitor data instantly for market intelligence.", agents: ["FLUX", "ANCHOR"], tier: "coming_soon", icon: BriefcaseBusiness, color: "hsl(130 50% 33%)" },
  { name: "IoT Sensors", description: "Connect building sensors for real-time monitoring across HAVEN, APEX, AURA.", agents: ["HAVEN", "APEX", "AURA"], tier: "coming_soon", icon: Radio, color: "hsl(160 70% 45%)" },
  { name: "Halter (NZ)", description: "GPS cattle tracking data into TERRA for stock management.", agents: ["TERRA"], tier: "coming_soon", icon: Tractor, color: "hsl(100 60% 40%)" },
  { name: "Uber Direct", description: "Logistics and delivery tracking for HELM and FORGE.", agents: ["HELM", "FORGE"], tier: "coming_soon", icon: Truck, color: "hsl(0 0% 20%)" },
  { name: "SendGrid", description: "Transactional email delivery for agent notifications and campaign sends.", agents: ["ECHO", "FLUX", "KINDLE"], tier: "coming_soon", icon: Send, color: "hsl(210 90% 55%)" },
  { name: "Airtable", description: "Flexible database sync for custom agent workflows and reporting.", agents: ["All Agents"], tier: "coming_soon", icon: Database, color: "hsl(200 80% 50%)" },
];
