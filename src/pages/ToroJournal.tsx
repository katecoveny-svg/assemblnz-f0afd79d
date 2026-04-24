import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  BookOpen,
  Sparkles,
  Heart,
  Sun,
  CloudRain,
  Lock,
  Send,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mood = "joyful" | "calm" | "okay" | "tired" | "worried" | "sad" | "frustrated";

interface ChildRow {
  id: string;
  name: string;
  year_level: number | null;
}

interface FamilyMemberRow {
  user_id: string;
  role: string;
}

interface JournalEntry {
  id: string;
  family_id: string;
  child_id: string | null;
  author_user_id: string | null;
  author_name: string | null;
  entry_date: string;
  mood: Mood | null;
  energy_level: number | null;
  gratitude: string | null;
  highlight: string | null;
  challenge: string | null;
  tomorrow_focus: string | null;
  prompt_used: string | null;
  shared_with_parent: boolean;
  is_private: boolean;
  created_at: string;
}

const MOODS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: "joyful", label: "Joyful", emoji: "🌞", color: "#FAF1E0" },
  { value: "calm", label: "Calm", emoji: "🌿", color: "#E5EDE9" },
  { value: "okay", label: "Okay", emoji: "🌤", color: "#EEE7DE" },
  { value: "tired", label: "Tired", emoji: "🌙", color: "#E8E2D8" },
  { value: "worried", label: "Worried", emoji: "💭", color: "#F0E8D8" },
  { value: "sad", label: "Sad", emoji: "🌧", color: "#E0E5EA" },
  { value: "frustrated", label: "Frustrated", emoji: "⛅", color: "#F4E4E4" },
];

/** Age-aware prompts. Younger kids get concrete cues, teens get reflective ones. */
const PROMPTS_YOUNGER = [
  "What made you laugh today?",
  "Who were you kind to today?",
  "What's one thing you learned?",
  "What was the best part of today?",
  "What would you do differently tomorrow?",
];
const PROMPTS_OLDER = [
  "What's one thing you're grateful for today, even a small one?",
  "What surprised you today?",
  "What challenged you, and how did you handle it?",
  "Where did you show up for yourself or someone else?",
  "What's one intention for tomorrow?",
];
const PROMPTS_PARENT = [
  "What did you notice about your tamariki today?",
  "Where did you feel most present as a parent?",
  "What support do you need this week?",
  "What's one thing you want to remember about today?",
];

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-NZ", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

const moodChip = (mood: Mood | null) => {
  if (!mood) return null;
  return MOODS.find((m) => m.value === mood);
};

