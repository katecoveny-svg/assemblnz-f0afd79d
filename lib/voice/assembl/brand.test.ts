import { describe, expect, it } from 'vitest';
import { brandVoiceDraftSchema, initialBrandVoice, previewBlocker, referenceProblem } from './brand';
describe('brand voice review boundary', () => {
  it('round-trips settings without importing consent/audio/approval', () => {
    expect(brandVoiceDraftSchema.parse(JSON.parse(JSON.stringify(initialBrandVoice)))).toEqual(initialBrandVoice);
    for (const patch of [{ approval: 'approved' }, { consent: true }, { audio: 'private bytes' }]) expect(brandVoiceDraftSchema.safeParse({ ...initialBrandVoice, ...patch }).success).toBe(false);
  });
  it('bounds reference size, supported type and decoded duration', () => {
    expect(referenceProblem(1024, 'audio/wav', 15)).toBeNull();
    expect(referenceProblem(11 * 1024 * 1024, 'audio/wav', 15)).not.toBeNull();
    expect(referenceProblem(1024, 'text/plain', 15)).not.toBeNull();
    expect(referenceProblem(1024, 'audio/wav', NaN)).not.toBeNull();
    expect(referenceProblem(1024, 'audio/wav', 61)).not.toBeNull();
  });
  it('does not let VoiceDesign or stock rights bypass cloning support/consent', () => {
    const facts = { providerConfigured: true, privateProfileStored: true, cloningSupported: false, designedSupported: true, rightsConfirmed: true, costApproved: true, referenceConsented: true };
    expect(previewBlocker('own-clone', facts)).not.toBeNull();
    expect(previewBlocker('own-clone', { ...facts, cloningSupported: true, referenceConsented: false })).not.toBeNull();
    expect(previewBlocker('licensed-stock', { ...facts, rightsConfirmed: false })).not.toBeNull();
    expect(previewBlocker('own-clone', { ...facts, cloningSupported: true })).toBeNull();
  });
});
