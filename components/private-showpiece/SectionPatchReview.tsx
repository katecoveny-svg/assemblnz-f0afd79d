'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {nodeNames} from '@/components/client-hub-migration/original/lib/creative';
import {reviewSectionPatch,sectionPatchBinding,sectionPatchMaxBytes,type SectionPatchProposal,type SectionPatchReview,type SectionPatchScope} from '@/lib/private-showpiece/section-patch';
export default function SectionPatchPanel({hub,scope,busy,onApply}:{hub:Hub;scope:SectionPatchScope;busy:boolean;onApply:(proposal:SectionPatchProposal)=>Promise<boolean>}){
 const [input,setInput]=useState(''),[review,setReview]=useState<SectionPatchReview>(),[boundTemplate,setTemplate]=useState<{key:string;value:string}>(),[message,setMessage]=useState(''),[working,setWorking]=useState(false),generation=useRef(0);
 const invalidate=useCallback(()=>{generation.current++;},[]);
 function editInput(value:string){invalidate();setInput(value);setReview(undefined);setMessage('');setWorking(false);}
 function cancel(){invalidate();setReview(undefined);setMessage('Proposal cancelled. Hub and checkpoints are unchanged.');setWorking(false);}
 const bindingKey=JSON.stringify({hub,scope});
 const template=boundTemplate?.key===bindingKey?boundTemplate.value:'';
 useEffect(()=>{let active=true;const token=++generation.current;void sectionPatchBinding(hub,{workspaceKey:scope.workspaceKey,epoch:scope.epoch,revision:scope.revision}).then(binding=>{if(active){setTemplate({key:bindingKey,value:JSON.stringify({schemaVersion:1,binding,changes:{headline:hub.design.frame.content.headline}},null,2)});if(token===generation.current)setWorking(false);}}).catch(()=>{if(active&&token===generation.current){setMessage('Current draft could not be bound. Patch application is unavailable.');setWorking(false);}});return()=>{active=false;invalidate();};},[hub,scope.workspaceKey,scope.epoch,scope.revision,bindingKey,invalidate]);
 async function stage(){const token=++generation.current;setWorking(true);setReview(undefined);setMessage('');try{const next=await reviewSectionPatch(hub,scope,input);if(token!==generation.current)return;setReview(next);setMessage('Proposal staged only. Hub and checkpoints are unchanged.');}catch(e){if(token===generation.current)setMessage((e as Error).message);}finally{if(token===generation.current)setWorking(false);}}
 async function apply(){if(!review)return;const token=++generation.current;setWorking(true);try{const applied=await onApply(review.proposal);if(token!==generation.current)return;if(applied){setReview(undefined);setInput('');setMessage('Section patch applied as a draft. Full previous Hub retained; review again before release.');}else setMessage('Patch was not applied. See the Studio notice; existing work is unchanged.');}catch(e){if(token===generation.current)setMessage((e as Error).message);}finally{if(token===generation.current)setWorking(false);}}

 return <section className="section-patch" aria-label="Section patch review"><h3>Review a section patch</h3><p>Paste a locally prepared JSON proposal. Only the six story sections can change. Applying retains the full current Hub first; it does not approve, publish or save anything.</p><details><summary>Current draft binding and patch format</summary><p>These fingerprints bind this workspace and revision. They grant no source access. Replace only values inside changes; remove unchanged fields.</p><pre>{template||'Preparing current draft binding…'}</pre></details>
 <label>Section patch JSON<textarea aria-label="Section patch JSON" rows={6} disabled={busy||working} value={input} onChange={e=>editInput(e.target.value)}/></label><small>Maximum {sectionPatchMaxBytes.toLocaleString()} UTF-8 bytes. Unknown fields and excessive section text are rejected.</small>
 <button className="cs-secondary" disabled={busy||working||!template} onClick={stage}>Stage section patch</button>
 {working&&!busy&&!review&&<button className="cs-secondary" onClick={cancel}>Cancel staging section patch</button>}
 {review&&<div role="region" aria-label="Proposed section changes"><p>Proposal only / human application required</p>{review.changes.map(change=><div key={change.field}><h4>{nodeNames[change.field]}</h4><div className="section-patch-diff"><div><b>Before</b><pre>{change.before}</pre></div><div><b>After</b><pre>{change.after}</pre></div></div></div>)}<div className="cs-actions"><button className="cs-secondary" disabled={busy||working} onClick={cancel}>Cancel section patch</button><button className="cs-primary" disabled={busy||working} onClick={apply}>Apply reviewed section patch</button></div></div>}
 {message&&<p role="status">{message}</p>}
 </section>;
}
