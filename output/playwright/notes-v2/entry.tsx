import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DoFocusWorkspace } from '../../../components/do/DoFocusWorkspace';
import personalStyles from '../../../app/do/personal/personal.module.css';
import { LifeAdmin } from '../../../app/do/personal/LifeAdmin';
let mode = 'ended'; let calls = 0; let release: (() => void) | null = null; let signal: AbortSignal | null = null;
Object.assign(window, { synthetic: { setMode(value: string) { mode = value; }, get count() { return calls; }, get aborted() { return signal?.aborted ?? false; }, release() { release?.(); release = null; } } });
window.fetch = async (input, options) => {
  if (String(input) === '/api/do/runtime') return Response.json({ trial: { remaining: 3, limit: 3 } });
  if (!String(input).includes('/api/do/vision')) throw new Error('All unrelated providers blocked by harness.');
  calls++; signal = options?.signal ?? null;
  const current = mode;
  if (current === 'delayed') await new Promise<void>(resolve => { release = resolve; });
  if (current === 'failure') return Response.json({ message: 'Synthetic observation service failure' }, { status: 503 });
  return Response.json({ text: current === 'delayed' ? 'STALE SYNTHETIC TEXT' : 'Synthetic observation or transcript.', completion: { status: 'provider-ended', finishReason: 'stop', rawFinishReason: 'end_turn', providerStatus: null, incompleteReason: null }, receipt: { model: 'synthetic-no-provider', imageHash: 'synthetic', outputHash: 'synthetic', createdAt: 'synthetic', boundary: 'Synthetic proof only.' } });
};
function Harness() {
  const [scope, setScope] = useState('synthetic-owner-a');
  const life = new URLSearchParams(location.search).get('surface') === 'life';
  return <><button onClick={() => setScope(value => value === 'synthetic-owner-a' ? 'synthetic-owner-b' : 'synthetic-owner-a')}>Change synthetic owner</button>{life ? <main className={personalStyles.page}><LifeAdmin storageScope={scope} assistant={<div>Synthetic Ask DO surface</div>} onTalk={() => {}} /></main> : <DoFocusWorkspace key={scope} />}</>;
}
createRoot(document.getElementById('root')!).render(<Harness />);
