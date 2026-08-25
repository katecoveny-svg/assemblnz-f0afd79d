'use client';

import { useRef, useState, useTransition } from 'react';
import type { RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, RefreshCw, SendHorizontal } from 'lucide-react';
import { formatNzDateTime, type TenantContext } from '@/lib/arataki/loan-cars';
import type { ServiceSalesMatch } from '@/lib/arataki/service-match';

type Props = {
  tenant: TenantContext;
  matches: ServiceSalesMatch[];
};

export function ServiceMatchWorkspace({ tenant, matches }: Props) {
  const router = useRouter();
  const serviceFile = useRef<HTMLInputElement>(null);
  const salesFile = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function importCsv(fileType: 'service_appointments' | 'sales_history') {
    const input = fileType === 'service_appointments' ? serviceFile.current : salesFile.current;
    const file = input?.files?.[0];
    if (!file) {
      setError('Choose a CSV export first.');
      return;
    }
    setError(null);
    setMessage(null);
    const form = new FormData();
    form.set('tenantId', tenant.id);
    form.set('fileType', fileType);
    form.set('file', file);
    const res = await fetch('/api/arataki/service-match/import-csv', { method: 'POST', body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? 'CSV import failed.');
      return;
    }
    setMessage(`Imported ${json.inserted ?? 0} ${fileType.replace('_', ' ')} row${json.inserted === 1 ? '' : 's'}.`);
    if (input) input.value = '';
    startTransition(() => router.refresh());
  }

  async function refresh() {
    setError(null);
    setMessage(null);
    const res = await fetch('/api/arataki/service-match/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: tenant.id, days: 14 }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? 'Refresh failed.');
      return;
    }
    setMessage(`Refreshed ${json.matches?.length ?? 0} non-routine match${json.matches?.length === 1 ? '' : 'es'}.`);
    startTransition(() => router.refresh());
  }

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <ImportBox
          label="Service appointments"
          inputRef={serviceFile}
          onImport={() => importCsv('service_appointments')}
          disabled={isPending}
        />
        <ImportBox
          label="Sales history"
          inputRef={salesFile}
          onImport={() => importCsv('sales_history')}
          disabled={isPending}
        />
        <button
          type="button"
          onClick={refresh}
          disabled={isPending}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[rgba(61,66,80,0.16)] bg-white/70 px-4 text-sm font-medium text-[#3D4250] transition hover:border-[#C79B1F] hover:text-[#C79B1F] disabled:opacity-60"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh scoring
        </button>
        {(message || error) && (
          <div
            className={`rounded-[8px] border p-4 text-sm leading-relaxed ${
              error
                ? 'border-[rgba(217,168,90,0.38)] bg-[rgba(217,168,90,0.12)]'
                : 'border-[rgba(43,107,87,0.24)] bg-[rgba(43,107,87,0.08)] text-[#C79B1F]'
            }`}
          >
            {error ?? message}
          </div>
        )}
      </aside>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#9D8C7D]">Rooftop</p>
            <h2 className="mt-1 font-display text-3xl font-light text-[color:var(--text-primary)]">{tenant.name}</h2>
          </div>
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#9D8C7D]">
            {matches.length} opportunity{matches.length === 1 ? '' : 'ies'}
          </p>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          {matches.length === 0 ? (
            <div className="rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/70 p-6 text-sm">
              No non-routine matches yet.
            </div>
          ) : (
            matches.map((match) => <MatchCard key={match.appointment.id} match={match} tenantId={tenant.id} />)
          )}
        </div>
      </div>
    </section>
  );
}

function ImportBox({
  label,
  inputRef,
  onImport,
  disabled,
}: {
  label: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onImport: () => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/70 p-4">
      <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#9D8C7D]">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="mt-4 block w-full rounded-[8px] border border-[rgba(61,66,80,0.14)] bg-[#FAF7F2] p-2 text-xs"
      />
      <button
        type="button"
        onClick={onImport}
        disabled={disabled}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#C79B1F] px-4 text-sm font-medium text-[#FAF7F2] transition hover:bg-[#9A7818] disabled:opacity-60"
      >
        <FileUp className="h-4 w-4" aria-hidden />
        Import CSV
      </button>
    </div>
  );
}

function MatchCard({ match, tenantId }: { match: ServiceSalesMatch; tenantId: string }) {
  const vehicle = [match.appointment.vehicle_year, match.appointment.vehicle_make, match.appointment.vehicle_model].filter(Boolean).join(' ') || 'Vehicle not recorded';
  const [handoffMessage, setHandoffMessage] = useState<string | null>(null);
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const [isHandingOff, startHandoff] = useTransition();

  function handOffToSales() {
    setHandoffMessage(null);
    setHandoffError(null);
    startHandoff(async () => {
      const res = await fetch('/api/arataki/service-match/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, appointmentId: match.appointment.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setHandoffError(json.error ?? 'Handoff audit failed.');
        return;
      }
      setHandoffMessage(`Handoff recorded${json.auditId ? ` · ${json.auditId}` : ''}.`);
    });
  }

  return (
    <article className="rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/75 p-4 shadow-[0_10px_30px_rgba(61,66,80,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-3xl font-light leading-none text-[color:var(--text-primary)]">{match.appointment.customer_name}</h3>
          <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.16em] text-[#9D8C7D]">
            {vehicle} · {formatNzDateTime(match.appointment.appointment_at) ?? 'time not recorded'}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 font-mono text-[12px] uppercase tracking-[0.14em] ${
          match.tier === 'strong'
            ? 'border-[rgba(43,107,87,0.30)] bg-[rgba(43,107,87,0.10)] text-[#C79B1F]'
            : 'border-[rgba(217,168,90,0.45)] bg-[rgba(217,168,90,0.16)] text-[#8A6324]'
        }`}>
          {match.score}
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(61,66,80,0.10)]">
        <div className="h-full rounded-full bg-[#C79B1F]" style={{ width: `${match.score}%` }} />
      </div>
      <p className="mt-4 text-sm leading-relaxed">{match.openingLine}</p>
      <p className="mt-3 rounded-[8px] bg-[#FAF7F2] p-3 text-xs leading-relaxed">{match.handoffDraft}</p>
      <button
        type="button"
        onClick={handOffToSales}
        disabled={isHandingOff}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#C79B1F] px-4 text-sm font-medium text-[#FAF7F2] transition hover:bg-[#9A7818] disabled:opacity-60"
      >
        <SendHorizontal className="h-4 w-4" aria-hidden />
        Hand off to sales
      </button>
      {(handoffMessage || handoffError) && (
        <p className={`mt-2 text-xs ${handoffError ? 'text-[#8A6324]' : 'text-[#C79B1F]'}`}>
          {handoffError ?? handoffMessage}
        </p>
      )}
      <ul className="mt-4 grid gap-1.5">
        {match.signals.map((signal) => (
          <li key={signal.label} className="flex items-center justify-between gap-3 font-mono text-[12px] uppercase tracking-[0.12em] text-[#9D8C7D]">
            <span>{signal.label}</span>
            <span className="text-[#C79B1F]">+{signal.points}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
