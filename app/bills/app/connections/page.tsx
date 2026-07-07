import { Card, PageHeading, SectionLabel, CategoryTag } from '@/components/bills/kit';
import { emailProviders, detectedProviders } from '@/lib/bills/data';
import { Mail, Lock, Check, ShieldCheck } from 'lucide-react';

export default function ConnectionsPage() {
  return (
    <div>
      <PageHeading title="Connections" lead="Connect an inbox and Assembl Bills reads your bills automatically — provider, amount and due date, straight from the email. Read-only, and only bill-related mail." />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Email connect */}
        <Card>
          <SectionLabel>Connect your email</SectionLabel>
          <div className="space-y-3">
            {emailProviders.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5" style={{ background: 'var(--b-surface-alt)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--b-surface)', color: 'var(--b-teal-deep)' }}>
                    <Mail size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>{p.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--b-muted)' }}>{p.note}</p>
                  </div>
                </div>
                <button type="button" disabled className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: 'var(--b-surface)', color: 'var(--b-faint)', border: '1px solid var(--b-line)', cursor: 'not-allowed' }}>
                  <Lock size={12} /> Connect coming next
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed" style={{ color: 'var(--b-faint)' }}>
            <ShieldCheck size={13} className="mt-0.5 shrink-0" />
            Secure OAuth (Gmail / Microsoft) reuses assembl’s existing inbox connect. Not yet wired for Bills — this demo shows the flow with sample detections only. Read-only scope; no email is stored beyond the bill details.
          </p>
        </Card>

        {/* Provider detection */}
        <Card>
          <SectionLabel>Providers we’d detect in your inbox</SectionLabel>
          <div className="space-y-2">
            {detectedProviders.map((d) => (
              <div key={d.name} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5" style={{ background: 'var(--b-surface-alt)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: 'var(--b-teal)' }}>
                    <Check size={13} />
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--b-ink)' }}>{d.name}</span>
                </div>
                <CategoryTag category={d.category} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px]" style={{ color: 'var(--b-faint)' }}>
            Detected from sample data. On a real connect, Assembl Bills recognises NZ providers automatically and files each bill to the right category.
          </p>
        </Card>
      </div>
    </div>
  );
}
