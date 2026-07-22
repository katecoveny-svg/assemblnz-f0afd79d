import { describe, expect, it } from 'vitest';
import { BASE_SCENARIO, buildScenarioRun } from './woolworths-assembled';
import { journeyAnswers, matchAnswer } from './ask';
import { recipientFor } from './recipients';

describe('grounded ask panel', () => {
  const data = buildScenarioRun(BASE_SCENARIO);
  const answers = journeyAnswers(data);

  it('produces one grounded answer per canonical question', () => {
    const ids = answers.map((a) => a.id);
    expect(ids).toEqual(['why', 'integration', 'assumptions', 'failure', 'data', 'human', 'pilot']);
    for (const a of answers) expect(a.answer.length).toBeGreaterThan(20);
  });

  it('grounds the "why" answer in the run total', () => {
    const why = answers.find((a) => a.id === 'why')!;
    expect(why.answer).toContain(`$${data.plan.estimatedTotalNzd.toFixed(2)}`);
  });

  it('matches free text to the nearest grounded answer', () => {
    expect(matchAnswer('what data do you keep about me?', answers)?.id).toBe('data');
    expect(matchAnswer('which bit would you trial first?', answers)?.id).toBe('pilot');
    expect(matchAnswer('what happens when it breaks?', answers)?.id).toBe('failure');
  });

  it('returns null for an unmatched question (honest fallback)', () => {
    expect(matchAnswer('what is the weather today', answers)).toBeNull();
  });
});

describe('recipient personalisation', () => {
  it('resolves a known recipient', () => {
    const r = recipientFor('oliver-lynch');
    expect(r.personalised).toBe(true);
    expect(r.firstName).toBe('Oliver');
  });

  it('falls back neutrally for unknown or missing', () => {
    expect(recipientFor(null).personalised).toBe(false);
    expect(recipientFor('nobody').personalised).toBe(false);
    expect(recipientFor(null).firstName).toBe('there');
  });
});
