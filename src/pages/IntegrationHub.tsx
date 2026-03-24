import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plug, Check, Bell, Sparkles, CreditCard, Mail, Workflow, Settings2, Globe, Cloud, Calendar, FileText, Sun, MessageSquare, Camera, Cpu, Tractor, Palette, Mic, Building, Radio, Shield } from "lucide-react";
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
  tier: "connected" | "available" | "coming_soon";
  icon: any;
  color: string;
  connected?: boolean;
  configKey?: string;
  connectLabel?: string;
}

const INTEGRATIONS: Integration[] = [
  // TIER 1 — Connected / Available now
  { name: "Google Calendar", description: "Sync events with HELM, AXIS, AURA, FLUX. Agents can read and create calendar events.", agents: ["HELM", "AXIS", "AURA", "FLUX"], tier: "available", icon: Calendar, color: "hsl(217 89% 55%)", configKey: "google_calendar", connectLabel: "Connect with Google" },
  { name: "Gmail", description: "Send emails directly from ECHO and FLUX. Draft → approve → sent.", agents: ["ECHO", "FLUX"], tier: "available", icon: Mail, color: "hsl(4 90% 58%)", configKey: "gmail", connectLabel: "Connect with Google" },
  { name: "PDF Export", description: "Download any agent output as a branded PDF.", agents: ["All Agents"], tier: "connected", icon: FileText, color: "hsl(var(--primary))", connected: true },
  { name: "Weather (Open-Meteo)", description: "Real-time NZ weather alerts for APEX (site safety), TERRA (farming), TURF (match day), HAVEN (property).", agents: ["APEX", "TERRA", "TURF", "HAVEN"], tier: "connected", icon: Sun, color: "hsl(45 100% 55%)", connected: true },
  { name: "Claude API", description: "Powers all 44 agents via the Lovable AI Gateway.", agents: ["All Agents"], tier: "connected", icon: Sparkles, color: "hsl(var(--primary))", connected: true },
  { name: "Image Generation", description: "AI image generation for PRISM creative studio and ECHO content.", agents: ["PRISM", "ECHO"], tier: "connected", icon: Camera, color: "hsl(300 80% 60%)", connected: true },

  // TIER 2 — Month 2-3
  { name: "Xero", description: "Connect LEDGER to your real accounting data. Import transactions, generate GST returns, sync expenses.", agents: ["LEDGER", "AROHA"], tier: "available", icon: CreditCard, color: "hsl(195 85% 50%)", configKey: "xero_key", connectLabel: "Connect with Xero" },
  { name: "Stripe", description: "Revenue tracking and subscription analytics for LEDGER and FLUX.", agents: ["FLUX", "LEDGER"], tier: "available", icon: CreditCard, color: "hsl(244 75% 60%)", configKey: "stripe_connect", connectLabel: "Connect with Stripe" },
  { name: "WhatsApp Business", description: "Send WhatsApp messages from HELM (family reminders), AURA (guest messaging), HAVEN (tenant notices).", agents: ["HELM", "AURA", "HAVEN"], tier: "available", icon: MessageSquare, color: "hsl(142 70% 45%)", configKey: "whatsapp_key", connectLabel: "Connect WhatsApp" },
  { name: "Zapier", description: "Connect Assembl to 5,000+ apps via webhooks. When FLUX qualifies a lead → add to HubSpot → send Slack notification.", agents: ["All Agents"], tier: "available", icon: Workflow, color: "hsl(15 100% 50%)", configKey: "zapier_webhook", connectLabel: "Connect Zapier" },
  { name: "Make.com", description: "Visual workflow automation from agent outputs.", agents: ["All Agents"], tier: "available", icon: Workflow, color: "hsl(270 100% 40%)", configKey: "make_webhook", connectLabel: "Connect Make" },
  { name: "Buffer / Later", description: "ECHO publishes content directly to your social media queue.", agents: ["ECHO", "PRISM"], tier: "available", icon: Globe, color: "hsl(195 100% 43%)", configKey: "buffer_key", connectLabel: "Connect Buffer" },

  // TIER 3 — Month 4-6
  { name: "Trimble Connect", description: "Import BIM project data into APEX and ARC. Access models, equipment data, estimates.", agents: ["APEX", "ARC"], tier: "coming_soon", icon: Building, color: "hsl(210 60% 50%)" },
  { name: "DroneDeploy", description: "Aerial survey data feeds into APEX — progress photos, volume calculations, site monitoring.", agents: ["APEX"], tier: "coming_soon", icon: Cloud, color: "hsl(200 80% 50%)" },
  { name: "Procore", description: "Safety observations, inspections, and incident data from Procore into APEX for trend analysis.", agents: ["APEX"], tier: "coming_soon", icon: Shield, color: "hsl(220 70% 50%)" },
  { name: "Canva", description: "PRISM designs directly in Canva for final polish and publishing.", agents: ["PRISM"], tier: "coming_soon", icon: Palette, color: "hsl(280 80% 60%)" },
  { name: "ElevenLabs Voice", description: "Native voice integration — shared brain across chat and voice.", agents: ["ECHO", "AURA", "PRISM"], tier: "coming_soon", icon: Mic, color: "hsl(20 100% 50%)" },

  // TIER 4 — Month 6+
  { name: "Xero Payroll", description: "AROHA generates payroll data that syncs to Xero Payroll.", agents: ["AROHA"], tier: "coming_soon", icon: CreditCard, color: "hsl(195 85% 50%)" },
  { name: "IRD Gateway", description: "LEDGER files GST returns and PAYE directly to IRD.", agents: ["LEDGER"], tier: "coming_soon", icon: Globe, color: "hsl(213 80% 35%)" },
  { name: "Companies Office API", description: "FLUX pulls competitor data instantly for market intelligence.", agents: ["FLUX", "ANCHOR"], tier: "coming_soon", icon: Globe, color: "hsl(130 50% 33%)" },
  { name: "IoT Sensors", description: "Connect building sensors for real-time monitoring across HAVEN, APEX, AURA.", agents: ["HAVEN", "APEX", "AURA"], tier: "coming_soon", icon: Radio, color: "hsl(160 70% 45%)" },
  { name: "Halter (NZ)", description: "GPS cattle tracking data into TERRA for stock management.", agents: ["TERRA"], tier: "coming_soon", icon: Tractor, color: "hsl(100 60% 40%)" },
];

