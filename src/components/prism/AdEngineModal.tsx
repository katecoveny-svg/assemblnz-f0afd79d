import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Target, Rocket, Check, Copy, Download, Eye, X, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ACCENT = "#5AADA0";

const INDUSTRIES = [
  { id: "construction", label: "Construction", agent: "APEX" },
  { id: "hospitality", label: "Hospitality", agent: "AURA" },
  { id: "property", label: "Property Management", agent: "HAVEN" },
  { id: "hr", label: "HR & People", agent: "AROHA" },
  { id: "sales", label: "Sales & CRM", agent: "FLUX" },
  { id: "sports", label: "Sports & Recreation", agent: "TURF" },
  { id: "automotive", label: "Automotive", agent: "FORGE" },
  { id: "dental_vet", label: "Dental & Veterinary", agent: "CLINIC" },
  { id: "cleaning", label: "Commercial Cleaning", agent: "PRISTINE" },
  { id: "franchise", label: "Franchise Operations", agent: "NETWORK" },
];

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "both", label: "Both" },
];

const VISUAL_STYLES = [
  { id: "3d_glass", label: "3D Glass" },
  { id: "dark_minimal", label: "Dark Minimal" },
  { id: "neon_tech", label: "Neon Tech" },
];

const AD_COUNTS = [3, 5, 10];

const STEPS = [
  "Researching pain points…",
  "Writing ad copy…",
  "Generating visuals…",
  "Composing creatives…",
  "Finalising campaign…",
];

type AdCreative = {
  id: string;
  industry: string;
  agent_name: string;
  platform: string;
  headline: string;
  primary_text: string;
  description: string;
  cta: string;
  hashtags: string[];
  target_audience: string;
  ad_structure: string;
  pain_point: string;
  image_url: string | null;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
  total_ads: number;
  creatives: AdCreative[];
};

type ViewState = "setup" | "generating" | "results";

