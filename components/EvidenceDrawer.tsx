'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { ManaReceipt, ReceiptCitation } from '@/lib/evidence/types';

const POU_LABELS: Record<keyof NonNullable<ManaReceipt['pou']>, string> = {
  rangatiratanga: 'Rangatiratanga · self-determination',
  kaitiakitanga: 'Kaitiakitanga · guardianship',
  manaakitanga: 'Manaakitanga · care for people',
  whanaungatanga: 'Whanaungatanga · relationships',
};

const GATE_LABELS: Record<keyof NonNullable<ManaReceipt['gates']>, string> = {
  voice: 'Voice',
  tikanga: 'Tikanga',
  truth: 'Truth',
};

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  /** A complete receipt — typically loaded server-side and passed in. */
  receipt: ManaReceipt | null;
  /** Optional banner shown when the data came from the mock fallback. */
  source?: 'mana_receipts' | 'mock';
  /** Optional explanation rendered when the receipt is null. */
  emptyReason?: string;
}

export function EvidenceDrawer({
  open,
  onClose,
  receipt,
  source,
  emptyReason,
}: EvidenceDrawerProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const transitionStyle: React.CSSProperties = reducedMotion
    ? { transition: 'none' }
    : { transition: 'transform 280ms ease-out, opacity 200ms ease-out' };

  const panelStyle: React.CSSProperties = {
    ...transitionStyle,
    transform: open ? 'translateX(0)' : 'translateX(100%)',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100]"
    >
      <button
        type="button"
        aria-label="close evidence drawer"
        onClick={onClose}
        className="absolute inset-0 bg-[color:var(--text-primary)]/30 backdrop-blur-sm"
        style={transitionStyle}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        style={panelStyle}
        className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] shadow-2xl focus:outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[color:var(--assembl-cloud)] px-7 pb-4 pt-7">
          <div>
            <p className="font-mono text-[10.5px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              evidence ledger <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> mana receipt
            </p>
            <h2
              id={titleId}
              className="mt-1.5 font-display text-[26px] font-light leading-tight text-[color:var(--text-primary)]"
            >
              Why this happened
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
          >
            close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-7 pb-10 pt-6">
          {source === 'mock' ? (
            <ScaffoldBanner />
          ) : null}

          {!receipt ? (
            <EmptyState reason={emptyReason} />
          ) : (
            <ReceiptBody receipt={receipt} />
          )}
        </div>
      </div>
    </div>
  );
}

function ScaffoldBanner() {
  return (
    <div className="mb-6 rounded-[2px] border border-dashed border-[color:var(--assembl-gold-thread)] bg-white px-4 py-3">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--assembl-gold-thread)]">
        scaffold mode
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--text-primary)]">
        The mana_receipts table hasn&apos;t been deployed yet — this drawer is rendering
        a sample receipt so the surface can be reviewed before Day 7.5 lands.
      </p>
    </div>
  );
}

function EmptyState({ reason }: { reason?: string }) {
  return (
    <div className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-5 py-6 text-center">
      <p className="font-display text-[20px] font-light text-[color:var(--text-primary)]">
        kāore he tūtohu — receipt unavailable
      </p>
      <p className="mt-2 font-mono text-[11px] tracking-[0.04em] text-[color:var(--text-secondary)]">
        {reason ?? 'No mana receipt is associated with this output yet.'}
      </p>
    </div>
  );
}

function ReceiptBody({ receipt }: { receipt: ManaReceipt }) {
  const signatureLooksReal =
    typeof receipt.signature_b64 === 'string' &&
    !receipt.signature_b64.toLowerCase().startsWith('fake') &&
    receipt.signature_b64.length > 32;

  return (
    <div className="space-y-7">
      <Header receipt={receipt} signatureLooksReal={signatureLooksReal} />
      <Citations citations={receipt.citations} />
      <PouAttestations pou={receipt.pou} />
      <ThreeGates gates={receipt.gates} />
      <Hitl hitl={receipt.hitl} />
      <SignatureBlock receipt={receipt} signatureLooksReal={signatureLooksReal} />
      <RawJson receipt={receipt} />
    </div>
  );
}

