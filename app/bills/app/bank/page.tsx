import { Card, PageHeading, SectionLabel, CategoryTag, money } from '@/components/bills/kit';
import { TransactionLog } from '@/components/bills/TransactionLog';
import { bankFormats, recurringCharges } from '@/lib/bills/data';
import { Landmark, Upload, Repeat, Lock } from 'lucide-react';

export default function BankPage() {
  return (
    <div>
      <PageHeading title="Bank" lead="Bring in your transactions two ways — drop a bank CSV, or connect open banking. Assembl Bills detects the recurring charges you may have forgotten." />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* CSV parser */}
        <Card>
          <SectionLabel>Import a statement (CSV)</SectionLabel>
          <div className="flex items-center justify-center rounded-2xl px-6 py-8 text-center" style={{ border: '1.5px dashed var(--b-line)', background: 'var(--b-surface-alt)' }}>
            <div>
              <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}>
                <Upload size={18} />
              </span>
              <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>Drop a bank CSV</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--b-muted)' }}>Auto-detects the format from your bank</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bankFormats.map((b) => (
              <span key={b.bank} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: 'var(--b-surface-alt)', color: 'var(--b-muted)' }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--b-teal)' }} />
                {b.bank} · {b.status}
              </span>
            ))}
          </div>
        </Card>

        {/* Akahu / open banking — honest stub */}
        <Card>
          <SectionLabel>Connect open banking</SectionLabel>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--b-surface-alt)', color: 'var(--b-muted)' }}>
              <Landmark size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>
                Akahu — all 5 major NZ banks
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--b-muted)' }}>
                ANZ, ASB, BNZ, Westpac and Kiwibank via NZ’s open finance layer. With your consent, Assembl Bills reads transactions to spot recurring charges.
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {bankFormats.map((b) => (
              <span key={b.bank} className="rounded-lg px-1 py-2 text-center text-[10px] font-semibold" style={{ background: 'var(--b-surface-alt)', color: 'var(--b-muted)' }}>
                {b.short}
              </span>
            ))}
          </div>
          <button type="button" disabled className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: 'var(--b-surface-alt)', color: 'var(--b-faint)', cursor: 'not-allowed' }}>
            <Lock size={14} /> Coming next: real Akahu connection
          </button>
          <p className="mt-2 text-[11px] leading-relaxed" style={{ color: 'var(--b-faint)' }}>
            Live open-banking access needs a commercial Akahu account and accredited-app registration under NZ’s Consumer Data Right — a Phase 2 job. The demo uses sample transactions only.
          </p>
        </Card>
      </div>

      {/* Recurring detection */}
      <Card className="mt-4">
        <SectionLabel>Recurring charges detected</SectionLabel>
        <div className="space-y-2.5">
          {recurringCharges.map((r) => (
            <div key={r.merchant} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5" style={{ background: 'var(--b-surface-alt)' }}>
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--b-surface)', color: 'var(--b-teal-deep)' }}>
                  <Repeat size={14} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold" style={{ color: 'var(--b-ink)' }}>{r.merchant}</span>
                    <CategoryTag category={r.category} />
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--b-muted)' }}>{r.note}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-bold" style={{ color: 'var(--b-ink)' }}>
                {money(r.amount)}<span className="text-[11px] font-normal" style={{ color: 'var(--b-faint)' }}> /{r.cadence === 'fortnightly' ? 'fn' : 'mo'}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Transaction log */}
      <Card className="mt-4">
        <SectionLabel>Transaction log</SectionLabel>
        <TransactionLog />
      </Card>
    </div>
  );
}
