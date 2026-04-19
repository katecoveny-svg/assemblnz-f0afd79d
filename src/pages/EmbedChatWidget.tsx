import { agentChat } from "@/lib/agentChat";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { agents, echoAgent, pilotAgent } from "@/data/agents";
import { supabase } from "@/integrations/supabase/client";
import AgentAvatar from "@/components/AgentAvatar";
import ReactMarkdown from "react-markdown";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PREVIEW_MSG_KEY = "assembl_embed_msgs";
const PREVIEW_LIMIT = 3;

const EmbedChatWidget = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const agent = agentId === "echo" ? echoAgent : agentId === "pilot" ? pilotAgent : agents.find((a) => a.id === agentId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!agent) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "transparent", color: "#3D4250" }}>
        <p className="text-sm">Agent not found.</p>
      </div>
    );
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Check preview limit
    const count = parseInt(sessionStorage.getItem(PREVIEW_MSG_KEY) || "0", 10);
    if (count >= PREVIEW_LIMIT) {
      setLimitReached(true);
      return;
    }
    sessionStorage.setItem(PREVIEW_MSG_KEY, String(count + 1));

    const userMessage: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const content = await agentChat({ agentId: agent.id, message: newMessages[newMessages.length - 1].content, messages: apiMessages });
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const remaining = PREVIEW_LIMIT - parseInt(sessionStorage.getItem(PREVIEW_MSG_KEY) || "0", 10);

  return (
    <div className="h-screen flex flex-col" style={{ background: "transparent", color: "#3D4250", fontFamily: "'Outfit', sans-serif" }}>
      {/* Compact header */}
      <header
        className="flex items-center gap-2.5 px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        <AgentAvatar agentId={agent.id} color={agent.color} size={28} showGlow={false} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: "#3D4250" }}>{agent.name}</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#5AADA0", boxShadow: "0 0 6px #5AADA0" }} />
          </div>
          <p className="text-[11px] truncate" style={{ color: agent.color }}>{agent.role}</p>
        </div>
        <a
          href="https://assembl.co.nz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-medium px-2 py-0.5 rounded"
          style={{ color: "#9CA3AF", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          by ASSEMBL
        </a>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !limitReached && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <AgentAvatar agentId={agent.id} color={agent.color} size={56} />
            <div>
              <h2 className="text-sm font-bold" style={{ color: "#3D4250" }}>{agent.name}</h2>
              <p className="text-[11px] italic" style={{ color: "#9CA3AF" }}>"{agent.tagline}"</p>
            </div>
            <div className="flex flex-col gap-1.5 w-full max-w-xs mt-2">
              {agent.starters.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-[11px] px-3 py-2.5 rounded-lg transition-colors"
                  style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", color: "#3D4250" }}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-[10px] mt-2" style={{ color: "#9CA3AF" }}>
              {remaining} free messages remaining
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && <AgentAvatar agentId={agent.id} color={agent.color} size={20} showGlow={false} />}
            <div
              className="max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed"
              style={
                msg.role === "user"
                   ? { background: `${agent.color}18`, border: `1px solid ${agent.color}15`, borderBottomRightRadius: 4, color: "#3D4250" }
                   : { background: "rgba(0,0,0,0.03)", borderBottomLeftRadius: 4, color: "#3D4250" }
              }
            >
              {msg.role === "assistant" ? (
                <>
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:text-sm [&_p]:text-[#3D4250] [&_li]:text-[#3D4250] [&_strong]:text-[#2D3140]">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <p className="text-[9px] mt-2 leading-relaxed" style={{ color: "#9CA3AF" }}>
                    AI-generated guidance — not a substitute for professional advice. Verify before acting.
                  </p>
                </>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 items-center">
            <AgentAvatar agentId={agent.id} color={agent.color} size={20} showGlow={false} />
            <div className="flex gap-1 px-3 py-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: agent.color,
                    animation: `bounce-dot 1.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {limitReached && (
          <div className="text-center py-6 px-4">
            <p className="text-sm font-medium mb-2" style={{ color: "#3D4250" }}>Free preview limit reached</p>
            <p className="text-[11px] mb-4" style={{ color: "#9CA3AF" }}>
              Sign up for unlimited access to {agent.name} and all 41 Assembl agents.
            </p>
            <a
              href="https://assembl.co.nz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold"
              style={{ background: agent.color, color: "#0A0A14" }}
            >
              Sign up at assembl.co.nz
            </a>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      {!limitReached && (
        <form
          onSubmit={handleSubmit}
          className="px-3 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${agent.name}...`}
              className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{
                background: "rgba(0,0,0,0.02)",
                border: "1px solid rgba(0,0,0,0.08)",
                color: "#3D4250",
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3 py-2.5 rounded-lg transition-all disabled:opacity-30"
              style={{
                background: input.trim() ? agent.color : "transparent",
                color: input.trim() ? "#0A0A14" : agent.color,
                border: `1px solid ${input.trim() ? agent.color : agent.color + "30"}`,
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmbedChatWidget;
