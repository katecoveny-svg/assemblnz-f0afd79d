import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PomodoroTimer } from "@/components/toro/homework/PomodoroTimer";
import { CURRICULUM_BANDS, getBandForYear } from "@/components/toro/homework/curriculumResources";
import { toast } from "sonner";

interface ChildRow {
  id: string;
  name: string;
  year_level: number | null;
  ncea_level: number | null;
  school: string | null;
}

interface HomeworkRow {
  id: string;
  child_id: string;
  family_id: string;
  title: string;
  subject: string | null;
  due_date: string | null;
  due_time: string | null;
  description: string | null;
  estimated_hours: number | null;
  status: string | null;
  curriculum_area: string | null;
  difficulty: string | null;
  time_spent_minutes: number | null;
  created_at: string;
}

interface FocusSessionRow {
  id: string;
  child_id: string;
  subject: string | null;
  actual_minutes: number | null;
  session_type: string | null;
  started_at: string;
}

const fmtDate = (iso: string | null): string => {
  if (!iso) return "No due date";
  const d = new Date(iso);
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "2-digit", month: "short" });
};

const daysUntil = (iso: string | null): number | null => {
  if (!iso) return null;
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const dueChip = (iso: string | null) => {
  const days = daysUntil(iso);
  if (days === null) return { label: "No date", class: "bg-[#F7F3EE] text-[#9D8C7D]" };
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, class: "bg-[#F4E4E4] text-[#A66363]" };
  if (days === 0) return { label: "Due today", class: "bg-[#F4E0C7] text-[#A67830]" };
  if (days === 1) return { label: "Due tomorrow", class: "bg-[#F4E0C7] text-[#A67830]" };
  if (days <= 3) return { label: `${days} days`, class: "bg-[#FAF1E0] text-[#9D8C7D]" };
  return { label: `${days} days`, class: "bg-[#E5EDE9] text-[#5C8268]" };
};

