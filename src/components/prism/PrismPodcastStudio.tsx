import { useState } from "react";
import { Mic, Sparkles, Zap, Crown, Users, Radio, Music, FileText, Upload, BookOpen, Headphones, Volume2 } from "lucide-react";

const GOLD = "#4AA5A8";
const TEAL = "#3A7D6E";

const PODCAST_FORMATS = [
  { id: "solo", label: "Solo Host", icon: Mic, desc: "Single narrator deep-dive" },
  { id: "interview", label: "Interview", icon: Users, desc: "Host + guest conversation" },
  { id: "panel", label: "Panel Discussion", icon: Radio, desc: "Multi-voice roundtable" },
  { id: "narrative", label: "Narrative Story", icon: Music, desc: "Scripted storytelling" },
];

const TONES = ["Professional", "Conversational", "Educational", "Inspirational", "Humorous", "Investigative", "Casual Kiwi"];
const DURATIONS = ["5 min", "10 min", "15 min", "20 min", "30 min", "45 min", "60 min"];
const EPISODE_TYPES = [
  "Industry Deep-Dive", "News Commentary", "How-To Guide", "Case Study",
  "Expert Interview", "Weekly Wrap-Up", "Client Spotlight", "Compliance Update",
  "Founder Story", "Market Analysis", "Behind the Scenes", "Q&A Mailbag",
];
const OUTPUT_MODES = [
  { id: "script", label: "Full Script", icon: FileText, desc: "Complete episode script with dialogue" },
  { id: "outline", label: "Outline Only", icon: BookOpen, desc: "Segment outline + talking points" },
  { id: "guest-prep", label: "Guest Prep Sheet", icon: Users, desc: "Research brief + interview questions" },
  { id: "series", label: "Series Plan", icon: Headphones, desc: "Multi-episode content calendar" },
];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
      style={{
        background: active ? `rgba(74,165,168,0.12)` : "rgba(255,255,255,0.03)",
        color: active ? GOLD : "rgba(255,255,255,0.4)",
        border: `1px solid ${active ? "rgba(74,165,168,0.25)" : "rgba(255,255,255,0.05)"}`
      }}>
      {label}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-mono uppercase tracking-wider mb-1.5 block" style={{ color: "rgba(255,255,255,0.4)" }}>{children}</label>;
}

