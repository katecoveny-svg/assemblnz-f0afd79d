import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, UtensilsCrossed, Star, Shield, FileText, Share2, Send, Bot, Loader2, Mic, Wine, Users, ClipboardCheck } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import VoiceAgentModal from "@/components/VoiceAgentModal";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";
import { supabase } from "@/integrations/supabase/client";

const AURA_COLOR = "#00E5A0";

const FEATURES = [
  "Food Control Plan diary (MPI-ready PDFs)",
  "Menu costing engine (30-35% GP target)",
  "Staff rostering & availability",
  "Guest CRM & loyalty tracking",
  "Revenue & yield optimisation",
  "Reservation management",
  "Wine & beverage pairing engine",
  "Supplier & trade management",
  "Event & function planning",
  "Sustainability & waste tracking",
  "Food safety temperature logging",
  "Compliance calendar (Food Act 2014)",
];

const VALUE_PROPS = [
  { icon: ClipboardCheck, text: "Replace your 18-page Food Control Plan diary", detail: "90-second voice checks replace manual paperwork. MPI verifier-ready PDFs generated automatically." },
  { icon: Shield, text: "Stay compliant with Food Act 2014", detail: "Automated temperature logs, corrective actions, and shift checklists — always audit-ready." },
  { icon: Wine, text: "Hit 30-35% gross profit on every menu", detail: "Real-time menu costing with seasonal availability alerts and supplier price tracking." },
  { icon: Users, text: "Staff rostering that actually works", detail: "Availability-aware scheduling, shift swaps, and labour cost forecasting for NZ hospitality." },
];

