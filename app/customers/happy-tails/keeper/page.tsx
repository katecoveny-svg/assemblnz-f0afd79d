import Link from 'next/link';
import { KeeperShell, DogAvatar, DemoPill } from './KeeperShell';
import { ROSTER, MORNING_ROUTE } from '@/lib/tenants/happy-tails/data';

export default function KeeperDashboard() {
  const base = '/customers/happy-tails/keeper';
  return (
    <KeeperShell active="dashboard">
      <div className="top">
        <div>
          <h1 className="h1">Kia ora, Liana</h1>
          <div className="sub">Wednesday 15 July 2026 · {ROSTER.length} dogs in today · bus rolls 7:30am</div>
        </div>
        <DemoPill />
      </div>

      <div className="qa">
        <Link className="btn" href={`${base}/welcome-pack`} style={{ textDecoration: 'none' }}>
          <button className="alt" type="button">＋ Draft owner comms</button>
        </Link>
        <Link href={`${base}/welcome-pack`} style={{ textDecoration: 'none' }}>
          <button type="button">▤ Draft Welcome Pack</button>
        </Link>
      </div>

      <div className="grid2">
        <div className="colstack">
          <div className="card">
            <h3>Dogs in today <span className="cnt">{ROSTER.length}</span></h3>
            {ROSTER.map((d) => (
              <Link key={d.slug} className="nmlink" href={`${base}/dogs/${d.slug}`} style={{ display: 'block' }}>
                <div className="dog">
                  <div className="av"><DogAvatar /></div>
                  <div>
                    <div className="nm">{d.name}</div>
                    <div className="meta">
                      {d.breed}
                      {d.discountPct > 0 ? ' · small pup' : ''} · {d.addresses[0]?.address}
                    </div>
                  </div>
                  <span className="tag">{d.weeklySchedule.includes('overnight') ? 'Overnight' : 'Bus'}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="card">
            <h3>Overdue &amp; upcoming tasks <span className="cnt">3</span></h3>
            <div className="task"><div className="ic r">!</div><div><div><b>Franklin</b> — kennel cough booster due in ~3 weeks</div><div className="who">Keeper drafted email · Liana to review + send → blocks overnights after expiry</div></div></div>
            <div className="task"><div className="ic y">↻</div><div><div><b>Council registration</b> — 4 dogs expire 30 June</div><div className="who">Keeper drafted per-owner nudges · awaiting approval</div></div></div>
            <div className="task"><div className="ic y">$</div><div><div><b>July invoices</b> — 12 drafts ready in Xero</div><div className="who">Franklin INV-3141 = $285 · review + issue</div></div></div>
          </div>
        </div>

        <div className="colstack">
          <div className="card">
            <h3>This morning&apos;s route <span className="cnt">Riverhead → loop</span></h3>
            <div className="route">
              {MORNING_ROUTE.stops.map((s) => (
                <div key={s.seq} className="stop">
                  <div className="rail"><div className="node">{s.seq}</div><div className="line" /></div>
                  <div className="body">
                    <div className="sub1">{s.suburb}</div>
                    <div className="sub2">{s.dog}</div>
                    <span className="win">{s.window}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href={`${base}/route`} style={{ display: 'inline-block', marginTop: 12, fontSize: 12.5, fontWeight: 600, color: 'var(--brown)' }}>Open route + pickup coordinator →</Link>
          </div>

          <div className="card">
            <h3>Xero reconciliation <span className="cnt">July</span></h3>
            <div className="recon"><div className="big">12<span style={{ fontSize: 20, color: 'var(--mute)' }}> / 14</span></div><div style={{ fontSize: 12.5, color: 'var(--ink2)' }}>draft invoices matched to bookings this month</div></div>
            <div className="bar"><i /></div>
            <div className="rowl"><span>Matched &amp; ready to issue</span><b>12</b></div>
            <div className="rowl"><span>Needs a booking check</span><b style={{ color: 'var(--warn)' }}>2</b></div>
            <div className="rowl"><span>Franklin · INV-3141</span><b>NZ$285.00</b></div>
            <Link href={`${base}/invoicing`} style={{ display: 'inline-block', marginTop: 12, fontSize: 12.5, fontWeight: 600, color: 'var(--brown)' }}>Reconcile invoices →</Link>
          </div>
        </div>
      </div>

      <div className="nextnav">
        <span style={{ color: 'var(--mute)', fontSize: 12.5 }}>Keeper drafts everything. Liana &amp; Mathis approve &amp; send.</span>
        <Link className="next" href={`${base}/dogs/franklin`}>Open Franklin&apos;s profile →</Link>
      </div>

      <div className="footattr">concept — happytails × assembl · powered by assembl · demo pending Liana sign-off</div>
    </KeeperShell>
  );
}
