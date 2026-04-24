import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Send, FileEdit, Eye, BarChart3, X, Sparkles } from "lucide-react";
import { AgentBarChart, AgentFunnelChart } from "@/components/shared/AgentCharts";

interface Campaign {
  id: string;
  name: string;
  goal: string | null;
  status: string;
  subject_line: string | null;
  audience: string | null;
  tone: string | null;
  recipient_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
}

const ACCENT = "#E040FB";
const STATUSES: Record<string, { bg: string; color: string }> = {
  draft: { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" },
  scheduled: { bg: "rgba(255,179,0,0.12)", color: "rgba(255,179,0,0.9)" },
  sent: { bg: "rgba(102,187,106,0.12)", color: "rgba(102,187,106,0.9)" },
};

export default function PrismCampaigns({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", goal: "", audience: "", tone: "Professional" });

  useEffect(() => {
    if (!user) return;
    supabase.from("campaigns").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setCampaigns(data as Campaign[]); });
  }, [user]);

  const add = async () => {
    if (!user || !form.name.trim()) return;
    const { data } = await supabase.from("campaigns").insert({
      user_id: user.id, name: form.name, goal: form.goal || null, audience: form.audience || null, tone: form.tone,
    }).select().single();
    if (data) { setCampaigns(prev => [data as Campaign, ...prev]); setShowAdd(false); setForm({ name: "", goal: "", audience: "", tone: "Professional" }); }
  };

  const generateCopy = (campaign: Campaign) => {
    if (onSendToChat) {
      onSendToChat(`Write an email campaign for "${campaign.name}". Goal: ${campaign.goal || "engagement"}. Audience: ${campaign.audience || "general"}. Tone: ${campaign.tone || "Professional"}. Generate 3 subject line options with notes on why each works, a full email body with preheader, greeting, hook, body, CTA, and closing. Include tips for improvement.`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Campaigns</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
          style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
          <Plus size={12} /> New Campaign
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: campaigns.length },
          { label: "Open Rate", value: campaigns.length > 0 ? Math.round(campaigns.reduce((s, c) => s + (c.recipient_count > 0 ? c.open_count / c.recipient_count : 0), 0) / campaigns.length * 100) + "%" : "—" },
          { label: "Click Rate", value: campaigns.length > 0 ? Math.round(campaigns.reduce((s, c) => s + (c.recipient_count > 0 ? c.click_count / c.recipient_count : 0), 0) / campaigns.length * 100) + "%" : "—" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] font-mono uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
            <p className="text-lg font-display font-bold" style={{ color: "#E4E4EC" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Campaign Performance Charts */}
      {campaigns.filter(c => c.status === "sent").length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AgentBarChart
            title="Campaign Opens vs Clicks"
            data={campaigns.filter(c => c.status === "sent").slice(0, 6).map(c => ({ name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name, opens: c.open_count, clicks: c.click_count }))}
            dataKey="opens"
            color={ACCENT}
            height={180}
          />
          <AgentFunnelChart
            title="Engagement Funnel"
            color={ACCENT}
            stages={[
              { name: "Recipients", value: campaigns.reduce((s, c) => s + c.recipient_count, 0) },
              { name: "Opened", value: campaigns.reduce((s, c) => s + c.open_count, 0) },
              { name: "Clicked", value: campaigns.reduce((s, c) => s + c.click_count, 0) },
            ]}
          />
        </div>
      )}

      <div className="space-y-2">
        {campaigns.map(c => {
          const st = STATUSES[c.status] || STATUSES.draft;
          return (
            <div key={c.id} className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-display font-semibold" style={{ color: "#E4E4EC" }}>{c.name}</p>
                  {c.goal && <p className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>{c.goal}</p>}
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full capitalize" style={{ background: st.bg, color: st.color }}>{c.status}</span>
              </div>
              {c.subject_line && <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>Subject: {c.subject_line}</p>}
              <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                <span>{c.recipient_count} recipients</span>
                <span>{c.open_count} opens</span>
                <span>{c.click_count} clicks</span>
              </div>
              <button onClick={() => generateCopy(c)} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg transition-colors"
                style={{ color: ACCENT, background: `${ACCENT}10` }}>
                <Sparkles size={10} /> Generate Copy with AI
              </button>
            </div>
          );
        })}
        {campaigns.length === 0 && <p className="text-xs font-body text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No campaigns yet</p>}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-3" style={{ background: "#0D0D14", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>New Campaign</h3>
              <button onClick={() => setShowAdd(false)}><X size={16} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
            </div>
            {[
              { key: "name", label: "Campaign Name *" },
              { key: "goal", label: "Goal" },
              { key: "audience", label: "Target Audience" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>Tone</label>
              <select value={form.tone} onChange={e => setForm(prev => ({ ...prev, tone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }}>
                {["Professional", "Friendly", "Urgent", "Inspirational", "Conversational"].map(t => <option key={t} value={t} style={{ background: "#0D0D14" }}>{t}</option>)}
              </select>
            </div>
            <button onClick={add} disabled={!form.name.trim()} className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98] disabled:opacity-30"
              style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
              Create Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
