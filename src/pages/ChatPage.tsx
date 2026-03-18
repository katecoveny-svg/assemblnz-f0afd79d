import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { agents } from "@/data/agents";
import RobotIcon from "@/components/RobotIcon";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const agent = agents.find(a => a.id === agentId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <div className="text-center">
          <p className="mb-4">Agent not found.</p>
          <Link to="/" className="text-primary underline">Back to agents</Link>
        </div>
      </div>
    );
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          agentId: agent.id,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        },
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <Link to="/" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <RobotIcon color={agent.color} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground">{agent.name}</span>
            <span className="font-mono-jb text-[10px] text-muted-foreground">{agent.designation}</span>
          </div>
          <p className="text-[11px] truncate" style={{ color: agent.color }}>{agent.role}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full animate-pulse-glow"
            style={{ backgroundColor: "#00FF88", boxShadow: "0 0 6px #00FF88" }}
          />
          <span className="text-[10px] font-mono-jb text-foreground/50">LIVE</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards" }}>
            <RobotIcon color={agent.color} size={72} />
            <div>
              <h2 className="text-lg font-bold text-foreground">{agent.name}</h2>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
                  style={{ backgroundColor: "#00FF88", boxShadow: "0 0 6px #00FF88" }}
                />
                <span className="text-xs text-foreground/50">online</span>
              </div>
              <p className="text-xs italic text-muted-foreground">"{agent.tagline}"</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm mt-2">
              {agent.starters.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs px-4 py-3 rounded-lg border border-border bg-card hover:border-foreground/10 transition-colors text-foreground/70"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 opacity-0 animate-fade-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${i * 30}ms`, animationFillMode: "forwards" }}
              >
                {msg.role === "assistant" && <RobotIcon color={agent.color} size={24} />}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "text-foreground rounded-br-sm"
                      : "bg-card text-foreground/90 rounded-bl-sm"
                  }`}
                  style={
                    msg.role === "user"
                      ? { background: `linear-gradient(135deg, ${agent.color}18, ${agent.color}08)`, border: `1px solid ${agent.color}15` }
                      : {}
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 items-center">
                <RobotIcon color={agent.color} size={24} />
                <div className="flex gap-1 px-3 py-2">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce-dot"
                      style={{
                        backgroundColor: agent.color,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border shrink-0">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${agent.name} anything...`}
            className="flex-1 bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/10 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-30"
            style={{
              backgroundColor: input.trim() ? agent.color : "transparent",
              color: input.trim() ? "#0A0A14" : agent.color,
              border: `1px solid ${input.trim() ? agent.color : agent.color + "30"}`,
              boxShadow: input.trim() ? `0 0 16px ${agent.color}30` : "none",
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
