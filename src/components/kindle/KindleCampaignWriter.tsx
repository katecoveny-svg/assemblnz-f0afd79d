import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Copy, Check, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const KINDLE_COLOR = "#D4A843";

interface CampaignContent {
  narrative: string;
  sponsor_pitch: string;
  social_posts: string[];
  grant_summary: string;
}

const CopyBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
      title="Copy"
    >
      {copied ? <Check size={12} style={{ color: KINDLE_COLOR }} /> : <Copy size={12} className="text-muted-foreground" />}
    </button>
  );
};

const ContentBlock = ({ title, content }: { title: string; content: string }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4" style={{ background: "rgba(15,15,18,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs font-semibold tracking-wide" style={{ color: KINDLE_COLOR }}>{title}</h3>
      <CopyBtn text={content} />
    </div>
    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{content}</p>
  </motion.div>
);

interface Props {
  onSendToChat?: (msg: string) => void;
}

const KindleCampaignWriter = ({ onSendToChat }: Props) => {
  const [orgName, setOrgName] = useState("");
  const [mission, setMission] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CampaignContent | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !mission.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("campaign-writer", {
        body: { org_name: orgName.trim(), mission: mission.trim(), funding_goal: fundingGoal.trim() || undefined, beneficiaries: beneficiaries.trim() || undefined, location: location.trim() || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as CampaignContent);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate campaign content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ background: `${KINDLE_COLOR}20`, color: KINDLE_COLOR }}>
          <Sparkles size={12} /> AI Campaign Writer
        </div>
        <h2 className="text-lg font-bold text-foreground">Generate Campaign Content</h2>
        <p className="text-xs text-muted-foreground mt-1">Narratives, sponsor pitches, social posts & grant summaries — instantly.</p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-3 rounded-xl p-4" style={{ background: "rgba(15,15,18,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Organisation Name *</label>
          <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Kaitiaki Youth Trust" required className="bg-background/50 border-gray-200 text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Mission / Cause *</label>
          <Textarea value={mission} onChange={(e) => setMission(e.target.value)} placeholder="Describe your mission..." required rows={3} className="bg-background/50 border-gray-200 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Funding Goal (NZD)</label>
            <Input type="number" value={fundingGoal} onChange={(e) => setFundingGoal(e.target.value)} placeholder="25000" className="bg-background/50 border-gray-200 text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Wellington, NZ" className="bg-background/50 border-gray-200 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Beneficiaries</label>
          <Input value={beneficiaries} onChange={(e) => setBeneficiaries(e.target.value)} placeholder="e.g. At-risk youth aged 12-18" className="bg-background/50 border-gray-200 text-sm" />
        </div>
        <button type="submit" disabled={loading || !orgName.trim() || !mission.trim()} className="w-full h-10 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-opacity disabled:opacity-50" style={{ background: KINDLE_COLOR, color: "#000" }}>
          {loading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate Campaign</>}
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center py-12 text-center">
          <Loader2 size={28} className="animate-spin mb-3" style={{ color: KINDLE_COLOR }} />
          <p className="text-xs text-muted-foreground">Crafting your campaign content...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-3">
          <ContentBlock title="Campaign Narrative" content={result.narrative} />
          <ContentBlock title="Sponsor Pitch Letter" content={result.sponsor_pitch} />
          
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4" style={{ background: "rgba(15,15,18,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-xs font-semibold tracking-wide mb-3" style={{ color: KINDLE_COLOR }}>Social Media Posts</h3>
            <div className="space-y-2">
              {result.social_posts.map((post, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5">
                  <p className="text-xs text-foreground/80 flex-1">{post}</p>
                  <CopyBtn text={post} />
                </div>
              ))}
            </div>
          </motion.div>

          <ContentBlock title="Grant Application Summary" content={result.grant_summary} />

          {onSendToChat && (
            <button onClick={() => onSendToChat(`Refine this campaign for ${orgName}: ${result.narrative.slice(0, 200)}...`)} className="w-full text-xs font-medium py-2 rounded-lg transition-colors" style={{ background: `${KINDLE_COLOR}15`, color: KINDLE_COLOR, border: `1px solid ${KINDLE_COLOR}30` }}>
              Refine in Chat →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default KindleCampaignWriter;
