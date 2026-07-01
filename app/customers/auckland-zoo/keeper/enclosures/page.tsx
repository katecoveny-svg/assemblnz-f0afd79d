import { ENCLOSURE_CHECKS, NOTIFIABLE_EVENT_NOTE, type Tone } from '@/lib/customers/auckland-zoo/ops-data';
import { Card, Eyebrow, PageHeading, StatusDot, TonePill } from '../_components/ui';

const CELL_LABEL: Record<Tone, string> = { ok: 'Pass', watch: 'Flag', urgent: 'Fail' };

export default function EnclosuresPage() {
  return (
    <div>
      <PageHeading
        eyebrow="Keeper · enclosure H&S"
        title="Enclosure safety checks"
        intro="Daily safety checks per enclosure — barrier integrity, water quality and feed-store temperatures. Where a check surfaces a notifiable event, Keeper drafts the WorkSafe or MPI notification for a named manager to review and lodge."
      />

      <div className="space-y-3">
        {ENCLOSURE_CHECKS.map((c) => {
          const overall: Tone = c.barrier !== 'ok' || c.waterQuality !== 'ok' || c.feedTemp !== 'ok' ? 'watch' : 'ok';
          return (
            <Card key={c.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-[18px]" style={{ color: 'var(--tenant-ink)' }}>
                  <StatusDot tone={overall} />
                  {c.enclosure}
                </h2>
                <span className="text-[12px]" style={{ color: 'var(--tenant-muted)' }}>{c.checkedBy} · {c.time}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Check label="Barrier integrity" tone={c.barrier} />
                <Check label="Water quality" tone={c.waterQuality} />
                <Check label="Feed-store temp" tone={c.feedTemp} />
              </div>
              {c.note ? <p className="mt-3 text-[13px] leading-relaxed" style={{ color: 'var(--tenant-muted)' }}>{c.note}</p> : null}
            </Card>
          );
        })}
      </div>

      <p className="mt-6 rounded-xl border-l-4 px-4 py-3 text-[12.5px] leading-relaxed" style={{ borderColor: 'var(--tenant-accent)', background: 'rgba(181,115,46,0.07)', color: 'var(--tenant-ink)' }}>
        <span className="font-medium">Notifiable events · </span>{NOTIFIABLE_EVENT_NOTE}
      </p>
    </div>
  );
}

function Check({ label, tone }: { label: string; tone: Tone }) {
  return (
    <div className="rounded-xl border px-3 py-2.5 text-center" style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-cream)' }}>
      <p className="font-mono text-[9.5px] uppercase tracking-[0.1em]" style={{ color: 'var(--tenant-muted)' }}>{label}</p>
      <div className="mt-1.5 flex justify-center">
        <TonePill tone={tone}>{CELL_LABEL[tone]}</TonePill>
      </div>
    </div>
  );
}
