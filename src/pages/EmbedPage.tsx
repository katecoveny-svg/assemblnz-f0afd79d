import { useState } from "react";
import { Link } from "react-router-dom";
import { agents } from "@/data/agents";
import { Copy, Check, Code2, MessageCircle, ChevronDown, Lock, Zap, Globe, Shield, Sparkles } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import AgentAvatar from "@/components/AgentAvatar";
import { useAuth } from "@/hooks/useAuth";

const BASE_URL = "https://assembl.co.nz";

/** How many agents can each role embed? */
function agentLimit(role: string | null): number {
  switch (role) {
    case "business":
    case "admin":
      return 41;
    case "pro":
      return 3;
    case "starter":
      return 1;
    default:
      return 0;
  }
}

function planLabel(role: string | null): string {
  switch (role) {
    case "business":
    case "admin":
      return "Business";
    case "pro":
      return "Pro";
    case "starter":
      return "Starter";
    default:
      return "Free";
  }
}

const EmbedPage = () => {
  const { user, role, isPaid } = useAuth();
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0].id);
  const [codeTab, setCodeTab] = useState<"iframe" | "bubble">("iframe");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const agent = agents.find((a) => a.id === selectedAgentId)!;
  const limit = agentLimit(role);
  const canEmbed = isPaid;

  const iframeCode = `<iframe
  src="${BASE_URL}/embed/${agent.id}"
  width="400"
  height="600"
  style="border: none; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.3);"
  allow="clipboard-write"
></iframe>`;

  const bubbleCode = `<script>
  window.assemblAgent = "${agent.id}";
  window.assemblColor = "${agent.color}";
  window.assemblBaseUrl = "${BASE_URL}";
</script>
<script src="${BASE_URL}/widget.js"></script>`;

  const currentCode = codeTab === "iframe" ? iframeCode : bubbleCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="min-h-screen star-field flex flex-col">
      <BrandNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex-1">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-light text-foreground mb-4 text-glow-hero">
            Embed your AI agent on <span className="text-gradient-hero">your website</span>
          </h1>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: "#9CA3AF" }}>
            One line of code. Your customers get 24/7 expert answers grounded in NZ law. You get leads captured automatically.
          </p>
          {user && isPaid && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(58,125,110,0.10)", border: "1px solid rgba(58,125,110,0.18)", color: "#5AADA0" }}>
              <Sparkles size={12} />
              {planLabel(role)} plan — embed up to {limit === 41 ? "all 41" : limit} agent{limit !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* ════════════ HOW IT WORKS ════════════ */}
        <section className="mb-16">
          <h2 className="text-lg sm:text-xl font-display font-light text-foreground text-glow-pounamu mb-6 text-center">How to embed Assembl on your site</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              {
                icon: <Zap size={20} />,
                title: "1. Choose your agent",
                desc: "Select the AI agent that matches your industry — from construction compliance to hospitality guest intelligence.",
                color: "#5AADA0",
              },
              {
                icon: <Code2 size={20} />,
                title: "2. Copy the embed code",
                desc: "Pick iframe or floating bubble format. Paste the snippet into your website's HTML — no dependencies, no build tools.",
                color: "#E040FB",
              },
              {
                icon: <Globe size={20} />,
                title: "3. Go live instantly",
                desc: "Your visitors get 24/7 AI-powered advice grounded in NZ legislation. Leads are captured and conversations logged.",
                color: "#3A6A9C",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.65)",
                  border: `1px solid ${step.color}15`,
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${step.color}12`, color: step.color }}>
                  {step.icon}
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: "#9CA3AF" }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Embed features strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {[
              { icon: <Shield size={10} />, label: "NZ legislation grounded" },
              { icon: <Globe size={10} />, label: "Works on any website" },
              { icon: <Zap size={10} />, label: "No dependencies" },
              { icon: <Lock size={10} />, label: "Secure & HTTPS" },
            ].map((f) => (
              <span key={f.label} className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)", color: "#9CA3AF" }}>
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        </section>

        {/* ════════════ NOT SIGNED IN / NO PLAN ════════════ */}
        {!canEmbed && (
          <div className="rounded-2xl p-8 text-center mb-12"
            style={{ background: "rgba(224,64,251,0.04)", border: "1px solid rgba(224,64,251,0.12)" }}>
            <Lock size={28} className="mx-auto mb-3" style={{ color: "#E040FB" }} />
            <h3 className="text-base font-bold text-foreground mb-2">
              {user ? "Upgrade to embed agents" : "Sign in to embed agents"}
            </h3>
            <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>
              {user
                ? "Embed is available on Starter (1 agent), Pro (3 agents), and Business (all 41 agents) plans."
                : "Create an account and subscribe to a paid plan to embed Assembl agents on your website."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {!user && (
                <Link to="/login" className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all">
                  Sign in
                </Link>
              )}
              <Link to="/pricing" className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                View plans
              </Link>
            </div>
          </div>
        )}

        {/* ════════════ EMBED BUILDER (paid users) ════════════ */}
        {canEmbed && (
          <>
            {/* Agent Selector */}
            <div className="mb-8">
              <label className="block text-xs font-medium text-foreground/70 mb-2">Select agent to embed</label>
              <div className="relative">
                <button
                  onClick={() => setSelectorOpen(!selectorOpen)}
                  className="w-full sm:w-80 flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card text-left transition-colors hover:border-foreground/10"
                >
                  <AgentAvatar agentId={agent.id} color={agent.color} size={24} showGlow={false} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-foreground">{agent.name}</span>
                    <span className="text-[11px] ml-2" style={{ color: agent.color }}>{agent.role}</span>
                  </div>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>

                {selectorOpen && (
                  <div className="absolute z-50 mt-1 w-full sm:w-80 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
                    {agents.map((a, i) => {
                      const locked = i >= limit;
                      return (
                        <button
                          key={a.id}
                          onClick={() => {
                            if (!locked) {
                              setSelectedAgentId(a.id);
                              setSelectorOpen(false);
                            }
                          }}
                          disabled={locked}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            locked ? "opacity-40 cursor-not-allowed" : "hover:bg-muted/50"
                          } ${a.id === selectedAgentId ? "bg-muted" : ""}`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color }} />
                          <span className="text-xs font-bold text-foreground">{a.name}</span>
                          <span className="text-[10px] font-mono-jb text-muted-foreground">{a.designation}</span>
                          <span className="text-[10px] ml-auto" style={{ color: a.color }}>{a.sector}</span>
                          {locked && <Lock size={10} className="text-muted-foreground ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {limit < 41 && (
                <p className="text-[10px] mt-2" style={{ color: "#9CA3AF" }}>
                  Your {planLabel(role)} plan includes {limit} agent{limit !== 1 ? "s" : ""}.{" "}
                  <Link to="/pricing" className="text-primary underline">Upgrade</Link> for more.
                </p>
              )}
            </div>

            {/* Main content: Code + Preview side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Code section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Code2 size={16} className="text-primary" />
                  <h2 className="text-sm font-bold text-foreground">Embed code</h2>
                </div>

                {/* Tab toggle */}
                <div className="flex rounded-lg overflow-hidden border border-border mb-4 w-fit">
                  <button
                    onClick={() => setCodeTab("iframe")}
                    className="px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5"
                    style={{
                      background: codeTab === "iframe" ? `${agent.color}15` : "transparent",
                      color: codeTab === "iframe" ? agent.color : "rgba(255,255,255,0.22)",
                    }}
                  >
                    <Code2 size={12} /> Iframe
                  </button>
                  <button
                    onClick={() => setCodeTab("bubble")}
                    className="px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5"
                    style={{
                      background: codeTab === "bubble" ? `${agent.color}15` : "transparent",
                      color: codeTab === "bubble" ? agent.color : "rgba(255,255,255,0.22)",
                    }}
                  >
                    <MessageCircle size={12} /> Chat Bubble
                  </button>
                </div>

                {/* Code snippet */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                    <span className="text-xs font-mono-jb" style={{ color: "#9CA3AF" }}>
                      {codeTab === "iframe" ? "HTML" : "HTML / JavaScript"}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium text-primary border border-primary/20 hover:bg-primary/10 transition-colors"
                    >
                      {copiedSnippet ? <Check size={12} /> : <Copy size={12} />}
                      {copiedSnippet ? "Copied!" : "Copy code"}
                    </button>
                  </div>
                  <pre className="p-4 text-[11px] font-mono-jb text-primary overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    <code>{currentCode}</code>
                  </pre>
                </div>

                {/* Info */}
                <div className="mt-4 rounded-lg p-3" style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}15` }}>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#9CA3AF" }}>
                    {codeTab === "iframe"
                      ? "Paste this code anywhere in your HTML. The iframe renders a self-contained chat widget styled with the agent's brand colours. Works with WordPress, Squarespace, Wix, Shopify, and any custom site."
                      : "Add these two script tags before </body>. A floating chat bubble will appear in the bottom-right corner of your website. No additional CSS or JavaScript required."}
                  </p>
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#5AADA0", boxShadow: "0 0 6px #5AADA0" }} />
                  <h2 className="text-sm font-bold text-foreground">Live preview</h2>
                </div>

                {/* Mock browser window */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/20" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-[10px] font-mono-jb" style={{ color: "#D1D5DB" }}>
                        yourwebsite.co.nz
                      </span>
                    </div>
                  </div>

                  {/* Page mock with embedded widget */}
                  <div className="relative" style={{ background: "#0E0E1A", minHeight: 520 }}>
                    {/* Fake page content */}
                    <div className="p-6 space-y-3">
                      <div className="w-3/4 h-5 rounded" style={{ background: "rgba(255,255,255,0.025)" }} />
                      <div className="w-1/2 h-3 rounded" style={{ background: "rgba(255,255,255,0.015)" }} />
                      <div className="w-2/3 h-3 rounded" style={{ background: "rgba(255,255,255,0.015)" }} />
                      <div className="flex gap-3 mt-6">
                        <div className="w-1/3 h-24 rounded-lg" style={{ background: "rgba(255,255,255,0.015)" }} />
                        <div className="w-1/3 h-24 rounded-lg" style={{ background: "rgba(255,255,255,0.015)" }} />
                        <div className="w-1/3 h-24 rounded-lg" style={{ background: "rgba(255,255,255,0.015)" }} />
                      </div>
                    </div>

                    {/* Live iframe embed */}
                    <div className="absolute bottom-3 right-3 w-[85%] sm:w-[320px] h-[380px] sm:h-[440px]">
                      <iframe
                        key={selectedAgentId}
                        src={`/embed/${selectedAgentId}`}
                        className="w-full h-full rounded-2xl"
                        style={{ border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                        allow="clipboard-write"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════════ PLAN COMPARISON STRIP ════════════ */}
        <section className="mb-16">
          <h2 className="text-base font-display font-light text-foreground text-glow-cyan text-center mb-6">Embed access by plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { plan: "Operator", agents: "1 industry kete", color: "#5AADA0", current: (role as string) === "starter" },
              { plan: "Leader", agents: "2 industry ketes", color: "#3A6A9C", current: (role as string) === "pro" },
              { plan: "Enterprise", agents: "All 7 + Tōro", color: "#3A6A9C", current: (role as string) === "business" },
            ].map((t) => (
              <div
                key={t.plan}
                className="rounded-xl p-4 text-center transition-all"
                style={{
                  background: t.current ? `${t.color}08` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${t.current ? t.color + "30" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                <p className="text-xs font-bold text-foreground mb-1">{t.plan}</p>
                <p className="text-lg font-light mb-0.5" style={{ color: t.color }}>{t.agents}</p>
                <Link to="/pricing" className="text-[10px] underline" style={{ color: "#9CA3AF" }}>See pricing</Link>
                {t.current && (
                  <span className="inline-block mt-2 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${t.color}15`, color: t.color }}>
                    Your plan
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:assembl@assembl.co.nz?subject=Embed Setup Help"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
          >
            Need help setting up? Contact us
          </a>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            {isPaid ? "Upgrade your plan" : "View pricing plans"}
          </Link>
        </div>
      </main>

      <BrandFooter />
    </div>
  );
};

export default EmbedPage;
