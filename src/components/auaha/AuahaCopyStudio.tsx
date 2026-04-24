import { useState } from "react";
import { PenTool, Sparkles, Copy, ArrowDown, ArrowUp, Zap, Image, Save, Check, ShieldCheck, MessageSquare, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { agentChat } from "@/lib/agentChat";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const POUNAMU = "#00A86B";
const TEAL = "#00CED1";
const OBSIDIAN = "#0A0A0A";

const CONTENT_TYPES = [
  "LinkedIn Post", "Instagram Caption", "Facebook Post", "X / Twitter Post", "TikTok Caption",
  "Email", "Blog Post", "Press Release", "Newsletter", "Ad Copy", "SMS Marketing",
  "Podcast Script", "Video Script", "Website Copy", "Slide Deck Outline",
];

const TONES = [
  { id: "professional", label: "Professional", desc: "Clear, authoritative, NZ business standard" },
  { id: "kiwi-casual", label: "Kiwi Casual", desc: "Friendly, approachable, down-to-earth NZ voice" },
  { id: "mana-enhancing", label: "Mana-Enhancing", desc: "Respectful, empowering, tikanga-aware" },
  { id: "bold", label: "Bold", desc: "Direct, confident, attention-grabbing" },
  { id: "playful", label: "Playful", desc: "Fun, witty, engaging" },
  { id: "authoritative", label: "Authoritative", desc: "Expert-level, trustworthy, data-driven" },
];

// NZ English auto-corrections
const NZ_CORRECTIONS: [RegExp, string][] = [
  [/\borganiz(e|ation|ational|ing)\b/gi, (m: string) => m.replace(/z/g, "s")],
  [/\boptimiz(e|ation|ing)\b/gi, (m: string) => m.replace(/z/g, "s")],
  [/\brecogniz(e|ed|ing|ation)\b/gi, (m: string) => m.replace(/z/g, "s")],
  [/\bcustomiz(e|ed|ing|ation)\b/gi, (m: string) => m.replace(/z/g, "s")],
  [/\bspecializ(e|ed|ing|ation)\b/gi, (m: string) => m.replace(/z/g, "s")],
  [/\banalyze\b/gi, "analyse"],
  [/\bcolor\b/gi, "colour"],
  [/\bfavor(ite)?\b/gi, (m: string) => m.replace("favor", "favour")],
  [/\bhonor\b/gi, "honour"],
  [/\blabor\b/gi, "labour"],
  [/\bcenter\b/gi, "centre"],
  [/\bdefense\b/gi, "defence"],
  [/\blicense\b/gi, "licence"],
  [/\bpractice\b(?=\s)/gi, "practise"], // verb form
] as any;

function applyNzEnglish(text: string): string {
  let result = text;
  for (const [pattern, replacement] of NZ_CORRECTIONS) {
    result = result.replace(pattern, replacement as any);
  }
  return result;
}

const NZ_SYSTEM_PROMPT = `You are an award-winning NZ Copywriter. You prioritise clarity, avoid Americanisms, and respect Te Ao Māori principles in every brand scan.

STRICT RULES:
- Use NZ English: 's' not 'z' (organise, recognise, specialise)
- Use 'colour' not 'color', 'centre' not 'center', 'defence' not 'defense'
- Follow NZ Government Web Standards for accessibility and plain language
- NEVER use: unlock, transform, leverage, seamless, cutting-edge, game-changer, holistic, synergy, revolutionary, streamline
- NEVER start with "In today's..."
- Lead with a hook. Be specific. Direct. Sharp. No fluff.
- Respect tikanga Māori — use Te Reo terms correctly with macrons
- Reference NZ context where relevant (legislation, geography, culture)`;

export default function AuahaCopyStudio() {
  const [contentType, setContentType] = useState("LinkedIn Post");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toneCheckResult, setToneCheckResult] = useState<string | null>(null);
  const [isCheckingTone, setIsCheckingTone] = useState(false);
  const queryClient = useQueryClient();

  const selectedTone = TONES.find(t => t.id === tone) || TONES[0];

  const generate = async () => {
    if (!topic.trim()) return toast.error("Enter a topic or brief");
    setIsGenerating(true);
    setOutput("");
    setSaved(false);
    setToneCheckResult(null);

    try {
      const full = await agentChat({
        agentId: "muse",
        packId: "auaha",
        message: `Write a ${length} ${contentType} about: ${topic}\nTone: ${selectedTone.label} — ${selectedTone.desc}\n\nInclude hashtags if it's social media. Include a subject line if it's email. Be platform-specific in format and length.`,
        systemPrompt: NZ_SYSTEM_PROMPT,
      });
      // Apply NZ English corrections
      const nzCorrected = applyNzEnglish(full);
      setOutput(nzCorrected);
      toast.success("Kia Ora Copywriter has crafted your copy");

      // Auto-save as content item
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("content_items").insert({
          user_id: user.id,
          title: `${contentType}: ${topic.slice(0, 60)}`,
          content_type: contentType.toLowerCase().replace(/\s+/g, "_"),
          platform: contentType.split(" ")[0],
          tone: selectedTone.label,
          body: nzCorrected,
          pipeline_stage: "copy",
          agent_attribution: "MUSE (Kia Ora Copywriter)",
          metadata: { length, topic, toneId: tone },
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

  const toneCheck = async () => {
    if (!output) return;
    setIsCheckingTone(true);
    try {
      const result = await agentChat({
        agentId: "muse",
        packId: "auaha",
        message: `Tone-check this copy against "${selectedTone.label}" tone (${selectedTone.desc}):\n\n${output}\n\nProvide:\n1. Tone score (1-10)\n2. NZ English compliance (any Americanisms found?)\n3. Tikanga awareness check\n4. Readability score\n5. Specific improvement suggestions\n\nBe concise. NZ perspective.`,
        systemPrompt: NZ_SYSTEM_PROMPT,
      });
      setToneCheckResult(result);
    } catch (e: any) {
      toast.error(e.message || "Tone check failed");
    } finally {
      setIsCheckingTone(false);
    }
  };

  const refine = async (instruction: string) => {
    if (!output) return;
    setIsGenerating(true);
    setSaved(false);
    setToneCheckResult(null);
    try {
      const full = await agentChat({
        agentId: "muse",
        packId: "auaha",
        message: `Original copy:\n${output}\n\nInstruction: ${instruction}\n\nRefine the copy. Return only the refined copy.`,
        systemPrompt: NZ_SYSTEM_PROMPT,
      });
      setOutput(applyNzEnglish(full));
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
        agent_name: "MUSE (Kia Ora Copywriter)",
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
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <PenTool className="w-5 h-5" style={{ color: POUNAMU }} />
          <h1 className="text-2xl font-light uppercase tracking-[3px] text-[#1A1D29]" style={{ fontFamily: "Inter, sans-serif" }}>
            Kia Ora Copywriter
          </h1>
        </div>
        <p className="text-[#6B7280] text-sm">Award-winning NZ English copy — Te Ao Māori aware, Govt Web Standards compliant</p>
      </div>

      {/* Content type tabs */}
      <div className="flex overflow-x-auto gap-1 pb-2 no-scrollbar">
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct}
            onClick={() => setContentType(ct)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap"
            style={ct === contentType
              ? { background: POUNAMU, color: OBSIDIAN, fontWeight: 500 }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }
            }
          >
            {ct}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="rounded-2xl border p-6 space-y-5" style={{
          background: "linear-gradient(135deg, rgba(10,10,10,0.9), rgba(0,168,107,0.03))",
          borderColor: "rgba(255,255,255,0.06)",
        }}>
          <div className="flex items-center gap-2 text-[#6B7280] text-xs uppercase tracking-[2px]">
            <PenTool className="w-3.5 h-3.5" style={{ color: POUNAMU }} />
            Brief
          </div>

          <div>
            <label className="text-[#6B7280] text-xs block mb-1.5">Topic / Brief</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[#1A1D29] text-sm focus:outline-none focus:border-[#00A86B44] min-h-[120px] transition-colors"
              placeholder="What should the Kia Ora Copywriter craft?"
            />
          </div>

          {/* Tone Selection */}
          <div>
            <label className="text-[#6B7280] text-xs block mb-2">Voice Tone</label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className="text-left px-3 py-2.5 rounded-xl text-xs transition-all"
                  style={t.id === tone
                    ? { background: `${POUNAMU}15`, border: `1px solid ${POUNAMU}30`, color: POUNAMU }
                    : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }
                  }
                >
                  <span className="font-medium block">{t.label}</span>
                  <span className="text-[10px] opacity-60 block mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <label className="text-[#6B7280] text-xs block mb-1.5">Length</label>
            <div className="flex gap-1">
              {(["short", "medium", "long"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className="flex-1 px-2 py-2 rounded-lg text-xs transition-all capitalize"
                  style={l === length
                    ? { background: POUNAMU, color: OBSIDIAN, fontWeight: 500 }
                    : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)" }
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* NZ Standards Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px]" style={{
            background: "rgba(0,168,107,0.06)",
            border: `1px solid ${POUNAMU}15`,
          }}>
            <Globe2 className="w-3.5 h-3.5" style={{ color: POUNAMU }} />
            <span className="text-[#6B7280]">NZ Govt Web Standards · Te Reo aware · Auto NZ English</span>
          </div>

          <Button
            onClick={generate}
            disabled={isGenerating || !topic.trim()}
            className="w-full rounded-xl py-3"
            style={{ background: `linear-gradient(135deg, ${POUNAMU}, ${TEAL})`, color: OBSIDIAN }}
          >
            {isGenerating ? "Writing..." : "Generate Copy"}
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Output Panel */}
        <div className="rounded-2xl border p-6 space-y-4" style={{
          background: "linear-gradient(135deg, rgba(10,10,10,0.9), rgba(0,206,209,0.02))",
          borderColor: "rgba(255,255,255,0.06)",
        }}>
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280] text-xs uppercase tracking-[2px]">Output</span>
            <div className="flex items-center gap-2">
              {output && (
                <>
                  <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }} className="text-[#6B7280] hover:text-[#4A5160] transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={saveToLibrary}
                    disabled={isSaving || saved}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all"
                    style={saved ? { background: `${POUNAMU}20`, color: POUNAMU } : { background: `${TEAL}15`, color: TEAL }}
                  >
                    {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    {saved ? "Saved" : isSaving ? "..." : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 min-h-[200px] text-[#1A1D29] text-sm whitespace-pre-wrap" style={{ fontFamily: "Inter, sans-serif" }}>
            {output || <span className="text-[#1A1D29]/15">Your copy will appear here...</span>}
          </div>

          {/* Action Buttons */}
          {output && (
            <>
              {/* Tone Check */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={toneCheck}
                  disabled={isCheckingTone}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{ background: `${POUNAMU}12`, color: POUNAMU, border: `1px solid ${POUNAMU}20` }}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {isCheckingTone ? "Checking..." : "Tone Check"}
                </button>
                <button onClick={() => refine("Make it shorter. Cut any fluff.")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-white/[0.03] text-[#6B7280] hover:text-[#2A2F3D] transition-colors border border-white/[0.04]">
                  <ArrowDown className="w-3 h-3" /> Shorter
                </button>
                <button onClick={() => refine("Make it longer with more detail and examples.")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-white/[0.03] text-[#6B7280] hover:text-[#2A2F3D] transition-colors border border-white/[0.04]">
                  <ArrowUp className="w-3 h-3" /> Longer
                </button>
                <button onClick={() => refine("Make it bolder. More punch, more edge.")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-white/[0.03] text-[#6B7280] hover:text-[#2A2F3D] transition-colors border border-white/[0.04]">
                  <Zap className="w-3 h-3" /> Bolder
                </button>
                <button onClick={() => refine("Rewrite in Kiwi Casual tone — friendly, approachable, down-to-earth.")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-white/[0.03] text-[#6B7280] hover:text-[#2A2F3D] transition-colors border border-white/[0.04]">
                  <MessageSquare className="w-3 h-3" /> Kiwi-fy
                </button>
              </div>

              {/* Tone Check Results */}
              <AnimatePresence>
                {toneCheckResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border p-4 text-xs text-[#4A5160] whitespace-pre-wrap"
                    style={{ background: `${POUNAMU}05`, borderColor: `${POUNAMU}15` }}
                  >
                    <div className="flex items-center gap-1.5 mb-2 text-[#6B7280] uppercase tracking-wider text-[10px]">
                      <ShieldCheck className="w-3 h-3" style={{ color: POUNAMU }} />
                      Tone Check Results
                    </div>
                    {toneCheckResult}
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-[#1A1D29]/15 text-[10px]">
                {output.length} characters · {contentType} · {selectedTone.label} tone · Auto-saved to pipeline
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
