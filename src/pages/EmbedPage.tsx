import { useState } from "react";
import { Link } from "react-router-dom";
import { agents } from "@/data/agents";
import { Copy, Check, Code2, MessageCircle, ChevronDown } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import RobotIcon from "@/components/RobotIcon";

const BASE_URL = "https://assembl.co.nz";

const EmbedPage = () => {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0].id);
  const [codeTab, setCodeTab] = useState<"iframe" | "bubble">("iframe");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const agent = agents.find((a) => a.id === selectedAgentId)!;

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
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4">
            Add your AI agent to <span className="text-gradient-hero">your website</span>
          </h1>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: "#ffffff38" }}>
            One line of code. Your customers get 24/7 expert answers. You get leads captured automatically.
          </p>
        </div>

        {/* Agent Selector */}
        <div className="mb-8">
          <label className="block text-xs font-medium text-foreground/70 mb-2">Select agent to embed</label>
          <div className="relative">
            <button
              onClick={() => setSelectorOpen(!selectorOpen)}
              className="w-full sm:w-80 flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card text-left transition-colors hover:border-foreground/10"
            >
              <RobotIcon color={agent.color} size={24} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-foreground">{agent.name}</span>
                <span className="text-[11px] ml-2" style={{ color: agent.color }}>{agent.role}</span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>

            {selectorOpen && (
              <div className="absolute z-50 mt-1 w-full sm:w-80 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
                {agents.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAgentId(a.id); setSelectorOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 ${
                      a.id === selectedAgentId ? "bg-muted" : ""
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color }} />
                    <span className="text-xs font-bold text-foreground">{a.name}</span>
                    <span className="text-[10px] font-mono-jb text-muted-foreground">{a.designation}</span>
                    <span className="text-[10px] ml-auto" style={{ color: a.color }}>{a.sector}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
                  color: codeTab === "iframe" ? agent.color : "#ffffff38",
                }}
              >
                <Code2 size={12} /> Iframe
              </button>
              <button
                onClick={() => setCodeTab("bubble")}
                className="px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5"
                style={{
                  background: codeTab === "bubble" ? `${agent.color}15` : "transparent",
                  color: codeTab === "bubble" ? agent.color : "#ffffff38",
                }}
              >
                <MessageCircle size={12} /> Chat Bubble
              </button>
            </div>

            {/* Code snippet */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-xs font-mono-jb" style={{ color: "#ffffff38" }}>
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
              <p className="text-[11px] leading-relaxed" style={{ color: "#ffffff38" }}>
                {codeTab === "iframe"
                  ? "Paste this code anywhere in your HTML. The iframe renders a self-contained chat widget styled with the agent's brand colours."
                  : "Add these two script tags before </body>. A floating chat bubble will appear in the bottom-right corner of your website."}
              </p>
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: "#00FF88", boxShadow: "0 0 6px #00FF88" }} />
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
                  <span className="text-[10px] font-mono-jb" style={{ color: "#ffffff22" }}>
                    yourwebsite.co.nz
                  </span>
                </div>
              </div>

              {/* Page mock with embedded widget */}
              <div className="relative" style={{ background: "#0E0E1A", minHeight: 520 }}>
                {/* Fake page content */}
                <div className="p-6 space-y-3">
                  <div className="w-3/4 h-5 rounded" style={{ background: "#ffffff06" }} />
                  <div className="w-1/2 h-3 rounded" style={{ background: "#ffffff04" }} />
                  <div className="w-2/3 h-3 rounded" style={{ background: "#ffffff04" }} />
                  <div className="flex gap-3 mt-6">
                    <div className="w-1/3 h-24 rounded-lg" style={{ background: "#ffffff04" }} />
                    <div className="w-1/3 h-24 rounded-lg" style={{ background: "#ffffff04" }} />
                    <div className="w-1/3 h-24 rounded-lg" style={{ background: "#ffffff04" }} />
                  </div>
                </div>

                {/* Live iframe embed */}
                <div className="absolute bottom-3 right-3" style={{ width: 320, height: 440 }}>
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

        {/* Bottom CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:hello@assembl.co.nz?subject=Embed Setup Help"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
          >
            Need help setting up? Contact us
          </a>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Want custom branding? See Enterprise
          </Link>
        </div>
      </main>

      <BrandFooter />
    </div>
  );
};

export default EmbedPage;
