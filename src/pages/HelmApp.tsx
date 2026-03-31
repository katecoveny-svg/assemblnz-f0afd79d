import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar, MessageSquare, Bus, BookOpen, FileText, CheckCircle, Truck, Settings2,
  Send, Menu, X, ArrowLeft, Mic, MicOff, User, LogIn, ChevronRight,
  ShoppingCart, CalendarCheck, Users, ListTodo,
} from "lucide-react";
import { toast } from "sonner";
import HelmThisWeek from "@/components/helm/HelmThisWeek";
import HelmBusTracker from "@/components/helm/HelmBusTracker";
import HelmTimetable from "@/components/helm/HelmTimetable";
import HelmInbox from "@/components/helm/HelmInbox";
import HelmReview from "@/components/helm/HelmReview";
import HelmRescue from "@/components/helm/HelmRescue";
import HelmSettings from "@/components/helm/HelmSettings";
import HelmDashboard from "@/components/helm/HelmDashboard";
import HelmQuickActions from "@/components/helm/HelmQuickActions";
import HelmGroceryList from "@/components/helm/HelmGroceryList";
import HelmAppointments from "@/components/helm/HelmAppointments";
import HelmFamilyChat from "@/components/helm/HelmFamilyChat";
import HelmTasks from "@/components/helm/HelmTasks";
import AgentAvatar from "@/components/AgentAvatar";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { setDynamicManifest } from "@/utils/pwaManifest";

const HELM_COLOR = "#3A7D6E";

type Tab = "chat" | "groceries" | "appointments" | "family_chat" | "tasks" | "week" | "bus" | "timetable" | "inbox" | "review" | "rescue" | "settings";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DashboardItem {
  type: "event" | "meal" | "reminder";
  text: string;
  date?: string;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "chat", label: "Chat", icon: <MessageSquare size={16} /> },
  { id: "groceries", label: "Groceries", icon: <ShoppingCart size={16} /> },
  { id: "appointments", label: "Appointments", icon: <CalendarCheck size={16} /> },
  { id: "family_chat", label: "Family Chat", icon: <Users size={16} /> },
  { id: "tasks", label: "Tasks", icon: <ListTodo size={16} /> },
  { id: "week", label: "This Week", icon: <Calendar size={16} /> },
  { id: "bus", label: "Bus Tracker", icon: <Bus size={16} /> },
  { id: "timetable", label: "Timetable", icon: <BookOpen size={16} /> },
  { id: "inbox", label: "Inbox", icon: <FileText size={16} /> },
  { id: "review", label: "Review", icon: <CheckCircle size={16} /> },
  { id: "rescue", label: "Rescue", icon: <Truck size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings2 size={16} /> },
];

