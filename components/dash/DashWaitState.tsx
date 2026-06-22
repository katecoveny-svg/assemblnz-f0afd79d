import { Check } from 'lucide-react';

/**
 * The animated ad loop, recreated from `Dash Launch Campaign.html`.
 *
 * A faux app loading card: the dog's body segments fill forest left -> right
 * (`dash-ad-seg`), an NZ-brand message renders in the gap (`dash-ad-msg`), then
 * a publisher reward chip pops (`dash-ad-reward`). One 6s CSS loop; respects
 * reduced-motion (shows the filled static state).
 */
export function DashWaitState() {
  return (
    <div className="d-card relative mx-auto w-full max-w-[420px] overflow-hidden p-5">
      {/* faux app chrome */}
      <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: 'var(--line)' }}>
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--sage)' }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--sage-pale)' }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--sage-pale)' }} />
        </span>
        <span className="d-body text-[13px]">yourapp.co.nz · generating your report</span>
        <span className="d-pill d-pill--gold ml-auto" style={{ fontSize: 12, padding: '4px 11px' }}>
          dash
        </span>
      </div>

      {/* the loader dog */}
      <div className="relative grid place-items-center py-7">
        <svg viewBox="0 0 1040 470" className="w-full max-w-[320px]" fill="none" role="img" aria-label="dash loader filling">
          <ellipse cx="560" cy="432" rx="372" ry="20" fill="#3a3832" opacity="0.1" />
          <path d="M206 250 C 158 252 128 228 120 190" stroke="#3a3832" strokeWidth="26" strokeLinecap="round" />
          <rect x="214" y="298" width="48" height="118" rx="22" fill="#3a3832" />
          <rect x="650" y="298" width="48" height="118" rx="22" fill="#3a3832" />
          <rect x="185" y="206" width="548" height="128" rx="22" fill="#3a3832" />
          {/* the four yellow fill segments (no hazard seams) */}
          <g>
            <rect className="dash-ad-seg" x="296" y="206" width="92.75" height="128" />
            <rect className="dash-ad-seg" x="397.75" y="206" width="92.75" height="128" />
            <rect className="dash-ad-seg" x="499.5" y="206" width="92.75" height="128" />
            <rect className="dash-ad-seg" x="601.25" y="206" width="92.75" height="128" />
          </g>
          <rect x="712" y="156" width="150" height="178" rx="52" fill="#3a3832" />
          <rect x="842" y="214" width="156" height="84" rx="34" fill="#3a3832" />
          <path
            d="M768 166 C 732 168 714 204 718 250 C 720 290 740 320 776 322 C 812 320 822 290 822 248 C 822 202 804 166 768 166 Z"
            fill="#3a3832"
            stroke="#fffdf5"
            strokeWidth="7"
          />
          <rect x="962" y="222" width="38" height="48" rx="19" fill="#3a3832" />
          <circle cx="838" cy="200" r="13" fill="#fffdf5" />
        </svg>
      </div>

      {/* the NZ-brand message rendered in the gap */}
      <div
        className="dash-ad-msg flex items-center gap-3 rounded-[var(--r-md)] p-3"
        style={{ background: 'var(--sage-pale)' }}
      >
        <span className="d-icon-badge" style={{ width: 40, height: 40 }} aria-hidden>
          <span className="d-serif text-[18px] font-semibold">A</span>
        </span>
        <span className="d-body text-[13px]" style={{ color: 'var(--fg)' }}>
          <strong className="font-bold">Aotea Made</strong> · proudly crafted in Aotearoa →
        </span>
      </div>

      {/* reward chip */}
      <div className="mt-3 flex items-center justify-between">
        <span className="d-body text-[12px]">Wait monetised</span>
        <span
          className="dash-ad-reward d-pill d-pill--gold inline-flex items-center gap-1.5"
          style={{ fontSize: 13 }}
        >
          <Check className="h-3.5 w-3.5" aria-hidden /> publisher earned · 55%
        </span>
      </div>
    </div>
  );
}
