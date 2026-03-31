import { useState, useEffect } from "react";
import { ListChecks, X, Check, Clock, AlertTriangle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ActionItem {
  id: string;
  agent_id: string;
  description: string;
  priority: string;
  due_date: string | null;
  status: string;
  created_at: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#3A6A9C",
  high: "#1A3A5C",
  medium: "#3A6A9C",
  low: "#5AADA0",
};

const ActionQueuePanel = ({ agentColor }: { agentColor: string }) => {
  const [open, setOpen] = useState(false);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from("action_queue")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setActions(data as any);
      });
  }, [user, open]);

  const markDone = async (id: string) => {
    await supabase.from("action_queue").update({ status: "done" }).eq("id", id);
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const deleteAction = async (id: string) => {
    await supabase.from("action_queue").delete().eq("id", id);
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const pendingCount = actions.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors hover:opacity-80 shrink-0"
        style={{ color: agentColor, border: `1px solid ${agentColor}20` }}
        title={`${pendingCount} pending actions`}
      >
        <ListChecks size={10} />
        {pendingCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
            style={{ backgroundColor: "#FF6B00" }}
          >
            {pendingCount}
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
                <ListChecks size={16} style={{ color: agentColor }} />
                <span className="font-syne font-bold text-sm text-foreground">Action Queue</span>
                {pendingCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: agentColor + "20", color: agentColor }}>
                    {pendingCount}
                  </span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            {actions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No pending actions. Agents will add action items here as they identify tasks for you.
              </p>
            ) : (
              <div className="space-y-2">
                {actions.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-2 p-2.5 rounded-lg text-xs"
                    style={{ background: PRIORITY_COLORS[a.priority] + "08", borderLeft: `3px solid ${PRIORITY_COLORS[a.priority] || agentColor}` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: PRIORITY_COLORS[a.priority] + "20", color: PRIORITY_COLORS[a.priority] }}
                        >
                          {a.priority}
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase">{a.agent_id}</span>
                      </div>
                      <p className="text-foreground">{a.description}</p>
                      {a.due_date && (
                        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                          <Clock size={9} />
                          <span className="text-[9px]">Due: {new Date(a.due_date).toLocaleDateString("en-NZ")}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => markDone(a.id)} className="p-1 hover:opacity-70" style={{ color: "#5AADA0" }} title="Mark done">
                        <Check size={12} />
                      </button>
                      <button onClick={() => deleteAction(a.id)} className="p-1 hover:opacity-70 text-destructive" title="Delete">
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

export default ActionQueuePanel;
