import Link from 'next/link';
import { notFound } from 'next/navigation';
import { KeeperShell, DogAvatar, DemoPill } from '../../KeeperShell';
import { dogBySlug, ROSTER, FRANKLIN_SMS_THREAD } from '@/lib/tenants/happy-tails/data';

export function generateStaticParams() {
  return ROSTER.map((d) => ({ dog: d.slug }));
}

export default async function DogProfile({ params }: { params: Promise<{ dog: string }> }) {
  const { dog: slug } = await params;
  const dog = dogBySlug(slug);
  if (!dog) notFound();

  const base = '/customers/happy-tails/keeper';
  const dueSoon = dog.vaccinations.find((v) => v.status === 'due-soon');

  return (
    <KeeperShell active="dogs">
      <div className="crumb"><Link href={base}>Dashboard</Link> › Dog profiles › {dog.name}</div>
      <div className="phead">
        <div className="bigav"><DogAvatar /></div>
        <div>
          <h1 className="h1 big">{dog.name}</h1>
          <div className="sub">{dog.breed} · owner {dog.ownerName} · welcomed {dog.welcomedAt}</div>
          <div className="chips">
            {dog.discountPct > 0 && <span className="chip y">Small pup · {dog.discountPct}% discount</span>}
            <span className="chip g">Vaccinations current</span>
            <span className="chip">{dog.weeklySchedule}</span>
            {dog.record === 1 && <span className="chip">Record #1</span>}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}><DemoPill /></div>
      </div>

      <div className="grid11">
        <div className="colstack">
          <div className="card">
            <h3>Dog details</h3>
            <div className="kv"><span className="k">Breed</span><span className="v">{dog.breed}</span></div>
            <div className="kv"><span className="k">Size tier</span><span className="v">{dog.sizeTier}{dog.discountPct > 0 ? ` — ${dog.discountPct}% discount` : ''}</span></div>
            <div className="kv"><span className="k">Weekly schedule</span><span className="v">{dog.weeklySchedule}</span></div>
            <div className="kv"><span className="k">Feeding</span><span className="v">{dog.feeding}</span></div>
            <div className="kv"><span className="k">Allergies</span><span className={`v${dog.allergies ? '' : ' empty'}`}>{dog.allergies ?? 'None recorded'}</span></div>
            <div className="kv"><span className="k">Medical notes</span><span className={`v${dog.medicalNotes ? '' : ' empty'}`}>{dog.medicalNotes ?? 'None recorded'}</span></div>
            <div className="kv"><span className="k">Behaviour</span><span className="v">{dog.behaviour}</span></div>
          </div>

          <div className="card">
            <h3>Addresses — per day</h3>
            {dog.addresses.map((a, i) => (
              <div className="addr" key={i}>
                <div className={`lb${a.isDefault ? ' def' : ''}`}>{a.label}</div>
                <div className="a">{a.address}</div>
              </div>
            ))}
            {dog.scheduleDays.length > 0 && (
              <div className="wk">
                {dog.scheduleDays.map((d) => (
                  <span key={d.day} className={d.state === 'in' ? 'inn' : d.state === 'out' ? 'outt' : undefined}>{d.day}</span>
                ))}
              </div>
            )}
            <div style={{ fontSize: 11.5, color: 'var(--mute)', marginTop: 8 }}>Keeper picks the address for the day and drops it into Mathis&apos;s pickup SMS.</div>
          </div>

          <div className="card">
            <h3>Vaccinations &amp; registration</h3>
            {dog.vaccinations.map((v) => (
              <div className="vax" key={v.name}>
                <span className={`st ${v.status === 'due-soon' ? 'y' : 'g'}`} />
                {v.name}
                <span className={`exp${v.status === 'due-soon' ? ' warn' : ''}`}>
                  {v.status === 'due-soon' ? 'due ' : 'exp '}{v.expiry}
                </span>
              </div>
            ))}
            <div className="vax"><span className="st g" />Council registration<span className="exp">exp {dog.councilRegExpiry}</span></div>
            {dueSoon && (
              <div style={{ fontSize: 11.5, color: 'var(--warn)', marginTop: 10, background: '#fdf3dd', padding: '9px 11px', borderRadius: 9 }}>
                ⚠ {dueSoon.name} due soon — Keeper drafted a reminder email from Liana. No overnights accepted after expiry until renewed.
              </div>
            )}
          </div>
        </div>

        <div className="colstack">
          <div className="card">
            <span className="chan">SMS channel · Mathis&apos;s voice</span>
            <h3 style={{ marginBottom: 10 }}>Thread with {dog.ownerName} ({dog.name}&apos;s mum)</h3>
            <div className="thread">
              {FRANKLIN_SMS_THREAD.map((m, i) => (
                <div key={i} className={`sms ${m.from === 'carer' ? 'inb' : 'outb'}`}>
                  {m.text}
                  <span className="t">{m.from === 'carer' ? m.carer : dog.ownerName} · {m.at}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--mute)', marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              Keeper drafts the next-day pickup SMS in Mathis&apos;s voice. Mathis taps send from his own phone. Keeper never sends.
            </div>
          </div>

          <div className="card">
            <h3>Owner &amp; billing</h3>
            <div className="kv"><span className="k">Owner</span><span className="v">{dog.ownerName}</span></div>
            <div className="kv"><span className="k">Email</span><span className="v">{dog.ownerEmailMasked}</span></div>
            <div className="kv"><span className="k">Phone</span><span className="v">{dog.ownerPhoneMasked}</span></div>
            <div className="kv"><span className="k">Since</span><span className="v">welcomed {dog.welcomedAt}</span></div>
            <div style={{ marginTop: 14 }}>
              <div className="xero">
                <div className="lg">X</div>
                <div><div style={{ fontWeight: 600 }}>Xero contact linked</div><div style={{ color: 'var(--mute)', fontSize: 12 }}>{dog.ownerName} · {dog.latestInvoice.number} · {dog.latestInvoice.total} ({dog.latestInvoice.period})</div></div>
                <Link href={`${base}/invoicing`} style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#0f7fb0' }}>View →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="nextnav">
        <Link className="prev" href={base}>← Dashboard</Link>
        <Link className="next" href={`${base}/welcome-pack`}>Next: Welcome Pack generator →</Link>
      </div>
      <div className="footattr">concept — happytails × assembl · PII tenant-scoped &amp; RLS-locked · demo pending Liana sign-off</div>
    </KeeperShell>
  );
}