export default function AdEngineModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const [view, setView] = useState<ViewState>("setup");
  const [campaignName, setCampaignName] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [platform, setPlatform] = useState("both");
  const [adsPerIndustry, setAdsPerIndustry] = useState(5);
  const [visualStyle, setVisualStyle] = useState("3d_glass");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedIndustries, setCompletedIndustries] = useState<string[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [filterTab, setFilterTab] = useState("all");
  const [expandedAd, setExpandedAd] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleIndustry = (id: string) => {
    setSelectedIndustries(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedIndustries(prev => prev.length === INDUSTRIES.length ? [] : INDUSTRIES.map(i => i.id));
  };

  const handleGenerate = async () => {
    if (!user || selectedIndustries.length === 0 || !campaignName.trim()) return;
    setView("generating");
    setProgress(0);
    setCurrentStep(0);
    setCompletedIndustries([]);

    try {
      // Create campaign record
      const { data: camp, error: campErr } = await supabase.from("ad_campaigns").insert({
        user_id: user.id,
        name: campaignName.trim(),
        industries: selectedIndustries,
        platforms: platform === "both" ? ["linkedin", "instagram"] : [platform],
        visual_style: visualStyle,
        status: "generating",
        total_ads: 0,
      }).select().single();

      if (campErr || !camp) throw campErr;

      // Fetch pain points
      setCurrentStep(0);
      setProgress(10);
      const industryLabels = INDUSTRIES.filter(i => selectedIndustries.includes(i.id)).map(i => i.label);
      const { data: painPoints } = await supabase
        .from("industry_pain_points")
        .select("*")
        .in("industry", industryLabels);

      setCurrentStep(1);
      setProgress(20);

      // Generate ad copy via chat edge function
      const selectedInds = INDUSTRIES.filter(i => selectedIndustries.includes(i.id));
      const platforms = platform === "both" ? ["linkedin", "instagram"] : [platform];
      const allCreatives: AdCreative[] = [];

      for (let idx = 0; idx < selectedInds.length; idx++) {
        const ind = selectedInds[idx];
        const indPainPoints = (painPoints || []).filter(p => p.industry === ind.label);
        const topPains = indPainPoints.sort((a, b) => b.severity - a.severity).slice(0, adsPerIndustry);

        const structures = ["pain_agitate_solve", "story_reveal", "contrarian", "stat_shock", "before_after"];

        for (let adIdx = 0; adIdx < Math.min(adsPerIndustry, topPains.length); adIdx++) {
          const pain = topPains[adIdx];
          const structure = structures[adIdx % structures.length];

          for (const plat of platforms) {
            const creative: AdCreative = {
              id: crypto.randomUUID(),
              industry: ind.label,
              agent_name: ind.agent,
              platform: plat,
              headline: (pain as any).hook || pain.pain_point_text.slice(0, 70),
              primary_text: generateAdCopy(pain, structure, plat, ind),
              description: `${ind.agent} handles this for NZ ${ind.label.toLowerCase()} businesses`,
              cta: "Learn More",
              hashtags: [`#NZBusiness`, `#${ind.agent}`, `#Assembl`, `#AI`, `#${ind.label.replace(/\s+/g, "")}`],
              target_audience: `NZ ${ind.label} business owners and managers`,
              ad_structure: structure,
              pain_point: pain.pain_point_text,
              image_url: null,
            };
            allCreatives.push(creative);
          }
        }

        setCompletedIndustries(prev => [...prev, ind.id]);
        setProgress(20 + ((idx + 1) / selectedInds.length) * 60);
      }

      setCurrentStep(2);
      setProgress(80);

      // Generate images for first few creatives using Lovable AI (with timeout)
      setCurrentStep(3);
      const imageCount = Math.min(allCreatives.length, 6);
      
      for (let i = 0; i < imageCount; i++) {
        const c = allCreatives[i];
        try {
          const imagePrompt = `Professional marketing ad visual for ${c.industry} industry. Dark background #09090F, glassmorphism effects, cinematic lighting, premium tech aesthetic. Show: ${c.pain_point.slice(0, 100)}. Style: ${visualStyle === "3d_glass" ? "3D glass elements floating" : visualStyle === "neon_tech" ? "neon glow effects" : "dark minimal clean"}. No text.`;
          
          console.log(`[AdEngine] Generating image ${i + 1}/${imageCount} for ${c.industry}...`);
          
          const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: new Error("Timeout") }), 30000)
          );
          
          const res = await Promise.race([
            supabase.functions.invoke("generate-image", {
              body: { prompt: imagePrompt, quality: "fast" },
            }),
            timeoutPromise,
          ]);
          
          const generatedUrl = res.data?.imageUrl || res.data?.image_url;
          if (generatedUrl) {
            allCreatives[i].image_url = generatedUrl;
            console.log(`[AdEngine] Image ${i + 1} generated successfully`);
          } else {
            console.warn(`[AdEngine] Image ${i + 1} returned no URL:`, res.data, res.error);
          }
        } catch (imgErr) {
          console.warn(`[AdEngine] Image ${i + 1} failed (skipping):`, imgErr);
        }
        setProgress(80 + ((i + 1) / imageCount) * 15);
      }

      // Save creatives to database
      setCurrentStep(4);
      const inserts = allCreatives.map(c => ({
        campaign_id: camp.id,
        user_id: user.id,
        industry: c.industry,
        agent_name: c.agent_name,
        platform: c.platform,
        format: "single_image",
        pain_point: c.pain_point,
        ad_structure: c.ad_structure,
        headline: c.headline,
        primary_text: c.primary_text,
        description: c.description || "",
        cta: c.cta,
        hashtags: c.hashtags,
        target_audience: c.target_audience || "",
        image_url: c.image_url,
      }));

      await supabase.from("ad_creatives").insert(inserts);
      await supabase.from("ad_campaigns").update({ status: "completed", total_ads: allCreatives.length }).eq("id", camp.id);

      setProgress(100);
      setCampaign({
        id: camp.id,
        name: camp.name,
        status: "completed",
        total_ads: allCreatives.length,
        creatives: allCreatives,
      });

      setTimeout(() => setView("results"), 500);
    } catch (err) {
      console.error("Campaign generation failed:", err);
      setView("setup");
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCreatives = campaign?.creatives.filter(c => {
    if (filterTab === "all") return true;
    if (filterTab === "linkedin" || filterTab === "instagram") return c.platform === filterTab;
    return c.industry.toLowerCase().replace(/\s+/g, "_") === filterTab;
  }) || [];

  const resetModal = () => {
    setView("setup");
    setCampaignName("");
    setSelectedIndustries([]);
    setPlatform("both");
    setAdsPerIndustry(5);
    setVisualStyle("3d_glass");
    setCampaign(null);
    setExpandedAd(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetModal(); onOpenChange(v); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
        <DialogTitle className="sr-only">Ad Engine</DialogTitle>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b" style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-3">
            <Target size={20} style={{ color: ACCENT }} />
            <div>
              <h2 className="text-lg font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>Ad Engine</h2>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Bulk campaign generator</p>
            </div>
          </div>
          {view === "results" && (
            <button onClick={resetModal} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: `${ACCENT}15`, color: ACCENT }}>
              New Campaign
            </button>
          )}
        </div>

        {/* SETUP VIEW */}
        {view === "setup" && (
          <div className="p-6 space-y-5">
            {/* Campaign Name */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Campaign Name</label>
              <input
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="e.g. Q2 NZ Business Campaign"
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}
              />
            </div>

            {/* Industries */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Industries</label>
                <button onClick={selectAll} className="text-[10px] font-mono uppercase" style={{ color: ACCENT }}>
                  {selectedIndustries.length === INDUSTRIES.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INDUSTRIES.map(ind => {
                  const active = selectedIndustries.includes(ind.id);
                  return (
                    <button key={ind.id} onClick={() => toggleIndustry(ind.id)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-body transition-all text-left"
                      style={{
                        background: active ? `${ACCENT}12` : "hsl(var(--muted))",
                        color: active ? ACCENT : "hsl(var(--muted-foreground))",
                        border: `1px solid ${active ? ACCENT + "30" : "hsl(var(--border))"}`
                      }}>
                      <div className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: active ? ACCENT : "hsl(var(--border))", background: active ? ACCENT : "transparent" }}>
                        {active && <Check size={10} className="text-black" />}
                      </div>
                      <div>
                        <span className="block">{ind.label}</span>
                        <span className="text-[9px] opacity-60">{ind.agent}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform + Ads per industry row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Platform</label>
                <div className="flex gap-1.5">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => setPlatform(p.id)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: platform === p.id ? `${ACCENT}15` : "hsl(var(--muted))",
                        color: platform === p.id ? ACCENT : "hsl(var(--muted-foreground))",
                        border: `1px solid ${platform === p.id ? ACCENT + "30" : "hsl(var(--border))"}`
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Ads per Industry</label>
                <div className="flex gap-1.5">
                  {AD_COUNTS.map(n => (
                    <button key={n} onClick={() => setAdsPerIndustry(n)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: adsPerIndustry === n ? `${ACCENT}15` : "hsl(var(--muted))",
                        color: adsPerIndustry === n ? ACCENT : "hsl(var(--muted-foreground))",
                        border: `1px solid ${adsPerIndustry === n ? ACCENT + "30" : "hsl(var(--border))"}`
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Style */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "hsl(var(--muted-foreground))" }}>Visual Style</label>
              <div className="flex gap-2">
                {VISUAL_STYLES.map(s => (
                  <button key={s.id} onClick={() => setVisualStyle(s.id)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: visualStyle === s.id ? `${ACCENT}15` : "hsl(var(--muted))",
                      color: visualStyle === s.id ? ACCENT : "hsl(var(--muted-foreground))",
                      border: `1px solid ${visualStyle === s.id ? ACCENT + "30" : "hsl(var(--border))"}`
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {selectedIndustries.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}20` }}>
                <p className="text-xs font-body" style={{ color: ACCENT }}>
                  Will generate <strong>{selectedIndustries.length * adsPerIndustry * (platform === "both" ? 2 : 1)} ads</strong> across {selectedIndustries.length} {selectedIndustries.length === 1 ? "industry" : "industries"}
                </p>
              </div>
            )}

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={selectedIndustries.length === 0 || !campaignName.trim()}
              className="w-full py-3.5 rounded-xl text-sm font-display font-bold transition-all hover:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-30"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}CC)`, color: "#0A0A14", boxShadow: `0 0 20px ${ACCENT}30` }}>
              <Rocket size={16} /> Generate Campaign
            </button>
          </div>
        )}

        {/* GENERATING VIEW */}
        {view === "generating" && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full animate-spin" style={{ border: `3px solid transparent`, borderTopColor: ACCENT }} />
                <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}10` }}>
                  <Target size={24} style={{ color: ACCENT }} />
                </div>
              </div>
              <p className="text-lg font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>
                {STEPS[currentStep]}
              </p>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: ACCENT }} />
              </div>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{Math.round(progress)}% complete</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INDUSTRIES.filter(i => selectedIndustries.includes(i.id)).map(ind => {
                const done = completedIndustries.includes(ind.id);
                return (
                  <div key={ind.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                    style={{ background: done ? `${ACCENT}10` : "hsl(var(--muted))", color: done ? ACCENT : "hsl(var(--muted-foreground))" }}>
                    {done ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border animate-pulse" style={{ borderColor: "hsl(var(--border))" }} />}
                    {ind.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RESULTS VIEW */}
        {view === "results" && campaign && (
          <div className="p-6 space-y-4">
            {/* Campaign summary */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-display font-bold" style={{ color: "hsl(var(--foreground))" }}>{campaign.name}</h3>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{campaign.total_ads} ads generated</p>
              </div>
              <button onClick={() => {
                const csv = generateCSV(campaign.creatives);
                downloadFile(csv, `${campaign.name}.csv`, "text/csv");
              }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: `${ACCENT}15`, color: ACCENT }}>
                <Download size={12} /> Export CSV
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {["all", "linkedin", "instagram", ...INDUSTRIES.filter(i => selectedIndustries.includes(i.id)).map(i => i.label.toLowerCase().replace(/\s+/g, "_"))].map(tab => (
                <button key={tab} onClick={() => setFilterTab(tab)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all"
                  style={{
                    background: filterTab === tab ? `${ACCENT}15` : "hsl(var(--muted))",
                    color: filterTab === tab ? ACCENT : "hsl(var(--muted-foreground))"
                  }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {/* Ad cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCreatives.map(ad => (
                <div key={ad.id} className="ad-card group relative rounded-2xl overflow-hidden transition-transform hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}>
                  {/* Floating orbs */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 animate-pulse" style={{ background: ACCENT, filter: "blur(40px)" }} />

                  {/* Image preview */}
                  {ad.image_url ? (
                    <div className="h-32 overflow-hidden">
                      <img loading="lazy" decoding="async" src={ad.image_url} alt={ad.headline} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center" style={{ background: "hsl(var(--muted))" }}>
                      <Target size={24} style={{ color: "hsl(var(--muted-foreground))", opacity: 0.3 }} />
                    </div>
                  )}

                  <div className="p-3 space-y-2">
                    {/* Badges */}
                    <div className="flex gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ background: `${ACCENT}20`, color: ACCENT }}>{ad.agent_name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px]" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                        {ad.platform === "linkedin" ? "LinkedIn" : "Instagram"}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px]" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                        {ad.ad_structure.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Headline */}
                    <p className="text-xs font-semibold line-clamp-2" style={{ color: "hsl(var(--foreground))" }}>{ad.headline}</p>

                    {/* Expanded content */}
                    {expandedAd === ad.id && (
                      <div className="space-y-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <p className="text-[11px] whitespace-pre-wrap" style={{ color: "hsl(var(--muted-foreground))" }}>{ad.primary_text}</p>
                        <div className="flex flex-wrap gap-1">
                          {ad.hashtags.map(h => (
                            <span key={h} className="text-[9px]" style={{ color: ACCENT }}>{h}</span>
                          ))}
                        </div>
                        <p className="text-[9px]" style={{ color: "hsl(var(--muted-foreground))" }}>🎯 {ad.target_audience}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-1.5 pt-1">
                      <button onClick={() => setExpandedAd(expandedAd === ad.id ? null : ad.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[9px] transition-all"
                        style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                        <Eye size={10} /> {expandedAd === ad.id ? "Less" : "View"}
                      </button>
                      <button onClick={() => copyText(ad.primary_text, ad.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[9px] transition-all"
                        style={{ background: copiedId === ad.id ? `${ACCENT}20` : "hsl(var(--muted))", color: copiedId === ad.id ? ACCENT : "hsl(var(--muted-foreground))" }}>
                        <Copy size={10} /> {copiedId === ad.id ? "Copied!" : "Copy"}
                      </button>
                      {ad.image_url && (
                        <a href={ad.image_url} download={`${ad.agent_name}_${ad.platform}_ad.png`} target="_blank" rel="noopener"
                          className="flex items-center gap-1 px-2 py-1 rounded text-[9px]"
                          style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                          <Download size={10} /> Image
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper: generate ad copy based on structure
function generateAdCopy(pain: any, structure: string, platform: string, industry: any): string {
  const stat = pain.stat || "";
  const hook = pain.hook || pain.pain_point_text;
  const agent = industry.agent;
  const label = industry.label;

  const templates: Record<string, string> = {
    pain_agitate_solve: `${hook}\n\nHere's the reality for NZ ${label.toLowerCase()} businesses: ${pain.pain_point_text}.\n\nIt's costing you time, money, and sleep. Every week it goes unaddressed, the problem compounds.\n\n${agent} by Assembl fixes this. AI-powered, NZ-built, and ready in minutes.\n\n→ assemblnz.lovable.app`,
    story_reveal: `Last week, a ${label.toLowerCase()} business owner in Auckland told us:\n\n"I was spending ${stat || 'hours every week'} on this. Now ${agent} handles it automatically."\n\nThat's the power of AI built specifically for NZ ${label.toLowerCase()} businesses.\n\n${pain.pain_point_text} — solved.\n\n→ assemblnz.lovable.app`,
    contrarian: `Unpopular opinion: Most NZ ${label.toLowerCase()} businesses don't have a ${pain.pain_point_text.split(" ").slice(0, 3).join(" ")} problem.\n\nThey have a systems problem.\n\n${agent} gives you the system. AI handles the complexity. You handle what matters.\n\n→ assemblnz.lovable.app`,
    stat_shock: `${stat || hook}\n\nThat's the reality of ${pain.pain_point_text.toLowerCase()}.\n\nNZ ${label.toLowerCase()} businesses lose real money, real time, and real clients to this every single week.\n\n${agent} by Assembl: purpose-built AI for Aotearoa's ${label.toLowerCase()} industry.\n\n→ assemblnz.lovable.app`,
    before_after: `BEFORE ${agent}:\n• ${pain.pain_point_text}\n• Hours of manual work\n• Constant stress about compliance\n\nAFTER ${agent}:\n• Automated and accurate\n• Minutes instead of hours\n• Peace of mind, built for NZ\n\nThe difference? AI that actually understands your industry.\n\n→ assemblnz.lovable.app`,
  };

  let text = templates[structure] || templates.pain_agitate_solve;

  if (platform === "instagram") {
    text = text.slice(0, 2200);
  }
  return text;
}

function generateCSV(creatives: AdCreative[]): string {
  const headers = ["Industry", "Agent", "Platform", "Structure", "Headline", "Primary Text", "CTA", "Hashtags", "Target Audience"];
  const rows = creatives.map(c => [
    c.industry, c.agent_name, c.platform, c.ad_structure, 
    `"${c.headline.replace(/"/g, '""')}"`, `"${c.primary_text.replace(/"/g, '""')}"`,
    c.cta, c.hashtags.join(" "), c.target_audience
  ].join(","));
  return [headers.join(","), ...rows].join("\n");
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
