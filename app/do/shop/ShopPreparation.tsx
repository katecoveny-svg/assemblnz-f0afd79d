'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import { PreparationState } from '@/components/do/preparation/PreparationState';
import { RewardedWait } from '@/components/do/preparation/RewardedWait';
import { beginReward, demoReward, declineRun, preparationRunId, prepareRun, reviewRun, runReceipt, settleRewards, type PreparationRun, type PreparedReceipt, type RewardEvent } from '@/lib/do/preparation/contracts';
import { initialShop, meals, offers } from '@/lib/do/shop/fixtures';
import { prepareShop, type ShopInput, type ShopPlan } from '@/lib/do/shop/preparation';
import '../preparation.css';
const money = (minor: number) => new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(minor / 100);
export default function ShopPreparation() {
  const [input, setInput] = useState<ShopInput>(initialShop);
  const [revision, setRevision] = useState(1);
  const [plan, setPlan] = useState<ShopPlan | null>(null);
  const [run, setRun] = useState<PreparationRun | null>(null);
  const [prepared, setPrepared] = useState<PreparedReceipt | null>(null);
  const [events, setEvents] = useState<RewardEvent[]>([]);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const preparedRevision = useRef<number | null>(null);
  const identity = { ownerId: 'fictional-household', taskId: 'shop-session', revision };
  function edit(next: ShopInput) { preparedRevision.current = null; setInput(next); setRevision(r => r + 1); setRun(null); setPrepared(null); setPlan(null); setError(''); }
  function assemble() {
    if (lock.current || run || preparedRevision.current === revision) return;
    lock.current = true;
    try {
      const now = new Date().toISOString(), next = prepareShop(input, meals, offers, now);
      const runId = preparationRunId(identity);
      const provenance = next.basket.filter(l => l.offer).map(l => ({ id: l.offer!.id, runId, kind: 'catalogue' as const, label: l.offer!.product, detail: `${l.offer!.source} · ${l.offer!.store} · ${l.offer!.variant} · expires ${l.offer!.expiresAt}`, sourceRef: l.offer!.id, createdAt: l.offer!.observedAt }));
      preparedRevision.current = revision; setPlan(next); setRun(prepareRun(identity, { revision, digest: next.digest }, provenance, null, now)); setError('');
    }
    catch (e) { setError(e instanceof Error ? e.message : 'Preparation failed'); setEvents(prev => settleRewards(prev, identity, false)); }
    finally { lock.current = false; }
  }
  function finish() {
    if (lock.current || prepared || !plan || !run) return;
    lock.current = true;
    try {
      const fresh = prepareShop(input, meals, offers, new Date().toISOString());
      if (fresh.blockers.length || fresh.digest !== plan.digest) throw new Error('Basket changed or offers expired; prepare and review again');
      setPrepared(runReceipt(run, identity, { revision, digest: fresh.digest }, new Date().toISOString()));
      setEvents(prev => settleRewards(prev, identity, true));
    } catch (e) { preparedRevision.current = null; setRun(null); setPlan(null); setRevision(r => r + 1); setError(e instanceof Error ? e.message : 'Review required'); }
    finally { lock.current = false; }
  }
  return <div className="prep-page"><header className="prep-header"><GlassIdentity kind="do" size={54} /><Link href="/do">DO</Link><nav><Link href="/do/shop" aria-current="page">Shop</Link><Link href="/do/travel">Travel</Link></nav></header>
    <p className="prep-eyebrow">Fictional household · session only · revision {revision}</p><h1>A useful basket, ready for review.</h1>
    <p className="prep-lead">Plan the dinners, check the pantry, then prepare a grocery list. Everything here is sample data. Nothing is ordered.</p>
    <p className="prep-notice">Woolworths is the first partnership target; no connected integration. Foodstuffs outreach remains deferred. Refreshing clears this session; no durable storage or account data is used.</p>
    <div className="prep-grid"><section className="prep-card"><h2>1. Set the mission</h2><label>Mission<select value={input.mission} onChange={e => edit({ ...input, mission: e.target.value as ShopInput['mission'], choices: input.choices.map(c => ({ ...c, occurrences: e.target.value === 'occasion' ? 1 : c.mealId === 'rice-bowl' ? 3 : 2 })) })}><option value="weekly">Weekly dinners · five nights</option><option value="occasion">Occasion · two dishes</option></select></label>
    {input.choices.map((c, i) => <fieldset key={c.mealId}><legend>{meals.find(m => m.id === c.mealId)?.name}</legend><label>Servings per meal<input type="number" min="1" max="30" value={c.servings} onChange={e => edit({ ...input, choices: input.choices.map((v,j) => j === i ? { ...v, servings: Number(e.target.value) } : v) })} /></label><label>Meals this mission<input type="number" min="1" max="7" value={c.occurrences} onChange={e => edit({ ...input, choices: input.choices.map((v,j) => j === i ? { ...v, occurrences: Number(e.target.value) } : v) })} /></label><small>Recipe quantities shown for {meals[i].baseServings} servings: {meals[i].ingredients.map(v => `${v.quantity.amount} ${v.quantity.unit} ${v.name}`).join(', ')}.</small></fieldset>)}
    <label>Budget (NZD)<input type="number" min="1" step="0.01" value={input.budget.limitMinor / 100} onChange={e => edit({ ...input, budget: { ...input.budget, limitMinor: Math.round(Number(e.target.value) * 100) } })} /></label><label>Sample fulfilment fee<select value={input.budget.feeMinor === null ? 'unknown' : String(input.budget.feeMinor)} onChange={e => edit({ ...input, budget: { ...input.budget, feeMinor: e.target.value === 'unknown' ? null : Number(e.target.value) } })}><option value="unknown">Unknown fee</option><option value="0">Fictional pickup · NZ$0</option><option value="800">Fictional delivery · NZ$8</option></select></label>
    <label className="prep-check"><input type="checkbox" checked={input.excludedAllergens.includes('nuts')} onChange={e => edit({ ...input, excludedAllergens: e.target.checked ? ['nuts'] : [] })} />Exclude nuts, including may-contain declarations</label><p>Fixture declarations are not production allergen assurance.</p></section>
    <section className="prep-card"><h2>2. Review the pantry</h2><p>Enter usable quantities. Beans use drained weight, rice uses dry weight. Pantry is deducted once after all meals are consolidated.</p>{input.pantry.map((p,i) => <label key={p.id}>{p.name} ({p.quantity.unit})<input type="number" min="0" step="1" value={p.quantity.amount} onChange={e => edit({ ...input, pantryReviewed: false, pantry: input.pantry.map((v,j) => j === i ? { ...v, reviewed: false, quantity: { ...v.quantity, amount: Number(e.target.value) } } : v) })} /></label>)}<label className="prep-check"><input type="checkbox" checked={input.pantryReviewed} onChange={e => edit({ ...input, pantryReviewed: e.target.checked, pantry: input.pantry.map(p => ({ ...p, reviewed: e.target.checked })) })} />I reviewed every pantry quantity</label>
    <h2>3. Choose sample offers</h2><p>Substitutions recalculate packs, leftovers and budget and invalidate review.</p>{['rice','beans','vegetables'].map(id => <label key={id}>{input.pantry.find(p => p.id === id)?.name}<select value={input.selectedOffers[id]} onChange={e => edit({ ...input, selectedOffers: { ...input.selectedOffers, [id]: e.target.value } })}>{offers.filter(o => o.ingredientId === id).map(o => <option key={o.id} value={o.id}>{o.product} · {o.variant} · {money(o.priceMinor)}</option>)}</select></label>)}<button type="button" onClick={assemble}>Prepare sample basket</button></section></div>
    {error && <p role="alert" className="prep-notice">{error}</p>}
    {plan && <section className="prep-card"><h2>4. Review the assembled basket</h2><div className="prep-table"><table><caption>Retailer-neutral requirements matched to fictional offers</caption><thead><tr><th>Ingredient</th><th>Meal need</th><th>Pantry used</th><th>Buy</th><th>Leftover</th><th>Estimate</th></tr></thead><tbody>{plan.basket.map(l => <tr key={l.ingredientId}><th>{l.name}</th><td>{l.required} {l.unit}</td><td>{l.pantryUsed} {l.unit}</td><td>{l.packs} packs</td><td>{l.leftover} {l.unit}</td><td>{money(l.estimatedMinor)}</td></tr>)}</tbody></table></div><p><strong>Basket {money(plan.estimatedMinor)} · {plan.totalMinor === null ? 'total unknown (fees)' : `estimated total ${money(plan.totalMinor)}`} · budget {money(input.budget.limitMinor)}</strong></p>
    {plan.disclosures.map(d => <p key={d}>{d}</p>)}{plan.blockers.length > 0 && <div role="alert"><h3>Resolve before review</h3><ul>{plan.blockers.map(b => <li key={b}>{b}</li>)}</ul></div>}
    <details><summary>Offer provenance and fulfilment</summary>{plan.basket.filter(l => l.offer).map(l => <p key={l.ingredientId}>{l.offer!.merchant} / {l.offer!.seller} · {l.offer!.product} · {l.offer!.variant} · {l.offer!.store} · {l.offer!.fulfilment} · stock {l.offer!.stock} · source {l.offer!.source} · observed {l.offer!.observedAt} · expires {l.offer!.expiresAt} · allergens {l.offer!.allergens.status}.</p>)}</details>
    <PreparationState run={run} />
    <RewardedWait active={!prepared && run?.status !== 'declined' && plan.blockers.length === 0} event={events[0]} onActivity={choice => setEvents(prev => beginReward(identity, demoReward, choice, !prepared && run?.status !== 'declined' && plan.blockers.length === 0, prev))} />
    <label className="prep-check"><input type="checkbox" disabled={plan.blockers.length > 0 || !!prepared || run?.status === 'declined'} checked={run?.status === 'reviewed'} onChange={e => run && setRun(reviewRun(run, identity, { revision, digest: plan.digest }, e.target.checked, new Date().toISOString()))} />I reviewed quantities, substitutions, leftovers, allergen limits and uncertain fees/weights</label><button type="button" disabled={run?.status !== 'reviewed' || !!prepared || plan.blockers.length > 0} onClick={finish}>Save prepared receipt</button><p>Preparation only. Checkout disabled.</p>{run && !prepared && run.status !== 'declined' && <button type="button" onClick={() => { setRun(declineRun(run)); setEvents(prev => settleRewards(prev, identity, false)); }}>Decline preparation</button>}{run?.status === 'declined' && <button type="button" onClick={() => edit({ ...input })}>Start new revision</button>}</section>}
    {prepared && <section className="prep-card" role="status"><h2>Prepared — nothing ordered</h2><p>{prepared.id} · run {prepared.runId} · v{prepared.version} · reviewed · {prepared.preparedAt} · fictional household · external action: none</p><p>Session-only receipt; material edits invalidate approval. No retailer cart, payment or checkout.</p>{events.map(e => <p key={e.key}>Reward evidence: {e.key} · {e.state} · {e.choice} · {e.evidence}</p>)}</section>}
  </div>;
}
