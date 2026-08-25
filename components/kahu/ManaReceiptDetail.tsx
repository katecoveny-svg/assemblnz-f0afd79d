/**
 * ManaReceiptDetail — full evidence-pack view for one voice call.
 *
 * Presentational only: the page fetches the `mana_receipt` row (payload +
 * hash chain) and its `kete_session`, then hands them here. Renders consent,
 * booking, the tool-call timeline, privacy coverage, the hash chain, and a
 * recording player.
 *
 * Voice rule: the plain term ("evidence pack — a downloadable bundle of PDFs")
 * is shown in the subtitle so the depth term "Mana Receipt" reads as a label.
 */
import type { KeteSession, VoiceManaReceipt } from '@/lib/voice/types';

export interface ManaReceiptDetailProps {
  receipt: VoiceManaReceipt & { receipt_number: number; created_at: string; pdf_uri: string | null };
  session: KeteSession | null;
}

const NZ_FULL = new Intl.DateTimeFormat('en-NZ', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Pacific/Auckland',
});

function fmt(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? NZ_FULL.format(d) : iso;
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-6">
      <p className="font-mono text-eyebrow uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
        {eyebrow}
      </p>
      {title && (
        <h2 className="mt-2 font-display text-display-md font-light leading-tight text-[color:var(--text-primary)]">
          {title}
        </h2>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
        {label}
      </dt>
      <dd className="mt-1 text-body-md text-[color:var(--text-body)]">{value}</dd>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgba(35,33,31,0.14)] px-2.5 py-0.5 font-mono text-[12px] uppercase tracking-[0.10em] text-[color:var(--text-body)]">
      {children}
    </span>
  );
}