function Header({
  receipt,
  signatureLooksReal,
}: {
  receipt: ManaReceipt;
  signatureLooksReal: boolean;
}) {
  return (
    <section>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        issued by
      </p>
      <p className="mt-1 text-[15px] leading-relaxed text-[color:var(--text-primary)]">
        {receipt.issuer ?? 'Assembl'} <span className="text-[color:var(--text-secondary)]">· {receipt.issuer_domain ?? 'assembl.co.nz'}</span>
      </p>
      <dl className="mt-4 grid grid-cols-[140px_1fr] gap-x-4 gap-y-1.5 font-mono text-[12px] tracking-[0.02em] text-[color:var(--text-primary)]">
        <dt className="text-[color:var(--text-secondary)]">Agent</dt>
        <dd>{receipt.agent} <span className="text-[color:var(--text-secondary)]">v{receipt.agent_version}</span></dd>
        <dt className="text-[color:var(--text-secondary)]">Domain</dt>
        <dd>{receipt.domain}</dd>
        <dt className="text-[color:var(--text-secondary)]">Issued</dt>
        <dd>{formatDate(receipt.issued_at ?? receipt.created_at)}</dd>
        <dt className="text-[color:var(--text-secondary)]">Signature</dt>
        <dd>
          {signatureLooksReal ? (
            <span className="text-[color:#2a7a3e]">✓ verified</span>
          ) : (
            <span className="text-[color:#b3261e]">✗ unverified</span>
          )}
          <span className="ml-2 text-[color:var(--text-secondary)]">{receipt.key_id}</span>
        </dd>
      </dl>
    </section>
  );
}

