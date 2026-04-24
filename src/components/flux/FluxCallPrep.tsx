import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function FluxCallPrep() {
  const [account, setAccount] = useState("");
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!account.trim()) return;
    setLoading(true);
    setBrief("");
    try {
      const { data, error } = await supabase.functions.invoke("agent-router", {
        body: { message: `Call prep brief for account: ${account}`, agentId: "flux" },
      });
      if (error) throw error;
      const text =
        (data as { reply?: string; message?: string; content?: string } | null)?.reply ??
        (data as { reply?: string; message?: string; content?: string } | null)?.message ??
        (data as { reply?: string; message?: string; content?: string } | null)?.content ??
        JSON.stringify(data, null, 2);
      setBrief(text);
    } catch (err) {
      toast.error("Could not generate brief");
      setBrief(`Quick brief for ${account}\n\n• Recent activity: review last 90 days\n• Decision-makers: confirm key contacts\n• Open objections: budget, timing, fit\n• Recommended angle: outcome-led, NZ-context`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto pt-20 lg:pt-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Phone size={18} className="text-[#D9BC7A]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#9D8C7D]">Prep</span>
        </div>
        <h1 className="font-display text-3xl text-[#6F6158]">Call prep</h1>
        <p className="font-body text-sm text-[#9D8C7D] mt-1">Generate a focused brief before your next conversation.</p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6 mb-6">
        <label className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] block mb-2">Account or deal</label>
        <input
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="e.g. Henare Construction Ltd"
          className="w-full px-3 py-2 rounded-xl border border-[#D8C8B4]/40 bg-white font-body text-sm text-[#6F6158] focus:outline-none focus:border-[#D9BC7A] mb-4"
        />
        <button
          onClick={generate}
          disabled={loading || !account.trim()}
          className="flex items-center gap-2 bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] font-body text-sm font-medium rounded-xl px-5 py-2.5 transition-colors disabled:opacity-50"
        >
          <Sparkles size={16} /> {loading ? "Generating…" : "Generate brief"}
        </button>
      </div>

      {brief && (
        <div className="bg-white/80 backdrop-blur-xl border border-[rgba(142,129,119,0.14)] rounded-3xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6 border-l-4 border-l-[#D9BC7A] mb-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#9D8C7D] mb-2">Brief</div>
          <div className="font-body text-sm text-[#6F6158] whitespace-pre-wrap">{brief}</div>
        </div>
      )}

      <Link
        to="/auaha/whaikorero"
        className="inline-flex items-center gap-2 text-sm font-body text-[#9D8C7D] hover:text-[#6F6158] transition-colors"
      >
        Create pitch deck <ArrowRight size={14} />
      </Link>
    </div>
  );
}
