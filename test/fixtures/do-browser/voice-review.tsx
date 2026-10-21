/** Browser-operated synthetic acceptance harness. Never calls media, Google or a retailer. */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DoGeminiLive } from '../../../app/do/DoGeminiLive';
import { BrowserTaskReview } from '../../../components/do/browser/BrowserTaskReview';
import { ConnectionBroker } from '../../../apps/do/browser/connection/broker';
import { CONNECTION_PROTOCOL, FIXTURE_URL } from '../../../apps/do/browser/connection/protocol';
import { reviewBrowserHandoff, type ReviewedBrowserDraft } from '../../../apps/do/browser/voice-handoff';
import '../../../app/do/do-live.css';
const firstOwner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
let owner = firstOwner, quantity = 0, revision = 1, microphoneRequests = 0, stopped = 0, socket: FakeSocket | null = null;
const scopeRevision = 'a'.repeat(64);
const target = {tabId:4,documentId:'fixture-cart',url:FIXTURE_URL};
const workspace = {tabId:8,documentId:'fixture-do',url:'http://localhost:3000/do/personal'};
const broker = new ConnectionBroker({owner:async()=>owner,current:async()=>true,adapter:(_target,scope)=>({mode:'controlled_fixture',observe:async()=>({scope,revision:String(revision),observedAt:Date.now(),currency:'NZD',items:[{productId:'oats',name:'Fictional oats',unitPriceCents:350,quantity,available:true}]}),setQuantity:async(_scope,expected,id,value)=>{if(expected!==String(revision)||id!=='oats')throw new Error('Changed fixture');quantity=value;revision++;}})});
window.addEventListener('message', async event => {
 if(event.source!==window||event.origin!==location.origin||event.data?.protocol!==CONNECTION_PROTOCOL||event.data.direction!=='request')return;
 try {const data=await broker.command(workspace,event.data.command);window.postMessage({protocol:CONNECTION_PROTOCOL,direction:'response',requestId:event.data.requestId,ok:true,data},location.origin);}
 catch(error){window.postMessage({protocol:CONNECTION_PROTOCOL,direction:'response',requestId:event.data.requestId,ok:false,error:String(error)},location.origin);}
});
window.fetch = async (input, options) => {
 const url=String(input);
 if(url!=='/api/do/live-token')throw new Error('Synthetic harness blocks all other requests');
 return Response.json(options?.method==='POST'?{token:'synthetic-token',model:'fixture-model',mode:'standard',expiresAt:Date.now()+300000,config:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Kore'}}}}}:{enabled:true,configured:true,signedIn:true,remaining:3,dailyLimit:3,sessionSeconds:300,voiceName:'Kore',voiceRevision:scopeRevision});
};
class FakeSocket {
 static OPEN=1; readyState=0;bufferedAmount=0;binaryType='';onopen:(()=>void)|null=null;onmessage:((event:{data:string})=>void)|null=null;onclose:(()=>void)|null=null;onerror:(()=>void)|null=null;
 constructor(){socket=this;setTimeout(()=>{if(this.readyState===3)return;this.readyState=1;this.onopen?.();},0);}
 send(raw:string){if(JSON.parse(raw).setup)queueMicrotask(()=>this.emit({setupComplete:{}}));}
 emit(value:unknown){this.onmessage?.({data:JSON.stringify(value)});}
 close(){this.readyState=3;}
}
class FakeAudio {
 currentTime=0;sampleRate=48000;destination={};audioWorklet={addModule:async()=>{}};
 async resume(){} async close(){} createMediaStreamSource(){return{connect(){},disconnect(){}};}
}
Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{microphoneRequests++;const track={enabled:true,stop(){stopped++;},addEventListener(){}};return{getTracks:()=>[track],getAudioTracks:()=>[track]};}}});
Object.assign(window,{WebSocket:FakeSocket,AudioContext:FakeAudio,AudioWorkletNode:class{port={close(){}};connect(){}disconnect(){}}});
function Fixture(){
 const [currentOwner,setOwner]=useState(owner),[draft,setDraft]=useState<ReviewedBrowserDraft|null>(null),[status,setStatus]=useState('No synthetic connection.');
 const draftRef=React.useRef<ReviewedBrowserDraft|null>(null);
 const update=()=>setStatus(`Fixture quantity ${quantity}; fake capture requests ${microphoneRequests}; stopped tracks ${stopped}.`);
 return <main style={{fontFamily:'sans-serif',maxWidth:760,margin:'20px auto',padding:16}}>
 <h1>DO voice → browser review</h1><p>Synthetic acceptance fixture. No microphone, provider, installed extension or retailer access. Every product/account is fictional.</p>
 <button onClick={()=>{socket?.emit({serverContent:{inputTranscription:{text:'Please prepare two packs of oats.'},outputTranscription:{text:'Review the brief before choosing products.'},turnComplete:true}});update();}}>Simulate spoken shopping request</button>
 <button onClick={()=>{owner=owner===firstOwner?'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb':firstOwner;draftRef.current=null;setDraft(null);setOwner(owner);broker.revoke();update();}}>Simulate account change</button>
 <button onClick={async()=>{try{await broker.connect(target,workspace);setStatus('Synthetic companion connected. No read approved.');}catch(e){setStatus(String(e));}}}>Fixture companion: connect</button>
 <button onClick={async()=>{try{const s=broker.snapshot();if(!s.connected)throw new Error('Connect first');await broker.allowReadInCompanion(s.connectionId);setStatus('Synthetic companion approved bounded read.');}catch(e){setStatus(String(e));}}}>Fixture companion: allow read</button>
 <button onClick={async()=>{try{const s=broker.snapshot();if(!s.connected||!s.digest)throw new Error('Prepare first');await broker.approveInCompanion(s.connectionId,s.digest);update();}catch(e){setStatus(String(e));}}}>Fixture companion: approve exact edits</button>
 <p role="status">{status}</p>
 <DoGeminiLive key={currentOwner} onBrowserDraft={text=>{const next=reviewBrowserHandoff(currentOwner,owner,draftRef.current,text);if(!next)return false;draftRef.current=next;setDraft(next);return true;}}/>
 {draft&&<><button onClick={()=>{draftRef.current=null;setDraft(null);}}>Close browser review</button><BrowserTaskReview key={draft.id} expectedWorkspace={currentOwner} initialBrief={draft.text}/></>}
 </main>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
