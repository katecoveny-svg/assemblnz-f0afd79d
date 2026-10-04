import {hubSchema,starterHub,type Hub} from "./pursuit-hub";
import {clients,makeConcept,starterEngine,isConstructionSector,type Sector} from "./concept-engine";
import {sellerFocus,scopeIssue} from "./radar-scope";
import {radarHandoffSchema,type RadarHandoff} from "./radar-contract";

export function radarSector(packet:RadarHandoff):Sector{
 const o=packet.opportunity,s=`${o.accountName} ${o.headline} ${o.demoIdea}`,focus=sellerFocus(packet.seller);
 const technology=focus==="technology";
 if(!technology&&/school|\bMOE\b|teaching space|Ministry of Education/i.test(s))return "school";
 if(!technology&&/retirement|village|aged care/i.test(s))return "village";
 if(focus==="construction"&&o.signalType==="procurement")return "works";
 if(/fonterra|farm source|dairy co-operative/i.test(s))return "manufacturing";
 if(/foodstuffs|new world|grocery|supermarket|pantry/i.test(s))return "grocery";
 if(/air new zealand|air nz|\bkoru\b|airline|flight/i.test(s))return "travel";
 if(/mitre ?(?:10|ten)|trade hub|building supplies/i.test(s))return "trade";
 if(technology&&(o.signalType==="procurement"||/ministry|government|public service/i.test(o.accountName)))return "government";
 return "custom";
}
export async function radarHubId(owner:string,packet:RadarHandoff):Promise<string>{
 const data=JSON.stringify(["radar-pursuit-v1",owner,packet.seller.id,packet.runId,packet.opportunity.id]);
 const b=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(data))).slice(0,16);
 b[6]=(b[6]&15)|80;b[8]=(b[8]&63)|128;
 const hex=Array.from(b,x=>x.toString(16).padStart(2,"0")).join("");return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export function hubFromRadar(input:RadarHandoff):Hub{
 const p=radarHandoffSchema.parse(input),o=p.opportunity,s=radarSector(p),theme=clients[s];
 const mismatch=scopeIssue(p.seller,o);if(mismatch)throw Error(mismatch);
 const h=starterHub(isConstructionSector(s)?"construction":"custom");
 const sourceIds=o.evidence.map((_,i)=>`radar-evidence-${i+1}`);
 const concept={...makeConcept(s),id:`radar-concept-${o.id}`.slice(0,100),title:o.headline,promise:o.assemblOutcome,
  why:o.whyItMayMatter,agent:o.demoIdea.slice(0,2400),origin:"agent draft" as const,createdAt:p.generatedAt,
  evidenceIds:sourceIds.slice(0,12),reviewFlags:[],gaps:["Proposed concept. Build and review its customer interaction before sharing.","Confirm client scope, permissions and integration needs in discovery."]};
 const en=starterEngine(s);en.concepts=[concept];en.selected="";
 en.brief=[`Propose work by ${p.seller.name} for ${o.accountName}.`,o.whatChanged,o.whyItMayMatter,`Proposed outcome: ${o.assemblOutcome}`,`Demonstrator idea: ${o.demoIdea}`].join("\n\n").slice(0,6000);
 en.evidence=p.seller.evidence.map((e,i)=>({...e,id:`seller-${i+1}-${e.id}`.slice(0,100)}));
 h.seller=p.seller.name;h.buyer=o.accountName;h.name=o.headline;h.offer=o.assemblOutcome.slice(0,1200);h.buyerRole=o.buyerRoles.join(", ").slice(0,180);
 h.endUser=isConstructionSector(s)?"The client's project and operational stakeholders":"The client's customer";
 h.engine=en;h.film=undefined;h.reviewer="";h.radar=p;h.sellerProfile=p.seller;
 h.sources=o.evidence.map((e,i)=>({id:sourceIds[i],title:e.sourceTitle||`Radar source ${i+1}`,url:e.sourceUrl,claim:e.claim,status:e.verified?"source" as const:"inference" as const,checked:e.verified?`Radar agent · ${p.generatedAt.slice(0,10)}`:"Review needed",include:e.verified}));
 h.privateNotes=[`Radar mission: ${p.mission}`,`Signal: ${o.signalType}`,`Next action: ${o.nextAction}`,`Review at: ${o.reviewAt||"Set a review date"}`,"Unknowns:",...o.unknowns].join("\n").slice(0,6000);
 h.research=o.evidence.map((e,i)=>`${sourceIds[i]} · ${e.verified?"Radar reported verified":"Unverified"}\n${e.claim}\n${e.sourceUrl}\nPublication: ${e.publishedAt||"Not provided"}; event: ${e.eventAt||"Not provided"}\n${e.caveat||""}`).join("\n\n").slice(0,45000);
 h.tasks=[{id:"radar-next",label:o.nextAction.slice(0,300),owner:p.seller.name,done:false},{id:"radar-proof",label:"Review Radar evidence, unknowns and the proposed concept",owner:p.seller.name,done:false},{id:"radar-owner",label:"Name the reviewer and agree the next client step",owner:"Seller + client",done:false}];
 h.design={...h.design,name:o.headline.slice(0,100),client:p.seller.name,buyer:o.accountName,brief:en.brief,frame:{...h.design.frame,artwork:{src:theme.image,alt:"Illustrative concept visual; not an approved client project"},tokens:{...h.design.frame.tokens,ink:theme.accent,accent:theme.accent,paper:"#f7f6f1"},content:{headline:o.headline,intro:o.assemblOutcome.slice(0,500),problem:o.whyItMayMatter.slice(0,650),solution:o.demoIdea.slice(0,650),proof:"Proposed concept. Review the source evidence and client permissions before sharing.",next:o.nextAction.slice(0,400)}}};
 return hubSchema.parse(h);
}
