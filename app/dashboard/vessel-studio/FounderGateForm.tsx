'use client';

import { useActionState } from 'react';
import { submitFounderGate, type GateState } from './founder-gate-action';

const initial: GateState = { status: 'idle' };

interface FounderGateFormProps {
  configured: boolean;
}

export function FounderGateForm({ configured }: FounderGateFormProps) {
  const [state, formAction, pending] = useActionState(submitFounderGate, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          founder passphrase
        </span>
        <input
          type="password"
          name="passphrase"
          autoComplete="current-password"
          spellCheck={false}
          required
          className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-3 font-mono text-[12.5px] tracking-[0.04em] text-[color:var(--text-primary)] focus:border-[color:var(--text-primary)] focus:outline-none disabled:opacity-50"
          disabled={!configured || pending}
        />
      </label>
      <button
        type="submit"
        disabled={!configured || pending}
        className="rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--assembl-paper)] px-4 py-3 font-mono text-[12px] lowercase tracking-[0.22em] text-[color:var(--text-primary)] transition-colors enabled:hover:bg-[color:var(--assembl-cloud)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'checking…' : 'enter studio'}
      </button>
      {state.status === 'error' && (
        <div
          role="alert"
          className="rounded-[2px] border border-[#D9C2B6] bg-[#F4E9E4] p-3.5 font-mono text-xs leading-[1.55] text-[#7A2E15]"
        >
          {state.message}
        </div>
      )}
      {!configured && (
        <p className="font-mono text-[12px] leading-[1.6] tracking-[0.04em] text-[color:var(--text-secondary)]">
          set <code>FOUNDER_GATE_SECRET</code> in the env to enable the gate.
        </p>
      )}
    </form>
  );
}
