import { useState, useRef } from "react";
import { Mic, Upload, Play, Pause, Sparkles, FileText, Radio, AudioLines, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ACCENT = "#F0D078";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border backdrop-blur-xl ${className}`} style={{ background: "rgba(15,15,26,0.7)", borderColor: "rgba(255,255,255,0.1)" }}>
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
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            { role: "system", content: "You are VERSE, Assembl's audio intelligence agent. Generate professional podcast show notes. NZ English. Include: Episode title, Description (2 sentences), Key topics (bullet points), Timestamps, 3 pull quotes for social, Blog summary (1 paragraph)." },
            { role: "user", content: "Generate show notes for a podcast episode about NZ business trends in 2026 — covering AI adoption in SMEs, remote work patterns, and export market shifts." },
          ],
        },
      });
      if (error) throw error;
      const reader = data?.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try { const c = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content; if (c) full += c; } catch {}
        }
      }
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
        <p className="text-white/40 text-xs uppercase tracking-[3px] mb-1">Auaha &gt; Podcast Studio</p>
        <h1 className="text-white text-2xl font-light uppercase tracking-[4px]" style={{ fontFamily: 'Lato, sans-serif' }}>Podcast Studio</h1>
        <p className="text-white/50 text-sm mt-1">Powered by VERSE — record, edit, publish with AI</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([["record", "Record", Mic], ["edit", "Edit & Enhance", AudioLines], ["publish", "Publish", Radio]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs transition-all ${tab === key ? "text-black font-medium" : "text-white/50 bg-white/5"}`}
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
            <h3 className="text-white text-sm font-medium mb-1">{isRecording ? "Recording..." : "Record"}</h3>
            <p className="text-white/40 text-xs mb-4">Browser-based recording via Web Audio API</p>
            <Button onClick={() => { setIsRecording(!isRecording); toast.info(isRecording ? "Recording stopped" : "Recording started — speak now"); }}
              style={{ background: isRecording ? "#ef4444" : ACCENT, color: isRecording ? "#fff" : "#000" }} className="w-full">
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            <div className="mt-4 pt-4 border-t border-white/10">
              <label className="flex items-center gap-2 text-white/50 text-xs cursor-pointer">
                <input type="checkbox" checked={coHostEnabled} onChange={(e) => setCoHostEnabled(e.target.checked)} className="rounded" />
                Enable AI co-host (VERSE)
              </label>
              {coHostEnabled && <p className="text-[10px] text-white/20 mt-1">VERSE will respond conversationally during recording</p>}
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `2px solid ${ACCENT}33` }}>
              <Upload className="w-10 h-10" style={{ color: ACCENT }} />
            </div>
            <h3 className="text-white text-sm font-medium mb-1">Upload Audio</h3>
            <p className="text-white/40 text-xs mb-4">MP3, WAV, M4A — we'll enhance and process</p>
            <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { setAudioFile(e.target.files[0]); toast.success(`Uploaded: ${e.target.files[0].name}`); }}} />
            <Button variant="outline" className="w-full border-white/10 text-white/60" onClick={() => fileRef.current?.click()}>
              {audioFile ? audioFile.name : "Choose File"}
            </Button>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-white text-sm font-medium mb-3">AI Enhancement</h3>
            <div className="space-y-3">
              {AI_FEATURES.map((f) => (
                <div key={f.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                  <div>
                    <p className="text-white/70 text-xs">{f.label}</p>
                    <p className="text-white/30 text-[10px]">{f.desc}</p>
                  </div>
                  {f.active ? <Sparkles className="w-3 h-3" style={{ color: ACCENT }} /> : <span className="text-[8px] text-white/20">Soon</span>}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "edit" && (
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="text-white/60 text-xs uppercase tracking-[3px] mb-4">Waveform Editor</h3>
            <div className="bg-white/5 rounded-lg h-24 flex items-center justify-center">
              <div className="flex items-end gap-[2px] h-16">
                {Array.from({ length: 80 }).map((_, i) => (
                  <div key={i} className="w-1 rounded-full transition-all" style={{ height: `${Math.random() * 100}%`, background: `${ACCENT}${Math.random() > 0.5 ? "88" : "44"}` }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <Button size="sm" variant="outline" className="border-white/10 text-white/60"><Play className="w-3 h-3 mr-1" /> Play</Button>
              <span className="text-white/30 text-xs font-mono">00:00 / 24:30</span>
            </div>
          </GlassCard>

          <div className="grid lg:grid-cols-2 gap-4">
            <GlassCard className="p-6">
              <h3 className="text-white text-sm mb-3">AI Show Notes</h3>
              <Button onClick={generateShowNotes} disabled={isGenerating} className="mb-3" style={{ background: ACCENT, color: "#000" }}>
                {isGenerating ? "VERSE is writing..." : "Generate Show Notes"}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
              {showNotes && (
                <div className="bg-white/5 rounded-lg p-4 text-white/70 text-xs whitespace-pre-wrap max-h-[300px] overflow-y-auto">{showNotes}</div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-white text-sm mb-3">Social Promotion</h3>
              <p className="text-white/40 text-xs mb-4">Auto-generate promotional content for this episode</p>
              <div className="space-y-2">
                {["Audiogram (60s video clip)", "Pull quote cards → Image Studio", "LinkedIn carousel summary", "Newsletter snippet"].map((item) => (
                  <button key={item} className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-left"
                    onClick={() => item.includes("Image") ? navigate("/auaha/images") : toast.info("Creating promotional asset...")}>
                    <span className="text-white/60 text-xs">{item}</span>
                    <Sparkles className="w-3 h-3 text-white/20" />
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {tab === "publish" && (
        <GlassCard className="p-6">
          <h3 className="text-white/60 text-xs uppercase tracking-[3px] mb-4">Episodes</h3>
          {DEMO_EPISODES.length > 0 ? (
            <div className="space-y-3">
              {DEMO_EPISODES.map((ep) => (
                <div key={ep.title} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                      <Play className="w-4 h-4" style={{ color: ACCENT }} />
                    </div>
                    <div>
                      <p className="text-white text-sm">{ep.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-white/30 text-[10px] flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {ep.duration}</span>
                        <span className="text-white/30 text-[10px]">{ep.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    ep.status === "published" ? "bg-emerald-400/20 text-emerald-400" :
                    ep.status === "editing" ? "bg-amber-400/20 text-amber-400" :
                    "bg-white/10 text-white/40"
                  }`}>{ep.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/20">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No episodes yet. Record or upload audio to get started.</p>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
