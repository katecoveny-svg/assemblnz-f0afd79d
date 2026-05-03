import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Report {
  id: string;
  student_name: string;
  school_name: string | null;
  subject: string;
  grade: string;
  teacher: string | null;
  trend: string | null;
  attendance_pct: number | null;
  report_date: string;
}

const TrendIcon = ({ trend }: { trend: string | null }) => {
  if (trend === "up") return <TrendingUp size={14} className="text-[#9DB89D]" />;
  if (trend === "down") return <TrendingDown size={14} className="text-[#C09494]" />;
  return <Minus size={14} className="text-[#9D8C7D]" />;
};

export const SchoolReportsCard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStudent, setActiveStudent] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("toroa_school_reports")
      .select("id, student_name, school_name, subject, grade, teacher, trend, attendance_pct, report_date")
      .order("report_date", { ascending: false });
    const list = (data ?? []) as Report[];
    setReports(list);
    if (list.length > 0 && !activeStudent) setActiveStudent(list[0].student_name);
    setLoading(false);
  };

  const students = useMemo(
    () => Array.from(new Set(reports.map((r) => r.student_name))),
    [reports]
  );

  const visible = reports.filter((r) => !activeStudent || r.student_name === activeStudent);
  const attendance = visible.find((r) => r.attendance_pct != null)?.attendance_pct ?? null;
  const circleRadius = 22;
  const circumference = 2 * Math.PI * circleRadius;
  const dashOffset = attendance != null ? circumference * (1 - attendance / 100) : circumference;

  return (
    <article className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] overflow-hidden">
      <div className="h-1 bg-[#C7D9E8]" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl text-[#9D8C7D]">Latest Reports</h2>
            <p className="font-['Inter'] text-sm text-[#9D8C7D]/80">School progress</p>
          </div>
          {attendance != null && (
            <div className="relative w-14 h-14" aria-label={`Attendance ${attendance}%`}>
              <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r={circleRadius} stroke="#EEE7DE" strokeWidth="4" fill="none" />
                <circle
                  cx="28"
                  cy="28"
                  r={circleRadius}
                  stroke="#C7D9E8"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-['IBM_Plex_Mono'] text-xs text-[#6F6158]">
                {Math.round(attendance)}%
              </div>
            </div>
          )}
        </div>

        {students.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {students.map((s) => (
              <button
                key={s}
                onClick={() => setActiveStudent(s)}
                className={`px-3 py-1 rounded-full text-xs font-['Inter'] ${
                  activeStudent === s
                    ? "bg-[#EEE7DE] text-[#6F6158] font-medium"
                    : "text-[#9D8C7D] hover:bg-[#EEE7DE]/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-sm text-[#9D8C7D] font-['Inter']">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-10 px-4">
            <GraduationCap size={28} className="mx-auto mb-3 text-[#9D8C7D]/60" />
            <p className="text-sm text-[#6F6158] font-['Inter']">No reports yet</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {visible.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-2xl bg-[#EEE7DE]/40 border border-[rgba(142,129,119,0.1)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-['Inter'] text-xs text-[#9D8C7D] truncate">{r.subject}</p>
                      <p className="font-['Cormorant_Garamond'] text-2xl text-[#6F6158] leading-none mt-1">
                        {r.grade}
                      </p>
                    </div>
                    <TrendIcon trend={r.trend} />
                  </div>
                  {r.teacher && (
                    <p className="font-['Inter'] text-[10px] text-[#9D8C7D] mt-2 truncate">{r.teacher}</p>
                  )}
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm font-['Inter'] text-[#6F6158] underline-offset-4 hover:underline">
              View full report →
            </button>
          </>
        )}
      </div>
    </article>
  );
};
