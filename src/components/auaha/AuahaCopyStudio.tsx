import { useState } from "react";
import { PenTool, Sparkles, Copy, ArrowDown, ArrowUp, Zap, Image, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { agentChat } from "@/lib/agentChat";
import { useQueryClient } from "@tanstack/react-query";

const ACCENT = "#F0D078";

const CONTENT_TYPES = [
  "LinkedIn Post", "Instagram Caption", "Facebook Post", "X / Twitter Post", "TikTok Caption",
  "Email", "Blog Post", "Press Release", "Newsletter", "Ad Copy", "SMS Marketing",
  "Podcast Script", "Video Script", "Website Copy", "Slide Deck Outline",
];

const TONES = ["Professional", "Casual", "Bold", "Playful", "Authoritative", "Inspiring"];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(15,15,26,0.7)", borderColor: "rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

export default function AuahaCopyStudio() {
  const [contentType, setContentType] = useState("LinkedIn Post");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const generate = async () => {
    if (!topic.trim()) return toast.error("Enter a topic or brief");
    setIsGenerating(true);
    setOutput("");
    setSaved(false);

    try {
      const full = await agentChat({
        agentId: "muse",
        packId: "auaha",
        message: `Write a ${length} ${contentType} about: ${topic}\nTone: ${tone}\n\nCOPY RULES: Never use: unlock, transform, leverage, seamless, cutting-edge, game-changer. Never start with "In today's...". Lead with a hook. Be specific. NZ English. Direct. Sharp. No fluff.\n\nInclude hashtags if it's social media. Include a subject line if it's email. Be platform-specific in format and length.`,
      });
      setOutput(full);
      toast.success("MUSE has crafted your copy");

      // Auto-save as content item
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("content_items").insert({
          user_id: user.id,
          title: `${contentType}: ${topic.slice(0, 60)}`,
          content_type: contentType.toLowerCase().replace(/\s+/g, "_"),
          platform: contentType.split(" ")[0],
          tone,
          body: full,
          pipeline_stage: "copy",
          agent_attribution: "MUSE",
          metadata: { length, topic },
        });
        queryClient.invalidateQueries({ queryKey: ["auaha-pipeline-counts"] });
        queryClient.invalidateQueries({ queryKey: ["auaha-recent-content"] });
        queryClient.invalidateQueries({ queryKey: ["auaha-dashboard-metrics"] });
      }
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const refine = async (instruction: string) => {
    if (!output) return;
    setIsGenerating(true);
    setSaved(false);
    try {
      const full = await agentChat({
        agentId: "muse",
        packId: "auaha",
        message: `Original copy:\n${output}\n\nInstruction: ${instruction}\n\nRefine the given copy. Rules: no buzzwords, NZ English, sharp and specific. Return only the refined copy, nothing else.`,
      });
      setOutput(full);
      toast.success("Copy refined");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToLibrary = async () => {
    if (!output) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to save");
      await supabase.from("exported_outputs").insert({
        user_id: user.id,
        agent_id: "muse",
        agent_name: "MUSE",
        title: `${contentType}: ${topic.slice(0, 60)}`,
        content_preview: output.slice(0, 500),
        output_type: "copy",
        format: contentType.toLowerCase().replace(/\s+/g, "_"),
      });
      setSaved(true);
      toast.success("Saved to your content library");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <p className="text-white/40 text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Copy Studio</p>
        <h1 className="text-white text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Copy Studio</h1>
        <p className="text-white/50 text-sm mt-1">Powered by MUSE — elite NZ copywriting</p>
      </div>

      {/* Content type tabs */}
      <div className="flex overflow-x-auto gap-1 pb-2 no-scrollbar">
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct}
            onClick={() => setContentType(ct)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
              ct === contentType ? "text-black font-medium" : "text-white/50 bg-white/5"
            }`}
            style={ct === contentType ? { background: ACCENT } : {}}
          >
            {ct}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-[2px]">
            <PenTool className="w-4 h-4" style={{ color: ACCENT }} />
            Input
          </div>

          <div>
            <label className="text-white/50 text-xs block mb-1.5">Topic / Brief</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F0D07866] min-h-[120px]"
              placeholder="What should MUSE write about?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs block mb-1.5">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1.5">Length</label>
              <div className="flex gap-1">
                {(["short", "medium", "long"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    className={`flex-1 px-2 py-2 rounded-lg text-xs transition-all capitalize ${l === length ? "text-black font-medium" : "text-white/50 bg-white/5"}`}
                    style={l === length ? { background: ACCENT } : {}}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button onClick={generate} disabled={isGenerating} className="w-full" style={{ background: ACCENT, color: "#000" }}>
            {isGenerating ? "MUSE is writing..." : "Generate"}
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </GlassCard>

        {/* Output */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs uppercase tracking-[2px]">Output</span>
            <div className="flex items-center gap-2">
              {output && (
                <>
                  <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }} className="text-white/30 hover:text-white/60">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={saveToLibrary}
                    disabled={isSaving || saved}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all"
                    style={saved ? { background: "rgba(52,211,153,0.15)", color: "#34d399" } : { background: `${ACCENT}15`, color: ACCENT }}
                  >
                    {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    {saved ? "Saved" : isSaving ? "Saving..." : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 min-h-[200px] text-white/80 text-sm whitespace-pre-wrap" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {output || <span className="text-white/20">Your copy will appear here...</span>}
          </div>

          {output && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => refine("Make it shorter. Cut any fluff.")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/50 hover:text-white/80 transition-colors">
                <ArrowDown className="w-3 h-3" /> Shorter
              </button>
              <button onClick={() => refine("Make it longer with more detail and examples.")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/50 hover:text-white/80 transition-colors">
                <ArrowUp className="w-3 h-3" /> Longer
              </button>
              <button onClick={() => refine("Make it bolder. More punch, more edge.")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/50 hover:text-white/80 transition-colors">
                <Zap className="w-3 h-3" /> Bolder
              </button>
              <button onClick={() => toast.info("Opening Image Studio...")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/50 hover:text-white/80 transition-colors">
                <Image className="w-3 h-3" /> Create image
              </button>
            </div>
          )}

          {output && (
            <p className="text-white/20 text-[10px]">
              {output.length} characters • {contentType} • Auto-saved to pipeline
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
