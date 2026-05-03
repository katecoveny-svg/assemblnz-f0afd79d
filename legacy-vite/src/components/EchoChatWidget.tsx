import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { agentChatStream } from "@/lib/agentChat";
import ReactMarkdown from "react-markdown";
import { Send, X, Minimize2, RotateCcw } from "lucide-react";
import { HERO_KETE_IMAGE, keteFor } from "@/assets/brand/kete";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/* ─── Brand v1.0 tokens (Mist/Cloud/Sand/Taupe + Soft Gold + Forest Ink) ─── */
const ECHO = {
  ink:           "#0F2A26",                    // Forest Ink — never black
  taupe:         "#6F6158",                    // Twilight Taupe (body)
  taupeMuted:    "rgba(111,97,88,0.62)",
  gold:          "#D9BC7A",                    // Soft Gold — official sparkle accent
  goldGlow:      "rgba(217,188,122,0.55)",
  goldHaze:      "rgba(217,188,122,0.18)",
  goldHazeSoft:  "rgba(217,188,122,0.10)",
  border:        "rgba(111,97,88,0.14)",       // brand border-soft
  borderHover:   "rgba(217,188,122,0.40)",
  surface:       "#FFFFFF",
  surfaceMist:   "#F7F3EE",
  shadowSoft:    "0 8px 30px rgba(111,97,88,0.10)",
  shadowSparkle: "0 0 22px rgba(217,188,122,0.45), 0 0 48px rgba(217,188,122,0.18), 0 6px 20px rgba(111,97,88,0.14)",
};

/* Map first URL segment → kete display label so the dock stays context-aware. */
const KETE_LABELS: Record<string, string> = {
  manaaki:  "Manaaki · Hospitality",
  waihanga: "Waihanga · Construction",
  auaha:    "Auaha · Creative",
  arataki:  "Arataki · Automotive & Fleet",
  pikau:    "Pikau · Freight & Customs",
  hoko:     "Hoko · Retail",
  ako:      "Ako · Early Childhood",
  toro:     "Tōro · Family",
  toroa:    "Tōro · Family",
  voyage:   "Voyage · Travel",
  workspace: "Your workspace",
  evidence:  "Evidence pack gallery",
  status:    "Platform status",
};

