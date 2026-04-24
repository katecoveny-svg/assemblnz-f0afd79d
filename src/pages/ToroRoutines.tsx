import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Sun,
  Moon,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Trash2,
  GripVertical,
  Trophy,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type RoutineType = "morning" | "afterschool" | "bedtime" | "weekend" | "custom";

interface Step {
  id: string;
  title: string;
}

interface RoutineRow {
  id: string;
  family_id: string;
  child_id: string | null;
  routine_name: string;
  routine_type: RoutineType;
  steps: Step[];
  active_days: string[] | null;
  start_time: string | null;
  estimated_minutes: number | null;
  reward_points: number | null;
  is_active: boolean | null;
}

interface CompletionRow {
  id: string;
  routine_id: string;
  child_id: string | null;
  completion_date: string;
  steps_completed: string[] | null;
  completion_percent: number | null;
  points_earned: number | null;
  parent_verified: boolean | null;
}

interface ChildRow {
  id: string;
  name: string;
}

const ROUTINE_TYPES: { value: RoutineType; label: string; icon: typeof Sun }[] = [
  { value: "morning", label: "Morning", icon: Sun },
  { value: "afterschool", label: "After school", icon: Sparkles },
  { value: "bedtime", label: "Bedtime", icon: Moon },
  { value: "weekend", label: "Weekend", icon: Sparkles },
  { value: "custom", label: "Custom", icon: Sparkles },
];

const DAY_LABELS: { key: string; label: string }[] = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
];

const todayIso = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

const dayKey = (date: Date): string =>
  ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][date.getDay()];

