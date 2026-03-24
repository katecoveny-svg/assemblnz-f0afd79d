import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plug, Check, Bell, Sparkles, Settings2 } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { INTEGRATIONS, type Integration } from "@/data/integrations";

const SECTIONS = [
  { key: "connected" as const, title: "Connected", subtitle: "Live integrations powering your agents", icon: Check, glow: "hsl(var(--primary))" },
  { key: "available" as const, title: "Available", subtitle: "Ready to connect — unlock agent superpowers", icon: Plug, glow: "hsl(var(--accent-foreground))" },
  { key: "coming_soon" as const, title: "Coming Soon", subtitle: "On the roadmap", icon: Bell, glow: "hsl(var(--muted-foreground))" },
];

const IntegrationHub = () => {
  const { user } = useAuth();
  const [connectedKeys, setConnectedKeys] = useState<Set<string>>(new Set());
  const [connectingName, setConnectingName] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [notified, setNotified] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>("all");

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

  // Collect unique agent tags for filter
  const allAgents = Array.from(new Set(INTEGRATIONS.flatMap(i => i.agents))).filter(a => a !== "All Agents").sort();

  const filteredIntegrations = filter === "all"
    ? INTEGRATIONS
    : INTEGRATIONS.filter(i => i.agents.includes(filter) || i.agents.includes("All Agents"));

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <ParticleField />
      <BrandNav />
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-20">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plug size={18} className="text-primary" />
            </div>
            <h1 className="font-syne font-extrabold text-2xl md:text-3xl bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
              Integration Hub
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            Connect your tools. Your agents get superpowers.
          </p>

          {/* Agent filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`text-[10px] px-2.5 py-1 rounded-full font-medium border transition-all ${filter === "all" ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-border hover:border-primary/20"}`}
            >
              All
            </button>
            {allAgents.map(a => (
              <button
                key={a}
                onClick={() => setFilter(a)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium border transition-all ${filter === a ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-border hover:border-primary/20"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {SECTIONS.map((section) => {
          const items = filteredIntegrations.filter((i) => i.tier === section.key);
          if (items.length === 0) return null;
          return (
            <div key={section.key} className="mb-12">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-1 h-5 rounded-full" style={{ background: section.glow }} />
                <section.icon size={14} className="text-muted-foreground" />
                <h2 className="font-syne font-bold text-sm tracking-wide uppercase text-foreground">
                  {section.title}
                </h2>
                <span className="text-[10px] text-muted-foreground ml-1">({items.length})</span>
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
                            placeholder={integration.name.includes("Zapier") || integration.name.includes("Make") || integration.name.includes("n8n") ? "Paste webhook URL" : "Paste API key"}
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
