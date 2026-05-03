import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, GraduationCap, TrendingUp, TrendingDown, Minus, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ToroTutorChat } from "@/components/toro/ToroTutorChat";

interface GradeRow {
  id: string;
  child_name: string;
  school: string | null;
  subject: string;
  grade: number | null;
  grade_label: string | null;
  teacher: string | null;
  report_date: string;
  report_type: string | null;
  attendance_pct: number | null;
  teacher_comments: string | null;
  ncea_credits: number | null;
  ncea_standard: string | null;
  ncea_level: number | null;
}

interface ChildSummary {
  name: string;
  ncea_level: number | null;
  totalCredits: number;
  excellenceCredits: number;
  meritCredits: number;
  achievedCredits: number;
  avgGrade: number | null;
  trend: "up" | "down" | "flat" | null;
  attendance: number | null;
  subjects: { name: string; latest: GradeRow; trend: "up" | "down" | "flat" | null }[];
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NZ", { day: "2-digit", month: "short", year: "numeric" });
};

const TrendIcon = ({ t }: { t: "up" | "down" | "flat" | null }) => {
  if (t === "up") return <TrendingUp size={14} className="text-[#8FB09A]" />;
  if (t === "down") return <TrendingDown size={14} className="text-[#C09494]" />;
  return <Minus size={14} className="text-[#9D8C7D]" />;
};

