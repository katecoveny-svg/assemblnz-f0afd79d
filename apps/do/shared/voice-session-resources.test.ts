import { afterEach, describe, expect, it, vi } from 'vitest';
import { releaseVoiceSession, stopVoiceAudio, type VoiceSessionResources } from './voice-session-resources';

afterEach(() => vi.useRealTimers());

function fixture() {
  const fail = () => { throw new Error('already closed'); };
  const tracks = [{ stop: vi.fn(fail) }, { stop: vi.fn() }];
  const sources = [{ stop: vi.fn(fail), disconnect: vi.fn(), onended: vi.fn() }, { stop: vi.fn(), disconnect: vi.fn(), onended: vi.fn() }];
  const ws = { readyState: 1, close: vi.fn(fail), onopen: vi.fn(), onmessage: vi.fn(), onerror: vi.fn(), onclose: vi.fn() };
  const recorder = { disconnect: vi.fn(fail), port: { onmessage: vi.fn(), close: vi.fn() } };
  const microphone = { disconnect: vi.fn() };
  const input = { close: vi.fn(fail) };
  const output = { currentTime: 12, close: vi.fn(async () => {}) };
  const tool = new AbortController();
  const session = {
    ws, stream: { getTracks: () => tracks }, input, output, recorder, microphone,
    sources: new Set(sources), nextAudio: 32, ready: true, muted: false,
    request: new AbortController(), tools: new Map([['fixture', tool]]), calls: 1,
  } as unknown as VoiceSessionResources;
  return { session, tracks, sources, ws, recorder, microphone, input, output, tool };
}

describe('call resource release', () => {
  it('releases every resource despite failures in track, socket, recorder, audio and context cleanup', () => {
    vi.useFakeTimers();
    const f = fixture();
    const timeout = vi.fn();
    f.session.deadline = setTimeout(timeout, 300_000);
    f.session.setupTimer = setTimeout(timeout, 30_000);
    expect(() => releaseVoiceSession(f.session)).not.toThrow();
    for (const track of f.tracks) expect(track.stop).toHaveBeenCalledOnce();
    expect(f.session.ready).toBe(false);
    expect(f.session.request.signal.aborted).toBe(true);
    expect(f.tool.signal.aborted).toBe(true);
    expect(f.session.tools.size).toBe(0);
    expect(f.ws.close).toHaveBeenCalledOnce();
    expect(f.ws.onmessage).toBeNull();
    expect(f.recorder.port.onmessage).toBeNull();
    expect(f.recorder.port.close).toHaveBeenCalledOnce();
    expect(f.recorder.disconnect).toHaveBeenCalledOnce();
    expect(f.microphone.disconnect).toHaveBeenCalledOnce();
    for (const source of f.sources) {
      expect(source.stop).toHaveBeenCalledOnce();
      expect(source.disconnect).toHaveBeenCalledOnce();
      expect(source.onended).toBeNull();
    }
    expect(f.input.close).toHaveBeenCalledOnce();
    expect(f.output.close).toHaveBeenCalledOnce();
    expect(f.session.sources.size).toBe(0);
    vi.runAllTimers();
    expect(timeout).not.toHaveBeenCalled();
  });

  it('interruption cancels queued playback while retaining capture and the connection', () => {
    const f = fixture();
    stopVoiceAudio(f.session);
    expect(f.session.sources.size).toBe(0);
    expect(f.session.nextAudio).toBe(12);
    expect(f.session.ready).toBe(true);
    expect(f.tracks[0].stop).not.toHaveBeenCalled();
    expect(f.ws.close).not.toHaveBeenCalled();
    expect(f.session.request.signal.aborted).toBe(false);
  });

  it('tolerates partial initialization, repeated cleanup and asynchronous context-close rejection', async () => {
    const f = fixture();
    f.session.ws = undefined; f.session.stream = undefined; f.session.recorder = undefined;
    f.session.output = { close: vi.fn(async () => { throw new Error('closed'); }) } as unknown as AudioContext;
    releaseVoiceSession(f.session);
    releaseVoiceSession(f.session);
    releaseVoiceSession(null);
    await Promise.resolve();
    expect(f.session.request.signal.aborted).toBe(true);
  });
});
