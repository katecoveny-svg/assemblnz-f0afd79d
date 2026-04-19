import { useState, useRef } from "react";
import { Mic, Upload, Play, Pause, Sparkles, FileText, Radio, AudioLines, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { agentChat } from "@/lib/agentChat";
import { useNavigate } from "react-router-dom";

const ACCENT = "#F0D078";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(74,165,168,0.14)" }}>
      {children}
    </div>
  );
}

const AI_FEATURES = [
  { label: "Remove ums & pauses", desc: "AI cleanup", active: true },
  { label: "Auto-level audio", desc: "Normalisation", active: true },
  { label: "Generate show notes", desc: "VERSE analyses content", active: true },
  { label: "Create audiogram", desc: "Social video clip → Image Studio", active: true },
  { label: "Generate transcript", desc: "Full episode text", active: true },
  { label: "AI co-host", desc: "VERSE responds conversationally", active: false },
];

const DEMO_EPISODES = [
  { title: "NZ Business Trends Q2 2026", duration: "24:30", status: "published", date: "28 Mar 2026" },
  { title: "Marketing That Doesn't Sound Like AI", duration: "18:45", status: "editing", date: "2 Apr 2026" },
  { title: "The Kete Model — Building Symbiotic Teams", duration: "32:10", status: "draft", date: "3 Apr 2026" },
];

