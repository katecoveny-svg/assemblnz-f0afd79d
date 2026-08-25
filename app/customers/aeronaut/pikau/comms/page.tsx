import type { Metadata } from 'next';
import { listComms } from '@/lib/customs/store';
import { formatNzDateTime } from '@/lib/customs/format';
import { Card, PageHeader, Pill, SectionTitle } from '@/components/customs/ui';
import type { CommsChannel } from '@/lib/customs/types';

export const metadata: Metadata = { title: 'Comms drafts' };

const CHANNEL_LABEL: Record<CommsChannel, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  carrier_update: 'Carrier update',
};

export default async function CommsPage() {
  const comms = await listComms();

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Comms drafts"
        lead="Importer-facing emails, WhatsApp shipper coordination and carrier updates — drafted in Aironaut's voice, staged for a person to approve and send. Nothing sends automatically."
      />
      <div className="space-y-4">
        {comms.map((c) => (
          <Card key={c.id}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Pill tone="navy">{CHANNEL_LABEL[c.channel]}</Pill>
                <span className="text-sm font-medium text-[color:var(--air-ink)]">{c.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone={c.status === 'sent' ? 'ok' : c.status === 'approved' ? 'brass' : 'warn'}>{c.status}</Pill>
                <span className="text-[0.75rem] text-[color:var(--air-slate)]">{formatNzDateTime(c.createdIso)}</span>
              </div>
            </div>
            <p className="mb-2 text-xs text-[color:var(--air-slate)]">To: {c.to}</p>
            <pre className="whitespace-pre-wrap rounded-lg bg-[color:var(--air-mist)] p-3 font-sans text-sm text-[color:var(--air-ink)]">{c.body}</pre>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg bg-[color:var(--air-navy)] px-3 py-1.5 text-xs font-semibold text-white opacity-70" disabled>
                {c.status === 'sent' ? 'Sent' : 'Approve & send'}
              </button>
              <button className="rounded-lg border border-[color:var(--air-line)] px-3 py-1.5 text-xs text-[color:var(--air-navy)] opacity-70" disabled>
                Edit
              </button>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-[color:var(--air-slate)]">Send actions are disabled in the pilot — drafts only.</p>
    </div>
  );
}
