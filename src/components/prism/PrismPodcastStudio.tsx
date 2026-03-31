import { useState } from "react";
import { Mic, Sparkles, Zap, Crown, Clock, Users, Radio, Music } from "lucide-react";

const ACCENT = "#E040FB";

const PODCAST_FORMATS = [
  { id: "solo", label: "Solo Host", icon: Mic, desc: "Single narrator deep-dive" },
  { id: "interview", label: "Interview", icon: Users, desc: "Host + guest conversation" },
  { id: "panel", label: "Panel Discussion", icon: Radio, desc: "Multi-voice roundtable" },
  { id: "narrative", label: "Narrative Story", icon: Music, desc: "Scripted storytelling" },
];

const TONES = ["Professional", "Conversational", "Educational", "Inspirational", "Humorous", "Investigative", "Casual Kiwi"];
const DURATIONS = ["5 min", "10 min", "15 min", "20 min", "30 min"];
const EPISODE_TYPES = ["Industry Deep-Dive", "News Commentary", "How-To Guide", "Case Study", "Expert Interview", "Weekly Wrap-Up", "Client Spotlight", "Compliance Update"];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
      style={{
        background: active ? `${ACCENT}15` : "rgba(255,255,255,0.03)",
        color: active ? ACCENT : "rgba(255,255,255,0.4)",
        border: `1px solid ${active ? ACCENT + "30" : "rgba(255,255,255,0.05)"}`
      }}>
      {label}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-mono-jb uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>{children}</label>;
}

