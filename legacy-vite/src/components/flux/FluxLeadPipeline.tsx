import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentFunnelChart, AgentPieChart } from "@/components/shared/AgentCharts";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, TrendingUp, Phone, Mail, Building2, X, GripVertical } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  value: number | null;
  stage: string;
  source: string | null;
  notes: string | null;
  score: string | null;
  last_activity: string | null;
  created_at: string;
}

const STAGES = ["new", "contacted", "qualified", "closed"];
const STAGE_LABELS: Record<string, string> = { new: "New", contacted: "Contacted", qualified: "Qualified", closed: "Closed" };

function calcScore(lead: Lead): "hot" | "warm" | "cold" {
  const daysSince = lead.last_activity ? Math.floor((Date.now() - new Date(lead.last_activity).getTime()) / 86400000) : 30;
  const val = lead.value || 0;
  if (val > 5000 && daysSince < 3) return "hot";
  if (daysSince > 14 || (val < 1000 && daysSince > 7)) return "cold";
  return "warm";
}

const SCORE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  hot: { bg: "rgba(239,83,80,0.15)", text: "rgba(239,83,80,0.9)", label: "Hot" },
  warm: { bg: "rgba(255,179,0,0.15)", text: "rgba(255,179,0,0.9)", label: "Warm" },
  cold: { bg: "rgba(66,165,245,0.15)", text: "rgba(66,165,245,0.9)", label: "Cold" },
};

const ACCENT = "#5AADA0";

export default function FluxLeadPipeline({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", value: "", source: "", notes: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("leads").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setLeads(data as Lead[]); });
  }, [user]);

  const addLead = async () => {
    if (!user || !form.name.trim()) return;
    const { data } = await supabase.from("leads").insert({
      user_id: user.id, name: form.name, company: form.company || null, email: form.email || null,
      phone: form.phone || null, value: form.value ? parseFloat(form.value) : null,
      source: form.source || null, notes: form.notes || null, stage: "new",
    }).select().single();
    if (data) { setLeads(prev => [data as Lead, ...prev]); setShowAdd(false); setForm({ name: "", company: "", email: "", phone: "", value: "", source: "", notes: "" }); }
  };

  const moveStage = async (leadId: string, newStage: string) => {
    await supabase.from("leads").update({ stage: newStage, last_activity: new Date().toISOString() }).eq("id", leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage, last_activity: new Date().toISOString() } : l));
  };

  const filtered = leads.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company?.toLowerCase().includes(search.toLowerCase()));
  const totalValue = leads.reduce((s, l) => s + (l.value || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAGES.map(s => {
          const count = leads.filter(l => l.stage === s).length;
          const val = leads.filter(l => l.stage === s).reduce((sum, l) => sum + (l.value || 0), 0);
          return (
            <div key={s} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{STAGE_LABELS[s]}</p>
              <p className="text-lg font-display font-bold" style={{ color: "#E4E4EC" }}>{count}</p>
              <p className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.3)" }}>${val.toLocaleString()} NZD</p>
            </div>
          );
        })}
      </div>

      {/* Sales Funnel & Source Breakdown */}
      {leads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AgentFunnelChart
            title="Sales Funnel"
            color={ACCENT}
            stages={STAGES.map(s => ({ name: STAGE_LABELS[s], value: leads.filter(l => l.stage === s).length }))}
          />
          <AgentPieChart
            title="Leads by Source"
            data={Object.entries(leads.reduce<Record<string, number>>((acc, l) => { const src = l.source || "Unknown"; acc[src] = (acc[src] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))}
            height={180}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[0.98] active:scale-[0.96]"
          style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
          <Plus size={14} /> Add Lead
        </button>
      </div>

      {/* Pipeline columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STAGES.map(stage => (
          <div key={stage} className="rounded-xl p-3 space-y-2 min-h-[200px]" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-display font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>{STAGE_LABELS[stage]}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: `${ACCENT}10`, color: ACCENT }}>{filtered.filter(l => l.stage === stage).length}</span>
            </div>
            {filtered.filter(l => l.stage === stage).map(lead => {
              const score = calcScore(lead);
              const ss = SCORE_STYLES[score];
              return (
                <div key={lead.id} className="rounded-lg p-3 space-y-2 group cursor-pointer transition-all hover:border-opacity-20"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-display font-semibold" style={{ color: "#E4E4EC" }}>{lead.name}</p>
                      {lead.company && <p className="text-[10px] font-body flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}><Building2 size={9} />{lead.company}</p>}
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.text }}>{ss.label}</span>
                  </div>
                  {lead.value && <p className="text-sm font-bold font-mono" style={{ color: "#E4E4EC" }}>${lead.value.toLocaleString()}</p>}
                  <div className="flex gap-1 flex-wrap">
                    {STAGES.filter(s => s !== stage).map(s => (
                      <button key={s} onClick={() => moveStage(lead.id, s)} className="text-[9px] px-1.5 py-0.5 rounded font-body transition-colors hover:opacity-80"
                        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>→ {STAGE_LABELS[s]}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Add lead modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#0D0D14", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Add New Lead</h3>
              <button onClick={() => setShowAdd(false)}><X size={16} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
            </div>
            {[
              { key: "name", label: "Name *", placeholder: "Lead name" },
              { key: "company", label: "Company", placeholder: "Company name" },
              { key: "email", label: "Email", placeholder: "email@example.com" },
              { key: "phone", label: "Phone", placeholder: "+64 ..." },
              { key: "value", label: "Deal Value (NZD)", placeholder: "10000" },
              { key: "source", label: "Source", placeholder: "Website, referral, etc." },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
              </div>
            ))}
            <button onClick={addLead} disabled={!form.name.trim()} className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98] active:scale-[0.96] disabled:opacity-30"
              style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
              Add Lead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
