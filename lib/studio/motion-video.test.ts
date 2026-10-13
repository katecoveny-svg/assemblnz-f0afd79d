import { afterEach, describe, expect, it, vi } from 'vitest';
import { recordVideo, videoMimeType } from './motion-video';
import { projectVideo, seedProject } from './public-project';

const design = projectVideo(seedProject(), 'Arial');
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
function environment(mode = 'ok') {
  const track = { stop: vi.fn() };
  const stream = { getTracks: () => [track], addTrack: vi.fn() };
  const ctx = new Proxy({}, { get: (_, name) => name === 'measureText' ? () => ({ width: 10 }) : () => {} });
  const canvas = { getContext: () => ctx, captureStream: () => stream } as unknown as HTMLCanvasElement;
  const events = new EventTarget();
  vi.stubGlobal('document', { fonts: { ready: Promise.resolve() }, hidden: false, addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events) });
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => setTimeout(() => fn(performance.now() + 20000), 1));
  vi.stubGlobal('cancelAnimationFrame', clearTimeout);
  const order: string[] = [];
  class Recorder {
    static isTypeSupported = () => true;
    mimeType = 'video/webm'; state = 'inactive';
    onstart?: () => void; onstop?: () => void; onerror?: () => void;
    ondataavailable?: (event: { data: Blob }) => void;
    start() {
      order.push('recorder'); this.state = 'recording';
      if (mode === 'throw') throw Error('encoder failed');
      if (mode === 'error') queueMicrotask(() => this.onerror?.());
      else if (mode !== 'hang') queueMicrotask(() => this.onstart?.());
    }
    stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new Blob(mode === 'empty' ? [] : ['frames']) }); this.onstop?.(); }
  }
  vi.stubGlobal('MediaRecorder', Recorder);
  return { canvas, track, order, events };
}
describe('browser capture lifecycle', () => {
  it('reports unsupported codecs without starting', async () => {
    const { canvas } = environment();
    vi.stubGlobal('MediaRecorder', undefined);
    expect(videoMimeType()).toBeUndefined();
    await expect(recordVideo(canvas, design, 'landscape', 4, vi.fn(), new AbortController().signal)).rejects.toThrow('unavailable');
  });
  it.each(['throw', 'error', 'empty'])('cleans up on %s encoding failure', async mode => {
    const { canvas, track } = environment(mode);
    await expect(recordVideo(canvas, design, 'landscape', 4, vi.fn(), new AbortController().signal)).rejects.toThrow();
    expect(track.stop).toHaveBeenCalled();
  });
  it('starts narration after recording, pauses it at the end and releases resources', async () => {
    const { canvas, track, order } = environment();
    const pause = vi.fn(); const close = vi.fn();
    vi.stubGlobal('Audio', class { currentTime = 99; play() { order.push('audio'); expect(this.currentTime).toBe(0); return Promise.resolve(); } pause = pause; });
    vi.stubGlobal('AudioContext', class { createMediaStreamDestination() { return { stream: { getAudioTracks: () => [] } }; } createMediaElementSource() { return { connect: vi.fn() }; } resume() { return Promise.resolve(); } close = close; });
    const result = await recordVideo(canvas, design, 'landscape', 4, vi.fn(), new AbortController().signal, null, new File(['wav'], 'voice.wav'));
    expect(order).toEqual(['recorder', 'audio']); expect(result.blob.size).toBeGreaterThan(0);
    expect(pause).toHaveBeenCalled(); expect(close).toHaveBeenCalled(); expect(track.stop).toHaveBeenCalled();
  });
  it('cancels on hide and stops tracks', async () => {
    const { canvas, track, events } = environment('hang');
    const capture = recordVideo(canvas, design, 'landscape', 4, vi.fn(), new AbortController().signal);
    await Promise.resolve(); Object.defineProperty(document, 'hidden', { value: true });
    events.dispatchEvent(new Event('visibilitychange'));
    await expect(capture).rejects.toThrow('hidden'); expect(track.stop).toHaveBeenCalled();
  });
  it('respects an already cancelled request', async () => {
    const { canvas } = environment(); const abort = new AbortController(); abort.abort();
    await expect(recordVideo(canvas, design, 'landscape', 4, vi.fn(), abort.signal)).rejects.toThrow('cancelled');
  });
});
