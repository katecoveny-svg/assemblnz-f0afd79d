import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, X, Brain, ShieldAlert, FolderKanban,
  Layers, FileText, HardHat, ShieldCheck, Loader2, Sparkles
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-router`;

const AGENT_ICONS: Record<string, typeof Brain> = {
  Brain, ShieldAlert, FolderKanban, Layers, FileText, HardHat, ShieldCheck,
};

const SUGGESTIONS = [
  "Report a hazard on site",
  "Check H&S compliance for working at height",
  "Generate a payment claim",
  "Create a toolbox talk topic",
  "Analyse a contract clause",
  "Check building consent status",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentName?: string;
  agentIcon?: string;
}

export default function HangaChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setActiveAgent("Routing...");

    let assistantContent = "";
    let agentName = "IHO Brain";
    let agentIcon = "Brain";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          packId: "hanga",
          messages: messages.filter(m => m.role === "user" || m.role === "assistant")
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI request failed" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      agentName = resp.headers.get("X-Agent-Name") || "IHO Brain";
      agentIcon = resp.headers.get("X-Agent-Icon") || "Brain";
      setActiveAgent(agentName);

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const assistantId = crypto.randomUUID();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { id: assistantId, role: "assistant", content: assistantContent, agentName, agentIcon }];
              });
            }
          } catch { /* partial JSON */ }
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Something went wrong";
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: "assistant", content: `⚠️ ${errMsg}`, agentName: "System", agentIcon: "Brain",
      }]);
    } finally {
      setIsLoading(false);
      setActiveAgent(null);
    }
  };

  const AgentIcon = ({ icon }: { icon?: string }) => {
    const Icon = (icon && AGENT_ICONS[icon]) || Brain;
    return <Icon size={14} style={{ color: KOWHAI }} />;
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${POUNAMU}, ${KOWHAI})` }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare size={22} color="#fff" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] rounded-2xl flex flex-col overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(13,13,24,0.97), rgba(9,9,15,0.98))",
              border: "1px solid rgba(212,168,67,0.15)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212,168,67,0.05)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${POUNAMU}30, ${KOWHAI}30)` }}>
                  <Brain size={16} style={{ color: KOWHAI }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Hanga Intelligence</h3>
                  <p className="text-[10px] text-white/40">
                    {activeAgent ? `${activeAgent} responding...` : "IHO routing active"}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center" style={{ background: `${KOWHAI}15` }}>
                    <Sparkles size={22} style={{ color: KOWHAI }} />
                  </div>
                  <div>
                    <p className="text-sm text-white/70 font-medium">Kia ora! How can I help?</p>
                    <p className="text-[11px] text-white/30 mt-1">IHO will route your query to the right specialist</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="px-3 py-1.5 rounded-full text-[10px] text-white/50 hover:text-white/80 transition-colors"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
                    {msg.role === "assistant" && msg.agentName && (
                      <div className="flex items-center gap-1.5 mb-1 ml-1">
                        <AgentIcon icon={msg.agentIcon} />
                        <span className="text-[10px] font-medium" style={{ color: KOWHAI }}>{msg.agentName}</span>
                      </div>
                    )}
                    <div
                      className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-2xl rounded-br-md text-white"
                          : "rounded-2xl rounded-bl-md text-white/80"
                      }`}
                      style={msg.role === "user" ? {
                        background: `linear-gradient(135deg, ${POUNAMU}, ${POUNAMU}CC)`,
                      } : {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&_h2]:text-sm [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-xs [&_p]:text-[13px] [&_li]:text-[13px] [&_strong]:text-white">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 ml-1">
                  <Loader2 size={14} className="animate-spin" style={{ color: KOWHAI }} />
                  <span className="text-[11px] text-white/40">{activeAgent || "Thinking"}...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-1">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder="Ask about safety, projects, consents..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-lg transition-all disabled:opacity-30"
                  style={{ background: input.trim() ? `${POUNAMU}30` : "transparent" }}
                >
                  <Send size={16} style={{ color: input.trim() ? POUNAMU : "rgba(255,255,255,0.2)" }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
