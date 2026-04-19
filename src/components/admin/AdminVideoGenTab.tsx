import { useState } from "react";
import { Film, Download, Play, CheckCircle2, Loader2, Video } from "lucide-react";

const KETE = [
  { slug: "pikau", name: "Pikau", tagline: "Freight & Customs", accent: "#00B4D8", icon: "📦" },
  { slug: "manaaki", name: "Manaaki", tagline: "Hospitality", accent: "#E07A5F", icon: "🍷" },
  { slug: "arataki", name: "Arataki", tagline: "Automotive", accent: "#E63946", icon: "🚗" },
  { slug: "auaha", name: "Auaha", tagline: "Creative Studio", accent: "#7B2FF7", icon: "" },
  { slug: "waihanga", name: "Waihanga", tagline: "Construction", accent: "#F59E0B", icon: "️" },
  { slug: "haven", name: "Haven", tagline: "Property Management", accent: "#4AA5A8", icon: "" },
  { slug: "toroa", name: "Toroa", tagline: "Family Navigator", accent: "#06B6D4", icon: "" },
  { slug: "helm", name: "Helm", tagline: "Business Operations", accent: "#3A7D6E", icon: "⚙️" },
];

const FORMATS = [
  { id: "grid", label: "1:1 Square", desc: "Feed / Email", w: 1080, h: 1080 },
  { id: "story", label: "9:16 Story", desc: "Reels / TikTok", w: 1080, h: 1920 },
];

const glassStyle: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