const ToroHomework = () => {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [homework, setHomework] = useState<HomeworkRow[]>([]);
  const [sessions, setSessions] = useState<FocusSessionRow[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string>("Study");
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newHw, setNewHw] = useState({ title: "", subject: "", due_date: "", description: "" });

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

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [{ data: c }, { data: hw }, { data: fs }] = await Promise.all([
      supabase
        .from("toroa_children")
        .select("id, name, year_level, ncea_level, school")
        .eq("family_id", membership.family_id)
        .order("year_level", { ascending: false }),
      supabase
        .from("toroa_homework")
        .select("id, child_id, family_id, title, subject, due_date, due_time, description, estimated_hours, status, curriculum_area, difficulty, time_spent_minutes, created_at")
        .eq("family_id", membership.family_id)
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("toroa_focus_sessions")
        .select("id, child_id, subject, actual_minutes, session_type, started_at")
        .eq("family_id", membership.family_id)
        .gte("started_at", sevenDaysAgo.toISOString())
        .order("started_at", { ascending: false }),
    ]);

    const childList = (c as ChildRow[] | null) ?? [];
    setChildren(childList);
    setHomework((hw as HomeworkRow[] | null) ?? []);
    setSessions((fs as FocusSessionRow[] | null) ?? []);
    if (childList.length > 0 && !activeChildId) {
      setActiveChildId(childList[0].id);
    }
    setIsLoading(false);
  };

  const activeChild = useMemo(
    () => children.find((c) => c.id === activeChildId) ?? null,
    [children, activeChildId],
  );

  const childHomework = useMemo(
    () => homework.filter((h) => h.child_id === activeChildId),
    [homework, activeChildId],
  );

  const upcomingHomework = useMemo(
    () =>
      childHomework.filter(
        (h) => h.status !== "completed" && h.status !== "done",
      ),
    [childHomework],
  );

  const completedHomework = useMemo(
    () => childHomework.filter((h) => h.status === "completed" || h.status === "done"),
    [childHomework],
  );

  const yearBand = useMemo(() => getBandForYear(activeChild?.year_level ?? null), [activeChild]);

  // Weekly study report (per active child, last 7 days)
  const weeklyReport = useMemo(() => {
    const childSessions = sessions.filter(
      (s) => s.child_id === activeChildId && s.session_type === "focus",
    );
    const totalMinutes = childSessions.reduce((sum, s) => sum + (s.actual_minutes ?? 0), 0);

    const bySubject = new Map<string, number>();
    for (const s of childSessions) {
      const key = s.subject ?? "Unspecified";
      bySubject.set(key, (bySubject.get(key) ?? 0) + (s.actual_minutes ?? 0));
    }

    const byDay: { day: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const minutes = childSessions
        .filter((s) => {
          const ts = new Date(s.started_at);
          return ts >= d && ts < next;
        })
        .reduce((sum, s) => sum + (s.actual_minutes ?? 0), 0);
      byDay.push({
        day: d.toLocaleDateString("en-NZ", { weekday: "short" }),
        minutes,
      });
    }

    const completedThisWeek = completedHomework.filter((h) => {
      const ts = new Date(h.created_at);
      return ts >= sevenDaysAgoDate();
    }).length;

    const maxMinutes = Math.max(...byDay.map((d) => d.minutes), 30);

    return {
      totalMinutes,
      sessionCount: childSessions.length,
      bySubject: Array.from(bySubject.entries()).sort((a, b) => b[1] - a[1]),
      byDay,
      maxMinutes,
      completedThisWeek,
    };
  }, [sessions, activeChildId, completedHomework]);

  const handleAddHomework = async () => {
    if (!familyId || !activeChildId || !newHw.title.trim()) return;
    const { error } = await supabase.from("toroa_homework").insert({
      family_id: familyId,
      child_id: activeChildId,
      title: newHw.title.trim(),
      subject: newHw.subject.trim() || null,
      due_date: newHw.due_date || null,
      description: newHw.description.trim() || null,
      year_level: activeChild?.year_level ?? null,
      status: "pending",
    });
    if (error) {
      toast.error(`Could not add homework: ${error.message}`);
      return;
    }
    toast.success("Homework added");
    setNewHw({ title: "", subject: "", due_date: "", description: "" });
    setShowAdd(false);
    await loadAll();
  };

  const handleToggleComplete = async (hw: HomeworkRow) => {
    const next = hw.status === "completed" ? "pending" : "completed";
    const { error } = await supabase
      .from("toroa_homework")
      .update({ status: next })
      .eq("id", hw.id);
    if (error) {
      toast.error(`Update failed: ${error.message}`);
      return;
    }
    await loadAll();
  };

  const handleSessionComplete = async ({
    plannedMinutes,
    actualMinutes,
    sessionType,
  }: {
    plannedMinutes: number;
    actualMinutes: number;
    sessionType: "focus" | "break";
  }) => {
    if (!familyId || !activeChildId) return;
    const startedAt = new Date(Date.now() - actualMinutes * 60 * 1000).toISOString();
    const { error } = await supabase.from("toroa_focus_sessions").insert({
      family_id: familyId,
      child_id: activeChildId,
      subject: activeSubject,
      planned_minutes: plannedMinutes,
      actual_minutes: actualMinutes,
      session_type: sessionType,
      started_at: startedAt,
      ended_at: new Date().toISOString(),
      points_earned: sessionType === "focus" ? Math.round(actualMinutes / 5) : 0,
    });
    if (error) {
      toast.error(`Could not log session: ${error.message}`);
      return;
    }
    if (sessionType === "focus") {
      toast.success(`${actualMinutes} min logged for ${activeChild?.name ?? "study"}`);
    }
    await loadAll();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <p className="font-body text-[#9D8C7D]">Loading homework hub…</p>
      </div>
    );
  }

  if (!familyId) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl text-[#6F6158] mb-3">Sign in required</h1>
          <p className="font-body text-[#9D8C7D] mb-6">
            The homework hub needs a Tōro family account so each child's progress stays private.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D9BC7A] text-white font-body text-sm"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl text-[#6F6158] mb-3">Add a child to begin</h1>
          <p className="font-body text-[#9D8C7D] mb-6">
            Once you've added tamariki, this page will track their homework, focus time, and
            curriculum-matched study links.
          </p>
          <Link
            to="/toro/children"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D9BC7A] text-white font-body text-sm"
          >
            <Plus size={14} /> Add child
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#F7F3EE]/85 backdrop-blur-xl border-b border-[#8E8177]/10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            to="/toro/dashboard"
            className="flex items-center gap-2 text-[#9D8C7D] hover:text-[#6F6158] transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="font-body text-sm">Dashboard</span>
          </Link>
          <h1 className="font-display text-xl text-[#6F6158]">Homework</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Child tabs */}
      <div className="max-w-5xl mx-auto px-5 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChildId(c.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border transition-all ${
                activeChildId === c.id
                  ? "bg-white border-[#D9BC7A] shadow-[0_4px_14px_rgba(217,188,122,0.2)]"
                  : "bg-white/50 border-[#8E8177]/14 hover:bg-white/80"
              }`}
            >
              <p className="font-display text-sm text-[#6F6158]">{c.name}</p>
              <p className="font-body text-xs text-[#9D8C7D]">
                {c.year_level ? `Year ${c.year_level}` : c.school ?? "—"}
                {c.ncea_level ? ` · NCEA L${c.ncea_level}` : ""}
              </p>
            </button>
          ))}
        </div>
      </div>

      {activeChild && (
        <div className="max-w-5xl mx-auto px-5 pt-6 grid lg:grid-cols-2 gap-6">
          {/* Pomodoro */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-[#6F6158]">Focus timer</h2>
              <select
                value={activeSubject}
                onChange={(e) => setActiveSubject(e.target.value)}
                className="text-xs font-body text-[#6F6158] bg-white/70 border border-[#8E8177]/14 rounded-full px-3 py-1.5"
              >
                <option value="Study">Study</option>
                <option value="Maths">Maths</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Te Reo Māori">Te Reo Māori</option>
                <option value="Reading">Reading</option>
              </select>
            </div>
            <PomodoroTimer
              childName={activeChild.name}
              subject={activeSubject}
              onSessionComplete={handleSessionComplete}
            />
          </section>

          {/* Weekly study report */}
          <section>
            <h2 className="font-display text-lg text-[#6F6158] mb-3">This week's study</h2>
            <div className="rounded-3xl border border-[#8E8177]/14 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center">
                  <p className="font-mono text-2xl text-[#6F6158]">{weeklyReport.totalMinutes}</p>
                  <p className="font-body text-xs text-[#9D8C7D]">minutes</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl text-[#6F6158]">{weeklyReport.sessionCount}</p>
                  <p className="font-body text-xs text-[#9D8C7D]">sessions</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl text-[#6F6158]">
                    {weeklyReport.completedThisWeek}
                  </p>
                  <p className="font-body text-xs text-[#9D8C7D]">completed</p>
                </div>
              </div>

              {/* Daily bar chart */}
              <div className="flex items-end justify-between gap-2 h-24 mb-5">
                {weeklyReport.byDay.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-[#C9D8D0] to-[#D9BC7A] transition-all"
                        style={{
                          height: d.minutes > 0
                            ? `${Math.max(8, (d.minutes / weeklyReport.maxMinutes) * 100)}%`
                            : "2px",
                          opacity: d.minutes > 0 ? 1 : 0.25,
                        }}
                        title={`${d.minutes} min`}
                      />
                    </div>
                    <p className="font-mono text-[10px] text-[#9D8C7D]">{d.day}</p>
                  </div>
                ))}
              </div>

              {weeklyReport.bySubject.length > 0 ? (
                <div className="border-t border-[#8E8177]/10 pt-4">
                  <p className="font-body text-xs text-[#9D8C7D] mb-2 flex items-center gap-1.5">
                    <TrendingUp size={11} /> Time per subject
                  </p>
                  <div className="space-y-1.5">
                    {weeklyReport.bySubject.slice(0, 5).map(([subject, mins]) => (
                      <div key={subject} className="flex items-center justify-between">
                        <span className="font-body text-sm text-[#6F6158]">{subject}</span>
                        <span className="font-mono text-xs text-[#9D8C7D]">{mins} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="font-body text-xs text-[#9D8C7D] text-center py-2">
                  Run a focus session to start the weekly report.
                </p>
              )}
            </div>
          </section>

          {/* Homework list */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-[#6F6158]">
                Homework — {activeChild.name}
              </h2>
              <button
                onClick={() => setShowAdd((s) => !s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D9BC7A] text-white font-body text-xs hover:bg-[#C7A86A]"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {showAdd && (
              <div className="rounded-3xl border border-[#D9BC7A]/40 bg-white/80 p-5 mb-4 space-y-3">
                <input
                  placeholder="Title (e.g. Chapter 4 questions)"
                  value={newHw.title}
                  onChange={(e) => setNewHw({ ...newHw, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#8E8177]/20 bg-white font-body text-sm text-[#6F6158]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Subject"
                    value={newHw.subject}
                    onChange={(e) => setNewHw({ ...newHw, subject: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-[#8E8177]/20 bg-white font-body text-sm text-[#6F6158]"
                  />
                  <input
                    type="date"
                    value={newHw.due_date}
                    onChange={(e) => setNewHw({ ...newHw, due_date: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-[#8E8177]/20 bg-white font-body text-sm text-[#6F6158]"
                  />
                </div>
                <textarea
                  placeholder="Notes (optional)"
                  value={newHw.description}
                  onChange={(e) => setNewHw({ ...newHw, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#8E8177]/20 bg-white font-body text-sm text-[#6F6158] min-h-[60px]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2 rounded-full text-xs font-body text-[#9D8C7D]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddHomework}
                    className="px-4 py-2 rounded-full bg-[#D9BC7A] text-white text-xs font-body"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-[#8E8177]/14 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] divide-y divide-[#8E8177]/10">
              {upcomingHomework.length === 0 && completedHomework.length === 0 && (
                <div className="p-8 text-center">
                  <BookOpen size={32} className="text-[#D9BC7A] mx-auto mb-2 opacity-60" />
                  <p className="font-body text-sm text-[#9D8C7D]">
                    No homework logged yet. Add one above to start tracking due dates.
                  </p>
                </div>
              )}

              {upcomingHomework.map((hw) => {
                const chip = dueChip(hw.due_date);
                return (
                  <div key={hw.id} className="p-4 flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(hw)}
                      className="mt-0.5 flex-shrink-0"
                      aria-label="Mark complete"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-[#9D8C7D] hover:border-[#8FB09A] hover:bg-[#8FB09A]/10 transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-body text-sm text-[#6F6158]">{hw.title}</p>
                          {hw.subject && (
                            <p className="font-body text-xs text-[#9D8C7D] mt-0.5">{hw.subject}</p>
                          )}
                        </div>
                        <span
                          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono ${chip.class}`}
                        >
                          {chip.label}
                        </span>
                      </div>
                      {hw.description && (
                        <p className="font-body text-xs text-[#9D8C7D] mt-1.5 leading-relaxed">
                          {hw.description}
                        </p>
                      )}
                      <p className="font-mono text-[10px] text-[#9D8C7D] mt-1.5">
                        {fmtDate(hw.due_date)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {completedHomework.length > 0 && (
                <div className="p-3 bg-[#F7F3EE]/40">
                  <p className="font-body text-xs text-[#9D8C7D] mb-2 flex items-center gap-1.5 px-2">
                    <CheckCircle2 size={11} /> Completed ({completedHomework.length})
                  </p>
                  {completedHomework.slice(0, 5).map((hw) => (
                    <div
                      key={hw.id}
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-white/50 rounded"
                    >
                      <button
                        onClick={() => handleToggleComplete(hw)}
                        className="flex items-center gap-2 text-left"
                      >
                        <CheckCircle2 size={14} className="text-[#8FB09A]" />
                        <span className="font-body text-xs text-[#9D8C7D] line-through">
                          {hw.title}
                        </span>
                      </button>
                      <span className="font-mono text-[10px] text-[#9D8C7D]">
                        {hw.subject ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Curriculum-matched resources */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-[#6F6158] flex items-center gap-2">
                <Sparkles size={16} className="text-[#D9BC7A]" />
                Study links for {activeChild.name}
              </h2>
              {yearBand && (
                <span className="font-mono text-[10px] text-[#9D8C7D]">{yearBand.label}</span>
              )}
            </div>

            {yearBand ? (
              <div className="rounded-3xl border border-[#8E8177]/14 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  {yearBand.resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-4 rounded-2xl border border-[#8E8177]/10 bg-[#F7F3EE]/50 hover:bg-white hover:border-[#D9BC7A]/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-display text-sm text-[#6F6158] group-hover:text-[#A67830]">
                          {r.title}
                        </span>
                        <ExternalLink
                          size={12}
                          className="text-[#9D8C7D] group-hover:text-[#A67830] flex-shrink-0 mt-0.5"
                        />
                      </div>
                      <p className="font-body text-xs text-[#9D8C7D] leading-relaxed mb-2">
                        {r.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-[#A67830] bg-[#FAF1E0] px-2 py-0.5 rounded-full">
                          {r.subject}
                        </span>
                        <span className="font-mono text-[9px] text-[#9D8C7D]">{r.source}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-[#8E8177]/14 bg-white/70 p-6 text-center">
                <AlertCircle size={20} className="text-[#9D8C7D] mx-auto mb-2" />
                <p className="font-body text-sm text-[#9D8C7D]">
                  Add a year level to {activeChild.name}'s profile to unlock matched resources.
                </p>
                <Link
                  to="/toro/children"
                  className="inline-flex items-center gap-1 mt-3 text-xs font-body text-[#A67830]"
                >
                  Edit profile <ChevronLeft size={12} className="rotate-180" />
                </Link>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

const sevenDaysAgoDate = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default ToroHomework;
