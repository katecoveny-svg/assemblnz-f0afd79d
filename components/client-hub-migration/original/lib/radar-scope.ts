// Research rules also run in the research service. Keep its radarScope.ts mirror aligned.
export type ResearchFocus="technology"|"construction"|"agency"|"other";
type Seller={name:string;focus?:ResearchFocus;offering?:string;targetCustomers?:string};
type Opportunity={headline:string;accountName:string;whatChanged:string;signalType:string;stage:string;score:{total:number;serviceFit:number};evidence:Array<{verified:boolean;sourceUrl:string}>};
export function sellerFocus(seller:Seller):ResearchFocus{
 // Named starter companies retain their role even if an older profile has a different focus.
 if(/^sap(?:\s|$)/i.test(seller.name.trim()))return "technology";
 if(/^assembl(?:\s|$)/i.test(seller.name.trim()))return "agency";
 if(/^(hawkins|southbase)(?:\s|$)/i.test(seller.name.trim()))return "construction";
 if(seller.focus)return seller.focus;
 if(/construction company|main contractor|civil contractor/i.test(seller.name+" "+(seller.offering||"")))return "construction";
 return "other";
}
export function scopeInstructions(seller:Seller){
 const focus=sellerFocus(seller);
 const role=focus==="technology"?"The seller supplies enterprise technology and digital services. Target Foodstuffs, Fonterra, Mitre 10 and government technology buyers where relevant. Government opportunities must concern software, data, AI, cloud, enterprise systems, digital services or technology delivery. Physical school building, civil works and retirement construction contracts belong to construction companies such as Hawkins or Southbase; do not propose this seller as the building contractor. A Ministry of Education IT procurement can fit; the department name alone does not make it construction."
 :focus==="construction"?"The seller supplies construction and project delivery. Prioritise school property, MOE building works, retirement developments and government construction procurement. Connect issued requirements to contractor evidence, staging, site access, client decisions and an interactive project demonstrator. Do not turn these into an enterprise IT sales pitch. Digital construction tools may support the delivery response; they do not change who is selling the work."
 :"Match every opportunity to this seller's reviewed offering. An agency may pitch strategy and experiences; a contractor may bid for building work; a technology seller may pitch systems. Keep the selling company separate from the target buyer.";
 return `${role}\nGive relevant New Zealand government procurement high research priority. Check GETS (gets.govt.nz), published future procurement opportunities and the buyer's official procurement pages. Verify scope, agency, RFx reference, current open/planned/closed/awarded status, deadline with timezone when supplied, eligibility and fit to the approved offering. Closed or awarded notices are context, not open contracts. General procurement guidance is not a live tender. Do not invent opportunities, deadlines, budgets, relationships or eligibility. If no matching tender is verified, say so and keep a clearly labelled watch opportunity only. Prefer checked, relevant government opportunities in the shortlist, without inflating fit scores or predicting a win.`;
}
export function defaultRadarMission(seller:Seller,buyer="",procurementOnly=false){
 const focus=sellerFocus(seller),targets=seller.targetCustomers|| (focus==="construction"?"school property buyers, retirement developers and government construction buyers":focus==="technology"?"Foodstuffs, Fonterra, Mitre 10 and government technology buyers":buyer||"relevant clients");
 const boundary=procurementOnly?`Find up to three current or planned NZ government procurement opportunities for ${seller.name}. Give matching GETS opportunities high priority. Check the notice, status, scope, deadline and eligibility; guidance is not a tender.`:`Research ${buyer||targets} for ${seller.name}. Find one or two focused opportunities from current primary sources. Keep this run within the named client; government procurement is relevant only if directly connected to it. Separate government research is available in the hub.`;
 const role=focus==="technology"?"Seller role: enterprise technology and digital services. Do not propose physical construction contracts.":focus==="construction"?"Seller role: construction and project delivery. Prioritise relevant building works and contractor evidence; do not turn the bid into an IT service.":"Match the reviewed seller capabilities.";
 return `${boundary} ${role} Check relevant GETS notices; closed/awarded notices are context, never open bids. Propose a client-branded demonstrator with a useful customer task, source evidence and a human handoff. Keep the report concise; unsupported needs, integrations, benefits and budgets are hypotheses to validate.`.slice(0,4000);
}
export function scopeIssue(seller:Seller,o:Opportunity):string|undefined{
 const direct=`${o.headline} ${o.whatChanged}`;
 const physical=/(?:construction|building|refurbishment|redevelopment|demolition|roof replacement|civil works)\s+(?:contract|tender|works|of|for)|(?:new|build|construct|deliver)\s+(?:teaching spaces|classrooms|school buildings)|(?:main contractor|occupied school|school construction)/i.test(direct);
 const digital=/(?:procurement|tender|implementation|supply|purchase|licen[cs]ing)\s+(?:of |for )?(?:an? |the )?(?:software|ERP|CRM|cloud|data platform|digital platform|IT systems)|(?:software|ERP|CRM|cloud|digital platform)\s+(?:procurement|tender|implementation|licen[cs]ing)/i.test(direct);
 if(sellerFocus(seller)==="technology"&&physical&&!digital)return "This appears to be physical construction work. Review it under a construction company such as Hawkins or Southbase before developing a bid.";
 return undefined;
}
export function governmentPriority(o:Opportunity):boolean{
 return o.stage!=="hold"&&o.signalType==="procurement"&&o.score.serviceFit>=50&&o.evidence.some(e=>{if(!e.verified)return false;try{const host=new URL(e.sourceUrl).hostname;return host==="gets.govt.nz"||host.endsWith(".govt.nz");}catch{return false;}});
}
export function sortRadarOpportunities<T extends Opportunity>(opportunities:T[],seller:Seller):T[]{
 const rank=(o:T)=>o.stage==="hold"||scopeIssue(seller,o)?0:governmentPriority(o)?2:1;
 return [...opportunities].sort((a,b)=>rank(b)-rank(a)||b.score.total-a.score.total);
}
export function sameCompany(a:string,b:string){return a.trim().toLowerCase()===b.trim().toLowerCase();}
export function companyRuns<T extends {seller:{id:string;name:string}}>(runs:T[],profile:{id:string;name:string}){return runs.filter(r=>r.seller.id===profile.id&&sameCompany(r.seller.name,profile.name));}
