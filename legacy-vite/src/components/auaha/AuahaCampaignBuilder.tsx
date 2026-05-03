import { useState } from "react";
import { Megaphone, ArrowRight, ArrowLeft, Sparkles, Check, Copy, Image, Video, Calendar, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { agentChat } from "@/lib/agentChat";
import { useQueryClient } from "@tanstack/react-query";

const ACCENT = "#A8DDDB";
const OBJECTIVES = ["Brand Awareness", "Lead Generation", "Sales", "Event Promotion", "Thought Leadership", "Product Launch"];
const PLATFORMS = ["Instagram", "Facebook", "TikTok", "LinkedIn", "X", "YouTube", "Email", "Blog"];
const TONES = ["Professional", "Casual", "Bold", "Playful", "Authoritative", "Inspiring"];

const STEPS = ["Brief", "Copy", "Design", "Video", "Schedule", "Review"];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}>
      {children}
    </div>
  );
}

export default function AuahaCampaignBuilder() {
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState({ name: "", objective: "", audience: "", message: "", platforms: [] as string[], tone: "", budget: "" });
  const [generatedCopy, setGeneratedCopy] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const saveCampaignToDB = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sign in required");

    const { data, error } = await supabase.from("campaigns").insert({
      user_id: user.id,
      name: brief.name,
      goal: brief.objective,
      audience: brief.audience,
      tone: brief.tone,
      platforms: brief.platforms,
      pipeline_step: "brief",
      status: "draft",
      body_json: { message: brief.message, budget: brief.budget },
    }).select("id").single();

    if (error) throw error;
    setCampaignId(data.id);
    queryClient.invalidateQueries({ queryKey: ["auaha-campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["auaha-dashboard-metrics"] });
    return data.id;
  };

  const generateCopy = async () => {
    setIsGenerating(true);
    try {
      // Save brief to DB first
      const id = await saveCampaignToDB();

      const full = await agentChat({
        agentId: "muse",
        packId: "auaha",
        message: `Create copy for a ${brief.objective} campaign.\nBrand message: ${brief.message}\nAudience: ${brief.audience}\nTone: ${brief.tone}\nPlatforms: ${brief.platforms.join(", ")}\n\nRULES: No buzzwords, no "unlock/transform/leverage/seamless". Be specific, punchy, Kiwi voice. Hook first sentence. NZ English.\n\nFor EACH platform, write a post with appropriate length and hashtags. Format as:\n\n**[Platform Name]**\n[copy here]\n\nHashtags: #tag1 #tag2`,
      });

      // Parse platform copy
      const copy: Record<string, string> = {};
      for (const p of brief.platforms) {
        const regex = new RegExp(`\\*\\*${p}\\*\\*\\n([\\s\\S]*?)(?=\\*\\*|$)`, "i");
        const match = full.match(regex);
        copy[p] = match ? match[1].trim() : `Copy for ${p} — regenerate to try again.`;
      }
      setGeneratedCopy(copy);

      // Update campaign with copy and advance pipeline
      await supabase.from("campaigns").update({
        body_json: { message: brief.message, budget: brief.budget, copy },
        pipeline_step: "copy",
      }).eq("id", id);

      // Save each platform's copy as a content item
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const items = brief.platforms.map((p) => ({
          user_id: user.id,
          campaign_id: id,
          title: `${brief.name} — ${p}`,
          content_type: "campaign_post",
          platform: p,
          tone: brief.tone,
          body: copy[p] || "",
          pipeline_stage: "copy",
          agent_attribution: "MUSE",
        }));
        await supabase.from("content_items").insert(items);
        queryClient.invalidateQueries({ queryKey: ["auaha-pipeline-counts"] });
        queryClient.invalidateQueries({ queryKey: ["auaha-recent-content"] });
      }

      setStep(1);
      toast.success("Campaign saved & copy generated for " + brief.platforms.length + " platforms");
    } catch (e: any) {
      toast.error(e.message || "Copy generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const advancePipeline = async (nextStep: number) => {
    const stageMap = ["brief", "copy", "design", "video", "schedule", "approve"];
    if (campaignId) {
      await supabase.from("campaigns").update({ pipeline_step: stageMap[nextStep] || "approve" }).eq("id", campaignId);
      // Advance all content items for this campaign
      await supabase.from("content_items").update({ pipeline_stage: stageMap[nextStep] || "approve" }).eq("campaign_id", campaignId);
      queryClient.invalidateQueries({ queryKey: ["auaha-pipeline-counts"] });
    }
    setStep(nextStep);
  };

  const finalizeCampaign = async () => {
    if (campaignId) {
      await supabase.from("campaigns").update({ status: "active", pipeline_step: "analyse" }).eq("id", campaignId);
      await supabase.from("content_items").update({ pipeline_stage: "analyse" }).eq("campaign_id", campaignId);
      queryClient.invalidateQueries({ queryKey: ["auaha-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["auaha-pipeline-counts"] });
      queryClient.invalidateQueries({ queryKey: ["auaha-dashboard-metrics"] });
    }
    toast.success("Campaign finalised and tracking!");
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Campaign Builder</p>
        <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Inter, sans-serif' }}>New Campaign</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => i <= step && setStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all ${
                i === step ? "text-[#1A1D29] font-medium" : i < step ? "text-[#2A2F3D] bg-[rgba(74,165,168,0.06)]" : "text-[#6B7280] bg-[rgba(74,165,168,0.04)]"
              }`}
              style={i === step ? { background: ACCENT } : {}}
            >
              {i < step ? <Check className="w-3 h-3" /> : null}
              {s}
            </button>
            {i < STEPS.length - 1 && <ArrowRight className="w-3 h-3 text-[#8B92A0]" />}
          </div>
        ))}
      </div>

      {/* Step 0 — Brief */}
      {step === 0 && (
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
            <span className="text-[#4A5160] text-xs uppercase tracking-[2px]">Agent: MUSE</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[#6B7280] text-xs block mb-1.5">Campaign Name</label>
              <input
                value={brief.name}
                onChange={(e) => setBrief({ ...brief, name: e.target.value })}
                className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-[#A8DDDB66]"
                placeholder="e.g. Q2 Product Launch"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#6B7280] text-xs block mb-1.5">Objective</label>
                <select value={brief.objective} onChange={(e) => setBrief({ ...brief, objective: e.target.value })} className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none">
                  <option value="">Select objective</option>
                  {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#6B7280] text-xs block mb-1.5">Tone</label>
                <select value={brief.tone} onChange={(e) => setBrief({ ...brief, tone: e.target.value })} className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none">
                  <option value="">Select tone</option>
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[#6B7280] text-xs block mb-1.5">Target Audience</label>
              <textarea
                value={brief.audience}
                onChange={(e) => setBrief({ ...brief, audience: e.target.value })}
                className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none min-h-[60px]"
                placeholder="Describe your target audience..."
              />
            </div>

            <div>
              <label className="text-[#6B7280] text-xs block mb-1.5">Key Message</label>
              <textarea
                value={brief.message}
                onChange={(e) => setBrief({ ...brief, message: e.target.value })}
                className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none min-h-[80px]"
                placeholder="What's the core message?"
              />
            </div>

            <div>
              <label className="text-[#6B7280] text-xs block mb-1.5">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setBrief({
                      ...brief,
                      platforms: brief.platforms.includes(p) ? brief.platforms.filter((x) => x !== p) : [...brief.platforms, p]
                    })}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      brief.platforms.includes(p) ? "text-[#1A1D29] font-medium" : "text-[#6B7280] bg-[rgba(74,165,168,0.04)] border border-gray-200"
                    }`}
                    style={brief.platforms.includes(p) ? { background: ACCENT } : {}}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#6B7280] text-xs block mb-1.5">Budget (optional, NZD)</label>
              <input
                type="number"
                value={brief.budget}
                onChange={(e) => setBrief({ ...brief, budget: e.target.value })}
                className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none max-w-[200px]"
                placeholder="$0"
              />
            </div>
          </div>

          <Button
            onClick={generateCopy}
            disabled={!brief.name || !brief.objective || !brief.message || brief.platforms.length === 0 || isGenerating}
            className="mt-4"
            style={{ background: ACCENT, color: "#000" }}
          >
            {isGenerating ? "Saving brief & generating copy..." : "Generate Campaign Plan"}
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </GlassCard>
      )}

      {/* Step 1 — Copy */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#4A5160] text-xs uppercase tracking-[2px]">
            <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
            Agent: MUSE — Generated Copy
          </div>
          {brief.platforms.map((p) => (
            <GlassCard key={p} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-foreground text-sm font-medium">{p}</h4>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(generatedCopy[p] || ""); toast.success("Copied"); }} className="text-[#6B7280] hover:text-[#4A5160] transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <textarea
                value={generatedCopy[p] || ""}
                onChange={(e) => setGeneratedCopy({ ...generatedCopy, [p]: e.target.value })}
                className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-3 text-[#1A1D29] text-sm focus:outline-none min-h-[120px]"
              />
              <div className="flex gap-2 mt-3">
                <button className="text-xs px-3 py-1.5 rounded-full bg-[rgba(74,165,168,0.04)] text-[#6B7280] hover:text-[#1A1D29] transition-colors flex items-center gap-1">
                  <Image className="w-3 h-3" /> Create image
                </button>
                <button className="text-xs px-3 py-1.5 rounded-full bg-[rgba(74,165,168,0.04)] text-[#6B7280] hover:text-[#1A1D29] transition-colors flex items-center gap-1">
                  <Video className="w-3 h-3" /> Make video
                </button>
              </div>
            </GlassCard>
          ))}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)} className="border-gray-200 text-[#4A5160]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button onClick={() => { advancePipeline(2); toast.success("Moving to design phase"); }} style={{ background: ACCENT, color: "#000" }}>
              Continue to Design <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2-5 — Interactive steps */}
      {step >= 2 && (
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
            {step === 2 && <Image className="w-6 h-6" style={{ color: ACCENT }} />}
            {step === 3 && <Video className="w-6 h-6" style={{ color: ACCENT }} />}
            {step === 4 && <Calendar className="w-6 h-6" style={{ color: ACCENT }} />}
            {step === 5 && <Check className="w-6 h-6" style={{ color: ACCENT }} />}
          </div>
          <h3 className="text-foreground text-lg font-light uppercase tracking-[3px]">{STEPS[step]}</h3>
          <p className="text-[#6B7280] text-sm mt-2">
            {step === 2 && "PIXEL and CHROMATIC will generate visuals for each post. Use the Image Studio for full control."}
            {step === 3 && "ECHO and FLUX will create video content. Use the Video Studio for full production."}
            {step === 4 && "RHYTHM will suggest optimal posting times and manage your content calendar."}
            {step === 5 && "Review all content before publishing. Everything looks great!"}
          </p>
          {campaignId && (
            <p className="text-[#8B92A0] text-[10px] mt-2 font-mono">Campaign ID: {campaignId.slice(0, 8)}… • Pipeline: {STEPS[step].toLowerCase()}</p>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline" onClick={() => advancePipeline(step - 1)} className="border-gray-200 text-[#4A5160]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {step < 5 && (
              <Button onClick={() => advancePipeline(step + 1)} style={{ background: ACCENT, color: "#000" }}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {step === 5 && (
              <Button onClick={finalizeCampaign} style={{ background: ACCENT, color: "#000" }}>
                Finalise Campaign <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
