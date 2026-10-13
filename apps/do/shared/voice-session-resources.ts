/** Browser-only resources for one explicitly started call. No persistence or reconnect. */
export type VoiceSessionResources = {
  ws?: WebSocket;
  stream?: MediaStream;
  input?: AudioContext;
  output?: AudioContext;
  recorder?: AudioWorkletNode;
  microphone?: MediaStreamAudioSourceNode;
  sources: Set<AudioBufferSourceNode>;
  nextAudio: number;
  ready: boolean;
  muted: boolean;
  request: AbortController;
  deadline?: ReturnType<typeof setTimeout> | number;
  setupTimer?: ReturnType<typeof setTimeout> | number;
  tools: Map<string, AbortController>;
  calls: number;
};

function release(action: () => void) {
  try { action(); } catch { /* Release remaining resources even if one is already closed. */ }
}

export function stopVoiceAudio(session: VoiceSessionResources) {
  for (const source of session.sources) {
    source.onended = null;
    release(() => source.stop());
    release(() => source.disconnect());
  }
  session.sources.clear();
  session.nextAudio = session.output?.currentTime ?? 0;
}

/** Caller invalidates the active session first, so late async completions cannot publish. */
export function releaseVoiceSession(session: VoiceSessionResources | null) {
  if (!session) return;
  session.ready = false;
  // Release capture before socket/audio cleanup: a failing close must never retain the mic.
  for (const track of session.stream?.getTracks() ?? []) release(() => track.stop());
  session.request.abort();
  for (const request of session.tools.values()) request.abort();
  session.tools.clear();
  clearTimeout(session.deadline);
  clearTimeout(session.setupTimer);
  if (session.recorder) {
    session.recorder.port.onmessage = null;
    release(() => session.recorder!.port.close());
    release(() => session.recorder!.disconnect());
  }
  release(() => session.microphone?.disconnect());
  if (session.ws) {
    session.ws.onopen = session.ws.onmessage = session.ws.onerror = session.ws.onclose = null;
    if (session.ws.readyState < 2) release(() => session.ws!.close());
  }
  stopVoiceAudio(session);
  release(() => { void session.input?.close().catch(() => {}); });
  release(() => { void session.output?.close().catch(() => {}); });
}
