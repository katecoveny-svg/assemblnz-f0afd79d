import { describe, expect, it } from 'vitest';
import { DIRECT_SOURCE_DEFAULT_GOAL, retainDirectSourceGoal, directPlanJsonSchema, projectDirectPlan, type DirectFocus } from './direct-proposal';
import { DIRECT_SOURCE_URLS } from './direct-sources';
const evidence = DIRECT_SOURCE_URLS.map(url => ({ url, claim: 'A complete fictional quotation for this source boundary fixture.' }));
const plan = { version: 1, goalEcho: DIRECT_SOURCE_DEFAULT_GOAL, focus: 'goal-led', action: 'map-task', evidence };
const goal = 'Design a distinctive website and customer experience.';
const project = (value: unknown, task = DIRECT_SOURCE_DEFAULT_GOAL, focus: DirectFocus = 'goal-led') => projectDirectPlan(value, task, focus);
describe('bounded scoped plan projection', () => {
  it('keeps the complete visitor goal and uses the broad default only when empty', () => {
    const text = '  Review a whānau service handoff\nwith a privacy check.  ';
    expect(retainDirectSourceGoal(text)).toBe(text); expect(retainDirectSourceGoal(' ')).toBe(DIRECT_SOURCE_DEFAULT_GOAL);
  });
  it('projects proposals, exact observations and explicit unknowns without model-authored factual prose', () => {
    const draft = project(plan); expect(draft.evidence).toEqual(evidence); expect(draft.unknowns.join(' ')).toContain('unverified');
    expect(draft.proposedWork).toMatch(/^Propose/); expect(draft.title).not.toMatch(/AI Workflow Safety/);
  });
  it.each([
    'There is no evidence of strong demand for this proposal.',
    'It is unknown whether New Zealand businesses need this service.',
    'Propose interviewing teams to understand whether New Zealand businesses need a clearer service handoff.',
  ])('accepts honest uncertainty or discovery as a visitor goal without a prose blacklist: %s', task => {
    expect(() => project({ ...plan, goalEcho: task, action: 'interview-users' }, task)).not.toThrow();
  });
  it.each([
    'Many New Zealand businesses lack structured approaches to safe AI implementation.',
    'Many New Zealand firms lack structured approaches to safe AI implementation.',
    'Explore whether a service would help because New Zealand businesses lack useful systems.',
    'There is strong demand for this proposed work.',
  ])('cannot admit an arbitrary model assertion in a narrative property: %s', assertion => {
    expect(() => project({ ...plan, opportunity: assertion })).toThrow('direct_proposal_unsupported');
    const draft = project(plan); expect(JSON.stringify(draft)).not.toContain(assertion);
  });
  it('cannot substitute the reported title under any default or custom goal', () => {
    for (const task of [DIRECT_SOURCE_DEFAULT_GOAL, goal, 'Review the privacy of customer information.']) {
      expect(() => project({ ...plan, goalEcho: task, title: 'AI Workflow Safety and Adoption Readiness Review' }, task)).toThrow();
    }
  });
  it('does not allow the model to select a privacy review for an unrelated creative request', () => {
    expect(() => project({ ...plan, goalEcho: goal, focus: 'creative', action: 'review-information-flow' }, goal, 'creative')).toThrow();
    const draft = project({ ...plan, goalEcho: goal, focus: 'creative', action: 'create-experience' }, goal, 'creative');
    expect(draft.proposedWork).toContain('visual or interactive experience');
  });
  it('supports explicitly selected privacy work without classifying the visitor goal by keywords', () => {
    const task = 'Review how customer information crosses a service handoff.';
    const draft = project({ ...plan, goalEcho: task, focus: 'privacy-review', action: 'review-information-flow' }, task, 'privacy-review');
    expect(draft.proposedWork).toContain('information flow'); expect(draft.unknowns.join(' ')).toContain('specialist');
  });
  it('rejects focus drift, changed goal, fabricated action or unreviewed extension fields', () => {
    for (const value of [{ ...plan, focus: 'privacy-review' }, { ...plan, goalEcho: goal }, { ...plan, action: 'generic-AI-audit' }, { ...plan, rationale: 'because firms lack systems' }]) expect(() => project(value)).toThrow();
  });
  it('binds provider grammar to exact goal, selected focus, finite actions and candidate quotations', () => {
    const schema = directPlanJsonSchema(goal, 'creative', evidence.map(item => ({ url: item.url, quoteCandidates: [item.claim] })));
    expect(schema.properties.goalEcho.enum).toEqual([goal]); expect(schema.properties.focus.enum).toEqual(['creative']);
    expect(schema.properties.action.enum).not.toContain('review-information-flow');
    expect(schema.properties.evidence.items.properties.claim.enum).toEqual(evidence.map(item => item.claim));
    expect(Object.keys(schema.properties)).toEqual(['version', 'goalEcho', 'focus', 'action', 'evidence']);
  });
});
