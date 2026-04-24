import { useState } from "react";
import { ChevronDown, ChevronRight, Save, Mail } from "lucide-react";
import type { MeetingItem } from "./MeetingList";

interface Props {
  meeting: MeetingItem;
}

const SAMPLE_DECISIONS = [
  "Approved revised timeline — delivery mid-May",
  "Marketing copy to use the operator's existing brand voice",
];
const SAMPLE_ACTIONS = [
  { who: "Sarah", what: "Send draft contract by Wednesday", due: "Wed 30 Apr" },
  { who: "Tom", what: "Confirm pricing with finance", due: "Mon 28 Apr" },
];
const SAMPLE_HIGHLIGHTS = [
  "Strong appetite for a 6-week pilot",
  "Concerns raised about onboarding lift",
];
const SAMPLE_PARKING = ["Long-term integration with Xero", "Roadmap for evidence packs in Q3"];

export const MeetingNotes = ({ meeting }: Props) => {
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [notes, setNotes] = useState(
    `# ${meeting.summary}\n\nRecap and follow-ups will appear here once the transcript is processed.`
  );

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#9D8C7D]">{meeting.summary}</h2>
        <p className="font-['Inter'] text-sm text-[#9D8C7D]/80">Meeting notes</p>
      </header>

      {/* Transcript */}
      <section className="rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white/60 overflow-hidden">
        <button
          onClick={() => setTranscriptOpen((s) => !s)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#EEE7DE]/40"
        >
          <span className="font-['Inter'] text-sm font-medium text-[#6F6158]">Full transcript</span>
          {transcriptOpen ? (
            <ChevronDown size={16} className="text-[#9D8C7D]" />
          ) : (
            <ChevronRight size={16} className="text-[#9D8C7D]" />
          )}
        </button>
        {transcriptOpen && (
          <div className="p-4 border-t border-[rgba(142,129,119,0.1)] font-['Inter'] text-sm text-[#6F6158] max-h-72 overflow-y-auto">
            <p className="text-[#9D8C7D]/80 italic">
              Transcript will populate from Granola once a recording is connected.
            </p>
          </div>
        )}
      </section>

      {/* Generated structured notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="p-5 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.14)]">
          <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] mb-3">Decisions</h3>
          <ol className="space-y-2 list-decimal list-inside">
            {SAMPLE_DECISIONS.map((d, i) => (
              <li key={i} className="font-['Inter'] text-sm text-[#6F6158]">
                ✓ {d}
              </li>
            ))}
          </ol>
        </section>

        <section className="p-5 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.14)]">
          <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] mb-3">Action items</h3>
          <ul className="space-y-2">
            {SAMPLE_ACTIONS.map((a, i) => (
              <li key={i} className="flex items-start gap-2 font-['Inter'] text-sm text-[#6F6158]">
                <input type="checkbox" className="mt-1 accent-[#D9BC7A]" />
                <div className="flex-1">
                  <span className="font-medium">{a.who}</span> — {a.what}
                  <span className="block font-['IBM_Plex_Mono'] text-[10px] text-[#9D8C7D]">{a.due}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="p-5 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.14)]">
          <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] mb-3">Key highlights</h3>
          <ul className="space-y-2 list-disc list-inside">
            {SAMPLE_HIGHLIGHTS.map((h, i) => (
              <li key={i} className="font-['Inter'] text-sm text-[#6F6158]">
                {h}
              </li>
            ))}
          </ul>
        </section>

        <section className="p-5 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.14)]">
          <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] mb-3">Parking lot</h3>
          <ul className="space-y-2 list-disc list-inside">
            {SAMPLE_PARKING.map((p, i) => (
              <li key={i} className="font-['Inter'] text-sm text-[#6F6158]">
                {p}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Editable notes */}
      <section>
        <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] mb-2">Edit notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={8}
          className="w-full p-4 rounded-2xl border border-[rgba(142,129,119,0.14)] bg-white/80 font-['IBM_Plex_Mono'] text-sm text-[#6F6158] focus:outline-none focus:ring-2 focus:ring-[#D9BC7A]/40"
        />
      </section>

      <div className="flex flex-wrap gap-2">
        <button className="bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] rounded-xl px-4 py-2 text-sm font-medium font-['Inter'] inline-flex items-center gap-2 transition-colors">
          <Save size={14} /> Save to Drive
        </button>
        <button className="border border-[rgba(142,129,119,0.2)] text-[#6F6158] hover:bg-[#EEE7DE] rounded-xl px-4 py-2 text-sm font-['Inter'] inline-flex items-center gap-2 transition-colors">
          <Mail size={14} /> Draft follow-up email
        </button>
      </div>
    </div>
  );
};
