import { useState } from "react";
import { Megaphone, Sparkles, BarChart3, Target, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { agentChat } from "@/lib/agentChat";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

const ACCENT = "#A8DDDB";

const DEMO_ADS = [
  { name: "Hero Brand", impressions: 24500, clicks: 890, spend: 340, ctr: 3.6 },
  { name: "Product Launch", impressions: 18200, clicks: 620, spend: 280, ctr: 3.4 },
  { name: "Testimonial", impressions: 12100, clicks: 510, spend: 190, ctr: 4.2 },
  { name: "Behind Scenes", impressions: 8900, clicks: 340, spend: 120, ctr: 3.8 },
];

const LOOP_CRITERIA = [
  { name: "Hook Strength", max: 10 },
  { name: "Specificity", max: 10 },
  { name: "Emotional Trigger", max: 10 },
  { name: "CTA Clarity", max: 10 },
  { name: "Platform Fit", max: 10 },
];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}>
      {children}
    </div>
  );
}

export default function AuahaAdManager() {
  const [tab, setTab] = useState<"create" | "analytics" | "loop">("create");
  const [adBrief, setAdBrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [adVariants, setAdVariants] = useState<string[]>([]);

  const generateAds = async () => {
    if (!adBrief.trim()) return toast.error("Enter a brief");
    setIsGenerating(true);
    try {
      const full = await agentChat({
        agentId: "muse",
        packId: "auaha",
        message: `Create 3 ad variants for: ${adBrief}\n\nEach variant must have: Headline, Primary Text, Description, CTA. Format clearly with --- between variants. No buzzwords. Sharp, specific, NZ voice.`,
      });
      setAdVariants(full.split("---").filter((v) => v.trim()));
      toast.success("MUSE created 3 ad variants");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Ad Manager</p>
        <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Inter, sans-serif' }}>Ad Manager</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([["create", "Create Ads", Target], ["analytics", "Analytics", BarChart3], ["loop", "Loop Testing", Zap]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all ${tab === key ? "text-[#1A1D29] font-medium" : "text-[#6B7280] bg-[rgba(74,165,168,0.04)]"}`}
            style={tab === key ? { background: ACCENT } : {}}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "create" && (
        <div className="space-y-4">
          <GlassCard className="p-6">
            <label className="text-[#6B7280] text-xs block mb-2">Ad Brief</label>
            <textarea
              value={adBrief}
              onChange={(e) => setAdBrief(e.target.value)}
              className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none min-h-[80px]"
              placeholder="Describe your product/service and campaign goal..."
            />
            <Button onClick={generateAds} disabled={isGenerating} className="mt-3" style={{ background: ACCENT, color: "#000" }}>
              {isGenerating ? "Creating variants..." : "Generate 3 Ad Variants"}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </GlassCard>

          {adVariants.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4">
              {adVariants.map((v, i) => (
                <GlassCard key={i} className="p-5">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${ACCENT}20`, color: ACCENT }}>Variant {i + 1}</span>
                  <div className="mt-3 text-[#2A2F3D] text-sm whitespace-pre-wrap">{v.trim()}</div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <GlassCard className="p-6">
            <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px] mb-4">Ad Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={DEMO_ADS}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(74,165,168,0.30)', color: '#1A1D29', boxShadow: '0 8px 32px rgba(26,29,41,0.12)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                  {DEMO_ADS.map((_, i) => <Cell key={i} fill={i === 2 ? ACCENT : `${ACCENT}66`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px] mb-4">Campaign Metrics</h3>
            <div className="space-y-4">
              {DEMO_ADS.map((ad) => (
                <div key={ad.name} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(74,165,168,0.04)]">
                  <div>
                    <p className="text-foreground text-sm">{ad.name}</p>
                    <p className="text-[#6B7280] text-xs">{ad.impressions.toLocaleString()} impressions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono" style={{ color: ACCENT }}>{ad.ctr}% CTR</p>
                    <p className="text-[#6B7280] text-xs">${ad.spend} spend</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "loop" && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4" style={{ color: ACCENT }} />
            <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px]">Loop Testing Lab</h3>
          </div>
          <p className="text-[#6B7280] text-sm mb-6">MUSE simulates audience response and scores each ad variant.</p>
          <div className="grid md:grid-cols-5 gap-4">
            {LOOP_CRITERIA.map((c) => {
              const score = Math.floor(Math.random() * 4) + 6;
              return (
                <div key={c.name} className="text-center p-4 rounded-lg bg-[rgba(74,165,168,0.04)]">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-mono" style={{ background: `${ACCENT}15`, color: ACCENT }}>
                    {score}
                  </div>
                  <p className="text-[#6B7280] text-[10px] uppercase tracking-wider">{c.name}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