const STARTER_PROMPTS = [
  "Build a menu with costings for my café",
  "Create a Food Control Plan checklist",
  "Help me roster staff for this weekend",
  "Draft a guest experience strategy",
];

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const AuraMiniChat = () => {
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
        body: { agentId: "hospitality", messages: apiMessages },
      });
      if (error) throw error;
      const reply = data?.content || data?.reply || data?.message || "I'm here to help with your hospitality operations. Try asking about menu costing or food safety.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't connect right now. Try the full chat at /chat/hospitality." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-foreground mb-2">Try AURA now</h2>
          <p className="text-sm text-muted-foreground font-jakarta">Ask AURA anything about your hospitality operations. No signup required.</p>
        </motion.div>

        <motion.div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: `${AURA_COLOR}20`, background: "hsl(var(--card))" }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border" style={{ background: `${AURA_COLOR}08` }}>
            <AgentAvatar agentId="hospitality" color={AURA_COLOR} size={32} />
            <div>
              <p className="text-sm font-syne font-bold text-foreground">AURA</p>
              <p className="text-[10px] text-muted-foreground font-mono">Hospitality Operations AI · Online</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: AURA_COLOR }} />
          </div>

          <div ref={scrollRef} className="h-[340px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${AURA_COLOR}15` }}>
                    <Bot size={14} style={{ color: AURA_COLOR }} />
                  </div>
                  <div className="rounded-xl rounded-tl-sm px-4 py-3 text-sm font-jakarta text-foreground bg-muted/50 max-w-[85%]">
                    Kia ora! I'm AURA, your hospitality operations partner. I can help with menu costing, food safety compliance, staff rostering, guest experience — everything your café, restaurant, hotel, or bar needs. What are you working on?
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-10">
                  {STARTER_PROMPTS.map((p) => (
                    <button key={p} onClick={() => sendMessage(p)} className="text-xs font-jakarta px-3 py-1.5 rounded-full border transition-all hover:scale-105" style={{ borderColor: `${AURA_COLOR}30`, color: AURA_COLOR, background: `${AURA_COLOR}08` }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${AURA_COLOR}15` }}>
                    <Bot size={14} style={{ color: AURA_COLOR }} />
                  </div>
                )}
                <div className={`rounded-xl px-4 py-3 text-sm font-jakarta max-w-[85%] whitespace-pre-wrap ${m.role === "user" ? "rounded-tr-sm text-primary-foreground" : "rounded-tl-sm text-foreground bg-muted/50"}`} style={m.role === "user" ? { background: AURA_COLOR, color: "#0A0A14" } : undefined}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${AURA_COLOR}15` }}>
                  <Bot size={14} style={{ color: AURA_COLOR }} />
                </div>
                <div className="rounded-xl rounded-tl-sm px-4 py-3 bg-muted/50">
                  <Loader2 size={16} className="animate-spin" style={{ color: AURA_COLOR }} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2 p-3 border-t border-border">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about menus, food safety, rostering..." className="flex-1 bg-transparent text-sm font-jakarta text-foreground placeholder:text-muted-foreground outline-none px-3 py-2 rounded-lg border border-border" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30" style={{ background: AURA_COLOR, color: "#0A0A14" }}>
              <Send size={16} />
            </button>
          </form>

          <div className="px-4 py-2 border-t border-border text-center">
            <Link to="/chat/hospitality" className="text-xs font-jakarta hover:underline" style={{ color: AURA_COLOR }}>Open full AURA experience →</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const AuraLandingPage = () => {
  const navigate = useNavigate();
  const [showVoice, setShowVoice] = useState(false);

  const handleVoiceHandoff = useCallback((transcript: { role: "user" | "agent"; text: string }[]) => {
    if (transcript.length === 0) return;
    const handoffKey = `voice-handoff-${Date.now()}`;
    sessionStorage.setItem(handoffKey, JSON.stringify({ agentId: "hospitality", transcript }));
    setShowVoice(false);
    navigate(`/chat/hospitality?voiceHandoff=${encodeURIComponent(handoffKey)}`);
  }, [navigate]);

  useEffect(() => {
    document.title = "AURA — Hospitality Operations AI for NZ Cafés, Restaurants & Hotels | Assembl";
    const setMeta = (prop: string, content: string, attr = "property") => {
      let el = document.querySelector(`meta[${attr}="${prop}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("og:title", "AURA — Hospitality Operations AI for NZ");
    setMeta("og:description", "Menu costing, food safety compliance, staff rostering, and guest CRM — purpose-built for NZ hospitality.");
    setMeta("og:url", "https://assembl.co.nz/aura");
    setMeta("description", "AURA replaces your 18-page Food Control Plan diary with a 90-second voice check. Menu costing, staff rostering, food safety, and guest CRM for NZ hospitality.", "name");
    return () => { document.title = "Assembl | Business Intelligence Platform for NZ | 42 Specialist Tools"; };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrandNav />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${AURA_COLOR} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: AURA_COLOR }} />
              <AgentAvatar agentId="hospitality" color={AURA_COLOR} size={120} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider mb-6" style={{ background: `${AURA_COLOR}15`, color: AURA_COLOR, border: `1px solid ${AURA_COLOR}30` }}>
              <UtensilsCrossed size={14} />
              NZ Hospitality Operations
            </div>
          </motion.div>

          <motion.h1 className="font-syne font-black text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <span className="text-foreground">Your kitchen's</span><br />
            <span style={{ color: AURA_COLOR, textShadow: `0 0 40px ${AURA_COLOR}30` }}>AI operations partner</span>
          </motion.h1>

          <motion.p className="text-lg sm:text-xl text-muted-foreground font-jakarta max-w-2xl mx-auto mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Menu costing, food safety compliance, staff rostering, and guest CRM — purpose-built for NZ cafés, restaurants, hotels, and bars.
          </motion.p>

          <motion.div className="flex flex-wrap gap-3 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <a href="#try-aura" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-syne font-bold transition-all duration-300 hover:scale-105" style={{ background: AURA_COLOR, color: "#0A0A14", boxShadow: `0 0 30px ${AURA_COLOR}30` }}>
              Try AURA Free <ArrowRight size={18} />
            </a>
            <button onClick={() => setShowVoice(true)} className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-base font-syne font-bold border transition-all duration-300 hover:scale-105" style={{ borderColor: `${AURA_COLOR}30`, color: AURA_COLOR, background: `${AURA_COLOR}08` }}>
              <Mic size={16} /> Talk to AURA
            </button>
          </motion.div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-center mb-3 text-foreground">Built for NZ hospitality</h2>
          <p className="text-center text-muted-foreground text-sm mb-10 font-jakarta max-w-xl mx-auto">
            Grounded in the Food Act 2014, Sale and Supply of Alcohol Act 2012, and NZ employment law.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALUE_PROPS.map((item, i) => (
              <motion.div key={item.text} className="rounded-xl border border-border bg-card p-5" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${AURA_COLOR}12` }}>
                    <item.icon size={20} style={{ color: AURA_COLOR }} />
                  </div>
                  <div>
                    <p className="text-sm font-syne font-bold text-foreground mb-1">{item.text}</p>
                    <p className="text-xs text-muted-foreground font-jakarta leading-relaxed">{item.detail}</p>
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
              { stat: "90s", label: "Voice check replaces 18-page diary" },
              { stat: "35%", label: "Target gross profit on every menu" },
              { stat: "100%", label: "Food Act 2014 compliance-ready" },
            ].map((s, i) => (
              <motion.div key={s.label} className="rounded-xl border border-border bg-card p-6 text-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-3xl sm:text-4xl font-syne font-black mb-2" style={{ color: AURA_COLOR }}>{s.stat}</p>
                <p className="text-xs text-muted-foreground font-jakarta">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FULL FEATURE LIST */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-center mb-3 text-foreground">Everything your venue needs</h2>
          <p className="text-center text-muted-foreground text-sm mb-10 font-jakarta">From front-of-house to back-of-house, AURA covers it all.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map((s, i) => (
              <motion.div key={s} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4" initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: AURA_COLOR }} />
                <span className="text-sm font-jakarta text-foreground">{s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRY AURA */}
      <div id="try-aura">
        <AuraMiniChat />
      </div>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-syne font-black text-3xl sm:text-4xl text-foreground mb-4">Run your venue smarter, not harder.</h2>
          <p className="text-muted-foreground text-sm font-jakarta mb-8 max-w-lg mx-auto">
            AURA is free to try — no signup required. Ask about menus, food safety, rostering, or anything else your venue needs.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/chat/hospitality" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-syne font-bold transition-all duration-300 hover:scale-105" style={{ background: AURA_COLOR, color: "#0A0A14", boxShadow: `0 0 30px ${AURA_COLOR}30` }}>
              Open Full AURA <ArrowRight size={18} />
            </Link>
            <button onClick={() => setShowVoice(true)} className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-base font-syne font-bold border transition-all duration-300 hover:scale-105" style={{ borderColor: `${AURA_COLOR}30`, color: AURA_COLOR, background: `${AURA_COLOR}08` }}>
              <Mic size={16} /> Talk to AURA
            </button>
          </div>
        </div>
      </section>

      <BrandFooter />

      <VoiceAgentModal
        open={showVoice}
        onClose={() => setShowVoice(false)}
        agentId="hospitality"
        agentName="AURA"
        agentColor={AURA_COLOR}
        elevenLabsAgentId={getElevenLabsAgentId("hospitality")}
        onHandoffToChat={handleVoiceHandoff}
      />
    </div>
  );
};

export default AuraLandingPage;
