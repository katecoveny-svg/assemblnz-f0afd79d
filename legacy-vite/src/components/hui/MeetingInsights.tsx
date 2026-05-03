const TALK_TIME = [
  { name: "Sarah", pct: 45 },
  { name: "Tom", pct: 30 },
  { name: "You", pct: 25 },
];

const TOPICS = [
  { tag: "pilot scope", weight: 5 },
  { tag: "pricing", weight: 4 },
  { tag: "onboarding", weight: 3 },
  { tag: "evidence packs", weight: 3 },
  { tag: "Xero integration", weight: 2 },
  { tag: "compliance", weight: 2 },
];

const OPEN_ACTIONS = [
  { what: "Send draft proposal", who: "Sarah", overdue: false },
  { what: "Schedule legal review", who: "Tom", overdue: true },
  { what: "Confirm pilot dates with operator", who: "You", overdue: false },
];

export const MeetingInsights = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#9D8C7D]">Meeting insights</h2>
        <p className="font-['Inter'] text-sm text-[#9D8C7D]/80">Trends across your recent hui</p>
      </header>

      {/* Talk time */}
      <section className="p-5 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.14)]">
        <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] mb-4">Talk-time distribution</h3>
        <div className="space-y-3">
          {TALK_TIME.map((t) => (
            <div key={t.name}>
              <div className="flex justify-between text-xs font-['Inter'] text-[#6F6158] mb-1">
                <span>{t.name}</span>
                <span className="font-['IBM_Plex_Mono'] text-[#9D8C7D]">{t.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#EEE7DE]">
                <div
                  className="h-full rounded-full bg-[#D9BC7A]"
                  style={{ width: `${t.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sentiment timeline (simple sparkline) */}
      <section className="p-5 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.14)]">
        <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] mb-4">Sentiment timeline</h3>
        <svg viewBox="0 0 200 60" className="w-full h-16">
          <polyline
            fill="none"
            stroke="#9D8C7D"
            strokeWidth="2"
            points="0,40 25,32 50,38 75,28 100,22 125,30 150,20 175,18 200,24"
          />
          <polyline
            fill="rgba(217,188,122,0.2)"
            stroke="none"
            points="0,40 25,32 50,38 75,28 100,22 125,30 150,20 175,18 200,24 200,60 0,60"
          />
        </svg>
        <p className="text-xs font-['Inter'] text-[#9D8C7D] mt-2">
          Sentiment trended positive through the second half of the meeting.
        </p>
      </section>

      {/* Topic cloud */}
      <section className="p-5 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.14)]">
        <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] mb-4">Recurring topics</h3>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <span
              key={t.tag}
              className="px-3 py-1 rounded-full font-['Inter'] text-[#6F6158] bg-[#EEE7DE]"
              style={{ fontSize: `${10 + t.weight * 2}px` }}
            >
              {t.tag}
            </span>
          ))}
        </div>
      </section>

      {/* Open actions */}
      <section className="p-5 rounded-2xl bg-white/60 border border-[rgba(142,129,119,0.14)]">
        <h3 className="font-['Cormorant_Garamond'] text-xl text-[#9D8C7D] mb-4">Open action items</h3>
        <ul className="space-y-2">
          {OPEN_ACTIONS.map((a, i) => (
            <li
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-[#EEE7DE]/40 border border-[rgba(142,129,119,0.1)]"
            >
              <div>
                <p className="font-['Inter'] text-sm text-[#6F6158]">{a.what}</p>
                <p className="font-['IBM_Plex_Mono'] text-[10px] text-[#9D8C7D]">{a.who}</p>
              </div>
              {a.overdue && (
                <span className="text-[10px] font-['Inter'] font-medium px-2 py-0.5 rounded-full bg-[#C09494]/20 text-[#6F6158]">
                  Overdue
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
