'use client';
import { DoTaskScene } from './DoTaskScene';
import './do-companion-board.css';
import type { BuilderJob } from '@/apps/do/shared/builder';
import { useEffect, useRef, useState } from 'react';
import { companionHandoff, copyableHandoff, handoffAcknowledgement } from '@/apps/do/shared/companion-handoff';
/** Owner-keyed by the companion. No background dispatch or microphone loop. */
export function DoCompanionHandoff({context,disabled,onResult}:{context:string;disabled:boolean;onResult:(text:string)=>boolean}) {
  const [brief,setBrief]=useState(''),[chosen,setChosen]=useState(''),[destination,setDestination]=useState('builder');
  const [payload,setPayload]=useState<ReturnType<typeof companionHandoff>|null>(null);
  const [savedTask,setSavedTask]=useState(false);
  const [master,setMaster]=useState('https://chatgpt.com/api/library/files/libfile_018ba3e0f6388191b53afc80a188460f/download');
  const [jobs,setJobs]=useState<Array<{job:BuilderJob;executionBoundary:string}>>([]);
  const [receiptText,setReceiptText]=useState('');
  const [events,setEvents]=useState<Array<{eventId:string;kind:string;createdAt:string}>>([]);
  const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[consent,setConsent]=useState(false),[result,setResult]=useState('');
  const request=useRef<AbortController|null>(null),seen=useRef(new Set<string>());
  useEffect(()=>()=>request.current?.abort(),[]);
  function edit(){setSavedTask(false);setPayload(null);setConsent(false);setResult('');setNotice('');setReceiptText('');setEvents([]);}
  async function send(check=false){
    if(!payload||busy||disabled||(!check&&(!consent||savedTask)))return;
    const controller=new AbortController();request.current=controller;setBusy(true);
    try{
      const response=await fetch(check?`/api/do/builder/jobs/${payload.job.id}`:destination==='clear'?'/api/do/companion-specialist':'/api/do/builder/jobs',check?{cache:'no-store',signal:controller.signal}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(destination==='clear'?{taskId:payload.job.id,brief,context:chosen,masterReference:master,consent:true}:payload),signal:controller.signal});
      const raw=await response.json();if(controller.signal.aborted)return;
      const ack=response.ok?handoffAcknowledgement(raw,payload.job.id):null;
      if(!ack)throw Error('No acknowledgement');
      if(Array.isArray(raw.events))setEvents(raw.events.slice(0,12));
      setSavedTask(true);setNotice(ack.label);setReceiptText(ack.text);
      if(!seen.current.has(ack.receiptId)&&onResult(ack.text))seen.current.add(ack.receiptId);
    }catch{if(!controller.signal.aborted)setNotice('Acceptance or result could not be confirmed. Keep this brief; checking again uses the same task ID.');}
    finally{if(!controller.signal.aborted)setBusy(false);}
  }
  async function loadJobs(){
    if(busy||disabled)return;
    const controller=new AbortController();request.current=controller;setBusy(true);
    try{const response=await fetch('/api/do/builder/jobs',{cache:'no-store',signal:controller.signal});const data=await response.json();if(controller.signal.aborted)return;
      if(!response.ok||!Array.isArray(data.jobs))throw Error('Unavailable');
      setJobs(data.jobs.filter((row: {durable?:boolean;job?:BuilderJob})=>row.durable===true&&row.job?.id).slice(0,20));setNotice('Saved plans loaded from your account. Open a task to check its receipts.');
    }catch{if(!controller.signal.aborted)setNotice('Shared task storage could not be confirmed. Your local brief is still here.');}
    finally{if(!controller.signal.aborted)setBusy(false);}
  }
  return <details className="do-companion-board"><summary>Shared work board</summary><fieldset disabled={disabled||busy} style={{border:0,padding:0}}>
    <section aria-label="Shared brief and decisions"><h3>1 · Brief &amp; decisions</h3><p><a href="https://chatgpt.com/api/library/files/libfile_018ba3e0f6388191b53afc80a188460f/download" target="_blank" rel="noreferrer">Existing Library working handover</a> · linked, not synced</p>
    <label>Existing master document reference<input value={master} maxLength={500} onChange={e=>{edit();setMaster(e.target.value);}} placeholder="Paste the existing document link or reference" /></label>
    <p>The master stays where it is. A reference is saved with this task; DO does not claim to read or update an unconnected document.</p>
    <label>Destination <select value={destination} onChange={e=>{edit();setDestination(e.target.value);}}><option value="clear">DO Clear · local writing checks</option><option value="builder">DO Builder · planning queue</option><option value="codex">Codex · manual handoff</option></select></label>
    <label>Shared brief<textarea maxLength={2000} value={brief} onChange={e=>{edit();setBrief(e.target.value);}} placeholder="What should we work out, and who should do what?" /></label>
    <button type="button" onClick={()=>{edit();setChosen(context.slice(0,1500));}}>Bring conversation context for review</button>
    <label>Chosen context &amp; current decisions<textarea maxLength={1500} value={chosen} onChange={e=>{edit();setChosen(e.target.value);}} /></label>
    <p>Plan only. Execution needs separate scope and permission.</p>
    <button type="button" disabled={brief.trim().length<8} onClick={()=>{try{setPayload(companionHandoff(brief,chosen,crypto.randomUUID(),new Date().toISOString(),master));setConsent(false);setNotice('Brief prepared. Nothing sent.');}catch{setNotice('Review the brief and context lengths.');}}}>Prepare handoff</button>
    </section><section aria-label="Tasks and owners"><h3>2 · Tasks &amp; owners</h3>
    <button type="button" onClick={()=>void loadJobs()}>Load my shared tasks</button>
    {jobs.map(row=><article key={row.job.id} className="do-board-task"><DoTaskScene kind={row.job.scope.includes('Specialist: clear-local.v1')?'writing':'agenda'} /><button type="button" onClick={()=>{setDestination(row.job.scope.includes('Specialist: clear-local.v1')?'clear':'builder');setSavedTask(true);setPayload({job:row.job,models:[],executionBoundary:row.executionBoundary,idempotencyKey:`companion-handoff:${row.job.id}`});setConsent(false);setReceiptText('');setEvents([]);setNotice('Saved plan selected. Check its receipts for acknowledged progress.');}}>{row.job.title}</button><span>Owner: {row.job.scope.includes('Specialist: clear-local.v1')?'DO Clear local checks':'Builder review queue'} · stored task</span></article>)}
    {payload&&<><p>Task {payload.job.id}</p><pre style={{whiteSpace:'pre-wrap'}}>{destination==='codex'?copyableHandoff(payload):payload.job.objective}</pre>
      {destination!=='codex'?<><DoTaskScene kind={destination==='clear'?'writing':'agenda'} /><p>{destination==='clear'?'Run DO Clear’s fixed writing checks on your chosen text and save the result to your Office task. No model provider is used.':'Save to your signed-in DO Office planning queue. This acknowledges a plan; it does not start a specialist worker.'}</p><label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} />{destination==='clear'?'Run local writing checks and save this exact brief, chosen text and result to my account.':'Save this exact brief and chosen context to my account for Builder review.'}</label><button type="button" disabled={!consent||savedTask} onClick={()=>void send()}>{destination==='clear'?'Run local writing checks':'Send to Builder review'}</button><button type="button" onClick={()=>void send(true)}>Check task receipts</button></>:<><p>Codex is not connected to DO. Copy this brief into the Codex conversation you choose.</p><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(copyableHandoff(payload));setNotice('Copied. Delivery and acceptance are not confirmed.');}catch{setNotice('Copy unavailable; select and copy the brief above.');}}}>Copy handoff</button><label>Paste the result for review<textarea maxLength={6000} value={result} onChange={e=>setResult(e.target.value)} /></label><button type="button" disabled={!result.trim()} onClick={()=>{if(onResult(`User-supplied Codex result for handoff ${payload.job.id} (not independently verified):\n${result}`)){setResult('');setNotice('Your reviewed result was added to this conversation.');}}}>Add reviewed result to conversation</button></>}
    </>}
    </section><section aria-label="Results and review"><h3>3 · Results &amp; review</h3>
    {receiptText?<pre style={{whiteSpace:'pre-wrap'}}>{receiptText}</pre>:<p>No task result acknowledged here yet. A saved plan is not a completed specialist run.</p>}
    <details><summary>Activity &amp; daily catch-up</summary>{events.length?<ul>{events.map(event=><li key={event.eventId}>{event.kind.replaceAll('_',' ')} · {event.createdAt}</li>)}</ul>:<p>No activity records loaded for this task. Check task receipts to refresh. Codex and Claude are not automatically connected.</p>}<p>Artwork identifies the work type; it is not a screenshot or proof of work. Result pictures appear only when an actual supported artifact is available.</p></details>
    <p role="status">{busy?'Waiting for an acknowledgement…':notice}</p>
  </section></fieldset></details>;
}
