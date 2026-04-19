import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { agentChatStream } from "@/lib/agentChat";
import ReactMarkdown from "react-markdown";
import { Send, X, Minimize2, RotateCcw } from "lucide-react";
import { assemblMark } from "@/assets/brand";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ECHO_COLOR = "#D4A843";
const ECHO_BORDER = "rgba(212,168,67,0.15)";
const ECHO_BORDER_HOVER = "rgba(212,168,67,0.25)";
const ECHO_BG_ACCENT = "rgba(212,168,67,0.1)";
const ECHO_BG_ACCENT_SUBTLE = "rgba(212,168,67,0.08)";

// Map first URL segment → kete display label so the chat dock stays context-aware
const KETE_LABELS: Record<string, string> = {
  manaaki: "Manaaki · Hospitality",
  waihanga: "Waihanga · Construction",
  auaha: "Auaha · Creative",
  arataki: "Arataki · Automotive",
  pikau: "Pikau · Technology",
  hoko: "Hoko · Retail",
  ako: "Ako · Education",
  toro: "Tōro · Family",
  toroa: "Tōro · Family",
  voyage: "Voyage · Travel",
  workspace: "Your workspace",
  evidence: "Evidence gallery",
  status: "Platform status",
};

const EchoChatWidget = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat/") || location.pathname.startsWith("/embed/");
  const firstSeg = location.pathname.split("/").filter(Boolean)[0]?.toLowerCase() || "";
  const keteContext = KETE_LABELS[firstSeg] || null;
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

    // Add placeholder for streaming
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
      {/* Floating bubble — Constellation mark with Kōwhai glow */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 left-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 group"
          style={{
            background: "radial-gradient(circle at 40% 35%, rgba(212,168,67,0.22), rgba(58,125,110,0.1) 60%, transparent)",
            border: `1px solid rgba(212,168,67,0.35)`,
            boxShadow: `0 0 18px rgba(212,168,67,0.55), 0 0 40px rgba(212,168,67,0.2), 0 4px 16px rgba(0,0,0,0.5)`,
          }}
          title="Chat with Echo — assembl's hero agent"
        >
          <img loading="lazy" decoding="async"
            src={assemblMark}
            alt="Assembl"
            className="w-8 h-8 object-contain logo-glow"
            draggable={false} />
          <span className="absolute inset-0 rounded-full animate-ping opacity-15" style={{ border: "1px solid rgba(212,168,67,0.6)" }} />
        </button>
      )}

      {/* Minimized bar */}
      {open && minimized && (
        <div
          className="fixed bottom-6 left-6 z-[9999] flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer"
          style={{ background: "hsl(var(--background))", border: `1px solid ${ECHO_BORDER}`, boxShadow: `0 4px 20px rgba(212,168,67,0.15)` }}
          onClick={() => setMinimized(false)}
        >
          <img loading="lazy" decoding="async" src={assemblMark} alt="Echo" className="w-6 h-6 object-contain logo-glow" />
          <span className="text-xs font-display font-bold" style={{ color: ECHO_COLOR }}>Echo</span>
          {messages.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: ECHO_BG_ACCENT, color: ECHO_COLOR }}>
              {messages.length} msgs
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); saveAndClearChat(); setOpen(false); }}
            className="text-foreground/30 hover:text-foreground/60 transition-colors ml-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Chat window */}
      {open && !minimized && (
        <div
          className="fixed bottom-6 left-6 z-[9999] w-[380px] max-w-[calc(100vw-48px)] rounded-2xl overflow-hidden flex flex-col"
          style={{
            height: "600px",
            maxHeight: "calc(100vh - 100px)",
            background: "hsl(var(--background))",
            border: `1px solid ${ECHO_BORDER}`,
            boxShadow: `0 8px 40px rgba(212,168,67,0.15), 0 0 60px rgba(212,168,67,0.05)`,
          }}
        >
          {/* Header */}
          <header className="flex items-center gap-2.5 px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${ECHO_BORDER}` }}>
            <img loading="lazy" decoding="async" src={assemblMark} alt="Echo" className="w-7 h-7 object-contain logo-glow" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-light text-sm tracking-wide" style={{ color: ECHO_COLOR }}>Echo</span>
                <span className="text-[10px] font-body text-muted-foreground">· assembl · Auckland</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#5AADA0", boxShadow: "0 0 6px #5AADA0" }} />
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={saveAndClearChat}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: ECHO_COLOR }}
                onMouseEnter={e => (e.currentTarget.style.background = ECHO_BG_ACCENT)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                title="New chat (saves current)"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              onClick={() => setMinimized(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: ECHO_COLOR }}
              onMouseEnter={e => (e.currentTarget.style.background = ECHO_BG_ACCENT)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              title="Minimize"
            >
              <Minimize2 size={14} />
            </button>
            <button onClick={() => { saveAndClearChat(); setOpen(false); }} className="text-foreground/30 hover:text-foreground/60 transition-colors">
              <X size={16} />
            </button>
          </header>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <img loading="lazy" decoding="async" src={assemblMark} alt="Echo" className="w-14 h-14 object-contain logo-glow" />
                <p className="text-sm font-body text-foreground/70 max-w-[280px] leading-relaxed">
                  Kia ora — I'm Echo. Tell me about your business and I'll show you which kete fits, what your team would actually use, and what it costs.
                </p>
                <div className="flex flex-col gap-1.5 w-full max-w-xs mt-2">
                  {[
                    "Which kete is right for my business?",
                    "How does the compliance layer work?",
                    "What's included in the Leader plan?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left text-[11px] px-3 py-2.5 rounded-lg transition-colors text-foreground/80 hover:text-foreground"
                      style={{
                        background: "hsl(var(--surface-1))",
                        border: `1px solid ${ECHO_BORDER}`,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = ECHO_BORDER_HOVER)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = ECHO_BORDER)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && <img loading="lazy" decoding="async" src={assemblMark} alt="" className="w-5 h-5 object-contain shrink-0 mt-1" />}
                <div
                  className="max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { background: ECHO_BG_ACCENT, border: `1px solid ${ECHO_BG_ACCENT_SUBTLE}`, borderBottomRightRadius: 4 }
                      : { background: "hsl(var(--surface-1))", borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:text-sm [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140]">
                      <ReactMarkdown>{msg.content.replace(/\[GENERATE_IMAGE:\s*.*?\]/g, "").trim()}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center">
                <img loading="lazy" decoding="async" src={assemblMark} alt="" className="w-5 h-5 object-contain" />
                <div className="flex gap-1 px-3 py-2 text-[11px] font-body text-muted-foreground">
                  <span>Echo is thinking</span>
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: ECHO_COLOR, animation: "bounce-dot 1.4s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="px-3 py-3 shrink-0" style={{ borderTop: `1px solid ${ECHO_BORDER}` }}>
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Echo anything..."
                className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
                style={{ background: "hsl(var(--surface-1))", border: `1px solid ${ECHO_BORDER}` }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-3 py-2.5 rounded-lg transition-all disabled:opacity-30"
                style={{
                  background: input.trim() ? ECHO_COLOR : "transparent",
                  color: input.trim() ? "hsl(var(--background))" : ECHO_COLOR,
                  border: `1px solid ${input.trim() ? ECHO_COLOR : ECHO_BORDER}`,
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
