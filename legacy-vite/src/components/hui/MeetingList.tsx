import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, RefreshCw } from "lucide-react";

export interface MeetingItem {
  id: string;
  summary: string;
  start: string;
  end?: string;
  attendees?: { email: string; displayName?: string }[];
  description?: string;
  htmlLink?: string;
}

interface Props {
  selectedId: string | null;
  onSelect: (m: MeetingItem) => void;
  onPrep: (m: MeetingItem) => void;
  onNotes: (m: MeetingItem) => void;
  onInsights: (m: MeetingItem) => void;
  onSummary: (m: MeetingItem) => void;
}

const KETE_TAGS: { match: RegExp; label: string; color: string }[] = [
  { match: /(build|site|construction|inspection)/i, label: "WAIHANGA", color: "#CBB8A4" },
  { match: /(hospitality|booking|guest)/i, label: "MANAAKI", color: "#E6D8C6" },
  { match: /(creative|brand|campaign)/i, label: "AUAHA", color: "#C8DDD8" },
  { match: /(fleet|driver|vehicle)/i, label: "ARATAKI", color: "#D5C0C8" },
  { match: /(freight|customs|shipment)/i, label: "PIKAU", color: "#B8C7B1" },
];

const initials = (input: string): string => {
  const parts = input.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
};

const friendly = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const time = d.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return `Today ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow ${time}`;
  return d.toLocaleDateString("en-NZ", { weekday: "short", day: "numeric", month: "short" }) + " " + time;
};

export const MeetingList = ({ selectedId, onSelect, onPrep, onNotes, onInsights, onSummary }: Props) => {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-calendar", {
        body: {
          action: "list_events",
          timeMin: new Date().toISOString(),
          timeMax: new Date(Date.now() + 7 * 86400000).toISOString(),
          maxResults: 20,
        },
      });
      if (!error && data?.events) {
        setMeetings(data.events);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] overflow-hidden">
      <div className="p-5 border-b border-[rgba(142,129,119,0.14)] flex items-center justify-between">
        <div>
          <h2 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D]">Upcoming</h2>
          <p className="font-['Inter'] text-xs text-[#9D8C7D]/80">Next 7 days</p>
        </div>
        <button
          onClick={load}
          className="text-[#6F6158] hover:bg-[#EEE7DE] rounded-xl p-2 transition-colors"
          aria-label="Sync calendar"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-sm text-[#9D8C7D] font-['Inter'] inline-flex items-center justify-center gap-2 w-full">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-8 px-3">
            <Calendar size={24} className="mx-auto mb-2 text-[#9D8C7D]/60" />
            <p className="text-sm text-[#6F6158] font-['Inter']">No upcoming meetings</p>
          </div>
        ) : (
          meetings.map((m) => {
            const kete = KETE_TAGS.find((k) => k.match.test(m.summary || ""));
            const active = m.id === selectedId;
            return (
              <div
                key={m.id}
                className={`p-3 rounded-2xl border transition-colors ${
                  active
                    ? "bg-[#D9BC7A]/15 border-[#D9BC7A]/30"
                    : "border-[rgba(142,129,119,0.1)] hover:bg-[#EEE7DE]/40"
                }`}
              >
                <button onClick={() => onSelect(m)} className="text-left w-full">
                  <p className="font-['Inter'] text-sm font-medium text-[#6F6158] truncate">
                    {m.summary || "(untitled)"}
                  </p>
                  <p className="font-['IBM_Plex_Mono'] text-[10px] text-[#9D8C7D] mt-1">
                    {friendly(m.start)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {(m.attendees ?? []).slice(0, 4).map((a, i) => (
                      <span
                        key={i}
                        className="w-6 h-6 rounded-full bg-[#EEE7DE] flex items-center justify-center text-[9px] font-['Inter'] text-[#6F6158] border border-[rgba(142,129,119,0.14)]"
                        title={a.email}
                      >
                        {initials(a.displayName || a.email)}
                      </span>
                    ))}
                    {(m.attendees?.length ?? 0) > 4 && (
                      <span className="text-[10px] text-[#9D8C7D] font-['Inter']">
                        +{(m.attendees?.length ?? 0) - 4}
                      </span>
                    )}
                  </div>
                  {kete && (
                    <span
                      className="inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-['Inter'] font-medium text-[#6F6158]"
                      style={{ background: `${kete.color}50` }}
                    >
                      {kete.label}
                    </span>
                  )}
                </button>
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  <button
                    onClick={() => onPrep(m)}
                    className="bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] rounded-xl px-2 py-1.5 text-xs font-['Inter'] font-medium transition-colors"
                  >
                    Prep
                  </button>
                  <button
                    onClick={() => onNotes(m)}
                    className="border border-[rgba(142,129,119,0.2)] text-[#6F6158] hover:bg-[#EEE7DE] rounded-xl px-2 py-1.5 text-xs font-['Inter'] transition-colors"
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => onInsights(m)}
                    className="border border-[rgba(142,129,119,0.2)] text-[#6F6158] hover:bg-[#EEE7DE] rounded-xl px-2 py-1.5 text-xs font-['Inter'] transition-colors"
                  >
                    Insights
                  </button>
                  <button
                    onClick={() => onSummary(m)}
                    className="border border-[rgba(142,129,119,0.2)] text-[#6F6158] hover:bg-[#EEE7DE] rounded-xl px-2 py-1.5 text-xs font-['Inter'] transition-colors"
                  >
                    Summary
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
