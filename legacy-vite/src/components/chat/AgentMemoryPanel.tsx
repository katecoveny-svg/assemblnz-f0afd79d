import { useState, useEffect } from "react";
import { Layers, X, Trash2, Edit2, Check, RefreshCw, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MemoryItem {
  id: string;
  memory_key: string;
  memory_value: any;
  updated_at: string;
}

interface SharedContextItem {
  id: string;
  context_key: string;
  context_value: any;
  source_agent: string;
  confidence: number;
  updated_at: string;
}

interface ConversationSummary {
  id: string;
  agent_id: string;
  summary: string;
  created_at: string;
}

interface Props {
  agentId: string;
  agentColor: string;
  agentName: string;
}

const AgentMemoryPanel = ({ agentId, agentColor, agentName }: Props) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"business" | "agent" | "activity">("business");
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [sharedContext, setSharedContext] = useState<SharedContextItem[]>([]);
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !open) return;

    // Load agent memory
    supabase
      .from("agent_memory")
      .select("*")
      .eq("user_id", user.id)
      .eq("agent_id", agentId)
      .order("updated_at", { ascending: false })
      .then(({ data }) => { if (data) setMemories(data as any); });

    // Load shared context
    supabase
      .from("shared_context")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => { if (data) setSharedContext(data as any); });

    // Load recent conversation summaries from OTHER agents
    supabase
      .from("conversation_summaries")
      .select("*")
      .eq("user_id", user.id)
      .neq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => { if (data) setSummaries(data as any); });
  }, [user, agentId, open]);

  const handleDeleteMemory = async (id: string) => {
    await supabase.from("agent_memory").delete().eq("id", id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDeleteContext = async (id: string) => {
    await supabase.from("shared_context").delete().eq("id", id);
    setSharedContext((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveEdit = async (id: string, table: "agent_memory" | "shared_context") => {
    try {
      const parsed = JSON.parse(editValue);
      if (table === "agent_memory") {
        await supabase.from("agent_memory").update({ memory_value: parsed }).eq("id", id);
        setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, memory_value: parsed } : m)));
      } else {
        await supabase.from("shared_context").update({ context_value: parsed }).eq("id", id);
        setSharedContext((prev) => prev.map((c) => (c.id === id ? { ...c, context_value: parsed } : c)));
      }
    } catch {
      if (table === "agent_memory") {
        await supabase.from("agent_memory").update({ memory_value: editValue }).eq("id", id);
        setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, memory_value: editValue } : m)));
      } else {
        await supabase.from("shared_context").update({ context_value: editValue }).eq("id", id);
        setSharedContext((prev) => prev.map((c) => (c.id === id ? { ...c, context_value: editValue } : c)));
      }
    }
    setEditingId(null);
  };

  const handleClearAll = async () => {
    if (!user || !confirm("Clear all memory and shared context? This cannot be undone.")) return;
    await supabase.from("agent_memory").delete().eq("user_id", user.id).eq("agent_id", agentId);
    await supabase.from("shared_context").delete().eq("user_id", user.id);
    setMemories([]);
    setSharedContext([]);
  };

  const totalCount = memories.length + sharedContext.length;
  const tabs = [
    { key: "business" as const, label: "Business Profile", count: sharedContext.length },
    { key: "agent" as const, label: `${agentName} Memory`, count: memories.length },
    { key: "activity" as const, label: "Recent Activity", count: summaries.length },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors hover:opacity-80 shrink-0"
        style={{ color: agentColor, border: `1px solid ${agentColor}20` }}
        title="What I know about your business"
      >
        <Layers size={10} />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-foreground" style={{ backgroundColor: agentColor }}>
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md h-full bg-card border-l overflow-y-auto animate-in slide-in-from-right"
            style={{ borderColor: agentColor + "30" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers size={18} style={{ color: agentColor }} />
                  <span className="font-display font-bold text-sm text-foreground">What I know about your business</span>
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              {/* Tab bar */}
              <div className="flex gap-1">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-colors"
                    style={{
                      background: tab === t.key ? agentColor + "20" : "transparent",
                      color: tab === t.key ? agentColor : "hsl(var(--muted-foreground))",
                      border: `1px solid ${tab === t.key ? agentColor + "40" : "transparent"}`,
                    }}
                  >
                    {t.label}
                    {t.count > 0 && <span className="ml-0.5 opacity-60">({t.count})</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 space-y-2">
              {/* Business Profile Tab */}
              {tab === "business" && (
                sharedContext.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No shared business context yet. As you chat with agents, they'll learn about your business and share knowledge here.
                  </p>
                ) : (
                  sharedContext.map((c) => (
                    <div key={c.id} className="flex items-start gap-2 p-2.5 rounded-lg text-xs" style={{ background: agentColor + "08", border: `1px solid ${agentColor}15` }}>
                      <Globe size={12} className="shrink-0 mt-0.5" style={{ color: agentColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground capitalize">{c.context_key.replace(/\./g, " › ").replace(/_/g, " ")}</span>
                          <span className="text-[8px] px-1 py-0.5 rounded bg-background text-muted-foreground">{Math.round(c.confidence * 100)}%</span>
                        </div>
                        {editingId === c.id ? (
                          <div className="mt-1 flex gap-1">
                            <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 px-2 py-1 rounded bg-background border border-border text-xs" autoFocus />
                            <button onClick={() => handleSaveEdit(c.id, "shared_context")} className="p-1 hover:opacity-70" style={{ color: agentColor }}><Check size={12} /></button>
                          </div>
                        ) : (
                          <p className="text-muted-foreground mt-0.5 break-words">{typeof c.context_value === "object" ? JSON.stringify(c.context_value) : String(c.context_value)}</p>
                        )}
                        <span className="text-[9px] text-muted-foreground/60 mt-1 block">From {c.source_agent} • {timeAgo(c.updated_at)}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { setEditingId(c.id); setEditValue(typeof c.context_value === "object" ? JSON.stringify(c.context_value) : String(c.context_value)); }} className="p-1 hover:opacity-70 text-muted-foreground"><Edit2 size={10} /></button>
                        <button onClick={() => handleDeleteContext(c.id)} className="p-1 hover:opacity-70 text-destructive"><Trash2 size={10} /></button>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* Agent Memory Tab */}
              {tab === "agent" && (
                memories.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    {agentName} hasn't learned anything about you yet. Start chatting and key facts will be remembered.
                  </p>
                ) : (
                  memories.map((m) => (
                    <div key={m.id} className="flex items-start gap-2 p-2.5 rounded-lg text-xs" style={{ background: agentColor + "08", border: `1px solid ${agentColor}15` }}>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-foreground capitalize">{m.memory_key.replace(/_/g, " ")}</span>
                        {editingId === m.id ? (
                          <div className="mt-1 flex gap-1">
                            <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1 px-2 py-1 rounded bg-background border border-border text-xs" autoFocus />
                            <button onClick={() => handleSaveEdit(m.id, "agent_memory")} className="p-1 hover:opacity-70" style={{ color: agentColor }}><Check size={12} /></button>
                          </div>
                        ) : (
                          <p className="text-muted-foreground mt-0.5 break-words">{typeof m.memory_value === "object" ? JSON.stringify(m.memory_value) : String(m.memory_value)}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { setEditingId(m.id); setEditValue(typeof m.memory_value === "object" ? JSON.stringify(m.memory_value) : String(m.memory_value)); }} className="p-1 hover:opacity-70 text-muted-foreground"><Edit2 size={10} /></button>
                        <button onClick={() => handleDeleteMemory(m.id)} className="p-1 hover:opacity-70 text-destructive"><Trash2 size={10} /></button>
                      </div>
                    </div>
                  ))
                )
              )}

              {/* Recent Activity Tab */}
              {tab === "activity" && (
                summaries.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No recent conversations with other agents. Activity summaries will appear here as you use different agents.
                  </p>
                ) : (
                  summaries.map((s) => (
                    <div key={s.id} className="p-2.5 rounded-lg text-xs" style={{ background: agentColor + "06", border: `1px solid ${agentColor}10` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-foreground">{s.agent_id}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="text-muted-foreground/60">{timeAgo(s.created_at)}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{s.summary}</p>
                    </div>
                  ))
                )
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
              <button
                onClick={handleClearAll}
                className="w-full text-xs text-destructive/70 hover:text-destructive py-2 rounded-lg border border-destructive/20 hover:border-destructive/40 transition-colors"
              >
                <Trash2 size={10} className="inline mr-1" /> Clear All Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentMemoryPanel;
