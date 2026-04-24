import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Clock, AlertTriangle, CheckCircle2, Send, X } from "lucide-react";

interface FollowUp {
  id: string;
  contact_name: string;
  contact_email: string | null;
  subject: string;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

const ACCENT = "#00FF94";

function getStatus(fu: FollowUp): { label: string; color: string; bg: string } {
  if (fu.status === "sent") return { label: "Sent", color: "rgba(102,187,106,0.9)", bg: "rgba(102,187,106,0.12)" };
  if (!fu.due_date) return { label: "Scheduled", color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.05)" };
  const diff = new Date(fu.due_date).getTime() - Date.now();
  if (diff < 0) return { label: "Overdue", color: "rgba(239,83,80,0.9)", bg: "rgba(239,83,80,0.12)" };
  if (diff < 86400000 * 2) return { label: "Due Soon", color: "rgba(255,179,0,0.9)", bg: "rgba(255,179,0,0.12)" };
  return { label: "Scheduled", color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.05)" };
}

export default function FluxFollowUps() {
  const { user } = useAuth();
  const [items, setItems] = useState<FollowUp[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ contact_name: "", contact_email: "", subject: "", due_date: "", notes: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("follow_ups").select("*").eq("user_id", user.id).order("due_date", { ascending: true })
      .then(({ data }) => { if (data) setItems(data as FollowUp[]); });
  }, [user]);

  const add = async () => {
    if (!user || !form.contact_name.trim() || !form.subject.trim()) return;
    const { data } = await supabase.from("follow_ups").insert({
      user_id: user.id, contact_name: form.contact_name, contact_email: form.contact_email || null,
      subject: form.subject, due_date: form.due_date || null, notes: form.notes || null,
    }).select().single();
    if (data) { setItems(prev => [...prev, data as FollowUp]); setShowAdd(false); setForm({ contact_name: "", contact_email: "", subject: "", due_date: "", notes: "" }); }
  };

  const markSent = async (id: string) => {
    await supabase.from("follow_ups").update({ status: "sent" }).eq("id", id);
    setItems(prev => prev.map(f => f.id === id ? { ...f, status: "sent" } : f));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Follow-Ups</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
          style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {items.map(fu => {
          const s = getStatus(fu);
          return (
            <div key={fu.id} className="rounded-xl p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-display font-semibold truncate" style={{ color: "#E4E4EC" }}>{fu.contact_name}</p>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
                <p className="text-[11px] font-body truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{fu.subject}</p>
                {fu.due_date && <p className="text-[10px] font-mono flex items-center gap-1 mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <Clock size={9} /> {new Date(fu.due_date).toLocaleDateString("en-NZ")}
                </p>}
              </div>
              {fu.status !== "sent" && (
                <button onClick={() => markSent(fu.id)} className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                  style={{ background: "rgba(102,187,106,0.1)", color: "rgba(102,187,106,0.8)" }}>
                  <Send size={12} />
                </button>
              )}
            </div>
          );
        })}
        {items.length === 0 && <p className="text-xs font-body text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No follow-ups yet</p>}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-3" style={{ background: "#0D0D14", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Add Follow-Up</h3>
              <button onClick={() => setShowAdd(false)}><X size={16} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
            </div>
            {[
              { key: "contact_name", label: "Contact Name *", type: "text" },
              { key: "contact_email", label: "Email", type: "email" },
              { key: "subject", label: "Subject *", type: "text" },
              { key: "due_date", label: "Due Date", type: "date" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
              </div>
            ))}
            <button onClick={add} disabled={!form.contact_name.trim() || !form.subject.trim()} className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98] disabled:opacity-30"
              style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
              Add Follow-Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
