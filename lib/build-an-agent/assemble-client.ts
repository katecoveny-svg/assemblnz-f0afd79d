/**
 * Client-side driver for assembling a Blueprint, with real progress.
 *
 * The stages reported here are things that have actually finished — the page
 * fetched, the stylesheets read, the palette resolved — not a timer dressed up
 * as progress. The deterministic work genuinely completes before the model
 * does, so there is real news to report during the wait.
 */

export interface BriefBrand {
  primary: string;
  secondary: string | null;
  accent: string | null;
  ink: string;
}

export interface Brief {
  business: string;
  sells: string[];
  voice: string;
  questions: string[];
  facts: string[];
  blindSpots: string[];
  source: string;
  brand: BriefBrand | null;
  answered?: number;
}

export type Stage =
  | { stage: 'fetched'; source: string }
  | { stage: 'styles'; count: number }
  | { stage: 'colours'; brand: BriefBrand | null }
  | { stage: 'reading' }
  | { stage: 'done'; brief: Brief }
  | { stage: 'error'; error: string };

/**
 * Streams the assembly, calling `onStage` as each real step lands.
 * Resolves with the finished brief, or throws with a message worth showing.
 */
export async function assembleBlueprint(url: string, onStage: (s: Stage) => void): Promise<Brief> {
  const res = await fetch('/api/agent-brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, stream: true }),
  });

  // Server chose not to stream (or an error came back as plain JSON).
  const type = res.headers.get('content-type') ?? '';
  if (!res.body || !type.includes('x-ndjson')) {
    const data = await res.json();
    if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'That site could not be read.');
    return data as Brief;
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let brief: Brief | null = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let evt: Stage;
      try {
        evt = JSON.parse(trimmed) as Stage;
      } catch {
        continue;
      }
      onStage(evt);
      if (evt.stage === 'done') brief = evt.brief;
      if (evt.stage === 'error') throw new Error(evt.error);
    }
  }

  if (!brief) throw new Error('The blueprint did not come back cleanly. Try again in a moment.');
  return brief;
}
