import Link from 'next/link';
import { KeeperShell, DemoPill } from '../KeeperShell';
import { TEAM, type TeamMember } from '@/lib/tenants/happy-tails/data';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABEL: Record<string, string> = { mon: 'M', tue: 'T', wed: 'W', thu: 'T', fri: 'F', sat: 'S', sun: 'S' };

function roleClass(role: TeamMember['role']) {
  return role === 'owner' ? 'y' : role === 'vet' ? 'g' : '';
}

export default function TeamPage() {
  const base = '/customers/happy-tails/keeper';
  return (
    <KeeperShell active="team">
      <div className="top">
        <div>
          <h1 className="h1">Team roster</h1>
          <div className="sub">Happy Tails staff, shifts, and the voice profile Keeper drafts in for each person. Two-voice discipline lives here.</div>
        </div>
        <DemoPill />
      </div>

      <div className="teamgrid">
        {TEAM.map((m) => (
          <div key={m.name} className={`card teamcard${m.placeholder ? ' ph' : ''}`}>
            <div className="teamhd">
              <div className="tav">{m.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div className="tname">{m.name}</div>
                <div className="troles">
                  <span className={`chip ${roleClass(m.role)}`}>{m.role}</span>
                  <span className={`permbadge ${m.permissions === 'approve outgoing' ? 'approve' : m.permissions === 'draft only' ? 'draft' : 'ro'}`}>{m.permissions}</span>
                </div>
              </div>
            </div>

            <div className="kv"><span className="k">Phone</span><span className={`v${m.phone ? '' : ' empty'}`}>{m.phone ?? 'Not on file'}</span></div>
            <div className="kv"><span className="k">Email</span><span className={`v${m.email ? '' : ' empty'}`}>{m.email ?? 'Not on file'}</span></div>

            <div className="teamsub">Shifts</div>
            <div className="shiftgrid">
              <div className="shiftrow"><span className="slabel" /><>{DAYS.map((d) => <span key={d} className="sday">{DAY_LABEL[d]}</span>)}</></div>
              <div className="shiftrow"><span className="slabel">AM</span><>{DAYS.map((d) => <span key={d} className={`scell${m.shifts[d]?.am ? ' on' : ''}`} />)}</></div>
              <div className="shiftrow"><span className="slabel">PM</span><>{DAYS.map((d) => <span key={d} className={`scell${m.shifts[d]?.pm ? ' on' : ''}`} />)}</></div>
            </div>

            <div className="teamsub">Voice profile <span className="vchan">{m.voiceProfile.channel ? (m.voiceProfile.channel === 'sms' ? 'SMS' : m.voiceProfile.channel === 'email' ? 'Email' : m.voiceProfile.channel) : '—'}</span></div>
            <div className="note" style={{ marginBottom: m.voiceProfile.samples.length ? 8 : 0 }}>{m.voiceProfile.tone}</div>
            {m.voiceProfile.samples.map((s, i) => (
              <div key={i} className="voicesample">&ldquo;{s}&rdquo;</div>
            ))}
            {m.placeholder && <div className="phnote">Keeper captures this person&apos;s voice sample on onboarding before drafting in it.</div>}
          </div>
        ))}
      </div>

      <div className="note" style={{ marginTop: 16, background: '#f4eee0', borderRadius: 10, padding: '12px 14px' }}>
        Permission levels gate what Keeper lets each person do: <b>approve outgoing</b> (Liana signs comms + issues invoices), <b>draft only</b> (Mathis + carers approve their own SMS), <b>read-only</b> (handlers see the roster). Keeper never sends on anyone&apos;s behalf.
      </div>

      <div className="nextnav">
        <Link className="prev" href={`${base}/receipts`}>← Mana Receipts</Link>
        <Link className="next" href={base}>Back to dashboard →</Link>
      </div>
      <div className="footattr">concept — happytails × assembl · demo pending Liana sign-off</div>
    </KeeperShell>
  );
}
