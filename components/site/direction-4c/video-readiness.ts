// A renderer being ready does not mean Safari has decoded its video texture.
export function waitForVideoFrame(video: HTMLVideoElement, signal: AbortSignal, timeout = 6000): Promise<void> {
  return new Promise((resolve, reject) => {
    let callback: number | undefined;
    const finish = (error?: Error) => {
      clearTimeout(timer);
      video.removeEventListener('loadeddata', loaded);
      video.removeEventListener('error', failed);
      signal.removeEventListener('abort', aborted);
      if (callback !== undefined) video.cancelVideoFrameCallback(callback);
      if (error) reject(error); else resolve();
    };
    const failed = () => finish(new Error('Coastal video unavailable'));
    const aborted = () => finish(new Error('Video startup cancelled'));
    const loaded = () => {
      if (video.readyState >= 2 && video.videoWidth > 0 && !video.requestVideoFrameCallback) finish();
    };
    const timer = setTimeout(failed, timeout);
    video.addEventListener('loadeddata', loaded);
    video.addEventListener('error', failed);
    signal.addEventListener('abort', aborted, { once: true });
    if (signal.aborted) { aborted(); return; }
    if (video.requestVideoFrameCallback) callback = video.requestVideoFrameCallback(() => finish());
    else loaded();
  });
}

type PlaybackGate = { allowed(): boolean; subscribe(listener: () => void): () => void };

// A paused/hidden page has no startup deadline. Each allowed attempt gets a fresh
// frame deadline; suspending cancels it before another play request can be made.
export async function playVideoWhenAllowed(video: HTMLVideoElement, signal: AbortSignal, gate: PlaybackGate, timeout = 6000): Promise<void> {
  while (!signal.aborted) {
    await new Promise<void>((resolve, reject) => {
      let unsubscribe = () => {};
      const done = (error?: Error) => {
        unsubscribe(); signal.removeEventListener('abort', abort);
        if (error) reject(error); else resolve();
      };
      const abort = () => done(new Error('Video startup cancelled'));
      const check = () => { if (signal.aborted) abort(); else if (gate.allowed()) done(); };
      unsubscribe = gate.subscribe(check);
      signal.addEventListener('abort', abort, { once: true });
      check();
    });
    const attempt = new AbortController();
    let suspended = false;
    const suspend = () => {
      if (!gate.allowed()) { suspended = true; video.pause(); attempt.abort(); }
    };
    const abort = () => attempt.abort();
    const unsubscribe = gate.subscribe(suspend);
    signal.addEventListener('abort', abort, { once: true });
    try {
      if (signal.aborted) throw new Error('Video startup cancelled');
      suspend();
      if (suspended) continue;
      const decoded = waitForVideoFrame(video, attempt.signal, timeout);
      await Promise.all([decoded, video.play()]);
      if (signal.aborted) throw new Error('Video startup cancelled');
      if (!suspended && gate.allowed()) return;
    } catch (error) {
      if (signal.aborted || !suspended) throw error;
    } finally {
      unsubscribe(); signal.removeEventListener('abort', abort); attempt.abort();
    }
  }
  throw new Error('Video startup cancelled');
}