export default function AuahaPodcastStudio() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"record" | "edit" | "publish">("record");
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coHostEnabled, setCoHostEnabled] = useState(false);
  const [showNotes, setShowNotes] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const generateShowNotes = async () => {
    setIsGenerating(true);
    try {
      const full = await agentChat({
        agentId: "verse",
        packId: "auaha",
        message: "Generate show notes for a podcast episode about NZ business trends in 2026 — covering AI adoption in SMEs, remote work patterns, and export market shifts.\n\nInclude: Episode title, Description (2 sentences), Key topics (bullet points), Timestamps, 3 pull quotes for social, Blog summary (1 paragraph). NZ English.",
      });
      setShowNotes(full);
      toast.success("VERSE generated show notes");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate show notes");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <p className="text-[#6B7280] text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Podcast Studio</p>
        <h1 className="text-foreground text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Podcast Studio</h1>
        <p className="text-[#6B7280] text-sm mt-1">Powered by VERSE — record, edit, publish with AI</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([["record", "Record", Mic], ["edit", "Edit & Enhance", AudioLines], ["publish", "Publish", Radio]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs transition-all ${tab === key ? "text-[#1A1D29] font-medium" : "text-[#6B7280] bg-[rgba(74,165,168,0.04)]"}`}
            style={tab === key ? { background: ACCENT } : {}}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "record" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 text-center">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${isRecording ? "animate-pulse" : ""}`}
              style={{ background: isRecording ? `${ACCENT}30` : `${ACCENT}15`, border: `2px solid ${isRecording ? ACCENT : `${ACCENT}33`}` }}>
              <Mic className="w-10 h-10" style={{ color: ACCENT }} />
            </div>
            <h3 className="text-foreground text-sm font-medium mb-1">{isRecording ? "Recording..." : "Record"}</h3>
            <p className="text-[#6B7280] text-xs mb-4">Browser-based recording via Web Audio API</p>
            <Button onClick={() => { setIsRecording(!isRecording); toast.info(isRecording ? "Recording stopped" : "Recording started — speak now"); }}
              style={{ background: isRecording ? "#ef4444" : ACCENT, color: isRecording ? "#fff" : "#000" }} className="w-full">
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="flex items-center gap-2 text-[#6B7280] text-xs cursor-pointer">
                <input type="checkbox" checked={coHostEnabled} onChange={(e) => setCoHostEnabled(e.target.checked)} className="rounded" />
                Enable AI co-host (VERSE)
              </label>
              {coHostEnabled && <p className="text-[10px] text-[#8B92A0] mt-1">VERSE will respond conversationally during recording</p>}
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `2px solid ${ACCENT}33` }}>
              <Upload className="w-10 h-10" style={{ color: ACCENT }} />
            </div>
            <h3 className="text-foreground text-sm font-medium mb-1">Upload Audio</h3>
            <p className="text-[#6B7280] text-xs mb-4">MP3, WAV, M4A — we'll enhance and process</p>
            <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { setAudioFile(e.target.files[0]); toast.success(`Uploaded: ${e.target.files[0].name}`); }}} />
            <Button variant="outline" className="w-full border-gray-200 text-[#4A5160]" onClick={() => fileRef.current?.click()}>
              {audioFile ? audioFile.name : "Choose File"}
            </Button>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-foreground text-sm font-medium mb-3">AI Enhancement</h3>
            <div className="space-y-3">
              {AI_FEATURES.map((f) => (
                <div key={f.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(74,165,168,0.04)] transition-all">
                  <div>
                    <p className="text-[#2A2F3D] text-xs">{f.label}</p>
                    <p className="text-[#6B7280] text-[10px]">{f.desc}</p>
                  </div>
                  {f.active ? <Sparkles className="w-3 h-3" style={{ color: ACCENT }} /> : <span className="text-[8px] text-[#8B92A0]">Soon</span>}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "edit" && (
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px] mb-4">Waveform Editor</h3>
            <div className="bg-[rgba(74,165,168,0.04)] rounded-lg h-24 flex items-center justify-center">
              <div className="flex items-end gap-[2px] h-16">
                {Array.from({ length: 80 }).map((_, i) => (
                  <div key={i} className="w-1 rounded-full transition-all" style={{ height: `${Math.random() * 100}%`, background: `${ACCENT}${Math.random() > 0.5 ? "88" : "44"}` }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <Button size="sm" variant="outline" className="border-gray-200 text-[#4A5160]"><Play className="w-3 h-3 mr-1" /> Play</Button>
              <span className="text-[#6B7280] text-xs font-mono">00:00 / 24:30</span>
            </div>
          </GlassCard>

          <div className="grid lg:grid-cols-2 gap-4">
            <GlassCard className="p-6">
              <h3 className="text-foreground text-sm mb-3">AI Show Notes</h3>
              <Button onClick={generateShowNotes} disabled={isGenerating} className="mb-3" style={{ background: ACCENT, color: "#000" }}>
                {isGenerating ? "VERSE is writing..." : "Generate Show Notes"}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
              {showNotes && (
                <div className="bg-[rgba(74,165,168,0.04)] rounded-lg p-4 text-[#2A2F3D] text-xs whitespace-pre-wrap max-h-[300px] overflow-y-auto">{showNotes}</div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-foreground text-sm mb-3">Social Promotion</h3>
              <p className="text-[#6B7280] text-xs mb-4">Auto-generate promotional content for this episode</p>
              <div className="space-y-2">
                {["Audiogram (60s video clip)", "Pull quote cards → Image Studio", "LinkedIn carousel summary", "Newsletter snippet"].map((item) => (
                  <button key={item} className="w-full flex items-center justify-between p-3 rounded-lg bg-[rgba(74,165,168,0.04)] hover:bg-[rgba(74,165,168,0.06)] transition-all text-left"
                    onClick={() => item.includes("Image") ? navigate("/auaha/images") : toast.info("Creating promotional asset...")}>
                    <span className="text-[#4A5160] text-xs">{item}</span>
                    <Sparkles className="w-3 h-3 text-[#8B92A0]" />
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {tab === "publish" && (
        <GlassCard className="p-6">
          <h3 className="text-[#4A5160] text-xs uppercase tracking-[3px] mb-4">Episodes</h3>
          {DEMO_EPISODES.length > 0 ? (
            <div className="space-y-3">
              {DEMO_EPISODES.map((ep) => (
                <div key={ep.title} className="flex items-center justify-between p-4 rounded-lg bg-[rgba(74,165,168,0.04)] hover:bg-white/[0.07] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                      <Play className="w-4 h-4" style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <p className="text-foreground text-sm">{ep.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[#6B7280] text-[10px] flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {ep.duration}</span>
                        <span className="text-[#6B7280] text-[10px]">{ep.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    ep.status === "published" ? "bg-[#5AADA0]/20 text-[#5AADA0]" :
                    ep.status === "editing" ? "bg-[#D4A843]/20 text-[#D4A843]" :
                    "bg-[rgba(74,165,168,0.06)] text-[#6B7280]"
                  }`}>{ep.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#8B92A0]">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No episodes yet. Record or upload audio to get started.</p>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
