/**
 * KeteBrainChat — Unified chat widget for each kete "brain" agent.
 * Features: Gemini 3 Pro streaming, live voice (Gemini Live), NZ accent,
 * custom 3D avatar, SMS/WhatsApp connection buttons.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";
import GlowIcon from "./GlowIcon";
import VoiceAgentModal from "./VoiceAgentModal";
import MemoryPanel from "./MemoryPanel";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";
import { enforceAssemblProtocol } from "@/lib/compliancePipeline";
import { useAgentContext } from "@/hooks/useAgentContext";
import { compressAndLearn } from "@/lib/contextCompression";
import toroaMark from "@/assets/brand/toroa-mark.svg";

interface KeteBrainChatProps {
  keteId: string;
  keteName: string;
  keteNameEn: string;
  accentColor: string;
  agentId?: string;
}

type Msg = { role: "user" | "assistant"; content: string };

const NZ_SYSTEM = `IMPORTANT VOICE STYLE: You speak with a natural New Zealand English accent and manner. Use Kiwi phrases naturally: "no worries", "sweet as", "good on ya". Start with the plain answer, then add backing detail. Use te reo Māori greetings naturally (kia ora, ka pai, tēnā koe). Be warm, down-to-earth, and approachable — like a trusted Kiwi colleague.`;

const hexRgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
};

// 3D Avatar SVG for each kete brain
function BrainAvatar({ color, size = 48 }: { color: string; size?: number }) {
  const c2 = `${color}cc`;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full animate-pulse" style={{
        background: `radial-gradient(circle, ${hexRgba(color, 0.3)}, transparent 70%)`,
        filter: "blur(8px)",
      }} />
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs>
          <radialGradient id="ba-rg" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id="ba-hi" cx="35%" cy="30%" r="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id="ba-glow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Outer ring */}
        <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
        <circle cx="24" cy="24" r="16" stroke={color} strokeWidth="0.8" strokeOpacity="0.15" fill="none" />
        {/* Brain core */}
        <circle cx="24" cy="20" r="8" fill="url(#ba-rg)" filter="url(#ba-glow)" />
        <circle cx="24" cy="20" r="8" fill="url(#ba-hi)" />
        {/* Neural connections */}
        <line x1="24" y1="28" x2="16" y2="36" stroke={color} strokeWidth="1.2" strokeOpacity="0.5" />
        <line x1="24" y1="28" x2="32" y2="36" stroke={color} strokeWidth="1.2" strokeOpacity="0.5" />
        <line x1="24" y1="28" x2="24" y2="38" stroke={color} strokeWidth="1.2" strokeOpacity="0.4" />
        {/* Neural nodes */}
        <circle cx="16" cy="36" r="3" fill="url(#ba-rg)" opacity="0.6" />
        <circle cx="32" cy="36" r="3" fill="url(#ba-rg)" opacity="0.5" />
        <circle cx="24" cy="38" r="2.5" fill="url(#ba-rg)" opacity="0.4" />
        {/* Sparkle */}
        <circle cx="20" cy="17" r="1.2" fill="white" opacity="0.7" />
      </svg>
    </div>
  );
}

