import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, CheckCircle2, Clock, Users, Ban, Shield, FileText, Share2, Send, Bot, Loader2 } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { supabase } from "@/integrations/supabase/client";

const TURF_COLOR = "#00E676";
const DEADLINE = new Date("2026-04-05T00:00:00+12:00");

const SECTIONS = [
  "Purpose and objects (sport-specific for 18+ codes)",
  "Officer duties (good faith, care, diligence)",
  "Conflict of interest policy",
  "Dispute resolution procedure",
  "Financial reporting framework",
  "Membership provisions",
  "Meeting procedures",
  "Winding up provisions",
  "Committee composition and election",
  "Powers of the society",
  "Application of funds",
  "Common seal provisions",
  "Alteration of rules",
  "Record keeping requirements",
];

const CONSEQUENCES = [
  { icon: Ban, text: "Your club ceases to exist" },
  { icon: Shield, text: "Bank accounts frozen" },
  { icon: FileText, text: "Insurance voided" },
  { icon: AlertTriangle, text: "Facility leases cancelled" },
];

const STARTER_PROMPTS = [
  "Generate a constitution for my rugby club",
  "What does the Incorporated Societies Act 2022 require?",
  "Help me re-register my netball club",
  "Draft a gaming trust grant application",
];

const useCountdown = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, DEADLINE.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: diff <= 0 };
};

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span
      className="text-4xl sm:text-6xl lg:text-7xl font-syne font-black tabular-nums"
      style={{ color: TURF_COLOR, textShadow: `0 0 30px ${TURF_COLOR}50` }}
    >
      {String(value).padStart(2, "0")}
    </span>
    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
      {label}
    </span>
  </div>
);

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const TurfMiniChat = () => {
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
        body: { agentId: "sports-recreation", messages: apiMessages },
      });
      if (error) throw error;
      const reply = data?.reply || data?.message || "I'm here to help with your club's re-registration. Try asking about constitution generation.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't connect right now. Try the full chat at /chat/sports-recreation." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-foreground mb-2">
            Try TURF now
          </h2>
          <p className="text-sm text-muted-foreground font-jakarta">
            Ask TURF anything about your club's re-registration. No signup required.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: `${TURF_COLOR}20`, background: "hsl(var(--card))" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {/* Chat header */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b border-border"
            style={{ background: `${TURF_COLOR}08` }}
          >
            <AgentAvatar agentId="sports" color={TURF_COLOR} size={32} />
            <div>
              <p className="text-sm font-syne font-bold text-foreground">TURF</p>
              <p className="text-[10px] text-muted-foreground font-mono">Sports Operations AI · Online</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: TURF_COLOR }} />
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="h-[340px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${TURF_COLOR}15` }}>
                    <Bot size={14} style={{ color: TURF_COLOR }} />
                  </div>
                  <div className="rounded-xl rounded-tl-sm px-4 py-3 text-sm font-jakarta text-foreground bg-muted/50 max-w-[85%]">
                    Kia ora! I'm TURF, your sports club AI. The Incorporated Societies Act 2022 deadline is fast approaching — <strong>5 April 2026</strong>. I can generate a fully compliant constitution for your club in minutes. What sport does your club play?
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-10">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="text-xs font-jakarta px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                      style={{ borderColor: `${TURF_COLOR}30`, color: TURF_COLOR, background: `${TURF_COLOR}08` }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${TURF_COLOR}15` }}>
                    <Bot size={14} style={{ color: TURF_COLOR }} />
                  </div>
                )}
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-jakarta max-w-[85%] whitespace-pre-wrap ${
                    m.role === "user"
                      ? "rounded-tr-sm text-primary-foreground"
                      : "rounded-tl-sm text-foreground bg-muted/50"
                  }`}
                  style={m.role === "user" ? { background: TURF_COLOR, color: "#0A0A14" } : undefined}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${TURF_COLOR}15` }}>
                  <Bot size={14} style={{ color: TURF_COLOR }} />
                </div>
                <div className="rounded-xl rounded-tl-sm px-4 py-3 bg-muted/50">
                  <Loader2 size={16} className="animate-spin" style={{ color: TURF_COLOR }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2 p-3 border-t border-border"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your club's re-registration..."
              className="flex-1 bg-transparent text-sm font-jakarta text-foreground placeholder:text-muted-foreground outline-none px-3 py-2 rounded-lg border border-border focus:border-[--turf]"
              style={{ "--turf": TURF_COLOR } as React.CSSProperties}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: TURF_COLOR, color: "#0A0A14" }}
            >
              <Send size={16} />
            </button>
          </form>

          {/* Full experience link */}
          <div className="px-4 py-2 border-t border-border text-center">
            <Link
              to="/chat/sports-recreation"
              className="text-xs font-jakarta hover:underline"
              style={{ color: TURF_COLOR }}
            >
              Open full TURF experience →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const TurfDeadlinePage = () => {
  const countdown = useCountdown();

  const shareText = `🚨 5 April 2026: Thousands of NZ sports clubs will be automatically dissolved under the Incorporated Societies Act 2022.\n\nTURF generates a fully compliant constitution in minutes — free.\n\nTry it: assembl.co.nz/turf-5-april-2026\n\n#IncorporatedSocietiesAct #NZSport #SaveOurClubs`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "TURF — Save Your Club Before 5 April 2026", text: shareText, url: "https://assembl.co.nz/turf-5-april-2026" });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  // Set page-specific meta tags
  useEffect(() => {
    document.title = "5 April 2026 — Your Club Will Be Dissolved | TURF by Assembl";
    const setMeta = (prop: string, content: string, attr = "property") => {
      let el = document.querySelector(`meta[${attr}="${prop}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("og:title", "5 April 2026 — Your NZ Sports Club Will Be Dissolved");
    setMeta("og:description", "The Incorporated Societies Act 2022 requires every club to re-register. TURF generates a compliant constitution in minutes — free.");
    setMeta("og:url", "https://assembl.co.nz/turf-5-april-2026");
    setMeta("og:type", "website");
    setMeta("twitter:title", "5 April 2026 — Your NZ Sports Club Will Be Dissolved", "name");
    setMeta("twitter:description", "TURF generates a fully compliant constitution for your club in minutes. Free. No signup required.", "name");
    setMeta("description", "Thousands of NZ sports clubs face dissolution on 5 April 2026. TURF generates a compliant constitution in minutes — free.", "name");

    return () => {
      document.title = "Assembl — 42 AI Agents That Operate Your NZ Business";
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BrandNav />

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(${TURF_COLOR} 1px, transparent 1px)`, backgroundSize: "32px 32px" }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-20"
                style={{ background: TURF_COLOR }}
              />
              <AgentAvatar agentId="sports" color={TURF_COLOR} size={120} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider mb-6"
              style={{ background: `${TURF_COLOR}15`, color: TURF_COLOR, border: `1px solid ${TURF_COLOR}30` }}
            >
              <AlertTriangle size={14} />
              Urgent — Incorporated Societies Act 2022
            </div>
          </motion.div>

          <motion.h1
            className="font-syne font-black text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-foreground">Your club has until</span>
            <br />
            <span style={{ color: TURF_COLOR, textShadow: `0 0 40px ${TURF_COLOR}30` }}>
              5 April 2026
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground font-jakarta max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            That's when thousands of NZ sports clubs will be{" "}
            <span className="text-destructive font-semibold">automatically dissolved</span>.
            No exceptions. No extensions.
          </motion.p>

          {/* COUNTDOWN */}
          <motion.div
            className="flex justify-center gap-4 sm:gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CountdownUnit value={countdown.days} label="Days" />
            <span className="text-4xl sm:text-6xl font-syne font-black text-muted-foreground/30 self-start mt-1">:</span>
            <CountdownUnit value={countdown.hours} label="Hours" />
            <span className="text-4xl sm:text-6xl font-syne font-black text-muted-foreground/30 self-start mt-1">:</span>
            <CountdownUnit value={countdown.minutes} label="Min" />
            <span className="text-4xl sm:text-6xl font-syne font-black text-muted-foreground/30 self-start mt-1">:</span>
            <CountdownUnit value={countdown.seconds} label="Sec" />
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <a
              href="#try-turf"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-syne font-bold transition-all duration-300 hover:scale-105"
              style={{ background: TURF_COLOR, color: "#0A0A14", boxShadow: `0 0 30px ${TURF_COLOR}30` }}
            >
              Generate Your Constitution Free <ArrowRight size={18} />
            </a>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-base font-syne font-bold border transition-all duration-300 hover:scale-105"
              style={{ borderColor: `${TURF_COLOR}30`, color: TURF_COLOR, background: `${TURF_COLOR}08` }}
            >
              <Share2 size={16} /> Share With Your Club
            </button>
          </motion.div>
        </div>
      </section>

      {/* CONSEQUENCES */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-center mb-3 text-foreground">
            Miss the deadline and...
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-10 font-jakarta">
            The Incorporated Societies Act 2022 requires every club to re-register with a compliant constitution.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CONSEQUENCES.map((c, i) => (
              <motion.div
                key={c.text}
                className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <c.icon className="mx-auto mb-3 text-destructive" size={28} />
                <p className="text-sm font-syne font-bold text-foreground">{c.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { stat: "50%", label: "Volunteer numbers have halved since 2019" },
              { stat: "18", label: "Average volunteers running a club" },
              { stat: "⅔", label: "Of clubs losing money or breaking even" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="rounded-xl border border-border bg-card p-6 text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-3xl sm:text-4xl font-syne font-black mb-2" style={{ color: TURF_COLOR }}>
                  {s.stat}
                </p>
                <p className="text-xs text-muted-foreground font-jakarta">{s.label}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm font-jakarta max-w-xl mx-auto">
            The Act requires corporate-grade governance documents that most clubs need a lawyer to draft.
            <span className="block mt-2 font-semibold text-foreground">So we built TURF.</span>
          </p>
        </div>
      </section>

      {/* WHAT TURF GENERATES */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-center mb-3 text-foreground">
            A complete constitution in minutes
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-10 font-jakarta">
            Not a template. A complete document tailored to your sport code — from rugby to rowing to bowls.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {SECTIONS.map((s, i) => (
              <motion.div
                key={s}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: TURF_COLOR }} />
                <span className="text-sm font-jakarta text-foreground">{s}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-xs mt-6 font-jakarta">
            Plus grant applications, sponsorship proposals, and AGM documents.
          </p>
        </div>
      </section>

      {/* TRY TURF - EMBEDDED CHAT */}
      <div id="try-turf">
        <TurfMiniChat />
      </div>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock size={20} style={{ color: TURF_COLOR }} />
            <span className="font-syne font-bold text-lg" style={{ color: TURF_COLOR }}>
              {countdown.days} days remaining
            </span>
          </div>
          <h2 className="font-syne font-black text-3xl sm:text-4xl text-foreground mb-4">
            Thousands of clubs at risk. One free tool.
          </h2>
          <p className="text-muted-foreground text-sm font-jakarta mb-8 max-w-lg mx-auto">
            If you know someone on a club committee — share this page. They need to see this before 5 April.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/chat/sports-recreation"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-syne font-bold transition-all duration-300 hover:scale-105"
              style={{ background: TURF_COLOR, color: "#0A0A14", boxShadow: `0 0 30px ${TURF_COLOR}30` }}
            >
              Try TURF Free <ArrowRight size={18} />
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-base font-syne font-bold border transition-all duration-300 hover:scale-105"
              style={{ borderColor: `${TURF_COLOR}30`, color: TURF_COLOR, background: `${TURF_COLOR}08` }}
            >
              <Share2 size={16} /> Tag A Committee Member
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-6 font-mono">
            #IncorporatedSocietiesAct #NZSport #SaveOurClubs #SportNZ #Assembl
          </p>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default TurfDeadlinePage;
