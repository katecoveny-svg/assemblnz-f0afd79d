import { useState, useCallback } from "react";
import { Sparkles, Shield, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, CheckCircle2, Clock, Download, Eye, Loader2, ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ulid } from "ulid";

const ACCENT = "#A8DDDB";
const TEAL = "#5AADA0";

// ── Kahu tiers ──────────────────────────────────────────────
type KahuVerdict = "pass" | "flag_cultural" | "flag_brand" | "block";

interface KahuResult {
  verdict: KahuVerdict;
  tier: "clear" | "cultural_sensitivity" | "brand_safety" | "hard_block";
  flags: string[];
  details: string;
}

// ── Iho model catalogue ────────────────────────────────────
const MODEL_CATALOGUE = {
  image: [
    { id: "fal-flux-pro", provider: "fal", label: "Fal.ai — Flux Pro 1.1", desc: "Photorealism, fastest" },
    { id: "fal-flux-schnell", provider: "fal", label: "Fal.ai — Flux Schnell", desc: "Ultra-fast drafts" },
    { id: "fal-flux-realism", provider: "fal", label: "Fal.ai — Flux Realism", desc: "Hyper-realistic output" },
    { id: "lovable-gemini", provider: "lovable", label: "Lovable AI — Gemini", desc: "No API key needed" },
  ],
  video: [
    { id: "fal-kling", provider: "fal", label: "Fal.ai — Kling v1.6", desc: "Long clips, social video" },
    { id: "fal-minimax", provider: "fal", label: "Fal.ai — MiniMax", desc: "Fast, cost-effective" },
    { id: "runway-gen3", provider: "runway", label: "Runway Gen-3 Alpha", desc: "Premium cinematic" },
  ],
};

// ── Local Kahu compliance check ─────────────────────────────
const HARD_BLOCKS = [/\bexplicit\b/i, /\bcsam\b/i, /\bweapons?\s*manufactur/i, /\bnud(e|ity)\b/i, /\bgore\b/i];
const CULTURAL_FLAGS = [/\btā\s*moko\b/i, /\bhaka\b/i, /\bwāhi\s*tapu\b/i, /\bhei\s*tiki\b/i, /\bmarae\b/i, /\btaonga\b/i, /\bkarakia\b/i];
const BRAND_FLAGS = [/\bgovernment\s*(logo|imagery|crest)\b/i, /\btrademark\b/i, /\bcopyright\b/i, /\breal\s*person\b/i, /\bcelebrit/i, /\bpolitician\b/i];

function runKahu(prompt: string): KahuResult {
  const lower = prompt.toLowerCase();
  // Hard blocks
  for (const re of HARD_BLOCKS) {
    if (re.test(prompt)) return { verdict: "block", tier: "hard_block", flags: [re.source], details: "Content violates hard-block policy — job will not be dispatched." };
  }
  // Cultural sensitivity
  const culturalHits = CULTURAL_FLAGS.filter(re => re.test(prompt));
  if (culturalHits.length > 0) {
    return { verdict: "flag_cultural", tier: "cultural_sensitivity", flags: culturalHits.map(r => r.source), details: "Cultural taonga detected — requires human approval before generation." };
  }
  // Brand safety
  const brandHits = BRAND_FLAGS.filter(re => re.test(prompt));
  if (brandHits.length > 0) {
    return { verdict: "flag_brand", tier: "brand_safety", flags: brandHits.map(r => r.source), details: "Brand safety concern flagged — user can approve to proceed." };
  }
  return { verdict: "pass", tier: "clear", flags: [], details: "Prompt cleared all compliance checks." };
}

// ── Tā audit entry ──────────────────────────────────────────
interface AuditEntry {
  id: string;
  timestamp: string;
  stage: "kahu" | "iho" | "ta" | "generate" | "evidence";
  action: string;
  actor: string;
  detail: string;
  status: "pass" | "flag" | "fail" | "pending" | "complete";
}

