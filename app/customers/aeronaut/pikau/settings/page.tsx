import type { Metadata } from 'next';
import { listStaff } from '@/lib/customs/store';
import { AIRONAUT_BRAND } from '@/lib/customs/demo';
import { Card, PageHeader, Pill, SectionTitle } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Settings' };

const INTEGRATIONS = [
  { name: 'Xero (AR + Payroll)', status: 'not connected', detail: 'Invoicing and payroll sync. Connect Aironaut’s Xero org to go live.' },
  { name: 'Trade Single Window (TSW)', status: 'draft-only', detail: 'Entries are drafted here and lodged by the licensed broker in TSW. No automated lodgement in the pilot.' },
  { name: 'MPI biosecurity', status: 'advisory', detail: 'Import Health Standard checks are advisory; clearance runs through the transitional facility.' },
  { name: 'WhatsApp Business', status: 'draft-only', detail: 'Shipper coordination drafts staged for approval; no automated sending.' },
] as const;

export default async function SettingsPage() {
  const staff = await listStaff();
  return (
    <div>
      <PageHeader eyebrow="Operations" title="Settings & integrations" lead="The workspace profile, the people with access, and the integrations that light up when Aironaut connects them." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Workspace</SectionTitle>
          <dl className="space-y-1.5 text-sm">
            <Row label="Business" value={AIRONAUT_BRAND.legalName} />
            <Row label="Address" value={AIRONAUT_BRAND.address} />
            <Row label="Phone" value={AIRONAUT_BRAND.phone} />
            <Row label="Established" value={String(AIRONAUT_BRAND.established)} />
            <Row label="Tenant slug" value="aeronaut" mono />
            <Row label="Mode" value="Pilot · draft-only" />
          </dl>
        </Card>

        <Card>
          <SectionTitle>People with access</SectionTitle>
          <ul className="space-y-2 text-sm">
            {staff.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span>{s.name}{s.brokerLicence ? <span className="ml-2 font-mono text-xs text-[color:var(--air-slate)]">{s.brokerLicence}</span> : null}</span>
                <Pill tone="navy">{s.role.replace('_', ' ')}</Pill>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[color:var(--air-slate)]">Real client data is scoped to authenticated tenant members via row-level security. Password-gate visitors see the demo book only.</p>
        </Card>
      </div>

      <div className="mt-6">
        <SectionTitle>Integrations</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {INTEGRATIONS.map((i) => (
            <Card key={i.name} className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[color:var(--air-ink)]">{i.name}</p>
                <p className="mt-0.5 text-xs text-[color:var(--air-slate)]">{i.detail}</p>
              </div>
              <Pill tone={i.status === 'not connected' ? 'warn' : 'navy'}>{i.status}</Pill>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[color:var(--air-slate)]">{label}</dt>
      <dd className={mono ? 'font-mono text-xs text-[color:var(--air-navy)]' : 'text-right text-[color:var(--air-ink)]'}>{value}</dd>
    </div>
  );
}