const ToroJournal = () => {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("parent");
  const [members, setMembers] = useState<FamilyMemberRow[]>([]);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeAuthor, setActiveAuthor] = useState<string>("__me__");
  const [isLoading, setIsLoading] = useState(true);

  // Guided draft
  const [draft, setDraft] = useState({
    child_id: "",
    mood: null as Mood | null,
    energy_level: 3,
    gratitude: "",
    highlight: "",
    challenge: "",
    tomorrow_focus: "",
    prompt_used: "",
    is_private: false,
  });
  const [step, setStep] = useState(0); // 0=mood, 1=highlight, 2=gratitude, 3=challenge, 4=tomorrow

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsLoading(false);
      return;
    }
    setUserId(session.user.id);
    const { data: me } = await supabase
      .from("family_members")
      .select("family_id, role")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!me?.family_id) {
      setIsLoading(false);
      return;
    }
    setFamilyId(me.family_id);
    setUserRole(me.role ?? "parent");

    const sinceIso = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);
    const [{ data: m }, { data: c }, { data: e }] = await Promise.all([
      supabase.from("family_members").select("user_id, role").eq("family_id", me.family_id),
      supabase.from("toroa_children").select("id, name, year_level").eq("family_id", me.family_id).order("name"),
      supabase
        .from("toroa_journal_entries")
        .select("*")
        .eq("family_id", me.family_id)
        .gte("entry_date", sinceIso)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);
    setMembers((m ?? []) as FamilyMemberRow[]);
    setChildren((c ?? []) as ChildRow[]);
    setEntries((e ?? []) as JournalEntry[]);
    setIsLoading(false);
  };

  const promptPool = useMemo(() => {
    const child = children.find((c) => c.id === draft.child_id);
    if (child) {
      const yr = child.year_level ?? 5;
      return yr <= 6 ? PROMPTS_YOUNGER : PROMPTS_OLDER;
    }
    return PROMPTS_PARENT;
  }, [draft.child_id, children]);

  const todaysPrompt = useMemo(() => {
    const dayIdx = new Date().getDate() % promptPool.length;
    return promptPool[dayIdx];
  }, [promptPool]);

  const filteredEntries = useMemo(() => {
    if (activeAuthor === "__me__") {
      return entries.filter((e) => e.author_user_id === userId);
    }
    if (activeAuthor === "__all__") {
      return entries;
    }
    if (activeAuthor.startsWith("child:")) {
      const cid = activeAuthor.slice(6);
      return entries.filter((e) => e.child_id === cid);
    }
    return entries.filter((e) => e.author_user_id === activeAuthor);
  }, [entries, activeAuthor, userId]);

  const saveEntry = async () => {
    if (!familyId || !userId) return;
    if (!draft.mood && !draft.highlight && !draft.gratitude) {
      toast.error("Add a mood or one note before saving");
      return;
    }
    const authorName = userRole === "child" ? children.find((c) => c.id === draft.child_id)?.name ?? "Tamariki" : "Parent";
    const { error } = await supabase.from("toroa_journal_entries").insert({
      family_id: familyId,
      child_id: draft.child_id || null,
      author_user_id: userId,
      author_name: authorName,
      entry_date: todayIso(),
      mood: draft.mood,
      energy_level: draft.energy_level,
      gratitude: draft.gratitude.trim() || null,
      highlight: draft.highlight.trim() || null,
      challenge: draft.challenge.trim() || null,
      tomorrow_focus: draft.tomorrow_focus.trim() || null,
      prompt_used: todaysPrompt,
      shared_with_parent: !draft.is_private,
      is_private: draft.is_private,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(draft.is_private ? "Private entry saved" : "Entry shared with whānau");
    setDraft({
      child_id: "",
      mood: null,
      energy_level: 3,
      gratitude: "",
      highlight: "",
      challenge: "",
      tomorrow_focus: "",
      prompt_used: "",
      is_private: false,
    });
    setStep(0);
    await loadAll();
  };

  // Weekly summary for parents (last 7 days, non-private entries)
  const weeklySummary = useMemo(() => {
    const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const week = entries.filter((e) => e.entry_date >= since && !e.is_private);
    const moodCounts = new Map<Mood, number>();
    for (const e of week) {
      if (e.mood) moodCounts.set(e.mood, (moodCounts.get(e.mood) ?? 0) + 1);
    }
    const topMood = [...moodCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const avgEnergy =
      week.filter((e) => e.energy_level).reduce((s, e) => s + (e.energy_level ?? 0), 0) /
      Math.max(1, week.filter((e) => e.energy_level).length);
    const challenges = week.filter((e) => e.challenge).map((e) => ({
      who: e.author_name ?? "Whānau",
      what: e.challenge!,
      date: e.entry_date,
    }));
    const highlights = week.filter((e) => e.highlight).map((e) => ({
      who: e.author_name ?? "Whānau",
      what: e.highlight!,
      date: e.entry_date,
    }));
    return {
      total: week.length,
      topMood,
      avgEnergy: Math.round(avgEnergy * 10) / 10 || null,
      challenges: challenges.slice(0, 5),
      highlights: highlights.slice(0, 5),
    };
  }, [entries]);

  const isParent = userRole === "parent" || userRole === "caregiver";

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <header className="border-b border-[rgba(142,129,119,0.14)] bg-white/60 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center gap-4">
          <Link
            to="/toro/app"
            className="flex items-center gap-1.5 text-sm text-[#9D8C7D] hover:text-[#6F6158] transition-colors"
          >
            <ChevronLeft size={16} />
            Tōro
          </Link>
          <div className="flex-1">
            <h1 className="font-display text-2xl text-[#6F6158] leading-none">Journal</h1>
            <p className="text-xs text-[#9D8C7D] mt-1">A quiet space for whānau reflection</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* LEFT: guided journaling */}
        <section className="space-y-6">
          {/* Today's prompt + draft */}
          <div className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-white p-6 shadow-[0_8px_30px_rgba(111,97,88,0.08)]">
            <div className="flex items-center gap-2 text-xs text-[#D9BC7A] mb-2">
              <Sparkles size={14} />
              <span className="uppercase tracking-wider">Today's prompt</span>
            </div>
            <p className="font-display text-xl text-[#6F6158] leading-snug">{todaysPrompt}</p>

            {/* Who is writing */}
            <div className="mt-5">
              <label className="text-xs text-[#9D8C7D]">Who's journaling?</label>
              <select
                value={draft.child_id}
                onChange={(e) => setDraft({ ...draft, child_id: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
              >
                <option value="">Me (parent / caregiver)</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Step indicators */}
            <div className="mt-5 flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? "bg-[#D9BC7A]" : "bg-[#EEE7DE]"
                  }`}
                  aria-label={`Step ${i + 1}`}
                />
              ))}
            </div>

            {/* Step 0: mood + energy */}
            {step === 0 && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs text-[#9D8C7D]">How are you feeling?</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setDraft({ ...draft, mood: m.value })}
                        className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs transition-all ${
                          draft.mood === m.value
                            ? "ring-2 ring-[#D9BC7A] ring-offset-2 ring-offset-white"
                            : ""
                        }`}
                        style={{ background: m.color, color: "#6F6158" }}
                      >
                        <span className="text-base">{m.emoji}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#9D8C7D]">Energy level</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={draft.energy_level}
                    onChange={(e) => setDraft({ ...draft, energy_level: Number(e.target.value) })}
                    className="mt-2 w-full accent-[#D9BC7A]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9D8C7D]">
                    <span>Low</span><span>Steady</span><span>Bright</span>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mt-5">
                <label className="flex items-center gap-1.5 text-xs text-[#9D8C7D]">
                  <Sun size={12} /> Highlight of the day
                </label>
                <textarea
                  value={draft.highlight}
                  onChange={(e) => setDraft({ ...draft, highlight: e.target.value })}
                  placeholder="What stood out today?"
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                />
              </div>
            )}

            {step === 2 && (
              <div className="mt-5">
                <label className="flex items-center gap-1.5 text-xs text-[#9D8C7D]">
                  <Heart size={12} /> Gratitude
                </label>
                <textarea
                  value={draft.gratitude}
                  onChange={(e) => setDraft({ ...draft, gratitude: e.target.value })}
                  placeholder="One thing you're thankful for, big or small."
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                />
              </div>
            )}

            {step === 3 && (
              <div className="mt-5">
                <label className="flex items-center gap-1.5 text-xs text-[#9D8C7D]">
                  <CloudRain size={12} /> Challenge (optional)
                </label>
                <textarea
                  value={draft.challenge}
                  onChange={(e) => setDraft({ ...draft, challenge: e.target.value })}
                  placeholder="Something hard or worth thinking about?"
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                />
                <p className="mt-2 text-[11px] text-[#9D8C7D]">
                  If you're feeling overwhelmed, talk to someone you trust. Free support: 1737 (call/text), Youthline 0800 376 633.
                </p>
              </div>
            )}

            {step === 4 && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs text-[#9D8C7D]">One focus for tomorrow</label>
                  <input
                    value={draft.tomorrow_focus}
                    onChange={(e) => setDraft({ ...draft, tomorrow_focus: e.target.value })}
                    placeholder="A small intention…"
                    className="mt-2 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-[#6F6158]">
                  <input
                    type="checkbox"
                    checked={draft.is_private}
                    onChange={(e) => setDraft({ ...draft, is_private: e.target.checked })}
                    className="mt-0.5 accent-[#9D8C7D]"
                  />
                  <span className="flex items-center gap-1">
                    <Lock size={11} /> Keep this entry private (only I can read it)
                  </span>
                </label>
              </div>
            )}

            {/* Nav */}
            <div className="mt-6 flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-4 py-2 text-sm text-[#6F6158]"
                >
                  Back
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="ml-auto rounded-2xl bg-[#D9BC7A] px-4 py-2 text-sm text-white hover:bg-[#C8A65F]"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={saveEntry}
                  className="ml-auto flex items-center gap-1.5 rounded-2xl bg-[#D9BC7A] px-4 py-2 text-sm text-white hover:bg-[#C8A65F]"
                >
                  <Send size={14} /> Save entry
                </button>
              )}
            </div>
          </div>

          {/* History */}
          <div className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-white p-6 shadow-[0_8px_30px_rgba(111,97,88,0.08)]">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="flex items-center gap-2 font-display text-lg text-[#6F6158]">
                <BookOpen size={16} /> History
              </h2>
              <select
                value={activeAuthor}
                onChange={(e) => setActiveAuthor(e.target.value)}
                className="rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-1.5 text-xs text-[#6F6158]"
              >
                <option value="__me__">My entries</option>
                <option value="__all__">All whānau (shared)</option>
                {children.map((c) => (
                  <option key={c.id} value={`child:${c.id}`}>{c.name}'s entries</option>
                ))}
              </select>
            </div>
            {isLoading ? (
              <p className="text-sm text-[#9D8C7D]">Loading…</p>
            ) : filteredEntries.length === 0 ? (
              <p className="text-sm text-[#9D8C7D]">No entries yet for this view.</p>
            ) : (
              <div className="space-y-3">
                {filteredEntries.slice(0, 20).map((e) => {
                  const m = moodChip(e.mood);
                  return (
                    <div
                      key={e.id}
                      className="rounded-2xl border border-[rgba(142,129,119,0.10)] bg-[#FAF7F2] p-4"
                    >
                      <div className="flex items-center justify-between text-xs text-[#9D8C7D]">
                        <span>{fmtDate(e.entry_date)} · {e.author_name ?? "Whānau"}</span>
                        <div className="flex items-center gap-2">
                          {e.is_private && (
                            <span className="flex items-center gap-1 rounded-full bg-[#EEE7DE] px-2 py-0.5">
                              <Lock size={10} /> Private
                            </span>
                          )}
                          {m && (
                            <span
                              className="rounded-full px-2 py-0.5"
                              style={{ background: m.color, color: "#6F6158" }}
                            >
                              {m.emoji} {m.label}
                            </span>
                          )}
                        </div>
                      </div>
                      {e.highlight && (
                        <p className="mt-2 text-sm text-[#6F6158]">
                          <span className="text-[#D9BC7A] mr-1">✦</span>{e.highlight}
                        </p>
                      )}
                      {e.gratitude && (
                        <p className="mt-1 text-sm text-[#5C8268]">
                          <span className="mr-1">♡</span>{e.gratitude}
                        </p>
                      )}
                      {e.challenge && (
                        <p className="mt-1 text-sm text-[#A67830]">
                          <span className="mr-1">~</span>{e.challenge}
                        </p>
                      )}
                      {e.tomorrow_focus && (
                        <p className="mt-2 text-xs text-[#9D8C7D] italic">
                          Tomorrow: {e.tomorrow_focus}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: weekly summary for parents */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-white p-6 shadow-[0_8px_30px_rgba(111,97,88,0.08)]">
            <div className="flex items-center gap-2 text-xs text-[#D9BC7A] mb-2">
              <TrendingUp size={14} />
              <span className="uppercase tracking-wider">This week</span>
            </div>
            <h2 className="font-display text-xl text-[#6F6158]">
              {isParent ? "Whānau summary" : "How the week feels"}
            </h2>
            <p className="text-xs text-[#9D8C7D] mt-1">
              {isParent
                ? "Patterns across shared entries from the last 7 days. Private entries stay private."
                : "Your last 7 days at a glance."}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#F7F3EE] p-3 text-center">
                <p className="font-display text-2xl text-[#6F6158]">{weeklySummary.total}</p>
                <p className="text-[10px] text-[#9D8C7D] mt-0.5">Entries</p>
              </div>
              <div className="rounded-2xl bg-[#F7F3EE] p-3 text-center">
                <p className="font-display text-2xl text-[#6F6158]">
                  {weeklySummary.avgEnergy ?? "—"}
                </p>
                <p className="text-[10px] text-[#9D8C7D] mt-0.5">Avg energy</p>
              </div>
              <div className="rounded-2xl bg-[#F7F3EE] p-3 text-center">
                <p className="text-2xl">
                  {moodChip(weeklySummary.topMood)?.emoji ?? "—"}
                </p>
                <p className="text-[10px] text-[#9D8C7D] mt-0.5">Top mood</p>
              </div>
            </div>

            {weeklySummary.highlights.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs uppercase tracking-wider text-[#5C8268] mb-2 flex items-center gap-1">
                  <Sun size={11} /> Highlights
                </h3>
                <ul className="space-y-1.5">
                  {weeklySummary.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-[#6F6158] leading-snug">
                      <span className="text-[#9D8C7D]">{h.who}:</span> {h.what}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {weeklySummary.challenges.length > 0 && isParent && (
              <div className="mt-5">
                <h3 className="text-xs uppercase tracking-wider text-[#A67830] mb-2 flex items-center gap-1">
                  <CloudRain size={11} /> Worth noticing
                </h3>
                <ul className="space-y-1.5">
                  {weeklySummary.challenges.map((c, i) => (
                    <li key={i} className="text-xs text-[#6F6158] leading-snug">
                      <span className="text-[#9D8C7D]">{c.who}:</span> {c.what}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[10px] text-[#9D8C7D] italic">
                  Anything urgent? Free support: 1737 (call/text), Healthline 0800 611 116, Youthline 0800 376 633.
                </p>
              </div>
            )}

            {weeklySummary.total === 0 && (
              <p className="mt-5 text-xs text-[#9D8C7D]">
                No shared entries yet this week.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-[#E5EDE9] p-5">
            <div className="flex items-center gap-2 text-xs text-[#5C8268] mb-1">
              <Calendar size={12} />
              <span className="uppercase tracking-wider">Tip</span>
            </div>
            <p className="text-sm text-[#6F6158] leading-snug">
              A two-minute journal at the same time each day — after kai, before bed — builds the strongest streaks.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ToroJournal;
