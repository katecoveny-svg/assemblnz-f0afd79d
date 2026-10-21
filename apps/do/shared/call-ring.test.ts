import { afterEach, describe, expect, it, vi } from 'vitest';
import { startCallRing } from './call-ring';
import { claimDoAudio } from './audio-exclusion';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('local call ring lifecycle', () => {
  function fixture() {
    const close = vi.fn(async () => {}), tones = vi.fn();
    class Audio {
      currentTime = 0; destination = {};
      resume = vi.fn(async () => {}); close = close;
      createOscillator() { tones(); return { frequency: { value: 0 }, connect() {}, disconnect() {}, start() {}, stop() {}, onended: null }; }
      createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
    }
    vi.stubGlobal('AudioContext', Audio);
    return { close, tones };
  }
  it('rings locally and stops every timer exactly once on answer or cancellation', async () => {
    vi.useFakeTimers(); const f = fixture();
    const stop = startCallRing(); await Promise.resolve();
    expect(f.tones).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(2200); expect(f.tones).toHaveBeenCalledTimes(4);
    stop(); stop(); vi.advanceTimersByTime(10000);
    expect(f.tones).toHaveBeenCalledTimes(4); expect(f.close).toHaveBeenCalledTimes(1);
  });
  it('never resumes ringing after cancellation during audio resume', async () => {
    vi.useFakeTimers(); const f = fixture(); const stop = startCallRing(); stop();
    await Promise.resolve(); vi.advanceTimersByTime(10000);
    expect(f.tones).not.toHaveBeenCalled(); expect(f.close).toHaveBeenCalledTimes(1);
  });
  it('does not interrupt an existing live call', async () => {
    const f = fixture(), end = vi.fn(), release = claimDoAudio('call', end)!;
    const stop = startCallRing(); await Promise.resolve(); stop(); release();
    expect(f.tones).not.toHaveBeenCalled(); expect(end).not.toHaveBeenCalled();
  });
  it('allows a live call to take over and stop the ring', async () => {
    vi.useFakeTimers(); const f = fixture(); const stop = startCallRing(); await Promise.resolve();
    const release = claimDoAudio('call', () => {})!;
    vi.advanceTimersByTime(10000); expect(f.close).toHaveBeenCalledTimes(1); expect(f.tones).toHaveBeenCalledTimes(2);
    stop(); release();
  });
  it('fails silently when local audio is unavailable and releases ownership', () => {
    vi.stubGlobal('AudioContext', class { constructor() { throw new Error('Unavailable'); } });
    expect(() => startCallRing()()).not.toThrow();
    const release = claimDoAudio('call', () => {}); expect(release).not.toBeNull(); release?.();
  });
});
