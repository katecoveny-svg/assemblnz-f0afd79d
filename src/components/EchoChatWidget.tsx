import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Send, X, Minimize2, RotateCcw } from "lucide-react";
import echoImg from "@/assets/agents/assembl-mascot-base.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ECHO_COLOR = "#E4A0FF";

const EchoChatWidget = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat/");
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

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { agentId: "echo", messages: newMessages.map((m) => ({ role: m.role, content: m.content })) },
      });
      if (error) throw error;
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Try again shortly." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 left-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 group"
          style={{
            background: ECHO_COLOR,
            boxShadow: `0 4px 20px rgba(228,160,255,0.4), 0 0 40px rgba(228,160,255,0.15)`,
          }}
          title="Chat with ECHO — Assembl's Hero Agent"
        >
          <img src={echoImg} alt="ECHO" className="w-9 h-9 rounded-full object-cover" />
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: ECHO_COLOR }} />
        </button>
      )}

      {/* Minimized bar */}
      {open && minimized && (
        <div
          className="fixed bottom-6 left-6 z-[9999] flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border border-[#E4A0FF]/15"
          style={{ background: "#09090F", boxShadow: `0 4px 20px rgba(228,160,255,0.15)` }}
          onClick={() => setMinimized(false)}
        >
          <img src={echoImg} alt="ECHO" className="w-6 h-6 rounded-full object-cover" />
          <span className="text-xs font-syne font-bold" style={{ color: ECHO_COLOR }}>ECHO</span>
          {messages.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${ECHO_COLOR}20`, color: ECHO_COLOR }}>
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
          className="fixed bottom-6 left-6 z-[9999] w-[380px] max-w-[calc(100vw-48px)] rounded-2xl overflow-hidden flex flex-col border border-[#E4A0FF]/15"
          style={{
            height: "600px",
            maxHeight: "calc(100vh - 100px)",
            background: "#09090F",
            boxShadow: `0 8px 40px rgba(228,160,255,0.2), 0 0 60px rgba(228,160,255,0.06)`,
          }}
        >
          {/* Header */}
          <header className="flex items-center gap-2.5 px-4 py-3 shrink-0 border-b border-[#E4A0FF]/10">
            <img src={echoImg} alt="ECHO" className="w-7 h-7 rounded-full object-cover" style={{ filter: "drop-shadow(0 0 6px rgba(228,160,255,0.5))" }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-syne font-bold text-sm" style={{ color: ECHO_COLOR }}>ECHO</span>
                <span className="text-[10px] font-jakarta text-foreground/40">· Assembl Hero Agent</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00FF88", boxShadow: "0 0 6px #00FF88" }} />
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={saveAndClearChat}
                className="p-1.5 rounded-lg transition-colors hover:bg-[#E4A0FF]/10"
                title="New chat (saves current)"
              >
                <RotateCcw size={14} style={{ color: ECHO_COLOR }} />
              </button>
            )}
            <button
              onClick={() => setMinimized(true)}
              className="p-1.5 rounded-lg transition-colors hover:bg-[#E4A0FF]/10"
              title="Minimize"
            >
              <Minimize2 size={14} style={{ color: ECHO_COLOR }} />
            </button>
            <button onClick={() => { saveAndClearChat(); setOpen(false); }} className="text-foreground/30 hover:text-foreground/60 transition-colors">
              <X size={16} />
            </button>
          </header>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <img src={echoImg} alt="ECHO" className="w-14 h-14 rounded-xl object-cover" style={{ filter: "drop-shadow(0 0 10px rgba(228,160,255,0.4))" }} />
                <p className="text-sm font-jakarta text-foreground/70 max-w-[280px] leading-relaxed">
                  Hey — I'm ECHO, Assembl's hero agent. Ask me anything about our platform, pricing, or how our 41 agents can help your business.
                </p>
                <div className="flex flex-col gap-1.5 w-full max-w-xs mt-2">
                  {["What does Assembl do?", "Which agent is right for my business?", "Tell me about pricing"].map((q) => (
                    <button key={q} onClick={() => sendMessage(q)} className="text-left text-[11px] px-3 py-2.5 rounded-lg transition-colors border border-[#E4A0FF]/10 hover:border-[#E4A0FF]/25" style={{ background: "#0E0E1A", color: "#E4E4EC" }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && <img src={echoImg} alt="" className="w-5 h-5 rounded-full object-cover shrink-0 mt-1" />}
                <div
                  className="max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed"
                  style={msg.role === "user" ? { background: "rgba(228,160,255,0.1)", border: "1px solid rgba(228,160,255,0.08)", borderBottomRightRadius: 4 } : { background: "#0E0E1A", borderBottomLeftRadius: 4 }}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:text-sm">
                      <ReactMarkdown>{msg.content.replace(/\[GENERATE_IMAGE:\s*.*?\]/g, "").trim()}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center">
                <img src={echoImg} alt="" className="w-5 h-5 rounded-full object-cover" />
                <div className="flex gap-1 px-3 py-2 text-[11px] font-jakarta text-foreground/40">
                  <span>ECHO is thinking</span>
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
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="px-3 py-3 shrink-0 border-t border-[#E4A0FF]/10">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask ECHO anything..."
                className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{ background: "#0E0E1A", border: "1px solid rgba(228,160,255,0.08)", color: "#E4E4EC" }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-3 py-2.5 rounded-lg transition-all disabled:opacity-30"
                style={{
                  background: input.trim() ? ECHO_COLOR : "transparent",
                  color: input.trim() ? "#0A0A14" : ECHO_COLOR,
                  border: `1px solid ${input.trim() ? ECHO_COLOR : "rgba(228,160,255,0.2)"}`,
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