export default function KeteBrainChat({ keteId, keteName, keteNameEn, accentColor, agentId }: KeteBrainChatProps) {
  const [open, setOpen] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [tab, setTab] = useState<"chat" | "sms" | "whatsapp">("chat");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [contextLoaded, setContextLoaded] = useState(false);
  const [contextInjection, setContextInjection] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();
  const effectiveAgentId = agentId || keteId;
  const { loadContext } = useAgentContext(user?.id, effectiveAgentId);

  // Load previous conversation on mount
  useEffect(() => {
    if (!user) { setLoaded(true); return; }
    let active = true;
    (async () => {
      try {
        const { data } = await supabase
          .from("conversations")
          .select("id, messages")
          .eq("user_id", user.id)
          .eq("agent_id", effectiveAgentId)
          .order("updated_at", { ascending: false })
          .limit(1);
        if (!active) return;
        if (data && data.length > 0) {
          const conv = data[0] as any;
          setConversationId(conv.id);
          if (Array.isArray(conv.messages) && conv.messages.length > 0) {
            setMessages(conv.messages as Msg[]);
          }
        }
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => { active = false; };
  }, [user, effectiveAgentId]);

  // Save conversation when messages change
  useEffect(() => {
    if (!user || !loaded || messages.length === 0) return;
    const save = async () => {
      if (conversationId) {
        await supabase.from("conversations").update({
          messages: messages as any,
          updated_at: new Date().toISOString(),
        }).eq("id", conversationId);
      } else {
        const { data } = await supabase.from("conversations").insert({
          user_id: user.id,
          agent_id: effectiveAgentId,
          messages: messages as any,
        }).select("id").single();
        if (data) setConversationId((data as any).id);
      }
    };
    save();
  }, [messages, user, effectiveAgentId, conversationId, loaded]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: text,
          packId: keteId,
          agentId: agentId || keteId,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              assistantSoFar += c;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {}
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Chat failed");
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, keteId, agentId]);


  return (
    <>
      {/* Voice Modal */}
      <VoiceAgentModal
        open={showVoice}
        onClose={() => setShowVoice(false)}
        agentId={effectiveAgentId}
        agentName={keteName}
        agentColor={accentColor}
        elevenLabsAgentId={getElevenLabsAgentId(effectiveAgentId)}
        onHandoffToChat={(voiceTranscript) => {
          const converted = voiceTranscript.map(t => ({
            role: t.role === "user" ? "user" as const : "assistant" as const,
            content: t.text,
          }));
          setMessages(prev => [...prev, ...converted]);
        }}
      />

      {/* FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: open
            ? `radial-gradient(circle, ${accentColor}, ${hexRgba(accentColor, 0.8)})`
            : "linear-gradient(135deg, rgba(15,15,26,0.95), rgba(15,15,26,0.8))",
          border: `2px solid ${open ? accentColor : hexRgba(accentColor, 0.3)}`,
          boxShadow: `0 0 ${open ? 30 : 12}px ${hexRgba(accentColor, open ? 0.4 : 0.15)}, 0 4px 24px rgba(0,0,0,0.5)`,
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {open ? (
          <GlowIcon name="X" size={20} color={open ? "#09090F" : accentColor} glow={false} />
        ) : keteId === "toroa" ? (
          <img src={toroaMark} alt="Tōro" className="w-8 h-8 rounded-full" />
        ) : (
          <GlowIcon name="Brain" size={22} color={accentColor} />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden border flex flex-col"
            style={{
              background: "rgba(9,9,15,0.95)",
              backdropFilter: "blur(24px)",
              borderColor: hexRgba(accentColor, 0.2),
              boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 60px ${hexRgba(accentColor, 0.08)}`,
              maxHeight: "70vh",
            }}
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {keteId === "toroa" ? (
                <img src={toroaMark} alt="Tōro" className="w-10 h-10 rounded-full" />
              ) : (
                <BrainAvatar color={accentColor} size={40} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-light uppercase tracking-[2px]" style={{ fontFamily: "Lato, sans-serif" }}>
                  {keteName}
                </p>
                <p className="text-white/40 text-[10px]">{keteNameEn} Intelligence • NZ Voice</p>
              </div>
              <button
                onClick={() => setShowVoice(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: hexRgba(accentColor, 0.15), border: `1px solid ${hexRgba(accentColor, 0.3)}` }}
                title="Start Kiwi voice chat"
              >
                <GlowIcon name="Mic" size={14} color={accentColor} />
              </button>
            </div>

            {/* Channel tabs */}
            <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {(["chat", "sms", "whatsapp"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] uppercase tracking-wider transition-all ${
                    tab === t ? "text-white" : "text-white/30"
                  }`}
                  style={tab === t ? { borderBottom: `2px solid ${accentColor}` } : {}}
                >
                  <GlowIcon
                    name={t === "chat" ? "MessageSquare" : t === "sms" ? "Phone" : "Send"}
                    size={12}
                    color={tab === t ? accentColor : "#666"}
                    glow={false}
                  />
                  {t === "whatsapp" ? "WhatsApp" : t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Chat content */}
            {tab === "chat" && (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 120 }}>
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <BrainAvatar color={accentColor} size={56} />
                      <p className="text-white/50 text-xs mt-3">Kia ora! I'm the {keteName} specialist.</p>
                      <p className="text-white/30 text-[10px] mt-1">Ask me anything about {keteNameEn.toLowerCase()}.</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "rounded-2xl rounded-br-md text-white"
                            : "rounded-2xl rounded-bl-md text-white/80"
                        }`}
                        style={{
                          background: m.role === "user"
                            ? hexRgba(accentColor, 0.2)
                            : "rgba(255,255,255,0.03)",
                          border: `1px solid ${m.role === "user" ? hexRgba(accentColor, 0.3) : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        {m.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-1 [&_p]:text-sm">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        ) : (
                          m.content
                        )}
                      </div>
                    </div>
                  ))}
                  {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex justify-start">
                      <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: accentColor, animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: accentColor, animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: accentColor, animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="shrink-0 p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white text-sm focus:outline-none placeholder:text-white/20"
                      placeholder={`Ask ${keteName}...`}
                      disabled={isStreaming}
                      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                    />
                    <button
                      type="submit"
                      disabled={isStreaming || !input.trim()}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: input.trim() ? accentColor : "rgba(255,255,255,0.05)",
                        opacity: input.trim() ? 1 : 0.3,
                      }}
                    >
                      <GlowIcon name="Send" size={14} color={input.trim() ? "#09090F" : "#666"} glow={false} />
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* SMS Tab */}
            {tab === "sms" && (
              <div className="p-6 text-center">
                <GlowIcon name="Phone" size={32} color={accentColor} className="mx-auto mb-3" />
                <p className="text-white text-sm font-medium">Text your {keteName} team</p>
                <p className="text-white/40 text-xs mt-1 mb-4">
                  Send a text message and the right agent answers instantly
                </p>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-3">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Example</p>
                  <p className="text-white/60 text-xs italic">"What are my obligations for working at height?"</p>
                  <p className="text-xs mt-1" style={{ color: accentColor }}>→ Routed to specialist agent</p>
                </div>
                <button
                  onClick={() => toast.info("SMS setup — configure in Settings")}
                  className="w-full py-2.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: hexRgba(accentColor, 0.15), color: accentColor, border: `1px solid ${hexRgba(accentColor, 0.3)}` }}
                >
                  Set up SMS Access
                </button>
              </div>
            )}

            {/* WhatsApp Tab */}
            {tab === "whatsapp" && (
              <div className="p-6 text-center">
                <GlowIcon name="Send" size={32} color="#25D366" className="mx-auto mb-3" />
                <p className="text-white text-sm font-medium">WhatsApp your {keteName} team</p>
                <p className="text-white/40 text-xs mt-1 mb-4">
                  Share photos, voice messages, and documents with your agents
                </p>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-3">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Capabilities</p>
                  <div className="space-y-1.5 text-xs text-white/50 text-left">
                    <p>📸 Photo → Agent analyses and responds</p>
                    <p>🎤 Voice → Transcribed and routed</p>
                    <p>📄 Document → Extracted and processed</p>
                  </div>
                </div>
                <button
                  onClick={() => toast.info("WhatsApp Business setup — configure in Settings")}
                  className="w-full py-2.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: "rgba(37,211,102,0.15)", color: "#25D366", border: "1px solid rgba(37,211,102,0.3)" }}
                >
                  Connect WhatsApp Business
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