export default function PrismPodcastStudio({ onSendToChat }: { onSendToChat?: (msg: string) => void }) {
  const [format, setFormat] = useState("solo");
  const [tone, setTone] = useState("Conversational");
  const [duration, setDuration] = useState("15 min");
  const [episodeType, setEpisodeType] = useState("Industry Deep-Dive");
  const [outputMode, setOutputMode] = useState("script");
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [transcript, setTranscript] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestBio, setGuestBio] = useState("");
  const [seriesEpisodes, setSeriesEpisodes] = useState(6);
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeOutro, setIncludeOutro] = useState(true);
  const [includeSocialClips, setIncludeSocialClips] = useState(true);
  const [includeShowNotes, setIncludeShowNotes] = useState(true);
  const [numSegments, setNumSegments] = useState(3);
  const [quality, setQuality] = useState<"fast" | "pro">("pro");
  const [nzFocus, setNzFocus] = useState(true);

  const selectedFormat = PODCAST_FORMATS.find(f => f.id === format);
  const selectedOutput = OUTPUT_MODES.find(o => o.id === outputMode);

  const generate = () => {
    if (!onSendToChat || !topic.trim()) return;

    const formatLabel = selectedFormat?.label || format;
    const qualityTag = quality === "pro" ? " [QUALITY:pro]" : " [QUALITY:fast]";
    const nzTag = nzFocus ? "\n- Use NZ English, NZ-specific references, legislation, and cultural context throughout." : "";

    let modeInstructions = "";

    if (outputMode === "script") {
      modeInstructions = `
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

## FULL SCRIPT
Write the complete script in a natural, ${tone.toLowerCase()} voice:
${format === "solo" ? "- Written as direct-to-listener narration" : ""}
${format === "interview" ? "- Include HOST: and GUEST: dialogue markers" : ""}
${format === "panel" ? "- Include HOST:, PANELIST 1:, PANELIST 2:, PANELIST 3: dialogue markers" : ""}
${format === "narrative" ? "- Written as immersive storytelling with scene descriptions" : ""}
- Include natural pauses, emphasis markers, and tone directions in [brackets]
- Mark [MUSIC CUE], [SFX], and [PAUSE] where appropriate for production

${includeOutro ? `## 🔚 OUTRO (30-60 seconds)
- Key takeaway summary
- Call-to-action for listeners
- "Assembl with me" sign-off
- Tease for next episode
` : ""}

${includeShowNotes ? `## EPISODE METADATA
- **Suggested title** (compelling, SEO-friendly, under 60 chars)
- **Episode description** (150 words for podcast directories)
- **Tags/Categories** for Apple Podcasts, Spotify
- **Show notes** with timestamps and resource links
- **Chapter markers** with timestamps
` : ""}

${includeSocialClips ? `## 📱 SOCIAL MEDIA KIT
- **3 quotable moments** formatted for short-form video (15-60 sec clips)
- **Audiogram text overlays** — the key quote + timestamp for each clip
- **LinkedIn post** promoting the episode (under 200 words)
- **Instagram caption** with relevant hashtags
- **Tweet thread** (3-5 tweets summarising key insights)
` : ""}`;
    } else if (outputMode === "outline") {
      modeInstructions = `
## 📋 EPISODE OUTLINE
Create a detailed outline (NOT a full script) with:
- **Opening hook** — one compelling sentence
- **${numSegments} segments**, each with:
  - Segment title and estimated timing
  - 5-7 bullet-point talking points
  - Key data points, stats, or references to cite
  - Transition suggestion to next segment
- **Closing summary** — 3 key takeaways
- **CTA suggestion** for listeners

${includeShowNotes ? `## METADATA
- Suggested title, description, and tags` : ""}`;
    } else if (outputMode === "guest-prep") {
      modeInstructions = `
## 👤 GUEST RESEARCH BRIEF
${guestName ? `Guest: ${guestName}` : ""}
${guestBio ? `Bio: ${guestBio}` : ""}

Create a comprehensive guest preparation package:
- **Guest background summary** — key achievements, expertise areas, recent work
- **Rapport-building openers** — 3 warm-up questions to ease into the conversation
- **Core interview questions** — ${numSegments * 3} questions organised by segment:
  ${Array.from({ length: numSegments }, (_, i) => `- Segment ${i + 1}: 3 questions (easy → challenging progression)`).join("\n  ")}
- **Follow-up prompts** — 2-3 dig-deeper questions per segment if conversation flows well
- **Controversial/bold questions** — 2 questions that push the guest outside their comfort zone (use carefully)
- **Audience-submitted style questions** — 3 practical questions a listener might ask
- **Topics to avoid** — any known sensitivities based on guest's public positions
- **Quotable moment setup** — 2 questions designed to elicit a sound-bite worthy answer

${includeShowNotes ? `## METADATA
- Suggested episode title featuring guest name
- Episode description highlighting guest's expertise
- Tags and categories` : ""}`;
    } else if (outputMode === "series") {
      modeInstructions = `
## 📅 SERIES CONTENT PLAN
Create a ${seriesEpisodes}-episode series plan around the topic:

For each episode provide:
- **Episode number and title**
- **One-line hook** (what makes someone click play)
- **3-5 key topics** covered
- **Suggested guest type** (if applicable)
- **Unique angle** — why this episode is different from generic coverage

Additionally provide:
- **Series arc** — how the episodes build on each other
- **Cross-promotion opportunities** — which episodes reference each other
- **Seasonal timing** — best release dates relative to NZ business calendar
- **Series trailer script** (60-90 seconds) introducing the series concept
- **Launch strategy** — recommendations for release cadence (weekly/fortnightly)

${includeSocialClips ? `## 📱 LAUNCH SOCIAL KIT
- **Series announcement post** for LinkedIn
- **Teaser thread** for Twitter/X
- **Instagram carousel** concept (one slide per episode)` : ""}`;
    }

    const transcriptSection = transcript.trim() ? `\n\n**REFERENCE TRANSCRIPT/NOTES:**\n${transcript}\n\nUse this material as source content — extract key insights, quotes, and data points to incorporate into the episode.` : "";

    const prompt = `You are PRISM Podcast Studio — "Assembl with me" — a specialist podcast content generator built for NZ businesses.

**EPISODE BRIEF**
- **Format:** ${formatLabel}
- **Output Mode:** ${selectedOutput?.label}
- **Type:** ${episodeType}
- **Topic:** ${topic}
- **Tone:** ${tone}
- **Target Duration:** ${duration}
- **Segments:** ${numSegments}
${targetAudience ? `- **Target Audience:** ${targetAudience}` : ""}
${keyPoints ? `- **Key Points to Cover:** ${keyPoints}` : ""}
${guestName && (outputMode === "guest-prep" || format === "interview") ? `- **Guest:** ${guestName}` : ""}
${guestBio && (outputMode === "guest-prep" || format === "interview") ? `- **Guest Bio:** ${guestBio}` : ""}${nzTag}${transcriptSection}

${modeInstructions}

Make it sound authentic and grounded. No corporate jargon. Write like you're talking to a mate who happens to be a business owner.${qualityTag}`;

    onSendToChat(prompt);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(74,165,168,0.12)", border: "1px solid rgba(74,165,168,0.25)" }}>
          <Mic size={15} style={{ color: GOLD }} />
        </div>
        <div>
          <h2 className="text-sm font-display font-bold" style={{ color: "#F5F0E8" }}>Podcast Studio</h2>
          <p className="text-[10px] font-body italic" style={{ color: GOLD }}>Assembl with me</p>
        </div>
      </div>
      <p className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>
        Generate full podcast scripts, guest prep sheets, series plans, and social kits — ready to record.
      </p>

      {/* Quality tier */}
      <div className="flex gap-2">
        {[
          { id: "fast" as const, label: "Fast", icon: Zap, desc: "Quick outline" },
          { id: "pro" as const, label: "Pro", icon: Crown, desc: "Full production" },
        ].map(q => {
          const Icon = q.icon;
          const active = quality === q.id;
          return (
            <button key={q.id} onClick={() => setQuality(q.id)}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium transition-all"
              style={{
                background: active ? "rgba(74,165,168,0.12)" : "rgba(255,255,255,0.02)",
                color: active ? GOLD : "rgba(255,255,255,0.35)",
                border: `1px solid ${active ? "rgba(74,165,168,0.3)" : "rgba(255,255,255,0.05)"}`
              }}>
              <Icon size={13} />
              <div className="text-left"><div className="font-semibold">{q.label}</div><div className="text-[8px] opacity-60">{q.desc}</div></div>
            </button>
          );
        })}
      </div>

      {/* Output mode */}
      <div>
        <Label>Output Mode</Label>
        <div className="grid grid-cols-2 gap-2">
          {OUTPUT_MODES.map(o => {
            const Icon = o.icon;
            const active = outputMode === o.id;
            return (
              <button key={o.id} onClick={() => setOutputMode(o.id)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-medium transition-all text-left"
                style={{
                  background: active ? "rgba(58,125,110,0.15)" : "rgba(255,255,255,0.02)",
                  color: active ? TEAL : "rgba(255,255,255,0.35)",
                  border: `1px solid ${active ? "rgba(58,125,110,0.3)" : "rgba(255,255,255,0.05)"}`
                }}>
                <Icon size={14} />
                <div>
                  <div className="font-semibold">{o.label}</div>
                  <div className="text-[8px] opacity-60">{o.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
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
                style={{
                  background: active ? "rgba(74,165,168,0.12)" : "rgba(255,255,255,0.02)",
                  color: active ? GOLD : "rgba(255,255,255,0.35)",
                  border: `1px solid ${active ? "rgba(74,165,168,0.25)" : "rgba(255,255,255,0.05)"}`
                }}>
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
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#F5F0E8" }} />
      </div>

      {/* Guest fields (show for interview format or guest-prep mode) */}
      {(format === "interview" || outputMode === "guest-prep") && (
        <div className="space-y-2 rounded-xl p-3" style={{ background: "rgba(58,125,110,0.06)", border: "1px solid rgba(58,125,110,0.15)" }}>
          <Label>Guest Name</Label>
          <input value={guestName} onChange={e => setGuestName(e.target.value)}
            placeholder="e.g. 'Sarah Chen, CEO of GreenTech NZ'"
            className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "#F5F0E8" }} />
          <Label>Guest Bio / Background</Label>
          <textarea value={guestBio} onChange={e => setGuestBio(e.target.value)} rows={2}
            placeholder="Key details about the guest — role, expertise, recent achievements..."
            className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "#F5F0E8" }} />
        </div>
      )}

      {/* Series episodes (show for series mode) */}
      {outputMode === "series" && (
        <div>
          <Label>Number of Episodes in Series</Label>
          <div className="flex gap-2">
            {[4, 6, 8, 10, 12].map(n => (
              <button key={n} onClick={() => setSeriesEpisodes(n)} className="w-9 h-9 rounded-lg text-[11px] font-semibold"
                style={{
                  background: seriesEpisodes === n ? "rgba(74,165,168,0.15)" : "rgba(255,255,255,0.03)",
                  color: seriesEpisodes === n ? GOLD : "rgba(255,255,255,0.4)",
                  border: `1px solid ${seriesEpisodes === n ? "rgba(74,165,168,0.25)" : "rgba(255,255,255,0.05)"}`
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Target audience */}
      <div>
        <Label>Target Audience</Label>
        <input value={targetAudience} onChange={e => setTargetAudience(e.target.value)}
          placeholder="e.g. 'NZ café owners and hospitality managers'"
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#F5F0E8" }} />
      </div>

      {/* Key points */}
      <div>
        <Label>Key Points to Cover</Label>
        <textarea value={keyPoints} onChange={e => setKeyPoints(e.target.value)} rows={2}
          placeholder="Comma-separated points you want covered..."
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#F5F0E8" }} />
      </div>

      {/* Reference transcript */}
      <div>
        <Label>Reference Material (optional)</Label>
        <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={3}
          placeholder="Paste a transcript, article, notes, or any source material to base the episode on..."
          className="w-full px-3 py-2 rounded-lg text-xs font-body bg-transparent border outline-none resize-none"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "#F5F0E8" }} />
        <p className="text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
          Paste articles, meeting notes, or transcripts — the AI will extract key insights for your episode.
        </p>
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
        <div className="flex flex-wrap gap-1.5">
          {DURATIONS.map(d => <Chip key={d} label={d} active={duration === d} onClick={() => setDuration(d)} />)}
        </div>
      </div>

      {/* Segments */}
      <div>
        <Label>Number of Segments</Label>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => setNumSegments(n)} className="w-9 h-9 rounded-lg text-[11px] font-semibold"
              style={{
                background: numSegments === n ? "rgba(74,165,168,0.15)" : "rgba(255,255,255,0.03)",
                color: numSegments === n ? GOLD : "rgba(255,255,255,0.4)",
                border: `1px solid ${numSegments === n ? "rgba(74,165,168,0.25)" : "rgba(255,255,255,0.05)"}`
              }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {[
          { label: "Include intro", value: includeIntro, set: setIncludeIntro },
          { label: "Include outro", value: includeOutro, set: setIncludeOutro },
          { label: "Social media kit", value: includeSocialClips, set: setIncludeSocialClips },
          { label: "Show notes", value: includeShowNotes, set: setIncludeShowNotes },
          { label: "NZ focus", value: nzFocus, set: setNzFocus },
        ].map(toggle => (
          <div key={toggle.label} className="flex items-center gap-2">
            <button onClick={() => toggle.set(!toggle.value)} className="w-9 h-5 rounded-full relative transition-all"
              style={{ background: toggle.value ? GOLD : "rgba(255,255,255,0.1)" }}>
              <div className="w-3.5 h-3.5 rounded-full absolute top-[3px] transition-all"
                style={{ background: toggle.value ? "#09090F" : "#fff", left: toggle.value ? "18px" : "3px" }} />
            </button>
            <span className="text-[10px] font-body" style={{ color: "rgba(255,255,255,0.5)" }}>{toggle.label}</span>
          </div>
        ))}
      </div>

      {/* Generate button */}
      <button onClick={generate} disabled={!topic.trim()}
        className="w-full py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[0.98] active:scale-[0.96] disabled:opacity-30 flex items-center justify-center gap-2 font-display uppercase"
        style={{
          background: GOLD, color: "#09090F",
          letterSpacing: "2px",
        }}>
        <Sparkles size={14} /> Assembl with me — Generate
      </button>

      {/* Tips */}
      <div className="rounded-xl p-3" style={{ background: "rgba(74,165,168,0.04)", border: "1px solid rgba(74,165,168,0.1)" }}>
        <p className="text-[9px] font-body" style={{ color: "rgba(255,255,255,0.35)" }}>
          <strong>Tip:</strong> Use "Guest Prep Sheet" mode before interviews to arrive prepared. After generating a script, use PRISM's Image Studio for episode artwork and Ad Studio for promotional creatives.
        </p>
      </div>
    </div>
  );
}
