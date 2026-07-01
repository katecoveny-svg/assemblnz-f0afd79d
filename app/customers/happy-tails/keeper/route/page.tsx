import Link from 'next/link';
import { KeeperShell, DogAvatar, DemoPill } from '../KeeperShell';
import { MORNING_ROUTE } from '@/lib/tenants/happy-tails/data';

const SMS_QUEUE = [
  { dog: 'Franklin', to: 'Kate Hudson', text: 'Hi there, Pick for Franklin tomorrow will be between 7.50-8.15am. City address right? Thanks Mathis 😀', note: 'CBD confirmed for today', status: 'draft' as const },
  { dog: 'Miso', to: 'Priya', text: 'Hi there, Pick for Miso tomorrow will be between 7.30-8.00am. Kohi address today, not the usual — that right? Thanks Mathis 😀', note: 'Keeper flagged the address override', status: 'draft' as const },
  { dog: 'Waffles', to: 'Sam', text: 'Hi there, Pick for Waffles tomorrow will be between 7.35-8.00am. Same Ponsonby address? Thanks Mathis 😀', note: '', status: 'sent' as const },
];

export default function RoutePage() {
  const base = '/customers/happy-tails/keeper';
  const r = MORNING_ROUTE;
  return (
    <KeeperShell active="route">
      <div className="top">
        <div>
          <h1 className="h1">Bus route + pickup coordinator</h1>
          <div className="sub">{r.date} · {r.origin} · Keeper optimised the loop against today&apos;s per-dog address overrides.</div>
        </div>
        <DemoPill />
      </div>

      <div className="grid11" style={{ gridTemplateColumns: '0.9fr 1.1fr' }}>
        <div className="card" style={{ alignSelf: 'start' }}>
          <h3>This morning&apos;s route <span className="cnt" style={{ color: 'var(--brown)' }}>Riverhead → CBD → Ponsonby → Grey Lynn → Kohi</span></h3>
          <div className="route">
            <div className="stop"><div className="rail"><div className="node origin">◆</div><div className="line" /></div><div className="body"><div className="sub1">{r.origin}</div><div className="sub2">Bus departs · {r.departs}</div></div></div>
            {r.stops.map((s) => (
              <div key={s.seq} className="stop">
                <div className="rail"><div className="node">{s.seq}</div><div className="line" /></div>
                <div className="body">
                  <div className="sub1">{s.dog} <span className="sub2" style={{ display: 'inline' }}>· {s.suburb}</span></div>
                  <div className="sub2">{s.address}{s.override ? '' : ''}</div>
                  <span className="win">{s.window}</span>
                  {s.override && <span className="ov">override — today only</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="summ">
            {r.stops.length} bus pickups · ~{r.loopMinutes} min loop · <b>{r.distanceKm} km</b>. Keeper re-sequenced when Miso moved to Kohi for the day — CBD now leads, Kohi closes the eastern leg. <b>Franklin</b> stays CBD today (Kohi only on his Tue weeks).
          </div>
        </div>

        <div style={{ alignSelf: 'start' }}>
          <span className="chan">SMS channel · Mathis&apos;s voice · drafts ready to send</span>
          <h3 style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--mute)', margin: '0 0 12px' }}>
            Per-parent pickup SMS — tap approve → Mathis sends from his phone
          </h3>
          {SMS_QUEUE.map((s) => (
            <div key={s.dog} className="card" style={{ marginBottom: 13, padding: '14px 16px', opacity: s.status === 'sent' ? 0.85 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                <div className="av" style={{ width: 30, height: 30 }}><DogAvatar /></div>
                <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.dog}</div><div style={{ color: 'var(--mute)', fontSize: 11.5 }}>to {s.to} · 021 •••</div></div>
                <span style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 999, ...(s.status === 'sent' ? { color: 'var(--good)', background: '#eef4ef' } : { color: 'var(--warn)', background: '#fdf3dd' }) }}>
                  {s.status === 'sent' ? 'sent 7:41pm ✓' : 'draft · awaiting Mathis'}
                </span>
              </div>
              <div className="bubble" style={{ maxWidth: '100%' }}>{s.text}</div>
              {s.status === 'draft' && (
                <div className="dactions" style={{ padding: '10px 0 0', background: 'transparent', border: 'none' }}>
                  <span className="note">✎ {s.note}</span>
                  <button type="button" className="btn g" style={{ marginLeft: 'auto', padding: '8px 14px' }}>Edit</button>
                  <button type="button" className="btn p" style={{ padding: '8px 14px' }}>Approve + send</button>
                </div>
              )}
            </div>
          ))}
          <div className="note">Pre-pickup checklist rides in every send: <b>fed · toileted · collar + tag</b>. Keeper drafts; Mathis approves + sends. Keeper never sends on its own.</div>
        </div>
      </div>

      <div className="nextnav">
        <Link className="prev" href={`${base}/welcome-pack`}>← Welcome Pack</Link>
        <Link className="next" href={`${base}/invoicing`}>Next: Xero invoice reconciliation →</Link>
      </div>
      <div className="footattr">concept — happytails × assembl · demo pending Liana sign-off</div>
    </KeeperShell>
  );
}
