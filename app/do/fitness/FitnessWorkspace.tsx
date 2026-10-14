'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Dumbbell, RotateCcw, ShoppingBasket } from 'lucide-react';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import { EQUIPMENT, fitnessOffice, prepareFitness, prepareFoodHandoff, type FitnessInput, type FitnessRequest, type FitnessResult, type FoodHandoff } from '@/lib/do/fitness/contracts';
import styles from './fitness.module.css';

const initial: Omit<FitnessInput, 'reviewed'> = { sample: true, adult: true, goal: 'build-muscle', location: 'home', equipment: ['mat', 'bench', 'adjustable dumbbells'], minutes: 20, days: 3, dietaryPattern: 'omnivore', allergens: [], foodRequirement: 'none' };
const goalNames = { 'build-muscle': 'Build strength', mobility: 'Make time for movement', 'healthy-ageing': 'Keep a steady routine' };

export default function FitnessWorkspace() {
  const [input, setInput] = useState(initial);
  const [reviewed, setReviewed] = useState(false);
  const [revision, setRevision] = useState(1);
  const [request, setRequest] = useState<FitnessRequest | null>(null);
  const [result, setResult] = useState<FitnessResult | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [servings, setServings] = useState(1);
  const [foodReviewed, setFoodReviewed] = useState(false);
  const [food, setFood] = useState<FoodHandoff | null>(null);
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState('');
  const [now] = useState(() => new Date().toISOString());
  const office = fitnessOffice(now, result, food);

  function edit(next: typeof input) {
    setInput(next); setReviewed(false); setRequest(null); setResult(null); setFood(null); setSelected([]); setFoodReviewed(false); setCompleted(false); setRevision(value => value + 1); setNotice('Inputs changed. Review again to prepare a new draft.');
  }
  function prepare() {
    try {
      const next: FitnessRequest = { version: 1, scope: 'fitness-synthetic-session', from: 'chief-do', to: 'fitness-do', revision, input: { ...input, reviewed: true } };
      const draft = prepareFitness(next);
      setRequest(next); setResult(draft); setFood(null); setFoodReviewed(false); setSelected(draft.meals.map(meal => meal.id)); setCompleted(false);
      setNotice('Fitness returned a sample draft to DO. Review movement and food separately.');
    } catch { setNotice('Review the sample inputs before preparing.'); }
  }
  function handoff() {
    try {
      if (!request || !result || !foodReviewed) return;
      setFood(prepareFoodHandoff(request, { scope: request.scope, revision, resultDigest: result.digest, recipeIds: selected, servings, reviewed: true }));
      setNotice('Shop received the reviewed ingredients in this tab. Pantry, packs, prices and purchase remain unreviewed.');
    } catch (error) { setFood(null); setNotice(error instanceof Error ? error.message : 'Review the food choices again.'); }
  }
  return <div className={styles.workspace}>
    <header className={styles.header}><Link href="/do" className={styles.identity}><GlassIdentity kind="do" size={48} /><span>DO <span className={styles.muted}>/ Fitness</span></span></Link><button className={styles.quiet} onClick={() => { edit(initial); setServings(1); setNotice('Sample reset. Nothing was saved.'); }}><RotateCcw size={16} /> Reset sample</button></header>
    <section className={styles.intro}>
      <div><h1>A little movement.<br />A plan you can review.</h1><p>One DO, with Fitness preparing the draft and Shop organising the food you choose.</p></div>
      <aside className={styles.sample}><strong>Synthetic adult sample</strong><p>Try Sam’s choices. This tab only; refresh clears the work. Please don’t enter real health information.</p></aside>
    </section>
    <nav aria-label="Specialist responsibilities" className={styles.team}>{office.members.map((member, index) => <div key={member.identity.id}><span className={styles.role}>{index === 0 ? 'Chief' : 'Specialist'}</span><strong>{member.identity.name}</strong><span>{member.lastNote}</span>{index < 2 && <ArrowRight size={18} aria-hidden="true" />}</div>)}</nav>
    <div className={styles.layout}>
      <section className={styles.inputs} aria-labelledby="input-heading"><h2 id="input-heading">Give DO the shape of the week</h2><p>Reviewed choices for a fictional adult. This is a programme draft, not medical clearance.</p>
        <label>Sam’s goal<select value={input.goal} onChange={event => { const goal = event.target.value; if (goal === 'build-muscle' || goal === 'mobility' || goal === 'healthy-ageing') edit({ ...input, goal }); }}>{Object.entries(goalNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <div className={styles.pair}><label>Place<select value={input.location} onChange={event => { const location = event.target.value; if (location === 'home' || location === 'gym' || location === 'pilates') edit({ ...input, location }); }}><option value="home">Home</option><option value="gym">Gym</option><option value="pilates">Pilates space</option></select></label><label>Time per session<select value={input.minutes} onChange={event => { const minutes = Number(event.target.value); if (minutes === 15 || minutes === 20 || minutes === 35) edit({ ...input, minutes }); }}><option value="15">15 minutes</option><option value="20">20 minutes</option><option value="35">35 minutes</option></select></label></div>
        <label>Sessions per week<select value={input.days} onChange={event => edit({ ...input, days: Number(event.target.value) })}>{[2, 3, 4, 5].map(days => <option key={days} value={days}>{days} sessions</option>)}</select></label>
        <fieldset><legend>Equipment actually available</legend><div className={styles.equipment}>{EQUIPMENT.map(item => <label key={item}><input type="checkbox" checked={input.equipment.includes(item)} onChange={event => edit({ ...input, equipment: event.target.checked ? [...input.equipment, item] : input.equipment.filter(value => value !== item) })} />{item}</label>)}</div></fieldset>
        <label>Food preference<select value={input.dietaryPattern} onChange={event => { const dietaryPattern = event.target.value; if (dietaryPattern === 'omnivore' || dietaryPattern === 'vegetarian' || dietaryPattern === 'pescatarian') edit({ ...input, dietaryPattern }); }}><option value="omnivore">Mixed</option><option value="vegetarian">Vegetarian</option><option value="pescatarian">Pescatarian</option></select></label>
        <label>Food requirements<select value={input.foodRequirement} onChange={event => { const foodRequirement = event.target.value; if (foodRequirement === 'none' || foodRequirement === 'allergy-or-medical' || foodRequirement === 'other-unsupported') edit({ ...input, foodRequirement }); }}><option value="none">No additional sample requirements</option><option value="allergy-or-medical">Allergy or medical nutrition requirement</option><option value="other-unsupported">Other requirement outside this sample</option></select></label>
        <label className={styles.check}><input type="checkbox" checked={reviewed} onChange={event => { setReviewed(event.target.checked); if (!event.target.checked) { setRequest(null); setResult(null); setFood(null); setFoodReviewed(false); setSelected([]); setCompleted(false); setNotice('Input review withdrawn. Review again to prepare a draft.'); } }} />I reviewed these synthetic adult inputs.</label>
        <button className={styles.primary} disabled={!reviewed} onClick={prepare}>Ask Fitness to prepare <ArrowRight size={18} /></button>
      </section>
      <div className={styles.work}>
        {!result ? <section className={styles.empty}><Dumbbell size={32} /><h2>Your week starts with a review.</h2><p>Choose the place, available equipment and time. DO will ask Fitness for a bounded draft and bring it back here.</p><span>No provider connections needed.</span></section> : <>
          <section className={styles.movement} aria-labelledby="movement-heading"><div className={styles.sectionTitle}><h2 id="movement-heading">Movement, prepared</h2><span className={styles.state}>Draft · {input.minutes} min window</span></div><p>{goalNames[input.goal]} · {input.location} · {input.days} sessions a week</p>
            <ol className={styles.exercises}>{result.session.exercises.map(item => <li key={item.exercise.id}><div><strong>{item.exercise.name}</strong><p>{item.exercise.coachingCue}</p></div><span>{item.sets} × {item.reps}<small>{item.restSeconds}s rest</small></span></li>)}</ol>
            <p className={styles.note}>Equipment and location checked against the sample catalogue. Clinical-review movements are withheld. Stop if uncomfortable; this draft does not establish medical suitability.</p>
            {result.session.exercises.length > 0 && <label className={styles.check}><input type="checkbox" checked={completed} onChange={event => setCompleted(event.target.checked)} />Record this sample session as done</label>}
            <p className={styles.activity} role="status">{completed ? '1 manually marked sample session · kept only in this tab' : 'No activity recorded · manual sample tracking only'}</p>
            <details><summary>Review the first four weeks</summary><div className={styles.weeks}>{result.programme.map(week => <div key={week.week}><strong>Week {week.week}</strong><p>{week.focus}</p><span>{week.sessions} sessions · review before progressing</span></div>)}</div><p>No automatic load increases or calendar events.</p></details>
          </section>
          <section className={styles.meals} aria-labelledby="food-heading"><div className={styles.sectionTitle}><h2 id="food-heading">Choose food for Shop</h2><ShoppingBasket size={24} /></div><p>Sample dinner ideas, not a daily diet or calorie target. Select only the food to pass on.</p>
            {result.blockers.map(message => <p className={styles.note} key={message}>{message}</p>)}
            {result.meals.map(meal => <label className={styles.meal} key={meal.id}><input type="checkbox" checked={selected.includes(meal.id)} onChange={event => { setSelected(event.target.checked ? [...selected, meal.id] : selected.filter(id => id !== meal.id)); setFoodReviewed(false); setFood(null); setNotice('Food choices changed. Review them again before Shop.'); }} /><span><strong>{meal.name}</strong><small>{meal.minutes} min · sample declarations: {meal.allergens.join(', ') || 'none listed; verify labels'}</small><span data-testid={`food-quantities-${meal.id}`}>For {servings} {servings === 1 ? 'serving' : 'servings'}: {meal.ingredients.map(item => `${item.name} ${Number((item.quantity * servings / meal.servings).toFixed(2))} ${item.unit}`).join(' · ')}</span></span></label>)}
            {!!result.meals.length && <><label>Servings per chosen dinner<select value={servings} onChange={event => { setServings(Number(event.target.value)); setFoodReviewed(false); setFood(null); setNotice('Servings changed. Review the quantities again before Shop.'); }}>{[1, 2, 3, 4].map(value => <option key={value}>{value}</option>)}</select></label><p className={styles.note}>Shop receives chosen recipes, servings, ingredient quantities and food preferences only. Goals, exercise, activity and medication records stay outside the handoff.</p><label className={styles.check}><input type="checkbox" checked={foodReviewed} onChange={event => { setFoodReviewed(event.target.checked); setFood(null); setNotice(event.target.checked ? 'Food review recorded. Give the reviewed ingredients to Shop when ready.' : 'Food review withdrawn. Shop has no current ingredient handoff.'); }} />I reviewed these food choices and quantities for Shop.</label><button className={styles.primary} disabled={!foodReviewed || !selected.length} onClick={handoff}>Give reviewed ingredients to Shop <ArrowRight size={18} /></button></>}
          </section>
        </>}
        {food && <section className={styles.shop} aria-labelledby="shop-heading"><div className={styles.sectionTitle}><h2 id="shop-heading">Shop’s ingredient review</h2><Check size={24} /></div><p>Received from Fitness through DO · one serving choice per dinner.</p><ul>{food.requirements.map(item => <li key={item.ingredientId}><span>{item.name}</span><strong>{Number(item.required.toFixed(2))} {item.unit}</strong></li>)}</ul><p>Pantry has not been reviewed. No packs, stock, prices, budget coverage or retailer cart are confirmed. This food-only draft stays in this tab.</p><button className={styles.quiet} onClick={() => { setFood(null); setFoodReviewed(false); setNotice('Food handoff withdrawn. Shop has no current ingredient handoff.'); }}>Withdraw food handoff</button></section>}
        {!!office.inbox.length && <details className={styles.trace}><summary>Review DO’s delegation</summary><ol>{office.inbox.map(message => <li key={message.id}><strong>{message.fromIdentityId.replace('agent:', '').replace('-do', '')} → {message.toIdentityId.replace('agent:', '').replace('-do', '')}</strong><p>{message.summary}</p></li>)}</ol></details>}
        <div className={styles.notice} role="status" aria-live="polite">{notice}</div>
        <section className={styles.future}><h2>Connections come later</h2><p>Apple Health, GPS and Strava are not connected. Medication logging is not available in this slice. No health permissions, dosing guidance or medical records are requested.</p></section>
      </div>
    </div>
  </div>;
}
