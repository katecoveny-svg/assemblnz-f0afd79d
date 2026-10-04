import React from 'react';
import { createRoot } from 'react-dom/client';
import { DoFocusWorkspace } from '../../../components/do/DoFocusWorkspace';
// Synthetic response controller. Never use this harness for live providers.
let mode = 'ended';
let count = 0;
let resolvePending: (() => void) | null = null;
const completion = (status: string) => ({ status, finishReason: status === 'incomplete' ? 'length' : status === 'unverified' ? 'unknown' : 'stop', rawFinishReason: status === 'incomplete' ? 'max_tokens' : status === 'unverified' ? null : 'end_turn', providerStatus: null, incompleteReason: null });
Object.assign(window, {
  synthetic: {
    setMode(value: string) { mode = value; }, get count() { return count; },
    release() { resolvePending?.(); resolvePending = null; },
  },
});
window.fetch = async (input, options) => {
  if (!String(input).includes('/api/do/vision')) throw new Error('Synthetic harness blocks all other fetches.');
  count++;
  const request = JSON.parse(String(options?.body));
  if (request.consent !== true) throw new Error('Missing consent');
  const current = mode;
  if (current === 'delayed') await new Promise<void>(resolve => { resolvePending = resolve; }); // Deliberately ignores abort to exercise late-result guards.
  if (current === 'failure') return Response.json({ message: 'Synthetic service failure; allowance release is unconfirmed.' }, { status: 503 });
  if (current === 'quota') return Response.json({ message: 'Synthetic existing allowance exhausted.' }, { status: 402 });
  const status = current === 'incomplete' ? 'incomplete' : current === 'unverified' ? 'unverified' : 'provider-ended';
  return Response.json({ text: current === 'delayed' ? 'STALE SYNTHETIC RESULT' : 'Synthetic transcription\nPrepare the room.\nCheck the flowers.', completion: completion(status), receipt: { model: 'synthetic-no-provider', imageHash: 'synthetic', outputHash: 'synthetic', createdAt: new Date().toISOString(), boundary: 'Synthetic local component proof only.' } });
};
createRoot(document.getElementById('root')!).render(<DoFocusWorkspace />);
