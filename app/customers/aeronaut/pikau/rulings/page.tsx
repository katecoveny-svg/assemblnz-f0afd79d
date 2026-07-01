import type { Metadata } from 'next';
import { listRulings } from '@/lib/customs/store';
import { formatNzDate } from '@/lib/customs/format';
import { Card, PageHeader, Pill } from '@/components/customs/ui';

export const metadata: Metadata = { title: 'Tariff rulings' };

export default async function RulingsPage() {
  const rulings = await listRulings();
  return (
    <div>
      <PageHeader eyebrow="Operations" title="Binding tariff rulings" lead="Rulings sought and held (Customs and Excise Act 2018 s.135). A binding ruling locks classification and duty treatment before importation — the register keeps them and their expiry visible." />
      <div className="space-y-3">
        {rulings.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[color:var(--air-slate)]">{r.reference}</span>
                  <Pill tone={r.status === 'issued' ? 'ok' : r.status === 'sought' ? 'warn' : 'hold'}>{r.status}</Pill>
                </div>
                <p className="air-display mt-0.5 text-lg">{r.goods}</p>
                <p className="text-sm text-[color:var(--air-slate)]">{r.note}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-[color:var(--air-navy)]">{r.hsCode}</p>
                {r.issuedIso ? <p className="text-xs text-[color:var(--air-slate)]">issued {formatNzDate(r.issuedIso)}</p> : null}
                {r.expiresIso ? <p className="text-xs text-[color:var(--air-slate)]">expires {formatNzDate(r.expiresIso)}</p> : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
