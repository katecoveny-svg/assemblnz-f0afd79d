"use client";
import { migrationFetch as fetch } from "@/lib/client-hub-migration/review-adapter";
import {useState} from "react";
import {type StudioKey,studioWorlds} from "@/components/client-hub-migration/original/lib/client-studios";
export default function ShareHub({company}:{company:StudioKey}){
 const [url,setUrl]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function copy(){if(busy)return;setBusy(true);setMessage("");try{
  let link=url;if(!link){const r=await fetch("/api/studios",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"hub",company})}),d=await r.json() as {url?:string;error?:string};if(!r.ok||!d.url)throw Error(d.error||"Could not prepare the link.");link=d.url;setUrl(link);}
  await navigator.clipboard.writeText(link).then(()=>setMessage("Hub link copied. You can forward it now.")).catch(()=>setMessage("Your hub link is ready below."));
 }catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 return <div className="st-quick-share"><button className="st-button" disabled={true} onClick={copy}>{busy?"Preparing link…":`Copy ${studioWorlds[company].name} hub link ↗`}</button><p className="st-small">Recipient sharing is disabled during migration. A reviewed snapshot will require server-authorised recipient access; a copied URL alone will not grant access.</p>{message&&<p role="status">{message}</p>}{url&&<div><input aria-label="Client hub link" value={url} readOnly/><a href={url} target="_blank" rel="noreferrer">Open client hub ↗</a></div>}</div>;
}
