import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Mic, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MeetingList, type MeetingItem } from "@/components/hui/MeetingList";
import { MeetingPrep } from "@/components/hui/MeetingPrep";
import { MeetingNotes } from "@/components/hui/MeetingNotes";
import { MeetingInsights } from "@/components/hui/MeetingInsights";
import { MeetingSummary } from "@/components/hui/MeetingSummary";
import { QuickActions } from "@/components/hui/QuickActions";
import { ConnectPill } from "@/components/hui/ConnectPill";

type Mode = "prep" | "notes" | "insights" | "summary";

const HuiMeetingCopilot = () => {
  const [selected, setSelected] = useState<MeetingItem | null>(null);
  const [mode, setMode] = useState<Mode>("prep");
  const [calendarConnected, setCalendarConnected] = useState(false);

  useEffect(() => {
    void check();
  }, []);

  const check = async () => {
    try {
      const { data } = await supabase.functions.invoke("google-calendar", {
        body: { action: "status" },
      });
      setCalendarConnected(Boolean(data?.connected));
    } catch {
      // ignore
    }
  };

  const ModeTab = ({ k, label }: { k: Mode; label: string }) => (
    <button
      onClick={() => setMode(k)}
      className={`px-4 py-1.5 rounded-full text-xs font-['Inter'] transition-colors ${
        mode === k
          ? "bg-[#D9BC7A] text-[#6F6158] font-medium"
          : "text-[#9D8C7D] hover:bg-[#EEE7DE]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F7F3EE] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top bar */}
        <header className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-[#9D8C7D] hover:text-[#6F6158] font-['Inter'] mb-4"
          >
            <ChevronLeft size={14} />
            Back
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-['Cormorant_Garamond'] text-5xl text-[#9D8C7D] inline-flex items-center gap-3 border-b-2 border-[#D9BC7A] pb-1">
                <Mic size={32} className="text-[#D9BC7A]" />
                Hui
              </h1>
              <p className="font-['Inter'] text-base text-[#9D8C7D]/80 mt-2">Meeting Copilot</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ConnectPill name="Granola" provider="granola" connected={false} />
              <ConnectPill name="Calendar" provider="calendar" connected={calendarConnected} onChange={check} />
              <ConnectPill name="Drive" provider="drive" connected={false} />
              <ConnectPill name="Gmail" provider="gmail" connected={false} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <MeetingList
              selectedId={selected?.id ?? null}
              onSelect={(m) => {
                setSelected(m);
                setMode("prep");
              }}
              onPrep={(m) => {
                setSelected(m);
                setMode("prep");
              }}
              onNotes={(m) => {
                setSelected(m);
                setMode("notes");
              }}
              onInsights={(m) => {
                setSelected(m);
                setMode("insights");
              }}
              onSummary={(m) => {
                setSelected(m);
                setMode("summary");
              }}
            />
          </div>

          {/* Workspace */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] overflow-hidden">
              <div className="p-4 border-b border-[rgba(142,129,119,0.14)] flex items-center gap-2">
                <ModeTab k="prep" label="Prep" />
                <ModeTab k="notes" label="Notes" />
                <ModeTab k="insights" label="Insights" />
              </div>
              <div className="p-6">
                {mode === "insights" ? (
                  <MeetingInsights />
                ) : !selected ? (
                  <div className="text-center py-16 px-6">
                    <Sparkles size={32} className="mx-auto mb-3 text-[#D9BC7A]" />
                    <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#9D8C7D]">
                      Pick a meeting to begin
                    </h3>
                    <p className="font-['Inter'] text-sm text-[#6F6158]/80 mt-2 max-w-md mx-auto">
                      Choose a meeting from the list to surface prep notes, transcripts, and follow-ups.
                    </p>
                  </div>
                ) : mode === "prep" ? (
                  <MeetingPrep meeting={selected} onStartNotes={() => setMode("notes")} />
                ) : (
                  <MeetingNotes meeting={selected} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuickActions
        onSearch={() => {/* search modal hook */}}
        onWeeklyDigest={() => setMode("insights")}
        onOpenActions={() => setMode("insights")}
      />
    </div>
  );
};

export default HuiMeetingCopilot;
