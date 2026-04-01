import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Ship, Package, Shield, FileText, Send, Bot, Loader2, Mic, Globe, Calculator } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import assemblProfile from "@/assets/brand/assembl-profile.png";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import VoiceAgentModal from "@/components/VoiceAgentModal";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";
import { supabase } from "@/integrations/supabase/client";

const NEXUS_COLOR = "#5B8CFF";

const FEATURES = [
  "Invoice-to-entry AI processing",
  "Auto tariff classification (NZ Tariff)",
  "Duty & GST calculator",
  "Free Trade Agreement origin analyser",
  "MPI biosecurity flag detector",
  "TSW data formatter",
  "Customs broker document prep",
  "Import entry generation",
  "Export documentation",
  "Tariff concession identification",
  "Compliance audit trails",
  "Multi-currency conversion",
];

const VALUE_PROPS = [
  { icon: Package, text: "Process invoices to import entries in minutes", detail: "Upload a commercial invoice and NEXUS extracts line items, classifies tariffs, and prepares your entry." },
  { icon: Calculator, text: "Instant duty & GST calculations", detail: "Know your landed cost before goods arrive. Automatic FTA preference checks save you money." },
  { icon: Shield, text: "MPI biosecurity compliance", detail: "NEXUS flags items requiring MPI clearance before they become costly border delays." },
  { icon: Globe, text: "Free Trade Agreement optimisation", detail: "Automatically checks origin rules across NZ's FTA network to minimise duties." },
];

