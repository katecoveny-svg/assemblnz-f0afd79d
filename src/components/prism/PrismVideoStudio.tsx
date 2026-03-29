import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Video, Clock, Users, Copy, CheckCircle2, X } from "lucide-react";

const ACCENT = "#E040FB";

export default function PrismVideoStudio({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<any[]>([]);
  const [showGen, setShowGen] = useState(false);
  const [form, setForm] = useState({ topic: "", audience: "", duration: "30s", format: "landscape" });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("video_scripts").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setScripts(data); });
  }, [user]);

  const generate = () => {
    if (!onSendToChat || !form.topic.trim()) return;
    onSendToChat(`Create a video script for a ${form.duration} ${form.format} video about "${form.topic}". Target audience: ${form.audience || "general NZ audience"}. Generate a scene-by-scene storyboard with: visual description, voiceover script, and timing for each scene. Also provide the full narration script.`);
    setShowGen(false);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-syne font-bold" style={{ color: "#E4E4EC" }}>Video Studio</h2>
        <button onClick={() => setShowGen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
          style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
          <Video size={12} /> New Script
        </button>
      </div>

      <div className="space-y-2">
        {scripts.map(s => (
          <div key={s.id} className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-syne font-semibold" style={{ color: "#E4E4EC" }}>{s.topic}</p>
              <div className="flex items-center gap-2">
                {s.duration && <span className="text-[9px] font-mono-jb px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>{s.duration}</span>}
                <button onClick={() => copyText(s.id, s.narration || JSON.stringify(s.storyboard))} className="p-1 rounded" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {copied === s.id ? <CheckCircle2 size={12} style={{ color: "rgba(102,187,106,0.9)" }} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            {s.audience && <p className="text-[10px] font-jakarta flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}><Users size={9} /> {s.audience}</p>}
            {s.narration && <p className="text-[10px] font-jakarta line-clamp-3" style={{ color: "rgba(255,255,255,0.3)" }}>{s.narration}</p>}
          </div>
        ))}
        {scripts.length === 0 && <p className="text-xs font-jakarta text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>No video scripts yet</p>}
      </div>

      {showGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#0D0D14", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-syne font-bold" style={{ color: "#E4E4EC" }}>Generate Video Script</h3>
              <button onClick={() => setShowGen(false)}><X size={16} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
            </div>
            <div>
              <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>Topic *</label>
              <textarea value={form.topic} onChange={e => setForm(prev => ({ ...prev, topic: e.target.value }))} rows={2}
                className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none resize-none"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} placeholder="What's the video about?" />
            </div>
            <div>
              <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>Target Audience</label>
              <input value={form.audience} onChange={e => setForm(prev => ({ ...prev, audience: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} placeholder="e.g. NZ business owners" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>Duration</label>
                <select value={form.duration} onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }}>
                  {["15s", "30s", "60s"].map(d => <option key={d} value={d} style={{ background: "#0D0D14" }}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>Format</label>
                <select value={form.format} onChange={e => setForm(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs font-jakarta bg-transparent border outline-none"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }}>
                  {["landscape", "portrait", "square"].map(f => <option key={f} value={f} style={{ background: "#0D0D14" }} className="capitalize">{f}</option>)}
                </select>
              </div>
            </div>
            <button onClick={generate} disabled={!form.topic.trim()} className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2"
              style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
              <Sparkles size={12} /> Generate Script
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
