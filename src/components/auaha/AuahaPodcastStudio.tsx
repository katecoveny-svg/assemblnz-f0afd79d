import { Mic, Upload, Play, Pause, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ACCENT = "#F0D078";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(15,15,26,0.7)", borderColor: "rgba(255,255,255,0.1)" }}>
      {children}
    </div>
  );
}

export default function AuahaPodcastStudio() {
  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <p className="text-white/40 text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Podcast Studio</p>
        <h1 className="text-white text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Podcast Studio</h1>
        <p className="text-white/50 text-sm mt-1">Powered by VERSE — audio intelligence</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Record */}
        <GlassCard className="p-6 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `2px solid ${ACCENT}33` }}>
            <Mic className="w-8 h-8" style={{ color: ACCENT }} />
          </div>
          <h3 className="text-white text-sm font-medium mb-1">Record</h3>
          <p className="text-white/40 text-xs mb-4">Browser-based recording with AI co-host option</p>
          <Button onClick={() => toast.info("Recording will use Web Audio API — coming soon")} style={{ background: ACCENT, color: "#000" }} className="w-full">
            Start Recording
          </Button>
          <div className="mt-4 pt-4 border-t border-white/10">
            <label className="flex items-center gap-2 text-white/50 text-xs cursor-pointer">
              <input type="checkbox" className="rounded" />
              Enable AI co-host (VERSE)
            </label>
          </div>
        </GlassCard>

        {/* Upload */}
        <GlassCard className="p-6 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `2px solid ${ACCENT}33` }}>
            <Upload className="w-8 h-8" style={{ color: ACCENT }} />
          </div>
          <h3 className="text-white text-sm font-medium mb-1">Upload Audio</h3>
          <p className="text-white/40 text-xs mb-4">MP3, WAV, M4A — we'll enhance and process</p>
          <Button variant="outline" className="w-full border-white/10 text-white/60" onClick={() => toast.info("Upload functionality coming soon")}>
            Choose File
          </Button>
        </GlassCard>

        {/* AI Features */}
        <GlassCard className="p-6">
          <h3 className="text-white text-sm font-medium mb-3">AI Enhancement</h3>
          <div className="space-y-3">
            {[
              { label: "Remove ums & pauses", desc: "AI cleanup" },
              { label: "Auto-level audio", desc: "Normalisation" },
              { label: "Generate show notes", desc: "VERSE analyses content" },
              { label: "Create audiogram", desc: "Social video clip" },
              { label: "Generate transcript", desc: "Full episode text" },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                <div>
                  <p className="text-white/70 text-xs">{f.label}</p>
                  <p className="text-white/30 text-[10px]">{f.desc}</p>
                </div>
                <Sparkles className="w-3 h-3 text-white/20" />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Episodes */}
      <GlassCard className="p-6">
        <h3 className="text-white/60 text-xs uppercase tracking-[3px] mb-4">Episodes</h3>
        <div className="text-center py-8 text-white/20">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No episodes yet. Record or upload audio to get started.</p>
        </div>
      </GlassCard>
    </div>
  );
}
