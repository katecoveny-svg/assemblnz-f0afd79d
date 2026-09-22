'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Battery, CarFront, Check, ShieldCheck, Sun, RotateCcw, Download, Droplets } from 'lucide-react';
import { DoMark } from '@/components/do/DoMark';
import { clock, createSimulatedUtilityAdapter, defaultEnvelope, type Envelope, type Plan, type Receipt, type Scenario } from '@/lib/flex/adapter';
import s from './flex.module.css';

const scenarios: { id: Scenario; name: string; detail: string; ready: string }[] = [
  { id: 'morning', name: 'Ready by morning', detail: 'Your day comes first.', ready: '06:45' },
  { id: 'solar', name: 'Use my sun', detail: 'Make room for the afternoon.', ready: '15:00' },
  { id: 'storm', name: 'Storm reserve', detail: 'Keep something in reserve.', ready: '06:45' },
  { id: 'shortfall', name: 'When plans change', detail: 'Know when to ask a person.', ready: '06:45' },
];

export function FlexExperience({ surface = 'do' }: { surface?: 'do' | 'studio' | 'pursuit' }) {
  const [adapter] = useState(createSimulatedUtilityAdapter);
  const [scenario, setScenario] = useState<Scenario>('morning');
  const [envelope, setEnvelope] = useState<Envelope>({ ...defaultEnvelope });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [result, setResult] = useState<Receipt | null>(null);
  const [history, setHistory] = useState<Receipt[]>([]);
  const [error, setError] = useState('');
  const [handoff, setHandoff] = useState(false);
  const context = adapter.read(scenario);
  function retirePlan() {
    if (!plan || result?.status === 'overridden') return;
    const stopped = adapter.override(plan);
    if (result?.status === 'simulated') setHistory(previous => [...previous, stopped]);
  }
  function change(next: Envelope) {
    retirePlan();
    setEnvelope(next); setPlan(null); setResult(null); setError(''); setHandoff(false);
  }
  function prepare() {
    try { retirePlan(); setPlan(adapter.prepare(context, envelope)); setResult(null); setError(''); setHandoff(false); }
    catch { setError('Check your ready-by time and household boundaries before preparing a plan.'); }
  }
  function approve(now: number) {
    if (!plan) return;
    try {
      const receipt = adapter.execute(plan, { planId: plan.id, fingerprint: plan.fingerprint, account: context.account, authority: 'simulate', expiresAt: now + 60000 }, envelope, now);
      setResult(receipt); setHistory(previous => [...previous, receipt]); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Prepare and review a new plan.'); }
  }
  function override() {
    if (!plan) return;
    const receipt = adapter.override(plan);
    setResult(receipt); setHistory(previous => [...previous, receipt]);
  }
  function download() {
    const blob = new Blob([JSON.stringify({ mode: 'simulated', retained: 'this tab only', context, envelope, plan, receipts: history }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'assembl-flex-simulation.json'; a.click(); URL.revokeObjectURL(url);
  }
  return <main className={s.page}>
    <header className={s.header}><Link href="/" className={s.brand}>assembl <span>flex</span></Link><nav aria-label="Flex surfaces"><Link href="/pursuit/flex" aria-current={surface === 'pursuit' ? 'page' : undefined}>Pursuit</Link><Link href="/do/flex" aria-current={surface === 'do' ? 'page' : undefined}>DO</Link><Link href="/creative-studio/flex" aria-current={surface === 'studio' ? 'page' : undefined}>Studio</Link></nav><span className={s.badge}>SIMULATED EXPERIENCE</span></header>
    <section className={s.intro}><div><p className={s.eyebrow}>YOUR HOME, IN AGREEMENT</p><h1>A little flexibility.<br /><span>On your terms.</span></h1></div><p>Your car ready. Your reserve protected.<br />See how a household agent could make energy work around your life.</p></section>
    <div className={s.scenarios} aria-label="Choose a fictional scenario">{scenarios.map(item => <button key={item.id} aria-pressed={scenario === item.id} onClick={() => { change({ ...defaultEnvelope, readyBy: item.ready, reservePct: item.id === 'storm' ? 60 : 35 }); setScenario(item.id); }}><span>{item.name}</span><small>{item.detail}</small></button>)}</div>
    <section className={s.workspace} aria-label="Household flexibility simulator">
      <div className={s.world}>
        <div className={s.worldTitle}><span className={s.eyebrow}>ONE FICTIONAL HOUSEHOLD</span><span>Auckland · illustrative day</span></div>
        <svg className={s.house} viewBox="0 0 760 490" role="img" aria-label="Illustration of a home, rooftop solar, battery and electric vehicle; all device data is simulated">
          <defs><linearGradient id="flex-roof" x2="1" y2="1"><stop stopColor="#654A4E"/><stop offset="1" stopColor="#240B21"/></linearGradient><linearGradient id="flex-wall" x2="0" y2="1"><stop stopColor="#FFFDFB"/><stop offset="1" stopColor="#dcd1d5"/></linearGradient><radialGradient id="flex-ground"><stop stopColor="#916A70" stopOpacity=".35"/><stop offset="1" stopColor="#F5F1F2" stopOpacity="0"/></radialGradient></defs>
          <ellipse cx="380" cy="330" rx="350" ry="150" fill="url(#flex-ground)"/>
          <path d="M95 330 380 190 680 335 400 475Z" fill="#e9e1e3"/>
          <path d="m226 239 171 80 171-83v120l-171 85-171-86Z" fill="url(#flex-wall)"/>
          <path d="M397 319v122l171-85V236Z" fill="#c5b4bb"/>
          <path d="m191 249 174-149 242 121-210 115Z" fill="url(#flex-roof)"/>
          <path d="m224 232 138-114-16 163Z" fill="#916A70"/>
          <path d="m387 152 136 68-76 42-116-56Z" fill="#240B21" stroke="#bfa6b1" strokeWidth="3"/>
          <path d="m376 169 127 62m-146-45 126 61m-62-78-55 51m90-34-61 53" fill="none" stroke="#916A70" strokeWidth="2"/>
          <path d="m262 290 55 26v67l-55-27Z" fill="#654A4E"/><path d="m335 326 37 18v57l-37-18Z" fill="#FFFDFB"/>
          <path d="m438 320 80-39v52l-80 40Z" fill="#FFFDFB"/><path d="m478 300v54" stroke="#c5b4bb" strokeWidth="3"/>
          <rect x="555" y="322" width="29" height="53" rx="8" fill="#240B21"/><path d="M563 334h12m-12 9h12m-12 9h12" stroke="#f5f1f2" strokeWidth="3"/>
          <path d="M560 375q32 36 73 8" fill="none" stroke="#916A70" strokeWidth="3" strokeDasharray="5 7" className={result?.status === 'simulated' ? s.flow : ''}/>
          <g transform="translate(510 382)"><path d="m0 0 47-26 92 39-46 29Z" fill="#654A4E"/><path d="m12-7 25-36 44-5 38 54-29 16Z" fill="#FFFDFB"/><path d="m40-37 37-3 22 31-46-18Z" fill="#240B21"/><path d="m0 0 93 42v22L0 24Z" fill="#916A70"/><path d="m93 42 46-29v22L93 64Z" fill="#654A4E"/><ellipse cx="23" cy="29" rx="10" ry="15" fill="#240B21"/><ellipse cx="79" cy="54" rx="10" ry="15" fill="#240B21"/></g>
          <circle cx="162" cy="154" r="27" fill="#FFFDFB" stroke="#916A70" strokeWidth="2"/><path d="m151 156 7 7 16-20" stroke="#654A4E" strokeWidth="3" fill="none"/>
        </svg>
        <div className={s.deviceRow}><div><CarFront size={19}/><span>EV charge<strong>40% → {envelope.targetPct}%</strong></span></div><div><Battery size={19}/><span>Home battery<strong>{context.batteryPct}% · protected</strong></span></div><div><Sun size={19}/><span>Energy window<strong>{clock(context.windowStart)}–{clock(context.windowEnd)}</strong></span></div></div>
        <p className={s.disclosure}>Fictional devices and signals. No account connection, real charging, grid dispatch or earned reward.</p>
      </div>
      <div className={s.controls}><div className={s.doHeading}><span><DoMark/></span><div><p className={s.eyebrow}>DO / HOUSEHOLD INTENT</p><h2>What matters tomorrow?</h2></div></div>
        <label className={s.time}>Have my car ready by<input aria-label="EV ready by" type="time" value={envelope.readyBy} onChange={e => change({ ...envelope, readyBy: e.target.value })}/></label>
        <label className={s.range}>EV target <strong>{envelope.targetPct}%</strong><input type="range" min="40" max="100" step="5" value={envelope.targetPct} onChange={e => change({ ...envelope, targetPct: Number(e.target.value) })}/></label>
        <label className={s.range}>Keep my home battery above <strong>{envelope.reservePct}%</strong><input type="range" min="0" max="100" step="5" value={envelope.reservePct} onChange={e => change({ ...envelope, reservePct: Number(e.target.value) })}/></label>
        <label className={s.check}><input type="checkbox" checked={envelope.hotWaterFlexible} onChange={e => change({ ...envelope, hotWaterFlexible: e.target.checked })}/><Droplets size={18}/> Hot water may move within a reviewed plan</label>
        <p className={s.boundary}><ShieldCheck size={18}/> Always ask before changing heating. This proof schedules the EV only.</p>
        <button className={s.primary} onClick={prepare}>Prepare my plan <ArrowRight size={18}/></button>
        <small className={s.local}>Runs in this tab. Nothing is sent to an energy provider.</small>
      </div>
    </section>
    <section className={s.review} aria-live="polite" aria-label="Plan and permission review">
      <div><p className={s.eyebrow}>{result ? '03 / THE RECEIPT' : '02 / YOUR CALL'}</p><h2>{result?.status === 'overridden' ? 'You’re back in charge.' : result ? 'The proof stays with you.' : plan ? 'Here’s the agreement.' : 'A plan you can agree to.'}</h2><p>{plan ? plan.reason : 'Set your boundaries, then prepare a plan. You’ll see exactly what could happen before approving the simulation.'}</p></div>
      <div className={s.plan}>
        {!plan && <><ShieldCheck size={30}/><h3>Nothing happens without your say.</h3><p>Read context → prepare → review → approve simulation → receipt.</p></>}
        {plan && <><span className={s.badge}>{result ? result.status.toUpperCase() : plan.state === 'needs_review' ? 'NEEDS HUMAN REVIEW' : 'PREPARED · NOT EXECUTED'}</span><h3>{plan.state === 'needs_review' ? 'Let’s revisit the boundaries.' : plan.energyKwh === 0 ? 'Already ready. No charging needed.' : <>Charge {clock(plan.start)}—{clock(plan.end)}</>}</h3><p>{context.signal}</p><ul><li><Check size={16}/> Battery floor: {plan.envelope.reservePct}%; no home-battery discharge</li><li><Check size={16}/> Heating and hot water remain unchanged</li><li><Check size={16}/> Provider: Kraken-shaped simulator · no Kraken connection</li></ul>
          {result ? <><p>{result.summary}</p><p className={s.local}>Delivered energy: not measured. Reward: not earned.<br />Receipt recorded {new Date(result.timestamp).toLocaleTimeString('en-NZ')} · this tab only.</p><div className={s.actions}>{result.status === 'simulated' && <button onClick={override}><RotateCcw size={16}/> Override simulation</button>}<button onClick={download}><Download size={16}/> Export proof</button></div></> : plan.state === 'prepared' ? <div className={s.actions}><button className={s.primary} onClick={() => approve(Date.now())}>Approve this simulation <ArrowRight size={16}/></button><button onClick={override}>Decline / override</button></div> : <button className={s.primary} onClick={() => setHandoff(true)}>Prepare a human handoff <ArrowUpRight size={16}/></button>}
          {handoff && <div className={s.handoff}><strong>Draft handoff · not sent</strong><p>Please review this fictional household: EV {context.evPct}% → {envelope.targetPct}% by {envelope.readyBy}; battery reserve {envelope.reservePct}%. {plan.reason} No authority is granted to alter these boundaries.</p></div>}
        </>}
        {error && <p role="alert">{error}</p>}
      </div>
    </section>
    <section className={s.loop}><div><p className={s.eyebrow}>ONE CONNECTED PROOF</p><h2>The signal.<br />The work.<br />The possibility.</h2></div><ol><li><span>01 · PURSUIT</span><h3>A household needs flexibility.</h3><p>Illustrative opportunity: an energy partner needs a clear way to capture customer intent and permission. Qualification and partner access still require validation.</p></li><li><span>02 · DO</span><h3>Make the boundaries explicit.</h3><p>Prepare a bounded plan. Check feasibility. Ask for approval. Record the simulation and preserve the right to override.</p></li><li><span>03 · STUDIO</span><h3>Let someone try it.</h3><p>This working experience makes the proposed customer journey reviewable. All three entry points use the same Flex implementation.</p></li></ol></section>
    <details className={s.enterprise}><summary>Inspect this session’s evidence <ArrowUpRight size={16}/></summary><p>Only this tab’s simulation events. No real household participation or commercial performance is measured.</p><dl><div><dt>Simulations approved</dt><dd>{history.filter(r => r.status === 'simulated').length}</dd></div><div><dt>Overrides / declines</dt><dd>{history.filter(r => r.status === 'overridden').length}</dd></div><div><dt>Verified grid delivery</dt><dd>Not measured</dd></div><div><dt>Rewards paid</dt><dd>None</dd></div></dl>{history.map(r => <p key={r.id}><code>{r.id}</code> — {r.summary}</p>)}</details>
    <footer className={s.footer}><Link href="/do">← Open DO</Link><span>assembl flex · a governed energy journey</span><Link href="/creative-studio">Explore Studio ↗</Link></footer>
  </main>;
}
