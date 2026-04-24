import { agentChat } from "@/lib/agentChat";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare, Send, Menu, X, ArrowLeft, User, LogIn, ChevronRight,
  Settings2, Mic, Phone, BookOpen, FileText, Sparkles, LayoutGrid, ShieldAlert,
} from "lucide-react";
import { agents } from "@/data/agents";
import { useResolvedAgent } from "@/hooks/useAgentOverrides";
import { agentCapabilities } from "@/data/agentCapabilities";
import AgentSmsPanel from "@/components/shared/AgentSmsPanel";
import AgentTraining from "@/components/shared/AgentTraining";
import AgentAvatar from "@/components/AgentAvatar";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { setDynamicManifest } from "@/utils/pwaManifest";
import SignalDashboard from "@/components/signal/SignalDashboard";
import { useAgentChatHistory } from "@/hooks/useAgentChatHistory";
import { useAgentChatParams } from "@/hooks/useAgentChatParams";
import { ChatSettingsPanel } from "@/components/chat/ChatSettingsPanel";
import ChatImageMessage, { extractInlineImages } from "@/components/chat/ChatImageMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Tab = "chat" | "sms" | "settings" | "dashboard";

const SLUG_TO_ID: Record<string, string> = {
  "aura": "hospitality", "apex": "construction", "prism": "marketing",
  "ledger": "accounting", "spark": "software", "haven": "hotel",
  "tide": "tourism", "beacon": "events", "coast": "coastal",
  "ember": "bar", "flora": "garden", "crest": "concierge",
  "ata": "bim", "arai": "safety", "kaupapa": "projectgov",
  "rawa": "resource", "whakaae": "consent", "pai": "quality",
  "muse": "copywriting", "pixel": "design", "verse": "video",
  "canvas": "experiential", "reel": "social", "quill": "techwriting",
  "aroha": "hr", "turf": "brandstrategy", "sage": "strategy",
  "compass": "risk", "anchor": "operations", "flux": "sales",
  "shield": "insurance", "vault": "datasecurity", "mint": "forecasting",
  "axis": "analytics", "kindle": "innovation", "sentinel": "monitoring",
  "nexus": "integration", "cipher": "crypto", "relay": "messaging",
  "signal": "netsec", "forge": "devops", "toroa": "family",
  "tika": "tiriti", "ora": "healthcompanion", "tahi": "triage",
  "vitae": "carenavigation",
};

