'use client';

import { useState, useTransition } from 'react';
import {
  saveEvidenceSettingsAction,
  type SaveResult,
} from './actions';
import type { EvidenceSettings } from '@/lib/evidence/types';

interface Props {
  initial: EvidenceSettings;
}

export function SettingsForm({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<SaveResult | null>(null);

  const handle = (formData: FormData) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await saveEvidenceSettingsAction(formData);
      setFeedback(result);
    });
  };

  return (
    <form action={handle} className="mt-8 space-y-7">
      <fieldset className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6">
        <legend className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          retention
        </legend>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[color:var(--text-primary)]">
          Default 7 years per Customs Act s.405 and the Tax Administration
          Act. You can adjust within{' '}
          <strong>{initial.retention.min_months}</strong> to{' '}
          <strong>{initial.retention.max_months}</strong> months.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <NumberField
            id="receipts_months"
            name="receipts_months"
            label="Mana Receipts (months)"
            initial={initial.retention.receipts_months}
            min={initial.retention.min_months}
            max={initial.retention.max_months}
          />
          <NumberField
            id="audit_log_months"
            name="audit_log_months"
            label="Audit log (months)"
            initial={initial.retention.audit_log_months}
            min={initial.retention.min_months}
            max={initial.retention.max_months}
          />
        </div>
      </fieldset>

      <fieldset className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6">
        <legend className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          public verifier
        </legend>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[color:var(--text-primary)]">
          When on, anyone with a receipt id can open it at{' '}
          <code className="font-mono text-[12px]">/verify</code>. When off,
          receipts only resolve with a sharing token. Default: off.
        </p>
        <RadioGroup
          name="public_verifier"
          initial={initial.public_verifier}
          options={[
            { value: 'off', label: 'Off — receipts only resolve with sharing token' },
            { value: 'on', label: 'On — anyone with receipt id can verify' },
          ]}
        />
      </fieldset>

      <fieldset className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-6">
        <legend className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          cite-when-tikanga-uncertain
        </legend>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[color:var(--text-primary)]">
          When the tikanga gate fires unsure rather than pass/fail, what
          should the agent do? Default: always cite.
        </p>
        <RadioGroup
          name="cite_when_uncertain"
          initial={initial.cite_when_uncertain}
          options={[
            { value: 'always_cite', label: 'Always cite — attach the closest authority anyway' },
            { value: 'flag_for_human', label: 'Flag for human — pause output until reviewer signs off' },
          ]}
        />
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center rounded-[2px] bg-[color:var(--text-primary)] px-6 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)] hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'saving…' : 'save settings'}
        </button>
        {feedback?.ok ? (
          <span className="font-mono text-[12px] tracking-[0.04em] text-[color:#2a7a3e]">
            ✓ saved
          </span>
        ) : null}
        {feedback && !feedback.ok ? (
          <span className="font-mono text-[12px] tracking-[0.04em] text-[color:#b3261e]">
            · {feedback.reason ?? 'save failed'}
          </span>
        ) : null}
      </div>
    </form>
  );
}

function NumberField({
  id,
  name,
  label,
  initial,
  min,
  max,
}: {
  id: string;
  name: string;
  label: string;
  initial: number;
  min: number;
  max: number;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="block font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
        {label}
      </span>
      <input
        id={id}
        name={name}
        type="number"
        min={min}
        max={max}
        defaultValue={initial}
        className="mt-1.5 w-full rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-2.5 font-mono text-[13px] text-[color:var(--text-primary)] focus:border-[color:var(--assembl-gold-thread)] focus:outline-none"
      />
    </label>
  );
}

function RadioGroup<V extends string>({
  name,
  initial,
  options,
}: {
  name: string;
  initial: V;
  options: Array<{ value: V; label: string }>;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex cursor-pointer items-start gap-3 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-4 py-3 text-[13px] text-[color:var(--text-primary)]"
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            defaultChecked={initial === opt.value}
            className="mt-0.5 accent-[color:var(--text-primary)]"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
