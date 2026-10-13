import { expect, it, vi } from 'vitest';
import { claimDoAudio } from './audio-exclusion';
it('live calls stop readout, block overlapping output and release without resuming audio', () => {
  const readout = vi.fn(); const call = vi.fn();
  const releaseReadout = claimDoAudio('readout', readout)!;
  const releaseCall = claimDoAudio('call', call)!;
  expect(readout).toHaveBeenCalledOnce();
  expect(claimDoAudio('readout', vi.fn())).toBeNull();
  expect(claimDoAudio('call', vi.fn())).toBeNull();
  releaseReadout();
  expect(claimDoAudio('readout', vi.fn())).toBeNull();
  releaseCall();
  const release = claimDoAudio('readout', vi.fn());
  expect(release).not.toBeNull(); release!();
  expect(call).not.toHaveBeenCalled();
});
