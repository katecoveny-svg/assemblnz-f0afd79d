'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DogAvatar } from './KeeperShell';
import type { Dog, DogEvent, SmsMessage } from '@/lib/tenants/happy-tails/data';

const EVENT_ICON: Record<string, string> = {
  booking: '📅', sms: '💬', email: '✉', welcome_pack: '📦', invoice: '$',
  incident: '⚠', note: '📝', vaccination: '💉', field_edit: '✎',
};

/**
 * Live dog CRM. Editable sections; every field edit writes a Mana Receipt row
 * (logged to the timeline as a field_edit event). Quick actions draft comms —
 * Keeper never sends. Real mode protects Franklin's actual record; demo mode is a
 * safe sandbox that never persists.
 */
export function DogCrm({
  dog,
  initialEvents,
  smsThread,
}: {
  dog: Dog;
  initialEvents: DogEvent[];
  smsThread: SmsMessage[];
}) {
  const [mode, setMode] = useState<'real' | 'demo'>('real');
  const [events, setEvents] = useState<DogEvent[]>(initialEvents);
  const [toast, setToast] = useState<string | null>(null);
  const base = '/customers/happy-tails/keeper';

  // Editable state
  const [schedule, setSchedule] = useState(dog.weeklySchedule);
  const [tier, setTier] = useState(dog.discountPct > 0 ? 'Small pup — 10% discount' : dog.sizeTier);
  const [vet, setVet] = useState('Kohi vet (on file)');
  const [behaviour, setBehaviour] = useState(dog.behaviour);
  const [noteDraft, setNoteDraft] = useState('');

  const stamp = () => new Date().toLocaleString('en-NZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  function logEvent(type: DogEvent['type'], title: string, detail: string, actor = 'Liana') {
    setEvents((prev) => [{ type, actor, title, detail, at: `${stamp()} · just now` }, ...prev]);
  }

  function onEdit(field: string, detail: string) {
    logEvent('field_edit', `${field} updated`, detail, mode === 'real' ? 'Liana' : 'Demo user');
    setToast(`Mana Receipt written — ${field} changed by ${mode === 'real' ? 'Liana' : 'demo user'} · ${stamp()}`);
    window.setTimeout(() => setToast(null), 4000);
  }

  function quickAction(kind: string) {
    const map: Record<string, [DogEvent['type'], string, string]> = {
      sms: ['sms', 'Pickup SMS drafted', `Keeper drafted a next-day SMS in Mathis's voice — awaiting approval`],
      email: ['email', 'Email drafted', `Keeper drafted an email in Liana's voice — awaiting approval`],
      incident: ['incident', 'Incident logged', 'AWA-compliant incident draft started — awaiting Liana review'],
      note: ['note', 'Note added', noteDraft || 'New note'],
    };
    const [type, title, detail] = map[kind];
    logEvent(type, title, detail, kind === 'sms' ? 'Mathis' : 'Liana');
    setToast(`${title} — logged to Mana Receipt · Keeper never sends`);
    if (kind === 'note') setNoteDraft('');
    window.setTimeout(() => setToast(null), 4000);
  }

  return (
    <div>
      <div className="modebar">
        <button type="button" className={mode === 'demo' ? 'on' : undefined} onClick={() => setMode('demo')}>▶ Run demo (safe)</button>
        <button type="button" className={mode === 'real' ? 'on real' : undefined} onClick={() => setMode('real')}>🔒 Real mode — Franklin</button>
      </div>
      <div className="note" style={{ marginBottom: 16 }}>
        {mode === 'real'
          ? "Real mode — Franklin's actual record. Edits are protected and write a Mana Receipt (who changed what, when)."
          : 'Demo mode — a safe sandbox. Nothing here persists to the real record.'}
      </div>

      <div className="crmhead">
        <div className="crmphoto"><DogAvatar /></div>
        <div style={{ flex: 1 }}>
          <h1 className="h1 big" style={{ marginBottom: 4 }}>{dog.name}</h1>
          <div className="sub">{dog.breed} · owner {dog.ownerName} · welcomed {dog.welcomedAt}</div>
          <div className="note" style={{ marginTop: 6 }}>Emergency contact: {dog.ownerName} — primary · RLS-locked</div>
          <div className="qacts">
            <button type="button" className="qbtn" onClick={() => quickAction('sms')}>💬 Draft SMS</button>
            <button type="button" className="qbtn" onClick={() => quickAction('email')}>✉ Draft email</button>
            <button type="button" className="qbtn" onClick={() => quickAction('incident')}>⚠ Log incident</button>
            <button type="button" className="qbtn p" onClick={() => quickAction('note')}>📝 Add note</button>
          </div>
        </div>
      </div>

      {toast && <div className="savedtoast" style={{ marginTop: -6, marginBottom: 16 }}>✓ {toast}</div>}

      <div className="crmgrid">
        {/* LEFT — timeline */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <h3>Timeline <span className="cnt">{events.length}</span></h3>
          <div className="fld" style={{ display: 'flex', gap: 8 }}>
            <input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add a note to Franklin's timeline…" style={{ flex: 1 }} />
            <button type="button" className="btn p" style={{ padding: '9px 14px' }} onClick={() => quickAction('note')}>Add</button>
          </div>
          <div className="tl" style={{ marginTop: 8 }}>
            {events.map((e, i) => (
              <div className="tlrow" key={i}>
                <div className="tlrail"><div className="tldot">{EVENT_ICON[e.type] ?? '•'}</div><div className="tlline" /></div>
                <div className="tlbody">
                  <div className="tltitle">{e.title}</div>
                  <div className="tldetail">{e.detail}</div>
                  <div className="tlmeta">{e.actor} · {e.at}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — editable + SMS + xero */}
        <div className="colstack">
          <div className="card">
            <h3>Schedule &amp; service — editable</h3>
            <div className="editrow"><span className="k">Weekly schedule</span><input value={schedule} onChange={(e) => setSchedule(e.target.value)} onBlur={() => onEdit('Weekly schedule', schedule)} /></div>
            <div className="editrow"><span className="k">Service tier</span>
              <select value={tier} onChange={(e) => { setTier(e.target.value); onEdit('Service tier', e.target.value); }}>
                <option>Small pup — 10% discount</option>
                <option>Standard</option>
                <option>Large</option>
              </select>
            </div>
            <div className="editrow"><span className="k">Default address</span><span className="v">{dog.addresses[0]?.address}</span></div>
          </div>

          <div className="card">
            <h3>Medical — editable</h3>
            <div className="editrow"><span className="k">Vet</span><input value={vet} onChange={(e) => setVet(e.target.value)} onBlur={() => onEdit('Vet', vet)} /></div>
            {dog.vaccinations.map((v) => (
              <div className="vax" key={v.name}><span className={`st ${v.status === 'due-soon' ? 'y' : 'g'}`} />{v.name}<span className={`exp${v.status === 'due-soon' ? ' warn' : ''}`}>{v.status === 'due-soon' ? 'due ' : 'exp '}{v.expiry}</span></div>
            ))}
            <div className="editrow"><span className="k">Allergies</span><span className="v empty">None recorded</span></div>
          </div>

          <div className="card">
            <h3>Behaviour notes — editable</h3>
            <div className="fld" style={{ marginBottom: 0 }}>
              <input value={behaviour} onChange={(e) => setBehaviour(e.target.value)} onBlur={() => onEdit('Behaviour notes', behaviour)} style={{ textAlign: 'left' }} />
            </div>
            <div className="note" style={{ marginTop: 8 }}>Play preferences · dogs to keep separate · sleep spots · feeding style — surfaced when Keeper drafts a play-group allocation.</div>
          </div>

          <div className="card">
            <span className="chan">SMS channel · Mathis&apos;s voice</span>
            <h3 style={{ marginBottom: 10 }}>Recent thread</h3>
            <div className="thread">
              {smsThread.slice(0, 3).map((m, i) => (
                <div key={i} className={`sms ${m.from === 'carer' ? 'inb' : 'outb'}`}>{m.text}<span className="t">{m.from === 'carer' ? m.carer : dog.ownerName} · {m.at}</span></div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Xero &amp; payments</h3>
            <div className="xero"><div className="lg">X</div><div><div style={{ fontWeight: 600 }}>Xero contact linked</div><div style={{ color: 'var(--mute)', fontSize: 12 }}>{dog.ownerName} · {dog.latestInvoice.number} · {dog.latestInvoice.total} ({dog.latestInvoice.period})</div></div><Link href={`${base}/invoicing`} style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#0f7fb0' }}>View →</Link></div>
            <div className="rowl" style={{ marginTop: 10 }}><span>June · INV-3031</span><b>NZ$665.00 · paid</b></div>
            <div className="rowl"><span>July · INV-3141 (draft)</span><b>NZ$285.00 · pending</b></div>
          </div>
        </div>
      </div>
    </div>
  );
}
