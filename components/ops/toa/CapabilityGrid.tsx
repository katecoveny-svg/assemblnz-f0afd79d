import type {
  ClientUpdateDraft,
  ConsentApplication,
  Consultant,
  FeeProposal,
  ProducerStatement,
  SiteVisitReport,
} from '@/lib/customers/toa-architects/demo-data';

/**
 * CapabilityGrid — the six things ARC does, shown not told.
 *
 * Kate's standard: visual first, minimal words, real functions in plain
 * English. Every tile is (line icon) + (name) + (one functional sentence) +
 * (a working visual of the actual output). No AI faff anywhere.
 *
 * Icons are bespoke line drawings — 1.5px stroke, geometric, monochrome
 * charcoal — matching TOA's aesthetic. Status colours are muted architectural
 * tones, not traffic-light neon.
 */
const GREEN = '#3e7a52';
const AMBER = '#b98a2e';
const RED = '#a4432e';
const STATUS: Record<ConsentApplication['status'], string> = {
  green: GREEN,
  amber: AMBER,
  red: RED,
};

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/* ---------------------------- line icons ----------------------------
   Exported so the /demo hub's docked tray reuses the same drawings. */

export const IconStamp = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" {...stroke} aria-hidden>
    <path d="M9 11V6.5a3 3 0 1 1 6 0V11" />
    <path d="M6 11h12l1 4H5l1-4Z" />
    <path d="M4 19h16" />
  </svg>
);

export const IconPage = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" {...stroke} aria-hidden>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M15 3v4h4" />
    <rect x="8.5" y="10" width="4" height="3.5" />
    <path d="M14.5 10.8h3M14.5 12.6h3M8.5 16.4h9M8.5 18.2h6" />
  </svg>
);

export const IconNodes = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" {...stroke} aria-hidden>
    <circle cx="12" cy="12" r="2.4" />
    <circle cx="4.5" cy="6" r="1.8" />
    <circle cx="19.5" cy="6" r="1.8" />
    <circle cx="4.5" cy="18" r="1.8" />
    <circle cx="19.5" cy="18" r="1.8" />
    <path d="M6 7.2 10 10.6M18 7.2 14 10.6M6 16.8 10 13.4M18 16.8 14 13.4" />
  </svg>
);

export const IconBars = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" {...stroke} aria-hidden>
    <path d="M4 4v16h16" />
    <path d="M8 16.5h6M8 12.5h9M8 8.5h4" />
  </svg>
);

export const IconSeal = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" {...stroke} aria-hidden>
    <circle cx="12" cy="9.5" r="5" />
    <path d="m9.8 9.7 1.6 1.6 3-3.2" />
    <path d="M9.5 13.8 8 21l4-2.2L16 21l-1.5-7.2" />
  </svg>
);

export const IconMic = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" {...stroke} aria-hidden>
    <rect x="9.5" y="3" width="5" height="9" rx="2.5" />
    <path d="M6 10.5a6 6 0 0 0 12 0" />
    <path d="M12 16.5V20M9 20h6" />
  </svg>
);

/* --------------------------- tile chrome ----------------------------- */

function Tile({
  icon,
  name,
  blurb,
  children,
}: {
  icon: React.ReactNode;
  name: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5 transition hover:border-[color:var(--brand-accent)]/35">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[color:var(--brand-ink)]">{icon}</span>
        <div>
          <h3 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-ink)]">
            {name}
          </h3>
          <p className="mt-1 text-[13px] leading-snug text-[color:var(--brand-muted)]">
            {blurb}
          </p>
        </div>
      </div>
      <div className="mt-auto">{children}</div>
    </article>
  );
}

/* ------------------------- embedded visuals -------------------------- */

