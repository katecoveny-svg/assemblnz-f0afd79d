'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Check, Compass, Download, Hotel, Plane, Plus, Trash2 } from 'lucide-react';
import { DoProductFrame } from '@/components/do/DoProductFrame';
import { fingerprint } from '@/lib/do/preparation/contracts';
import { addDays, briefIsCurrent, briefSchema, comparison, departureOptions, destinations, foundOption, initialBrief, money, observationStatus, planText, searchHandoff, suggestions, type FoundOption, type HolidayBrief, type SearchHandoff } from '@/lib/do/travel/planner';
import TravelPreparation from './TravelPreparation';
import ProviderAccess from './ProviderAccess';
import styles from './travel-planner.module.css';

/** Original landscape illustrations. Mood studies, not photographs or inventory. */
function Scene({ kind = 'coast' }: { kind?: string }) {
  return <svg className={styles.scene} viewBox="0 0 600 320" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <rect width="600" height="320" fill="#eadcde" /><circle cx="458" cy="78" r="43" fill="#fff8ef" />
    {kind === 'mountain' ? <><path d="M0 252 140 55 282 220 382 95 600 270V320H0Z" fill="#916a70" /><path d="m140 55 66 78-38-15-28 23-20-22-33 22Z" fill="#fffdfb" /><path d="M0 265 165 220 360 265 600 228V320H0Z" fill="#654a4e" /><path d="M0 290Q220 245 600 292V320H0Z" fill="#c3a5ae" /></> : kind === 'city' ? <><path d="M0 211Q140 125 288 202T600 175V320H0Z" fill="#b69ba1" /><path d="M70 230V130h48v100m16 0V96h48v134m20 0V151h57v79m36 0V115h42v115m20 0V163h70v67m32 0V139h40v91" fill="#654a4e" /><path d="M0 248Q290 218 600 248V320H0Z" fill="#e0c6ce" /><path d="M80 276H290m50 15h170" stroke="#fffdfb" strokeWidth="3" /></> : <><path d="M0 140Q150 105 300 158T600 138V320H0Z" fill="#c3a5ae" /><path d="M0 202Q170 155 360 211T600 187V320H0Z" fill="#916a70" /><path d="M600 196Q440 244 245 250T0 320H600Z" fill="#f5f1f2" /><path d="M600 221Q400 267 180 284" stroke="#fffdfb" strokeWidth="5" fill="none" /><path d="M55 125q15-12 30 0m5-15q12-10 24 0" stroke="#654a4e" strokeWidth="3" fill="none" /></>}
    <path d="M70 64Q210 18 322 70" stroke="#fffdfb" strokeWidth="2" strokeDasharray="5 8" fill="none" />
  </svg>;
}
const emptyOption = { kind: 'flight' as 'flight' | 'stay', title: '', url: '', total: '', depart: '', outcome: 'found' as FoundOption['outcome'] };

