import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, Users, Shield, FileText, Share2, Send, Bot, Loader2, CalendarClock, Lightbulb, HelpCircle } from "lucide-react";
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

const WHY_ACT_NOW = [
  { icon: CalendarClock, text: "Avoid last-minute rush as the deadline nears", detail: "The Registrar expects high volumes — get ahead of the queue." },
  { icon: Shield, text: "Protect your club's assets and insurance", detail: "Re-registration ensures continuous coverage and legal standing." },
  { icon: Users, text: "Show members your committee has it handled", detail: "Confidence in governance keeps volunteers and sponsors engaged." },
  { icon: FileText, text: "Lock in your club's identity and history", detail: "Your club name, registration number and legacy carry forward." },
];

const STARTER_PROMPTS = [
  "Generate a constitution for my rugby club",
  "What does the Incorporated Societies Act 2022 require?",
  "Help me re-register my netball club",
  "Draft a gaming trust grant application",
];

interface ClubDetails {
  clubName: string;
  sport: string;
  region: string;
  memberCount: string;
  committeSize: string;
  hasCharity: string;
  clubPurpose: string;
}

const WIZARD_STEPS = [
  { key: "sport" as const, label: "Sport / activity", placeholder: "e.g. Rugby, Netball, Cricket", question: "What sport or activity does your club operate?" },
  { key: "clubName" as const, label: "Club name", placeholder: "e.g. Tauranga Rugby Club", question: "What is your club's full legal name?" },
  { key: "region" as const, label: "Region", placeholder: "e.g. Bay of Plenty, Auckland", question: "What region is your club based in?" },
  { key: "memberCount" as const, label: "Approx. members", placeholder: "e.g. 120", question: "Approximately how many members does your club have?" },
  { key: "committeSize" as const, label: "Committee size", placeholder: "e.g. 7", question: "How many committee/board members does your club have (or plan to have)?" },
  { key: "hasCharity" as const, label: "Charity status", placeholder: "Yes or No", question: "Is your club registered as a charity (or planning to be)?" },
  { key: "clubPurpose" as const, label: "Club purpose", placeholder: "e.g. Promote rugby in our community", question: "In one sentence, what is your club's main purpose?" },
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
  const [wizardStep, setWizardStep] = useState(0);
  const [clubDetails, setClubDetails] = useState<ClubDetails>({
    clubName: "", sport: "", region: "", memberCount: "", committeSize: "", hasCharity: "", clubPurpose: "",
  });
  const [wizardComplete, setWizardComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, wizardStep]);

  const sendToTurf = async (prompt: string, history: ChatMsg[]) => {
    setLoading(true);
    try {
      const apiMessages = [...history, { role: "user" as const, content: prompt }].map((m) => ({ role: m.role, content: m.content }));
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { agentId: "sports", messages: apiMessages },
      });
      if (error) throw error;
      if (data?.error) {
        const isAuth = typeof data.error === "string" && data.error.toLowerCase().includes("unauthorized");
        return isAuth ? "You'll need to sign in to generate your constitution. Create a free account and head to /chat/sports!" : data.error;
      }
      return data?.content || "Sorry, I didn't get a response. Try the full chat at /chat/sports.";
    } catch {
      return "Sorry, I couldn't connect right now. Try the full chat at /chat/sports.";
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStart = (sportName: string) => {
    if (loading) return;
    const updated = { ...clubDetails, sport: sportName };
    setClubDetails(updated);
    setMessages([
      { role: "user", content: `${sportName} club` },
      { role: "assistant", content: `✅ Great — a ${sportName} club! What is your club's full legal name?` },
    ]);
    setWizardStep(1);
  };

  const handleWizardAnswer = async (answer: string) => {
    if (!answer.trim() || loading) return;
    const step = WIZARD_STEPS[wizardStep];
    const updated = { ...clubDetails, [step.key]: answer.trim() };
    setClubDetails(updated);
    setInput("");

    // Add user answer as a message
    const userMsg: ChatMsg = { role: "user", content: answer.trim() };
    setMessages((prev) => [...prev, userMsg]);

    if (wizardStep < WIZARD_STEPS.length - 1) {
      // Move to next step — show next question
      const nextStep = wizardStep + 1;
      setWizardStep(nextStep);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", content: `✅ Got it. ${WIZARD_STEPS[nextStep].question}` }]);
      }, 300);
    } else {
      // All details collected — generate constitution
      setWizardComplete(true);
      setMessages((prev) => [...prev, { role: "assistant", content: "✅ Perfect — I have everything I need. Generating your compliant constitution now..." }]);

      const prompt = `Generate a fully compliant constitution under the Incorporated Societies Act 2022 for the following club:

- Club Name: ${updated.clubName}
- Sport/Activity: ${updated.sport}
- Region: ${updated.region}
- Approximate Members: ${updated.memberCount}
- Committee/Board Size: ${updated.committeSize}
- Charity Status: ${updated.hasCharity}
- Club Purpose: ${updated.clubPurpose}

Please include all mandatory sections: purpose and objects, officer duties, conflict of interest policy, dispute resolution procedure, financial reporting, membership provisions, meeting procedures, winding up provisions, committee composition and election, powers of the society, application of funds, common seal provisions, alteration of rules, and record keeping requirements. Make it specific to ${updated.sport} in the ${updated.region} region of New Zealand.`;

      const allMsgs = [...messages, userMsg];
      const reply = await sendToTurf(prompt, allMsgs);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    }
  };

  const handleFreeChat = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMsg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    const reply = await sendToTurf(text.trim(), messages);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardComplete) {
      handleFreeChat(input);
    } else {
      handleWizardAnswer(input);
    }
  };

  const currentStep = wizardStep < WIZARD_STEPS.length ? WIZARD_STEPS[wizardStep] : null;

  return (
    <section id="try-turf" className="py-16 border-t border-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-foreground mb-2">
            Generate Your Constitution
          </h2>
          <p className="text-sm text-muted-foreground font-jakarta">
            Answer {WIZARD_STEPS.length} quick questions and TURF will generate a fully compliant constitution for your club.
          </p>
        </motion.div>

        {/* Progress bar */}
        {!wizardComplete && (
          <div className="max-w-md mx-auto mb-4">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
              <span>Step {Math.min(wizardStep + 1, WIZARD_STEPS.length)} of {WIZARD_STEPS.length}</span>
              <span>{Math.round(((wizardStep) / WIZARD_STEPS.length) * 100)}% complete</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(wizardStep / WIZARD_STEPS.length) * 100}%`, background: TURF_COLOR }}
              />
            </div>
          </div>
        )}

        <motion.div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: `${TURF_COLOR}20`, background: "hsl(var(--card))" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 border-b border-border"
            style={{ background: `${TURF_COLOR}08` }}
          >
            <AgentAvatar agentId="sports" color={TURF_COLOR} size={32} />
            <div>
              <p className="text-sm font-syne font-bold text-foreground">TURF</p>
              <p className="text-[10px] text-muted-foreground font-mono">Constitution Generator · Online</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: TURF_COLOR }} />
          </div>

          <div ref={scrollRef} className="h-[400px] overflow-y-auto p-4 space-y-3">
            {/* Initial welcome */}
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${TURF_COLOR}15` }}>
                    <Bot size={14} style={{ color: TURF_COLOR }} />
                  </div>
                  <div className="rounded-xl rounded-tl-sm px-4 py-3 text-sm font-jakarta text-foreground bg-muted/50 max-w-[85%]">
                    Kia ora! 👋 Let's get your club's constitution sorted before <strong>5 April 2026</strong>. I'll ask you {WIZARD_STEPS.length} quick questions, then generate a fully compliant document.
                    <br /><br />
                    <strong>{WIZARD_STEPS[0].question}</strong>
                  </div>
                </div>
                {/* Quick-start buttons for common sports */}
                <div className="flex flex-wrap gap-2 ml-10">
                  {["Rugby", "Netball", "Cricket", "Football"].map((sport) => (
                    <button
                      key={sport}
                      onClick={() => handleQuickStart(sport)}
                      className="text-xs font-jakarta px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                      style={{ borderColor: `${TURF_COLOR}30`, color: TURF_COLOR, background: `${TURF_COLOR}08` }}
                    >
                      {sport} Club
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

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-3 border-t border-border"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentStep && !wizardComplete ? currentStep.placeholder : "Ask a follow-up question..."}
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

          <div className="px-4 py-2 border-t border-border text-center">
            <Link
              to="/chat/sports"
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

  const shareText = `📋 NZ sports clubs: the Incorporated Societies Act 2022 re-registration window closes 5 April 2026.\n\nTURF generates a fully compliant constitution in minutes — free.\n\nCheck it out: assembl.co.nz/turf-5-april-2026\n\n#IncorporatedSocietiesAct #NZSport #ClubReady`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "TURF — Get Your Club Re-Registered Before 5 April 2026", text: shareText, url: "https://assembl.co.nz/turf-5-april-2026" });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  useEffect(() => {
    document.title = "Re-Register Your Club Before 5 April 2026 | TURF by Assembl";
    const setMeta = (prop: string, content: string, attr = "property") => {
      let el = document.querySelector(`meta[${attr}="${prop}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta("og:title", "Re-Register Your NZ Sports Club Before 5 April 2026");
    setMeta("og:description", "The Incorporated Societies Act 2022 requires every club to re-register. TURF generates a compliant constitution in minutes — free.");
    setMeta("og:url", "https://assembl.co.nz/turf-5-april-2026");
    setMeta("og:type", "website");
    setMeta("twitter:title", "Re-Register Your NZ Sports Club Before 5 April 2026", "name");
    setMeta("twitter:description", "TURF generates a fully compliant constitution for your club in minutes. Free. No signup required.", "name");
    setMeta("description", "NZ sports clubs must re-register under the Incorporated Societies Act 2022 by 5 April 2026. TURF generates a compliant constitution in minutes — free.", "name");

    return () => {
      document.title = "Assembl | Business Intelligence Platform for NZ | 42 Specialist Tools";
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
              <CalendarClock size={14} />
              Incorporated Societies Act 2022
            </div>
          </motion.div>

          <motion.h1
            className="font-syne font-black text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-foreground">Re-registration closes</span>
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
            Every NZ incorporated society needs to re-register with a compliant constitution.
            TURF generates yours in minutes — for free.
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

      {/* WHY ACT NOW — replaces fear-based "consequences" */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-syne font-bold text-2xl sm:text-3xl text-center mb-3 text-foreground">
            Why get it done now?
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-10 font-jakarta max-w-xl mx-auto">
            Clubs that haven't re-registered by 5 April 2026 can still apply to restore their registration — but it's simpler, cheaper, and less stressful to do it before the deadline.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {WHY_ACT_NOW.map((item, i) => (
              <motion.div
                key={item.text}
                className="rounded-xl border border-border bg-card p-5"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${TURF_COLOR}12` }}>
                    <item.icon size={20} style={{ color: TURF_COLOR }} />
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

      {/* WHAT HAPPENS IF YOU MISS IT — honest, not scary */}
      <section className="py-16 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <HelpCircle size={20} style={{ color: TURF_COLOR }} className="shrink-0 mt-0.5" />
              <h3 className="font-syne font-bold text-lg text-foreground">What if my club misses the deadline?</h3>
            </div>
            <div className="space-y-3 text-sm font-jakarta text-muted-foreground leading-relaxed ml-8">
              <p>
                If your club doesn't re-register by 5 April 2026, it will be <strong className="text-foreground">removed from the register</strong> — but this doesn't have to be the end. The Act allows societies to apply for <strong className="text-foreground">restoration</strong> within a set period.
              </p>
              <p>
                However, while your club is off the register, things get complicated: you may lose access to bank accounts, insurance coverage could lapse, facility agreements may be affected, and your club can't enter contracts.
              </p>
              <p>
                The restoration process takes time, costs money, and creates uncertainty for your members, sponsors, and community. <strong className="text-foreground">It's far easier to get it done now.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE CHALLENGE */}
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
            The Act requires corporate-grade governance documents — a big ask for volunteer-run committees.
            <span className="block mt-2 font-semibold text-foreground">That's why we built TURF.</span>
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

      {/* TRY TURF */}
      <div id="try-turf">
        <TurfMiniChat />
      </div>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock size={20} style={{ color: TURF_COLOR }} />
            <span className="font-syne font-bold text-lg" style={{ color: TURF_COLOR }}>
              {countdown.days} days until the window closes
            </span>
          </div>
          <h2 className="font-syne font-black text-3xl sm:text-4xl text-foreground mb-4">
            Your club deserves to keep going.
          </h2>
          <p className="text-muted-foreground text-sm font-jakarta mb-8 max-w-lg mx-auto">
            Know someone on a club committee? Share this page — it takes 10 minutes to generate a constitution and they'll thank you for it.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/chat/sports"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-syne font-bold transition-all duration-300 hover:scale-105"
              style={{ background: TURF_COLOR, color: "#0A0A14", boxShadow: `0 0 30px ${TURF_COLOR}30` }}
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-base font-syne font-bold border transition-all duration-300 hover:scale-105"
              style={{ borderColor: `${TURF_COLOR}30`, color: TURF_COLOR, background: `${TURF_COLOR}08` }}
            >
              <Share2 size={16} /> Share With Your Committee
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-6 font-mono">
            #IncorporatedSocietiesAct #NZSport #ClubReady #SportNZ #Assembl
          </p>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default TurfDeadlinePage;
