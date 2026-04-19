/**
 * MemoryPanel — slide-out "What I remember" panel for agent chat.
 * Shows: shared_context, agent_memory, cross-agent summaries, compliance updates.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Database, Clock, Shield, Trash2, Edit2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BONE = "#F5F0E8";
const TEAL_ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  agentId: string;
  accentColor: string;
}

const glass = {
  background: "rgba(255,255,255,0.65)",
  border: `1px solid rgba(255,255,255,0.5)`,
  backdropFilter: "blur(14px)",
};

const impactColors: Record<string, string> = {
  high: "#ef4444",
  medium: TEAL_ACCENT,
  low: POUNAMU,
};

export default function MemoryPanel({ open, onClose, userId, agentId, accentColor }: Props) {
  const [sharedCtx, setSharedCtx] = useState<any[]>([]);
  const [agentMem, setAgentMem] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (!open || !userId) return;
    loadAll();
  }, [open, userId, agentId]);

  const loadAll = async () => {
    const [c, m, s, u] = await Promise.all([
      supabase.from("shared_context").select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
      supabase.from("agent_memory").select("*").eq("user_id", userId).eq("agent_id", agentId).order("updated_at", { ascending: false }).limit(10),
      supabase.from("conversation_summaries").select("agent_id, summary, created_at").eq("user_id", userId).neq("agent_id", agentId).order("created_at", { ascending: false }).limit(5),
      supabase.from("compliance_updates").select("title, change_summary, impact_level, effective_date").contains("affected_agents", [agentId]).eq("verified", true).order("created_at", { ascending: false }).limit(3),
    ]);
    setSharedCtx(c.data || []);
    setAgentMem(m.data || []);
    setSummaries(s.data || []);
    setCompliance(u.data || []);
  };

  const deleteContext = async (id: string) => {
    await supabase.from("shared_context").delete().eq("id", id);
    setSharedCtx(prev => prev.filter(c => c.id !== id));
  };

  const saveEdit = async (item: any) => {
    await supabase.from("shared_context").update({ context_value: { value: editValue } }).eq("id", item.id);
    setSharedCtx(prev => prev.map(c => c.id === item.id ? { ...c, context_value: { value: editValue } } : c));
    setEditingKey(null);
  };

  const clearAllMemory = async () => {
    if (!confirm("This will clear all stored context and memory for your account. Are you sure?")) return;
    await Promise.all([
      supabase.from("shared_context").delete().eq("user_id", userId),
      supabase.from("agent_memory").delete().eq("user_id", userId),
      supabase.from("conversation_summaries").delete().eq("user_id", userId),
    ]);
    setSharedCtx([]);
    setAgentMem([]);
    setSummaries([]);
  };

  const timeSince = (date: string) => {
    const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (d === 0) return "today";
    if (d === 1) return "yesterday";
    return `${d} days ago`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[61] w-[380px] max-w-[90vw] overflow-y-auto"
            style={{ background: "rgba(9,9,15,0.97)", borderLeft: `1px solid ${accentColor}20`, backdropFilter: "blur(24px)" }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 p-4 flex items-center justify-between" style={{ background: "rgba(9,9,15,0.95)", borderBottom: `1px solid rgba(255,255,255,0.5)` }}>
              <div className="flex items-center gap-2">
                <Brain size={18} style={{ color: accentColor }} />
                <span className="text-sm font-light uppercase tracking-[2px]" style={{ color: "#1A1D29", fontFamily: "Lato, sans-serif" }}>
                  What I remember
                </span>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.5)" }}>
                <X size={14} style={{ color: "#6B7280" }} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Section 1: Business Profile */}
              <div>
                <h3 className="text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: `${TEAL_ACCENT}CC`, fontFamily: "Lato, sans-serif" }}>
                  <Database size={10} /> Business Profile
                </h3>
                {sharedCtx.length === 0 ? (
                  <p className="text-[11px]" style={{ color: "#9CA3AF" }}>No context stored yet. Chat with agents to build your profile.</p>
                ) : (
                  <div className="space-y-1.5">
                    {sharedCtx.map((item) => (
                      <div key={item.id} className="rounded-lg p-2.5 group" style={glass}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-mono" style={{ color: "#9CA3AF" }}>{item.context_key}</p>
                            {editingKey === item.id ? (
                              <div className="flex gap-1 mt-1">
                                <input
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  className="flex-1 bg-white/5 rounded px-2 py-1 text-xs outline-none"
                                  style={{ color: "#1A1D29", border: `1px solid ${accentColor}30` }}
                                  autoFocus
                                />
                                <button onClick={() => saveEdit(item)} className="px-1.5"><Check size={12} style={{ color: POUNAMU }} /></button>
                              </div>
                            ) : (
                              <p className="text-xs mt-0.5" style={{ color: "#3D4250" }}>
                                {typeof item.context_value === "object" ? JSON.stringify(item.context_value?.value || item.context_value) : String(item.context_value)}
                              </p>
                            )}
                            <p className="text-[9px] mt-0.5" style={{ color: "#9CA3AF" }}>
                              Learned from {item.source_agent}, {timeSince(item.updated_at)}
                            </p>
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingKey(item.id); setEditValue(typeof item.context_value === "object" ? JSON.stringify(item.context_value?.value || item.context_value) : String(item.context_value)); }} className="p-1">
                              <Edit2 size={10} style={{ color: "#9CA3AF" }} />
                            </button>
                            <button onClick={() => deleteContext(item.id)} className="p-1">
                              <Trash2 size={10} style={{ color: "#ef444480" }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Agent Memory */}
              <div>
                <h3 className="text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: `${POUNAMU}CC`, fontFamily: "Lato, sans-serif" }}>
                  <Brain size={10} /> Agent Memory
                </h3>
                {agentMem.length === 0 ? (
                  <p className="text-[11px]" style={{ color: "#9CA3AF" }}>No agent-specific memory yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {agentMem.map((m, i) => (
                      <div key={i} className="rounded-lg p-2.5" style={glass}>
                        <p className="text-[10px] font-mono" style={{ color: "#9CA3AF" }}>{m.memory_key}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#3D4250" }}>
                          {typeof m.memory_value === "object" ? JSON.stringify(m.memory_value) : String(m.memory_value)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Recent Activity */}
              <div>
                <h3 className="text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: "#6B7280", fontFamily: "Lato, sans-serif" }}>
                  <Clock size={10} /> Recent Activity
                </h3>
                {summaries.length === 0 ? (
                  <p className="text-[11px]" style={{ color: "#9CA3AF" }}>No cross-agent activity yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {summaries.map((s, i) => (
                      <div key={i} className="rounded-lg p-2.5" style={glass}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${accentColor}15`, color: accentColor }}>
                            {s.agent_id}
                          </span>
                          <span className="text-[9px]" style={{ color: "#9CA3AF" }}>{timeSince(s.created_at)}</span>
                        </div>
                        <p className="text-xs" style={{ color: "#6B7280" }}>{s.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Compliance Updates */}
              <div>
                <h3 className="text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: "#6B7280", fontFamily: "Lato, sans-serif" }}>
                  <Shield size={10} /> Compliance Updates
                </h3>
                {compliance.length === 0 ? (
                  <p className="text-[11px]" style={{ color: "#9CA3AF" }}>No recent compliance updates.</p>
                ) : (
                  <div className="space-y-1.5">
                    {compliance.map((u, i) => (
                      <div key={i} className="rounded-lg p-2.5" style={glass}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[8px] uppercase px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: `${impactColors[u.impact_level] || TEAL_ACCENT}18`, color: impactColors[u.impact_level] || TEAL_ACCENT }}>
                            {u.impact_level}
                          </span>
                          {u.effective_date && <span className="text-[9px]" style={{ color: "#9CA3AF" }}>Effective {u.effective_date}</span>}
                        </div>
                        <p className="text-xs font-medium" style={{ color: "#1A1D29" }}>{u.title}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>{u.change_summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear all */}
              <button
                onClick={clearAllMemory}
                className="w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all hover:bg-[#C85A54]/10"
                style={{ border: "1px solid rgba(239,68,68,0.15)", color: "#fca5a5" }}
              >
                <Trash2 size={12} /> Clear All Memory
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
