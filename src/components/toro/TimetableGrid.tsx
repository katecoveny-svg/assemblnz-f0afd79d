import { useEffect, useState } from "react";
import { Backpack } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TimetableEntry {
  id: string;
  day_of_week: number;
  period: number;
  subject: string;
  teacher: string | null;
  room: string | null;
  gear_needed: string[] | null;
}

interface Props {
  familyId: string;
  childName: string;
}

const DAYS = [
  { num: 1, label: "Monday", short: "Mon" },
  { num: 2, label: "Tuesday", short: "Tue" },
  { num: 3, label: "Wednesday", short: "Wed" },
  { num: 4, label: "Thursday", short: "Thu" },
  { num: 5, label: "Friday", short: "Fri" },
];

const todayDow = (() => {
  const d = new Date().getDay();
  return d >= 1 && d <= 5 ? d : 1;
})();

export function TimetableGrid({ familyId, childName }: Props) {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(todayDow);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("toroa_child_timetables")
        .select("id, day_of_week, period, subject, teacher, room, gear_needed")
        .eq("family_id", familyId)
        .eq("child_name", childName)
        .order("period");
      setEntries((data as TimetableEntry[] | null) ?? []);
      setIsLoading(false);
    })();
  }, [familyId, childName]);

  if (isLoading) {
    return <p className="font-body text-sm text-[#9D8C7D]">Loading timetable…</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[rgba(142,129,119,0.24)] p-6 text-center">
        <p className="font-body text-sm text-[#6F6158]">No timetable yet for {childName}.</p>
        <p className="font-body text-xs text-[#9D8C7D] mt-1">
          Add periods to enable today's gear list.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {DAYS.map((d) => (
          <button
            key={d.num}
            type="button"
            onClick={() => setSelectedDay(d.num)}
            className={`px-3 py-1 rounded-full text-xs font-body transition-colors ${
              selectedDay === d.num
                ? "bg-[#C7D9E8] text-[#6F6158]"
                : "bg-white/60 text-[#9D8C7D] hover:bg-[#EEE7DE]"
            }`}
          >
            {d.short}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {DAYS.map((d) => {
          const dayEntries = entries.filter((e) => e.day_of_week === d.num);
          const isActive = d.num === selectedDay;
          return (
            <div
              key={d.num}
              className={`rounded-2xl p-3 border transition-colors ${
                isActive
                  ? "bg-[#C7D9E8]/40 border-[#C7D9E8]"
                  : "bg-white/40 border-[rgba(142,129,119,0.14)]"
              }`}
            >
              <p className="font-display text-sm text-[#9D8C7D] mb-2">{d.label}</p>
              {dayEntries.length === 0 ? (
                <p className="font-body text-xs text-[#9D8C7D]/60">—</p>
              ) : (
                <ul className="space-y-2">
                  {dayEntries.map((e) => (
                    <li key={e.id} className="text-xs font-body text-[#6F6158]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{e.subject}</span>
                        {e.gear_needed && e.gear_needed.length > 0 && (
                          <Backpack size={12} className="text-[#D9BC7A]" />
                        )}
                      </div>
                      {e.teacher && (
                        <p className="text-[10px] text-[#9D8C7D] mt-0.5">{e.teacher}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
