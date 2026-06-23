/**
 * ManaReceiptCard — a single row in the Kahu evidence-pack list.
 *
 * Presentational only: no data fetching. The page passes a compact summary
 * built from a `mana_receipt` row (its `VoiceReceiptPayload`) plus the linked
 * call status. The whole row links through to the detail page.
 *
 * Voice rule: the plain term ("evidence pack" / "receipt") is established on
 * the list page heading; here the per-item label may use "Mana Receipt #N".
 */
import Link from 'next/link';
import type { CallStatus, VoiceReceiptPayload } from '@/lib/voice/types';

export interface ManaReceiptCardSummary {
  /** mana_receipt.id — used to build the detail link. */
  id: string;
  receipt_number: number;
  call_sid: string;
  created_at: string;
  /** Call status, preferring the live kete_session status, else the payload. */
  status: CallStatus;
  booking: VoiceReceiptPayload['booking'];
  consent_granted: boolean | null;
  transferred: boolean;
  sms_sent: boolean;
  pdf_uri: string | null;
}

/** Status pill colour, on-brand. completed → pounamu, failures → clay. */
const STATUS_STYLE: Record<CallStatus, { bg: string; fg: string }> = {
  ringing: { bg: 'rgba(199,155,31,0.12)', fg: 'var(--assembl-gold-thread)' },
  in_progress: { bg: 'rgba(199,155,31,0.12)', fg: 'var(--assembl-gold-thread)' },
  completed: { bg: 'rgba(58,56,50,0.10)', fg: 'var(--assembl-pounamu)' },
  transferred: { bg: 'rgba(59,124,181,0.12)', fg: '#3B7CB5' },
  voicemail: { bg: 'rgba(91,80,73,0.10)', fg: 'var(--text-secondary)' },
  failed: { bg: 'rgba(172,88,56,0.10)', fg: 'var(--assembl-clay)' },
};

const NZ_DATE = new Intl.DateTimeFormat('en-NZ', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Pacific/Auckland',
});

function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? NZ_DATE.format(d) : iso;
}

/** "Booking — 4 guests, Fri 20 Jun 7:00pm" or "No booking". */
export function bookingSummary(booking: VoiceReceiptPayload['booking']): string {
  if (!booking) return 'No booking';
  const guests = `${booking.party_size} guest${booking.party_size === 1 ? '' : 's'}`;
  const when = formatBookingWhen(booking.date, booking.time);
  return `Booking — ${guests}${when ? `, ${when}` : ''}`;
}

function formatBookingWhen(date: string, time: string): string {
  // date is ISO "YYYY-MM-DD", time is "HH:mm" 24h local.
  const dt = new Date(`${date}T${time}:00+12:00`);
  if (!Number.isFinite(dt.getTime())) return `${date} ${time}`.trim();
  return new Intl.DateTimeFormat('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Pacific/Auckland',
  })
    .format(dt)
    .replace(/\s?([ap])m/i, (_m, p) => `${p.toLowerCase()}m`);
}

function Badge({
  tone,
  children,
}: {
  tone: 'pounamu' | 'clay' | 'muted';
  children: React.ReactNode;
}) {
  const styles = {
    pounamu: { bg: 'rgba(58,56,50,0.10)', fg: 'var(--assembl-pounamu)' },
    clay: { bg: 'rgba(172,88,56,0.10)', fg: 'var(--assembl-clay)' },
    muted: { bg: 'rgba(91,80,73,0.08)', fg: 'var(--text-secondary)' },
  }[tone];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]"
      style={{ background: styles.bg, color: styles.fg }}
    >
      {children}
    </span>
  );
}

export function ManaReceiptCard({ receipt }: { receipt: ManaReceiptCardSummary }) {
  const status = STATUS_STYLE[receipt.status] ?? STATUS_STYLE.completed;

  return (
    <Link
      href={`/internal/kahu/receipts/${receipt.id}`}
      className="block rounded-[14px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-5 transition-all hover:border-[rgba(58,56,50,0.35)] hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xl font-light leading-snug text-[color:var(--text-primary)]">
            Mana Receipt #{receipt.receipt_number}
          </p>
          <p className="mt-1 font-mono text-[11px] text-[color:var(--text-secondary)]">
            {formatTime(receipt.created_at)} · {receipt.call_sid.slice(0, 12)}…
          </p>
        </div>
        <span
          className="flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]"
          style={{ background: status.bg, color: status.fg }}
        >
          {receipt.status.replace('_', ' ')}
        </span>
      </div>

      <p className="mt-3 text-body-md text-[color:var(--text-body)]">
        {bookingSummary(receipt.booking)}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {receipt.consent_granted === true && <Badge tone="pounamu">consent ✓</Badge>}
        {receipt.consent_granted === false && <Badge tone="clay">consent declined</Badge>}
        {receipt.consent_granted === null && <Badge tone="muted">no consent record</Badge>}
        {receipt.transferred && <Badge tone="muted">transferred</Badge>}
        {receipt.sms_sent && <Badge tone="muted">SMS sent</Badge>}
        {receipt.pdf_uri && <Badge tone="muted">PDF ready</Badge>}
      </div>
    </Link>
  );
}
