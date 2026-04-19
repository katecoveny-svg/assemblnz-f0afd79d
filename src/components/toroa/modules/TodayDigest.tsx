import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Calendar, AlertTriangle, CheckCircle, Plus, X, Pencil } from "lucide-react";

const KOWHAI = "#4AA5A8";
const POUNAMU = "#3A7D6E";

export interface DigestItem {
  type: "reminder" | "event" | "alert" | "task";
  text: string;
  time?: string;
  urgent?: boolean;
}

interface Props {
  items: DigestItem[];
  greeting: string;
  onChange?: (items: DigestItem[]) => void;
}

const icons = { reminder: Bell, event: Calendar, alert: AlertTriangle, task: CheckCircle };

const glass = {
  background: "rgba(255,255,255,0.65)",
  border: `1px solid ${KOWHAI}15`,
  backdropFilter: "blur(14px)",
  boxShadow: `0 0 24px ${KOWHAI}06, 0 4px 24px rgba(0,0,0,0.25)`,
};

export default function TodayDigest({ items, greeting, onChange }: Props) {
  const today = new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" });
  const editable = Boolean(onChange);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draftText, setDraftText] = useState("");
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState<DigestItem["type"]>("event");
  const [newTime, setNewTime] = useState("");

  const startEdit = (i: number) => { setEditingIdx(i); setDraftText(items[i].text); };
  const saveEdit = () => {
    if (editingIdx === null || !onChange) return;
    const next = items.map((it, i) => i === editingIdx ? { ...it, text: draftText.trim() || it.text } : it);
    onChange(next); setEditingIdx(null);
  };
  const remove = (i: number) => { onChange?.(items.filter((_, j) => j !== i)); };
  const toggleUrgent = (i: number) => { onChange?.(items.map((it, j) => j === i ? { ...it, urgent: !it.urgent } : it)); };
  const addItem = () => {
    if (!newText.trim() || !onChange) return;
    onChange([...items, { type: newType, text: newText.trim(), time: newTime || undefined }]);
    setNewText(""); setNewTime(""); setNewType("event"); setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg" style={{ fontWeight: 300, color: "#1A1D29" }}>{greeting}</h2>
        <p className="font-body text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{today}</p>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const Icon = icons[item.type];
          const accent = item.urgent ? "#ef4444" : item.type === "event" ? POUNAMU : KOWHAI;
          const isEditing = editingIdx === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl p-4 flex items-start gap-3 group"
              style={{ ...glass, borderColor: item.urgent ? "rgba(239,68,68,0.15)" : `${accent}15` }}
            >
              <button
                onClick={() => editable && toggleUrgent(i)}
                disabled={!editable}
                title={editable ? "Toggle urgent" : ""}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${accent}15`, cursor: editable ? "pointer" : "default" }}
              >
                <Icon size={14} style={{ color: accent }} />
              </button>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    autoFocus
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingIdx(null); }}
                    className="w-full bg-transparent text-xs outline-none border-b"
                    style={{ color: "#1A1D29", borderColor: `${KOWHAI}40` }}
                  />
                ) : (
                  <p
                    onClick={() => editable && startEdit(i)}
                    className={editable ? "cursor-text" : ""}
                    style={{ color: item.urgent ? "#fca5a5" : "#3D4250", fontSize: "12px" }}
                  >
                    {item.text}
                  </p>
                )}
                {item.time && <p className="font-mono text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>{item.time}</p>}
              </div>
              {editable && !isEditing && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(i)} className="p-1 rounded hover:bg-black/5"><Pencil size={11} style={{ color: "#9CA3AF" }} /></button>
                  <button onClick={() => remove(i)} className="p-1 rounded hover:bg-red-50"><X size={12} style={{ color: "#ef4444" }} /></button>
                </div>
              )}
              {item.urgent && !editable && <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: "#ef4444" }} />}
            </motion.div>
          );
        })}
      </div>

      {editable && (
        <AnimatePresence>
          {adding ? (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3 space-y-2" style={glass}>
              <div className="flex gap-2">
                <select value={newType} onChange={(e) => setNewType(e.target.value as DigestItem["type"])} className="text-[10px] rounded-md px-2 py-1 outline-none" style={{ background: `${KOWHAI}10`, color: KOWHAI, border: `1px solid ${KOWHAI}25` }}>
                  <option value="event">Event</option>
                  <option value="reminder">Reminder</option>
                  <option value="alert">Alert</option>
                  <option value="task">Task</option>
                </select>
                <input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Time (optional)" className="text-[10px] rounded-md px-2 py-1 outline-none flex-1" style={{ background: "rgba(255,255,255,0.5)", color: "#1A1D29", border: `1px solid ${KOWHAI}15` }} />
              </div>
              <input
                autoFocus
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addItem(); if (e.key === "Escape") setAdding(false); }}
                placeholder="What's happening?"
                className="w-full text-xs rounded-md px-2 py-1.5 outline-none"
                style={{ background: "rgba(255,255,255,0.6)", color: "#1A1D29", border: `1px solid ${KOWHAI}15` }}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setAdding(false)} className="text-[10px] px-2 py-1 rounded" style={{ color: "#9CA3AF" }}>Cancel</button>
                <button onClick={addItem} className="text-[10px] px-3 py-1 rounded font-medium" style={{ background: KOWHAI, color: "white" }}>Add</button>
              </div>
            </motion.div>
          ) : (
            <button onClick={() => setAdding(true)} className="w-full rounded-xl p-3 flex items-center justify-center gap-2 text-[11px] transition-all hover:bg-white/30" style={{ border: `1px dashed ${KOWHAI}30`, color: KOWHAI }}>
              <Plus size={12} /> Add to today
            </button>
          )}
        </AnimatePresence>
      )}

      {items.length === 0 && !adding && (
        <div className="rounded-xl p-8 text-center" style={glass}>
          <p className="font-body text-xs" style={{ color: "#9CA3AF" }}>Nothing urgent today. Enjoy the calm.</p>
        </div>
      )}
    </div>
  );
}
