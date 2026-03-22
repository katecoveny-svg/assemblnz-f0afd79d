import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, FileText, Upload, Clock, Bookmark, ChevronRight, Trash2, History } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { agents } from "@/data/agents";

interface ConversationItem {
  id: string;
  agent_id: string;
  messages: any[];
  updated_at: string;
}

interface SavedItem {
  id: string;
  agent_id: string;
  agent_name: string;
  content: string;
  preview: string;
  created_at: string;
}

const SAMPLE_AGENTS = [
  { name: "APEX", color: "#00FF88", messages: 120 },
  { name: "LEDGER", color: "#4FC3F7", messages: 89 },
  { name: "ANCHOR", color: "#00E5FF", messages: 45 },
  { name: "HELM", color: "#B388FF", messages: 38 },
  { name: "NEXUS", color: "#5B8CFF", messages: 28 },
  { name: "PRISM", color: "#E040FB", messages: 22 },
];

const SAMPLE_TEMPLATES = [
  { agent: "APEX", agentColor: "#00FF88", type: "Site Safety Plan", date: "15 Mar 2026" },
  { agent: "LEDGER", agentColor: "#4FC3F7", type: "GST Calculator", date: "14 Mar 2026" },
  { agent: "ANCHOR", agentColor: "#00E5FF", type: "Employment Agreement", date: "13 Mar 2026" },
  { agent: "HELM", agentColor: "#B388FF", type: "Meal Plan", date: "12 Mar 2026" },
  { agent: "NEXUS", agentColor: "#5B8CFF", type: "Import Entry Processor", date: "11 Mar 2026" },
];

const TIME_SAVED = [
  { template: "Site Safety Plan", count: 7, hoursEach: 3, total: 21 },
  { template: "Employment Agreement", count: 4, hoursEach: 2, total: 8 },
  { template: "GST Calculator", count: 12, hoursEach: 0.33, total: 4 },
  { template: "Meal Plan", count: 8, hoursEach: 0.5, total: 4 },
];

const maxMessages = Math.max(...SAMPLE_AGENTS.map((a) => a.messages));