const ToroEducation = () => {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [children, setChildren] = useState<{ name: string; ncea_level: number | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
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
      const [{ data: g }, { data: c }] = await Promise.all([
        supabase
          .from("toroa_grade_history")
          .select("id, child_name, school, subject, grade, grade_label, teacher, report_date, report_type, attendance_pct, teacher_comments, ncea_credits, ncea_standard, ncea_level")
          .eq("family_id", membership.family_id)
          .order("report_date", { ascending: false }),
        supabase
          .from("toroa_children")
          .select("name, ncea_level")
          .eq("family_id", membership.family_id),
      ]);
      setGrades((g as GradeRow[] | null) ?? []);
      setChildren((c as { name: string; ncea_level: number | null }[] | null) ?? []);
      setIsLoading(false);
    })();
  }, []);

  const summaries = useMemo<ChildSummary[]>(() => {
    return children.map((child) => {
      const childGrades = grades.filter((g) => g.child_name === child.name);
      const subjectMap = new Map<string, GradeRow[]>();
      for (const g of childGrades) {
        if (!subjectMap.has(g.subject)) subjectMap.set(g.subject, []);
        subjectMap.get(g.subject)!.push(g);
      }
      const subjects = Array.from(subjectMap.entries()).map(([name, rows]) => {
        const sorted = rows.sort((a, b) => a.report_date.localeCompare(b.report_date));
        const latest = sorted[sorted.length - 1];
        let trend: "up" | "down" | "flat" | null = null;
        if (sorted.length >= 2) {
          const prev = sorted[sorted.length - 2].grade;
          const curr = latest.grade;
          if (prev !== null && curr !== null) {
            if (curr > prev + 0.2) trend = "up";
            else if (curr < prev - 0.2) trend = "down";
            else trend = "flat";
          }
        }
        return { name, latest, trend };
      });

      const totalCredits = childGrades.reduce((s, g) => s + (g.ncea_credits ?? 0), 0);
      const excellenceCredits = childGrades
        .filter((g) => g.grade_label?.toLowerCase().includes("excellence"))
        .reduce((s, g) => s + (g.ncea_credits ?? 0), 0);
      const meritCredits = childGrades
        .filter((g) => g.grade_label?.toLowerCase().includes("merit"))
        .reduce((s, g) => s + (g.ncea_credits ?? 0), 0);
      const achievedCredits = childGrades
        .filter((g) => g.grade_label?.toLowerCase() === "achieved")
        .reduce((s, g) => s + (g.ncea_credits ?? 0), 0);

      const numericGrades = childGrades.map((g) => g.grade).filter((v): v is number => v !== null);
      const avgGrade = numericGrades.length
        ? numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length
        : null;

      const attendances = childGrades
        .map((g) => g.attendance_pct)
        .filter((v): v is number => v !== null);
      const attendance = attendances.length
        ? attendances.reduce((a, b) => a + b, 0) / attendances.length
        : null;

      let trend: "up" | "down" | "flat" | null = null;
      const sortedAll = [...childGrades]
        .sort((a, b) => a.report_date.localeCompare(b.report_date))
        .map((g) => g.grade)
        .filter((v): v is number => v !== null);
      if (sortedAll.length >= 4) {
        const half = Math.floor(sortedAll.length / 2);
        const earlyAvg = sortedAll.slice(0, half).reduce((a, b) => a + b, 0) / half;
        const lateAvg = sortedAll.slice(half).reduce((a, b) => a + b, 0) / (sortedAll.length - half);
        if (lateAvg > earlyAvg + 0.2) trend = "up";
        else if (lateAvg < earlyAvg - 0.2) trend = "down";
        else trend = "flat";
      }

      return {
        name: child.name,
        ncea_level: child.ncea_level,
        totalCredits,
        excellenceCredits,
        meritCredits,
        achievedCredits,
        avgGrade,
        trend,
        attendance,
        subjects,
      };
    });
  }, [children, grades]);

  return (
    <div className="min-h-screen bg-[#F7F3EE] pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <Link
            to="/toro/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#9D8C7D] hover:text-[#6F6158] font-body mb-4"
          >
            <ChevronLeft size={14} />
            Back to Tōro
          </Link>
          <h1 className="font-display text-5xl text-[#9D8C7D] inline-flex items-center gap-3 border-b-2 border-[#C7D9E8] pb-1">
            <GraduationCap size={32} className="text-[#C7D9E8]" />
            Akoranga
          </h1>
          <p className="font-body text-base text-[#9D8C7D]/80 mt-2">
            Weekly snapshot of grades, NCEA progress, and study trends.
          </p>
        </header>

        {isLoading ? (
          <p className="font-body text-sm text-[#9D8C7D]">Loading reports…</p>
        ) : !familyId ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-8 text-center">
            <p className="font-body text-sm text-[#6F6158]">
              No family workspace found. Set one up from the Tōro dashboard first.
            </p>
          </div>
        ) : summaries.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-8 text-center">
            <GraduationCap size={32} className="mx-auto mb-3 text-[#C7D9E8]" />
            <h3 className="font-display text-2xl text-[#9D8C7D]">No reports yet</h3>
            <p className="font-body text-sm text-[#6F6158]/80 mt-2 max-w-md mx-auto">
              Add tamariki and let Tōro Email Watch parse school reports as they arrive.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {summaries.map((s) => (
              <article
                key={s.name}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6"
              >
                <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-display text-3xl text-[#6F6158]">{s.name}</h2>
                    {s.ncea_level && (
                      <p className="font-body text-sm text-[#9D8C7D] mt-1">NCEA Level {s.ncea_level}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-body text-sm text-[#6F6158]">
                    <span className="text-[#9D8C7D]">Trend</span>
                    <TrendIcon t={s.trend} />
                  </div>
                </div>

                {/* NCEA progress */}
                {s.ncea_level && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <Stat label="Total credits" value={String(s.totalCredits)} hint="of 80 needed" />
                    <Stat label="Excellence" value={String(s.excellenceCredits)} hint="credits" accent="#D9BC7A" />
                    <Stat label="Merit" value={String(s.meritCredits)} hint="credits" accent="#C9D8D0" />
                    <Stat label="Achieved" value={String(s.achievedCredits)} hint="credits" accent="#C7D9E8" />
                  </div>
                )}

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <Stat
                    label="Average grade"
                    value={s.avgGrade !== null ? s.avgGrade.toFixed(1) : "—"}
                    hint="across all subjects"
                  />
                  <Stat
                    label="Attendance"
                    value={s.attendance !== null ? `${s.attendance.toFixed(0)}%` : "—"}
                    hint="recent average"
                  />
                </div>

                {/* Subjects */}
                <h3 className="font-display text-lg text-[#9D8C7D] mb-3">Subjects</h3>
                <div className="space-y-2">
                  {s.subjects.length === 0 ? (
                    <p className="font-body text-sm text-[#9D8C7D]">No subject reports yet.</p>
                  ) : (
                    s.subjects.map((sub) => (
                      <div
                        key={sub.name}
                        className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.10)]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-body text-sm text-[#6F6158] font-medium truncate">{sub.name}</p>
                            <TrendIcon t={sub.trend} />
                          </div>
                          {sub.latest.teacher && (
                            <p className="font-body text-xs text-[#9D8C7D] mt-0.5 truncate">
                              {sub.latest.teacher} · {fmtDate(sub.latest.report_date)}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {sub.latest.grade_label && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body bg-[#EEE7DE] text-[#6F6158]">
                              {sub.latest.grade_label.toLowerCase().includes("excellence") && (
                                <Award size={10} className="text-[#D9BC7A]" />
                              )}
                              {sub.latest.grade_label}
                            </span>
                          )}
                          {sub.latest.ncea_credits !== null && (
                            <p className="font-mono text-[10px] text-[#9D8C7D] mt-1">
                              {sub.latest.ncea_credits} credits
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            ))}

            {/* Tutor chat — grounded in summary stats */}
            <ToroTutorChat
              variant="education"
              title="Ask Tōro about school"
              contextLines={summaries.flatMap((s) => {
                const lines = [
                  `Child: ${s.name}${s.ncea_level ? ` — NCEA Level ${s.ncea_level}` : ""}.`,
                ];
                if (s.totalCredits > 0) {
                  lines.push(
                    `Credits: ${s.totalCredits} total (E${s.excellenceCredits}/M${s.meritCredits}/A${s.achievedCredits}).`,
                  );
                }
                if (s.avgGrade !== null) lines.push(`Average grade: ${s.avgGrade.toFixed(1)}.`);
                if (s.attendance !== null) lines.push(`Attendance: ${s.attendance.toFixed(0)}%.`);
                if (s.trend) lines.push(`Recent trend: ${s.trend}.`);
                if (s.subjects.length) {
                  const subjList = s.subjects
                    .map((sub) => `${sub.name}${sub.latest.grade_label ? ` (${sub.latest.grade_label})` : ""}`)
                    .join(", ");
                  lines.push(`Subjects: ${subjList}.`);
                }
                return lines;
              })}
              suggestions={
                summaries[0]
                  ? [
                      `How is ${summaries[0].name} tracking overall?`,
                      "Where should we focus revision this week?",
                      "Explain the latest grades in plain words.",
                    ]
                  : undefined
              }
            />

            {/* Resources footer */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6">
              <h3 className="font-display text-xl text-[#9D8C7D] mb-3">Study resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ResourceLink href="https://studyit.govt.nz" name="StudyIt" desc="Official NCEA study guides" />
                <ResourceLink href="https://learncoach.com" name="LearnCoach" desc="Free NCEA video lessons" />
                <ResourceLink href="https://www.nzqa.govt.nz" name="NZQA" desc="Standards & exemplars" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: string }) => (
  <div
    className="rounded-2xl p-3 bg-white/60 border border-[rgba(142,129,119,0.10)]"
    style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
  >
    <p className="font-body text-[10px] uppercase tracking-wider text-[#9D8C7D]">{label}</p>
    <p className="font-display text-2xl text-[#6F6158] mt-1">{value}</p>
    {hint && <p className="font-body text-[10px] text-[#9D8C7D] mt-0.5">{hint}</p>}
  </div>
);

const ResourceLink = ({ href, name, desc }: { href: string; name: string; desc: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="block rounded-2xl p-4 bg-white/60 border border-[rgba(142,129,119,0.14)] hover:border-[#C7D9E8] transition-colors"
  >
    <p className="font-display text-base text-[#6F6158]">{name}</p>
    <p className="font-body text-xs text-[#9D8C7D] mt-0.5">{desc}</p>
  </a>
);

export default ToroEducation;