const EchoChatWidget = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat/") || location.pathname.startsWith("/embed/");
  const firstSeg = location.pathname.split("/").filter(Boolean)[0]?.toLowerCase() || "";
  const keteContext = KETE_LABELS[firstSeg] || null;
  const keteRecord = keteFor(firstSeg);
  const floaterImage = keteRecord?.image ?? HERO_KETE_IMAGE;
  const floaterAlt = keteRecord ? `${keteRecord.industry} kete` : "Assembl kete";

  // When on a kete page, let its accent colour tint Echo's halo.
  // Off-kete (homepage, etc.) we use Soft Gold per Brand v1.0.
  const accentHex = keteRecord?.accentHex ?? ECHO.gold;
  const accentGlow = keteRecord
    ? `${accentHex}99`  // ~60% alpha
    : ECHO.goldGlow;
  const accentHaze = keteRecord
    ? `${accentHex}33`  // ~20% alpha
    : ECHO.goldHaze;
  const sparkleShadow = keteRecord
    ? `0 0 22px ${accentHex}80, 0 0 48px ${accentHex}33, 0 6px 20px rgba(111,97,88,0.14)`
    : ECHO.shadowSparkle;

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const saveAndClearChat = async () => {
    if (messages.length === 0) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("conversations").insert({
          user_id: user.id,
          agent_id: "echo",
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        });
      }
    } catch (e) {
      console.error("Failed to save conversation:", e);
    }
    setMessages([]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (isChatPage) return null;

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: userInput.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    await agentChatStream({
      agentId: "echo",
      message: userInput.trim(),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      onDelta: (text) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + text,
          };
          return updated;
        });
      },
      onDone: () => {
        setIsLoading(false);
        inputRef.current?.focus();
      },
      onError: () => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Having trouble connecting right now. Try again shortly.",
          };
          return updated;
        });
        setIsLoading(false);
        inputRef.current?.focus();
      },
    });
  };

  return (
    <>
      {/* ─── Floating bubble — woven kete portrait with Soft Gold sparkle halo ─── */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 left-6 z-[9999] w-14 h-14 rounded-full overflow-hidden flex items-center justify-center transition-transform hover:scale-110 group"
          style={{
            background: ECHO.surface,
            border: `1px solid ${accentHaze}`,
            boxShadow: sparkleShadow,
          }}
          title={keteRecord ? `Chat with Echo — ${keteRecord.industry}` : "Chat with Echo — Assembl's hero agent"}
        >
          <img
            loading="lazy"
            decoding="async"
            src={floaterImage}
            alt={floaterAlt}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
            style={{ border: `1px solid ${accentGlow}` }}
          />
        </button>
      )}

      {/* ─── Minimized bar ─── */}
      {open && minimized && (
        <div
          className="fixed bottom-6 left-6 z-[9999] flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer"
          style={{
            background: ECHO.surface,
            border: `1px solid ${ECHO.border}`,
            boxShadow: ECHO.shadowSoft,
          }}
          onClick={() => setMinimized(false)}
        >
          <img loading="lazy" decoding="async" src={floaterImage} alt={floaterAlt} className="w-6 h-6 object-cover rounded-full" />
          <span
            className="text-xs font-light tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: ECHO.ink }}
          >
            Echo
          </span>
          {messages.length > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: accentHaze, color: ECHO.taupe }}
            >
              {messages.length} msgs
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); saveAndClearChat(); setOpen(false); }}
            className="ml-1 transition-colors"
            style={{ color: ECHO.taupeMuted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = ECHO.ink)}
            onMouseLeave={(e) => (e.currentTarget.style.color = ECHO.taupeMuted)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ─── Chat window ─── */}
      {open && !minimized && (
        <div
          className="fixed bottom-6 left-6 z-[9999] w-[380px] max-w-[calc(100vw-48px)] rounded-3xl overflow-hidden flex flex-col"
          style={{
            height: "600px",
            maxHeight: "calc(100vh - 100px)",
            background: ECHO.surface,
            border: `1px solid ${ECHO.border}`,
            boxShadow: `${ECHO.shadowSoft}, 0 0 60px ${accentHaze}`,
          }}
        >
          {/* Header */}
          <header
            className="flex items-center gap-2.5 px-4 py-3 shrink-0"
            style={{
              borderBottom: `1px solid ${ECHO.border}`,
              background: `linear-gradient(180deg, ${ECHO.surface} 0%, ${ECHO.surfaceMist} 100%)`,
            }}
          >
            <img
              loading="lazy"
              decoding="async"
              src={floaterImage}
              alt="Echo"
              className="w-8 h-8 object-cover rounded-full shrink-0"
              style={{ border: `1px solid ${accentHaze}` }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-base tracking-wide"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    color: ECHO.ink,
                  }}
                >
                  Echo
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: accentHex, boxShadow: `0 0 6px ${accentHex}` }}
                />
              </div>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: ECHO.taupeMuted, fontFamily: "'Inter', sans-serif" }}
              >
                {keteContext ? <>in <span style={{ color: ECHO.taupe }}>{keteContext}</span></> : "Premium intelligence with a human heart"}
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={saveAndClearChat}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: ECHO.taupe }}
                onMouseEnter={(e) => (e.currentTarget.style.background = accentHaze)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                title="New chat (saves current)"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              onClick={() => setMinimized(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: ECHO.taupe }}
              onMouseEnter={(e) => (e.currentTarget.style.background = accentHaze)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              title="Minimize"
            >
              <Minimize2 size={14} />
            </button>
            <button
              onClick={() => { saveAndClearChat(); setOpen(false); }}
              className="transition-colors"
              style={{ color: ECHO.taupeMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = ECHO.ink)}
              onMouseLeave={(e) => (e.currentTarget.style.color = ECHO.taupeMuted)}
            >
              <X size={16} />
            </button>
          </header>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-4 py-4" style={{ background: ECHO.surface }}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <img
                  loading="lazy"
                  decoding="async"
                  src={floaterImage}
                  alt="Echo"
                  className="w-16 h-16 object-cover rounded-full"
                  style={{
                    border: `1px solid ${accentHaze}`,
                    boxShadow: `0 0 24px ${accentHaze}`,
                  }}
                />
                <div>
                  <p
                    className="text-lg leading-tight"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 400,
                      color: ECHO.ink,
                    }}
                  >
                    Kia ora — I'm Echo.
                  </p>
                  <p
                    className="mt-2 text-[13px] leading-relaxed max-w-[280px]"
                    style={{ color: ECHO.taupe, fontFamily: "'Inter', sans-serif" }}
                  >
                    Tell me about your business and I'll show you which kete fits, what it costs, and what your team would actually use.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 w-full max-w-xs mt-2">
                  {[
                    "Which kete is right for my business?",
                    "How does the tikanga compliance layer work?",
                    "What's included in the Leader plan?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left text-[12px] px-3 py-2.5 rounded-xl transition-all"
                      style={{
                        background: ECHO.surfaceMist,
                        border: `1px solid ${ECHO.border}`,
                        color: ECHO.taupe,
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = ECHO.borderHover;
                        e.currentTarget.style.color = ECHO.ink;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = ECHO.border;
                        e.currentTarget.style.color = ECHO.taupe;
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <img
                    loading="lazy"
                    decoding="async"
                    src={floaterImage}
                    alt=""
                    className="w-6 h-6 object-cover rounded-full shrink-0 mt-1"
                    style={{ border: `1px solid ${accentHaze}` }}
                  />
                )}
                <div
                  className="max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed"
                  style={
                    msg.role === "user"
                      ? {
                          background: accentHaze,
                          border: `1px solid ${ECHO.goldHazeSoft}`,
                          borderBottomRightRadius: 6,
                          color: ECHO.ink,
                          fontFamily: "'Inter', sans-serif",
                        }
                      : {
                          background: ECHO.surfaceMist,
                          border: `1px solid ${ECHO.border}`,
                          borderBottomLeftRadius: 6,
                          color: ECHO.ink,
                          fontFamily: "'Inter', sans-serif",
                        }
                  }
                >
                  {msg.role === "assistant" ? (
                    <div
                      className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:text-sm"
                      style={{ color: ECHO.ink }}
                    >
                      <ReactMarkdown>
                        {msg.content.replace(/\[GENERATE_IMAGE:\s*.*?\]/g, "").trim()}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center">
                <img
                  loading="lazy"
                  decoding="async"
                  src={floaterImage}
                  alt=""
                  className="w-6 h-6 object-cover rounded-full"
                  style={{ border: `1px solid ${accentHaze}` }}
                />
                <div
                  className="flex gap-1 px-3 py-2 text-[11px]"
                  style={{ color: ECHO.taupeMuted, fontFamily: "'Inter', sans-serif" }}
                >
                  <span>Echo is thinking</span>
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{
                          backgroundColor: accentHex,
                          animation: "bounce-dot 1.4s ease-in-out infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="px-3 py-3 shrink-0"
            style={{
              borderTop: `1px solid ${ECHO.border}`,
              background: ECHO.surface,
            }}
          >
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Echo anything..."
                className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{
                  background: ECHO.surfaceMist,
                  border: `1px solid ${ECHO.border}`,
                  color: ECHO.ink,
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = ECHO.borderHover)}
                onBlur={(e) => (e.currentTarget.style.borderColor = ECHO.border)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-3 py-2.5 rounded-xl transition-all disabled:opacity-30"
                style={{
                  background: input.trim() ? accentHex : "transparent",
                  color: input.trim() ? ECHO.ink : ECHO.taupe,
                  border: `1px solid ${input.trim() ? accentHex : ECHO.border}`,
                  boxShadow: input.trim() ? `0 4px 14px ${accentHaze}` : "none",
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default EchoChatWidget;
