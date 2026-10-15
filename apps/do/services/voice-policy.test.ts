import { describe, expect, it } from 'vitest';
import { readDoVoicePolicy } from './voice-policy';
describe('server-owned DO voice time budget', () => {
  it('retains the deployed fallback until an operator explicitly configures a budget', () => {
    expect(readDoVoicePolicy({})).toEqual({ sessionSeconds: 300, dailySeconds: 900, dailySessions: 3 });
  });
  it('supports an explicit finite budget without extending any single connection', () => {
    expect(readDoVoicePolicy({ DO_VOICE_DAILY_SECONDS: '3600' })).toEqual({ sessionSeconds: 300, dailySeconds: 3600, dailySessions: 12 });
  });
  it.each(['', '0', '-1', 'Infinity', 'NaN', 'unlimited', '900.0', '3e3', ' 900 ', '301', '90000'])('rejects invalid budget %s', value => {
    expect(() => readDoVoicePolicy({ DO_VOICE_DAILY_SECONDS: value })).toThrow();
  });
});
