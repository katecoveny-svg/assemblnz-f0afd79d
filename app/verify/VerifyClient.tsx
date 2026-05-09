'use client';

import { useState } from 'react';
import { EvidenceDrawer } from '@/components/EvidenceDrawer';
import type { ManaReceipt } from '@/lib/evidence/types';
import { verifyReceipt, type VerifyResult } from '@/lib/evidence/verify';

interface VerifyState {
  status: 'idle' | 'verifying' | 'done';
  result?: VerifyResult;
  receipt?: ManaReceipt;
  parseError?: string;
}

export function VerifyClient() {
  const [raw, setRaw] = useState('');
  const [state, setState] = useState<VerifyState>({ status: 'idle' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleVerify = async () => {
    setState({ status: 'verifying' });
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      setState({ status: 'done', parseError: 'could not parse JSON — paste the full receipt object' });
      return;
    }

    const candidate = (parsed as { receipt?: ManaReceipt })?.receipt ?? (parsed as ManaReceipt);
    try {
      const result = await verifyReceipt(candidate);
      setState({ status: 'done', result, receipt: candidate });
    } catch (err) {
      setState({
        status: 'done',
        parseError: err instanceof Error ? err.message : 'verification error',
      });
    }
  };

  return (
    <section className="mt-10">
      <label
        htmlFor="receipt-input"
        className="block font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]"
      >
        receipt JSON
      </label>
      <textarea
        id="receipt-input"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={11}
        placeholder='Paste the receipt JSON here, including the "signature_b64" field…'
        className="mt-2 w-full rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-3 font-mono text-[12.5px] leading-relaxed text-[color:var(--text-primary)] focus:border-[color:var(--assembl-gold-thread)] focus:outline-none"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleVerify}
          disabled={state.status === 'verifying' || raw.trim().length === 0}
          className="inline-flex h-11 items-center rounded-[2px] bg-[color:var(--text-primary)] px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)] hover:opacity-90 disabled:opacity-50"
        >
          {state.status === 'verifying' ? 'verifying…' : 'verify'}
        </button>
        {state.receipt ? (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-11 items-center rounded-[2px] border border-[color:var(--assembl-cloud)] px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-primary)] hover:bg-white"
          >
            view receipt details →
          </button>
        ) : null}
      </div>

      {state.status === 'done' ? (
        <ResultBlock state={state} />
      ) : null}

      <EvidenceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        receipt={state.receipt ?? null}
      />
    </section>
  );
}

function ResultBlock({ state }: { state: VerifyState }) {
  if (state.parseError) {
    return (
      <div className="mt-8 rounded-[2px] border border-[color:#b3261e]/30 bg-white p-5">
        <p className="font-display text-[20px] font-light text-[color:#b3261e]">
          ✗ could not verify
        </p>
        <p className="mt-1 font-mono text-[12px] tracking-[0.04em] text-[color:var(--text-primary)]">
          {state.parseError}
        </p>
      </div>
    );
  }
  const r = state.result;
  if (!r) return null;
  const verdictColor = r.ok ? '#2a7a3e' : '#b3261e';
  return (
    <div className="mt-8 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6">
      <p
        className="font-display text-[24px] font-light leading-tight"
        style={{ color: verdictColor }}
      >
        {r.ok ? '✓ Receipt verified' : '✗ Verification failed'}
      </p>
      <dl className="mt-4 grid grid-cols-[160px_1fr] gap-x-4 gap-y-1.5 font-mono text-[12px] tracking-[0.02em]">
        <dt className="text-[color:var(--text-secondary)]">Hash check</dt>
        <dd className={r.hash_match ? 'text-[color:#2a7a3e]' : 'text-[color:#b3261e]'}>
          {r.hash_match ? '✓ matches' : '✗ does not match'}
        </dd>
        <dt className="text-[color:var(--text-secondary)]">Signature</dt>
        <dd className={r.signature_valid ? 'text-[color:#2a7a3e]' : 'text-[color:#b3261e]'}>
          {r.signature_valid ? '✓ valid' : '✗ invalid'}
        </dd>
        {r.recomputed_hash ? (
          <>
            <dt className="text-[color:var(--text-secondary)]">Recomputed hash</dt>
            <dd className="break-all text-[color:var(--text-primary)]">{r.recomputed_hash}</dd>
          </>
        ) : null}
        {state.receipt?.key_id ? (
          <>
            <dt className="text-[color:var(--text-secondary)]">Key id</dt>
            <dd className="text-[color:var(--text-primary)]">{state.receipt.key_id}</dd>
          </>
        ) : null}
        {r.error ? (
          <>
            <dt className="text-[color:var(--text-secondary)]">Note</dt>
            <dd className="text-[color:var(--text-primary)]">{r.error}</dd>
          </>
        ) : null}
      </dl>
      {r.key_inactive ? (
        <p className="mt-4 rounded-[2px] border border-dashed border-[color:var(--assembl-gold-thread)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[11px] tracking-[0.04em] text-[color:var(--text-secondary)]">
          The published public key is currently a placeholder. Production keys
          are minted by Kaihanga at Day 7.5; until then signature verification
          will always fail.
        </p>
      ) : null}
    </div>
  );
}