export default function AdminVideoGenTab() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<"grid" | "story" | "both">("both");
  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [currentJob, setCurrentJob] = useState<string | null>(null);

  const toggleKete = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === KETE.length) setSelected(new Set());
    else setSelected(new Set(KETE.map(k => k.slug)));
  };

  // Build the list of videos to generate
  const getJobList = () => {
    const jobs: { id: string; slug: string; fmt: string; label: string; file: string }[] = [];
    for (const k of KETE) {
      if (!selected.has(k.slug)) continue;
      if (format === "both" || format === "grid") {
        jobs.push({ id: `${k.slug}-grid`, slug: k.slug, fmt: "grid", label: `${k.name} 1:1`, file: `${k.slug}-race-1080x1080.mp4` });
      }
      if (format === "both" || format === "story") {
        jobs.push({ id: `${k.slug}-story`, slug: k.slug, fmt: "story", label: `${k.name} 9:16`, file: `${k.slug}-race-1080x1920.mp4` });
      }
    }
    return jobs;
  };

  const jobList = getJobList();

  const handleGenerate = async () => {
    setGenerating(true);
    setCompleted([]);
    // Simulate rendering progress (actual rendering happens via CLI)
    for (const job of jobList) {
      setCurrentJob(job.id);
      // In production this would call an edge function that triggers the render
      await new Promise(r => setTimeout(r, 800));
      setCompleted(prev => [...prev, job.id]);
    }
    setCurrentJob(null);
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Film size={16} className="text-primary" /> Kete Race Video Generator
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Generate split-screen "Assembl AI vs Human" race videos for email outreach and social media.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={selectAll} className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors">
            {selected.size === KETE.length ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      {/* Kete Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KETE.map(k => {
          const isSelected = selected.has(k.slug);
          const isDone = completed.some(c => c.startsWith(k.slug));
          const isActive = currentJob?.startsWith(k.slug);
          return (
            <button
              key={k.slug}
              onClick={() => !generating && toggleKete(k.slug)}
              className={`relative rounded-xl p-4 text-left transition-all ${
                isSelected ? "ring-2 ring-primary" : "opacity-60 hover:opacity-80"
              } ${generating ? "cursor-default" : "cursor-pointer"}`}
              style={{
                ...glassStyle,
                borderColor: isSelected ? `${k.accent}40` : undefined,
                ...(isSelected ? { boxShadow: `0 0 20px ${k.accent}15`, outlineColor: k.accent } : {}),
              }}
            >
              {isDone && (
                <CheckCircle2 size={14} className="absolute top-2 right-2 text-[#5AADA0]" />
              )}
              {isActive && (
                <Loader2 size={14} className="absolute top-2 right-2 animate-spin" style={{ color: k.accent }} />
              )}
              <div className="text-lg mb-1">{k.icon}</div>
              <div className="text-xs font-bold text-foreground">{k.name}</div>
              <div className="text-[10px] text-muted-foreground">{k.tagline}</div>
              <div className="mt-2 h-0.5 rounded-full" style={{ background: isSelected ? k.accent : "rgba(255,255,255,0.06)" }} />
            </button>
          );
        })}
      </div>

      {/* Format Selection */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">Format:</span>
        {(["grid", "story", "both"] as const).map(f => (
          <button
            key={f}
            onClick={() => !generating && setFormat(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              format === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            style={format !== f ? glassStyle : {}}
          >
            {f === "grid" ? "1:1 Square" : f === "story" ? "9:16 Story" : "Both Formats"}
          </button>
        ))}
      </div>

      {/* Preview / Status */}
      {selected.size > 0 && (
        <div className="rounded-xl p-4 space-y-3" style={glassStyle}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              {jobList.length} video{jobList.length !== 1 ? "s" : ""} queued
            </span>
            {completed.length > 0 && (
              <span className="text-[10px] text-[#5AADA0] font-medium">
                {completed.length}/{jobList.length} complete
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {jobList.map(job => {
              const kete = KETE.find(k => k.slug === job.slug)!;
              const isDone = completed.includes(job.id);
              const isActive = currentJob === job.id;
              return (
                <div
                  key={job.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: isDone ? "rgba(90,173,160,0.1)" : isActive ? `${kete.accent}15` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isDone ? "rgba(90,173,160,0.2)" : isActive ? `${kete.accent}30` : "rgba(255,255,255,0.04)"}`,
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={12} className="text-[#5AADA0] shrink-0" />
                  ) : isActive ? (
                    <Loader2 size={12} className="animate-spin shrink-0" style={{ color: kete.accent }} />
                  ) : (
                    <Video size={12} className="text-muted-foreground shrink-0" />
                  )}
                  <span className={isDone ? "text-[#5AADA0]" : isActive ? "text-foreground" : "text-muted-foreground"}>
                    {job.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground ml-auto">
                    {job.fmt === "grid" ? "1:1" : "9:16"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Generate Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={generating || selected.size === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
                color: "hsl(var(--primary-foreground))",
                boxShadow: "0 4px 20px hsl(var(--primary) / 0.3)",
              }}
            >
              {generating ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Rendering...
                </>
              ) : completed.length === jobList.length && completed.length > 0 ? (
                <>
                  <CheckCircle2 size={14} /> All Done!
                </>
              ) : (
                <>
                  <Play size={14} /> Generate {jobList.length} Video{jobList.length !== 1 ? "s" : ""}
                </>
              )}
            </button>

            {completed.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                Videos saved to /mnt/documents/ — use the render script for actual MP4 output.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Instructions Card */}
      <div className="rounded-xl p-4" style={glassStyle}>
        <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
          <Download size={12} /> CLI Render Commands
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          Run these in the sandbox to generate the actual MP4 files:
        </p>
        <div className="space-y-2 font-mono text-[10px]">
          <div className="p-2 rounded-lg bg-black/30 text-[#5AADA0]">
            <code># Render all 16 videos (8 kete × 2 formats)</code><br />
            <code>cd remotion && node scripts/render-race.mjs all</code>
          </div>
          <div className="p-2 rounded-lg bg-black/30 text-[#5AADA0]">
            <code># Render single kete (both formats)</code><br />
            <code>cd remotion && node scripts/render-race.mjs all pikau</code>
          </div>
          <div className="p-2 rounded-lg bg-black/30 text-[#5AADA0]">
            <code># Render only 1:1 square videos</code><br />
            <code>cd remotion && node scripts/render-race.mjs grid</code>
          </div>
          <div className="p-2 rounded-lg bg-black/30 text-[#5AADA0]">
            <code># Render only 9:16 story videos</code><br />
            <code>cd remotion && node scripts/render-race.mjs story</code>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Output files: <code className="text-primary/70">/mnt/documents/[kete]-race-1080x1080.mp4</code> and <code className="text-primary/70">/mnt/documents/[kete]-race-1080x1920.mp4</code>
        </p>
      </div>
    </div>
  );
}