const STARTER_PROMPTS = [
  "Process this commercial invoice for import",
  "Classify this product under the NZ Tariff",
  "Calculate duty and GST for this shipment",
  "Check FTA eligibility for goods from Australia",
];

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const NexusMiniChat = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMsg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { agentId: "customs", messages: apiMessages },
      });
      if (error) throw error;
      if (data?.error) {
        const isAuth = typeof data.error === "string" && data.error.toLowerCase().includes("unauthorized");
        setMessages((prev) => [...prev, { role: "assistant", content: isAuth ? "You'll need to sign in to chat with me. Create a free account at /signup and then come back — or jump straight into the full experience at /chat/customs!" : data.error }]);
      } else {
        const reply = data?.content || "Sorry, I didn't get a response. Try the full chat at /chat/customs for the best experience.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't connect right now. Try the full chat at /chat/customs." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-2">Try NEXUS now</h2>
          <p className="text-sm text-muted-foreground font-body">Ask NEXUS anything about customs, tariffs, or trade compliance. No signup required.</p>
        </motion.div>

        <motion.div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: `${NEXUS_COLOR}20`, background: "hsl(var(--card))" }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border" style={{ background: `${NEXUS_COLOR}08` }}>
            <img src={assemblProfile} alt="Assembl" className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-sm font-display font-bold text-foreground">NEXUS</p>
              <p className="text-[10px] text-muted-foreground font-mono">Customs & Trade AI · Online</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: NEXUS_COLOR }} />
          </div>

          <div ref={scrollRef} className="h-[340px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${NEXUS_COLOR}15` }}>
                    <Bot size={14} style={{ color: NEXUS_COLOR }} />
                  </div>
                  <div className="rounded-xl rounded-tl-sm px-4 py-3 text-sm font-body text-foreground bg-muted/50 max-w-[85%]">
                    Kia ora! I'm NEXUS, your customs and trade compliance partner. I can classify tariffs, calculate duties and GST, check FTA eligibility, flag MPI requirements, and prepare import entries. What are you shipping?
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-10">
                  {STARTER_PROMPTS.map((p) => (
                    <button key={p} onClick={() => sendMessage(p)} className="text-xs font-body px-3 py-1.5 rounded-full border transition-all hover:scale-105" style={{ borderColor: `${NEXUS_COLOR}30`, color: NEXUS_COLOR, background: `${NEXUS_COLOR}08` }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${NEXUS_COLOR}15` }}>
                    <Bot size={14} style={{ color: NEXUS_COLOR }} />
                  </div>
                )}
                <div className={`rounded-xl px-4 py-3 text-sm font-body max-w-[85%] whitespace-pre-wrap ${m.role === "user" ? "rounded-tr-sm text-primary-foreground" : "rounded-tl-sm text-foreground bg-muted/50"}`} style={m.role === "user" ? { background: NEXUS_COLOR, color: "#fff" } : undefined}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${NEXUS_COLOR}15` }}>
                  <Bot size={14} style={{ color: NEXUS_COLOR }} />
                </div>
                <div className="rounded-xl rounded-tl-sm px-4 py-3 bg-muted/50">
                  <Loader2 size={16} className="animate-spin" style={{ color: NEXUS_COLOR }} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2 p-3 border-t border-border">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about tariffs, duties, FTAs..." className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none px-3 py-2 rounded-lg border border-border" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30" style={{ background: NEXUS_COLOR, color: "#fff" }}>
              <Send size={16} />
            </button>
          </form>

          <div className="px-4 py-2 border-t border-border text-center">
            <Link to="/chat/customs" className="text-xs font-body hover:underline" style={{ color: NEXUS_COLOR }}>Open full NEXUS experience →</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const NexusLandingPage = () => {
  const navigate = useNavigate();
  const [showVoice, setShowVoice] = useState(false);

  const handleVoiceHandoff = useCallback((transcript: { role: "user" | "agent"; text: string }[]) => {
    if (transcript.length === 0) return;
    const handoffKey = `voice-handoff-${Date.now()}`;
    sessionStorage.setItem(handoffKey, JSON.stringify({ agentId: "customs", transcript }));
    setShowVoice(false);
    navigate(`/chat/customs?voiceHandoff=${encodeURIComponent(handoffKey)}`);
  }, [navigate]);

  useEffect(() => {
    document.title = "NEXUS — Customs & Trade Compliance AI for NZ Importers & Exporters | Assembl";
    const setMeta = (prop: string, content: string, attr = "property") => {
      let el = document.querySelector(`meta[${attr}="${prop}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("og:title", "NEXUS — Customs & Trade Compliance AI for NZ");
    setMeta("og:description", "Tariff classification, duty calculations, FTA analysis, and MPI compliance — without calling your broker every time.");
    setMeta("og:url", "https://assembl.co.nz/nexus");
    setMeta("description", "NEXUS processes commercial invoices to import entries in minutes. Auto tariff classification, duty & GST calculations, and MPI flag detection for NZ importers.", "name");
    return () => { document.title = "Assembl | Business Intelligence Platform for NZ | 45 Specialist Tools"; };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrandNav />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${NEXUS_COLOR} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: NEXUS_COLOR }} />
              <img src={assemblProfile} alt="Assembl" className="w-[120px] h-[120px] rounded-full" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider mb-6" style={{ background: `${NEXUS_COLOR}15`, color: NEXUS_COLOR, border: `1px solid ${NEXUS_COLOR}30` }}>
              <Ship size={14} />
              NZ Customs & Trade
            </div>
          </motion.div>

          <motion.h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <span className="text-foreground">Stop calling your</span><br />
            <span style={{ color: NEXUS_COLOR, textShadow: `0 0 40px ${NEXUS_COLOR}30` }}>customs broker</span>
          </motion.h1>

          <motion.p className="text-lg sm:text-xl text-muted-foreground font-body max-w-2xl mx-auto mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Tariff classification, duty & GST calculations, FTA origin analysis, and MPI compliance — instant answers for NZ importers and exporters.
          </motion.p>

          <motion.div className="flex flex-wrap gap-3 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <a href="#try-nexus" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-display font-bold transition-all duration-300 hover:scale-105" style={{ background: NEXUS_COLOR, color: "#fff", boxShadow: `0 0 30px ${NEXUS_COLOR}30` }}>
              Try NEXUS Free <ArrowRight size={18} />
            </a>
            <button onClick={() => setShowVoice(true)} className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-base font-display font-bold border transition-all duration-300 hover:scale-105" style={{ borderColor: `${NEXUS_COLOR}30`, color: NEXUS_COLOR, background: `${NEXUS_COLOR}08` }}>
              <Mic size={16} /> Talk to NEXUS
            </button>
          </motion.div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-center mb-3 text-foreground">Built for NZ trade</h2>
          <p className="text-center text-muted-foreground text-sm mb-10 font-body max-w-xl mx-auto">
            Grounded in the Customs and Excise Act 2018, Biosecurity Act 1993, and NZ's Free Trade Agreement network.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALUE_PROPS.map((item, i) => (
              <motion.div key={item.text} className="rounded-xl border border-border bg-card p-5" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${NEXUS_COLOR}12` }}>
                    <item.icon size={20} style={{ color: NEXUS_COLOR }} />
                  </div>
                  <div>
                    <p className="text-sm font-display font-bold text-foreground mb-1">{item.text}</p>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { stat: "5min", label: "Invoice to import entry" },
              { stat: "11,000+", label: "Tariff codes in NZ schedule" },
              { stat: "15+", label: "Free Trade Agreements covered" },
            ].map((s, i) => (
              <motion.div key={s.label} className="rounded-xl border border-border bg-card p-6 text-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-3xl sm:text-4xl font-display font-black mb-2" style={{ color: NEXUS_COLOR }}>{s.stat}</p>
                <p className="text-xs text-muted-foreground font-body">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FULL FEATURE LIST */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-center mb-3 text-foreground">Complete trade toolkit</h2>
          <p className="text-center text-muted-foreground text-sm mb-10 font-body">From invoice processing to border compliance, NEXUS handles it all.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map((s, i) => (
              <motion.div key={s} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4" initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: NEXUS_COLOR }} />
                <span className="text-sm font-body text-foreground">{s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRY NEXUS */}
      <div id="try-nexus">
        <NexusMiniChat />
      </div>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-foreground mb-4">Trade smarter, clear faster.</h2>
          <p className="text-muted-foreground text-sm font-body mb-8 max-w-lg mx-auto">
            NEXUS is free to try — no signup required. Ask about tariffs, duties, FTAs, or any customs question.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/chat/customs" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-display font-bold transition-all duration-300 hover:scale-105" style={{ background: NEXUS_COLOR, color: "#fff", boxShadow: `0 0 30px ${NEXUS_COLOR}30` }}>
              Open Full NEXUS <ArrowRight size={18} />
            </Link>
            <button onClick={() => setShowVoice(true)} className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-base font-display font-bold border transition-all duration-300 hover:scale-105" style={{ borderColor: `${NEXUS_COLOR}30`, color: NEXUS_COLOR, background: `${NEXUS_COLOR}08` }}>
              <Mic size={16} /> Talk to NEXUS
            </button>
          </div>
        </div>
      </section>

      <BrandFooter />

      <VoiceAgentModal
        open={showVoice}
        onClose={() => setShowVoice(false)}
        agentId="customs"
        agentName="NEXUS"
        agentColor={NEXUS_COLOR}
        elevenLabsAgentId={getElevenLabsAgentId("customs")}
        onHandoffToChat={handleVoiceHandoff}
      />
    </div>
  );
};

export default NexusLandingPage;
