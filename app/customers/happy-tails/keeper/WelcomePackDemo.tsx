'use client';

import { useMemo, useState } from 'react';
import { DEMO_DOG, FRANKLIN, welcomePackPages } from '@/lib/tenants/happy-tails/data';

type Step = 1 | 2 | 3 | 4;
type Mode = 'demo' | 'real';

const STEP_LABELS = ['Enrolment', 'Generate', 'Review', 'Send'];

/**
 * Welcome Pack clickable walkthrough for Liana.
 * Step 1 enrolment → Step 2 Keeper drafts the 5-page pack in Liana's voice →
 * Step 3 review + edit inline → Step 4 email PREVIEW before send → "Send to owner"
 * (never actually sends; logs a Mana Receipt). Demo mode uses a fake dog (Biscuit /
 * Sam) so Franklin's real record stays untouched; real mode gates the send behind a
 * confirm and never sends in this demo build.
 */
export function WelcomePackDemo() {
  const [mode, setMode] = useState<Mode>('demo');
  const [step, setStep] = useState<Step>(1);
  const [page, setPage] = useState(0);
  const [confirmReal, setConfirmReal] = useState(false);
  const [sent, setSent] = useState(false);

  const base = mode === 'demo'
    ? { dogName: DEMO_DOG.name, breed: DEMO_DOG.breed, age: DEMO_DOG.age, size: DEMO_DOG.size, ownerName: DEMO_DOG.ownerName, ownerEmail: DEMO_DOG.ownerEmail, days: DEMO_DOG.daysWanted, feeding: DEMO_DOG.feeding, medical: DEMO_DOG.medical, emergency: DEMO_DOG.emergencyContact, pronoun: { subj: 'they', obj: 'them', poss: 'their' } }
    : { dogName: FRANKLIN.name, breed: FRANKLIN.breed, age: '3 years', size: 'Small', ownerName: FRANKLIN.ownerName, ownerEmail: 'kate@••• · RLS-locked', days: 'Wed + Thu overnight', feeding: FRANKLIN.feeding, medical: 'None', emergency: 'Kate Hudson — primary', pronoun: { subj: 'he', obj: 'him', poss: 'his' } };

  const [form, setForm] = useState(base);

  // reset the form + flow when the mode changes
  function switchMode(m: Mode) {
    setMode(m);
    const b = m === 'demo'
      ? { dogName: DEMO_DOG.name, breed: DEMO_DOG.breed, age: DEMO_DOG.age, size: DEMO_DOG.size, ownerName: DEMO_DOG.ownerName, ownerEmail: DEMO_DOG.ownerEmail, days: DEMO_DOG.daysWanted, feeding: DEMO_DOG.feeding, medical: DEMO_DOG.medical, emergency: DEMO_DOG.emergencyContact, pronoun: { subj: 'they', obj: 'them', poss: 'their' } }
      : { dogName: FRANKLIN.name, breed: FRANKLIN.breed, age: '3 years', size: 'Small', ownerName: FRANKLIN.ownerName, ownerEmail: 'kate@••• · RLS-locked', days: 'Wed + Thu overnight', feeding: FRANKLIN.feeding, medical: 'None', emergency: 'Kate Hudson — primary', pronoun: { subj: 'he', obj: 'him', poss: 'his' } };
    setForm(b);
    setStep(1); setPage(0); setSent(false); setConfirmReal(false);
  }

  const pages = useMemo(() => welcomePackPages(form.dogName, form.ownerName, form.pronoun), [form.dogName, form.ownerName, form.pronoun]);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="modebar">
        <button type="button" className={mode === 'demo' ? 'on' : undefined} onClick={() => switchMode('demo')}>▶ Run demo — Biscuit (safe)</button>
        <button type="button" className={mode === 'real' ? 'on real' : undefined} onClick={() => switchMode('real')}>🔒 Real — Franklin (protected)</button>
      </div>
      <div className="note" style={{ marginBottom: 18 }}>
        {mode === 'demo'
          ? 'Demo mode — a fake dog (Biscuit, owner Sam). Nothing sends, nothing touches a real record. Safe to click through with Liana.'
          : "Real mode — Franklin's actual owner. The send is gated behind a confirm and still never sends in this demo build."}
      </div>

      <div className="steps">
        {STEP_LABELS.map((label, i) => {
          const n = (i + 1) as Step;
          const cls = step === n ? 'on' : step > n ? 'done' : '';
          return <div key={label} className={`stepchip ${cls}`}><span className="sn">{step > n ? '✓' : n}</span>{label}</div>;
        })}
      </div>

      {/* STEP 1 — enrolment form */}
      {step === 1 && (
        <div className="card">
          <h3>Step 1 · Enrolment form</h3>
          <div className="note" style={{ marginBottom: 16 }}>Owner fills this in on the website. {mode === 'demo' ? 'Prefilled for Biscuit — edit anything.' : "Franklin's details, protected."}</div>
          <div className="fld2">
            <div className="fld"><label>Dog name</label><input value={form.dogName} onChange={set('dogName')} /></div>
            <div className="fld"><label>Breed</label><input value={form.breed} onChange={set('breed')} /></div>
          </div>
          <div className="fld2">
            <div className="fld"><label>Age</label><input value={form.age} onChange={set('age')} /></div>
            <div className="fld"><label>Size</label>
              <select value={form.size} onChange={set('size')}><option>Small</option><option>Medium</option><option>Large</option></select>
            </div>
          </div>
          <div className="fld2">
            <div className="fld"><label>Owner name</label><input value={form.ownerName} onChange={set('ownerName')} /></div>
            <div className="fld"><label>Owner email</label><input value={form.ownerEmail} onChange={set('ownerEmail')} /></div>
          </div>
          <div className="fld"><label>Weekly schedule needed</label><input value={form.days} onChange={set('days')} /></div>
          <div className="fld2">
            <div className="fld"><label>Feeding</label><input value={form.feeding} onChange={set('feeding')} /></div>
            <div className="fld"><label>Medical</label><input value={form.medical} onChange={set('medical')} /></div>
          </div>
          <div className="fld"><label>Emergency contact</label><input value={form.emergency} onChange={set('emergency')} /></div>
          <button type="button" className="btn p" onClick={() => { setStep(2); setPage(0); }}>Generate Welcome Pack →</button>
        </div>
      )}

      {/* STEP 2 & 3 — pack preview + review */}
      {(step === 2 || step === 3) && (
        <div className="draftbox">
          <div className="dhd">
            <div className="packtabs">
              {pages.map((p, i) => (
                <button key={p.tab} type="button" className={`packtab${page === i ? ' on' : ''}`} onClick={() => setPage(i)}>{i + 1} · {p.tab}</button>
              ))}
            </div>
            <span className="voicelbl" style={{ marginLeft: 'auto' }}>page {page + 1} of {pages.length} · Liana&apos;s voice</span>
          </div>

          <div className={`packpage draftbody${pages[page].cover ? ' coverp' : ''}`}>
            {pages[page].cover && <div className="crmphoto" style={{ width: 120, height: 120, marginBottom: 16 }}><svg viewBox="0 0 120 62" fill="none" stroke="#7a4e2c" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path d="M16 40 Q9 38 10 30 Q11 23 16 23" /><path d="M16 23 Q24 16 40 20 L100 24 Q112 24 110 34" /><path d="M26 40v11M42 40v11M92 40v11M104 40v11" /></svg></div>}
            <h2 className="edit" contentEditable={step === 3} suppressContentEditableWarning>{pages[page].title}</h2>
            {pages[page].body.map((para, i) => (
              <p key={i} className="edit" contentEditable={step === 3} suppressContentEditableWarning>{para}</p>
            ))}
            {pages[page].steps.map((s, i) => (
              <div className="packstep" key={i}><div className="num">{i + 1}</div><div className="edit" contentEditable={step === 3} suppressContentEditableWarning>{s}</div></div>
            ))}
            {pages[page].sign && <p className="sign">Warmly,<br />Liana × Happy Tails</p>}
          </div>

          <div className="dactions">
            {step === 2 ? (
              <>
                <span className="note">Keeper drafted all 5 pages in Liana&apos;s voice in ~30s.</span>
                <button type="button" className="btn g" style={{ marginLeft: 'auto' }} onClick={() => setStep(1)}>← Back to form</button>
                <button type="button" className="btn p" onClick={() => setStep(3)}>Review &amp; edit →</button>
              </>
            ) : (
              <>
                <span className="note">✎ Click any line to edit · <button type="button" className="qbtn" style={{ padding: '4px 10px' }} onClick={() => {}}>⟳ Swap photo</button></span>
                <button type="button" className="btn g" style={{ marginLeft: 'auto' }} onClick={() => setStep(2)}>← Preview</button>
                <button type="button" className="btn p" onClick={() => setStep(4)}>Looks good — prepare email →</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* STEP 4 — email preview + send */}
      {step === 4 && !sent && (
        <div className="card">
          <h3>Step 4 · Email preview — before anything sends</h3>
          <div className="note" style={{ marginBottom: 14 }}>Liana always sees exactly what will go out. Keeper never sends without a human tap.</div>
          <div className="emailprev">
            <div className="eh">
              <div className="er"><span className="k">To</span><b>{form.ownerName} &lt;{form.ownerEmail}&gt;</b></div>
              <div className="er"><span className="k">From</span><b>Liana × Happy Tails &lt;admin@happytailsdaycare.co.nz&gt;</b></div>
              <div className="er"><span className="k">Subject</span><b>{form.dogName} - Happy Tails Welcome Pack</b></div>
            </div>
            <div className="eb">
              <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: '0 0 11px', color: 'var(--ink2)' }}>Kia ora {form.ownerName},</p>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: '0 0 11px', color: 'var(--ink2)' }}>We are so pleased to welcome {form.dogName} into the Happy Tails family. {form.pronoun.subj.charAt(0).toUpperCase() + form.pronoun.subj.slice(1)}&apos;ll have a wonderful time with us. Attached is {form.pronoun.poss} full Welcome Pack — everything you need before {form.pronoun.poss} first day.</p>
              <p className="sign" style={{ fontFamily: 'var(--serif)', fontSize: 16, margin: '12px 0 0' }}>Warmly,<br />Liana × Happy Tails</p>
              <div className="attach">📎 Welcome Pack – {form.dogName}.pdf</div>
              <div className="attach" style={{ background: '#f5fbff' }}>↳ also dropped in Xero as {form.dogName}&apos;s enrolment attachment</div>
            </div>
          </div>

          {mode === 'real' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 12.5, color: 'var(--ink2)' }}>
              <input type="checkbox" checked={confirmReal} onChange={(e) => setConfirmReal(e.target.checked)} />
              I confirm sending to {form.ownerName} (real owner) — required in real mode.
            </label>
          )}

          <div className="dactions" style={{ padding: '16px 0 0', background: 'transparent', border: 'none' }}>
            <span className="note">Mana Receipt logs the draft, the source, and this approval.</span>
            <button type="button" className="btn g" style={{ marginLeft: 'auto' }} onClick={() => setStep(3)}>← Back to pack</button>
            <button type="button" className="btn p" disabled={mode === 'real' && !confirmReal} style={mode === 'real' && !confirmReal ? { opacity: 0.5, cursor: 'not-allowed' } : undefined} onClick={() => setSent(true)}>
              Send to owner
            </button>
          </div>
        </div>
      )}

      {/* SENT confirmation */}
      {step === 4 && sent && (
        <div className="sentbanner">
          <div className="big">✓ {mode === 'demo' ? 'Sent (demo — safe)' : 'Approved — would send in production'}</div>
          <div className="note" style={{ maxWidth: 460, margin: '0 auto' }}>
            {form.dogName}&apos;s Welcome Pack email drafted in Liana&apos;s voice, PDF generated, dropped in Xero as the enrolment attachment, and a <b>Mana Receipt</b> written (drafted by Keeper · approved by Liana · {mode === 'demo' ? 'demo — not delivered' : 'held — no real send in this build'}).
          </div>
          <button type="button" className="btn p" style={{ marginTop: 14 }} onClick={() => { setStep(1); setPage(0); setSent(false); setConfirmReal(false); }}>Run it again</button>
        </div>
      )}
    </div>
  );
}
