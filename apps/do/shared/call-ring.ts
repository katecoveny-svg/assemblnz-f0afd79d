import { claimDoAudio } from './audio-exclusion';

/** Device-local ring. Never requests media, calls a provider or transmits data. */
export function startCallRing(): () => void {
  let audio: AudioContext | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let stopped = false;
  let release: (() => void) | null = null;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (timer) clearInterval(timer);
    if (audio) void audio.close().catch(() => {});
    release?.();
  };
  release = claimDoAudio('readout', stop);
  if (!release) return stop;
  try {
    audio = new AudioContext();
    const ring = () => {
      if (stopped || !audio) return;
      for (const delay of [0, 0.45]) {
        const tone = audio.createOscillator();
        const gain = audio.createGain();
        tone.frequency.value = 660;
        gain.gain.setValueAtTime(0, audio.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.035, audio.currentTime + delay + 0.02);
        gain.gain.linearRampToValueAtTime(0, audio.currentTime + delay + 0.3);
        tone.connect(gain); gain.connect(audio.destination);
        tone.onended = () => { tone.disconnect(); gain.disconnect(); };
        tone.start(audio.currentTime + delay); tone.stop(audio.currentTime + delay + 0.32);
      }
    };
    void audio.resume().then(() => {
      if (stopped) return;
      try { ring(); timer = setInterval(() => { try { ring(); } catch { stop(); } }, 2200); }
      catch { stop(); }
    }).catch(stop);
  } catch { stop(); }
  return stop;
}