function ConsentPortalCard({ consents }: { consents: ConsentApplication[] }) {
  return (
    <div className="rounded-xl border border-black/10 bg-[color:var(--brand-bg)] p-3 text-[11px]">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[color:var(--brand-muted)]">
        <span>council portals</span>
        <span>demo</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {consents.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-2 rounded-lg bg-[color:var(--brand-surface)] px-2.5 py-1.5"
          >
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: STATUS[c.status] }}
            />
            <span className="min-w-0 flex-1 truncate text-[color:var(--brand-ink)]">
              {c.project}
            </span>
            <span className="shrink-0 text-[10px] text-[color:var(--brand-muted)]">
              {c.portal} · {c.daysInStage}d
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UpdatePdfPreview({
  update,
  photos,
}: {
  update: ClientUpdateDraft;
  photos: readonly string[];
}) {
  return (
    <div className="relative rounded-xl border border-black/10 bg-[color:var(--brand-bg)] p-3">
      {/* the mock page */}
      <div className="mx-auto w-full max-w-[240px] rounded-sm border border-black/10 bg-white px-3 py-2.5 shadow-sm">
        <p className="text-[8px] uppercase tracking-[0.18em] text-black/40">
          weekly update · wk ending {update.weekEnding.slice(8, 10)}/{update.weekEnding.slice(5, 7)}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-black">
          {update.project}
        </p>
        {/* photo strip — the project's actual massing + interior studies */}
        <div className="mt-1.5 grid grid-cols-4 gap-1">
          {photos.slice(0, 4).map((src) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-[2px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail inside a mock PDF page; next/image adds nothing at 55px */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <p className="mt-1 text-[7px] text-black/45">
          {update.photosThisWeek} project images this week
        </p>
        <p className="mt-1.5 text-[8px] font-semibold text-black/70">Decisions</p>
        {update.decisionsMade.slice(0, 2).map((d) => (
          <p key={d} className="truncate text-[8px] leading-tight text-black/55">
            · {d}
          </p>
        ))}
        <p className="mt-1.5 text-[8px] font-semibold text-black/70">Next week</p>
        <p className="text-[8px] leading-tight text-black/55">{update.nextWeek}</p>
        <p className="mt-1.5 text-[7px] italic text-black/40">
          draft — reviewed by your architect before it goes anywhere
        </p>
      </div>
      <span className="absolute right-2 top-2 rounded bg-black/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[color:var(--brand-muted)]">
        pdf draft
      </span>
    </div>
  );
}

function ConsultantWeb({ consultants }: { consultants: Consultant[] }) {
  const DOT: Record<Consultant['status'], string> = {
    current: GREEN,
    chasing: AMBER,
    overdue: RED,
  };
  return (
    <div className="rounded-xl border border-black/10 bg-[color:var(--brand-bg)] p-3 text-[11px]">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[color:var(--brand-muted)]">
        <span>who owes what</span>
        <span>demo</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {consultants.map((k) => (
          <li
            key={k.id}
            className="flex items-center gap-2 rounded-lg bg-[color:var(--brand-surface)] px-2.5 py-1.5"
          >
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: DOT[k.status] }}
            />
            <span className="min-w-0 flex-1 truncate">
              <span className="text-[color:var(--brand-ink)]">{k.firm}</span>
              <span className="text-[color:var(--brand-muted)]"> · {k.discipline}</span>
            </span>
            <span className="shrink-0 text-[10px] text-[color:var(--brand-muted)]">
              {k.outstanding ? 'chase drafted' : 'up to date'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeeBreakdownChart({ proposal }: { proposal: FeeProposal }) {
  const max = Math.max(...proposal.phases.map((p) => p.fee));
  return (
    <div className="rounded-xl border border-black/10 bg-[color:var(--brand-bg)] p-3 text-[11px]">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[color:var(--brand-muted)]">
        <span>
          {proposal.project} · ${proposal.total.toLocaleString('en-NZ')} (demo)
        </span>
        <span>NZIA basis</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {proposal.phases.map((p) => (
          <div key={p.phase} className="flex items-center gap-2">
            <span className="w-24 shrink-0 truncate text-[10px] text-[color:var(--brand-muted)]">
              {p.phase}
            </span>
            <span className="relative h-3.5 flex-1 overflow-hidden rounded-sm bg-black/5">
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{
                  width: `${(p.fee / max) * 100}%`,
                  backgroundColor: 'var(--brand-accent)',
                  opacity: 0.85,
                }}
              />
            </span>
            <span className="w-14 shrink-0 text-right text-[10px] text-[color:var(--brand-ink)]">
              ${(p.fee / 1000).toFixed(1)}k
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-[color:var(--brand-muted)]">
        letter + spreadsheet drafted in the practice&apos;s own template
      </p>
    </div>
  );
}

function PsTrack({ statements }: { statements: ProducerStatement[] }) {
  const DOT: Record<ProducerStatement['status'], string> = {
    received: GREEN,
    chasing: AMBER,
    'not yet due': '#9aa096',
  };
  return (
    <div className="rounded-xl border border-black/10 bg-[color:var(--brand-bg)] p-3 text-[11px]">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[color:var(--brand-muted)]">
        <span>on the path to CCC</span>
        <span>demo</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {statements.map((ps) => (
          <li
            key={ps.id}
            className="flex items-center gap-2 rounded-lg bg-[color:var(--brand-surface)] px-2.5 py-1.5"
          >
            <span
              className="w-9 shrink-0 rounded border border-black/10 px-1 text-center text-[9px] font-semibold text-[color:var(--brand-ink)]"
            >
              {ps.kind}
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="text-[color:var(--brand-ink)]">{ps.project}</span>
              <span className="text-[color:var(--brand-muted)]"> · {ps.discipline}</span>
            </span>
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: DOT[ps.status] }}
            />
            <span className="w-16 shrink-0 text-right text-[10px] text-[color:var(--brand-muted)]">
              {ps.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VoiceToReport({ visit }: { visit: SiteVisitReport }) {
  // Static waveform — heights hand-picked so it reads as speech, not noise.
  const wave = [4, 9, 14, 8, 16, 11, 6, 13, 17, 9, 5, 12, 15, 7, 10, 14, 6, 11, 8, 4];
  return (
    <div className="rounded-xl border border-black/10 bg-[color:var(--brand-bg)] p-3 text-[11px]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 flex-1 items-center gap-[2px] overflow-hidden rounded-lg bg-[color:var(--brand-surface)] px-2">
          {wave.map((h, i) => (
            <span
              key={i}
              aria-hidden
              className="w-[3px] shrink-0 rounded-full"
              style={{ height: h, backgroundColor: 'var(--brand-accent)', opacity: 0.7 }}
            />
          ))}
        </span>
        <span className="shrink-0 text-[10px] text-[color:var(--brand-muted)]">
          {Math.floor(visit.memoSeconds / 60)}:{String(visit.memoSeconds % 60).padStart(2, '0')} memo
        </span>
        <span aria-hidden className="shrink-0 text-[color:var(--brand-muted)]">→</span>
      </div>
      <div className="mt-2 rounded-lg bg-[color:var(--brand-surface)] px-2.5 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--brand-ink)]">
          Site visit report · {visit.project}
        </p>
        <p className="mt-0.5 text-[10px] text-[color:var(--brand-muted)]">
          {visit.date} · {visit.weather} · photos attached
        </p>
        <p className="mt-1 truncate text-[10px] text-[color:var(--brand-ink)]">
          Defect: {visit.defects[0].item} — {visit.defects[0].action}
        </p>
        <p className="truncate text-[10px] text-[color:var(--brand-ink)]">
          Decision: {visit.decisions[0]}
        </p>
        <p className="mt-1 text-[9px] text-[color:var(--brand-muted)]">
          drafted for review · goes to {visit.distribution.join(', ').toLowerCase()}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ the grid ----------------------------- */

export function CapabilityGrid({
  consents,
  update,
  updatePhotos,
  consultants,
  proposal,
  statements,
  visit,
}: {
  consents: ConsentApplication[];
  update: ClientUpdateDraft;
  updatePhotos: readonly string[];
  consultants: Consultant[];
  proposal: FeeProposal;
  statements: ProducerStatement[];
  visit: SiteVisitReport;
}) {
  return (
    <section aria-label="What ARC does">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-ink)]">
          What ARC does
        </h2>
        <span className="text-xs text-[color:var(--brand-muted)]">
          six jobs · plain English · all drafts
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Tile
          icon={<IconStamp />}
          name="Consent Companion"
          blurb="drafts building consent applications, tracks council responses, drafts RFI answers and flags stuck applications."
        >
          <ConsentPortalCard consents={consents} />
        </Tile>

        <Tile
          icon={<IconPage />}
          name="Weekly Client Update"
          blurb="every Friday, drafts a client update per project — site photos, decisions made, next week's plan, contractor status."
        >
          <UpdatePdfPreview update={update} photos={updatePhotos} />
        </Tile>

        <Tile
          icon={<IconNodes />}
          name="Consultant Orchestrator"
          blurb="knows which consultants are on which project, chases outstanding information and keeps the document schedule alive."
        >
          <ConsultantWeb consultants={consultants} />
        </Tile>

        <Tile
          icon={<IconBars />}
          name="Fee Proposal"
          blurb="drafts fee proposals from a client brief — hours across each phase, letter and spreadsheet in the practice's brand."
        >
          <FeeBreakdownChart proposal={proposal} />
        </Tile>

        <Tile
          icon={<IconSeal />}
          name="Producer Statement Chaser"
          blurb="tracks the PS1s and PS3s the Code Compliance Certificate needs, and chases the right consultant at the right stage."
        >
          <PsTrack statements={statements} />
        </Tile>

        <Tile
          icon={<IconMic />}
          name="Site Visit Report"
          blurb="turns a voice memo recorded on site into a structured report — dates, defects, decisions, photos — sent to the right people."
        >
          <VoiceToReport visit={visit} />
        </Tile>
      </div>
    </section>
  );
}
