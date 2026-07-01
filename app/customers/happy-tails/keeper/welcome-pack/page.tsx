import Link from 'next/link';
import { KeeperShell, DemoPill } from '../KeeperShell';
import { DraftSurface } from '../DraftSurface';
import { FRANKLIN } from '@/lib/tenants/happy-tails/data';

export default function WelcomePackPage() {
  const base = '/customers/happy-tails/keeper';
  const f = FRANKLIN;
  return (
    <KeeperShell active="welcome-pack">
      <div className="top">
        <div>
          <h1 className="h1">Welcome Pack &amp; owner comms</h1>
          <div className="sub">Enrolment form comes in → Keeper drafts in the right voice per channel → Liana reviews in ~2 min instead of 20–30.</div>
        </div>
        <DemoPill />
      </div>

      <div className="grid11" style={{ gridTemplateColumns: '0.85fr 1.15fr' }}>
        <div className="card" style={{ alignSelf: 'start' }}>
          <h3>Enrolment form · from website</h3>
          <div className="note" style={{ marginBottom: 14 }}>{f.name}&apos;s enrolment, as submitted by {f.ownerName} on the Wix form.</div>
          <div className="kv"><span className="k">Dog name</span><span className="v">{f.name}</span></div>
          <div className="kv"><span className="k">Breed</span><span className="v">{f.breed}</span></div>
          <div className="kv"><span className="k">Size</span><span className="v">{f.sizeTier}</span></div>
          <div className="kv"><span className="k">Owner</span><span className="v">{f.ownerName}</span></div>
          <div className="kv"><span className="k">Days wanted</span><span className="v">Wed + Thu overnight</span></div>
          <div className="kv"><span className="k">Pickup suburb</span><span className="v">CBD / Kohi</span></div>
          <div className="kv"><span className="k">Feeding</span><span className="v">{f.feeding}</span></div>
          <div className="kv"><span className="k">Allergies / medical</span><span className="v empty">None</span></div>

          <div style={{ background: '#f5efe0', borderLeft: '3px solid var(--brown)', borderRadius: '0 10px 10px 0', padding: '12px 15px', marginTop: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--brown)', marginBottom: 6 }}>Reference voice — Liana</div>
            <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.45, color: '#2a2418' }}>
              &ldquo;We are so happy to have Franklin… we care for every dog as if they were our own.&rdquo;
            </p>
          </div>
          <div className="note" style={{ marginTop: 12 }}>
            Keeper matches this tone: <b>Kia ora</b> opener, &ldquo;Happy Tails family&rdquo;, &ldquo;your pup&rdquo;, no emoji in body, <b>Warmly, Liana</b> sign-off.
          </div>
        </div>

        <div style={{ alignSelf: 'start' }}>
          <DraftSurface />
          <div className="stamp">
            <b>Mana Receipt</b> · drafted by Keeper · source: enrolment form ({f.name}) + Happy Tails Welcome Pack template ·
            <b> Animal Welfare Act 1999</b> notice attached · <b>Privacy Act 2020 IPP 3A</b> — automated draft about a named person; human review right applies · awaiting approval. Keeper never sends.
          </div>
        </div>
      </div>

      <div className="nextnav">
        <Link className="prev" href={`${base}/dogs/franklin`}>← Franklin&apos;s profile</Link>
        <Link className="next" href={`${base}/route`}>Next: Bus route + pickup coordinator →</Link>
      </div>
      <div className="footattr">concept — happytails × assembl · two-voice discipline enforced · demo pending Liana sign-off</div>
    </KeeperShell>
  );
}
