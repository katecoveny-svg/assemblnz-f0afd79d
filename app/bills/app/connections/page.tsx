import { Card, PageHeading, SectionLabel, CategoryTag } from '@/components/bills/kit';
import { LiveState } from '@/components/bills/LiveState';
import { NotifyInline } from '@/components/bills/NotifyInline';
import { emailProviders, detectedProviders } from '@/lib/bills/data';
import { Mail, Check, ShieldCheck } from 'lucide-react';

export default function ConnectionsPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <PageHeading title="Connections" lead="Connect an inbox and assembl bills reads your bills automatically. Secure OAuth is coming next — for now, forward a bill email and paste it on the Bills tab, or drop a PDF/photo — both are read live." />
        <LiveState state="coming" note="OAuth in progress" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Email connect — honest coming-next */}
        <Card>
          <SectionLabel>Connect your email</SectionLabel>
          <div className="space-y-3">
            {emailProviders.map((p) => (
              <div key={p.id} className="rounded-xl px-4 py-3.5" style={{ background: 'var(--b-surface-alt)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--b-surface)', color: 'var(--b-teal-deep)' }}>
                    <Mail size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-bills-display), 'Cormorant Garamond', Georgia, serif", color: 'var(--b-ink)' }}>{p.name}</p>
                    <p className="text-[12px]" style={{ color: 'var(--b-muted)' }}>{p.note}</p>
                  </div>
                </div>
                <div className="mt-2.5">
                  <NotifyInline kind="notify" target={`${p.name} inbox connect`} label={`Notify me when ${p.name} connect is live`} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed" style={{ color: 'var(--b-faint)' }}>
            <ShieldCheck size={13} className="mt-0.5 shrink-0" />
            Secure OAuth (Gmail / Microsoft) isn’t wired for Bills yet — no `GMAIL_OAUTH` credentials on this environment, so we show an honest coming-next state rather than a dead button. When live it’s read-only; no email is stored beyond the bill details.
          </p>
        </Card>

        {/* Provider detection — sample */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Providers we’d detect in your inbox</SectionLabel>
            <LiveState state="sample" />
          </div>
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
          <p className="mt-3 text-[12px]" style={{ color: 'var(--b-faint)' }}>
            On a real connect, assembl bills recognises NZ providers automatically and files each bill to the right category — the same extraction the Bills-tab upload already runs live.
          </p>
        </Card>
      </div>
    </div>
  );
}
