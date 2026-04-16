import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Check, Trash2, ListTodo, AlertTriangle, Clock, User } from "lucide-react";

const PRIORITIES = {
  low: { label: "Low", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  normal: { label: "Normal", color: "text-blue-400", bg: "bg-[#1A3A5C]/10", border: "border-blue-500/20" },
  high: { label: "High", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  urgent: { label: "Urgent", color: "text-[#C85A54]", bg: "bg-[#C85A54]/10", border: "border-red-500/20" },
};

const TASK_CATEGORIES = [
  { value: "chore", label: "Chore" },
  { value: "errand", label: "Errand" },
  { value: "school", label: "School" },
  { value: "admin", label: "Admin" },
  { value: "home", label: "Home" },
  { value: "general", label: "General" },
];

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: keyof typeof PRIORITIES;
  status: string;
  category: string;
  created_at: string;
}

export default function HelmTasks({ familyId }: { familyId: string | null }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");
  const [form, setForm] = useState({ title: "", assignedTo: "", priority: "normal" as keyof typeof PRIORITIES, category: "general", dueDate: "" });

  useEffect(() => {
    if (!familyId) return;
    const load = async () => {
      const { data } = await supabase
        .from("helm_tasks" as any)
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false });
      setTasks((data || []) as unknown as Task[]);
    };
    load();

    const channel = supabase
      .channel(`tasks-${familyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "helm_tasks", filter: `family_id=eq.${familyId}` }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [familyId]);

  const addTask = useCallback(async () => {
    if (!form.title.trim() || !familyId || !user) return;
    await supabase.from("helm_tasks" as any).insert({
      family_id: familyId,
      title: form.title.trim(),
      assigned_to: form.assignedTo || null,
      priority: form.priority,
      category: form.category,
      due_date: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      created_by: user.id,
    } as any);
    setForm({ title: "", assignedTo: "", priority: "normal", category: "general", dueDate: "" });
    setShowForm(false);
  }, [form, familyId, user]);

  const toggleTask = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await supabase.from("helm_tasks" as any).update({ status: newStatus } as any).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from("helm_tasks" as any).delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const filtered = tasks.filter(t => {
    if (filter === "pending") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const pendingCount = tasks.filter(t => t.status !== "completed").length;
  const urgentCount = tasks.filter(t => t.priority === "urgent" && t.status !== "completed").length;

  if (!familyId) {
    return (
      <div className="text-center py-12">
        <ListTodo className="w-10 h-10 text-pounamu/40 mx-auto mb-3" />
        <p className="text-sm text-white/40">Set up your family first to use tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-pounamu" />
            Tasks
          </h2>
          {pendingCount > 0 && <p className="text-xs text-white/40 mt-0.5">{pendingCount} pending</p>}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-pounamu text-foreground inline-flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {urgentCount > 0 && (
        <div className="bg-[#C85A54]/10 border border-red-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#C85A54]" />
          <span className="text-xs font-medium text-red-300">{urgentCount} urgent task{urgentCount !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1.5">
        {(["pending", "all", "completed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[10px] px-3 py-1.5 rounded-lg font-medium border capitalize ${filter === f ? "bg-pounamu text-foreground border-pounamu" : "bg-white/5 border-gray-200 text-white/40"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white/5 border border-gray-200 rounded-xl p-4 space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Task description" autoFocus
            className="w-full text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pounamu/50" />
          <div className="flex gap-2">
            <input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              placeholder="Assign to"
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pounamu/50" />
            <input value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              type="date"
              className="text-sm px-3 py-2 rounded-lg bg-white/5 border border-gray-200 text-foreground focus:outline-none focus:ring-2 focus:ring-pounamu/50" />
          </div>
          <div className="flex gap-1.5">
            {(Object.keys(PRIORITIES) as (keyof typeof PRIORITIES)[]).map(p => (
              <button key={p} onClick={() => setForm({ ...form, priority: p })}
                className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium capitalize ${form.priority === p ? "bg-pounamu text-foreground border-pounamu" : "bg-white/5 border-gray-200 text-white/40"}`}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={addTask} className="w-full text-sm py-2 rounded-lg font-semibold bg-pounamu text-foreground">Add Task</button>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map(task => {
          const p = PRIORITIES[task.priority];
          const done = task.status === "completed";
          return (
            <div key={task.id} className={`bg-white/5 rounded-xl border border-gray-100 p-3 flex items-start gap-3 transition-colors ${done ? "opacity-40" : ""}`}>
              <button onClick={() => toggleTask(task.id, task.status)}
                className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all ${done ? "bg-[#3A7D6E] border-emerald-500 text-foreground" : "border-gray-300 hover:border-white/40"}`}>
                {done && <Check className="w-3 h-3" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {task.priority !== "normal" && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${p.bg} ${p.color} ${p.border}`}>{p.label}</span>
                  )}
                </div>
                <div className={`text-sm mt-0.5 ${done ? "line-through text-gray-400" : "text-white/80"}`}>{task.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  {task.assigned_to && (
                    <span className="text-[10px] text-gray-400 inline-flex items-center gap-1"><User className="w-2.5 h-2.5" />{task.assigned_to}</span>
                  )}
                  {task.due_date && (
                    <span className="text-[10px] text-gray-400 inline-flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(task.due_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>
                  )}
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-white/20 hover:text-[#C85A54] transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">{filter === "completed" ? "No completed tasks" : "All clear!"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
