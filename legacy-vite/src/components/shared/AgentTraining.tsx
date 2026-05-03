import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Save, Plus, X, Layers, MessageSquare, FileText, HelpCircle, ShieldCheck } from "lucide-react";

const TONES = ["Professional", "Friendly", "Warm", "Bold", "Casual", "Formal"];

interface Props {
  agentId: string;
  agentName: string;
  agentColor: string;
}

export default function AgentTraining({ agentId, agentName, agentColor }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    personality: "",
    tone: "Professional",
    business_context: "",
    faqs: [] as { q: string; a: string }[],
    rules: [] as string[],
  });
  const [saved, setSaved] = useState(false);
  const [newFaq, setNewFaq] = useState({ q: "", a: "" });
  const [newRule, setNewRule] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("agent_training").select("*").eq("user_id", user.id).eq("agent_id", agentId).limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const t = data[0] as any;
          setForm({
            personality: t.personality || "",
            tone: t.tone || "Professional",
            business_context: t.business_context || "",
            faqs: Array.isArray(t.faqs) ? t.faqs : [],
            rules: Array.isArray(t.rules) ? t.rules : [],
          });
        }
      });
  }, [user, agentId]);

  const save = async () => {
    if (!user) return;
    const payload = {
      user_id: user.id, agent_id: agentId,
      personality: form.personality, tone: form.tone,
      business_context: form.business_context,
      faqs: form.faqs, rules: form.rules,
    };
    const { data: existing } = await supabase.from("agent_training").select("id").eq("user_id", user.id).eq("agent_id", agentId).limit(1);
    if (existing && existing.length > 0) {
      await supabase.from("agent_training").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", existing[0].id);
    } else {
      await supabase.from("agent_training").insert(payload);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addFaq = () => {
    if (!newFaq.q.trim() || !newFaq.a.trim()) return;
    setForm(prev => ({ ...prev, faqs: [...prev.faqs, { ...newFaq }] }));
    setNewFaq({ q: "", a: "" });
  };

  const removeFaq = (i: number) => setForm(prev => ({ ...prev, faqs: prev.faqs.filter((_, idx) => idx !== i) }));

  const addRule = () => {
    if (!newRule.trim()) return;
    setForm(prev => ({ ...prev, rules: [...prev.rules, newRule] }));
    setNewRule("");
  };

  const removeRule = (i: number) => setForm(prev => ({ ...prev, rules: prev.rules.filter((_, idx) => idx !== i) }));

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Layers size={16} style={{ color: agentColor }} />
        <h2 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Train {agentName}</h2>
      </div>
      <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
        Customise how {agentName} behaves. Your training data is referenced in every conversation.
      </p>

      {/* Personality */}
      <div>
        <label className="text-[10px] font-mono uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          <MessageSquare size={10} /> Personality
        </label>
        <textarea value={form.personality} onChange={e => setForm(prev => ({ ...prev, personality: e.target.value }))} rows={3}
          placeholder={`Describe ${agentName}'s personality...`}
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
      </div>

      {/* Tone */}
      <div>
        <label className="text-[10px] font-mono uppercase tracking-wider mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>Tone</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map(t => (
            <button key={t} onClick={() => setForm(prev => ({ ...prev, tone: t }))}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all"
              style={{ background: form.tone === t ? `${agentColor}15` : "rgba(255,255,255,0.03)", color: form.tone === t ? agentColor : "rgba(255,255,255,0.4)", border: `1px solid ${form.tone === t ? agentColor + "30" : "rgba(255,255,255,0.05)"}` }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Business Context */}
      <div>
        <label className="text-[10px] font-mono uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          <FileText size={10} /> Business Context
        </label>
        <textarea value={form.business_context} onChange={e => setForm(prev => ({ ...prev, business_context: e.target.value }))} rows={3}
          placeholder="What does your business do? Key info the agent should know..."
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
      </div>

      {/* FAQs */}
      <div>
        <label className="text-[10px] font-mono uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          <HelpCircle size={10} /> FAQs ({form.faqs.length})
        </label>
        <div className="space-y-2">
          {form.faqs.map((faq, i) => (
            <div key={i} className="rounded-lg p-2.5 flex items-start gap-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold" style={{ color: "#E4E4EC" }}>Q: {faq.q}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>A: {faq.a}</p>
              </div>
              <button onClick={() => removeFaq(i)}><X size={12} style={{ color: "rgba(255,255,255,0.3)" }} /></button>
            </div>
          ))}
          <div className="space-y-1.5">
            <input value={newFaq.q} onChange={e => setNewFaq(prev => ({ ...prev, q: e.target.value }))} placeholder="Question"
              className="w-full px-3 py-1.5 rounded-lg text-[10px] font-body bg-transparent border outline-none"
              style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
            <input value={newFaq.a} onChange={e => setNewFaq(prev => ({ ...prev, a: e.target.value }))} placeholder="Answer"
              className="w-full px-3 py-1.5 rounded-lg text-[10px] font-body bg-transparent border outline-none"
              style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
            <button onClick={addFaq} className="text-[10px] font-medium flex items-center gap-1" style={{ color: agentColor }}>
              <Plus size={10} /> Add FAQ
            </button>
          </div>
        </div>
      </div>

      {/* Rules */}
      <div>
        <label className="text-[10px] font-mono uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          <ShieldCheck size={10} /> Rules ({form.rules.length})
        </label>
        <div className="space-y-1.5">
          {form.rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-[10px] font-body flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>{rule}</p>
              <button onClick={() => removeRule(i)}><X size={12} style={{ color: "rgba(255,255,255,0.3)" }} /></button>
            </div>
          ))}
          <div className="flex gap-1.5">
            <input value={newRule} onChange={e => setNewRule(e.target.value)} placeholder="Add a rule..." onKeyDown={e => e.key === "Enter" && addRule()}
              className="flex-1 px-3 py-1.5 rounded-lg text-[10px] font-body bg-transparent border outline-none"
              style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
            <button onClick={addRule} className="text-[10px] font-medium px-2" style={{ color: agentColor }}>
              <Plus size={10} />
            </button>
          </div>
        </div>
      </div>

      <button onClick={save} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98]"
        style={{ background: saved ? "rgba(102,187,106,0.15)" : `${agentColor}20`, color: saved ? "rgba(102,187,106,0.9)" : agentColor, border: `1px solid ${saved ? "rgba(102,187,106,0.3)" : agentColor + "30"}` }}>
        <Save size={12} /> {saved ? "Saved!" : "Save Training Data"}
      </button>
    </div>
  );
}
