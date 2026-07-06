/**
 * SaveTimeMoney — three plain columns, above the fold. The value in Nick's
 * language: hours, mistakes, fees. No invented numbers beyond the one real
 * timing we can stand behind (16A's memo, 12 minutes). Every line ≤ 15 words.
 */
const COLS = [
  {
    head: 'hours back this week',
    body: '16A’s consent memo, drafted in 12 minutes. same quality. review, edit, send.',
  },
  {
    head: 'mistakes caught early',
    body: 'Building Code + unitary plan + Te Aranga checked every reply. flagged before council does.',
  },
  {
    head: 'fees you keep',
    body: 'less admin write-off. faster fee proposals. tighter invoice cycles.',
  },
] as const;

export function SaveTimeMoney() {
  return (
    <section aria-label="What ARC saves you" className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-black/5 bg-black/5 md:grid-cols-3">
        {COLS.map((c) => (
          <div key={c.head} className="flex flex-col gap-2 bg-white p-6">
            <h3
              className="font-[family-name:var(--font-brand-display)] text-sm font-semibold lowercase tracking-wide"
              style={{ color: '#161516' }}
            >
              {c.head}
            </h3>
            <p className="text-[13px] leading-relaxed" style={{ color: '#363a35' }}>
              {c.body}
            </p>
          </div>
        ))}
      </div>
      <p className="text-[12px] leading-relaxed" style={{ color: '#6f6f64' }}>
        draft-mode until you flip it. everything runs past you first. nothing
        sent, nothing lodged, nothing filed without your yes.
      </p>
    </section>
  );
}
