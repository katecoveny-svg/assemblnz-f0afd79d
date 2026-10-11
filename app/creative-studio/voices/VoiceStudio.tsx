'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Mic2, Trash2 } from 'lucide-react';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import { sampleScript, voiceJobSchema, voicePresets, type VoiceJob, type VoicePreset } from '@/lib/voice/assembl/model';
import sampleData from '@/public/do/voice/assembl/samples.json';
import styles from './voices.module.css';
const examples=sampleData.items as {preset:VoicePreset;duration:number;sha256:string}[];
const active=(j:VoiceJob|null)=>!!j&&['queued','generating'].includes(j.state);
async function responseMessage(response:Response,fallback:string){const data=await response.json().catch(()=>null);return typeof data?.message==='string'?data.message:fallback;}
async function serviceAvailability():Promise<{value:'ready'|'signin'|'unavailable';message:string}>{
  try {
    const r=await fetch('/api/creative/voices',{cache:'no-store',signal:AbortSignal.timeout(20000)});
    if(r.status===401)return {value:'signin',message:'Sign in with your assembl account to generate a script.'};
    if(!r.ok)return {value:'unavailable',message:await responseMessage(r,'Voice generation is unavailable. Your script stays here.')};
    return {value:'ready',message:'The voice service is reachable. Choose the options you want to generate.'};
  }catch{return {value:'unavailable',message:'Could not reach the voice service. Your script stays here.'};}
}
export function VoiceStudio(){
  const [text,setText]=useState(sampleScript);
  const [selected,setSelected]=useState<VoicePreset[]>(['warm','clear','bright']);
  const [consent,setConsent]=useState(false);
  const [availability,setAvailability]=useState<'checking'|'ready'|'signin'|'unavailable'>('checking');
  const [status,setStatus]=useState('Checking voice generation availability…');
  const [job,setJob]=useState<VoiceJob|null>(null);
  const [busy,setBusy]=useState(false);
  const [retry,setRetry]=useState(0);
  const jobId=job?.id; const jobState=job?.state;
  const root=useRef<HTMLElement>(null);
  const check=async()=>{const result=await serviceAvailability();setAvailability(result.value);setStatus(result.message);};
  useEffect(()=>{let mounted=true;void serviceAvailability().then(result=>{if(mounted){setAvailability(result.value);setStatus(result.message);}});return()=>{mounted=false;};},[]);
  useEffect(()=>{
    if(!jobId||!jobState||!['queued','generating'].includes(jobState))return;
    const controller=new AbortController();let timer:ReturnType<typeof setTimeout>;let failures=0;
    const poll=async()=>{
      try{
        const r=await fetch('/api/creative/voices/'+jobId,{cache:'no-store',signal:controller.signal});
        if(!r.ok)throw Error(await responseMessage(r,'Could not refresh this job.'));
        const next=voiceJobSchema.parse(await r.json());
        if(controller.signal.aborted)return;
        setJob(next);failures=0;
        setStatus(next.state==='ready'?'Your audio is ready. Listen before using it.':next.state==='failed'?'Generation failed. Keep your script and try again.':next.state==='queued'?'Queued. Your script is waiting for the voice worker.':'Generating '+next.outputs.length+' of '+next.presets.length+' voice options.');
        if(active(next))timer=setTimeout(poll,2000);
      }catch(e){
        if(controller.signal.aborted)return;
        failures++;setStatus(e instanceof Error?e.message:'Could not refresh the job.');
        if(failures<5)timer=setTimeout(poll,4000);
      }
    };
    timer=setTimeout(poll,1200);
    return()=>{controller.abort();clearTimeout(timer);};
  },[jobId,jobState,retry]);
  const generate=async()=>{
    if(busy||active(job))return;
    setBusy(true);
    try{
      const r=await fetch('/api/creative/voices',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,presets:selected,language:'en-NZ',consent}),signal:AbortSignal.timeout(20000)});
      if(!r.ok)throw Error(await responseMessage(r,'Could not start generation.'));
      setJob(voiceJobSchema.parse(await r.json()));setConsent(false);setStatus('Voice job accepted. Keep this tab open while it generates.');
    }catch(e){setStatus(e instanceof Error?e.message:'Could not confirm generation. Keep your script and check again before retrying.');}
    finally{setBusy(false);}
  };
  const remove=async()=>{
    if(!job||busy)return;setBusy(true);
    try{
      const r=await fetch('/api/creative/voices/'+job.id,{method:'DELETE',signal:AbortSignal.timeout(20000)});
      if(!r.ok&&r.status!==404)throw Error(await responseMessage(r,'Could not remove this job.'));
      setJob(null);setStatus('Temporary job removed. Files you downloaded remain on your device.');
    }catch(e){setStatus(e instanceof Error?e.message:'Could not remove this job.');}
    finally{setBusy(false);}
  };
  const pauseOthers=(element:HTMLAudioElement)=>{root.current?.querySelectorAll('audio').forEach(a=>{if(a!==element)a.pause();});};
  return <main ref={root} className={styles.studio}>
    <header className={styles.header}><Link href="/creative-studio" className={styles.brand}><GlassIdentity kind="assembl" size={42}/><span>assembl</span></Link><nav aria-label="Studio navigation"><Link href="/creative-studio"><ArrowLeft size={16} aria-hidden="true"/> Studio</Link><Link href="/do">Open DO <ArrowUpRight size={16} aria-hidden="true"/></Link></nav></header>
    <section className={styles.intro}><h1>Give the work<br/>a voice.</h1><p>One script. A few ways to say it.<br/>Original voice options, generated by the assembl speech engine.</p></section>
    <div className={styles.layout}><section className={styles.editor} aria-labelledby="script-heading">
      <h2 id="script-heading">Start with your words.</h2>
      <label>Your script<textarea value={text} maxLength={300} rows={7} onChange={e=>{setText(e.target.value);setConsent(false);}} placeholder="Write a short greeting, product demo or spoken reply."/></label>
      <p className={styles.count}>{text.length}/300 characters · English</p>
      <fieldset><legend>Choose voice options</legend>{voicePresets.map(p=><label key={p.id} className={styles.option}>
        <input type="checkbox" checked={selected.includes(p.id as VoicePreset)} onChange={e=>{setSelected(v=>e.target.checked?[...v,p.id as VoicePreset]:v.filter(id=>id!==p.id));setConsent(false);}}/>
        <span><strong>{p.name}</strong><span>{p.description}</span></span>
      </label>)}</fieldset>
      <label className={styles.consent}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I can use this script and want assembl to generate the selected voices.</label>
      <button type="button" className={styles.primary} disabled={availability!=='ready'||busy||active(job)||!consent||!selected.length||!text.trim()} onClick={()=>void generate()}><Mic2 size={18} aria-hidden="true"/>{busy?'Please wait…':active(job)?'Generating…':'Generate voice options'}</button>
      <p className={styles.hint}>Your script goes to the assembl voice worker. Temporary scripts and audio expire after 30 minutes. No new provider account is needed.</p>
      {availability==='signin'&&<div className={styles.signin}><Link href="/login?redirect=%2Fcreative-studio%2Fvoices">Sign in to generate <ArrowUpRight size={16} aria-hidden="true"/></Link><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(text);setStatus('Script copied. Paste it back after signing in.');}catch{setStatus('Select and copy your script manually before signing in.');}}}>Copy script first</button><p>Copy your script before leaving. It is not saved across sign-in.</p></div>}
      {availability==='unavailable'&&<button type="button" onClick={()=>void check()}>Check availability again</button>}
      <p role="status" className={styles.status}>{status}</p>
    </section><section className={styles.listening} aria-labelledby="listen-heading">
      <h2 id="listen-heading">Listen. Compare. Choose.</h2>
      {job?<div className={styles.job}><div className={styles.jobHeading}><span>{job.state==='ready'?<Check size={20} aria-hidden="true"/>:<Mic2 size={20} aria-hidden="true"/>}{job.state==='ready'?'Ready to listen':job.state==='failed'?'Generation failed':job.state==='queued'?'Waiting for the worker':'Making your voices'}</span><button type="button" disabled={busy} onClick={()=>void remove()} aria-label="Remove temporary voice job"><Trash2 size={18} aria-hidden="true"/></button></div>
        <p className={styles.transcript}>{job.text}</p>
        {job.state==='ready'&&job.outputs.map(o=><article className={styles.audioRow} key={o.preset}><h3>{voicePresets.find(p=>p.id===o.preset)?.name}</h3><audio controls preload="none" aria-label={o.preset+' generated voice'} src={'/api/creative/voices/'+job.id+'/audio/'+o.preset} onPlay={e=>pauseOthers(e.currentTarget)}/><a download={'assembl-'+o.preset+'.wav'} href={'/api/creative/voices/'+job.id+'/audio/'+o.preset}>Download WAV · {o.duration.toFixed(1)}s</a></article>)}
        {active(job)&&<button type="button" onClick={()=>setRetry(v=>v+1)}>Check job again</button>}
        <p className={styles.hint}>Temporary job expires {new Date(job.expiresAt).toLocaleTimeString('en-NZ',{hour:'numeric',minute:'2-digit'})}. Download any audio you want to keep.</p>
      </div>:<div className={styles.empty}><GlassIdentity kind="assembl" size={112}/><p>Your script becomes something you can hear.</p><span>Generated audio will appear here.</span></div>}
      {examples.length>0&&<details className={styles.examples}><summary>Listen to generated examples</summary><p className={styles.transcript}>{sampleScript}</p>{examples.map(o=><article key={o.preset} className={styles.audioRow}><h3>{voicePresets.find(p=>p.id===o.preset)?.name}</h3><audio controls preload="none" aria-label={o.preset+' example voice'} src={'/do/voice/assembl/'+o.preset+'.wav'} onPlay={e=>pauseOthers(e.currentTarget)}/><a download href={'/do/voice/assembl/'+o.preset+'.wav'}>Download example</a></article>)}</details>}
      <div className={styles.boundary}><h3>A voice direction to review.</h3><p>These options request New Zealand English. Accent and pronunciation still need listening review, and the voice can vary between scripts.</p><p>Te reo Māori and live phone calls are not available in this tool yet.</p></div>
    </section></div>
    <footer className={styles.footer}><span>Studio by assembl</span><Link href="/legal/privacy">Privacy</Link></footer>
  </main>;
}
