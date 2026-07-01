import Link from 'next/link';
import { KeeperShell, DemoPill } from '../KeeperShell';
import { DraftSurface } from '../DraftSurface';
import { WelcomePackDemo } from '../WelcomePackDemo';

export default function WelcomePackPage() {
  const base = '/customers/happy-tails/keeper';
  return (
    <KeeperShell active="welcome-pack">
      <div className="top">
        <div>
          <h1 className="h1">Welcome Pack generator</h1>
          <div className="sub">Enrolment → Keeper drafts the 5-page pack in Liana&apos;s voice → review inline → email preview → send. Click it through with Liana.</div>
        </div>
        <DemoPill />
      </div>

      <WelcomePackDemo />

      <div style={{ marginTop: 34, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
        <h3 style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--mute)', margin: '0 0 4px' }}>Other owner comms — channel-aware voice</h3>
        <div className="note" style={{ marginBottom: 16 }}>The same draft engine switches voice by channel: SMS sounds like Mathis, email like Liana, Xero formal. Never mixed. Every draft is human-approved.</div>
        <DraftSurface />
        <div className="stamp">
          <b>Mana Receipt</b> · drafted by Keeper · <b>Animal Welfare Act 1999</b> notice attached · <b>Privacy Act 2020 IPP 3A</b> — automated draft about a named person; human review right applies · Keeper never sends.
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
