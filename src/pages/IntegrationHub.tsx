import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plug, Check, ExternalLink, Bell, Sparkles, CreditCard, Mail, Workflow, Settings2, Globe } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const glassCard: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

interface Integration {
  name: string;
  description: string;
  agents: string[];
  type: "ai" | "business" | "automation" | "coming_soon";
  icon: any;
  color: string;
  connected?: boolean;
  configKey?: string;
}

const INTEGRATIONS: Integration[] = [
  { name: "Claude API", description: "Powers all 42 agents. Active and connected.", agents: ["All Agents"], type: "ai", icon: Sparkles, color: "#00FF88", connected: true },
  { name: "Image Generation", description: "OpenAI DALL-E 3, Stability AI, or Replicate for photographic images in PRISM.", agents: ["PRISM", "ECHO"], type: "ai", icon: Sparkles, color: "#E040FB", configKey: "image_api_key" },
  { name: "ElevenLabs Voice", description: "Generate voice content: podcast intros, Reel voice-overs, phone greetings.", agents: ["ECHO", "AURA", "PRISM"], type: "ai", icon: Sparkles, color: "#FF6B00", configKey: "elevenlabs_key" },
  { name: "Xero", description: "Sync transactions, invoices, and contacts. Auto-categorise bank feeds.", agents: ["LEDGER", "AROHA"], type: "business", icon: CreditCard, color: "#13B5EA", configKey: "xero_key" },
  { name: "Stripe", description: "Track payments, subscriptions, and revenue automatically.", agents: ["FLUX", "LEDGER"], type: "business", icon: CreditCard, color: "#635BFF", configKey: "stripe_connect" },
  { name: "Google Workspace", description: "Sync calendar, read emails, access Drive docs.", agents: ["AXIS", "ECHO", "All"], type: "business", icon: Globe, color: "#4285F4", configKey: "google_workspace" },
  { name: "Mailchimp / Brevo", description: "Send email campaigns directly from PRISM.", agents: ["PRISM", "ECHO"], type: "business", icon: Mail, color: "#FFE01B", configKey: "email_provider" },
  { name: "Zapier", description: "Connect agents to 8,500+ apps. Trigger real-world actions.", agents: ["All Agents"], type: "automation", icon: Workflow, color: "#FF4A00", configKey: "zapier_webhook" },
  { name: "Make.com", description: "Visual workflow automation from agent outputs.", agents: ["All Agents"], type: "automation", icon: Workflow, color: "#6D00CC", configKey: "make_webhook" },
  { name: "n8n (Self-hosted)", description: "Self-host your automation server for full control.", agents: ["All Agents"], type: "automation", icon: Settings2, color: "#EA4B71", configKey: "n8n_url" },
  { name: "TradeMe API", description: "Auto-list vehicles and properties on TradeMe.", agents: ["FORGE", "HAVEN"], type: "coming_soon", icon: Globe, color: "#FFC107" },
  { name: "Xero Payroll", description: "Direct payroll integration with AROHA.", agents: ["AROHA"], type: "coming_soon", icon: CreditCard, color: "#13B5EA" },
  { name: "Auckland Transport GTFS", description: "Live bus tracking for HELM.", agents: ["HELM"], type: "coming_soon", icon: Globe, color: "#00B4D8" },
  { name: "Companies Office NZ", description: "Verify company details, directors, annual returns.", agents: ["ANCHOR", "LEDGER"], type: "coming_soon", icon: Globe, color: "#2E7D32" },
  { name: "IRD Gateway", description: "Tax filing assistance with LEDGER.", agents: ["LEDGER"], type: "coming_soon", icon: Globe, color: "#1565C0" },
];

const SECTIONS = [
  { key: "ai", title: "AI & Content", icon: Sparkles },
  { key: "business", title: "Business Tools", icon: CreditCard },
  { key: "automation", title: "Automation Platforms", icon: Workflow },
  { key: "coming_soon", title: "Coming Soon", icon: Globe },
];

const IntegrationHub = () => {
  const { user } = useAuth();
  const [connectedKeys, setConnectedKeys] = useState<Set<string>>(new Set());
  const [connectingName, setConnectingName] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_integrations")
      .select("integration_name")
      .eq("user_id", user.id)
      .eq("status", "active")
      .then(({ data }) => {
        if (data) setConnectedKeys(new Set(data.map((d: any) => d.integration_name)));
      });
  }, [user]);

  const handleConnect = async (integration: Integration) => {
    if (!user || !integration.configKey) return;
    setConnectingName(integration.name);
    setInputValue("");
  };

  const handleSaveConnection = async (integration: Integration) => {
    if (!user || !inputValue.trim()) return;
    await supabase.from("user_integrations").upsert({
      user_id: user.id,
      integration_name: integration.name,
      integration_type: integration.type,
      config: { key: inputValue.trim() },
      status: "active",
    }, { onConflict: "user_id,integration_name" });
    setConnectedKeys((prev) => new Set([...prev, integration.name]));
    setConnectingName(null);
    toast({ title: `${integration.name} connected`, description: `${integration.agents.join(", ")} can now use this integration.` });
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <ParticleField />
      <BrandNav />
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-20">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Plug size={24} className="text-[#00E5FF]" />
          <h1 className="font-syne font-extrabold text-2xl">Integrations</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">Connect your tools. Your agents get superpowers.</p>

        {SECTIONS.map((section) => {
          const items = INTEGRATIONS.filter((i) => i.type === section.key);
          if (items.length === 0) return null;
          return (
            <div key={section.key} className="mb-8">
              <h2 className="font-syne font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <section.icon size={14} /> {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((integration) => {
                  const isConnected = integration.connected || connectedKeys.has(integration.name);
                  const isComingSoon = integration.type === "coming_soon";
                  const isConnecting = connectingName === integration.name;

                  return (
                    <div key={integration.name} className="rounded-xl p-4" style={{ ...glassCard, opacity: isComingSoon ? 0.5 : 1 }}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: integration.color + "15" }}>
                          <integration.icon size={16} style={{ color: integration.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-syne font-bold text-xs text-foreground">{integration.name}</span>
                            {isConnected && <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-medium">CONNECTED</span>}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{integration.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {integration.agents.map((a) => (
                          <span key={a} className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-muted-foreground">{a}</span>
                        ))}
                      </div>

                      {isConnecting ? (
                        <div className="space-y-2">
                          <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={integration.name === "Zapier" || integration.name === "Make.com" ? "Paste webhook URL" : "Paste API key"}
                            className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveConnection(integration)} className="flex-1 text-[10px] font-bold py-1.5 rounded-lg text-white" style={{ background: integration.color }}>Save</button>
                            <button onClick={() => setConnectingName(null)} className="text-[10px] text-muted-foreground px-3 py-1.5 rounded-lg border border-border">Cancel</button>
                          </div>
                        </div>
                      ) : isComingSoon ? (
                        <button className="w-full text-[10px] font-medium py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
                          <Bell size={10} /> Notify me
                        </button>
                      ) : isConnected ? (
                        <div className="flex items-center gap-1 text-[10px] text-green-400">
                          <Check size={12} /> Active
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration)}
                          className="w-full text-[10px] font-bold py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                          style={{ background: integration.color }}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <BrandFooter />
    </div>
  );
};

export default IntegrationHub;
