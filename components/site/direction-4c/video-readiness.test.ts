import { afterEach, describe, expect, it, vi } from 'vitest';
import { playVideoWhenAllowed, waitForVideoFrame } from './video-readiness';

function fixture(callbacks = true) {
  const video = new EventTarget() as HTMLVideoElement;
  Object.assign(video, { readyState: 2, videoWidth: 1280 });
  let decoded!: VideoFrameRequestCallback;
  if (callbacks) Object.assign(video, { requestVideoFrameCallback: (fn: VideoFrameRequestCallback) => { decoded = fn; return 1; }, cancelVideoFrameCallback: vi.fn() });
  return { video, decode: () => decoded(0, {} as VideoFrameCallbackMetadata), controller: new AbortController() };
}
afterEach(() => vi.useRealTimers());
describe('coastal video readiness', () => {
  it('does not treat loaded metadata or GPU readiness as decoded pixels', async () => {
    const f = fixture(); let ready = false;
    const waiting = waitForVideoFrame(f.video, f.controller.signal).then(() => { ready = true; });
    f.video.dispatchEvent(new Event('loadeddata')); await Promise.resolve();
    expect(ready).toBe(false);
    f.decode(); await waiting; expect(ready).toBe(true);
  });
  it('bounds a no-frame stall and cancels its callback', async () => {
    vi.useFakeTimers(); const f = fixture();
    const waiting = waitForVideoFrame(f.video, f.controller.signal, 100);
    const rejection = expect(waiting).rejects.toThrow('unavailable');
    await vi.advanceTimersByTimeAsync(100); await rejection;
    expect(f.video.cancelVideoFrameCallback).toHaveBeenCalledWith(1);
  });
  it('cancels startup on unmount or preference changes', async () => {
    const f = fixture(); const waiting = waitForVideoFrame(f.video, f.controller.signal);
    f.controller.abort(); await expect(waiting).rejects.toThrow('cancelled');
  });
  it('accepts loaded pixel data on browsers without frame callbacks', async () => {
    const f = fixture(false); await expect(waitForVideoFrame(f.video, f.controller.signal)).resolves.toBeUndefined();
  });
});


it('does not spend the frame deadline while paused or hidden, including suspension mid-start', async () => {
  vi.useFakeTimers(); const f = fixture();
  const play = vi.fn().mockResolvedValue(undefined), pause = vi.fn();
  Object.assign(f.video, { play, pause });
  let allowed = false; const listeners = new Set<() => void>();
  const gate = { allowed: () => allowed, subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; } };
  const change = (value: boolean) => { allowed = value; [...listeners].forEach(fn => fn()); };
  const pending = playVideoWhenAllowed(f.video, f.controller.signal, gate, 100);
  await vi.advanceTimersByTimeAsync(1000); expect(play).not.toHaveBeenCalled();
  change(true); await vi.advanceTimersByTimeAsync(50); expect(play).toHaveBeenCalledOnce();
  change(false); await vi.advanceTimersByTimeAsync(1000); expect(pause).toHaveBeenCalled();
  expect(play).toHaveBeenCalledOnce();
  change(true); await vi.advanceTimersByTimeAsync(50); f.decode(); await pending;
  expect(play).toHaveBeenCalledTimes(2); expect(listeners.size).toBe(0);
});
