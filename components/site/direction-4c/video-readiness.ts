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
