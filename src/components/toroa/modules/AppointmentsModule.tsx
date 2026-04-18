import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, MapPin, Plus, X, Pencil } from "lucide-react";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";

export interface Appointment {
  id: string;
  title: string;
  appointment_at: string;
  location?: string;
  category: string;
  status: string;
  member_name?: string;
  is_overdue?: boolean;
}

interface Props {
  appointments: Appointment[];
  onChange?: (next: Appointment[]) => void;
}

const categoryColors: Record<string, string> = {
  medical: "#ef4444", dental: "#3b82f6", vet: KOWHAI, school: POUNAMU, general: "#9CA3AF",
};

const glass = {
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${KOWHAI}15`,
  backdropFilter: "blur(14px)",
};

export default function AppointmentsModule({ appointments, onChange }: Props) {
  const editable = Boolean(onChange);
  const overdue = appointments.filter(a => a.is_overdue);
  const upcoming = appointments.filter(a => !a.is_overdue);
  const ordered = [...overdue, ...upcoming];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Appointment>>({});
  const [adding, setAdding] = useState(false);
  const [newApt, setNewApt] = useState<Partial<Appointment>>({ category: "general" });

  const startEdit = (a: Appointment) => { setEditingId(a.id); setDraft(a); };
  const saveEdit = () => {
    if (!editingId || !onChange) return;
    onChange(appointments.map(a => a.id === editingId ? { ...a, ...draft } as Appointment : a));
    setEditingId(null); setDraft({});
  };
  const remove = (id: string) => onChange?.(appointments.filter(a => a.id !== id));
  const addItem = () => {
    if (!newApt.title || !newApt.appointment_at || !onChange) return;
    onChange([...appointments, {
      id: Date.now().toString(),
      title: newApt.title, appointment_at: newApt.appointment_at, location: newApt.location,
      category: newApt.category || "general", status: "upcoming", member_name: newApt.member_name,
    }]);
    setNewApt({ category: "general" }); setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: "#6B7280" }}>
          <Clock size={14} style={{ color: KOWHAI }} /> Appointments
        </h2>
        {overdue.length > 0 && (
          <span className="text-[9px] font-body px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}>
            <AlertTriangle size={9} /> {overdue.length} overdue
          </span>
        )}
      </div>

      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: `${KOWHAI}20` }} />

        {ordered.map((apt, i) => {
          const accent = categoryColors[apt.category] || KOWHAI;
          const d = new Date(apt.appointment_at);
          const isEditing = editingId === apt.id;
          return (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative mb-3 group"
            >
              <div className="absolute left-[-18px] top-3 w-3 h-3 rounded-full border-2" style={{ borderColor: accent, background: apt.is_overdue ? accent : "transparent" }} />
              <div className="rounded-xl p-4" style={{ ...glass, borderColor: apt.is_overdue ? "rgba(239,68,68,0.2)" : `${KOWHAI}15` }}>
                {isEditing ? (
                  <div className="space-y-2">
                    <input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="w-full text-xs px-2 py-1 rounded outline-none" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${KOWHAI}20`, color: "#1A1D29" }} />
                    <div className="flex gap-2">
                      <input type="datetime-local" value={(draft.appointment_at || "").slice(0,16)} onChange={(e) => setDraft({ ...draft, appointment_at: e.target.value })} className="text-[10px] px-2 py-1 rounded outline-none flex-1" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${KOWHAI}20`, color: "#1A1D29" }} />
                      <select value={draft.category || "general"} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="text-[10px] px-2 py-1 rounded outline-none" style={{ background: `${KOWHAI}10`, color: KOWHAI, border: `1px solid ${KOWHAI}25` }}>
                        {Object.keys(categoryColors).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <input value={draft.location || ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="Location (optional)" className="w-full text-[10px] px-2 py-1 rounded outline-none" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${KOWHAI}20`, color: "#1A1D29" }} />
                    <input value={draft.member_name || ""} onChange={(e) => setDraft({ ...draft, member_name: e.target.value })} placeholder="Who? (optional)" className="w-full text-[10px] px-2 py-1 rounded outline-none" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${KOWHAI}20`, color: "#1A1D29" }} />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingId(null); setDraft({}); }} className="text-[10px] px-2 py-1 rounded" style={{ color: "#9CA3AF" }}>Cancel</button>
                      <button onClick={saveEdit} className="text-[10px] px-3 py-1 rounded font-medium" style={{ background: KOWHAI, color: "white" }}>Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs" style={{ color: apt.is_overdue ? "#fca5a5" : "#1A1D29" }}>{apt.title}</p>
                        {apt.member_name && <p className="font-body text-[10px]" style={{ color: "#9CA3AF" }}>{apt.member_name}</p>}
                        {apt.location && (
                          <p className="font-body text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#9CA3AF" }}>
                            <MapPin size={8} /> {apt.location}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[10px]" style={{ color: "#6B7280" }}>{d.toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</p>
                        <p className="font-mono text-[9px]" style={{ color: "#9CA3AF" }}>{d.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-body px-1.5 py-0.5 rounded-full uppercase" style={{ background: `${accent}15`, color: accent }}>{apt.category}</span>
                        {apt.is_overdue && <span className="text-[8px] font-body px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}>Overdue</span>}
                      </div>
                      {editable && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(apt)} className="p-1 rounded hover:bg-black/5"><Pencil size={11} style={{ color: "#9CA3AF" }} /></button>
                          <button onClick={() => remove(apt.id)} className="p-1 rounded hover:bg-red-50"><X size={12} style={{ color: "#ef4444" }} /></button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {editable && (
        <AnimatePresence>
          {adding ? (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3 space-y-2" style={glass}>
              <input autoFocus value={newApt.title || ""} onChange={(e) => setNewApt({ ...newApt, title: e.target.value })} placeholder="Title" className="w-full text-xs px-2 py-1 rounded outline-none" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${KOWHAI}20`, color: "#1A1D29" }} />
              <div className="flex gap-2">
                <input type="datetime-local" value={newApt.appointment_at || ""} onChange={(e) => setNewApt({ ...newApt, appointment_at: e.target.value })} className="text-[10px] px-2 py-1 rounded outline-none flex-1" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${KOWHAI}20`, color: "#1A1D29" }} />
                <select value={newApt.category || "general"} onChange={(e) => setNewApt({ ...newApt, category: e.target.value })} className="text-[10px] px-2 py-1 rounded outline-none" style={{ background: `${KOWHAI}10`, color: KOWHAI, border: `1px solid ${KOWHAI}25` }}>
                  {Object.keys(categoryColors).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input value={newApt.location || ""} onChange={(e) => setNewApt({ ...newApt, location: e.target.value })} placeholder="Location (optional)" className="w-full text-[10px] px-2 py-1 rounded outline-none" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${KOWHAI}20`, color: "#1A1D29" }} />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setAdding(false); setNewApt({ category: "general" }); }} className="text-[10px] px-2 py-1 rounded" style={{ color: "#9CA3AF" }}>Cancel</button>
                <button onClick={addItem} className="text-[10px] px-3 py-1 rounded font-medium" style={{ background: KOWHAI, color: "white" }}>Add</button>
              </div>
            </motion.div>
          ) : (
            <button onClick={() => setAdding(true)} className="w-full rounded-xl p-3 flex items-center justify-center gap-2 text-[11px] transition-all hover:bg-white/30" style={{ border: `1px dashed ${KOWHAI}30`, color: KOWHAI }}>
              <Plus size={12} /> Add appointment
            </button>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
