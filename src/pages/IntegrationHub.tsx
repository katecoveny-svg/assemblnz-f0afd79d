import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plug, Check, Bell, Sparkles, CreditCard, Mail, Workflow, Settings2, Globe } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  { name: "Claude API", description: "Powers all 42 agents. Active and connected.", agents: ["All Agents"], type: "ai", icon: Sparkles, color: "hsl(var(--primary))", connected: true },
  { name: "Image Generation", description: "OpenAI DALL-E 3, Stability AI, or Replicate for photographic images in PRISM.", agents: ["PRISM", "ECHO"], type: "ai", icon: Sparkles, color: "hsl(300 80% 60%)", configKey: "image_api_key" },
  { name: "ElevenLabs Voice", description: "Generate voice content: podcast intros, Reel voice-overs, phone greetings.", agents: ["ECHO", "AURA", "PRISM"], type: "ai", icon: Sparkles, color: "hsl(20 100% 50%)", configKey: "elevenlabs_key" },
  { name: "Xero", description: "Sync transactions, invoices, and contacts. Auto-categorise bank feeds.", agents: ["LEDGER", "AROHA"], type: "business", icon: CreditCard, color: "hsl(195 85% 50%)", configKey: "xero_key" },
  { name: "Stripe", description: "Track payments, subscriptions, and revenue automatically.", agents: ["FLUX", "LEDGER"], type: "business", icon: CreditCard, color: "hsl(244 75% 60%)", configKey: "stripe_connect" },
  { name: "Google Workspace", description: "Sync calendar, read emails, access Drive docs.", agents: ["AXIS", "ECHO", "All"], type: "business", icon: Globe, color: "hsl(217 89% 55%)", configKey: "google_workspace" },
  { name: "Mailchimp / Brevo", description: "Send email campaigns directly from PRISM.", agents: ["PRISM", "ECHO"], type: "business", icon: Mail, color: "hsl(50 100% 55%)", configKey: "email_provider" },
  { name: "Zapier", description: "Connect agents to 8,500+ apps. Trigger real-world actions.", agents: ["All Agents"], type: "automation", icon: Workflow, color: "hsl(15 100% 50%)", configKey: "zapier_webhook" },
  { name: "Make.com", description: "Visual workflow automation from agent outputs.", agents: ["All Agents"], type: "automation", icon: Workflow, color: "hsl(270 100% 40%)", configKey: "make_webhook" },
  { name: "n8n (Self-hosted)", description: "Self-host your automation server for full control.", agents: ["All Agents"], type: "automation", icon: Settings2, color: "hsl(345 80% 55%)", configKey: "n8n_url" },
  { name: "TradeMe API", description: "Auto-list vehicles and properties on TradeMe.", agents: ["FORGE", "HAVEN"], type: "coming_soon", icon: Globe, color: "hsl(45 100% 55%)" },
  { name: "Xero Payroll", description: "Direct payroll integration with AROHA.", agents: ["AROHA"], type: "coming_soon", icon: CreditCard, color: "hsl(195 85% 50%)" },
  { name: "Auckland Transport GTFS", description: "Live bus tracking for HELM.", agents: ["HELM"], type: "coming_soon", icon: Globe, color: "hsl(195 100% 43%)" },
  { name: "Companies Office NZ", description: "Verify company details, directors, annual returns.", agents: ["ANCHOR", "LEDGER"], type: "coming_soon", icon: Globe, color: "hsl(130 50% 33%)" },
  { name: "IRD Gateway", description: "Tax filing assistance with LEDGER.", agents: ["LEDGER"], type: "coming_soon", icon: Globe, color: "hsl(213 80% 35%)" },
];

const SECTIONS = [
  { key: "ai", title: "AI & Content", icon: Sparkles, glow: "hsl(var(--primary))" },
  { key: "business", title: "Business Tools", icon: CreditCard, glow: "hsl(var(--accent-foreground))" },
  { key: "automation", title: "Automation Platforms", icon: Workflow, glow: "hsl(270 100% 60%)" },
  { key: "coming_soon", title: "Coming Soon", icon: Globe, glow: "hsl(var(--muted-foreground))" },
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
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Hero header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plug size={18} className="text-primary" />
            </div>
            <h1 className="font-syne font-extrabold text-2xl md:text-3xl bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
              Integrations
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Connect your tools. Your agents get superpowers.
          </p>
        </div>

        {SECTIONS.map((section) => {
          const items = INTEGRATIONS.filter((i) => i.type === section.key);
          if (items.length === 0) return null;
          return (
            <div key={section.key} className="mb-10">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-1 h-5 rounded-full"
                  style={{ background: section.glow }}
                />
                <section.icon size={14} className="text-muted-foreground" />
                <h2 className="font-syne font-bold text-sm tracking-wide uppercase text-foreground">
                  {section.title}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((integration) => {
                  const isConnected = integration.connected || connectedKeys.has(integration.name);
                  const isComingSoon = integration.type === "coming_soon";
                  const isConnecting = connectingName === integration.name;

                  return (
                    <div
                      key={integration.name}
                      className="group relative rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: "hsl(var(--card))",
                        border: isConnected
                          ? "1px solid hsl(var(--primary) / 0.3)"
                          : "1px solid hsl(var(--border))",
                        opacity: isComingSoon ? 0.5 : 1,
                        boxShadow: isConnected
                          ? "0 0 20px hsl(var(--primary) / 0.08)"
                          : "none",
                      }}
                    >
                      {/* Top glow line */}
                      {isConnected && (
                        <div
                          className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
                          style={{ background: `linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)` }}
                        />
                      )}

                      <div className="flex items-start gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{
                            background: integration.color.replace(")", " / 0.1)").replace("hsl", "hsl"),
                            borderColor: integration.color.replace(")", " / 0.2)").replace("hsl", "hsl"),
                          }}
                        >
                          <integration.icon size={16} style={{ color: integration.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-syne font-bold text-sm text-foreground">{integration.name}</span>
                            {isConnected && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold tracking-wider uppercase">
                                Connected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{integration.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {integration.agents.map((a) => (
                          <span
                            key={a}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground font-medium border border-border"
                          >
                            {a}
                          </span>
                        ))}
                      </div>

                      {isConnecting ? (
                        <div className="space-y-2.5">
                          <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={integration.name === "Zapier" || integration.name === "Make.com" ? "Paste webhook URL" : "Paste API key"}
                            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveConnection(integration)}
                              className="flex-1 text-xs font-bold py-2 rounded-xl text-primary-foreground transition-opacity hover:opacity-90"
                              style={{ background: integration.color }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setConnectingName(null)}
                              className="text-xs text-muted-foreground px-4 py-2 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : isComingSoon ? (
                        <button className="w-full text-xs font-medium py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center justify-center gap-1.5">
                          <Bell size={12} /> Notify me
                        </button>
                      ) : isConnected ? (
                        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                          <Check size={14} /> Active
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration)}
                          className="w-full text-xs font-bold py-2.5 rounded-xl text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg"
                          style={{
                            background: integration.color,
                            boxShadow: `0 4px 14px ${integration.color.replace(")", " / 0.25)").replace("hsl", "hsl")}`,
                          }}
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
