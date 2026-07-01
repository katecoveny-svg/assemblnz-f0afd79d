'use client';

import { useState } from 'react';
import { BIOSECURITY_ITEMS, bioProgress, type BioStatus } from '@/lib/customs/biosecurity';
import { Card, PageHeader, Pill, SectionTitle } from '@/components/customs/ui';

const OPTIONS: BioStatus[] = ['pass', 'fail', 'na'];
const LABELS: Record<BioStatus, string> = { pass: 'Cleared', fail: 'Issue', na: 'N/A' };

export default function BiosecurityPage() {
  const [states, setStates] = useState<Record<string, BioStatus>>({});
  const { completed, total, flagged } = bioProgress(states);
  const pct = Math.round((completed / total) * 100);

  return (
    <div>
      <PageHeader eyebrow="Tools" title="MPI biosecurity checklist" lead="Walk the common import-health pathways before goods are released. Advisory — actual MPI clearance runs through the broker and the transitional facility." />
      <Card mist className="mb-4">
        <div className="flex items-center justify-between">
          <SectionTitle>{completed}/{total} pathways addressed</SectionTitle>
          <Pill tone={flagged.length ? 'hold' : pct === 100 ? 'ok' : 'warn'}>{flagged.length ? `${flagged.length} issue${flagged.length === 1 ? '' : 's'}` : `${pct}%`}</Pill>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--air-line)]">
          <div className="h-full bg-[color:var(--air-brass)]" style={{ width: `${pct}%` }} />
        </div>
      </Card>
      <div className="space-y-3">
        {BIOSECURITY_ITEMS.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-xl">
                <p className="font-medium text-[color:var(--air-ink)]">{item.label}</p>
                <p className="mt-0.5 text-xs text-[color:var(--air-slate)]">{item.detail}</p>
                <p className="mt-1 text-[0.7rem] text-[color:var(--air-brass-deep)]">{item.citation}</p>
              </div>
              <div className="flex gap-1.5">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStates({ ...states, [item.id]: opt })}
                    className={`rounded-lg border px-3 py-1.5 text-xs ${states[item.id] === opt ? 'border-[color:var(--air-brass)] bg-[color:rgba(201,163,78,0.12)] text-[color:var(--air-navy)]' : 'border-[color:var(--air-line)] text-[color:var(--air-slate)]'}`}
                  >
                    {LABELS[opt]}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
