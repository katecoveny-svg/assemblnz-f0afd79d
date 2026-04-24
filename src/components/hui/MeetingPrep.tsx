import { Sparkles, Mail, FileText, Users, Clock } from "lucide-react";
import type { MeetingItem } from "./MeetingList";

interface Props {
  meeting: MeetingItem;
  onStartNotes: () => void;
}

export const MeetingPrep = ({ meeting, onStartNotes }: Props) => {
  const startTime = new Date(meeting.start).toLocaleString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#9D8C7D]">{meeting.summary}</h2>
          <p className="font-['Inter'] text-sm text-[#6F6158] mt-1 inline-flex items-center gap-1.5">
            <Clock size={14} className="text-[#9D8C7D]" />
            {startTime}
          </p>
        </div>
        <button
          onClick={onStartNotes}
          className="bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] rounded-xl px-4 py-2 text-sm font-medium font-['Inter'] transition-colors"
        >
          Start meeting notes
        </button>
      </header>

      {/* Attendees */}
      <section className="space-y-3">
        <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] inline-flex items-center gap-2">
          <Users size={16} className="text-[#9D8C7D]" /> Attendees
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(meeting.attendees ?? []).map((a, i) => (
            <div
              key={i}
              className="p-3 rounded-2xl bg-[#EEE7DE]/40 border border-[rgba(142,129,119,0.1)]"
            >
              <p className="font-['Inter'] text-sm font-medium text-[#6F6158]">
                {a.displayName || a.email.split("@")[0]}
              </p>
              <p className="font-['IBM_Plex_Mono'] text-[10px] text-[#9D8C7D]">{a.email}</p>
            </div>
          ))}
          {(meeting.attendees ?? []).length === 0 && (
            <p className="font-['Inter'] text-sm text-[#9D8C7D]">No attendees listed</p>
          )}
        </div>
      </section>

      {/* Recent threads */}
      <section className="space-y-3">
        <h3 className="font-['Cormorant_Garamono'] text-xl text-[#9D8C7D] inline-flex items-center gap-2 font-['Cormorant_Garamond']">
          <Mail size={16} className="text-[#9D8C7D]" /> Recent email threads
        </h3>
        <div className="p-4 rounded-2xl bg-[#EEE7DE]/40 border border-[rgba(142,129,119,0.1)]">
          <p className="font-['Inter'] text-sm text-[#6F6158]/80">
            Connect Gmail to surface the last conversations with these attendees.
          </p>
        </div>
      </section>

      {/* Documents */}
      <section className="space-y-3">
        <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] inline-flex items-center gap-2">
          <FileText size={16} className="text-[#9D8C7D]" /> Related documents
        </h3>
        <div className="p-4 rounded-2xl bg-[#EEE7DE]/40 border border-[rgba(142,129,119,0.1)]">
          <p className="font-['Inter'] text-sm text-[#6F6158]/80">
            Connect Drive to pull in related briefs and proposals.
          </p>
        </div>
      </section>

      {/* Suggested talking points */}
      <section className="space-y-3">
        <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] inline-flex items-center gap-2">
          <Sparkles size={16} className="text-[#D9BC7A]" /> Suggested talking points
        </h3>
        <ul className="space-y-2">
          {[
            "Confirm scope and timing for the next deliverable",
            "Recap last meeting's open action items",
            "Surface any blockers since last sync",
          ].map((p, i) => (
            <li
              key={i}
              className="p-3 rounded-xl bg-white/60 border border-[rgba(142,129,119,0.1)] font-['Inter'] text-sm text-[#6F6158]"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