export function ManaReceiptDetail({ receipt, session }: ManaReceiptDetailProps) {
  const { payload, sha256, prev_hash, chain_hash, pdf_uri, receipt_number } = receipt;
  const consent = payload.consent;
  const booking = payload.booking;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-[color:var(--text-primary)] lg:py-16">
      {/* Header */}
      <header className="mb-10">
        <p className="font-mono text-eyebrow uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          Internal · Kahu · evidence pack
        </p>
        <h1 className="mt-3 font-display text-display-lg font-light leading-tight">
          Mana Receipt #{receipt_number}
        </h1>
        <p className="mt-3 max-w-2xl text-body-md text-[color:var(--text-body)]">
          The evidence pack for this call — a downloadable bundle of PDFs covering
          consent, the booking, every tool the agent called, and a tamper-evident
          hash chain.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={pdf_uri ?? undefined}
            aria-disabled={!pdf_uri}
            className={
              pdf_uri
                ? 'inline-flex items-center rounded-pill bg-[color:var(--assembl-pounamu)] px-5 py-2.5 text-sm font-medium text-[color:var(--assembl-paper)] transition-colors hover:bg-[color:var(--assembl-pounamu-deep)]'
                : 'inline-flex cursor-not-allowed items-center rounded-pill bg-[rgba(35,33,31,0.08)] px-5 py-2.5 text-sm font-medium text-[color:var(--text-secondary)]'
            }
            {...(pdf_uri ? { download: true } : {})}
          >
            {pdf_uri ? 'Download PDF' : 'PDF not generated yet'}
          </a>
          <span className="font-mono text-[12px] text-[color:var(--text-secondary)]">
            {fmt(receipt.created_at)}
          </span>
        </div>
      </header>

      <div className="grid gap-5">
        {/* Call summary */}
        <Section eyebrow="Call">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Status" value={payload.status.replace('_', ' ')} />
            <Field
              label="Caller"
              value={
                <span className="font-mono">{payload.caller_number_masked || '—'}</span>
              }
            />
            <Field label="Started" value={fmt(payload.started_at)} />
            <Field label="Ended" value={fmt(payload.ended_at)} />
            <Field label="Agent" value={`${payload.agent} · ${payload.agent_version}`} />
            <Field
              label="Call SID"
              value={<span className="font-mono text-sm break-all">{payload.call_sid}</span>}
            />
          </dl>
        </Section>

        {/* Consent */}
        <Section eyebrow="Consent">
          {consent ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[12px] uppercase tracking-[0.12em]"
                  style={
                    consent.granted
                      ? { background: 'rgba(58,56,50,0.10)', color: 'var(--assembl-pounamu)' }
                      : { background: 'rgba(172,88,56,0.10)', color: 'var(--assembl-clay)' }
                  }
                >
                  {consent.granted ? 'granted ✓' : 'declined'}
                </span>
                <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                  captured via {consent.captured_method}
                </span>
              </div>
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                  Prompt
                </p>
                <p className="mt-1 text-body-md text-[color:var(--text-body)]">
                  “{consent.prompt_text}”
                </p>
              </div>
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                  Verbatim response
                </p>
                <p className="mt-1 rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-[rgba(35,33,31,0.02)] p-3 font-display text-lg italic text-[color:var(--text-primary)]">
                  “{consent.response_text}”
                </p>
              </div>
              {/* Consent timestamp is the load-bearing fact — highlight it. */}
              <div className="inline-flex items-center gap-2 rounded-[10px] border border-[rgba(58,56,50,0.30)] bg-[color:var(--assembl-pounamu-paper)] px-3 py-2">
                <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                  Consent captured
                </span>
                <span className="font-mono text-sm text-[color:var(--assembl-pounamu)]">
                  {fmt(consent.ts)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-body-md text-[color:var(--text-secondary)]">
              No consent recorded for this call.
            </p>
          )}
        </Section>

        {/* Booking */}
        <Section eyebrow="Booking">
          {booking ? (
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Date" value={booking.date} />
              <Field label="Time" value={booking.time} />
              <Field
                label="Party size"
                value={`${booking.party_size} guest${booking.party_size === 1 ? '' : 's'}`}
              />
              <Field
                label="Booking ID"
                value={<span className="font-mono text-sm break-all">{booking.booking_id}</span>}
              />
            </dl>
          ) : (
            <p className="text-body-md text-[color:var(--text-secondary)]">
              No booking was made on this call.
            </p>
          )}
        </Section>

        {/* SMS / transfer status */}
        <Section eyebrow="Follow-up">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Confirmation SMS"
              value={payload.sms_sent ? 'Sent' : 'Not sent'}
            />
            <Field
              label="Transferred to a human"
              value={payload.transferred ? 'Yes' : 'No'}
            />
          </dl>
        </Section>

        {/* Tool-call timeline */}
        <Section eyebrow="Tool calls">
          {payload.tool_calls.length === 0 ? (
            <p className="text-body-md text-[color:var(--text-secondary)]">
              No tools were called on this call.
            </p>
          ) : (
            <ol className="relative space-y-4 border-l border-[rgba(35,33,31,0.12)] pl-5">
              {payload.tool_calls.map((tc, i) => (
                <li key={`${tc.tool}-${tc.ts}-${i}`} className="relative">
                  <span
                    className="absolute -left-[1.4rem] top-1.5 block h-2 w-2 rounded-full"
                    style={{
                      background: tc.ok ? 'var(--assembl-pounamu)' : 'var(--assembl-clay)',
                    }}
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-mono text-sm font-medium text-[color:var(--text-primary)]">
                      {tc.tool}
                    </span>
                    <span className="font-mono text-[12px] text-[color:var(--text-secondary)]">
                      {fmt(tc.ts)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--text-body)]">
                    {tc.result_summary}
                  </p>
                  <span
                    className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[12px] uppercase tracking-[0.12em]"
                    style={
                      tc.ok
                        ? { background: 'rgba(58,56,50,0.10)', color: 'var(--assembl-pounamu)' }
                        : { background: 'rgba(172,88,56,0.10)', color: 'var(--assembl-clay)' }
                    }
                  >
                    {tc.ok ? 'ok' : 'failed'}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Section>

        {/* Recording */}
        <Section eyebrow="Recording">
          {session?.recording_uri ? (
            <audio controls preload="none" className="w-full" src={session.recording_uri}>
              Your browser doesn’t support inline audio.{' '}
              <a href={session.recording_uri} className="underline">
                Download the recording
              </a>
              .
            </audio>
          ) : (
            <p className="text-body-md text-[color:var(--text-secondary)]">
              No recording (consent declined / message-only).
            </p>
          )}
        </Section>

        {/* Privacy */}
        <Section eyebrow="Privacy · Privacy Act 2020">
          <dl className="grid grid-cols-1 gap-5">
            <Field label="Retention class" value={payload.privacy.retention_class} />
            <div>
              <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                IPPs satisfied
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {payload.privacy.ipps_satisfied.length === 0 ? (
                  <span className="text-[color:var(--text-secondary)]">—</span>
                ) : (
                  payload.privacy.ipps_satisfied.map((ipp) => <Chip key={ipp}>{ipp}</Chip>)
                )}
              </dd>
            </div>
          </dl>
        </Section>

        {/* Chain integrity */}
        <Section eyebrow="Chain integrity">
          <p className="mb-4 text-sm text-[color:var(--text-secondary)]">
            Each receipt is hashed and linked to the one before it. Change a single
            field and the hashes stop matching — that’s how tampering shows up.
          </p>
          <dl className="space-y-3">
            <Field
              label="sha256 (this payload)"
              value={
                <code className="block break-all font-mono text-xs text-[color:var(--text-body)]">
                  {sha256}
                </code>
              }
            />
            <Field
              label="prev_hash (link back)"
              value={
                <code className="block break-all font-mono text-xs text-[color:var(--text-body)]">
                  {prev_hash}
                </code>
              }
            />
            <Field
              label="chain_hash (this link)"
              value={
                <code className="block break-all font-mono text-xs text-[color:var(--text-body)]">
                  {chain_hash}
                </code>
              }
            />
          </dl>
        </Section>
      </div>
    </main>
  );
}
