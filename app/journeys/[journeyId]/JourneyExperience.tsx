'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CustomerJourney, JourneyRun } from '@/lib/journey/types';
import { selectGenomeContext, type JourneyGenomeContext } from '@/lib/journey/genome-context';
import { GROCERY_GENOME_FACTS, GROCERY_RULES } from '@/lib/journey/genome/grocery-genome';
import {
  startJourneyRun,
  applyIntentResult,
  answerContext,
  completeContext,
  processRecommendation,
  proposeBasket,
  approveAction,
  rejectAction,
  completeWait,
  detectExceptions,
  runResolution,
  proposeSavePreferences,
  completeJourney,
  pendingQuestions,
  currentPlan,
  contextBudget,
} from '@/lib/journey/runtime';
import { summariseJourney } from '@/lib/journey/proof';
import { StatusChip } from '@/components/journey/StatusChip';
import { ApprovalCard } from '@/components/journey/ApprovalCard';
import { WaitState } from '@/components/journey/WaitState';
import { JourneyProofCard } from '@/components/journey/JourneyProofCard';
import { InsideTheJourney } from '@/components/journey/InsideTheJourney';
import { structureIntentAction, persistJourneyRunAction } from './actions';
import styles from '@/components/journey/journey.module.css';

type View = 'customer' | 'inside';
type Area = 'journey' | 'context' | 'basket' | 'approvals' | 'proof';

const AREAS: { id: Area; label: string }[] = [
  { id: 'journey', label: 'Journey' },
  { id: 'context', label: 'Context' },
  { id: 'basket', label: 'Basket' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'proof', label: 'Proof' },
];

