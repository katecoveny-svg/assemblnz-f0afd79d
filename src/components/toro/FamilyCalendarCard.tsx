import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Plus, Loader2 } from "lucide-react";

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end?: string;
  location?: string;
  description?: string;
  source?: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfWeek = (d: Date): Date => {
  const out = new Date(d);
  const day = (out.getDay() + 6) % 7; // Mon = 0
  out.setDate(out.getDate() - day);
  out.setHours(0, 0, 0, 0);
  return out;
};

const formatNz = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NZ", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const categoryEmoji = (summary: string): string => {
  const s = summary.toLowerCase();
  if (s.includes("sport") || s.includes("football") || s.includes("rugby") || s.includes("netball")) return "⚽";
  if (s.includes("doctor") || s.includes("dentist") || s.includes("health")) return "🏥";
  if (s.includes("school") || s.includes("class") || s.includes("camp")) return "🏫";
  if (s.includes("birthday") || s.includes("party")) return "🎂";
  return "📅";
};

export const FamilyCalendarCard = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const weekStart = startOfWeek(new Date());

  useEffect(() => {
    void loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-calendar", {
        body: {
          action: "list_events",
          timeMin: new Date().toISOString(),
          timeMax: new Date(Date.now() + 7 * 86400000).toISOString(),
          maxResults: 12,
        },
      });
      if (!error && data?.events) {
        setEvents(data.events);
      }
    } catch {
      // Edge function unconfigured — show empty state
    } finally {
      setLoading(false);
    }
  };

  const eventDots = DAYS.map((_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const count = events.filter((e) => {
      const ed = new Date(e.start);
      return ed.toDateString() === day.toDateString();
    }).length;
    return { day, count };
  });

  return (
    <article className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] overflow-hidden">
      <div className="h-1 bg-[#C7D9E8]" />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl text-[#9D8C7D]">This Week</h2>
            <p className="font-['Inter'] text-sm text-[#9D8C7D]/80">Family calendar</p>
          </div>
          <button className="text-[#6F6158] hover:bg-[#EEE7DE] rounded-xl px-3 py-2 text-sm font-['Inter'] inline-flex items-center gap-1.5 transition-colors border border-[rgba(142,129,119,0.2)]">
            <Plus size={14} />
            Add
          </button>
        </div>

        {/* Week strip */}
        <div className="grid grid-cols-7 gap-1 mb-4 p-2 rounded-xl bg-[#EEE7DE]/40">
          {eventDots.map((d, i) => {
            const isToday = d.day.toDateString() === new Date().toDateString();
            return (
              <div key={i} className="text-center">
                <div className="font-['Inter'] text-[10px] text-[#9D8C7D] uppercase tracking-wider">
                  {DAYS[i]}
                </div>
                <div
                  className={`font-['Cormorant_Garamond'] text-base mt-1 ${
                    isToday ? "text-[#6F6158] font-semibold" : "text-[#9D8C7D]"
                  }`}
                >
                  {d.day.getDate()}
                </div>
                <div className="h-1.5 flex justify-center gap-0.5 mt-1">
                  {Array.from({ length: Math.min(d.count, 3) }).map((_, k) => (
                    <span key={k} className="w-1 h-1 rounded-full bg-[#C7D9E8]" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-8 text-sm text-[#9D8C7D] font-['Inter'] inline-flex items-center justify-center gap-2 w-full">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Calendar size={28} className="mx-auto mb-3 text-[#9D8C7D]/60" />
            <p className="text-sm text-[#6F6158] font-['Inter']">
              Connect Calendar to see this week's events
            </p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto">
            {events.map((e) => (
              <li key={e.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#EEE7DE]/40">
                <span className="text-lg">{categoryEmoji(e.summary || "")}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-['Inter'] text-sm font-medium text-[#6F6158] truncate">
                    {e.summary || "(untitled)"}
                  </p>
                  <p className="font-['IBM_Plex_Mono'] text-[10px] text-[#9D8C7D]">{formatNz(e.start)}</p>
                  {e.source && (
                    <p className="font-['Inter'] text-[10px] text-[#9D8C7D]/80 mt-0.5">{e.source}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
};
