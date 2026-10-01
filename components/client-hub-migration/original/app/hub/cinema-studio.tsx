"use client";
import { migrationFetch as fetch } from "@/lib/client-hub-migration/review-adapter";
import {useEffect,useLayoutEffect,useRef,useState} from "react";
import {Film,Image as ImageIcon,Upload} from "lucide-react";
import type {Hub} from "@/components/client-hub-migration/original/lib/pursuit-hub";
import {cinemaArtwork} from "@/components/client-hub-migration/original/lib/hub-visuals";
import {cinemaFor,sceneFilm,VIDEO_LIMIT,type DemoVideo} from "@/components/client-hub-migration/original/lib/demo-cinema";
import "./cinema-studio.css";
import ArtDirection from "./art-direction";

export default function CinemaStudio({hub,onChange,localPreview=false}:{hub:Hub;onChange:(next:Hub)=>void;localPreview?:boolean}){
 const active=useRef(true),latest=useRef(hub);useLayoutEffect(()=>{latest.current=hub;},[hub]);useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const [items,setItems]=useState<DemoVideo[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const setting=hub.cinema||{mode:"automatic" as const,title:"",description:""},scene=sceneFilm(hub),selected=items.find(v=>v.id===setting.mediaId),url=setting.mode==="upload"&&setting.mediaId?`/api/demo-video?company=${encodeURIComponent(hub.seller)}&id=${setting.mediaId}`:cinemaFor(hub,"")?.src;
 useEffect(()=>{if(localPreview)return;let active=true;fetch(`/api/demo-video?company=${encodeURIComponent(hub.seller)}`).then(async r=>{const data=await r.json() as {error?:string;items:DemoVideo[]};if(!r.ok)throw Error(data.error);if(active)setItems(data.items);}).catch(e=>{if(active)setMessage(e.message);});return()=>{active=false;};},[hub.seller,localPreview]);
 function chooseVideo(v:DemoVideo){onChange({...latest.current,cinema:{mode:"upload",mediaId:v.id,title:setting.title||"A proposed client experience",description:setting.description||"Illustrative concept film. Review the footage and its description before sharing."}});setMessage("This film is selected for the demonstrator. Save the concept to keep it.");}
 async function upload(file:File){setBusy(true);setMessage("");try{
  if(file.size>VIDEO_LIMIT||! ["video/mp4","video/webm"].includes(file.type))throw Error("Use an MP4 or WebM film under 25 MB.");
  const form=new FormData();form.set("company",hub.seller);form.set("file",file);const r=await fetch("/api/demo-video",{method:"POST",body:form}),data=await r.json() as {error?:string;item:DemoVideo};if(!r.ok)throw Error(data.error);if(!active.current)return;setItems(previous=>[data.item,...previous]);chooseVideo(data.item);
 }catch(e){if(active.current)setMessage((e as Error).message);}finally{if(active.current)setBusy(false);}}
 return <section className="cinema-studio"><div><span className="cs-eyebrow">THE OPENING EXPERIENCE</span><h3>A film they can step into.</h3><p>Use relevant objects and aerial framing to introduce this client’s idea, then lead into the interactive journey. Available films play silently, with motion controls and a still image for reduced motion.</p></div>
 <div className="cinema-choices" role="group" aria-label="Demonstrator opening">
 {scene&&<button className="cs-secondary" aria-pressed={setting.mode==="automatic"&&!!url} disabled={busy} onClick={()=>{onChange({...hub,cinema:{mode:"automatic",title:"",description:""},design:{...hub.design,frame:{...hub.design.frame,artwork:{src:scene.poster,alt:scene.title}}}});setMessage("The original illustrative scene and film are selected.");}}><Film size={18}/>Use the {hub.engine?.sector} film</button>}
 <button className="cs-secondary" aria-pressed={setting.mode==="still"} disabled={busy} onClick={()=>onChange({...hub,cinema:{mode:"still",title:"",description:""}})}><ImageIcon size={18}/>Still image opening</button>
 </div>
 {url?<div className="cinema-player"><video key={url} src={url} poster={cinemaArtwork(hub)} controls muted playsInline preload="metadata" aria-label="Selected opening film"/><p>{setting.mode==="upload"?selected?.filename||"Selected company film":scene?.title} · silent in the demonstrator</p></div>:<p className="cs-small">The selected image will open this experience. Choose a film or upload your own.</p>}
 <ArtDirection hub={hub} onChange={onChange}/><div className="cs-card"><h3>Your company’s footage</h3><p>Use an approved concept film, product walkthrough or project visualisation. Upload MP4 or WebM under 25 MB. Short, captioned or silent films work best; audio is not played in the opening.</p>
 <label className="cinema-upload"><Upload size={18}/>{busy?"Uploading company film…":"Upload a company film"}<input aria-label="Upload a company film" type="file" accept="video/mp4,video/webm,.mp4,.webm" disabled={localPreview||busy} onChange={v=>{const f=v.target.files?.[0];if(f)void upload(f);v.target.value="";}}/></label>
 {localPreview&&<p className="cs-small">Sign in to the hosted hub to store company footage.</p>}
 {items.length>0&&<label>Choose from {hub.seller}’s films<select value={setting.mode==="upload"?setting.mediaId||"":""} disabled={busy} onChange={v=>{const film=items.find(x=>x.id===v.target.value);if(film)chooseVideo(film);}}><option value="">Select a company film</option>{items.map(v=><option key={v.id} value={v.id}>{v.filename} · {(v.size/1000000).toFixed(1)} MB</option>)}</select></label>}
 {setting.mode==="upload"&&<><label>Film title<input maxLength={140} value={setting.title} onChange={v=>onChange({...hub,cinema:{...setting,title:v.target.value}})}/></label><label>Visual description<textarea rows={3} maxLength={1500} value={setting.description} onChange={v=>onChange({...hub,cinema:{...setting,description:v.target.value}})}/></label><p className="cs-small">Describe the meaningful visual content and label illustrative or simulated footage. This description appears in the client experience.</p></>}
 <p className="cs-small">Company footage stays private until included in a reviewed demo link. That link serves only its selected film. Revoking it stops future access; previously downloaded copies cannot be recalled.</p></div>
 {message&&<p role="status" className="cs-callout">{message}</p>}
 </section>;
}