export default function PrismPodcastStudio({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [format, setFormat] = useState("solo");
  const [tone, setTone] = useState("Conversational");
  const [duration, setDuration] = useState("15 min");
  const [episodeType, setEpisodeType] = useState("Industry Deep-Dive");
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeOutro, setIncludeOutro] = useState(true);
  const [numSegments, setNumSegments] = useState(3);
  const [quality, setQuality] = useState<"fast" | "pro">("pro");

  const selectedFormat = PODCAST_FORMATS.find(f => f.id === format);

  const generate = () => {
    if (!onSendToChat || !topic.trim()) return;

    const formatLabel = selectedFormat?.label || format;
    const qualityTag = quality === "pro" ? " [QUALITY:pro]" : " [QUALITY:fast]";

    const prompt = `You are PRISM Podcast Studio — "Assembl with me" — a world-class podcast content generator built for NZ businesses.

**EPISODE BRIEF**
- **Format:** ${formatLabel}
- **Type:** ${episodeType}
- **Topic:** ${topic}
- **Tone:** ${tone}
- **Target Duration:** ${duration}
- **Segments:** ${numSegments}
${targetAudience ? `- **Target Audience:** ${targetAudience}` : ""}
${keyPoints ? `- **Key Points to Cover:** ${keyPoints}` : ""}

Generate a complete podcast episode script with the following structure:

${includeIntro ? `## 🎙️ INTRO (30-60 seconds)
- Opening hook that grabs attention
- "Assembl with me" brand mention
- Episode overview and what listeners will learn
` : ""}

## 📋 EPISODE OUTLINE
Break into ${numSegments} distinct segments with:
- **Segment title** and estimated timing
- **Key talking points** (3-5 per segment)
- **Transition lines** between segments
${format === "interview" ? "- **Suggested interview questions** for each segment" : ""}
${format === "panel" ? "- **Discussion prompts** and **counterpoint suggestions** for panelists" : ""}

## 📝 FULL SCRIPT
Write the complete script in a natural, ${tone.toLowerCase()} voice:
${format === "solo" ? "- Written as direct-to-listener narration" : ""}
${format === "interview" ? "- Include HOST: and GUEST: dialogue markers" : ""}
${format === "panel" ? "- Include HOST:, PANELIST 1:, PANELIST 2:, PANELIST 3: dialogue markers" : ""}
${format === "narrative" ? "- Written as immersive storytelling with scene descriptions" : ""}
- Use NZ English and references where appropriate
- Include natural pauses, emphasis markers, and tone directions in [brackets]

${includeOutro ? `## 🔚 OUTRO (30-60 seconds)
- Key takeaway summary
- Call-to-action for listeners
- "Assembl with me" sign-off
- Tease for next episode
` : ""}

## 📊 EPISODE METADATA
- **Suggested title** (compelling, SEO-friendly)
- **Episode description** (150 words for podcast directories)
- **Tags/Categories** for distribution
- **Show notes** with timestamps and resource links
- **Social media clips** — identify 3 quotable moments for short-form content

Make it sound authentic and NZ-focused. No corporate jargon. Write like you're talking to a mate who happens to be a business owner.${qualityTag}`;

    onSendToChat(prompt);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {/* Header with tagline */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}>
          <Mic size={15} style={{ color: ACCENT }} />
        </div>
        <div>
          <h2 className="text-sm font-display font-bold" style={{ color: "#E4E4EC" }}>Podcast Studio</h2>
          <p className="text-[10px] font-body italic" style={{ color: ACCENT }}>Assembl with me</p>
        </div>
      </div>
      <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
        Generate full podcast scripts, show notes, and social clips — ready to record.
      </p>

      {/* Quality tier */}
      <div className="flex gap-2">
        {[
          { id: "fast" as const, label: "Fast", icon: Zap, desc: "Quick outline" },
          { id: "pro" as const, label: "Pro", icon: Crown, desc: "Full script" },
        ].map(q => {
          const Icon = q.icon;
          const active = quality === q.id;
          return (
            <button key={q.id} onClick={() => setQuality(q.id)}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium transition-all"
              style={{ background: active ? `${ACCENT}15` : "rgba(255,255,255,0.02)", color: active ? ACCENT : "rgba(255,255,255,0.35)", border: `1px solid ${active ? ACCENT + "40" : "rgba(255,255,255,0.05)"}` }}>
              <Icon size={13} />
              <div className="text-left"><div className="font-semibold">{q.label}</div><div className="text-[8px] opacity-60">{q.desc}</div></div>
            </button>
          );
        })}
      </div>

      {/* Format */}
      <div>
        <Label>Podcast Format</Label>
        <div className="grid grid-cols-2 gap-2">
          {PODCAST_FORMATS.map(f => {
            const Icon = f.icon;
            const active = format === f.id;
            return (
              <button key={f.id} onClick={() => setFormat(f.id)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-medium transition-all text-left"
                style={{ background: active ? `${ACCENT}15` : "rgba(255,255,255,0.02)", color: active ? ACCENT : "rgba(255,255,255,0.35)", border: `1px solid ${active ? ACCENT + "30" : "rgba(255,255,255,0.05)"}` }}>
                <Icon size={14} />
                <div>
                  <div className="font-semibold">{f.label}</div>
                  <div className="text-[8px] opacity-60">{f.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Episode type */}
      <div>
        <Label>Episode Type</Label>
        <div className="flex flex-wrap gap-1.5">
          {EPISODE_TYPES.map(t => <Chip key={t} label={t} active={episodeType === t} onClick={() => setEpisodeType(t)} />)}
        </div>
      </div>

      {/* Topic */}
      <div>
        <Label>Topic / Subject *</Label>
        <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={2}
          placeholder="e.g. 'NZ employment law changes in 2026 — what SMEs need to know'"
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
      </div>

      {/* Target audience */}
      <div>
        <Label>Target Audience</Label>
        <input value={targetAudience} onChange={e => setTargetAudience(e.target.value)}
          placeholder="e.g. 'NZ café owners and hospitality managers'"
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
      </div>

      {/* Key points */}
      <div>
        <Label>Key Points to Cover</Label>
        <textarea value={keyPoints} onChange={e => setKeyPoints(e.target.value)} rows={2}
          placeholder="Comma-separated points you want covered..."
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#E4E4EC" }} />
      </div>

      {/* Tone */}
      <div>
        <Label>Tone</Label>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map(t => <Chip key={t} label={t} active={tone === t} onClick={() => setTone(t)} />)}
        </div>
      </div>

      {/* Duration */}
      <div>
        <Label>Target Duration</Label>
        <div className="flex gap-1.5">
          {DURATIONS.map(d => <Chip key={d} label={d} active={duration === d} onClick={() => setDuration(d)} />)}
        </div>
      </div>

      {/* Segments */}
      <div>
        <Label>Number of Segments</Label>
        <div className="flex gap-2">
          {[2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setNumSegments(n)} className="w-9 h-9 rounded-lg text-[11px] font-semibold"
              style={{ background: numSegments === n ? `${ACCENT}20` : "rgba(255,255,255,0.03)", color: numSegments === n ? ACCENT : "rgba(255,255,255,0.4)", border: `1px solid ${numSegments === n ? ACCENT + "30" : "rgba(255,255,255,0.05)"}` }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Intro/Outro toggles */}
      <div className="flex gap-4">
        {[
          { label: "Include intro", value: includeIntro, set: setIncludeIntro },
          { label: "Include outro", value: includeOutro, set: setIncludeOutro },
        ].map(toggle => (
          <div key={toggle.label} className="flex items-center gap-2">
            <button onClick={() => toggle.set(!toggle.value)} className="w-9 h-5 rounded-full relative transition-all"
              style={{ background: toggle.value ? ACCENT : "rgba(255,255,255,0.1)" }}>
              <div className="w-3.5 h-3.5 rounded-full absolute top-[3px] transition-all"
                style={{ background: "#fff", left: toggle.value ? "18px" : "3px" }} />
            </button>
            <span className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>{toggle.label}</span>
          </div>
        ))}
      </div>

      {/* Generate button */}
      <button onClick={generate} disabled={!topic.trim()}
        className="w-full py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[0.98] active:scale-[0.96] disabled:opacity-30 flex items-center justify-center gap-2"
        style={{ background: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
        <Sparkles size={14} /> Assembl with me — Generate Episode
      </button>

      {/* Tip */}
      <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-[9px] font-body" style={{ color: "rgba(255,255,255,0.3)" }}>
          💡 <strong>Tip:</strong> After generating, use PRISM's Image Studio to create episode artwork and Ad Studio to build promotional creatives for your episode.
        </p>
      </div>
    </div>
  );
}