export default function HelmApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardItems] = useState<DashboardItem[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<{ user_id: string; display_name: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Set dynamic PWA manifest for TŌROA
  useEffect(() => setDynamicManifest("operations"), []);

  // Load family
  useEffect(() => {
    if (!user) return;
    const loadFamily = async () => {
      const { data: fm } = await supabase.from("family_members").select("family_id").eq("user_id", user.id).limit(1).single();
      if (fm) {
        setFamilyId(fm.family_id);
        const { data: members } = await supabase.from("family_members").select("user_id, role").eq("family_id", fm.family_id);
        setFamilyMembers((members || []).map((m: any) => ({ user_id: m.user_id, display_name: m.role || "Member" })));
      }
    };
    loadFamily();
  }, [user]);

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
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const resp = await supabase.functions.invoke("chat", {
        body: {
          agentId: "operations",
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const content = resp.data?.content || "Sorry, I couldn't process that. Please try again.";
      setMessages([...newMessages, { role: "assistant", content }]);
    } catch (err: any) {
      console.error("TŌROA chat error:", err);
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const switchToChat = (msg: string) => {
    setActiveTab("chat");
    sendMessage(msg);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: "#09090F", color: "white" }}>
      <PWAInstallBanner agentName="TŌROA" agentColor={HELM_COLOR} />
      {/* Top Bar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 shrink-0">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/5 transition lg:hidden">
          <Menu size={18} className="text-white/60" />
        </button>
        <AgentAvatar agentId="operations" color={HELM_COLOR} size={32} showGlow={false} eager />
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold font-display" style={{ color: HELM_COLOR }}>TŌROA</h1>
          <p className="text-[9px] text-white/30 font-mono">Your family's second brain</p>
        </div>
        {user ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: HELM_COLOR + "30", color: HELM_COLOR }}>
              {(user.email?.[0] || "U").toUpperCase()}
            </div>
          </div>
        ) : (
          <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            style={{ background: HELM_COLOR + "20", color: HELM_COLOR, border: `1px solid ${HELM_COLOR}30` }}>
            <LogIn size={12} /> Sign in
          </Link>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || typeof window !== "undefined") && (
            <motion.aside
              className={`${sidebarOpen ? "fixed inset-0 z-50 lg:relative lg:z-0" : "hidden lg:flex"} flex`}
              initial={false}
            >
              {/* Backdrop (mobile) */}
              {sidebarOpen && (
                <div className="absolute inset-0 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
              )}
              <div className={`relative w-56 border-r border-white/5 flex flex-col py-2 overflow-y-auto shrink-0 ${sidebarOpen ? "bg-[#09090F]" : ""}`}
                style={{ background: "#0C0C16" }}>
                {sidebarOpen && (
                  <button onClick={() => setSidebarOpen(false)} className="absolute top-2 right-2 p-1 rounded hover:bg-white/5 lg:hidden">
                    <X size={14} className="text-white/40" />
                  </button>
                )}
                <div className="px-3 mb-3">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-2">Navigation</p>
                </div>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                    className="flex items-center gap-2.5 px-5 py-2.5 text-left transition-all w-full"
                    style={{
                      background: activeTab === tab.id ? HELM_COLOR + "12" : "transparent",
                      color: activeTab === tab.id ? HELM_COLOR : "rgba(255,255,255,0.5)",
                      borderRight: activeTab === tab.id ? `2px solid ${HELM_COLOR}` : "2px solid transparent",
                    }}
                  >
                    {tab.icon}
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                ))}

                {/* Quick Stats */}
                <div className="mt-auto px-4 py-4 space-y-3">
                  <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <p className="text-[9px] text-white/30 uppercase tracking-wide mb-1">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] text-white/50">TŌROA Online</span>
                    </div>
                  </div>
                  <Link to="/" className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/40 transition px-1">
                    <ArrowLeft size={10} /> Back to Assembl
                  </Link>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Tab Bar */}
          <div className="flex lg:hidden overflow-x-auto border-b border-white/5 px-2 gap-1 shrink-0">
            {TABS.slice(0, 5).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-medium whitespace-nowrap transition shrink-0"
                style={{ color: activeTab === tab.id ? HELM_COLOR : "rgba(255,255,255,0.4)", borderBottom: activeTab === tab.id ? `2px solid ${HELM_COLOR}` : "2px solid transparent" }}>
                {tab.icon} {tab.label}
              </button>
            ))}
            <button onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-1 px-3 py-2.5 text-[10px] text-white/30 whitespace-nowrap">
              More <ChevronRight size={10} />
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "chat" ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                     <div className="mb-4">
                       <AgentAvatar agentId="operations" color={HELM_COLOR} size={80} />
                     </div>
                    <h2 className="text-lg font-display font-bold mb-1" style={{ color: HELM_COLOR }}>Kia ora!</h2>
                    <p className="text-xs text-white/40 text-center max-w-sm mb-6">
                      I'm TŌROA, your family's second brain. I can help with school admin, meal plans, budgets, and more.
                    </p>
                    <HelmQuickActions onSelect={switchToChat} />
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center">
                        <AgentAvatar agentId="operations" color={HELM_COLOR} size={28} showGlow={false} />
                      </div>
                    )}
                    <div
                      className="rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap"
                      style={{
                        background: msg.role === "user" ? HELM_COLOR + "20" : "rgba(255,255,255,0.04)",
                        color: msg.role === "user" ? "white" : "rgba(255,255,255,0.8)",
                        border: `1px solid ${msg.role === "user" ? HELM_COLOR + "30" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-white/10">
                        <User size={14} className="text-white/50" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center">
                      <AgentAvatar agentId="operations" color={HELM_COLOR} size={28} showGlow={false} />
                    </div>
                    <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex gap-1.5">
                        <motion.div className="w-2 h-2 rounded-full" style={{ background: HELM_COLOR }}
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} />
                        <motion.div className="w-2 h-2 rounded-full" style={{ background: HELM_COLOR }}
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="w-2 h-2 rounded-full" style={{ background: HELM_COLOR }}
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 px-4 pb-4 pt-2 border-t border-white/5">
                <div className="flex items-end gap-2 rounded-2xl px-4 py-2"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.08)` }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask TŌROA anything..."
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/25 resize-none focus:outline-none py-1"
                    style={{ maxHeight: "120px" }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="p-2 rounded-xl transition disabled:opacity-30"
                    style={{ background: HELM_COLOR + "30", color: HELM_COLOR }}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-[9px] text-white/15 text-center mt-2">
                  TŌROA by Assembl — AI-powered family admin for NZ
                </p>
              </div>
            </div>
          ) : activeTab === "groceries" ? (
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <HelmGroceryList familyId={familyId} />
            </div>
          ) : activeTab === "appointments" ? (
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <HelmAppointments familyId={familyId} />
            </div>
          ) : activeTab === "family_chat" ? (
            <div className="flex-1 overflow-hidden px-4 py-4">
              <HelmFamilyChat familyId={familyId} familyMembers={familyMembers} />
            </div>
          ) : activeTab === "tasks" ? (
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <HelmTasks familyId={familyId} />
            </div>
          ) : activeTab === "week" ? (
            <HelmThisWeek onSendToChat={switchToChat} />
          ) : activeTab === "bus" ? (
            <HelmBusTracker />
          ) : activeTab === "timetable" ? (
            <HelmTimetable onSendToChat={switchToChat} />
          ) : activeTab === "inbox" ? (
            <HelmInbox onSendToChat={switchToChat} />
          ) : activeTab === "review" ? (
            <HelmReview />
          ) : activeTab === "rescue" ? (
            <HelmRescue />
          ) : activeTab === "settings" ? (
            <HelmSettings />
          ) : null}
        </main>
      </div>
    </div>
  );
}
