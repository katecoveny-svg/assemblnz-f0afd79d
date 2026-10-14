'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { DoMark } from '@/components/do/DoMark';
import { acceptContact, approveProposal, changePlan, close, disclose, displayWindow, fixture, syntheticTransport, type Envelope, type Owner } from '@/apps/do/coordination/protocol';
import styles from './coordination.module.css';
const NOW = Date.parse('2026-10-04T19:00:00Z');
const names = { alex: 'Alex', sam: 'Sam' };
export default function CoordinationReview() {
  const [example, setExample] = useState(() => fixture());
  const [notice, setNotice] = useState('Each fictional adult reviews their own permission.');
  const [last, setLast] = useState<Envelope | null>(null);
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const s = example.session;
  async function share(who: Owner) {
    if (busy.current) return;
    busy.current = true; setPending(true);
    try {
      const approved = await disclose(s, who, example.privateWindows[who], NOW);
      setLast(approved.envelope);
      const delivered = await syntheticTransport.deliver(approved.session, approved.envelope.to, approved.envelope, NOW);
      setExample({ ...example, session: delivered.session });
      setNotice(`${names[who]} approved only the displayed availability window. Synthetic delivery accepted.`);
    } catch (error) { setNotice((error as Error).message); }
    finally { busy.current = false; setPending(false); }
  }
  function reset(noOverlap = false) { setLast(null); setExample(fixture(noOverlap)); setNotice(noOverlap ? 'Fictional windows have no overlap.' : 'New fictional session. No stored diary data.'); }
  return <main id="main-content" className={styles.main}>
    <header className={styles.header}><Link href="/do">← DO home</Link><span className={styles.mark}><DoMark /> EA coordination</span><span className={styles.label}>FICTIONAL REVIEW</span></header>
    <section className={styles.intro}><p className={styles.label}>TWO OWNERS · ONE BOUNDED TASK</p><h1>Find a time together.</h1><p>Alex’s EA DO and Sam’s EA DO coordinate a {s.durationMinutes}-minute catch-up. You play both adult owners in this review.</p><p className={styles.limit}>Synthetic transport. No real contacts, calendars or messages. Refresh clears this session.</p></section>
    <div className={styles.owners}>{(['alex', 'sam'] as Owner[]).map(who => <section className={styles.card} key={who} aria-label={`${names[who]} owner review`}>
      <div className={styles.avatar}><DoMark /></div><h2>{names[who]}’s EA DO</h2><p>Fictional adult owner · Pacific/Auckland</p>
      <h3>1. Accept this contact</h3><p>Coordinate this task with {names[who === 'alex' ? 'sam' : 'alex']}’s EA DO.</p>
      <button disabled={pending || s.contacts[who] || s.status !== 'contact'} onClick={() => setExample({ ...example, session: acceptContact(s, who, NOW) })}>{s.contacts[who] ? 'Contact accepted' : `Accept contact as ${names[who]}`}</button>
      <h3>2. Approve exact disclosure</h3><p className={styles.window}>{displayWindow(example.privateWindows[who][0])}</p><p>Share only this free window for this task, until 6 Oct, 11:00 am NZDT. Private diary details stay private.</p>
      <button disabled={pending || s.status !== 'disclosure' || !!s.disclosed[who]} onClick={() => void share(who)}>{s.disclosed[who] ? 'Window disclosure approved' : `Share window as ${names[who]}`}</button>
      <h3>3. Review the same proposal</h3><p>{s.proposal ? displayWindow(s.proposal) : 'Waiting for two approved windows.'}</p>
      <button disabled={pending || !s.digest || !['proposal', 'agreed'].includes(s.status) || !!s.approvals[who]} onClick={() => setExample({ ...example, session: approveProposal(s, who, s.revision, s.digest!, NOW) })}>{s.approvals[who] ? 'Proposal approved' : `Approve proposal as ${names[who]}`}</button>
    </section>)}</div>
    <section className={styles.receipt} aria-live="polite"><p className={styles.label}>REVISION {s.revision} · {s.status.replace('_', ' ').toUpperCase()}</p><h2>{s.receipt ? 'Proposal agreed.' : s.status === 'no_overlap' ? 'No shared time found.' : 'Both owners decide.'}</h2><p>{s.receipt ? `${displayWindow(s.receipt.slot)}. Both owners approved the same revision. Calendar booking created: no.` : notice}</p>{s.digest && <details><summary>Agreement evidence</summary><p className={styles.digest}>Revision {s.revision} · SHA-256 {s.digest}</p></details>}</section>
    <details className={styles.scenarios}><summary>Review the boundaries</summary><p>Changing a plan clears disclosures, approvals and the receipt. Three rounds maximum.</p><div className={styles.actions}>
      <button disabled={pending} onClick={() => reset()}>Reset example</button><button disabled={pending} onClick={() => reset(true)}>Try no overlap</button>
      <button disabled={pending || ['declined', 'expired', 'revoked'].includes(s.status)} onClick={() => setExample({ ...example, session: close(s, 'declined', NOW) })}>Decline task</button>
      <button disabled={pending} onClick={() => setExample({ ...example, session: close(s, 'revoked', NOW) })}>Revoke contact</button>
      <button disabled={pending} onClick={() => setExample({ ...example, session: close(s, 'expired', Date.parse(s.expiresAt)) })}>Advance to expiry</button>
      <button disabled={pending || s.revision >= 3 || ['declined', 'expired', 'revoked'].includes(s.status)} onClick={() => { setExample({ ...example, session: changePlan(s, s.durationMinutes === 30 ? 45 : 30, NOW) }); setNotice('Plan changed. Both owners must disclose and approve again.'); }}>Change duration</button>
      <button disabled={pending || !last || ['declined', 'expired', 'revoked'].includes(s.status)} onClick={async () => { if (!last || busy.current) return; busy.current = true; setPending(true); try { const result = await syntheticTransport.deliver(s, last.to, last, NOW); setNotice(result.duplicate ? 'Duplicate delivery ignored. No extra approval or receipt.' : 'Delivery accepted.'); } catch (error) { setNotice(`Replay rejected: ${(error as Error).message}`); } finally { busy.current = false; setPending(false); } }}>Replay last delivery</button>
    </div><p role="status">{notice}</p></details>
    <footer className={styles.footer}>Live pilot requires verified participants, mutual contact consent, scoped calendar permissions and isolated durable inboxes. This review grants none of those.</footer>
  </main>;
}
