'use client';
import {useLayoutEffect,useMemo,useRef,useState} from 'react';
import type {Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import Research from './research/workspace';
import {applyArchiveSelection,createArchiveTransport,parseResearchArchive,fingerprintArchive,type ResearchArchive} from '../../lib/private-showpiece/research-archive';
import {createArchiveReviewGuard,hubReviewContext} from '../../lib/private-showpiece/archive-review-guard';
type Props={hub:Hub;onApply:(hub:Hub)=>void;busy?:boolean};
export default function ResearchArchiveReview(props:Props){return <BoundResearchArchiveReview key={hubReviewContext(props.hub)} {...props}/>;}
function BoundResearchArchiveReview({hub,onApply,busy=false}:Props){
 const context=hubReviewContext(hub),[guard]=useState(()=>createArchiveReviewGuard(context));
 const latest=useRef({hub,onApply,busy,context});
 const [loaded,setLoaded]=useState<{archive:ResearchArchive;sha256:string}>(),[reviewed,setReviewed]=useState(false),[message,setMessage]=useState('');
 useLayoutEffect(()=>{latest.current={hub,onApply,busy,context};guard.syncContext(context);},[hub,onApply,busy,context,guard]);
 useLayoutEffect(()=>()=>guard.invalidate(),[guard]);
 const transport=useMemo(()=>loaded?createArchiveTransport(loaded.archive):undefined,[loaded]);
 async function load(file:File|undefined){const token=guard.beginLoad();setLoaded(undefined);setReviewed(false);setMessage('');if(!file)return;try{if(file.size>250000)throw Error('Keep the selected archive below 250KB.');const archive=parseResearchArchive(await file.text()),sha256=await fingerprintArchive(archive);if(guard.acceptLoad(token,sha256))setLoaded({archive,sha256});}catch(err){if(guard.isCurrent(token))setMessage((err as Error).message);}}
 return <section aria-label="Original agency reference archive" className="cs-card"><h2>Bring a saved direction into the piece.</h2><p>Reuse the original agency reference boards. Open an owner-supplied selected archive, inspect its source history, then choose up to six creative references for this draft.</p><p className="cs-small">Local read-only review. No legacy account access, collection, provider connection or save occurs. Agency Director remains a separate original workflow awaiting account export and integration review.</p><fieldset disabled={busy}><label>Selected research archive JSON<input type="file" accept="application/json,.json" onChange={e=>void load(e.target.files?.[0])}/></label>{loaded&&<><p>{loaded.archive.label} · {loaded.archive.records.length} records · Imported provenance unverified</p><label className="cs-check"><input type="checkbox" checked={reviewed} onChange={e=>{if(e.target.checked){guard.review(loaded.sha256);setReviewed(true);}else{guard.clearReview();setReviewed(false);}}}/>I reviewed these public sources and their provenance. These are creative references, with no claimed company facts or reuse permission.</label></>}</fieldset>{loaded&&transport&&<Research key={loaded.sha256} brandId={loaded.archive.brandId} transport={transport} onSelect={async(board:string,ids:string[])=>{const current=latest.current;if(current.busy)throw Error('Wait for the current Studio action.');guard.assertSelection(loaded.sha256);current.onApply(applyArchiveSelection(current.hub,loaded.archive,board,ids,{reviewed:true,archiveSha256:loaded.sha256,contextKey:current.context}));}}/>}{message&&<p role="alert">{message}</p>}</section>;
}
