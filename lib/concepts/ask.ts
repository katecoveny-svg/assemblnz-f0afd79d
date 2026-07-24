/**
 * "Ask this journey anything" — grounded Q&A.
 *
 * Every answer is derived from the SAME `ScenarioRun` the executive just
 * experienced: its evidence, capability disclosures, approvals, handoff rules
 * and the derived plan. Nothing is free-generated, so the panel can never
 * overstate what the concept does — it answers only from the run in front of
 * it. (Upgradeable to a model-backed responder later; the grounding contract
 * stays the same.)
 */

import type { ScenarioRun } from './woolworths-assembled';
import { everydayAssembledJourney } from '@/lib/journey/journeys/everyday-assembled';

export type JourneyAnswer = { id: string; question: string; answer: string };

export function journeyAnswers(data: ScenarioRun): JourneyAnswer[] {
  const { plan, run, proof, negotiation, scenario } = data;
  const journey = everydayAssembledJourney;

  const dietary = plan.excludedForDiet.length
    ? `It left out ${plan.excludedForDiet.length} option${plan.excludedForDiet.length > 1 ? 's' : ''} to honour the household's needs (${plan.excludedForDiet.slice(0, 2).join('; ')}${plan.excludedForDiet.length > 2 ? '…' : ''}).`
    : 'It honoured every stated dietary need.';

  const unavailableCaps = journey.toolPermissions.filter((t) => t.status === 'unavailable');
  const assumptions = [
    ...proof.assumptionsSurfaced,
    ...run.evidence.filter((e) => e.kind === 'assumption').map((e) => e.detail),
  ];
  const uniqueAssumptions = [...new Set(assumptions)].slice(0, 3);

  return [
    {
      id: 'why',
      question: 'Why did you recommend this?',
      answer:
        `The plan is ${plan.meals.length} meals and a ${plan.basket.length}-line basket, assembled for ${scenario.extraGuests + 7} people across ${scenario.nights} nights against a $${scenario.budgetNzd} ceiling. ` +
        `${dietary} The total came to $${plan.estimatedTotalNzd.toFixed(2)}, ${plan.withinBudget ? 'within budget' : `$${plan.overBudgetByNzd.toFixed(2)} over — which is why the resolution agent proposed value swaps`}.`,
    },
    {
      id: 'integration',
      question: 'What would require integration with your systems?',
      answer: unavailableCaps.length
        ? `Everything shown is prepared, not placed. The one capability that needs real integration is: ${unavailableCaps.map((c) => c.label.toLowerCase()).join(', ')}. Until that is connected it stays "${unavailableCaps[0].status}". A read-only catalogue + availability feed is the smallest useful integration.`
        : 'A read-only catalogue and availability feed would be the first integration; nothing else is required to run the prepared-shop journey.',
    },
    {
      id: 'assumptions',
      question: 'Which assumptions are least certain?',
      answer: uniqueAssumptions.length
        ? `The run surfaced these assumptions rather than hiding them: ${uniqueAssumptions.join(' ')} Every figure on the page is estimated or simulated, not measured.`
        : 'Every figure on the page is estimated or simulated for this concept, not measured — a pilot is what turns them into evidence.',
    },
    {
      id: 'failure',
      question: 'What happens when the model can’t cope?',
      answer:
        `There are ${journey.handoffRules.length} explicit human-handoff rules. For example: "${journey.handoffRules[0]?.when ?? 'an unresolved conflict'}" hands to a person with the full context, so the customer never repeats themselves. ` +
        `${proof.humanInterventionCount} handoff${proof.humanInterventionCount === 1 ? '' : 's'} occurred on this run.`,
    },
    {
      id: 'data',
      question: 'What customer data was used?',
      answer:
        `Only what the customer said or confirmed: the stated week, and the ${proof.contextQuestionsAsked} context question${proof.contextQuestionsAsked === 1 ? '' : 's'} answered (budget and fulfilment). ` +
        `No profile, no history — the run carries ${run.evidence.length} evidence records, each traceable to a stated fact, a rule or a calculation.`,
    },
    {
      id: 'human',
      question: 'Where would a human still intervene?',
      answer:
        `Nothing consequential happens without a human yes: the basket is prepared and "${negotiation.treatment}", never ordered. ` +
        `${proof.approvedActionCount} action${proof.approvedActionCount === 1 ? ' was' : 's were'} approved on this run, and any conflict outside the rules escalates to a person.`,
    },
    {
      id: 'pilot',
      question: 'Which part would you pilot first?',
      answer:
        'The budget-rescue moment — when the best-fit basket comes in over the ceiling and the agents resolve it with the customer approving. It is the highest-friction, highest-value step, and the pilot simulator below scopes a six-week test of exactly that.',
    },
  ];
}

/** Match a free-text question to the closest grounded answer. */
export function matchAnswer(question: string, answers: JourneyAnswer[]): JourneyAnswer | null {
  const q = question.toLowerCase();
  const rules: Array<{ id: string; keywords: string[] }> = [
    { id: 'why', keywords: ['why', 'recommend', 'choose', 'pick'] },
    { id: 'integration', keywords: ['integrat', 'connect', 'system', 'build', 'api'] },
    { id: 'assumptions', keywords: ['assum', 'certain', 'confiden', 'risk'] },
    { id: 'failure', keywords: ['fail', 'wrong', 'cope', 'break', 'error', 'edge'] },
    { id: 'data', keywords: ['data', 'privacy', 'personal', 'store', 'remember'] },
    { id: 'human', keywords: ['human', 'approve', 'order', 'buy', 'autonom', 'control'] },
    { id: 'pilot', keywords: ['pilot', 'first', 'start', 'test', 'trial'] },
  ];
  let best: { id: string; score: number } | null = null;
  for (const r of rules) {
    const score = r.keywords.reduce((n, k) => (q.includes(k) ? n + 1 : n), 0);
    if (score > 0 && (!best || score > best.score)) best = { id: r.id, score };
  }
  if (!best) return null;
  return answers.find((a) => a.id === best!.id) ?? null;
}