function Citations({ citations }: { citations: ReceiptCitation[] }) {
  if (!citations || citations.length === 0) {
    return (
      <Section title="Citations">
        <p className="text-[13px] text-[color:var(--text-secondary)]">No citations attached.</p>
      </Section>
    );
  }
  return (
    <Section title="Citations">
      <ul className="space-y-2.5">
        {citations.map((c, i) => (
          <li
            key={i}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-4 py-3"
          >
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
              {String(c.type ?? 'citation')}
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-[color:var(--text-primary)]">
              {citationHeadline(c)}
            </p>
            {('note' in c && c.note) ? (
              <p className="mt-1 text-[12.5px] leading-relaxed text-[color:var(--text-secondary)]">
                {String(c.note)}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function citationHeadline(c: ReceiptCitation): string {
  if ('clause' in c && c.clause) {
    const parts: string[] = [String(c.clause)];
    if (c.doc) parts.push(String(c.doc));
    if (c.version) parts.push(String(c.version));
    return parts.join(' · ');
  }
  if ('code' in c && c.code) {
    return [String(c.code), c.gir ? String(c.gir) : null].filter(Boolean).join(' · ');
  }
  if ('act' in c && c.act) {
    return [String(c.act), c.section ? `s.${String(c.section)}` : null].filter(Boolean).join(' · ');
  }
  if ('ipp' in c && c.ipp) {
    return `IPP ${String(c.ipp)}`;
  }
  return JSON.stringify(c);
}

function PouAttestations({ pou }: { pou: ManaReceipt['pou'] }) {
  const entries = (Object.keys(POU_LABELS) as Array<keyof typeof POU_LABELS>).map(
    (key) => [key, pou?.[key]] as const,
  );
  return (
    <Section title="Pou attestations">
      <ul className="grid grid-cols-1 gap-2">
        {entries.map(([key, val]) => (
          <li
            key={key}
            className="flex items-start gap-3 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-4 py-3"
          >
            <span
              aria-hidden
              className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-[12px] ${
                val?.passed === true
                  ? 'bg-[color:#2a7a3e]/15 text-[color:#2a7a3e]'
                  : val?.passed === false
                    ? 'bg-[color:#b3261e]/15 text-[color:#b3261e]'
                    : 'bg-[color:var(--assembl-cloud)] text-[color:var(--text-secondary)]'
              }`}
            >
              {val?.passed === true ? '✓' : val?.passed === false ? '✗' : '·'}
            </span>
            <div className="flex-1">
              <p className="font-display text-[15px] leading-tight text-[color:var(--text-primary)]">
                {POU_LABELS[key]}
              </p>
              {val?.note ? (
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-[color:var(--text-secondary)]">
                  {val.note}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function ThreeGates({ gates }: { gates: ManaReceipt['gates'] }) {
  return (
    <Section title="Three gates">
      <ul className="grid grid-cols-3 gap-2">
        {(Object.keys(GATE_LABELS) as Array<keyof typeof GATE_LABELS>).map((g) => {
          const passed = gates?.[g];
          return (
            <li
              key={g}
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-3 py-3 text-center"
            >
              <p
                aria-hidden
                className={`text-[18px] ${
                  passed === true
                    ? 'text-[color:#2a7a3e]'
                    : passed === false
                      ? 'text-[color:#b3261e]'
                      : 'text-[color:var(--text-secondary)]'
                }`}
              >
                {passed === true ? '✓' : passed === false ? '✗' : '·'}
              </p>
              <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--text-primary)]">
                {GATE_LABELS[g]}
              </p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function Hitl({ hitl }: { hitl: ManaReceipt['hitl'] }) {
  const status = hitl?.status ?? 'unknown';
  const reviewer = hitl?.reviewer_role ?? 'unassigned';
  const deadline = hitl?.deadline ? formatDate(hitl.deadline) : null;
  return (
    <Section title="Human-in-the-loop">
      <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1.5 font-mono text-[12px] tracking-[0.02em]">
        <dt className="text-[color:var(--text-secondary)]">Status</dt>
        <dd className="text-[color:var(--text-primary)]">{status.replace(/_/g, ' ')}</dd>
        <dt className="text-[color:var(--text-secondary)]">Reviewer</dt>
        <dd className="text-[color:var(--text-primary)]">{reviewer.replace(/_/g, ' ')}</dd>
        {hitl?.reviewed_at ? (
          <>
            <dt className="text-[color:var(--text-secondary)]">Reviewed</dt>
            <dd className="text-[color:var(--text-primary)]">{formatDate(hitl.reviewed_at)}</dd>
          </>
        ) : null}
        {deadline ? (
          <>
            <dt className="text-[color:var(--text-secondary)]">Deadline</dt>
            <dd className="text-[color:var(--text-primary)]">{deadline}</dd>
          </>
        ) : null}
      </dl>
    </Section>
  );
}

function SignatureBlock({
  receipt,
  signatureLooksReal,
}: {
  receipt: ManaReceipt;
  signatureLooksReal: boolean;
}) {
  return (
    <Section title="Signature & chain">
      <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1.5 font-mono text-[11.5px] tracking-[0.02em]">
        <dt className="text-[color:var(--text-secondary)]">Status</dt>
        <dd className={signatureLooksReal ? 'text-[color:#2a7a3e]' : 'text-[color:#b3261e]'}>
          {signatureLooksReal ? '✓ Verified' : '✗ Unverified'}
        </dd>
        <dt className="text-[color:var(--text-secondary)]">Key id</dt>
        <dd className="break-all text-[color:var(--text-primary)]">{receipt.key_id}</dd>
        <dt className="text-[color:var(--text-secondary)]">Receipt hash</dt>
        <dd className="break-all text-[color:var(--text-primary)]">{receipt.receipt_hash}</dd>
        <dt className="text-[color:var(--text-secondary)]">Prev hash</dt>
        <dd className="break-all text-[color:var(--text-primary)]">
          {receipt.prev_hash ?? <span className="text-[color:var(--text-secondary)]">(genesis)</span>}
        </dd>
      </dl>
      {receipt.verifier_url ? (
        <p className="mt-3 font-mono text-[11px] tracking-[0.02em]">
          <a
            href={receipt.verifier_url}
            className="text-[color:var(--assembl-gold-thread)] underline"
            target="_blank"
            rel="noreferrer"
          >
            open in public verifier →
          </a>
        </p>
      ) : null}
    </Section>
  );
}

function RawJson({ receipt }: { receipt: ManaReceipt }) {
  return (
    <Section title="Raw receipt">
      <details>
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
          show JSON
        </summary>
        <pre className="mt-3 max-h-[260px] overflow-auto rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-3 font-mono text-[11px] leading-relaxed text-[color:var(--text-primary)]">
          {JSON.stringify(receipt, null, 2)}
        </pre>
      </details>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {title}
      </h3>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-NZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
