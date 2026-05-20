'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ClipboardList, FileUp, RotateCcw, Wrench } from 'lucide-react';
import {
  effectiveReturnAt,
  formatNzDateTime,
  isOverdue,
  normaliseLoanCarStatus,
  type LoanCarRow,
  type LoanCarStatus,
  type LoanCarSummary,
  type TenantContext,
} from '@/lib/arataki/loan-cars';

type Props = {
  cars: LoanCarRow[];
  tenant: TenantContext;
  summary: LoanCarSummary;
};

const FILTERS = ['all', 'available', 'on_loan', 'overdue', 'maintenance'] as const;

export function LoanCarsWorkspace({ cars, tenant }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return cars.filter((car) => {
      if (filter === 'all') return true;
      if (filter === 'overdue') return isOverdue(car);
      return normaliseLoanCarStatus(car.status) === filter;
    });
  }, [cars, filter]);

  async function importCsv() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Choose a CSV export first.');
      return;
    }
    setMessage(null);
    setError(null);
    const form = new FormData();
    form.set('tenantId', tenant.id);
    form.set('file', file);
    const res = await fetch('/api/arataki/loan-cars/import-csv', { method: 'POST', body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? 'CSV import failed.');
      return;
    }
    setMessage(`Imported ${json.inserted ?? 0} loan car row${json.inserted === 1 ? '' : 's'}.`);
    if (fileRef.current) fileRef.current.value = '';
    startTransition(() => router.refresh());
  }

  async function updateStatus(carId: string, status: LoanCarStatus) {
    setMessage(null);
    setError(null);
    const res = await fetch('/api/arataki/loan-cars/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: tenant.id, carId, status }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? 'Could not update status.');
      return;
    }
    setMessage('Loan car status updated.');
    startTransition(() => router.refresh());
  }

  async function handoff(carId: string) {
    setMessage(null);
    setError(null);
    const res = await fetch('/api/arataki/loan-cars/handoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: tenant.id, carId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? 'Could not write handoff audit row.');
      return;
    }
    setMessage(`Handoff recorded${json.auditId ? ` · ${json.auditId}` : ''}.`);
  }

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/70 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9D8C7D]">CSV import</p>
          <p className="mt-2 text-sm leading-relaxed text-[#3D4250]">
            Paste-first pilot path. Export from the dealer system, import here, then review before any external action.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="mt-4 block w-full rounded-[8px] border border-[rgba(61,66,80,0.14)] bg-[#FAF7F2] p-2 text-xs text-[#3D4250]"
          />
          <button
            type="button"
            onClick={importCsv}
            disabled={isPending}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#2B6B57] px-4 text-sm font-medium text-[#FAF7F2] transition hover:bg-[#245746] disabled:opacity-60"
          >
            <FileUp className="h-4 w-4" aria-hidden />
            Import CSV
          </button>
        </div>

        <div className="rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/70 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9D8C7D]">Filters</p>
          <div className="mt-3 grid gap-2">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`min-h-10 rounded-[8px] border px-3 text-left font-mono text-[10px] uppercase tracking-[0.16em] transition ${
                  filter === item
                    ? 'border-[#2B6B57] bg-[rgba(43,107,87,0.10)] text-[#2B6B57]'
                    : 'border-[rgba(61,66,80,0.12)] bg-[#FAF7F2] text-[#9D8C7D] hover:text-[#3D4250]'
                }`}
              >
                {item.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {(message || error) && (
          <div
            className={`rounded-[8px] border p-4 text-sm leading-relaxed ${
              error
                ? 'border-[rgba(217,168,90,0.38)] bg-[rgba(217,168,90,0.12)] text-[#3D4250]'
                : 'border-[rgba(43,107,87,0.24)] bg-[rgba(43,107,87,0.08)] text-[#2B6B57]'
            }`}
          >
            {error ?? message}
          </div>
        )}
      </aside>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9D8C7D]">Rooftop</p>
            <h2 className="mt-1 font-display text-3xl font-light">{tenant.name}</h2>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9D8C7D]">
            {filtered.length} showing · {cars.length} total
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/70 p-6 text-sm text-[#3D4250]">
              No loan cars match this view.
            </div>
          ) : (
            filtered.map((car) => (
              <LoanCarCard key={car.id} car={car} onStatus={updateStatus} onHandoff={handoff} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function LoanCarCard({
  car,
  onStatus,
  onHandoff,
}: {
  car: LoanCarRow;
  onStatus: (carId: string, status: LoanCarStatus) => void;
  onHandoff: (carId: string) => void;
}) {
  const status = normaliseLoanCarStatus(car.status);
  const overdue = isOverdue(car);
  const due = formatNzDateTime(effectiveReturnAt(car));
  const statusLabel = overdue ? 'overdue' : status.replace('_', ' ');

  return (
    <article className="flex min-h-[260px] flex-col rounded-[8px] border border-[rgba(61,66,80,0.12)] bg-white/75 p-4 shadow-[0_10px_30px_rgba(61,66,80,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-3xl font-light leading-none">
            {car.make} {car.model}
          </h3>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9D8C7D]">{car.rego}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${
            overdue
              ? 'border-[rgba(217,168,90,0.45)] bg-[rgba(217,168,90,0.16)] text-[#8A6324]'
              : 'border-[rgba(43,107,87,0.26)] bg-[rgba(43,107,87,0.08)] text-[#2B6B57]'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9D8C7D]">Borrower</dt>
          <dd className="mt-1 text-[#3D4250]">{car.borrower_name || 'Not assigned'}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9D8C7D]">Expected return</dt>
          <dd className="mt-1 text-[#3D4250]">{due ?? 'Not recorded'}</dd>
        </div>
      </dl>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <button
          type="button"
          onClick={() => onStatus(car.id, status === 'available' ? 'on_loan' : 'available')}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-[rgba(61,66,80,0.16)] px-3 text-xs font-medium text-[#3D4250] transition hover:border-[#2B6B57] hover:text-[#2B6B57]"
        >
          {status === 'available' ? <RotateCcw className="h-3.5 w-3.5" aria-hidden /> : <Check className="h-3.5 w-3.5" aria-hidden />}
          {status === 'available' ? 'Mark out' : 'Returned'}
        </button>
        <button
          type="button"
          onClick={() => onStatus(car.id, 'maintenance')}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-[rgba(61,66,80,0.16)] px-3 text-xs font-medium text-[#3D4250] transition hover:border-[#2B6B57] hover:text-[#2B6B57]"
        >
          <Wrench className="h-3.5 w-3.5" aria-hidden />
          Workshop
        </button>
        <button
          type="button"
          onClick={() => onHandoff(car.id)}
          className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-[#2B6B57] px-3 text-xs font-medium text-[#FAF7F2] transition hover:bg-[#245746]"
        >
          <ClipboardList className="h-3.5 w-3.5" aria-hidden />
          Hand off to operator
        </button>
      </div>
    </article>
  );
}
