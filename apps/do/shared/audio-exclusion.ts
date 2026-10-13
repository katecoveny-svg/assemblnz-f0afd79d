/** Page-local audio ownership. Live calls take priority; never starts audio or persists data. */
type Playback = { kind: 'call' | 'readout'; stop: () => void };
let current: Playback | null = null;
export function claimDoAudio(kind: Playback['kind'], stop: () => void): (() => void) | null {
  if (current?.kind === 'call') return null;
  current?.stop();
  const owner = { kind, stop };
  current = owner;
  return () => { if (current === owner) current = null; };
}
