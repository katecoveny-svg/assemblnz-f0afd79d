import { describe, expect, it } from 'vitest';
import { isCompanionEntry, talkEntryReadiness } from './companion-entry';
const ready = { enabled: true, configured: true, signedIn: true, remaining: 2 };
describe('DO companion entry readiness', () => {
  it('fails closed until live conversation, identity and allowance are checked', () => {
    for (const value of [null, undefined, {}, { ...ready, enabled: false }, { ...ready, configured: false }, { ...ready, signedIn: false }, { ...ready, remaining: null }, { ...ready, remaining: 0 }, { ...ready, remaining: NaN }, { ...ready, remaining: -1 }, { ...ready, enabled: 'true' }]) expect(talkEntryReadiness(value).canOpen).toBe(false);
    expect(talkEntryReadiness(ready)).toEqual({ state: 'ready', canOpen: true, message: expect.stringContaining('consent') });
  });
  it('accepts only Write and Talk navigation, never capture or provider actions', () => {
    expect(isCompanionEntry('write')).toBe(true); expect(isCompanionEntry('talk')).toBe(true);
    for (const value of ['record', 'capture', 'call-business', 'clipboard', {}, null]) expect(isCompanionEntry(value)).toBe(false);
  });
});