export default function TravelPlanner() {
  const [brief, setBrief] = useState<HolidayBrief>(initialBrief);
  const [stage, setStage] = useState<'brief' | 'explore' | 'review'>('brief');
  const [options, setOptions] = useState<FoundOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [option, setOption] = useState(emptyOption);
  const [adding, setAdding] = useState(false);
  const [handoff, setHandoff] = useState<SearchHandoff | null>(null);
  const [reviewed, setReviewed] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const heading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const exportLock = useRef(false);
  const optionLock = useRef(false);
  const alert = useRef<HTMLParagraphElement>(null);
  const currentKey = fingerprint({ brief, selected, options });
  const valid = briefIsCurrent(brief, now);
  const c = comparison(brief, options, selected, now);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = window.setInterval(update, 15000);
    window.addEventListener('focus', update);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', update); };
  }, []);
  useEffect(() => { if (handoff) dialog.current?.showModal(); else dialog.current?.close(); }, [handoff]);
  useEffect(() => { if (error) alert.current?.focus(); }, [error]);
  function edit<K extends keyof HolidayBrief>(key: K, value: HolidayBrief[K]) {
    setBrief(b => ({ ...b, [key]: value })); setReviewed(null); setMessage(''); setError(''); setHandoff(null);
  }
  function navigate(next: typeof stage) { if (next !== 'brief' && !briefIsCurrent(brief)) { setError('Check the dates, traveller counts and budget amounts before continuing.'); return; } setStage(next); setReviewed(null); setError(''); setMessage(''); setTimeout(() => heading.current?.focus(), 0); }
  function explore(e: FormEvent) {
    e.preventDefault(); const result = briefSchema.safeParse(brief);
    if (!result.success) { setError(result.error.issues[0].message); return; }
    if (!briefIsCurrent(brief)) { setError('Choose a future departure window.'); return; }
    setBrief(result.data); navigate('explore');
  }
  function select(o: FoundOption) {
    setSelected(ids => ids.includes(o.id) ? ids.filter(id => id !== o.id) : [...ids.filter(id => options.find(item => item.id === id)?.kind !== o.kind), o.id]);
    setReviewed(null); setMessage('');
  }
  function addOption(e: FormEvent) {
    e.preventDefault();
    if (optionLock.current) return;
    optionLock.current = true;
    try {
      const depart = option.depart || brief.earliest;
      const item = foundOption({ ...option, total: option.outcome === 'found' ? Number(option.total) : 0, depart, return: addDays(depart, brief.nights) }, brief, new Date().toISOString());
      if (options.length >= 12) throw new Error('Remove an option before adding more. Keep up to 12 in this session.');
      if (options.some(o => o.url === item.url && o.title === item.title && o.total === item.total && o.briefKey === item.briefKey && o.depart === item.depart && Date.now() - Date.parse(o.observedAt) < 30000)) { setMessage('That option is already in your comparison.'); optionLock.current = false; return; }
      setOptions(old => [...old, item]); setAdding(false); setOption(emptyOption); setReviewed(null); setError(''); setMessage('Added to comparison. Details are recorded by you, not checked by DO.'); setNow(Date.now());
    } catch (err) { optionLock.current = false; setError(err instanceof Error ? err.message : 'Could not add this option. Your brief is unchanged.'); }
  }
  function download() {
    if (exportLock.current || reviewed !== currentKey || !briefIsCurrent(brief)) return;
    if (comparison(brief, options, selected, Date.now()).stale) { setReviewed(null); setError('An option needs rechecking. Remove it from the shortlist or record it again before exporting.'); return; }
    exportLock.current = true;
    const url = URL.createObjectURL(new Blob([planText(brief, options, selected, Date.now())], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'do-travel-plan.txt'; a.click();
    window.setTimeout(() => { URL.revokeObjectURL(url); exportLock.current = false; }, 1000);
    setMessage('Plan downloaded to this device. Nothing booked or sent.');
  }
  function reset() { setBrief(initialBrief()); setOptions([]); setSelected([]); setOption(emptyOption); setAdding(false); setHandoff(null); navigate('brief'); }
  function handoffButton(kind: 'flight' | 'stay', depart?: string, end?: string) { const datesMatch = !depart || (valid && departureOptions(brief).some(d => d.depart === depart && (!end || d.return === end))); return <button type="button" className={styles.secondary} disabled={!valid || !datesMatch} onClick={() => { if (datesMatch && briefIsCurrent(brief)) setHandoff(searchHandoff(brief, kind, depart, end)); }}>{kind === 'flight' ? <Plane size={17} /> : <Hotel size={17} />}{kind === 'flight' ? 'Browse flights' : 'Browse stays'}<ArrowUpRight size={16} /></button>; }

  return <DoProductFrame product="Travel"><div className={styles.travel}>
    <div className={styles.topline}><span><Compass size={16} /> A little further from everyday</span><span>Private to this open page</span></div>
    <nav className={styles.steps} aria-label="Travel planning steps">{(['brief', 'explore', 'review'] as const).map((s, i) => <button key={s} type="button" disabled={s !== 'brief' && !valid} aria-current={stage === s ? 'step' : undefined} onClick={() => navigate(s)}><span>{i + 1}</span>{s === 'brief' ? 'Your trip' : s === 'explore' ? 'Explore & compare' : 'Your plan'}</button>)}</nav>
    {stage === 'brief' ? <>
      <section className={styles.hero}><div><p className={styles.eyebrow}>DO TRAVEL</p><h1 ref={heading} tabIndex={-1}>Where would you<br /> rather be?</h1><p>Bring the idea. Gather flights, places to stay and a plan that fits your budget.</p><a href="#trip-brief" className={styles.heroLink}>Let’s shape your trip <ArrowRight size={18} /></a></div><div className={styles.heroArt}><Scene /><span>A change of scene.</span><small>Original illustration · not a destination photograph</small></div></section>
      <section className={styles.briefSection} id="trip-brief"><div><p className={styles.eyebrow}>01 / THE POSSIBILITIES</p><h2>A few details.<br /> Room to explore.</h2><p>No flight codes. No passenger documents. Just the shape of your holiday.</p><div className={styles.asideNote}><Compass size={22} /><p>Searches open on travel sites after you review what’s shared. Bring options back to compare here.</p></div></div>
        <form className={styles.form} onSubmit={explore}>
          <div className={styles.two}><label>Leaving from<input required maxLength={80} autoComplete="off" placeholder="City or airport" value={brief.origin} onChange={e => edit('origin', e.target.value)} /></label><label>Where to?<input required maxLength={80} autoComplete="off" placeholder="A city, island or region" value={brief.destination} onChange={e => edit('destination', e.target.value)} /></label></div>
          <fieldset><legend>When could you leave?</legend><div className={styles.two}><label>Earliest departure<input required type="date" value={brief.earliest} onChange={e => { edit('earliest', e.target.value); if (!brief.latest || brief.latest < e.target.value) edit('latest', e.target.value); }} /></label><label>Latest departure<input required type="date" min={brief.earliest || undefined} value={brief.latest} onChange={e => edit('latest', e.target.value)} /></label></div><small>Same date in both fields for a fixed departure.</small></fieldset>
          <div className={styles.three}><label>Nights<input required type="number" inputMode="numeric" min={1} max={30} value={brief.nights || ''} onChange={e => edit('nights', Number(e.target.value))} /></label><label>Adults<input required type="number" inputMode="numeric" min={1} max={9} value={brief.adults || ''} onChange={e => edit('adults', Number(e.target.value))} /></label><label>Children<input required type="number" inputMode="numeric" min={0} max={6} value={brief.children} onChange={e => edit('children', Number(e.target.value))} /></label></div>
          <label>Whole-trip budget · NZD<input required type="number" inputMode="decimal" min={1} max={1000000} value={brief.budget || ''} onChange={e => edit('budget', Number(e.target.value))} /></label>
          <fieldset><legend>What sounds good?</legend><div className={styles.chips}>{(['Unhurried', 'Coast', 'City', 'Outdoors'] as const).map(p => <button type="button" key={p} aria-pressed={brief.preference === p} onClick={() => edit('preference', p)}>{p}</button>)}</div></fieldset>
          <button className={styles.primary} type="submit">Explore this trip <ArrowRight size={18} /></button><small>Build a search plan. No live inventory is retrieved inside DO yet.</small>
        </form>
      </section>
      <section className={styles.inspiration}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>A PLACE TO START</p><h2>Follow a feeling.</h2></div><p>Ideas to explore · fares and availability unchecked</p></div><div className={styles.destinationGrid}>{destinations.map(d => <button type="button" key={d.name} className={styles.destination} onClick={() => { edit('destination', d.name); edit('preference', d.kind); document.getElementById('trip-brief')?.scrollIntoView({ behavior: 'instant', block: 'start' }); }}><Scene kind={d.scene} /><span><small>{d.kind}</small><strong>{d.name}<ArrowUpRight size={20} /></strong><span>{d.detail}</span></span></button>)}</div></section>
    </> : <>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{stage === 'explore' ? '02 / EXPLORE & COMPARE' : '03 / YOUR PLAN'}</p><h1 ref={heading} tabIndex={-1}>{brief.destination}, your way.</h1><p>{brief.origin} → {brief.destination} · {brief.nights} nights · {brief.adults + brief.children} travellers</p></div><button type="button" className={styles.secondary} onClick={() => navigate('brief')}>Edit trip</button></div>
      <div className={styles.summaryStrip}><div><small>Departure window</small><strong>{brief.earliest} — {brief.latest}</strong></div><div><small>Whole-trip budget</small><strong>{money(brief.budget)}</strong></div><div><small>Your pace</small><strong>{brief.preference}</strong></div></div>
      {stage === 'explore' ? <>
        <div className={styles.discoveryGrid}><section className={styles.searchTile}><div className={styles.tileIcon}><Plane /></div><p className={styles.eyebrow}>FLIGHTS / BROWSER SEARCH</p><h2>Find your way there.</h2><p>Compare return flights, journey time and baggage. Check the passenger count and currency on the site.</p>{handoffButton('flight')}<small>Google Flights fallback · Duffel search inside DO is not active</small></section><section className={styles.searchTile}><div className={styles.tileIcon}><Hotel /></div><p className={styles.eyebrow}>STAYS / BOOKING.COM</p><h2>Somewhere to settle.</h2><p>Compare hotels and holiday rentals. Confirm occupancy, total stay cost and cancellation terms.</p>{handoffButton('stay')}<small>Browser handoff · no rooms reserved</small></section></div>
        <section className={styles.searchTile}><p className={styles.eyebrow}>GETTING AROUND / AUCKLAND TRANSPORT</p><h2>Include the local journey.</h2><p>DO already has an Auckland Transport vehicle-position tool. Check it in Connections when planning your Auckland leg; positions alone do not establish arrival times, fares or a feasible transfer.</p><Link className={styles.secondary} href="/do/connections">Open DO transport connections<ArrowUpRight size={17} /></Link><small>Check freshness when used · no automatic tracking</small></section>
        <ProviderAccess /><details className={styles.boundary}><summary>What DO can check here</summary><p>DO prepares searches, compares details you record and creates a reviewed plan. Live flight and stay search is not connected to this page. DO cannot read your travel tabs or retrieve prices automatically. Existing provider access has not been verified for signed-in search.</p><p>Browser suggestions update when you change this brief or add options. No background monitoring or notifications are running.</p></details>
        <section className={styles.suggestions}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>THINKING AHEAD</p><h2>Make the budget go further.</h2></div><span>Based on your brief and recorded options</span></div><div className={styles.two}><label>Planned flights for everyone · NZD<input type="number" inputMode="decimal" min={0} max={1000000} value={brief.flightAllowance} onChange={e => edit('flightAllowance', Number(e.target.value))} /></label><label>Keep for meals, transfers & extras · NZD<input type="number" inputMode="decimal" min={0} max={1000000} value={brief.reserve} onChange={e => edit('reserve', Number(e.target.value))} /></label></div><div className={styles.suggestionList}>{suggestions(brief, options, selected, now).map(s => <article key={s.title}><Compass size={20} /><div><h3>{s.title}</h3><p>{s.detail}</p></div></article>)}</div></section>
        {brief.latest > brief.earliest && <section><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>SAME TRIP / DIFFERENT DATES</p><h2>Try a little flexibility.</h2></div><span>Alternatives to check, not cheaper fares found</span></div><div className={styles.dateGrid}>{departureOptions(brief).map(d => <article className={styles.dateTile} key={d.depart}><strong>{d.depart}</strong><p>Return {d.return}</p>{handoffButton('flight', d.depart)}{handoffButton('stay', d.depart)}</article>)}</div></section>}
        <section><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>YOUR COMPARISON</p><h2>Keep the contenders together.</h2></div><button type="button" className={styles.secondary} onClick={() => { optionLock.current = false; setAdding(!adding); setError(''); }}><Plus size={17} />Record an option</button></div><p>Record the full NZD price for everyone, using the same dates. No automatic tab reading or currency conversion.</p>
          {adding && <form className={styles.optionForm} onSubmit={addOption}><h3>What did you find?</h3><div className={styles.two}><label>Type<select aria-label="Option type" value={option.kind} onChange={e => setOption({ ...option, kind: e.target.value as 'flight' | 'stay' })}><option value="flight">Return flight · whole party</option><option value="stay">Accommodation · whole stay</option></select></label><label>Result<select aria-label="Search outcome" value={option.outcome} onChange={e => setOption({ ...option, outcome: e.target.value as FoundOption['outcome'] })}><option value="found">Found an option</option><option value="empty">No matching results</option><option value="failed">Site unavailable / search failed</option></select></label></div><label>Option name<input required maxLength={120} placeholder="Airline and fare, or place to stay" value={option.title} onChange={e => setOption({ ...option, title: e.target.value })} /></label><label>Source link<input required type="url" maxLength={1500} placeholder="https://…" value={option.url} onChange={e => setOption({ ...option, url: e.target.value })} /></label><div className={styles.two}><label>Dates<select aria-label="Option dates" value={option.depart || brief.earliest} onChange={e => setOption({ ...option, depart: e.target.value })}>{departureOptions(brief).map(d => <option key={d.depart} value={d.depart}>{d.depart} → {d.return}</option>)}</select></label>{option.outcome === 'found' && <label>Total for everyone · NZD<input required type="number" inputMode="decimal" min="0.01" step="0.01" max={1000000} value={option.total} onChange={e => setOption({ ...option, total: e.target.value })} /></label>}</div><small>Do not paste passenger names, booking references or private account links.</small><div className={styles.actions}><button className={styles.primary} type="submit">Add to comparison</button><button className={styles.secondary} type="button" onClick={() => { setAdding(false); setError(''); }}>Cancel</button></div></form>}
          {!options.length && <div className={styles.empty}><Plane /><Hotel /><h3>Your shortlist starts with a real find.</h3><p>Browse flights or stays above, then record an option. DO will compare the totals and flag mismatched dates or an older price.</p></div>}
          <div className={styles.optionGrid}>{options.map(o => { const status = observationStatus(o, brief, now); const usable = status === 'You recorded · not verified'; return <article className={styles.optionTile} key={o.id}><div className={styles.optionTop}>{o.kind === 'flight' ? <Plane /> : <Hotel />}<button type="button" aria-label={`Remove ${o.title}`} onClick={() => { setOptions(options.filter(x => x.id !== o.id)); setSelected(selected.filter(id => id !== o.id)); setReviewed(null); }}><Trash2 size={17} /></button></div><small>{status}</small><h3>{o.title}</h3>{o.outcome === 'found' && <strong className={styles.price}>{money(o.total)}<small>{o.kind === 'flight' ? 'return · whole party' : 'whole stay · all rooms'}</small></strong>}<p>{o.depart} → {o.return}</p><small>Recorded {new Date(o.observedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · source not rechecked</small><a href={o.url} target="_blank" rel="noopener noreferrer">Recheck source <ArrowUpRight size={15} /></a><button type="button" className={styles.secondary} disabled={!usable && !selected.includes(o.id)} aria-pressed={selected.includes(o.id)} onClick={() => select(o)}>{selected.includes(o.id) ? <><Check size={17} />Remove from plan</> : 'Choose for plan'}</button></article>; })}</div>
        </section><div className={styles.nextBar}><p>{selected.length ? `${selected.length} selected · ${money(c.subtotal)} in current recorded totals` : 'You can also take a research brief away before choosing.'}</p><button type="button" className={styles.primary} onClick={() => navigate('review')}>Review your plan <ArrowRight size={18} /></button></div>
      </> : <section className={styles.review}><div><p className={styles.eyebrow}>A PLAN TO TAKE WITH YOU</p><h2>{c.complete ? 'Your flight + stay shortlist' : 'Your holiday research brief'}</h2><p>{c.complete ? 'These are the options you recorded. Confirm the current price and terms with each provider.' : 'You can export the brief now, or return to compare a matching flight and stay.'}</p><ol className={styles.itinerary}><li><Plane /><div><h3>Get there & back</h3><p>{c.selected.find(o => o.kind === 'flight')?.title || 'Choose a return flight'}</p>{c.selected.find(o => o.kind === 'flight') && <p>{c.selected.find(o => o.kind === 'flight')?.depart} → {c.selected.find(o => o.kind === 'flight')?.return}</p>}{handoffButton('flight', c.selected.find(o => o.kind === 'flight')?.depart, c.selected.find(o => o.kind === 'flight')?.return)}</div></li><li><Hotel /><div><h3>Settle in for {brief.nights} nights</h3><p>{c.selected.find(o => o.kind === 'stay')?.title || 'Choose accommodation for the whole party'}</p>{c.selected.find(o => o.kind === 'stay') && <p>{c.selected.find(o => o.kind === 'stay')?.depart} → {c.selected.find(o => o.kind === 'stay')?.return}</p>}{handoffButton('stay', c.selected.find(o => o.kind === 'stay')?.depart, c.selected.find(o => o.kind === 'stay')?.return)}</div></li><li><Compass /><div><h3>Leave space for {brief.preference.toLowerCase()} days</h3><p>Check local transport, arrival and checkout times, baggage and cancellation terms before committing.</p></div></li></ol><button type="button" className={styles.secondary} onClick={() => navigate('explore')}>Back to comparison</button></div><aside className={styles.reviewSummary}><h3>The money picture</h3><dl><div><dt>Trip budget</dt><dd>{money(brief.budget)}</dd></div><div><dt>Current recorded options</dt><dd>{money(c.subtotal)}</dd></div><div><dt>Other-cost reserve</dt><dd>{money(brief.reserve)}</dd></div><div><dt>{c.complete ? 'Unallocated' : 'Unallocated so far'}</dt><dd>{money(c.remaining)}</dd></div></dl><p>{c.complete ? 'User-recorded totals only. Fees and availability need confirmation.' : 'Incomplete comparison: no total trip price confirmed.'}</p>{c.stale && <p role="alert">A selected option needs rechecking. Remove it or record it again before export.</p>}<label className={styles.check}><input type="checkbox" checked={reviewed === currentKey} disabled={c.stale} onChange={e => setReviewed(e.target.checked ? currentKey : null)} /><span>I have reviewed this brief and its unknowns. Nothing is booked.</span></label><button type="button" className={styles.primary} disabled={!valid || reviewed !== currentKey || c.stale} onClick={download}><Download size={18} />Download plan</button><small>Plain text · saved only when you download</small></aside></section>}
    </>}
    {error && <p ref={alert} tabIndex={-1} role="alert" className={styles.alert}>{error}</p>}{message && <p role="status" className={styles.alert}>{message}</p>}
    <div className={styles.bottom}><p>This page clears on refresh. No passenger documents, account memory, bookings or payments.</p><button type="button" onClick={reset}>Clear this trip</button></div>
    <details className={styles.advanced}><summary>Already have exact flight details? Advanced itinerary check</summary><p>Optional manual schedule validation. The example below is fictional; replace its values before review.</p><TravelPreparation /></details>
    <dialog ref={dialog} className={styles.handoff} onCancel={() => setHandoff(null)} onClose={() => setHandoff(null)}>{handoff && <><p className={styles.eyebrow}>BROWSER HANDOFF</p><h2>Continue on {handoff.provider}</h2><p>Opening this search shares the following with {handoff.provider}:</p><ul>{handoff.shared.map(x => <li key={x}>{x}</li>)}</ul><p>Confirm dates, travellers, children’s ages, rooms, currency and filters there; the site may ask you to enter them again. Budget and preferences stay here.</p><p>DO cannot read the results tab. Record an option here when you return. Nothing is booked by opening the search.</p><div className={styles.actions}><a className={styles.primary} href={valid ? handoff.url : undefined} target="_blank" rel="noopener noreferrer" onClick={e => { if (!briefIsCurrent(brief)) { e.preventDefault(); setHandoff(null); setError('Choose a current departure window.'); return; } setMessage(`Continue on ${handoff.provider}. Return here to record the options you find.`); setHandoff(null); }}>Open {handoff.provider}<ArrowUpRight size={17} /></a><button type="button" className={styles.secondary} onClick={() => setHandoff(null)}>Stay here</button></div></>}</dialog>
  </div></DoProductFrame>;
}