export default function AgentApp() {
  const { agentId: rawAgentId } = useParams<{ agentId: string }>();
  const agentId = rawAgentId ? (SLUG_TO_ID[rawAgentId] ?? rawAgentId) : rawAgentId;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(rawAgentId === "signal" ? "dashboard" : "chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resume the user's previous conversation with this agent (DB for signed-in,
  // localStorage for guests). Keyed by agentId so switching agents loads that
  // agent's own thread.
  const { clearHistory } = useAgentChatHistory(agentId, messages, setMessages);
  // Per-agent model tuning (temperature, max_tokens) — surfaced via the gear
  // icon in the header and forwarded into each agentChat() call below.
  const { params: chatParams } = useAgentChatParams(agentId);

  const rawAgent = useMemo(() => agents.find(a => a.id === agentId), [agentId]);
  const agent = useResolvedAgent(rawAgent ?? agents[0]);
  const capabilities = useMemo(() => agentCapabilities[agentId || ""] || [], [agentId]);
  const color = agent?.color || "#3A6A9C";

  // Set dynamic PWA manifest for this agent
  useEffect(() => {
    if (agentId) return setDynamicManifest(agentId);
  }, [agentId]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const lastMsg = newMessages[newMessages.length - 1];
      const content = await agentChat({
        agentId: agentId,
        message: lastMsg.content,
        messages: newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
        params: chatParams,
      });
      setMessages([...newMessages, { role: "assistant", content }]);
    } catch (err: any) {
      console.error("Agent chat error:", err);
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, agentId, chatParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!agent) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "transparent" }}>
        <div className="text-center">
          <p className="text-white/60">Agent not found</p>
          <Link to="/" className="text-sm mt-2 block" style={{ color: "#3A6A9C" }}>Back to Assembl</Link>
        </div>
      </div>
    );
  }

  const isSignal = agentId === "netsec";

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    ...(isSignal ? [{ id: "dashboard" as Tab, label: "Dashboard", icon: <ShieldAlert size={16} /> }] : []),
    { id: "chat", label: "Chat", icon: <MessageSquare size={16} /> },
    { id: "sms", label: "SMS", icon: <Phone size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings2 size={16} /> },
  ];

  return (
    <div className="h-screen flex flex-col" style={{ background: "transparent", color: "white" }}>
      <PWAInstallBanner agentName={agent.name} agentColor={color} />
      {/* Top Bar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/5 transition lg:hidden">
          <Menu size={18} className="text-white/60" />
        </button>
        <AgentAvatar agentId={agent.id} color={color} size={32} showGlow={false} eager />
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold font-display" style={{ color }}>{agent.name}</h1>
          <p className="text-[9px] text-gray-400 font-mono truncate">{agent.designation} · {agent.role}</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm(`Start a new chat with ${agent.name}? Your previous conversation will be cleared.`)) {
                clearHistory();
              }
            }}
            className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition hover:opacity-80"
            style={{ color: "#3D4250", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.6)" }}
            title="Clear this conversation"
          >
            New chat
          </button>
        )}
        <ChatSettingsPanel agentId={agentId} accentColor={color} />
        {user ? (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: color + "30", color }}>{(user.email?.[0] || "U").toUpperCase()}</div>
        ) : (
          <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            style={{ background: color + "20", color, border: `1px solid ${color}30` }}>
            <LogIn size={12} /> Sign in
          </Link>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar (desktop) */}
        <aside className={`${sidebarOpen ? "fixed inset-0 z-50 flex lg:relative" : "hidden lg:flex"}`}>
          {sidebarOpen && <div className="absolute inset-0 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}
          <div className="relative w-56 border-r border-gray-100 flex flex-col py-2 overflow-y-auto shrink-0" style={{ background: "#F5F5F7" }}>
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="absolute top-2 right-2 p-1 rounded hover:bg-white/5 lg:hidden">
                <X size={14} className="text-assembl-text/40" />
              </button>
            )}
            <div className="px-3 mb-3">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-2">{agent.name}</p>
            </div>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className="flex items-center gap-2.5 px-5 py-2.5 text-left transition-all w-full"
                style={{
                  background: activeTab === tab.id ? color + "12" : "transparent",
                  color: activeTab === tab.id ? color : "rgba(255,255,255,0.5)",
                  borderRight: activeTab === tab.id ? `2px solid ${color}` : "2px solid transparent",
                }}>
                {tab.icon}
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}

            {/* Capabilities */}
            {capabilities.length > 0 && (
              <div className="px-4 mt-4 space-y-2">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-300 px-1">Quick Actions</p>
                {capabilities.slice(0, 4).map((cap, i) => (
                  <button key={i} onClick={() => { setActiveTab("chat"); sendMessage(cap.prompt); setSidebarOpen(false); }}
                    className="w-full text-left rounded-lg px-3 py-2 transition hover:bg-white/5"
                    style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}>
                    <p className="text-[10px] font-medium text-white/60">{cap.title}</p>
                    <p className="text-[8px] text-white/25 mt-0.5">{cap.description}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-auto px-4 py-4 space-y-3">
              <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-gray-500">{agent.name} Online</span>
                </div>
              </div>
              <Link to={`/chat/${agentId}`} className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/40 transition px-1">
                <LayoutGrid size={10} /> Full Platform
              </Link>
              <Link to="/" className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/40 transition px-1">
                <ArrowLeft size={10} /> Assembl Home
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Tab Bar */}
          <div className="flex lg:hidden overflow-x-auto border-b border-gray-100 px-2 gap-1 shrink-0">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-medium whitespace-nowrap transition shrink-0"
                style={{ color: activeTab === tab.id ? color : "rgba(255,255,255,0.4)", borderBottom: activeTab === tab.id ? `2px solid ${color}` : "2px solid transparent" }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "chat" ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4">
                      <AgentAvatar agentId={agent.id} color={color} size={80} />
                    </div>
                    <h2 className="text-lg font-display font-bold mb-1" style={{ color }}>
                      {agent.name}
                    </h2>
                    <p className="text-xs text-white/40 text-center max-w-sm mb-2">{agent.role}</p>
                    <p className="text-[11px] text-gray-400 text-center max-w-md mb-6">{agent.tagline}</p>

                    {/* Starter prompts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                      {(agent.starters || []).slice(0, 4).map((s, i) => (
                        <button key={i} onClick={() => sendMessage(s)}
                          className="text-left px-3.5 py-3 rounded-xl transition-all duration-200 hover:border-opacity-40"
                          style={{ background: color + "08", border: `1px solid ${color}12` }}>
                          <p className="text-[11px] text-white/60 line-clamp-2">{s}</p>
                        </button>
                      ))}
                    </div>

                    {/* Capabilities */}
                    {capabilities.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg mt-4">
                        {capabilities.slice(0, 4).map((cap, i) => {
                          const Icon = cap.icon;
                          return (
                            <button key={i} onClick={() => sendMessage(cap.prompt)}
                              className="text-center px-3 py-3 rounded-xl transition-all hover:border-opacity-40"
                              style={{ background: color + "06", border: `1px solid ${color}10` }}>
                              <Icon size={18} style={{ color }} className="mx-auto mb-1.5" />
                              <p className="text-[10px] font-medium text-white/60">{cap.title}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center">
                        <AgentAvatar agentId={agent.id} color={color} size={28} showGlow={false} />
                      </div>
                    )}
                    <div className="rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
                      style={{
                        background: msg.role === "user" ? color + "20" : "rgba(255,255,255,0.85)",
                        color: "#3D4250",
                        border: `1px solid ${msg.role === "user" ? color + "30" : "rgba(74,165,168,0.15)"}`,
                      }}>
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-white/10">
                        <User size={14} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center">
                      <AgentAvatar agentId={agent.id} color={color} size={28} showGlow={false} />
                    </div>
                    <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}>
                      <div className="flex gap-1.5">
                        {[0, 0.2, 0.4].map(delay => (
                          <motion.div key={delay} className="w-2 h-2 rounded-full" style={{ background: color }}
                            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 px-4 pb-4 pt-2 border-t border-gray-100">
                <div className="flex items-end gap-2 rounded-2xl px-4 py-2"
                  style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask ${agent.name} anything...`}
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/25 resize-none focus:outline-none py-1"
                    style={{ maxHeight: "120px" }}
                  />
                  <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                    className="p-2 rounded-xl transition disabled:opacity-30"
                    style={{ background: color + "30", color }}>
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-[9px] text-white/15 text-center mt-2">
                  {agent.name} by Assembl — {agent.sector?.toLowerCase()} intelligence for NZ
                </p>
              </div>
            </div>
          ) : activeTab === "sms" ? (
            <AgentSmsPanel agentId={agent.id} agentName={agent.name} agentColor={color} />
          ) : activeTab === "settings" ? (
            <AgentTraining agentId={agent.id} agentName={agent.name} agentColor={color} />
          ) : activeTab === "dashboard" ? (
            <SignalDashboard onSendToChat={(msg) => { setActiveTab("chat"); sendMessage(msg); }} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