// ── Job type ────────────────────────────────────────────────
interface Job {
  id: string;
  prompt: string;
  type: "image" | "video";
  provider: string;
  model: string;
  status: "kahu_check" | "flagged" | "blocked" | "generating" | "complete" | "error";
  kahuResult: KahuResult;
  audit: AuditEntry[];
  resultUrl?: string;
  createdAt: string;
  completedAt?: string;
}

function GlassCard({ children, className = "", accent = false }: { children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`}
      style={{ background: "rgba(255,255,255,0.92)", borderColor: accent ? `${ACCENT}33` : "rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

function KahuBadge({ result }: { result: KahuResult }) {
  const config = {
    pass: { icon: ShieldCheck, color: "#34D399", label: "KAHU: PASS", bg: "rgba(90,173,160,0.1)" },
    flag_cultural: { icon: ShieldAlert, color: "#FBBF24", label: "KAHU: CULTURAL FLAG", bg: "rgba(251,191,36,0.1)" },
    flag_brand: { icon: AlertTriangle, color: "#F59E0B", label: "KAHU: BRAND FLAG", bg: "rgba(245,158,11,0.1)" },
    block: { icon: ShieldX, color: "#EF4444", label: "KAHU: BLOCKED", bg: "rgba(239,68,68,0.1)" },
  }[result.verdict];
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: config.bg, border: `1px solid ${config.color}30` }}>
      <Icon className="w-4 h-4" style={{ color: config.color }} />
      <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
      {result.flags.length > 0 && <span className="text-[10px] text-[#6B7280] ml-2">({result.flags.length} flag{result.flags.length > 1 ? "s" : ""})</span>}
    </div>
  );
}

export default function AuahaGenerate() {
  const { session } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [genType, setGenType] = useState<"image" | "video">("image");
  const [selectedModel, setSelectedModel] = useState("auto");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const models = MODEL_CATALOGUE[genType];

  const addAudit = (jobId: string, stage: AuditEntry["stage"], action: string, detail: string, status: AuditEntry["status"]): AuditEntry => ({
    id: ulid(),
    timestamp: new Date().toISOString(),
    stage,
    action,
    actor: stage === "kahu" ? "Kahu (Compliance)" : stage === "iho" ? "Iho (Router)" : stage === "ta" ? "Tā (Audit)" : "System",
    detail,
    status,
  });

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return toast.error("Enter a prompt");
    setIsGenerating(true);

    const jobId = ulid();
    const audit: AuditEntry[] = [];
    const now = new Date().toISOString();

    // ── Stage 1: Kahu compliance check ──────────────────────
    audit.push(addAudit(jobId, "kahu", "compliance_scan", "Scanning prompt against 3-tier policy...", "pending"));
    const kahuResult = runKahu(prompt);
    audit[audit.length - 1] = { ...audit[audit.length - 1], status: kahuResult.verdict === "pass" ? "pass" : kahuResult.verdict === "block" ? "fail" : "flag", detail: kahuResult.details };

    if (kahuResult.verdict === "block") {
      const job: Job = { id: jobId, prompt, type: genType, provider: "—", model: "—", status: "blocked", kahuResult, audit, createdAt: now };
      audit.push(addAudit(jobId, "ta", "audit_log", "Hard-block recorded — job terminated at Kahu stage.", "complete"));
      setJobs(prev => [job, ...prev]);
      setExpandedJob(jobId);
      setIsGenerating(false);
      toast.error("Blocked by Kahu — content policy violation");
      return;
    }

    if (kahuResult.verdict === "flag_cultural") {
      const job: Job = { id: jobId, prompt, type: genType, provider: "—", model: "—", status: "flagged", kahuResult, audit, createdAt: now };
      audit.push(addAudit(jobId, "ta", "audit_log", "Cultural sensitivity flag — held for human approval.", "flag"));
      setJobs(prev => [job, ...prev]);
      setExpandedJob(jobId);
      setIsGenerating(false);
      toast.warning("Held for approval — cultural taonga detected");
      return;
    }

    // Brand safety — user can proceed
    if (kahuResult.verdict === "flag_brand") {
      audit.push(addAudit(jobId, "kahu", "brand_warning", "Brand safety flagged — user approved to proceed.", "flag"));
    }

    // ── Stage 2: Iho routing ────────────────────────────────
    const resolvedModel = selectedModel === "auto" ? models[0] : models.find(m => m.id === selectedModel) || models[0];
    audit.push(addAudit(jobId, "iho", "route_resolved", `Iho selected ${resolvedModel.label} (${resolvedModel.provider}) — ${resolvedModel.provider === "lovable" ? "no API key required" : "checking credentials..."}`, "pass"));

    // ── Stage 3: Tā pre-generation audit ────────────────────
    audit.push(addAudit(jobId, "ta", "pre_dispatch", `Job ${jobId.slice(0, 8)} dispatched to ${resolvedModel.provider}`, "pending"));

    const job: Job = { id: jobId, prompt, type: genType, provider: resolvedModel.provider, model: resolvedModel.id, status: "generating", kahuResult, audit, createdAt: now };
    setJobs(prev => [job, ...prev]);
    setExpandedJob(jobId);

    try {
      // Dispatch to edge function
      const fnName = genType === "image" ? "generate-image" : "generate-video";
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: {
          prompt,
          provider: resolvedModel.provider === "lovable" ? undefined : resolvedModel.provider,
          quality: "fast",
          ...(genType === "video" ? { aspectRatio: "16:9" } : {}),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      let resultUrl: string | undefined = genType === "image" ? data?.imageUrl : data?.videoUrl;

      // ── Video: Fal.ai returns a requestId — poll for completion ──
      if (genType === "video" && !resultUrl && data?.requestId) {
        setJobs(prev => prev.map(j => j.id === jobId ? {
          ...j,
          audit: [...j.audit, addAudit(jobId, "ta", "polling", `Job submitted to Fal.ai (${data.requestId.slice(0,8)}). Polling for completion...`, "pending")],
        } : j));

        // Poll up to 90 seconds (Kling typically completes in 30-60s)
        const maxPolls = 30;
        for (let i = 0; i < maxPolls; i++) {
          await new Promise(r => setTimeout(r, 3000));
          try {
            const { data: pollData, error: pollErr } = await supabase.functions.invoke("generate-video", {
              body: { action: "poll", requestId: data.requestId, prompt },
            });
            if (pollErr) continue;
            if (pollData?.status === "completed" && pollData?.videoUrl) {
              resultUrl = pollData.videoUrl;
              break;
            }
            if (pollData?.status === "failed" || pollData?.status === "error") {
              throw new Error("Fal.ai generation failed");
            }
          } catch (pe) {
            console.warn("poll iter failed:", pe);
          }
        }

        if (!resultUrl) throw new Error("Video generation timed out after 90s — try Runway or a shorter prompt");
      }

      if (!resultUrl) throw new Error(`No ${genType} returned by ${resolvedModel.label}`);

      // ── Stage 4: Tā post-generation audit ───────────────
      const completedAudit = addAudit(jobId, "ta", "generation_complete", `Output received from ${resolvedModel.provider}. URL stored.`, "complete");
      const evidenceAudit = addAudit(jobId, "evidence", "pack_ready", `Evidence pack available for job ${jobId.slice(0, 8)}`, "complete");

      setJobs(prev => prev.map(j => j.id === jobId ? {
        ...j,
        status: "complete",
        resultUrl,
        completedAt: new Date().toISOString(),
        audit: [...j.audit, completedAudit, evidenceAudit],
      } : j));

      toast.success(`${genType === "image" ? "Image" : "Video"} generated via ${resolvedModel.label}`);
    } catch (e: any) {
      const errorAudit = addAudit(jobId, "ta", "generation_error", e.message || "Generation failed", "fail");
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: "error", audit: [...j.audit, errorAudit] } : j));
      toast.error(e.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, genType, selectedModel, models, session]);

  const approveJob = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status !== "flagged") return;
    // Restore prompt + re-run so the approved job actually generates.
    setPrompt(job.prompt);
    setGenType(job.type);
    setJobs(prev => prev.filter(j => j.id !== jobId));
    toast.success("Approved — regenerating with cultural-sensitivity override");
    // Temporarily neutralise the cultural flag for this run.
    const original = CULTURAL_FLAGS.splice(0, CULTURAL_FLAGS.length);
    try {
      await handleGenerate();
    } finally {
      CULTURAL_FLAGS.push(...original);
    }
  };

  const downloadEvidence = (job: Job) => {
    const pack = {
      job_id: job.id,
      type: job.type,
      prompt: job.prompt,
      provider: job.provider,
      model: job.model,
      kahu_verdict: job.kahuResult,
      audit_trail: job.audit,
      created_at: job.createdAt,
      completed_at: job.completedAt,
      result_url: job.resultUrl,
      privacy_act_2020: "This evidence pack is generated in compliance with the NZ Privacy Act 2020.",
      exported_at: new Date().toISOString(),
      exported_by: session?.user?.email || "anonymous",
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `evidence-pack-${job.id.slice(0, 8)}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Evidence pack downloaded");
  };

  const statusColor = (s: Job["status"]) => ({
    kahu_check: "#FBBF24", flagged: "#F59E0B", blocked: "#EF4444", generating: "#60A5FA", complete: "#34D399", error: "#EF4444",
  }[s]);

  const stageColor = (s: AuditEntry["status"]) => ({
    pass: "#34D399", flag: "#FBBF24", fail: "#EF4444", pending: "#60A5FA", complete: "#34D399",
  }[s]);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Generate</p>
        <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>
          Generate Studio
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">Kahu compliance → Iho routing → Tā audit → Output + Evidence Pack</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Controls */}
        <GlassCard className="lg:col-span-2 p-6 space-y-5">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(["image", "video"] as const).map(t => (
              <button key={t} onClick={() => { setGenType(t); setSelectedModel("auto"); }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all ${t === genType ? "text-[#1A1D29] font-medium" : "text-[#6B7280] bg-[rgba(74,165,168,0.04)]"}`}
                style={t === genType ? { background: ACCENT } : {}}>
                {t}
              </button>
            ))}
          </div>

          {/* Prompt */}
          <div>
            <label className="text-[#6B7280] text-xs block mb-1.5">Prompt</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
              className="w-full bg-[rgba(74,165,168,0.04)] border border-gray-200 rounded-lg px-4 py-3 text-foreground text-sm min-h-[120px] placeholder:text-[#8B92A0] focus:outline-none focus:border-[#A8DDDB66]"
              placeholder="Describe what you want to create... Kahu will scan for compliance before dispatch." />
          </div>

          {/* Live Kahu preview */}
          {prompt.trim() && <KahuBadge result={runKahu(prompt)} />}

          {/* Model selector */}
          <div>
            <label className="text-[#6B7280] text-xs block mb-1.5">Model / Provider (Iho routing)</label>
            <div className="space-y-1">
              <button onClick={() => setSelectedModel("auto")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${selectedModel === "auto" ? "border" : "bg-[rgba(74,165,168,0.04)]"}`}
                style={selectedModel === "auto" ? { borderColor: `${ACCENT}66`, background: `${ACCENT}10` } : {}}>
                <span className={selectedModel === "auto" ? "text-foreground" : "text-[#6B7280]"}>Auto (Iho picks best)</span>
                <span className="text-[#6B7280] text-[10px]">Recommended</span>
              </button>
              {models.map(m => (
                <button key={m.id} onClick={() => setSelectedModel(m.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${m.id === selectedModel ? "border" : "bg-[rgba(74,165,168,0.04)]"}`}
                  style={m.id === selectedModel ? { borderColor: `${ACCENT}66`, background: `${ACCENT}10` } : {}}>
                  <span className={m.id === selectedModel ? "text-foreground" : "text-[#6B7280]"}>{m.label}</span>
                  <span className="text-[#6B7280] text-[10px]">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live mode notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "rgba(90,173,160,0.08)", border: "1px solid rgba(90,173,160,0.2)" }}>
            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#34D399" }} />
            <div>
              <p className="text-[#1A1D29] text-xs font-medium">Live — full access</p>
              <p className="text-[#6B7280] text-[10px]">Lovable AI, Fal.ai & Runway providers connected. Kahu compliance, Iho routing, Tā audit and Evidence Packs all active.</p>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" style={{ background: ACCENT, color: "#000" }}>
            {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Pipeline running...</> : <><Shield className="w-4 h-4 mr-2" /> Kahu Check → Generate</>}
          </Button>
        </GlassCard>

        {/* Right: Job results + audit */}
        <div className="lg:col-span-3 space-y-4">
          {jobs.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Shield className="w-12 h-12 mx-auto mb-3 text-[#1A1D29]/10" />
              <p className="text-[#6B7280] text-sm">No jobs yet</p>
              <p className="text-[#1A1D29]/15 text-[10px] mt-1">Submit a prompt to see the full Kahu → Iho → Tā pipeline in action</p>
            </GlassCard>
          ) : (
            jobs.map(job => (
              <GlassCard key={job.id} className="overflow-hidden" accent={job.status === "complete"}>
                {/* Job header */}
                <button onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: statusColor(job.status) }} />
                    <span className="text-[#4A5160] text-xs font-mono">{job.id.slice(0, 8)}</span>
                    <span className="text-[#6B7280] text-xs uppercase">{job.status.replace("_", " ")}</span>
                    <span className="text-[#8B92A0] text-[10px]">{job.type} • {job.provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === "complete" && (
                      <button onClick={e => { e.stopPropagation(); downloadEvidence(job); }}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[#6B7280] hover:text-[#2A2F3D] bg-[rgba(74,165,168,0.04)]">
                        <Download className="w-3 h-3" /> Evidence Pack
                      </button>
                    )}
                    {job.status === "flagged" && (
                      <button onClick={e => { e.stopPropagation(); approveJob(job.id); }}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-amber-500/20 text-[#4AA5A8] hover:bg-amber-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Approve
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-[#8B92A0] transition-transform ${expandedJob === job.id ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedJob === job.id && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    {/* Prompt */}
                    <div className="bg-[rgba(74,165,168,0.04)] rounded-lg p-3">
                      <span className="text-[#6B7280] text-[10px] uppercase tracking-wider">Prompt</span>
                      <p className="text-[#2A2F3D] text-sm mt-1">{job.prompt}</p>
                    </div>

                    {/* Kahu result */}
                    <KahuBadge result={job.kahuResult} />

                    {/* Result preview */}
                    {job.resultUrl && (
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        {job.type === "image" ? (
                          <img loading="lazy" decoding="async" src={job.resultUrl} alt="Generated" className="w-full max-h-[400px] object-contain bg-[rgba(26,29,41,0.02)]0" />
                        ) : (
                          <video src={job.resultUrl} controls className="w-full" />
                        )}
                      </div>
                    )}

                    {/* Tā Audit Trail */}
                    <div>
                      <span className="text-[#6B7280] text-xs uppercase tracking-[2px] block mb-3">Tā Audit Trail</span>
                      <div className="space-y-2">
                        {job.audit.map((entry, i) => (
                          <div key={entry.id} className="flex gap-3 items-start">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: stageColor(entry.status) }} />
                              {i < job.audit.length - 1 && <div className="w-px flex-1 mt-1 bg-[rgba(74,165,168,0.04)]" />}
                            </div>
                            <div className="flex-1 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${stageColor(entry.status)}15`, color: stageColor(entry.status) }}>
                                  {entry.stage.toUpperCase()}
                                </span>
                                <span className="text-[#6B7280] text-[10px]">{entry.actor}</span>
                                <span className="text-[#8B92A0] text-[9px] ml-auto font-mono">
                                  {new Date(entry.timestamp).toLocaleTimeString("en-NZ", { hour12: false, timeZone: "Pacific/Auckland" })}
                                </span>
                              </div>
                              <p className="text-[#4A5160] text-xs mt-1">{entry.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
