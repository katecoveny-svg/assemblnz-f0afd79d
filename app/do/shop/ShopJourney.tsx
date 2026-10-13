'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import { MEALS, ingredientById } from '@/lib/do/shop/catalogue';
import { validShopCount, aisleList, choicesFromNights, estimate, listText, parseShopBrief, planMeals, retailerHandoff, RETAILERS, shopDigest, type RetailerKey, type ShopBrief } from '@/lib/do/shop/journey';
import type { MealChoice } from '@/lib/do/shop/preparation';
import { prepareRun, reviewRun, runReceipt, type PreparationRun, type PreparedReceipt } from '@/lib/do/preparation/contracts';
import { PantryEditor, newPantryRow, reviewPantry, type PantryRow } from './PantryEditor';
import '../preparation.css';
import './shop.css';

const money = (minor: number) => new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(minor / 100);
const identity = { ownerId: 'shopper-session', taskId: 'shop-journey' };
type Night = { mealId: string; servings: number };
function nightsFromChoices(choices: MealChoice[]): Night[] {
  return choices.flatMap(choice => Array.from({ length: choice.occurrences }, () => ({ mealId: choice.mealId, servings: choice.servings })));
}
type SyncState = { signedIn: boolean; enabled: boolean; workspace: string | null };

function WholeNumber({ label, value, max, onChange, onValidity }: { label: string; value: number; max: number; onChange: (value: number) => void; onValidity: (valid: boolean) => void }) {
  const [raw, setRaw] = useState(String(value));
  useEffect(() => { setRaw(String(value)); }, [value]);
  const valid = validShopCount(raw, max);
  return <label>{label}<input type="number" min={1} max={max} step={1} aria-label={label} aria-invalid={!valid} value={raw} onChange={event => {
    const next = event.target.value;
    setRaw(next);
    const ok = validShopCount(next, max);
    onValidity(ok);
    if (ok) onChange(Number(next));
  }} />{!valid && <span role="alert">Enter a whole number from 1 to {max}. The last valid quantity remains on the list.</span>}</label>;
}

/** Brief → dinners → pantry → aisle list → handoff. Every step is editable, every edit invalidates
 * the review, and nothing leaves this page except links the shopper opens themselves. */
