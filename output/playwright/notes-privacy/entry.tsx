import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DoFocusWorkspace } from '../../../components/do/DoFocusWorkspace';
import personalStyles from '../../../app/do/personal/personal.module.css';
import { DoWidgetPrivacyBoundary } from '../../../components/do/DoWidgetPrivacyBoundary';
let mode = 'ended'; let calls = 0; let release: (() => void) | null = null; let signal: AbortSignal | null = null;
Object.assign(window, { synthetic: { setMode(value: string) { mode = value; }, get count() { return calls; }, get aborted() { return signal?.aborted ?? false; }, release() { release?.(); release = null; } } });
let owner: string | null = 'guest'; let callback: ((event: string, session: unknown) => void) | null = null; let pending: (() => void) | null = null; let defer = false; let fail = false; let personalCalls = 0; let unsubscriptions = 0;
Object.assign(window, {privacy: {
 subscribe(cb: NonNullable<typeof callback>){callback=cb;}, unsubscribe(){callback=null;unsubscriptions++;},
 event(value: string, event='SIGNED_IN'){owner=value;callback?.(event,value==='guest'?null:{user:{id:value}});},
 setOwner(value: string | null){owner=value;}, focus(){window.dispatchEvent(new Event('focus'));},
 defer(){defer=true;}, release(){pending?.();pending=null;}, fail(value: boolean){fail=value;},
 get calls(){return personalCalls;},get unsubscriptions(){return unsubscriptions;}
}});
window.fetch = async (input, options) => {
  if (String(input) === '/api/do/personal') {
    personalCalls++;const captured=owner;const failure=fail;
    if(defer){defer=false;await new Promise<void>(resolve=>{pending=resolve;});}
    return Response.json({workspaceKey:captured}, {status:failure?503:captured==='guest'?401:200});
  }
  if (String(input) === '/api/do/runtime') return Response.json({ trial: { remaining: 3, limit: 3 } });
  if (!String(input).includes('/api/do/vision')) throw new Error('All unrelated providers blocked by harness.');
  calls++; signal = options?.signal ?? null;
  const current = mode;
  if (current === 'delayed') await new Promise<void>(resolve => { release = resolve; });
  if (current === 'failure') return Response.json({ message: 'Synthetic observation service failure' }, { status: 503 });
  return Response.json({ text: current === 'delayed' ? 'STALE SYNTHETIC TEXT' : 'Synthetic observation or transcript.', completion: { status: 'provider-ended', finishReason: 'stop', rawFinishReason: 'end_turn', providerStatus: null, incompleteReason: null }, receipt: { model: 'synthetic-no-provider', imageHash: 'synthetic', outputHash: 'synthetic', createdAt: 'synthetic', boundary: 'Synthetic proof only.' } });
};
function Harness(){const[mounted,setMounted]=useState(true);return <><button onClick={()=>setMounted(false)}>Unmount synthetic widget</button>{mounted&&<DoWidgetPrivacyBoundary initialTask="reply"/>}</>}
createRoot(document.getElementById('root')!).render(<Harness />);