/* Glassmorphism card style used across the dashboard */
const glassCard: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [viewItem, setViewItem] = useState<SavedItem | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setSavedItems(data as SavedItem[]);
      });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    supabase
      .from("conversations")
      .select("id, agent_id, messages, updated_at")
      .eq("user_id", user.id)
      .gte("updated_at", thirtyDaysAgo.toISOString())
      .order("updated_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setConversations(data as ConversationItem[]);
      });
  }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from("saved_items").delete().eq("id", id);
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
    if (viewItem?.id === id) setViewItem(null);
  };

  return (
    <div className="min-h-screen star-field flex flex-col relative">
      <ParticleField />
      <BrandNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1">
        <h2 className="text-xl font-display font-extrabold tracking-[2.5px] uppercase text-glow-cyan">Your Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: MessageSquare, label: "Messages this month", value: "342", color: "#00E5FF" },
            { icon: FileText, label: "Templates generated", value: "14", color: "#B388FF" },
            { icon: Upload, label: "Documents processed", value: "8", color: "#E040FB" },
            { icon: Clock, label: "Estimated time saved", value: "23.5 hrs", color: "#00FF88", highlight: true },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="rounded-xl p-5 opacity-0 animate-fade-up relative overflow-hidden glow-card-hover"
              style={{
                ...glassCard,
                animationDelay: `${i * 80}ms`,
                animationFillMode: "forwards",
                boxShadow: `0 0 30px ${stat.color}15, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
            >
              {/* Top edge glow */}
              <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-40" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />
              <stat.icon size={18} style={{ color: stat.color, filter: `drop-shadow(0 0 6px ${stat.color})` }} className="mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] mt-1 text-muted-foreground">{stat.label}</p>
              {stat.label === "Messages this month" && (
                <div className="flex items-end gap-0.5 mt-3 h-6">
                  {[18, 24, 12, 30, 22, 28, 35, 42, 38, 45, 32, 37].map((v, j) => (
                    <div key={j} className="flex-1 rounded-sm" style={{ height: `${(v / 45) * 100}%`, background: `linear-gradient(to top, ${stat.color}30, ${stat.color}80)` }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Saved Items Library */}
        {savedItems.length > 0 && (
          <div className="rounded-xl p-6 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #B388FF, transparent)" }} />
            <div className="flex items-center gap-2 mb-4">
              <Bookmark size={16} style={{ color: "#B388FF", filter: "drop-shadow(0 0 6px #B388FF)" }} />
              <h2 className="text-sm font-display font-bold text-foreground">Saved Items</h2>
              <span className="text-[10px] text-muted-foreground ml-auto">{savedItems.length} items</span>
            </div>
            <div className="space-y-2">
              {savedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "hsl(var(--foreground))" }}>
                      {item.agent_name}
                    </span>
                    <span className="text-xs text-foreground/60 truncate">{item.preview}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                    </span>
                    <button onClick={() => setViewItem(item)} className="text-[11px] hover:underline flex items-center gap-0.5" style={{ color: "#00E5FF" }}>
                      View <ChevronRight size={10} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-destructive/50 hover:text-destructive transition-colors" aria-label="Delete saved item">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Saved Item Modal */}
        <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" style={glassCard}>
            <DialogHeader>
              <DialogTitle className="text-sm text-foreground">
                Saved from {viewItem?.agent_name}
              </DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground">
                Saved on {viewItem && new Date(viewItem.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
              </DialogDescription>
            </DialogHeader>
            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-foreground prose-strong:text-foreground">
              <ReactMarkdown>{viewItem?.content || ""}</ReactMarkdown>
            </div>
          </DialogContent>
        </Dialog>

        {/* Conversation History */}
        {conversations.length > 0 && (
          <div className="rounded-xl p-6 relative overflow-hidden" style={glassCard}>
            <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #00E5FF, transparent)" }} />
            <div className="flex items-center gap-2 mb-4">
              <History size={16} style={{ color: "#00E5FF", filter: "drop-shadow(0 0 6px #00E5FF)" }} />
              <h2 className="text-sm font-display font-bold text-foreground">Conversation History</h2>
              <span className="text-[10px] text-muted-foreground ml-auto">Last 30 days</span>
            </div>
            <div className="space-y-2">
              {conversations.map((conv) => {
                const agentData = agents.find((a) => a.id === conv.agent_id);
                const lastMsg = Array.isArray(conv.messages) ? conv.messages[conv.messages.length - 1] : null;
                const preview = lastMsg?.content?.substring(0, 80) || "No messages";
                const msgCount = Array.isArray(conv.messages) ? conv.messages.length : 0;
                return (
                  <Link
                    key={conv.id}
                    to={`/chat/${conv.agent_id}`}
                    className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: (agentData?.color || "#888") + "15", color: agentData?.color || "#888" }}
                      >
                        {agentData?.name || conv.agent_id}
                      </span>
                      <span className="text-xs text-foreground/50 truncate">{preview}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{msgCount} msgs</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(conv.updated_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                      </span>
                      <ChevronRight size={12} className="text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Agent Activity */}
        <div className="rounded-xl p-6 relative overflow-hidden glow-card-hover" style={glassCard}>
          <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #E040FB, transparent)" }} />
          <h2 className="text-sm font-display font-bold text-glow-pink mb-4">Agent activity</h2>
          <div className="space-y-3">
            {SAMPLE_AGENTS.map((agent) => (
              <div key={agent.name} className="flex items-center gap-3">
                <span className="text-xs font-mono-jb w-16 text-foreground/60 shrink-0">{agent.name}</span>
                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(agent.messages / maxMessages) * 100}%`,
                      background: `linear-gradient(90deg, ${agent.color}40, ${agent.color})`,
                      boxShadow: `0 0 12px ${agent.color}60`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono-jb text-foreground/50 w-8 text-right">{agent.messages}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Templates */}
        <div className="rounded-xl p-6 relative overflow-hidden glow-card-hover" style={glassCard}>
          <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30" style={{ background: "linear-gradient(90deg, transparent, #00FF88, transparent)" }} />
          <h2 className="text-sm font-display font-bold text-glow-green mb-4">Recent templates</h2>
          <div className="space-y-2">
            {SAMPLE_TEMPLATES.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: t.agentColor + "15", color: t.agentColor }}>{t.agent}</span>
                  <span className="text-xs text-foreground">{t.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted-foreground">{t.date}</span>
                  <button className="text-[11px] hover:underline" style={{ color: "#00E5FF" }}>View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Saved Breakdown */}
        <div className="rounded-xl p-6 relative overflow-hidden glow-card-hover" style={{ ...glassCard, boxShadow: "0 0 30px rgba(0,255,136,0.06)" }}>
          <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-40" style={{ background: "linear-gradient(90deg, transparent, #00FF88, transparent)" }} />
          <h2 className="text-sm font-display font-bold text-glow-green mb-1">Time saved breakdown</h2>
          <p className="text-[11px] text-muted-foreground mb-4">This is the number that justifies your subscription</p>
          <div className="space-y-3">
            {TIME_SAVED.map((t) => (
              <div key={t.template} className="flex items-center justify-between">
                <span className="text-xs text-foreground/70">{t.count} × {t.template}</span>
                <span className="text-xs font-bold" style={{ color: "#00FF88", textShadow: "0 0 8px rgba(0,255,136,0.4)" }}>{t.total} hours saved</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <span className="text-xs font-bold text-foreground">Total estimated time saved</span>
              <span className="text-sm font-bold" style={{ color: "#00FF88", textShadow: "0 0 12px rgba(0,255,136,0.5)" }}>23.5 hours</span>
            </div>
          </div>
        </div>
      </main>

      <BrandFooter />
    </div>
  );
};

export default DashboardPage;
