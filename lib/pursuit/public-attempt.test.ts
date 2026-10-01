import { describe, expect, it, vi } from 'vitest';
import { publicAttempt, matchesPublicAttempt } from './public-attempt';

const brief = { company: 'assembl.co.nz', goal: 'Research one public-source advisory opportunity.', consent: true as const, useTypeSafe: false };
describe('bounded public research identity', () => {
  it('recovers an unchanged request without another identity, even after allowance is exhausted', () => {
    const ids = vi.fn().mockReturnValueOnce('first').mockReturnValueOnce('second');
    const attempt = publicAttempt(null, brief, ids);
    expect(publicAttempt(attempt, { ...brief, company: ' assembl.co.nz ' }, ids)).toBe(attempt);
    expect(ids).toHaveBeenCalledTimes(1);
  });
  it('creates a new identity only for a deliberately changed brief', () => {
    const attempt = publicAttempt(null, brief, () => 'first');
    expect(matchesPublicAttempt(attempt, { ...brief, goal: 'Research another explicitly requested public opportunity.' })).toBe(false);
    expect(publicAttempt(attempt, { ...brief, company: 'another.example' }, () => 'second').input.requestId).toBe('second');
  });
  it('keeps provider-sharing choices within the identity boundary', () => {
    const attempt = publicAttempt(null, brief, () => 'first');
    expect(matchesPublicAttempt(attempt, { ...brief, useTypeSafe: true })).toBe(false);
    expect(matchesPublicAttempt(attempt, { ...brief, workflow: 'website_outreach' })).toBe(false);
  });
  it('does not share an identity between independent visitor components', () => {
    expect(publicAttempt(null, brief, () => 'visitor-one').input.requestId).not.toBe(publicAttempt(null, brief, () => 'visitor-two').input.requestId);
  });
});