/** Compute current consecutive-day streak of ≥80% completion for a routine */
const computeStreak = (completions: CompletionRow[], routineId: string): number => {
  const map = new Map<string, number>();
  for (const c of completions) {
    if (c.routine_id !== routineId) continue;
    const pct = c.completion_percent ?? 0;
    map.set(c.completion_date, Math.max(map.get(c.completion_date) ?? 0, pct));
  }
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    const pct = map.get(iso);
    if (pct !== undefined && pct >= 80) {
      streak += 1;
    } else if (i > 0) {
      // Allow today to be incomplete without breaking streak
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const ToroRoutines = () => {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [routines, setRoutines] = useState<RoutineRow[]>([]);
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [activeChild, setActiveChild] = useState<string>("__all__");
  const [activeType, setActiveType] = useState<RoutineType | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({
    routine_name: "",
    routine_type: "morning" as RoutineType,
    child_id: "",
    start_time: "07:00",
    estimated_minutes: 20,
    reward_points: 5,
    active_days: ["mon", "tue", "wed", "thu", "fri"],
    steps: [{ id: crypto.randomUUID(), title: "" }] as Step[],
  });

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
    const { data: membership } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!membership?.family_id) {
      setIsLoading(false);
      return;
    }
    setFamilyId(membership.family_id);

    const sinceIso = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    const [{ data: kids }, { data: r }, { data: c }] = await Promise.all([
      supabase
        .from("toroa_children")
        .select("id, name")
        .eq("family_id", membership.family_id)
        .order("name"),
      supabase
        .from("toroa_daily_routines")
        .select("*")
        .eq("family_id", membership.family_id)
        .order("start_time", { ascending: true, nullsFirst: false }),
      supabase
        .from("toroa_routine_completions")
        .select("*")
        .gte("completion_date", sinceIso),
    ]);
    setChildren((kids ?? []) as ChildRow[]);
    setRoutines(((r ?? []) as unknown as RoutineRow[]).map((row) => ({
      ...row,
      steps: Array.isArray(row.steps) ? row.steps : [],
    })));
    setCompletions(((c ?? []) as unknown as CompletionRow[]).map((row) => ({
      ...row,
      steps_completed: Array.isArray(row.steps_completed) ? (row.steps_completed as string[]) : [],
    })));
    setIsLoading(false);
  };

  const filteredRoutines = useMemo(() => {
    return routines.filter((r) => {
      if (activeChild !== "__all__" && r.child_id !== activeChild) return false;
      if (activeType !== "all" && r.routine_type !== activeType) return false;
      return r.is_active !== false;
    });
  }, [routines, activeChild, activeType]);

  const completionToday = (routineId: string, childId: string | null): CompletionRow | undefined =>
    completions.find(
      (c) =>
        c.routine_id === routineId &&
        c.completion_date === todayIso() &&
        (c.child_id ?? null) === (childId ?? null),
    );

  const toggleStep = async (routine: RoutineRow, stepId: string) => {
    if (!familyId) return;
    const existing = completionToday(routine.id, routine.child_id);
    const completedSet = new Set(existing?.steps_completed ?? []);
    if (completedSet.has(stepId)) completedSet.delete(stepId);
    else completedSet.add(stepId);
    const completedArr = Array.from(completedSet);
    const total = routine.steps.length || 1;
    const pct = Math.round((completedArr.length / total) * 100);
    const points = pct >= 80 ? routine.reward_points ?? 0 : 0;

    if (existing) {
      const { error } = await supabase
        .from("toroa_routine_completions")
        .update({
          steps_completed: completedArr,
          completion_percent: pct,
          points_earned: points,
        })
        .eq("id", existing.id);
      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("toroa_routine_completions")
        .insert({
          routine_id: routine.id,
          child_id: routine.child_id,
          completion_date: todayIso(),
          steps_completed: completedArr,
          completion_percent: pct,
          points_earned: points,
        });
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    await loadAll();
  };

  const addRoutine = async () => {
    if (!familyId) return;
    if (!draft.routine_name.trim()) {
      toast.error("Give the routine a name");
      return;
    }
    const cleanSteps = draft.steps
      .filter((s) => s.title.trim())
      .map((s) => ({ id: s.id, title: s.title.trim() }));
    if (cleanSteps.length === 0) {
      toast.error("Add at least one step");
      return;
    }
    const { error } = await supabase.from("toroa_daily_routines").insert({
      family_id: familyId,
      child_id: draft.child_id || null,
      routine_name: draft.routine_name.trim(),
      routine_type: draft.routine_type,
      steps: cleanSteps,
      active_days: draft.active_days,
      start_time: draft.start_time || null,
      estimated_minutes: draft.estimated_minutes,
      reward_points: draft.reward_points,
      is_active: true,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Routine added");
    setShowAdd(false);
    setDraft({
      routine_name: "",
      routine_type: "morning",
      child_id: "",
      start_time: "07:00",
      estimated_minutes: 20,
      reward_points: 5,
      active_days: ["mon", "tue", "wed", "thu", "fri"],
      steps: [{ id: crypto.randomUUID(), title: "" }],
    });
    await loadAll();
  };

  const deleteRoutine = async (id: string) => {
    if (!confirm("Delete this routine? Past completions stay on file.")) return;
    const { error } = await supabase.from("toroa_daily_routines").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Routine deleted");
    await loadAll();
  };

  const todayKey = dayKey(new Date());

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
            <h1 className="font-display text-2xl text-[#6F6158] leading-none">Routines</h1>
            <p className="text-xs text-[#9D8C7D] mt-1">
              Streak-friendly rhythms for the whole whānau
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-[#D9BC7A] px-4 py-2 text-sm text-white hover:bg-[#C8A65F] transition-colors"
          >
            <Plus size={16} /> New routine
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Filter strip */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeChild}
            onChange={(e) => setActiveChild(e.target.value)}
            className="rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-4 py-2 text-sm text-[#6F6158]"
          >
            <option value="__all__">All whānau</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...ROUTINE_TYPES.map((t) => t.value)] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t as RoutineType | "all")}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  activeType === t
                    ? "bg-[#6F6158] text-white"
                    : "bg-white text-[#9D8C7D] border border-[rgba(142,129,119,0.14)] hover:text-[#6F6158]"
                }`}
              >
                {t === "all" ? "All times" : ROUTINE_TYPES.find((x) => x.value === t)?.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#9D8C7D]">Loading routines…</div>
        ) : filteredRoutines.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[rgba(142,129,119,0.24)] bg-white/40 p-12 text-center">
            <Sun size={32} className="mx-auto text-[#D9BC7A] mb-3" />
            <h3 className="font-display text-xl text-[#6F6158]">No routines yet</h3>
            <p className="text-sm text-[#9D8C7D] mt-1 mb-4">
              Add your first morning, after-school or bedtime rhythm.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-2xl bg-[#D9BC7A] px-4 py-2 text-sm text-white hover:bg-[#C8A65F]"
            >
              Add a routine
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredRoutines.map((r) => {
              const today = completionToday(r.id, r.child_id);
              const completedSet = new Set(today?.steps_completed ?? []);
              const pct = today?.completion_percent ?? 0;
              const streak = computeStreak(completions, r.id);
              const child = children.find((c) => c.id === r.child_id);
              const TypeIcon = ROUTINE_TYPES.find((t) => t.value === r.routine_type)?.icon ?? Sparkles;
              const isToday = (r.active_days ?? []).includes(todayKey);

              return (
                <div
                  key={r.id}
                  className="rounded-3xl border border-[rgba(142,129,119,0.14)] bg-white p-5 shadow-[0_8px_30px_rgba(111,97,88,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-[#F7F3EE] p-2.5">
                        <TypeIcon size={18} className="text-[#9D8C7D]" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-[#6F6158] leading-tight">
                          {r.routine_name}
                        </h3>
                        <p className="text-xs text-[#9D8C7D] mt-0.5">
                          {child?.name ?? "Whole whānau"}
                          {r.start_time ? ` · ${r.start_time.slice(0, 5)}` : ""}
                          {r.estimated_minutes ? ` · ${r.estimated_minutes} min` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {streak > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-[#FAF1E0] px-2.5 py-1 text-xs text-[#A67830]">
                          <Flame size={12} /> {streak}d
                        </span>
                      )}
                      <button
                        onClick={() => deleteRoutine(r.id)}
                        className="text-[#9D8C7D] hover:text-[#A66363] p-1"
                        aria-label="Delete routine"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5">
                    {DAY_LABELS.map((d) => (
                      <span
                        key={d.key}
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                          (r.active_days ?? []).includes(d.key)
                            ? d.key === todayKey
                              ? "bg-[#D9BC7A] text-white font-semibold"
                              : "bg-[#EEE7DE] text-[#6F6158]"
                            : "text-[#C8B9AB]"
                        }`}
                      >
                        {d.label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    {r.steps.map((step) => {
                      const done = completedSet.has(step.id);
                      return (
                        <button
                          key={step.id}
                          onClick={() => isToday && toggleStep(r, step.id)}
                          disabled={!isToday}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition-colors ${
                            done
                              ? "border-[#C9D8D0] bg-[#E5EDE9] text-[#5C8268]"
                              : isToday
                              ? "border-[rgba(142,129,119,0.14)] bg-white text-[#6F6158] hover:border-[#D9BC7A]"
                              : "border-[rgba(142,129,119,0.10)] bg-[#FAF7F2] text-[#9D8C7D] cursor-not-allowed"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 size={18} className="text-[#5C8268] shrink-0" />
                          ) : (
                            <Circle size={18} className="text-[#9D8C7D] shrink-0" />
                          )}
                          <span className={done ? "line-through" : ""}>{step.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-[#9D8C7D] mb-1.5">
                      <span>{isToday ? "Today" : "Not scheduled today"}</span>
                      <span className="font-mono">{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#EEE7DE]">
                      <div
                        className="h-full rounded-full bg-[#D9BC7A] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {pct >= 80 && (today?.points_earned ?? 0) > 0 && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-[#A67830]">
                        <Trophy size={12} /> +{today?.points_earned} pts earned today
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add routine modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 sm:rounded-3xl">
            <h2 className="font-display text-xl text-[#6F6158] mb-4">New routine</h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs text-[#9D8C7D]">Name</label>
                <input
                  value={draft.routine_name}
                  onChange={(e) => setDraft({ ...draft, routine_name: e.target.value })}
                  placeholder="e.g. School morning"
                  className="mt-1 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9D8C7D]">When</label>
                  <select
                    value={draft.routine_type}
                    onChange={(e) =>
                      setDraft({ ...draft, routine_type: e.target.value as RoutineType })
                    }
                    className="mt-1 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                  >
                    {ROUTINE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#9D8C7D]">Who</label>
                  <select
                    value={draft.child_id}
                    onChange={(e) => setDraft({ ...draft, child_id: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Whole whānau</option>
                    {children.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[#9D8C7D]">Start</label>
                  <input
                    type="time"
                    value={draft.start_time}
                    onChange={(e) => setDraft({ ...draft, start_time: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9D8C7D]">Mins</label>
                  <input
                    type="number"
                    value={draft.estimated_minutes}
                    onChange={(e) =>
                      setDraft({ ...draft, estimated_minutes: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9D8C7D]">Points</label>
                  <input
                    type="number"
                    value={draft.reward_points}
                    onChange={(e) =>
                      setDraft({ ...draft, reward_points: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#9D8C7D]">Active days</label>
                <div className="mt-1 flex gap-1.5">
                  {DAY_LABELS.map((d) => {
                    const on = draft.active_days.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        onClick={() => {
                          const next = on
                            ? draft.active_days.filter((x) => x !== d.key)
                            : [...draft.active_days, d.key];
                          setDraft({ ...draft, active_days: next });
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs transition-colors ${
                          on
                            ? "bg-[#6F6158] text-white"
                            : "bg-[#F7F3EE] text-[#9D8C7D] hover:bg-[#EEE7DE]"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[#9D8C7D]">Steps</label>
                  <button
                    onClick={() =>
                      setDraft({
                        ...draft,
                        steps: [...draft.steps, { id: crypto.randomUUID(), title: "" }],
                      })
                    }
                    className="text-xs text-[#D9BC7A] hover:text-[#C8A65F]"
                  >
                    + Add step
                  </button>
                </div>
                <div className="space-y-2">
                  {draft.steps.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <GripVertical size={14} className="text-[#C8B9AB]" />
                      <input
                        value={s.title}
                        onChange={(e) => {
                          const next = [...draft.steps];
                          next[i] = { ...s, title: e.target.value };
                          setDraft({ ...draft, steps: next });
                        }}
                        placeholder={`Step ${i + 1}`}
                        className="flex-1 rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-3 py-2 text-sm"
                      />
                      {draft.steps.length > 1 && (
                        <button
                          onClick={() =>
                            setDraft({
                              ...draft,
                              steps: draft.steps.filter((x) => x.id !== s.id),
                            })
                          }
                          className="text-[#9D8C7D] hover:text-[#A66363]"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white px-4 py-2.5 text-sm text-[#6F6158]"
              >
                Cancel
              </button>
              <button
                onClick={addRoutine}
                className="flex-1 rounded-2xl bg-[#D9BC7A] px-4 py-2.5 text-sm text-white hover:bg-[#C8A65F]"
              >
                Save routine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToroRoutines;