export function JourneyExperience({
  journey,
  initialRun = null,
}: {
  journey: CustomerJourney;
  initialRun?: JourneyRun | null;
}) {
  const [run, setRun] = useState<JourneyRun | null>(initialRun);
  const [view, setView] = useState<View>('customer');
  const [area, setArea] = useState<Area>('journey');
  const [intentText, setIntentText] = useState('');
  const [busy, setBusy] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const entry = journey.entryPoints[0];
  const plan = run ? currentPlan(run) : null;

  const genome: JourneyGenomeContext | null = useMemo(() => {
    if (!run) return null;
    const stage = journey.stages.find((s) => s.id === run.currentStageId);
    if (!stage) return null;
    return selectGenomeContext({
      tenantId: journey.tenantId,
      journeyId: journey.id,
      stageId: stage.id,
      stageType: stage.type,
      facts: GROCERY_GENOME_FACTS,
      rules: GROCERY_RULES,
    });
  }, [run, journey]);

  const stageIndex = run ? journey.stages.findIndex((s) => s.id === run.currentStageId) : -1;
  const hasPlan = Boolean(plan);
  const hasActions = Boolean(run && run.proposedActions.length > 0);

  /* ── persistence ──────────────────────────────────────────────────────── */
  // Persist the run whenever its timeline advances. Fire-and-forget: a missing
  // DB falls back server-side and never blocks the experience.
  useEffect(() => {
    if (!run) return;
    void persistJourneyRunAction(run);
  }, [run?.id, run?.timeline.length, run?.status]);

  /* ── handlers ─────────────────────────────────────────────────────────── */
  async function submitIntent() {
    if (!intentText.trim()) return;
    setBusy(true);
    const started = startJourneyRun({
      journey,
      statedIntent: intentText.trim(),
      sessionId: `web-${journey.id}`,
    });
    // Structure the intent server-side (model-backed, deterministic fallback).
    const result = await structureIntentAction(started.statedIntent);
    setRun(applyIntentResult(started, result));
    setBusy(false);
    setArea('journey');
  }

  function answerAndContinue(answers: Record<string, unknown>) {
    if (!run) return;
    let r = answerContext(run, answers);
    r = completeContext(r);
    r = processRecommendation(r);
    setRun(r);
  }

  function prepareBasket() {
    if (!run) return;
    let r = run;
    const parsed = Number.parseFloat(budgetInput);
    if (Number.isFinite(parsed) && parsed > 0 && contextBudget(run) == null) {
      r = answerContext(r, { budget: parsed });
    }
    r = proposeBasket(r);
    setRun(r);
    setArea('approvals');
  }

  function onApprove(id: string) {
    if (!run) return;
    const action = run.proposedActions.find((a) => a.id === id);
    const r = approveAction(run, id);
    setRun(r);
    if (action?.type === 'assemble_basket') setArea('journey'); // → wait state
    else if (action?.type === 'save_household_preferences') setArea('journey'); // → continuation
  }

  function onReject(id: string) {
    if (!run) return;
    setRun(rejectAction(run, id));
  }

  function onWaitComplete() {
    if (!run) return;
    setRun(completeWait(run));
    setArea('basket');
  }

  function handleException(issue: 'unavailable_item' | 'budget_exceeded') {
    if (!run) return;
    const { run: r } = runResolution(run, issue);
    setRun(r);
    setArea('approvals');
  }

  function startContinuation() {
    if (!run) return;
    setRun(proposeSavePreferences(run));
    setArea('approvals');
  }

  function finish() {
    if (!run) return;
    setRun(completeJourney(run));
    setArea('proof');
  }

  /* ── render ───────────────────────────────────────────────────────────── */
  return (
    <div className={styles.root}>
      <div className={styles.shell}>
        <header className={styles.chrome}>
          <div>
            <span className={styles.wordmark}>{journey.name}</span>
            <span className={styles.wordmarkSub}>an assembl agentic journey</span>
          </div>
          <div className={styles.toggle} role="tablist" aria-label="View">
            <button
              type="button"
              className={`${styles.toggleBtn} ${view === 'customer' ? styles.toggleBtnActive : ''}`}
              onClick={() => setView('customer')}
            >
              Customer view
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${view === 'inside' ? styles.toggleBtnActive : ''}`}
              onClick={() => setView('inside')}
              disabled={!run}
            >
              Inside the journey
            </button>
          </div>
        </header>

        {run && (
          <div className={styles.rail} aria-hidden>
            {journey.stages.map((s, i) => (
              <div key={s.id} className={styles.railNode}>
                {i > 0 && <span className={`${styles.railLink} ${i <= stageIndex ? styles.railLinkDone : ''}`} />}
                <span
                  className={`${styles.railDot} ${i < stageIndex ? styles.railDotDone : ''} ${i === stageIndex ? styles.railDotActive : ''}`}
                />
                {i === stageIndex && <span className={styles.railLabel}>{s.name}</span>}
              </div>
            ))}
          </div>
        )}

        {run && view === 'customer' && (
          <nav className={styles.areaNav} aria-label="Journey areas">
            {AREAS.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`${styles.areaTab} ${area === a.id ? styles.areaTabActive : ''}`}
                onClick={() => setArea(a.id)}
                disabled={
                  (a.id === 'basket' && !hasPlan) ||
                  (a.id === 'approvals' && !hasActions)
                }
              >
                {a.label}
              </button>
            ))}
          </nav>
        )}

        {view === 'inside' && run ? (
          <InsideTheJourney run={run} journey={journey} genome={genome} />
        ) : (
          <Main
            journey={journey}
            run={run}
            area={area}
            entryPrompts={entry?.examplePrompts ?? []}
            intentText={intentText}
            setIntentText={setIntentText}
            busy={busy}
            submitIntent={submitIntent}
            budgetInput={budgetInput}
            setBudgetInput={setBudgetInput}
            answerAndContinue={answerAndContinue}
            prepareBasket={prepareBasket}
            onApprove={onApprove}
            onReject={onReject}
            onWaitComplete={onWaitComplete}
            handleException={handleException}
            startContinuation={startContinuation}
            finish={finish}
          />
        )}

        <p className={styles.sampleStrip}>
          sample journey — details fictional · everything simulated · no order is placed
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Main content router — one primary panel per area/stage.
 * ──────────────────────────────────────────────────────────────────────── */

type MainProps = {
  journey: CustomerJourney;
  run: JourneyRun | null;
  area: Area;
  entryPrompts: string[];
  intentText: string;
  setIntentText: (v: string) => void;
  busy: boolean;
  submitIntent: () => void;
  budgetInput: string;
  setBudgetInput: (v: string) => void;
  answerAndContinue: (answers: Record<string, unknown>) => void;
  prepareBasket: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onWaitComplete: () => void;
  handleException: (issue: 'unavailable_item' | 'budget_exceeded') => void;
  startContinuation: () => void;
  finish: () => void;
};

function Main(props: MainProps) {
  const { journey, run, area } = props;

  // No run yet → entry.
  if (!run) return <Entry {...props} />;

  if (area === 'proof') {
    return <JourneyProofCard proof={summariseJourney(run, journey)} journey={journey} />;
  }
  if (area === 'basket') {
    return <BasketArea {...props} run={run} />;
  }
  if (area === 'approvals') {
    return <ApprovalsArea {...props} run={run} />;
  }
  if (area === 'context') {
    return <ContextArea {...props} run={run} />;
  }

  // area === 'journey' → drive by current stage.
  switch (run.currentStageId) {
    case 'context':
      return <ContextArea {...props} run={run} />;
    case 'recommendation':
    case 'commitment':
      return <RecommendationArea {...props} run={run} />;
    case 'action':
      return <ApprovalsArea {...props} run={run} />;
    case 'wait':
      return (
        <WaitState
          module={journey.waitStateModules[0]}
          onComplete={props.onWaitComplete}
        />
      );
    case 'fulfilment':
      return <FulfilmentArea {...props} run={run} />;
    case 'resolution':
    case 'continuation':
      return run.proposedActions.some((a) => a.status === 'proposed') ? (
        <ApprovalsArea {...props} run={run} />
      ) : (
        <ContinuationArea {...props} run={run} />
      );
    default:
      return <Entry {...props} />;
  }
}

function Entry(props: MainProps) {
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Tell us what life looks like</p>
      <h1 className={styles.headline}>We&rsquo;ll help assemble the shop around it.</h1>
      <p className={styles.lede}>
        Say it in your own words — who you&rsquo;re feeding, for how long, and anything that
        matters. No forms.
      </p>
      <textarea
        className={styles.intentField}
        placeholder="e.g. I need food for five teenagers at our beach house this weekend. Two are pescatarian, one hates spicy food, and I want easy dinners and plenty of snacks."
        value={props.intentText}
        onChange={(e) => props.setIntentText(e.target.value)}
      />
      <div className={styles.examples}>
        {props.entryPrompts.map((p) => (
          <button key={p} type="button" className={styles.example} onClick={() => props.setIntentText(p)}>
            {p}
          </button>
        ))}
      </div>
      <button className={styles.primary} type="button" onClick={props.submitIntent} disabled={props.busy || !props.intentText.trim()}>
        {props.busy ? 'Understanding…' : 'Start the journey'}
      </button>
    </section>
  );
}

function ContextArea({ run, journey, ...props }: MainProps & { run: JourneyRun }) {
  const questions = pendingQuestions(run, journey);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  if (questions.length === 0) {
    return (
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Context</p>
        <h2 className={styles.headline}>Nothing else needed right now.</h2>
        <p className={styles.lede}>We have enough to assemble a good plan. You can keep going.</p>
        <button className={styles.primary} type="button" onClick={() => props.answerAndContinue({})}>
          Assemble the plan
        </button>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>A couple of useful questions</p>
      <h2 className={styles.headline}>The more we know, the closer the fit.</h2>
      <p className={styles.lede}>We only ask what changes the outcome — never a long form.</p>
      {questions.map((q) => (
        <div key={q.key} className={styles.question}>
          <p className={styles.questionLabel}>{q.label}</p>
          <p className={styles.questionWhy}>{q.rationale}</p>
          {q.kind === 'choice' ? (
            <div className={styles.choiceRow}>
              {(q.choices ?? []).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={styles.example}
                  style={answers[q.key] === c ? { borderColor: 'var(--a-accent)', color: 'var(--a-text)' } : undefined}
                  onClick={() => setAnswers((a) => ({ ...a, [q.key]: c }))}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : (
            <input
              className={styles.textInput}
              type={q.kind === 'number' ? 'number' : 'text'}
              placeholder={q.kind === 'number' ? 'e.g. 300' : 'Type here'}
              onChange={(e) =>
                setAnswers((a) => ({
                  ...a,
                  [q.key]: q.kind === 'number' ? Number.parseFloat(e.target.value) : e.target.value,
                }))
              }
            />
          )}
        </div>
      ))}
      <div className={styles.actionsRow}>
        <button className={styles.primary} type="button" onClick={() => props.answerAndContinue(cleanAnswers(answers))}>
          Continue
        </button>
        <button className={styles.ghost} type="button" onClick={() => props.answerAndContinue({})}>
          Skip — just assemble it
        </button>
      </div>
    </section>
  );
}

function RecommendationArea({ run, ...props }: MainProps & { run: JourneyRun }) {
  const plan = currentPlan(run);
  if (!plan) return <Entry {...props} run={run} />;
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Your plan, assembled</p>
      <h2 className={styles.headline}>Here&rsquo;s what we&rsquo;d shop.</h2>
      <p className={styles.lede}>
        Meals matched to who&rsquo;s eating, with the things to avoid left out. Review, then it&rsquo;s
        your call.
      </p>
      <PlanMeals run={run} />
      <BasketList run={run} />
      {plan.valueOpportunities.length > 0 && (
        <>
          <p className={styles.eyebrow} style={{ marginTop: '1.25rem' }}>Value options</p>
          <ul className={styles.list}>
            {plan.valueOpportunities.slice(0, 3).map((v) => (
              <li key={v.sku}>{v.suggestion} (save about ${v.estimatedSavingNzd.toFixed(2)})</li>
            ))}
          </ul>
        </>
      )}
      {contextBudget(run) == null && (
        <div className={styles.question} style={{ marginTop: '1.25rem' }}>
          <p className={styles.questionLabel}>Set a budget ceiling? (optional)</p>
          <p className={styles.questionWhy}>We&rsquo;ll flag anything over and offer swaps.</p>
          <input
            className={styles.textInput}
            type="number"
            placeholder="e.g. 300"
            value={props.budgetInput}
            onChange={(e) => props.setBudgetInput(e.target.value)}
          />
        </div>
      )}
      <div className={styles.actionsRow}>
        <button className={styles.primary} type="button" onClick={props.prepareBasket}>
          Looks good — prepare the basket
        </button>
      </div>
    </section>
  );
}

function ApprovalsArea({ run, ...props }: MainProps & { run: JourneyRun }) {
  const open = run.proposedActions.filter((a) => a.status === 'proposed');
  const resolved = run.proposedActions.filter((a) => a.status !== 'proposed');
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Your call</p>
      <h2 className={styles.headline}>Nothing happens without your yes.</h2>
      <p className={styles.lede}>
        Each proposed action shows what it does, why, and whether it&rsquo;s real or simulated.
      </p>
      {open.length === 0 && resolved.length === 0 && <p>No actions proposed yet.</p>}
      {open.map((a) => (
        <ApprovalCard key={a.id} action={a} onApprove={props.onApprove} onReject={props.onReject} />
      ))}
      {resolved.map((a) => (
        <ApprovalCard key={a.id} action={a} />
      ))}
      {open.length === 0 && resolved.length > 0 && run.currentStageId === 'resolution' && (
        <div className={styles.actionsRow}>
          <button className={styles.primary} type="button" onClick={props.startContinuation}>
            Make next time easier
          </button>
        </div>
      )}
    </section>
  );
}

function FulfilmentArea({ run, ...props }: MainProps & { run: JourneyRun }) {
  const plan = currentPlan(run);
  const exceptions = detectExceptions(run);
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Ready for you</p>
      <h2 className={styles.headline}>Your basket is assembled.</h2>
      <p className={styles.lede}>
        Prepared and grouped for one shop. <StatusChip status="simulated" /> — no order has been
        placed.
      </p>
      <BasketList run={run} />
      {plan && (
        <div className={styles.actionsRow}>
          <button className={styles.ghost} type="button" onClick={() => navigator.clipboard?.writeText(basketText(run))}>
            Copy list
          </button>
          <button className={styles.ghost} type="button" disabled title="A retailer connector is not wired in this demo">
            Connect retailer (unavailable)
          </button>
        </div>
      )}
      {exceptions.length > 0 && (
        <div style={{ marginTop: '1.75rem' }}>
          <p className={styles.eyebrow} style={{ color: '#8a6b1f' }}>Something changed</p>
          {exceptions.includes('unavailable_item') && (
            <p className={styles.lede} style={{ marginBottom: '0.75rem' }}>
              An item in your basket is out of stock. We&rsquo;ve lined up a swap.
            </p>
          )}
          {exceptions.includes('budget_exceeded') && (
            <p className={styles.lede} style={{ marginBottom: '0.75rem' }}>
              The basket is over your budget. We can propose swaps to bring it back.
            </p>
          )}
          <div className={styles.actionsRow}>
            {exceptions.includes('unavailable_item') && (
              <button className={styles.primary} type="button" onClick={() => props.handleException('unavailable_item')}>
                See the swap
              </button>
            )}
            {exceptions.includes('budget_exceeded') && (
              <button className={styles.ghost} type="button" onClick={() => props.handleException('budget_exceeded')}>
                Fix the budget
              </button>
            )}
          </div>
        </div>
      )}
      {exceptions.length === 0 && (
        <div className={styles.actionsRow}>
          <button className={styles.primary} type="button" onClick={props.startContinuation}>
            Make next time easier
          </button>
        </div>
      )}
    </section>
  );
}

function ContinuationArea({ run, ...props }: MainProps & { run: JourneyRun }) {
  const done = run.status === 'completed';
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Make next time easier</p>
      <h2 className={styles.headline}>{done ? 'All done.' : 'Saved on your terms.'}</h2>
      <p className={styles.lede}>
        {done
          ? 'Your Proof Card is ready — it shows exactly what happened and what it saved.'
          : 'You can save this household and occasion as a template, or remove anything the journey learned.'}
      </p>
      <div className={styles.actionsRow}>
        {!done && (
          <button className={styles.primary} type="button" onClick={props.finish}>
            Finish
          </button>
        )}
      </div>
    </section>
  );
}

/* ── shared render helpers ─────────────────────────────────────────────── */

function PlanMeals({ run }: { run: JourneyRun }) {
  const plan = currentPlan(run);
  if (!plan || plan.meals.length === 0) return null;
  return (
    <div className={styles.meals}>
      {plan.meals.map((m) => (
        <div key={m.id} className={styles.meal}>
          <p className={styles.mealName}>{m.name}</p>
          {m.note && <p className={styles.mealNote}>{m.note}</p>}
        </div>
      ))}
    </div>
  );
}

function BasketList({ run }: { run: JourneyRun }) {
  const plan = currentPlan(run);
  if (!plan) return null;
  const byCategory = new Map<string, typeof plan.basket>();
  for (const item of plan.basket) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }
  return (
    <div>
      {[...byCategory.entries()].map(([category, items]) => (
        <div key={category} className={styles.category}>
          <p className={styles.categoryName}>{category}</p>
          {items.map((item) => (
            <div key={item.sku} className={styles.line}>
              <span className={`${styles.lineName} ${!item.available ? styles.lineUnavail : ''}`}>
                {item.name}
                <span className={styles.lineQty}>×{item.quantity}</span>
                {!item.available && <span className={styles.lineQty}> · out of stock</span>}
              </span>
              <span className={styles.linePrice}>${item.lineTotalNzd.toFixed(2)}</span>
            </div>
          ))}
        </div>
      ))}
      <div className={styles.total}>
        <span className={styles.totalLabel}>
          Estimated total
          {plan.budgetCeilingNzd != null && (
            <span className={styles.lineQty}> · budget ${plan.budgetCeilingNzd.toFixed(0)}</span>
          )}
        </span>
        <span className={styles.totalValue} style={!plan.withinBudget ? { color: '#a24b3c' } : undefined}>
          ${plan.estimatedTotalNzd.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function BasketArea({ run, ...props }: MainProps & { run: JourneyRun }) {
  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Basket</p>
      <h2 className={styles.headline}>Your assembled shop</h2>
      <p className={styles.lede}>
        <StatusChip status="simulated" /> Grouped by category. Prices are indicative — no order is
        placed.
      </p>
      <PlanMeals run={run} />
      <BasketList run={run} />
    </section>
  );
}

function cleanAnswers(answers: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(answers)) {
    if (v === '' || v == null || (typeof v === 'number' && Number.isNaN(v))) continue;
    out[k] = v;
  }
  return out;
}

function basketText(run: JourneyRun): string {
  const plan = currentPlan(run);
  if (!plan) return '';
  return plan.basket.map((i) => `${i.quantity}× ${i.name} — $${i.lineTotalNzd.toFixed(2)}`).join('\n');
}
