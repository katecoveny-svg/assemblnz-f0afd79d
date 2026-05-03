import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Briefcase, Plus, X } from "lucide-react";
import { toast } from "sonner";
import FluxPipelineChart from "./FluxPipelineChart";

interface Deal {
  id: string;
  account_name: string;
  value_nzd: number;
  stage: string;
  next_action: string | null;
  days_in_stage: number | null;
  owner: string | null;
}

const STAGES = ["discovery", "proposal", "negotiation", "closed_won", "closed_lost"] as const;
const STAGE_LABEL: Record<string, string> = {
  discovery: "Discovery",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed won",
  closed_lost: "Closed lost",
};

export default function FluxDealRoom() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ account_name: "", value_nzd: "", next_action: "", owner: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("deals").select("*").eq("user_id", user.id).then(({ data }) => data && setDeals(data as Deal[]));
  }, [user]);

  const addDeal = async () => {
    if (!user || !form.account_name.trim()) return;
    const { data, error } = await supabase.from("deals").insert({
      user_id: user.id,
      account_name: form.account_name,
      value_nzd: form.value_nzd ? parseFloat(form.value_nzd) : 0,
      next_action: form.next_action,
      owner: form.owner,
      stage: "discovery",
    }).select().single();
    if (error) return toast.error("Failed");
    setDeals((p) => [data as Deal, ...p]);
    setShowAdd(false);
    setForm({ account_name: "", value_nzd: "", next_action: "", owner: "" });
    toast.success("Deal added");
  };

  const moveStage = async (id: string, stage: string) => {
    await supabase.from("deals").update({ stage, days_in_stage: 0 }).eq("id", id);
    setDeals((p) => p.map((d) => (d.id === id ? { ...d, stage } : d)));
  };

  const accent = (v: number) =>
    v > 50000 ? "border-l-4 border-l-[#D9BC7A]" : v > 10000 ? "border-l-4 border-l-[#C9D8D0]" : "";

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto pt-20 lg:pt-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={18} className="text-[#D9BC7A]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Pipeline</span>
          </div>
          <h1 className="font-display text-3xl text-[#6F6158]">Deal room</h1>
          <p className="font-body text-sm text-[#9D8C7D] mt-1">Track every active opportunity from discovery to close.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-sm font-medium rounded-xl px-5 py-2.5 transition-colors"
        >
          <Plus size={16} /> Add deal
        </button>
      </div>

      <div className="mb-8">
        <FluxPipelineChart deals={deals} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          return (
            <div key={stage} className="bg-white/60 rounded-3xl p-4 min-h-[300px]">
              <div className="font-mono text-xs uppercase tracking-wider text-[#9D8C7D] mb-3">
                {STAGE_LABEL[stage]} <span className="text-[#6F6158]">({stageDeals.length})</span>
              </div>
              <div className="space-y-3">
                {stageDeals.map((d) => (
                  <div
                    key={d.id}
                    className={`bg-white/80 rounded-2xl shadow-sm p-4 border border-[#D8C8B4]/20 ${accent(d.value_nzd)}`}
                  >
                    <div className="font-body font-medium text-sm text-[#6F6158]">{d.account_name}</div>
                    <div className="font-mono text-sm text-[#D9BC7A] mt-1">
                      ${Number(d.value_nzd).toLocaleString("en-NZ")}
                    </div>
                    {d.next_action && (
                      <div className="font-body text-xs text-[#9D8C7D] mt-2">{d.next_action}</div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {STAGES.filter((s) => s !== stage).map((s) => (
                        <button
                          key={s}
                          onClick={() => moveStage(d.id, s)}
                          className="text-[10px] px-2 py-0.5 rounded font-body text-[#9D8C7D] hover:bg-[#EEE7DE]"
                        >
                          → {STAGE_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6F6158]/30 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl text-[#6F6158]">Add deal</h3>
              <button onClick={() => setShowAdd(false)} className="text-[#9D8C7D]"><X size={18} /></button>
            </div>
            {[
              { k: "account_name", l: "Account name *" },
              { k: "value_nzd", l: "Value (NZD)" },
              { k: "next_action", l: "Next action" },
              { k: "owner", l: "Owner" },
            ].map((f) => (
              <div key={f.k}>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] block mb-1">{f.l}</label>
                <input
                  value={(form as Record<string, string>)[f.k]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8C8B4]/40 bg-white font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A]"
                />
              </div>
            ))}
            <button onClick={addDeal} className="w-full py-2.5 rounded-xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body font-medium text-sm transition-colors">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
