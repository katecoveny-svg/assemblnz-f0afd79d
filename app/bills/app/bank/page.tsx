import { Card, PageHeading, SectionLabel, CategoryTag, money } from '@/components/bills/kit';
import { TransactionLog } from '@/components/bills/TransactionLog';
import { BankCsvImport } from '@/components/bills/BankCsvImport';
import { LiveState } from '@/components/bills/LiveState';
import { NotifyInline } from '@/components/bills/NotifyInline';
import { bankFormats, recurringCharges } from '@/lib/bills/data';
import { Landmark, Repeat } from 'lucide-react';

export default function BankPage() {
  return (
    <div>
      <PageHeading title="Bank" lead="Bring in your transactions two ways — drop a real bank CSV (parsed live, in your browser) or connect open banking when it’s live. assembl bills detects the recurring charges you may have forgotten." />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* CSV parser — REAL, client-side */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Import a statement (CSV)</SectionLabel>
            <LiveState state="live" note="parsed in-browser" />
          </div>
          <BankCsvImport />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bankFormats.map((b) => (
              <span key={b.bank} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: 'var(--b-surface-alt)', color: 'var(--b-muted)' }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--b-teal)' }} />
                {b.bank}
              </span>
            ))}
          </div>
        </Card>

        {/* Akahu / open banking — honest coming-next */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Connect open banking</SectionLabel>
            <LiveState state="coming" note="Akahu accreditation" />
          </div>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--b-surface-alt)', color: 'var(--b-muted)' }}>
              <Landmark size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-bills-display), system-ui, sans-serif", color: 'var(--b-ink)' }}>
                Akahu — all 5 major NZ banks
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--b-muted)' }}>
                ANZ, ASB, BNZ, Westpac and Kiwibank via NZ’s open finance layer. We’re applying for accredited status — add your email and we’ll tell you the moment it’s live.
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {bankFormats.map((b) => (
              <span key={b.bank} className="rounded-lg px-1 py-2 text-center text-[12px] font-semibold" style={{ background: 'var(--b-surface-alt)', color: 'var(--b-muted)' }}>
                {b.short}
              </span>
            ))}
          </div>
          <div className="mt-3">
            <NotifyInline kind="notify" target="Akahu open banking" label="Notify me when Akahu bank connection is live" />
          </div>
          <p className="mt-2 text-[12px] leading-relaxed" style={{ color: 'var(--b-faint)' }}>
            Real Akahu access needs a commercial account + accredited-app registration under NZ’s Consumer Data Right. Not faked as working — this files a request for Kate to action.
          </p>
        </Card>
      </div>

      {/* Recurring detection (sample demo set; the CSV import above detects real ones live) */}
      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>Recurring charges (sample)</SectionLabel>
          <LiveState state="sample" note="import a CSV above for live detection" />
        </div>
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
                  <p className="text-[12px]" style={{ color: 'var(--b-muted)' }}>{r.note}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-bold" style={{ color: 'var(--b-ink)' }}>
                {money(r.amount)}<span className="text-[12px] font-normal" style={{ color: 'var(--b-faint)' }}> /{r.cadence === 'fortnightly' ? 'fn' : 'mo'}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>Transaction log (sample)</SectionLabel>
          <LiveState state="sample" />
        </div>
        <TransactionLog />
      </Card>
    </div>
  );
}
