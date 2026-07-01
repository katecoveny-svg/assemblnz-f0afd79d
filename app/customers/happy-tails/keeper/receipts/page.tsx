import Link from 'next/link';
import { KeeperShell, DemoPill } from '../KeeperShell';
import { MANA_RECEIPTS } from '@/lib/tenants/happy-tails/data';

const EXCERPTS: Record<string, string> = {
  'mr-biz-change': '“Kia ora Happy Tails family, We wanted to reach out about a small change… increasing our Overnight Care rate by $5 per night… We’ve held off on this for as long as we possibly could… Warmly, Liana × Happy Tails”',
  'mr-sms-franklin': '“Hi there, Pick for Franklin tomorrow will be between 7.50-8.15am. City address right? Thanks Mathis 😀”',
  'mr-welcome-franklin': '“Welcome to the Happy Tails family, Franklin… we are so pleased to welcome him… we care for every dog as if they were our own. Warmly, Liana × Happy Tails”',
  'mr-xero-franklin': '3 × Daycare with bus · 2 overnight sets (small-pup) · −$57 prepaid credit (24 Jun unused). Subtotal NZ$285.00 · 7-day terms.',
};

export default function ReceiptsPage() {
  const base = '/customers/happy-tails/keeper';
  const initials = (v: string) => (v === 'liana' ? 'L' : v === 'mathis' ? 'M' : 'X');

  return (
    <KeeperShell active="receipts">
      <div className="top">
        <div>
          <h1 className="h1">Mana Receipts</h1>
          <div className="sub">Every draft, who approved it, when it sent, and the source data behind it. The audit trail for the day.</div>
        </div>
        <DemoPill />
      </div>

      <div className="filters">
        <span className="lbl">Filter</span>
        <span className="chipf on">All</span>
        <span className="chipf">By dog · Franklin</span>
        <span className="chipf">By carer · Mathis</span>
        <span className="chipf">By carer · Liana</span>
        <span className="chipf">By date · Wed 15 Jul</span>
      </div>

      {MANA_RECEIPTS.map((r) => (
        <div key={r.id} className="rcard">
          <div className="rhd">
            <div className={`who ${r.voice}`}>{initials(r.voice)}</div>
            <div>
              <div className="t">{r.title}</div>
              <div className="sub2">
                {r.approvedBy ? <>Signed by <b>{r.signedBy}</b> · to {r.recipient}</> : <>Awaiting <b>{r.recipient.split(' · ')[0].includes('Liana') ? 'Liana' : r.signedBy}</b> · {r.recipient}</>}
              </div>
            </div>
            <span className={`cchan ${r.channel}`}>{r.channel === 'sms' ? 'SMS · Mathis' : r.channel === 'email' ? 'Email · Liana' : 'Xero · formal'}</span>
          </div>
          <div className="rbody">
            <div className="excerpt"><span className="q">{EXCERPTS[r.id]}</span></div>
            <div className="rmeta">
              <div className="row"><span className="k">Drafted</span><span>{r.draftedBy} · {r.draftedAt}</span></div>
              <div className="row"><span className="k">Approved</span><span className={r.approvedBy ? 'approved' : 'pending'}>{r.approvedBy ? `${r.approvedBy} · ${r.approvedAt} ✓` : 'Pending ⧗'}</span></div>
              <div className="row"><span className="k">Sent</span><span>{r.sentAt ?? '—'}</span></div>
              <div className="row"><span className="k">Source</span><span>{r.sources.join(' · ')}</span></div>
            </div>
          </div>
          <div className="hashrow">
            <span className="lead">lead = Keeper · bundle Kaitiaki</span>
            {r.hardRules.map((h) => <span key={h}>{h}</span>)}
            <code>{r.hash}</code>
          </div>
        </div>
      ))}

      <div className="note" style={{ marginTop: 8, background: '#f5efe0', borderRadius: 10, padding: '12px 14px' }}>
        <b>Liana</b> sits at the top of every business-change and email receipt. <b>Mathis</b> sits at the top of every SMS receipt. Keeper drafts and stamps — it never signs, never sends. Two-voice discipline is enforced by a hard rule: email is always Liana, SMS is always the assigned carer, never mixed.
      </div>

      <div className="nextnav">
        <Link className="prev" href={`${base}/invoicing`}>← Xero invoicing</Link>
        <Link className="next" href={base}>Back to dashboard →</Link>
      </div>
      <div className="footattr">concept — happytails × assembl · assembl attribution lives here + a subtle footer only · demo pending Liana sign-off</div>
    </KeeperShell>
  );
}