const SECTIONS = [
  { key: "connected" as const, title: "Connected", subtitle: "Live integrations", icon: Check, glow: "hsl(var(--primary))" },
  { key: "available" as const, title: "Available", subtitle: "Ready to connect", icon: Plug, glow: "hsl(var(--accent-foreground))" },
  { key: "coming_soon" as const, title: "Coming Soon", subtitle: "Future integrations", icon: Bell, glow: "hsl(var(--muted-foreground))" },
];

const IntegrationHub = () => {
  const { user } = useAuth();
  const [connectedKeys, setConnectedKeys] = useState<Set<string>>(new Set());
  const [connectingName, setConnectingName] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [notified, setNotified] = useState<Set<string>>(new Set());

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

  const handleConnect = (integration: Integration) => {
    if (!user || !integration.configKey) return;
    setConnectingName(integration.name);
    setInputValue("");
  };

  const handleSaveConnection = async (integration: Integration) => {
    if (!user || !inputValue.trim()) return;
    await supabase.from("user_integrations").upsert({
      user_id: user.id,
      integration_name: integration.name,
      integration_type: integration.tier,
      config: { key: inputValue.trim() },
      status: "active",
    }, { onConflict: "user_id,integration_name" });
    setConnectedKeys((prev) => new Set([...prev, integration.name]));
    setConnectingName(null);
    toast({ title: `${integration.name} connected`, description: `${integration.agents.join(", ")} can now use this integration.` });
  };

  const handleNotify = (name: string) => {
    setNotified((prev) => new Set([...prev, name]));
    toast({ title: "You'll be notified", description: `We'll let you know when ${name} is available.` });
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <ParticleField />
      <BrandNav />
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-20">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plug size={18} className="text-primary" />
            </div>
            <h1 className="font-syne font-extrabold text-2xl md:text-3xl bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
              Integration Hub
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Connect your tools. Your agents get superpowers.
          </p>
        </div>

        {SECTIONS.map((section) => {
          const items = INTEGRATIONS.filter((i) => i.tier === section.key);
          if (items.length === 0) return null;
          return (
            <div key={section.key} className="mb-12">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-1 h-5 rounded-full" style={{ background: section.glow }} />
                <section.icon size={14} className="text-muted-foreground" />
                <h2 className="font-syne font-bold text-sm tracking-wide uppercase text-foreground">
                  {section.title}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4 ml-7">{section.subtitle}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((integration) => {
                  const isConnected = integration.connected || connectedKeys.has(integration.name);
                  const isComingSoon = integration.tier === "coming_soon";
                  const isConnecting = connectingName === integration.name;
                  const isNotified = notified.has(integration.name);

                  return (
                    <div
                      key={integration.name}
                      className="group relative rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: "hsl(var(--card))",
                        border: isConnected
                          ? "1px solid hsl(var(--primary) / 0.3)"
                          : "1px solid hsl(var(--border))",
                        opacity: isComingSoon ? 0.55 : 1,
                        boxShadow: isConnected
                          ? "0 0 20px hsl(var(--primary) / 0.08)"
                          : "none",
                      }}
                    >
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
                            placeholder={integration.name.includes("Zapier") || integration.name.includes("Make") ? "Paste webhook URL" : "Paste API key"}
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
                        <button
                          onClick={() => handleNotify(integration.name)}
                          disabled={isNotified}
                          className="w-full text-xs font-medium py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {isNotified ? <><Check size={12} /> Notified</> : <><Bell size={12} /> Notify me</>}
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
                          {integration.connectLabel || "Connect"}
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
