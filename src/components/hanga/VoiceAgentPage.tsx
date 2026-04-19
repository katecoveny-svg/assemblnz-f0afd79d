import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Volume2, Layers, Radio, ChevronRight } from "lucide-react";
import GeminiLiveVoice from "@/components/GeminiLiveVoice";
import type { GeminiLiveVoiceHandle } from "@/components/GeminiLiveVoice";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";

type VoiceStatus = "ready" | "listening" | "processing" | "speaking";

const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/[0.06] backdrop-blur-xl ${className}`} style={{
    background: "linear-gradient(135deg, hsl(var(--card) / 0.85), hsl(var(--card) / 0.65))",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  }}>{children}</div>
);

const STATUS_CONFIG: Record<VoiceStatus, { label: string; color: string; labelMi: string }> = {
  ready: { label: "Ready", color: POUNAMU, labelMi: "Kua rite" },
  listening: { label: "Listening...", color: "#E44D4D", labelMi: "E whakarongo ana..." },
  processing: { label: "Processing...", color: KOWHAI, labelMi: "E mahi ana..." },
  speaking: { label: "Speaking...", color: "#1A3A5C", labelMi: "E kōrero ana..." },
};

interface TranscriptEntry { role: "user" | "agent"; text: string; time: string }

const prompts = [
  "Report a hazard on Level 4",
  "Check site safety status",
  "Generate a toolbox talk for scaffold safety",
  "How many workers are on site?",
  "What's the status of payment claim PC-012?",
];

export default function VoiceAgentPage() {
  const [useLive, setUseLive] = useState(true);
  const [status, setStatus] = useState<VoiceStatus>("ready");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    { role: "agent", text: "Kia ora! I'm ĀRAI, your safety intelligence agent. How can I help you today?", time: "09:00" },
  ]);
  const liveRef = useRef<GeminiLiveVoiceHandle>(null);

  const toggleListening = () => {
    if (status === "ready") {
      setStatus("listening");
      setTimeout(() => {
        setTranscript(t => [...t, { role: "user", text: "What hazards are currently open on Level 4?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
        setStatus("processing");
        setTimeout(() => {
          setTranscript(t => [...t, { role: "agent", text: "There is 1 open hazard on Level 4: HAZ-001 — Scaffold edge protection gap on the north face, rated CRITICAL. It's assigned to M. Henare and was reported today. I recommend an immediate inspection before any work continues in that zone.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
          setStatus("speaking");
          setTimeout(() => setStatus("ready"), 3000);
        }, 1500);
      }, 2500);
    } else {
      setStatus("ready");
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (useLive) {
      // Send prompt text to Gemini Live session
      liveRef.current?.sendTextPrompt(prompt);
    } else {
      // Demo mode — simulate interaction
      setTranscript(t => [...t, { role: "user", text: prompt, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      setStatus("processing");
      setTimeout(() => {
        setTranscript(t => [...t, { role: "agent", text: `Processing your request: "${prompt}". In a live session, ĀRAI would provide a real-time response powered by Gemini Live.`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
        setStatus("speaking");
        setTimeout(() => setStatus("ready"), 2000);
      }, 1500);
    }
  };

  const sc = STATUS_CONFIG[status];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-display font-light text-foreground tracking-[0.1em] uppercase flex items-center gap-2">
          <Mic size={22} className="text-kowhai" /> Voice Agent — Reo
        </h1>
        <p className="text-xs text-muted-foreground">Hands-free construction intelligence · NZ accent</p>
      </motion.div>

      {/* Agent indicator */}
      <Glass className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pounamu/15">
          <Layers size={16} className="text-pounamu" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-foreground/70">Connected to <span className="text-pounamu font-medium">ĀRAI Safety Intelligence</span></div>
          <div className="text-[10px] text-muted-foreground">Powered by IHO — Te Iho · Kiwi Voice</div>
        </div>
        <button
          onClick={() => setUseLive(!useLive)}
          className="text-[9px] px-2 py-1 rounded-full border transition-all"
          style={{ borderColor: `${useLive ? POUNAMU : KOWHAI}50`, color: useLive ? POUNAMU : KOWHAI }}
        >
          {useLive ? "Gemini Live" : "Demo Mode"}
        </button>
      </Glass>

      {useLive ? (
        <GeminiLiveVoice
          ref={liveRef}
          agentId="construction"
          agentName="ĀRAI"
          agentColor={POUNAMU}
        />
      ) : (
        <>
          {/* Demo mic button */}
          <div className="flex flex-col items-center py-8">
            <motion.button
              onClick={toggleListening}
              className="relative w-32 h-32 rounded-full flex items-center justify-center"
              style={{ background: `${sc.color}20`, border: `2px solid ${sc.color}50` }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status === "listening" && (
                <motion.div className="absolute inset-0 rounded-full" style={{ border: `2px solid ${sc.color}` }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} />
              )}
              {status === "listening" ? <MicOff size={40} style={{ color: sc.color }} /> :
                status === "speaking" ? <Volume2 size={40} style={{ color: sc.color }} /> :
                status === "processing" ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Layers size={40} style={{ color: sc.color }} /></motion.div> :
                <Mic size={40} style={{ color: sc.color }} />}
            </motion.button>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: sc.color }} />
              <span className="text-sm" style={{ color: sc.color }}>{sc.label}</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">{sc.labelMi}</span>
          </div>

          {/* Demo Transcript */}
          <Glass className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Transcript</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transcript.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: t.role === "user" ? 10 : -10 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${t.role === "user" ? "text-foreground" : "text-foreground/70"}`} style={{
                    background: t.role === "user" ? `${KOWHAI}20` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${t.role === "user" ? `${KOWHAI}30` : "rgba(255,255,255,0.06)"}`,
                    borderRadius: t.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  }}>
                    {t.text}
                    <div className="text-[9px] text-muted-foreground mt-1">{t.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Glass>
        </>
      )}

      {/* Quick prompts */}
      <Glass className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Prompts</h3>
        <div className="space-y-2">
          {prompts.map(p => (
            <button
              key={p}
              onClick={() => handlePromptClick(p)}
              className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs text-foreground/50 hover:text-foreground/80 hover:bg-white/[0.03] transition-all"
            >
              <Radio size={12} className="text-kowhai shrink-0" />
              {p}
              <ChevronRight size={12} className="ml-auto text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </Glass>
    </div>
  );
}
