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
  { name: "APEX", color: "#FF6B35", messages: 120 },
  { name: "LEDGER", color: "#4FC3F7", messages: 89 },
  { name: "ANCHOR", color: "#FF7043", messages: 45 },
  { name: "HELM", color: "#B388FF", messages: 38 },
  { name: "NEXUS", color: "#5B8CFF", messages: 28 },
  { name: "PRISM", color: "#E040FB", messages: 22 },
];

const SAMPLE_TEMPLATES = [
  { agent: "APEX", agentColor: "#FF6B35", type: "Site Safety Plan", date: "15 Mar 2026" },
  { agent: "LEDGER", agentColor: "#4FC3F7", type: "GST Calculator", date: "14 Mar 2026" },
  { agent: "ANCHOR", agentColor: "#FF7043", type: "Employment Agreement", date: "13 Mar 2026" },
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

    // Load recent conversations (last 30 days)
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1">
        <h2 className="text-xl font-syne font-extrabold text-foreground tracking-[2.5px] uppercase">Your Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: MessageSquare, label: "Messages this month", value: "342", color: "hsl(var(--primary))" },
            { icon: FileText, label: "Templates generated", value: "14", color: "hsl(var(--secondary))" },
            { icon: Upload, label: "Documents processed", value: "8", color: "hsl(var(--accent))" },
            { icon: Clock, label: "Estimated time saved", value: "23.5 hrs", color: "hsl(157, 100%, 55%)", highlight: true },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-xl p-5 opacity-0 animate-fade-up glass-card border ${stat.highlight ? "animated-border" : "border-border"}`}
              style={{
                animationDelay: `${i * 80}ms`,
                animationFillMode: "forwards",
                boxShadow: stat.highlight ? `0 0 24px ${stat.color}15` : undefined,
              }}
            >
              <stat.icon size={18} style={{ color: stat.color }} className="mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] mt-1" style={{ color: '#ffffff38' }}>{stat.label}</p>
              {stat.label === "Messages this month" && (
                <div className="flex items-end gap-0.5 mt-3 h-6">
                  {[18, 24, 12, 30, 22, 28, 35, 42, 38, 45, 32, 37].map((v, j) => (
                    <div key={j} className="flex-1 rounded-sm bg-primary/30" style={{ height: `${(v / 45) * 100}%` }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Saved Items Library */}
        {savedItems.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bookmark size={16} className="text-primary" />
              <h2 className="text-sm font-syne font-bold text-foreground">Saved Items</h2>
              <span className="text-[10px] font-jakarta text-muted-foreground ml-auto">{savedItems.length} items</span>
            </div>
            <div className="space-y-2">
              {savedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: "#ffffff08", color: "hsl(var(--foreground))" }}>
                      {item.agent_name}
                    </span>
                    <span className="text-xs text-foreground/60 truncate">{item.preview}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px]" style={{ color: '#ffffff38' }}>
                      {new Date(item.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                    </span>
                    <button onClick={() => setViewItem(item)} className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
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
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-card border-border">
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
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-foreground">Conversation History</h2>
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
                    className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
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
                      <span className="text-[10px]" style={{ color: '#ffffff38' }}>
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
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-syne font-bold text-foreground mb-4">Agent activity</h2>
          <div className="space-y-3">
            {SAMPLE_AGENTS.map((agent) => (
              <div key={agent.name} className="flex items-center gap-3">
                <span className="text-xs font-mono-jb w-16 text-foreground/60 shrink-0">{agent.name}</span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(agent.messages / maxMessages) * 100}%`,
                      background: `linear-gradient(90deg, ${agent.color}60, ${agent.color})`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono-jb text-foreground/50 w-8 text-right">{agent.messages}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Templates */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-syne font-bold text-foreground mb-4">Recent templates</h2>
          <div className="space-y-2">
            {SAMPLE_TEMPLATES.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: t.agentColor + "15", color: t.agentColor }}>{t.agent}</span>
                  <span className="text-xs text-foreground">{t.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px]" style={{ color: '#ffffff38' }}>{t.date}</span>
                  <button className="text-[11px] text-primary hover:underline">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Saved Breakdown */}
        <div className="rounded-xl border bg-card p-6" style={{ borderColor: "#FFB80025" }}>
          <h2 className="text-sm font-syne font-bold text-foreground mb-1">Time saved breakdown</h2>
          <p className="text-[11px] font-jakarta mb-4" style={{ color: '#ffffff38' }}>This is the number that justifies your subscription</p>
          <div className="space-y-3">
            {TIME_SAVED.map((t) => (
              <div key={t.template} className="flex items-center justify-between">
                <span className="text-xs text-foreground/70">{t.count} × {t.template}</span>
                <span className="text-xs font-bold" style={{ color: "#FFB800" }}>{t.total} hours saved</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs font-bold text-foreground">Total estimated time saved</span>
              <span className="text-sm font-bold" style={{ color: "#FFB800" }}>23.5 hours</span>
            </div>
          </div>
        </div>
      </main>

      <BrandFooter />
    </div>
  );
};

export default DashboardPage;
