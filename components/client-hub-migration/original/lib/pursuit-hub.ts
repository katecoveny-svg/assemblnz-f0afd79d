import { z } from "zod/v3";
import {enterprisePlanSchema} from "./enterprise-plan";
import {securitySchema} from "./enterprise-security";
import {cinemaSchema} from "./demo-cinema";
import { defaultDesign, designSchema, escapeHtml, type Design } from "./creative";
import {radarContextSchema} from "./radar-hub-contract";
import {sellerBrandSchema} from "./seller-brand";
import {clientBrandSchema} from "./client-brand";
import {engineSchema} from "./concept-engine";
import {conceptExperienceHtml} from "./concept-experience";
import {sellerFocus,scopeIssue} from "./radar-scope";
import {isConstructionSector} from "./concept-engine";
import {radarHandoffSchema,sellerProfileSchema} from "./radar-contract";

const safeUrl = z.string().max(1500).url().refine(v => /^https?:\/\//i.test(v));
export const sourceSchema = z.object({
  id: z.string().max(100), title: z.string().min(1).max(180), url: safeUrl,
  claim: z.string().max(900), status: z.enum(["source", "inference", "concept"]),
  checked: z.string().max(40), include: z.boolean(),
}).strict();
export const hubSchema = z.object({
  cinema: cinemaSchema.optional(),
  security: securitySchema.optional(),
  enterprise: enterprisePlanSchema.optional(),
  schemaVersion: z.literal(1), name: z.string().trim().min(1).max(140),
  seller: z.string().trim().min(1).max(100), buyer: z.string().trim().min(1).max(120),
  buyerRole: z.string().max(180), endUser: z.string().max(180), offer: z.string().max(1200),
  scenario: z.enum(["sap", "construction", "agency", "custom"]),
  journey: z.object({ before: z.string().max(900), trigger: z.string().max(500),
    fit: z.enum(["appropriate", "validate", "none"]), wait: z.string().max(600),
    reason: z.string().max(800), action: z.string().max(900), review: z.string().max(600),
    after: z.string().max(900),
    choices: z.array(z.object({label:z.string().min(1).max(70),output:z.string().max(300)}).strict()).min(2).max(5).default([
      {label:"Prepare my questions",output:"Collect the questions for the responsible team."},
      {label:"Check what is needed",output:"Prepare the outstanding information for review."},
      {label:"Plan the next step",output:"Record the participant's preferred next step."},
    ]) }).strict(),
  film: z.object({src:z.literal("/cinematic/assembl-brief-film.mp4"),title:z.string().max(120)}).strict().optional(),
  engine:engineSchema.optional(),clientBrand:clientBrandSchema.optional(),sellerBrand:sellerBrandSchema.optional(),
  radar:radarHandoffSchema.optional(),researchContext:radarContextSchema.optional(),sellerProfile:sellerProfileSchema.optional(),
  design: designSchema, sources: z.array(sourceSchema).max(40),
  privateNotes: z.string().max(6000), research: z.string().max(45000),
  researchJob: z.string().uuid().optional(),
  reviewer: z.string().max(100),
  tasks: z.array(z.object({ id: z.string().max(60), label: z.string().max(300),
    owner: z.string().max(100), done: z.boolean() }).strict()).max(15),
}).strict();
export type Hub = z.infer<typeof hubSchema>;
export type HubSource = z.infer<typeof sourceSchema>;
export type HubRecord = {id: string; revision: number; updatedAt: number; payload: Hub};
export const hubSteps = ["Buyer & evidence", "Journey", "Creative", "Experience", "Review & share"];

export function starterHub(scenario: Hub["scenario"] = "custom"): Hub {
  const d = defaultDesign();
  const sap = scenario === "sap";
  const construction = scenario === "construction";
  const seller = sap ? "assembl" : construction ? "Aster Engineering · example" : scenario === "agency" ? "Your agency" : "Your company";
  const buyer = sap ? "Example technology buyer" : construction ? "Harbour project team · example" : scenario === "agency" ? "A retail brand · example" : "Your buyer";
  const headline = sap ? "Let your next buyer experience the possibility." : construction ? "A clearer project, before the first site meeting." : scenario === "agency" ? "Let your client try the campaign." : "Make the next step clear.";
  const h: Hub = {
    schemaVersion: 1, name: sap ? "Example technology proposal" : `${seller} for ${buyer}`.slice(0,140), seller, buyer,
    buyerRole: sap ? "Solution advisory, industry sales and partner enablement" : construction ? "Project director and procurement team" : "Brand and customer experience team",
    endUser: sap ? "A supplier onboarding with Northline, a fictional manufacturer" : construction ? "The client's project team" : "A shopper preparing an order",
    offer: sap ? "A shared studio that turns approved account evidence into a tailored journey, creative assets and an interactive buyer microsite." : construction ? "A project experience that makes the proposed delivery approach, questions and handoffs tangible before appointment." : "A branded sales experience that lets a buyer explore a proposed customer journey, then review a practical pilot.",
    scenario,
    ...(sap?{film:{src:"/cinematic/assembl-brief-film.mp4" as const,title:"From evidence to a prepared human handoff"}}:{}),
    journey: {
      before: sap ? "A supplier needs to get ready for its first delivery to Northline, a fictional manufacturer." : construction ? "A project team is comparing engineering approaches and preparing a first workshop." : "A shopper wants their order prepared around the items that matter to them.",
      trigger: sap ? "A supplier submits an onboarding pack in the illustrative customer experience." : construction ? "The client submits a project enquiry." : "A customer places an order.",
      fit: "validate",
      wait: sap ? "While the customer's procurement team reviews supplier onboarding." : construction ? "While the engineering team reviews the initial scope." : "While the order is being prepared.",
      reason: "Proposed natural wait. Confirm the actual process and duration with the customer. The demo runs immediately and never creates a delay.",
      action: sap ? "Prepare the supplier's induction preferences, outstanding questions and contact plan." : construction ? "Prepare site constraints, stakeholder questions and a first-meeting brief." : "Prepare substitution preferences and a useful collection plan.",
      review: sap ? "The customer's named procurement coordinator" : construction ? "The appointed project lead" : "The customer's service team",
      after: "The participant reviews and edits a brief before choosing whether to share it with the responsible team.",
      choices: sap ? [
        {label:"First delivery",output:"Prepare delivery questions, preferred contact and the information needed before arrival."},
        {label:"Site induction",output:"Prepare induction questions and access requirements for the procurement coordinator."},
        {label:"Missing documents",output:"Collect questions about outstanding documents without claiming they are accepted."},
      ] : construction ? [
        {label:"Site constraints",output:"Prepare site access, programme and constraint questions for the project lead."},
        {label:"Stakeholders",output:"Identify who needs to join the scoping conversation and their open questions."},
        {label:"Project scope",output:"Prepare the scope assumptions and items that require clarification."},
      ] : [
        {label:"Protect key items",output:"Prepare the shopper's preferences for items they do not want substituted."},
        {label:"Collection plan",output:"Prepare a preferred collection contact and timing question for review."},
        {label:"Meal priorities",output:"Prepare the shopper's stated meal priorities without changing an order."},
      ],
    },
    design: {...d, name: sap ? "Example technology proposal" : "A tailored buyer experience", client: seller, buyer,
      brief: "Show the proposed journey with example data. Keep facts, hypotheses and simulated steps distinct.",
      frame: {...d.frame, artwork: sap ? {src:"/cinematic/assembl-brief.png",alt:"Original concept film still: a technical drawing and choice cards becoming a briefing pack"} : construction ? {src:"/cinematic/architecture.png",alt:"Illustrative architecture; not a completed client project"} : {src:"/cinematic/loyalty.png",alt:"Illustrative retail creative concept"},
        tokens: {...d.frame.tokens, ink:"#24272c", accent:"#355d73",paper:"#f8f7f3"},
        content:{headline, intro:"Turn approved evidence into something your buyer can explore, question and share with their team.",
          problem: sap ? "A generic presentation leaves the buyer to imagine how a proposed solution would work in their world." : "A proposal can explain the work without letting the buyer experience the next step.",
          solution: "One pursuit holds the buyer context, proposed journey, creative work and interactive experience. Changes carry through to the same preview.",
          proof:"Proposed assembl concept. No partnership or integration is asserted. Sample organisations and outcomes are illustrative.",
          next:"Agree one customer scenario, a reviewer and a small pilot. Compare preparation effort and buyer comprehension against the current approach."}}},
    sources: [],
    privateNotes:"",research:"",reviewer:"",tasks:[
      {id:"scenario",label:"Agree one real buyer scenario and its boundaries",owner:"Seller + buyer",done:false},
      {id:"proof",label:"Confirm the evidence and assign the human reviewer",owner:"Seller",done:false},
      {id:"pilot",label:"Define the pilot, baseline and decision date",owner:"Seller + buyer",done:false}],
  };
  if(!sap) h.design.frame.content.proof = "Proposed concept using illustrative organisations and data. Confirm the facts and appoint a reviewer before sharing.";
  return hubSchema.parse(h);
}

export function hubDesign(h: Hub): Design {
  return {...h.design,name:h.name.slice(0,100),client:h.seller,buyer:h.buyer,reviewer:h.reviewer,
    brief:[h.offer,`Buyer role: ${h.buyerRole}`,`Experience participant: ${h.endUser}`,h.journey.action].join("\n").slice(0,6000)};
}

export function shareIssues(h: Hub): string[] {
  const issues:string[]=[];
  if(h.engine&&isConstructionSector(h.engine.sector)&&sellerFocus({name:h.seller,focus:h.sellerProfile?.focus})==="technology")issues.push("Choose a construction company for this construction pitch.");
  if(h.radar){const mismatch=scopeIssue(h.radar.seller,h.radar.opportunity);if(mismatch)issues.push(mismatch);}
  if(h.engine?.concepts.find(c=>c.id===h.engine!.selected)?.reviewFlags.length)issues.push("Resolve the agent’s flagged claims in Creative & copy before sharing.");
  if(h.engine&&!h.engine.concepts.some(c=>c.id===h.engine!.selected))issues.push("Choose and review a concept before sharing.");
  if(h.design.buyer!==h.buyer)issues.push("Review and confirm the changed buyer context.");
  if(!h.reviewer.trim())issues.push("Name the person who reviewed this experience.");
  if(!h.design.frame.content.headline.trim()||!h.design.frame.content.intro.trim())issues.push("Complete the opening story.");
  if(h.journey.fit === "appropriate" && (!h.journey.wait.trim() || !h.journey.action.trim() || !h.journey.review.trim()))issues.push("Add the real wait, useful action and responsible team, or choose no wait.");
  return issues;
}

// An explicit allowlist: private research, prompts, notes, jobs and source IDs never enter the buyer copy.
export function buyerSnapshot(h: Hub) {
  return {name:h.name,seller:h.seller,buyer:h.buyer,scenario:h.scenario,film:h.film,
    content:h.design.frame.content, tokens:h.design.frame.tokens,
    artwork:h.design.frame.artwork?.src.startsWith("/cinematic/")?h.design.frame.artwork:undefined,
    journey:h.journey,reviewer:h.reviewer,
    sources:h.sources.filter(s=>s.include).map(s=>({title:s.title,url:s.url,claim:s.claim,status:s.status,checked:s.checked})),
    tasks:h.tasks.map(t=>({label:t.label,owner:t.owner,done:t.done}))};
}
export type BuyerSnapshot=ReturnType<typeof buyerSnapshot>;

export const researchComparisons = [
  {name:"Clay",category:"Account intelligence",take:"Reusable research instructions and evidence attached to an account.",url:"https://university.clay.com/docs/claygent-builder"},
  {name:"Apollo",category:"Prospecting",take:"Company context, lead research and prioritisation in one workflow.",url:"https://knowledge.apollo.io/hc/en-us/articles/37242880230541-Apollo-AI-Overview"},
  {name:"Gong",category:"Account context",take:"Turn consented conversations and CRM context into useful account briefs.",url:"https://help.gong.io/docs/view-and-manage-accounts-with-the-account-console"},
  {name:"Storylane",category:"Interactive demos",take:"Buyer-role branching, account-specific examples and conversational guidance.",url:"https://www.storylane.io/blog/ai-personalized-interactive-demo"},
  {name:"Navattic",category:"Demo creation",take:"One authoring view, reusable context and measurable demo paths.",url:"https://docs.navattic.com/changelog"},
  {name:"Reprise",category:"Enterprise demos",take:"Resettable demo environments and governed agent-driven authoring.",url:"https://www.reprise.com/"},
  {name:"Trumpet",category:"Buyer collaboration",take:"Keep content, stakeholders and mutual next steps in one buyer space.",url:"https://www.sendtrumpet.com/"},
  {name:"Dock",category:"Sales rooms",take:"Give champions a complete business case and editable mutual action plan.",url:"https://www.dock.us/solutions/sales"},
  {name:"Qwilr",category:"Proposals",take:"Interactive proposals and editable value assumptions alongside the story.",url:"https://qwilr.com/use-cases/proposal-generator-software-alt/"},
];

export function creativeBrief(h: Hub,kind:"image"|"video") {
  return `Create an original ${kind} for ${h.seller}'s proposed experience for ${h.buyer}.\nAudience: ${h.buyerRole}.\nOffer: ${h.offer}\nStory: ${h.design.frame.content.headline}\nJourney: ${h.journey.action}\nArt direction: restrained editorial composition, real industry materials, ${h.design.frame.tokens.ink}, ${h.design.frame.tokens.accent}, ${h.design.frame.tokens.paper}.\n${kind==="video"?"A short, legible sequence: context, participant choice, prepared brief, human handoff. Motion must explain what changes.":"A single purposeful landscape image with generous space for adjacent copy; no baked-in text."}\nUse illustrative data. Never invent client work, results, customer logos, endorsements or a partnership. No personal data. Return the asset for review; do not publish.`;
}

export function buyerHtml(h: Hub,artworkData?:string,assetOrigin="http://127.0.0.1:3187",videoSource?:string): string {
  if(h.engine?.selected)return conceptExperienceHtml(h,artworkData,assetOrigin,videoSource);
  const b=buyerSnapshot(h),e=escapeHtml;
  const json=JSON.stringify(b).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
  const img=artworkData&&/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(artworkData)?artworkData:b.artwork?`${assetOrigin}${b.artwork.src}`:"";
  return `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(b.name)}</title><style>
*{box-sizing:border-box}body{margin:0;background:${b.tokens.paper};color:${b.tokens.ink};font:17px/1.65 Arial,sans-serif}main{max-width:1100px;margin:auto;padding:28px}nav{display:flex;justify-content:space-between;border-bottom:1px solid #bbb;padding-bottom:20px;gap:20px}.eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#59626a}h1{font-size:clamp(36px,5.8vw,66px);line-height:1.08;letter-spacing:-.045em;margin:25px 0 22px}h2{font-size:30px;line-height:1.2;letter-spacing:-.025em}h3{font-size:21px;line-height:1.35}.intro{font-size:20px}.hero{display:grid;grid-template-columns:1.4fr 1fr;gap:32px;align-items:center;margin:48px 0}.art{width:100%;height:320px;object-fit:cover}.hero a{display:inline-block;margin-top:10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:30px}section{margin:58px 0}.lead{max-width:760px}button,input,textarea{font:inherit}button,.primary{border:1px solid #8c989e;border-radius:4px;padding:13px 18px;background:white;color:inherit;cursor:pointer;text-decoration:none}button:hover{border-color:${b.tokens.accent}}button[aria-pressed=true],.primary{background:${b.tokens.accent};color:white}.choices{display:flex;gap:10px;flex-wrap:wrap}.choices button{font-size:15px}button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid #2e6da7;outline-offset:4px}textarea{display:block;width:100%;border:1px solid #adb2b4;padding:12px;margin:10px 0 18px;color:inherit;background:white}small{font-size:13px}.panel{border:1px solid #ccd4d8;background:#edf2f4;padding:28px;margin-top:24px}.muted{color:#59626a}.receipt{background:#fff;padding:22px;border-left:3px solid ${b.tokens.accent};margin-top:28px}.source{margin:18px 0;border-top:1px solid #ccc;padding-top:16px}a{color:inherit;text-underline-offset:4px}.tasks label{display:block;margin:14px 0}input[type=checkbox]{width:20px;height:20px;vertical-align:middle;margin-right:10px}.map{display:flex;gap:15px;flex-wrap:wrap;margin:25px 0;font-size:14px}.map span{border-top:2px solid ${b.tokens.accent};padding-top:12px;flex:1;min-width:130px}.role-result{padding:18px 0;border-bottom:1px solid #bbb;min-height:85px}footer{border-top:1px solid #aaa;padding:24px 0;font-size:13px}.value input{width:90px;padding:8px;border:1px solid #aaa;background:white}.value label{display:block;margin:16px 0}.value output{font-size:27px;font-weight:600}details summary{cursor:pointer;padding:10px 0}.review-actions{display:flex;gap:12px;flex-wrap:wrap}@media(max-width:700px){main{padding:22px}.hero,.grid{grid-template-columns:1fr}.hero{margin-top:30px;gap:12px}.art{height:210px}nav{font-size:13px}h1{font-size:42px}section{margin:40px 0}.panel{padding:20px}.choices button{flex:1;min-width:120px}.map{gap:10px}.intro{font-size:18px}}@media print{button,textarea,.no-print{display:none}section{break-inside:avoid}}
</style></head><body><main><nav><b>${e(b.seller)}</b><span>Prepared for ${e(b.buyer)} · Proposed concept</span></nav><div class="hero"><div><p class="eyebrow">An experience your team can explore</p><h1>${e(b.content.headline)}</h1><p class="intro">${e(b.content.intro)}</p><a class="primary" href="#try">Try the customer journey ↓</a></div>${img?`<img class="art" src="${e(img)}" alt="Creative concept illustration">`:""}</div>
<section><p class="eyebrow">01 / Your buying decision</p><h2>See the value from your seat.</h2><div class="choices" id="roles">${["Customer experience","Sales leadership","Technology & governance"].map((r,i)=>`<button data-role="${i}" aria-pressed="${i===0}">${r}</button>`).join("")}</div><p class="role-result" id="role-result" aria-live="polite"></p><div class="grid"><p>${e(b.content.problem)}</p><p>${e(b.content.solution)}</p></div><div class="map"><span>01 · Find the evidence</span><span>02 · Shape the journey</span><span>03 · Create the experience</span><span>04 · Review together</span></div></section>
${b.film?`<section><p class="eyebrow">The creative idea</p><h2>${e(b.film.title)}</h2><video controls playsinline preload="none" style="width:100%;max-height:480px;background:#eae8e1" src="${e(assetOrigin+b.film.src)}" aria-label="Illustrative silent film: documents and choices assembled into a reviewed briefing pack"></video><p class="muted">Original silent concept film. Documents and choice cards become a prepared briefing pack. Illustrative creative, separate from the working customer journey below.</p></section>`:""}<section id="try"><p class="eyebrow">02 / Step inside the customer example</p><h2>${b.scenario==="sap"?"A supplier’s first delivery, better prepared.":"Try the proposed journey."}</h2>${b.scenario==="sap"?"<p class='lead'><b>You are exploring an independent technology concept.</b> Inside it, imagine a technology seller presenting this proposed experience to Northline, a fictional manufacturer. You now take the role of one of Northline’s suppliers. These are illustrative screens; no client system is connected.</p>":""}<p class="lead">${e(b.journey.before)}</p><div class="panel"><p class="eyebrow">${b.journey.fit==="none"?"A useful next step":"The customer moment"}</p><h3>${b.journey.fit==="none"?"Prepare the next conversation":e(b.journey.wait)}</h3><p>${e(b.journey.action)}</p><p class="muted">${b.journey.fit==="none"?"Go straight to preparation. No wait is required.":e(b.journey.reason)}</p><h3>What would help you prepare?</h3><div class="choices" id="choices">${b.journey.choices.map((c,i)=>`<button data-choice="${i}" aria-pressed="${i===0}">${e(c.label)}</button>`).join("")}</div><p id="choice-result" aria-live="polite"></p><label for="note">Add a question, preference or constraint</label><textarea id="note" maxlength="1000" rows="3" placeholder="For example: who should I contact before arrival? Avoid sensitive information."></textarea><div class="choices"><button id="prepare">Prepare my brief</button><button id="skip">Skip this step</button></div><p><small>Optional, instant preparation with example rules. Nothing is sent and no delay is created.</small></p></div><div id="result" aria-live="polite"></div></section>
<section><p class="eyebrow">03 / Make the case with your own assumptions</p><div class="grid"><div><h2>A pilot you can measure.</h2><p>${e(b.content.next)}</p><p class="muted">Use your current preparation workload to explore the effort at stake. These inputs are illustrative planning assumptions, not observed savings or a forecast.</p></div><div class="panel value" style="margin:0"><label>Experiences per month <input id="volume" type="number" min="0" max="10000" value="8"></label><label>Current preparation hours each <input id="before-hours" type="number" min="0" max="1000" step="0.5" value="12"></label><label>Target preparation hours each <input id="after-hours" type="number" min="0" max="1000" step="0.5" value="6"></label><output id="saving" aria-live="polite"></output><p class="muted">Difference in monthly preparation effort. A paid pilot would test whether the target is achievable.</p></div></div></section>
<section><p class="eyebrow">04 / Evidence and boundaries</p><h2>Make the proposal easy to check.</h2><p>${e(b.content.proof)}</p><p>Customer handoff: ${e(b.journey.review)}. ${e(b.journey.after)}</p>${b.sources.map(s=>`<details class="source"><summary>${e(s.title)} · ${e(s.status)}</summary><p>${e(s.claim)}</p><a href="${e(s.url)}" target="_blank" rel="noreferrer">Read the source ↗</a><p><small>Checked: ${e(s.checked)}</small></p></details>`).join("")}</section><section class="tasks"><h2>Agree a useful next step.</h2>${b.tasks.map(t=>`<label><input type="checkbox" ${t.done?"checked":""}>${e(t.label)} <small>— ${e(t.owner)}</small></label>`).join("")}<p class="muted">These checkboxes are for this visit only. Agree owners and dates with your team.</p></section><footer>Prepared review: ${e(b.reviewer||"Unassigned")} · Illustrative experience · Inputs stay in this page; nothing is sent.</footer></main>
<script type="application/json" id="experience-data">${json}</script><script>(()=>{const b=JSON.parse(document.getElementById('experience-data').textContent);const roleText=['Explore a customer journey, make a useful choice, review the prepared output and see who owns the next step.','Give the buying team a concrete example and a shareable internal case. Test preparation effort and buyer understanding in a bounded pilot.','Inspect the sources, data permissions and handoff. This concept does not claim a live integration, autonomous decision or production approval.'];const roleResult=document.getElementById('role-result');roleResult.textContent=roleText[0];document.querySelectorAll('[data-role]').forEach(el=>el.onclick=()=>{roleResult.textContent=roleText[Number(el.dataset.role)];document.querySelectorAll('[data-role]').forEach(x=>x.setAttribute('aria-pressed',String(x===el)))});let choice=0;const choiceResult=document.getElementById('choice-result');choiceResult.textContent=b.journey.choices[0].output;document.querySelectorAll('[data-choice]').forEach(el=>el.onclick=()=>{choice=Number(el.dataset.choice);choiceResult.textContent=b.journey.choices[choice].output;document.querySelectorAll('[data-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===el)))});const result=document.getElementById('result');function show(skip){result.replaceChildren();result.className='receipt';const title=document.createElement('h3');title.textContent=skip?'Continue without a brief.':'Review your preparation brief';result.append(title);if(skip){const p=document.createElement('p');p.textContent='The primary journey remains available. No preferences were recorded or sent.';result.append(p);}else{const label=document.createElement('label');label.htmlFor='review-brief';label.textContent='Edit anything before you keep a copy';const area=document.createElement('textarea');area.id='review-brief';area.rows=9;area.maxLength=5000;area.value='Priority: '+b.journey.choices[choice].label+'\\nPrepared output: '+b.journey.choices[choice].output+'\\nYour note: '+(document.getElementById('note').value||'No additional note')+'\\nResponsible team: '+b.journey.review+'\\nStatus: draft for your review; not sent.';result.append(label,area);const dl=document.createElement('button');dl.textContent='Download my reviewed brief';dl.onclick=()=>{const u=URL.createObjectURL(new Blob([area.value],{type:'text/plain'}));const a=document.createElement('a');a.href=u;a.download='my-preparation-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};result.append(dl);const p=document.createElement('p');p.textContent='You decide whether to share the file. This page does not contact the responsible team.';result.append(p);}result.scrollIntoView({behavior:'auto',block:'nearest'});}document.getElementById('prepare').onclick=()=>show(false);document.getElementById('skip').onclick=()=>show(true);const ids=['volume','before-hours','after-hours'];function calculate(){const v=ids.map(id=>{const el=document.getElementById(id);return Math.max(0,Math.min(Number(el.max),Number(el.value)||0))});const diff=v[0]*(v[1]-v[2]);document.getElementById('saving').textContent=Math.abs(diff).toLocaleString(undefined,{maximumFractionDigits:1})+' hours '+(diff>=0?'less':'more')+' per month';}ids.forEach(id=>document.getElementById(id).oninput=calculate);calculate();})();</script></body></html>`;
}
