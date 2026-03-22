import { useState, useEffect } from "react";
import { Brain, X, Trash2, Edit2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MemoryItem {
  id: string;
  memory_key: string;
  memory_value: any;
  updated_at: string;
}

interface Props {
  agentId: string;
  agentColor: string;
  agentName: string;
}

const AgentMemoryPanel = ({ agentId, agentColor, agentName }: Props) => {
  const [open, setOpen] = useState(false);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from("agent_memory")
      .select("*")
      .eq("user_id", user.id)
      .eq("agent_id", agentId)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (data) setMemories(data as any);
      });
  }, [user, agentId, open]);

  const handleDelete = async (id: string) => {
    await supabase.from("agent_memory").delete().eq("id", id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const parsed = JSON.parse(editValue);
      await supabase.from("agent_memory").update({ memory_value: parsed }).eq("id", id);
      setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, memory_value: parsed } : m)));
    } catch {
      await supabase.from("agent_memory").update({ memory_value: editValue }).eq("id", id);
      setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, memory_value: editValue } : m)));
    }
    setEditingId(null);
  };

  const count = memories.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors hover:opacity-80 shrink-0"
        style={{ color: agentColor, border: `1px solid ${agentColor}20` }}
        title={`${agentName} remembers ${count} facts about you`}
      >
        <Brain size={10} />
        {count > 0 && (
          <span
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
            style={{ backgroundColor: agentColor }}
          >
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-xl border bg-card p-4 max-h-[70vh] overflow-y-auto"
            style={{ borderColor: agentColor + "30" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain size={16} style={{ color: agentColor }} />
                <span className="font-syne font-bold text-sm text-foreground">{agentName}'s Memory</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            {memories.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                {agentName} hasn't learned anything about you yet. Start chatting and key facts will be remembered automatically.
              </p>
            ) : (
              <div className="space-y-2">
                {memories.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-2 p-2 rounded-lg text-xs"
                    style={{ background: agentColor + "08", border: `1px solid ${agentColor}15` }}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-foreground capitalize">
                        {m.memory_key.replace(/_/g, " ")}
                      </span>
                      {editingId === m.id ? (
                        <div className="mt-1 flex gap-1">
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-2 py-1 rounded bg-background border border-border text-xs"
                            autoFocus
                          />
                          <button onClick={() => handleSaveEdit(m.id)} className="p-1 hover:opacity-70" style={{ color: agentColor }}>
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-muted-foreground mt-0.5 break-words">
                          {typeof m.memory_value === "object" ? JSON.stringify(m.memory_value) : String(m.memory_value)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { setEditingId(m.id); setEditValue(typeof m.memory_value === "object" ? JSON.stringify(m.memory_value) : String(m.memory_value)); }}
                        className="p-1 hover:opacity-70 text-muted-foreground"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-1 hover:opacity-70 text-destructive">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AgentMemoryPanel;