export default function ShopJourney({ initialBrief = '', embedded = false, expectedWorkspace }: { initialBrief?: string; embedded?: boolean; expectedWorkspace?: string }) {
  const [invalidNumbers, setInvalidNumbers] = useState<Record<string, boolean>>({});
  const numericValid = !Object.values(invalidNumbers).some(Boolean);
  const numberValidity = (id: string, valid: boolean) => { setInvalidNumbers(current => ({ ...current, [id]: !valid })); if (!valid) invalidate(); };
  const [text, setText] = useState(initialBrief);
  const [reviewBrief, setReviewBrief] = useState<ShopBrief | null>(() => initialBrief ? parseShopBrief(initialBrief) : null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [brief, setBrief] = useState<ShopBrief | null>(null);
  const [nights, setNights] = useState<Night[]>([]);
  const [rows, setRows] = useState<PantryRow[]>([]);
  const [pantryReviewed, setPantryReviewed] = useState(false);
  const [retailer, setRetailer] = useState<RetailerKey>('woolworths');
  const [revision, setRevision] = useState(0);
  const [run, setRun] = useState<PreparationRun | null>(null);
  const [receipt, setReceipt] = useState<PreparedReceipt | null>(null);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [sync, setSync] = useState<SyncState | null>(null);
  const [browserStatus, setBrowserStatus] = useState('Browser shopping requires a connection; cart actions are unavailable here.');
  const [saving, setSaving] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);
  const taskId = useRef('');

  useEffect(() => {
    let active = true;
    // Reads only whether tasks can be kept on the account; never a provider call. Failure means "not available".
    fetch('/api/do/continuity?scope=personal', { cache: 'no-store' }).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (!active) return;
      setSync({ signedIn: response.status !== 401, enabled: Boolean(data.durable && data.access?.enabled), workspace: typeof data.workspaceKey === 'string' && data.workspaceKey !== 'guest' ? data.workspaceKey : null });
    }).catch(() => { if (active) setSync({ signedIn: false, enabled: false, workspace: null }); });
    fetch('/api/do/browser-actions', { cache: 'no-store' }).then(async response => {
      const data = await response.json().catch(() => null);
      if (active && response.ok && data?.protocol === 'do.cart.v1' && data?.state === 'unavailable') {
        setBrowserStatus('Browser shopping is not connected. This planner prepares a list; it cannot change a cart.');
      }
    }).catch(() => { /* A missing or unchecked contract never implies a connection. */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!text.trim() && !brief) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const leave = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target === '_blank' || link.getAttribute('href')?.startsWith('#')) return;
      if (!window.confirm('Leave this unsaved shopping plan? Only a separately kept list is saved; meals and pantry edits will be lost.')) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    document.addEventListener('click', leave, true);
    window.addEventListener('beforeunload', warn);
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', leave, true); };
  }, [text, brief]);

  function invalidate() { setRun(null); setReceipt(null); setRevision(value => value + 1); setCopied(false); setCheckedItems([]); }
  function start() {
    if (!numericValid) return;
    if (brief && !window.confirm('Replace the current dinners and pantry edits with this reviewed brief?')) return;
    const parsed = reviewBrief ?? parseShopBrief(text);
    const choices = planMeals(parsed);
    setReviewBrief(null);
    setBrief(parsed); setNights(nightsFromChoices(choices));
    setRows(parsed.pantryHints.map(hint => newPantryRow(hint.name, 'brief')));
    setPantryReviewed(false); invalidate();
    setNotice(parsed.vegan ? 'Vegan planning is not supported by this catalogue. No meals have been suggested. Edit your brief only if your dietary requirements change.' : choices.length ? '' : 'No dinner in this catalogue fits those limits. Loosen one limit, or plan by hand below.');
    requestAnimationFrame(() => planRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }));
  }
  const eligible = useMemo(() => brief ? MEALS.filter(meal => planMeals({ ...brief, nights: 1 }, [meal]).length > 0) : MEALS, [brief]);
  function swap(index: number) {
    setNights(current => current.map((night, i) => {
      if (i !== index) return night;
      const position = eligible.findIndex(meal => meal.id === night.mealId);
      return { ...night, mealId: eligible[(position + 1) % eligible.length].id };
    }));
    invalidate();
  }
  const choices = useMemo(() => choicesFromNights(nights), [nights]);
  const pantry = useMemo(() => reviewPantry(rows), [rows]);
  const list = useMemo(() => brief ? aisleList(choices, pantryReviewed ? pantry.pantry : []) : { groups: [], lines: [] }, [brief, choices, pantryReviewed, pantry.pantry]);
  const summary = useMemo(() => brief ? estimate(list.lines, brief.budget) : null, [brief, list.lines]);
  const handoff = useMemo(() => retailerHandoff(list.lines, retailer), [list.lines, retailer]);
  const digest = useMemo(() => brief ? shopDigest({ brief, choices, pantry: pantryReviewed ? pantry.pantry : [], lines: list.lines }) : '', [brief, choices, pantryReviewed, pantry.pantry, list.lines]);
  const ready = numericValid && Boolean(brief) && nights.length > 0 && pantryReviewed && pantry.issues.length === 0 && list.lines.length > 0;
  const current = { ...identity, revision: Math.max(1, revision) };

  function review(checked: boolean) {
    const now = new Date().toISOString();
    const provenance = list.lines.map(line => ({ id: `${line.ingredientId}:${current.revision}`, runId: `${identity.ownerId}:${identity.taskId}`, kind: 'calculation' as const, label: line.name, detail: `${line.display} needed for ${line.meals.join(', ')}; indicative estimate ${money(line.estimateMinor)}`, sourceRef: line.ingredientId, createdAt: now }));
    const base = run && run.revision === current.revision ? run : prepareRun(current, { digest }, provenance, null, now);
    setRun(reviewRun(base, current, { digest }, checked, now));
  }
  function finish() {
    if (!run || !ready) return;
    try { setReceipt(runReceipt(run, current, { digest }, new Date().toISOString())); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Review the current list first.'); }
  }
  async function copyList() {
    try { await navigator.clipboard.writeText(listText(list.groups, `Shopping list · ${handoff.retailer}`)); setCopied(true); }
    catch { setNotice('Copy is unavailable here. Select the list and copy it manually.'); }
  }
  async function keepAsTask() {
    if ((embedded && !expectedWorkspace) || !sync?.workspace || saving || (expectedWorkspace && sync.workspace !== expectedWorkspace)) return;
    setSaving(true); setNotice('');
    try {
      taskId.current ||= crypto.randomUUID();
      const response = await fetch('/api/do/continuity', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DO-Workspace': sync.workspace }, body: JSON.stringify({ action: 'save', id: taskId.current, scope: 'personal', request: listText(list.groups, `Shopping list · ${handoff.retailer}`).slice(0, 4000), context: [], consent: true, consentVersion: 'do-continuity-v1' }) });
      const data = await response.json().catch(() => ({}));
      setNotice(response.ok && data.durable ? 'List text kept as a DO task. The editable meals, pantry and receipt are only in this tab.' : (data.message || 'Save could not be confirmed. Check Your tasks before retrying.'));
    } catch { setNotice('Save could not be confirmed. Check Your tasks before retrying.'); }
    finally { setSaving(false); }
  }

  return <div className="prep-page shop-page">
    {!embedded && <header className="prep-header"><GlassIdentity kind="do" size={54} /><Link href="/do">DO</Link><nav><Link href="/do/shop" aria-current="page">Shop</Link><Link href="/do/travel">Travel</Link><Link href="/do/continue">Your tasks</Link></nav></header>}
    <h1>Shopper DO</h1>
    <p className="prep-lead">Your dinners. Your pantry. One list to check.</p>
    <div className="shop-outcomes" aria-label="Shopping capabilities">
      <a href="#shop-brief-title"><strong>Plan the week</strong><span>Meals → pantry → aisle list</span><small>Working planning tool</small></a>
      <a href={brief ? "#shop-handoff-title" : "#shop-brief-title"}><strong>Open product searches</strong><span>Choose your supermarket</span><small>Search links · no cart connection</small></a>
      <Link href="/do/shop/sample"><strong>Explore a sample basket</strong><span>Fictional products and offers</span><small>Demo only</small></Link>
    </div>

    <div className="shop-steps">
      <section className="shop-step shop-brief" aria-labelledby="shop-brief-title">
        <h2 id="shop-brief-title"><span>01 · brief</span>What this week needs</h2>
        <p>In your own words. Review the details before planning. Vegan meals are not supported yet.</p>
        <label htmlFor="shop-brief-text" className="prep-check" style={{ display: 'block' }}>Your brief</label>
        <textarea id="shop-brief-text" value={text} maxLength={6000} placeholder="e.g. Dinners for 4 for 5 nights, about $250. We have rice and onions. No nuts." onChange={event => { setText(event.target.value); setReviewBrief(null); }} />
        <p className="shop-fine">Unsaved · this tab only. Browser Back or refresh can discard meals and pantry edits. Copy the list before leaving. Keeping a task saves list text only.</p>
        <button type="button" disabled={!text.trim()} onClick={() => { setInvalidNumbers({}); setReviewBrief(parseShopBrief(text)); }}>Review brief</button>
        {reviewBrief && <div className="shop-brief-review" aria-label="Review shopping brief">
          <p>Check what DO read. Planning uses these values.</p>
          <div className="shop-review-fields">
            <WholeNumber label="People" value={reviewBrief.servings} max={12} onValidity={valid => numberValidity("people", valid)} onChange={servings => setReviewBrief({ ...reviewBrief, servings })} />
            <WholeNumber label="Nights (up to 7)" value={reviewBrief.nights} max={7} onValidity={valid => numberValidity("nights", valid)} onChange={nights => setReviewBrief({ ...reviewBrief, nights })} />
            <label>Budget NZ$ (optional)<input type="number" min={1} max={9999} value={reviewBrief.budget ? reviewBrief.budget.limitMinor / 100 : ''} onChange={event => setReviewBrief({ ...reviewBrief, budget: Number(event.target.value) > 0 ? { currency: 'NZD', limitMinor: Math.round(Math.min(9999, Number(event.target.value)) * 100), feeMinor: null } : null })} /></label>
          </div>
          <p>{reviewBrief.vegan ? 'Vegan: unsupported — no meals will be suggested.' : reviewBrief.vegetarian ? 'Vegetarian' : 'No vegetarian restriction read'} · {reviewBrief.excludedAllergens.length ? `Exclude: ${reviewBrief.excludedAllergens.join(', ')}` : 'No allergen exclusions read'}. Edit the brief to change dietary requirements.</p>
          {reviewBrief.unrecognised.length > 0 && <p>Not applied: {reviewBrief.unrecognised.join('; ')}</p>}
          <button type="button" className="shop-primary" onClick={start} disabled={reviewBrief.vegan || reviewBrief.dietaryReviewRequired || !numericValid}>Use these details · plan dinners</button>
          <button type="button" onClick={() => { setInvalidNumbers({}); setReviewBrief(null); }}>Cancel review</button>
        </div>}
        {brief && <ul className="shop-chips" aria-label="What DO read">
          <li>{brief.servings} people</li><li>{brief.nights} nights</li>
          <li>{brief.budget ? `budget ${money(brief.budget.limitMinor)}` : 'no budget given'}</li>
          {brief.vegetarian && <li>vegetarian</li>}
          {brief.excludedAllergens.map(item => <li key={item}>no {item}</li>)}
          {brief.pantryHints.map(item => <li key={item.id}>have {item.name.toLowerCase()}</li>)}
          {brief.unrecognised.map(item => <li key={item} data-tone="warn">Not used: “{item}”</li>)}
        </ul>}
      </section>

      {brief && <div ref={planRef}>
        <section className="shop-step" aria-labelledby="shop-plan-title">
          <h2 id="shop-plan-title"><span>02 · dinners</span>{nights.length} {nights.length === 1 ? 'night' : 'nights'}, swap any you like</h2>
          <p>Illustrative meal images. Swap a dinner or change servings; the list updates with the recipe quantities.</p>
          <ol className="shop-nights">{nights.map((night, index) => { const meal = MEALS.find(item => item.id === night.mealId)!; return <li key={index} className="shop-night">
            <div className="shop-meal-photo" role="img" aria-label={`Illustrative serving of ${meal.name}`} style={{ backgroundPosition: `${(MEALS.indexOf(meal) % 4) * 100 / 3}% ${MEALS.indexOf(meal) < 4 ? 0 : 100}%` }} />
            <span>Night {index + 1}</span>
            <div><strong>{meal.name}</strong><span className="shop-meal-ingredients">{meal.ingredients.slice(0, 3).map(item => item.name).join(" · ")}</span></div>
            <WholeNumber label={`Night ${index + 1} servings`} value={night.servings} max={12} onValidity={valid => numberValidity(`night-${index}`, valid)} onChange={servings => { setNights(current => current.map((item, i) => i === index ? { ...item, servings } : item)); invalidate(); }} />
            <button type="button" aria-label={`Swap night ${index + 1}`} onClick={() => swap(index)}>Swap</button>
          </li>; })}</ol>
          <p className="shop-fine">{eligible.length} of {MEALS.length} catalogue dinners fit your limits. <button type="button" className="shop-text-button" disabled={nights.length >= 7 || !eligible.length} onClick={() => { setNights(current => [...current, { mealId: eligible[current.length % eligible.length].id, servings: brief.servings }]); invalidate(); }}>Add a night</button> <button type="button" className="shop-text-button" disabled={nights.length <= 1} onClick={() => { setNights(current => current.slice(0, -1)); invalidate(); }}>Remove last night</button></p>
        </section>

        <section className="shop-step" aria-labelledby="shop-pantry-title">
          <h2 id="shop-pantry-title"><span>03 · pantry</span>What you already have</h2>
          <p>Only confirmed items are deducted. If you do not check an item, it stays on the shopping list.</p>
          <PantryEditor rows={rows} onChange={next => { setRows(next); setPantryReviewed(false); invalidate(); }} />
          {pantry.issues.length > 0 && rows.length > 0 && <div className="shop-issues" role="status">Before this counts:<ul>{pantry.issues.map(issue => <li key={issue}>{issue}</li>)}</ul></div>}
          <label className="prep-check"><input type="checkbox" checked={pantryReviewed} disabled={pantry.issues.length > 0 && rows.length > 0} onChange={event => { setPantryReviewed(event.target.checked); invalidate(); }} />I reviewed my pantry{rows.length === 0 ? ' (nothing to deduct)' : ''}</label>
        </section>

        <section className="shop-step" aria-labelledby="shop-list-title">
          <h2 id="shop-list-title"><span>04 · list</span>By aisle, with a rough estimate</h2>
          <p>Tick items as you collect them. Prices are indicative pack estimates; the plan is not optimised to your budget.</p>
          {!pantryReviewed && <p className="shop-fine">Review your pantry above to see the list.</p>}
          {pantryReviewed && <div className="shop-aisles">{list.groups.map(group => <div key={group.aisle} className="shop-aisle"><h3>{group.aisle}</h3><ul>{group.lines.map(line => <li key={line.ingredientId} data-allergen={line.allergens.some(item => brief.excludedAllergens.includes(item))}><label><input type="checkbox" checked={checkedItems.includes(line.ingredientId)} onChange={event => setCheckedItems(current => event.target.checked ? [...current, line.ingredientId] : current.filter(id => id !== line.ingredientId))} />{line.name}</label><span>{line.display}{line.allergens.some(item => brief.excludedAllergens.includes(item)) ? ' · check label' : ''}</span></li>)}</ul></div>)}</div>}
          {pantryReviewed && summary && <p className="shop-estimate"><strong>About {money(summary.estimatedMinor)}</strong> against your {money(brief.budget!.limitMinor)} budget{summary.exceedsBudget ? ' · over budget on these estimates: swap a dinner or drop a night' : ' · looks within budget on these estimates'}. Delivery or pickup fees unknown.</p>}
          {pantryReviewed && !summary && list.lines.length > 0 && <p className="shop-estimate"><strong>About {money(list.lines.reduce((sum, line) => sum + line.estimateMinor, 0))}</strong> on indicative prices. Add a budget to your brief to compare.</p>}
        </section>

        <section className="shop-step" aria-labelledby="shop-handoff-title">
          <h2 id="shop-handoff-title"><span>05 · search</span>Find products yourself</h2>
          <p className="shop-connection" role="status">{browserStatus} <Link href="/do/install">View DO installation options</Link>. Phone commands need an approved paired browser online.</p>
          <p>Each line opens that supermarket’s own search in your browser. You add items to your own cart and check out yourself; DO never does.</p>
          <div className="shop-handoff-controls">
            <label>Supermarket <select value={retailer} onChange={event => setRetailer(event.target.value as RetailerKey)}>{Object.entries(RETAILERS).map(([key, value]) => <option key={key} value={key}>{value.name}</option>)}</select></label>
            <button type="button" disabled={!ready} onClick={() => void copyList()}>{copied ? 'Copied' : 'Copy list'}</button>
            <button type="button" disabled={!ready || !sync?.enabled || saving || (embedded && !expectedWorkspace) || Boolean(expectedWorkspace && sync.workspace !== expectedWorkspace)} title={!sync?.signedIn ? 'Sign in to keep tasks' : !sync?.enabled ? 'Turn on sync in Your tasks first' : undefined} onClick={() => void keepAsTask()}>{saving ? 'Keeping…' : 'Keep as a DO task'}</button>
          </div>
          {ready ? <ul className="shop-links">{handoff.lines.map(line => <li key={line.name}><span>{line.name} · {line.display}</span><a href={line.url} target="_blank" rel="noopener noreferrer">Search at {handoff.retailer} ↗</a></li>)}</ul> : <p className="shop-fine">Finish the steps above to get your links.</p>}
          <label className="prep-check"><input type="checkbox" disabled={!ready || !!receipt} checked={run?.status === 'reviewed'} onChange={event => review(event.target.checked)} />I checked the quantities, swaps and allergen flags</label>
          <button type="button" className="shop-primary" disabled={!ready || run?.status !== 'reviewed' || !!receipt} onClick={finish}>Save a prepared receipt</button>
          {receipt && <div className="shop-receipt" role="status"><p>prepared · nothing ordered</p><p>{receipt.id} · {receipt.preparedAt}</p><p>{list.lines.length} lines · {handoff.retailer} · indicative estimate {money(list.lines.reduce((sum, line) => sum + line.estimateMinor, 0))}</p><p>external action: none · this receipt is only in this tab. Keeping a task saves list text only.</p></div>}
          <p className="shop-fine">{sync?.signedIn ? (sync.enabled ? 'Kept tasks reopen on any device you sign in on.' : 'Turn on sync in Your tasks to keep this list on your account.') : 'Sign in and turn on sync to keep this list on your account.'} Catalogue ingredient notes: {list.lines.filter(line => ingredientById(line.ingredientId)?.allergens.length).length} lines carry declared allergens; always check the real label.</p>
        </section>
      </div>}
    </div>
    {notice && <p role="status" className="prep-notice">{notice}</p>}
    <p className="shop-fine">Looking for the earlier fixture demo? <Link href="/do/shop/sample">Sample basket with fictional offers</Link>.</p>
  </div>;
}
