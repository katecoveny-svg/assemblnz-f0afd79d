'use client';

import { useRef, useState } from 'react';
import { ArrowUpRight, Check, Download, Plus, X } from 'lucide-react';
import { DoShareButton } from '@/components/do/DoShareButton';
import { meetingWrapGaps, meetingWrapPack, type MeetingWrap } from '@/apps/do/shared/meeting-wrap';
import styles from '@/components/do/do-product-focus.module.css';
import room from './meeting-room.module.css';

const EMPTY: MeetingWrap = { aim: '', notes: '', decision: '', questions: '', noDecision: false, noActions: false, commitments: [] };
function keep(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function MeetingWorkpad({ onUseNotes, disabled }: { onUseNotes: (notes: string) => void; disabled: boolean }) {
  const [wrap, setWrap] = useState<MeetingWrap>(EMPTY);
  const [tab, setTab] = useState<'notes' | 'wrap'>('notes');
  const [reviewed, setReviewed] = useState(false);
  const [packOpen, setPackOpen] = useState(false);
  const [hint, setHint] = useState('');
  const nextId = useRef(0);
  const gaps = meetingWrapGaps(wrap);
  const pack = meetingWrapPack(wrap, reviewed);
  const hasEntries = Boolean(wrap.notes.trim() || wrap.aim.trim() || wrap.decision.trim() || wrap.questions.trim() || wrap.commitments.some(s => s.work.trim()) || wrap.noDecision || wrap.noActions);
  function edit(change: Partial<MeetingWrap>) { setWrap(current => ({ ...current, ...change })); setReviewed(false); setHint(''); }
  function editStep(id: string, key: 'work' | 'owner' | 'due', value: string) { edit({ commitments: wrap.commitments.map(s => s.id === id ? { ...s, [key]: value } : s) }); }

  return <aside className={room.notepad} aria-label="Your meeting notepad">
    <div className={room.notepadHead}><span className={styles.kicker}>BEFORE · DURING · AFTER</span><span className={room.local}>On this page</span></div>
    <div className={room.workpadTabs} role="group" aria-label="Meeting workpad">
      <button type="button" aria-pressed={tab === 'notes'} onClick={() => setTab('notes')}>Your notes</button>
      <button type="button" aria-pressed={tab === 'wrap'} onClick={() => setTab('wrap')}>Before we wrap <ArrowUpRight size={14} /></button>
    </div>
    {tab === 'notes' ? <>
      <h2>Leave with a next step.</h2>
      <label className={styles.field}>What should this meeting resolve?<input value={wrap.aim} maxLength={240} onChange={e => edit({ aim: e.target.value })} placeholder="The one thing to settle…" /></label>
      <label className={styles.field}>My notes<textarea value={wrap.notes} maxLength={7000} rows={8} onChange={e => edit({ notes: e.target.value })} placeholder={'Questions to ask…\n\nWhat we decided…\n\nPromises to keep…'} /></label>
      <div className={room.notepadActions}>
        <button type="button" className={styles.textButton} disabled={!wrap.notes.trim()} onClick={() => keep(wrap.notes, 'my-meeting-notes.txt')}><Download size={15} />Keep my notes</button>
        <button type="button" className={styles.textButton} disabled={!wrap.notes.trim() || disabled} onClick={() => onUseNotes(wrap.notes)}>Use these notes <ArrowUpRight size={15} /></button>
      </div>
      <button className={room.wrapPrompt} type="button" onClick={() => setTab('wrap')}><span>Before everyone leaves</span><strong>Decision. Owner. When.</strong><ArrowUpRight size={20} /></button>
    </> : <>
      <h2>Before we wrap.</h2>
      <p>Check the decision and next steps while everyone is still here. DO checks these fields as you fill them in.</p>
      <label className={styles.field}>What did you decide?<textarea rows={2} value={wrap.decision} maxLength={1500} disabled={wrap.noDecision} onChange={e => edit({ decision: e.target.value })} placeholder="We agreed to…" /></label>
      <label className={room.smallCheck}><input type="checkbox" checked={wrap.noDecision} onChange={e => edit({ noDecision: e.target.checked })} />No decision was needed</label>
      <div className={room.stepHeading}><h3>Who is doing what?</h3><button type="button" disabled={wrap.noActions || wrap.commitments.length >= 6} onClick={() => edit({ commitments: [...wrap.commitments, { id: String(++nextId.current), work: '', owner: '', due: '' }] })}><Plus size={16} />Add a next step</button></div>
      {!wrap.noActions && wrap.commitments.map((step, i) => <div className={room.commitment} key={step.id}>
        <div className={room.commitmentHead}><span>NEXT STEP {i + 1}</span><button type="button" aria-label={`Remove next step ${i + 1}`} onClick={() => edit({ commitments: wrap.commitments.filter(s => s.id !== step.id) })}><X size={16} /></button></div>
        <label className={styles.field}>Work to do<input value={step.work} maxLength={200} onChange={e => editStep(step.id, 'work', e.target.value)} placeholder="Prepare the pilot proposal" /></label>
        <div className={room.ownerDate}>
          <label className={styles.field}>Owner<input value={step.owner} maxLength={80} onChange={e => editStep(step.id, 'owner', e.target.value)} placeholder="Agree a person" /></label>
          <label className={styles.field}>Due<input value={step.due} maxLength={80} onChange={e => editStep(step.id, 'due', e.target.value)} placeholder="Agree a date" /></label>
        </div>
      </div>)}
      <label className={room.smallCheck}><input type="checkbox" checked={wrap.noActions} onChange={e => edit({ noActions: e.target.checked })} />No next steps were needed</label>
      <label className={styles.field}>Anything still unresolved?<textarea rows={2} value={wrap.questions} maxLength={1000} onChange={e => edit({ questions: e.target.value })} placeholder="A missing answer, a dependency, a decision to return to…" /></label>
      <div className={room.gaps}>
        <strong>{gaps.length ? `${gaps.length} ${gaps.length === 1 ? 'detail' : 'details'} to confirm` : 'The closing fields are complete.'}</strong>
        {gaps.length ? <ul>{gaps.map(gap => <li key={gap}>{gap}</li>)}</ul> : <p><Check size={14} />Check these entries against what was actually agreed.</p>}
      </div>
      <button type="button" className={styles.primary} disabled={!hasEntries} onClick={() => setPackOpen(!packOpen)} aria-expanded={packOpen}>{packOpen ? 'Close work pack' : 'Prepare my work pack'}<ArrowUpRight size={17} /></button>
      {packOpen && <div className={room.pack}>
        <h3>Your meeting, ready to take forward.</h3>
        <pre tabIndex={0} aria-label="Meeting work pack preview">{pack}</pre>
        <label className={room.smallCheck}><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />I checked this pack and want to share these details.</label>
        <div className={room.packActions}>
          <DoShareButton label="Share work pack" disabled={!reviewed} content={{ title: 'Meeting work pack · DO', text: pack, filename: 'meeting-work-pack.txt' }} />
          <button type="button" className={styles.textButton} onClick={() => keep(pack, 'meeting-work-pack.txt')}><Download size={15} />Download pack</button>
          <button type="button" className={styles.textButton} disabled={disabled} onClick={() => { if (pack.length > 12000) { setHint('The pack is too long for preparation. Shorten your notes first.'); return; } onUseNotes(pack); }}>Prepare a follow-up from this <ArrowUpRight size={15} /></button>
        </div>
        {hint && <p role="status">{hint}</p>}
      </div>}
    </>}
    <p className={room.help}>This pad checks what you enter. It does not listen to the recording. Download before leaving. Nothing is sent or booked here.</p>
  </aside>;
}
