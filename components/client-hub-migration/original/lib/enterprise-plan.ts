import {z} from "zod/v3";
import type {Hub} from "./pursuit-hub";
export const salesStages=["Research","Concept","Demonstration","Pilot","Proposal","Negotiation","Won","Lost","Parked"] as const;
const text=z.string().max(1800),name=z.string().max(180),date=z.union([z.literal(""),z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]);
const amount=z.number().finite().min(0).max(1000000000).nullable();
export const enterprisePlanSchema=z.object({
 campaign:name,stage:z.enum(salesStages),owner:name,nextAction:text,nextDate:date,closeDate:date,value:amount,currency:z.enum(["NZD","AUD","USD"]),
 decision:text,procurement:text,scope:text,exclusions:text,success:text,
 stakeholders:z.array(z.object({id:name,role:name,person:name,status:z.enum(["To identify","Identified","Engaged","Confirmed"])}).strict()).max(20),
 milestones:z.array(z.object({id:name,title:name,owner:name,due:date,weeks:z.number().min(0).max(104),status:z.enum(["Proposed","Agreed","In progress","Complete","Blocked"]),depends:text,acceptance:text}).strict()).max(20),
 contracts:z.array(z.object({id:name,title:name,status:z.enum(["To assess","Required","In review","Agreed","Not applicable"]),owner:name,url:z.union([z.literal(""),z.string().url().max(1500).regex(/^https:\/\//)]),notes:text}).strict()).max(20),
 funding:z.array(z.object({id:name,status:z.enum(["Not assessed","Checking","Confirmed","Not eligible"]),beneficiary:name,amount,notes:text}).strict()).max(10),
 businessCase:z.object({hours:amount,hourlyCost:amount,adoption:z.number().min(0).max(100).nullable(),reduction:z.number().min(0).max(100).nullable(),weeks:z.number().min(1).max(520),setup:amount,monthly:amount,months:z.number().min(1).max(120),assumptions:text}).strict(),
}).strict();
export type EnterprisePlan=z.infer<typeof enterprisePlanSchema>;
export function defaultEnterprisePlan(h:Pick<Hub,"name"|"seller"|"buyer"|"engine">):EnterprisePlan{
 const construction=["school","village","works"].includes(h.engine?.sector||"");
 return {campaign:h.name,stage:"Research",owner:"",nextAction:"Agree the client problem, decision maker and next meeting.",nextDate:"",closeDate:"",value:null,currency:"NZD",decision:"",procurement:"",scope:"",exclusions:"",success:"",
 stakeholders:["Business sponsor","Economic buyer","Procurement lead",construction?"Project director":"Technology / security lead","Operational owner"].map((role,i)=>({id:`s${i}`,role,person:"",status:"To identify"})),
 milestones:[{title:"Confirm the brief",weeks:1,acceptance:"Named owner, scoped problem and success measures agreed."},{title:construction?"Develop the visual delivery concept":"Build the customer demonstrator",weeks:2,acceptance:"Client has tried the concept and reviewed its assumptions."},{title:construction?"Review issued RFx and evidence":"Agree a bounded pilot",weeks:2,acceptance:"Scope, dependencies, terms, cost and next decision agreed."}].map((x,i)=>({...x,id:`m${i}`,owner:"",due:"",status:"Proposed",depends:i?"Previous stage approved; client inputs available.":"Client availability and approved evidence."})),
 contracts:["Confidentiality / NDA","Scope, deliverables and acceptance","Client terms / master agreement","Data processing, privacy and security","IP, brand and content rights",construction?"Construction contract, insurance and warranties":"Support, service levels and exit","Purchase order and payment milestones"].map((title,i)=>({id:`c${i}`,title,status:"To assess",owner:"",url:"",notes:""})),
 funding:fundingProgrammes.map(x=>({id:x.id,status:"Not assessed",beneficiary:"",amount:null,notes:""})),
 businessCase:{hours:null,hourlyCost:null,adoption:null,reduction:null,weeks:52,setup:null,monthly:null,months:12,assumptions:""}};
}
export const fundingProgrammes=[
 {id:"rdti",name:"R&D Tax Incentive",summary:"15% of eligible R&D expenditure; normally at least $50,000 a year. Routine implementation is not automatically R&D. Confirm the entity, activity, spend and claim process with an adviser.",url:"https://www.ird.govt.nz/research-and-development/tax-incentive"},
 {id:"new-rd",name:"New to R&D Grant",summary:"40% of eligible costs, capped at $400,000, with applicant co-funding. Prior R&D activity and funding limits apply. Large established R&D businesses should not assume eligibility.",url:"https://www.business.govt.nz/tax-and-money/innovation-funding/new-to-r-and-d-grant"},
 {id:"management",name:"Management Capability Development Fund",summary:"Assessed support for eligible management training: up to 50%, capped at $5,000 a year. It does not fund a platform licence or hands-on implementation.",url:"https://www.business.govt.nz/strategy-and-performance/regional-business-partner-network/management-capability-fund-for-businesses"},
] as const;
export function businessCase(p:EnterprisePlan){const b=p.businessCase;const complete=[b.hours,b.hourlyCost,b.adoption,b.reduction,b.setup,b.monthly].every(v=>v!==null);if(!complete)return null;const benefit=b.hours!*b.hourlyCost!*(b.adoption!/100)*(b.reduction!/100)*b.weeks;const cost=b.setup!+b.monthly!*b.months;return {benefit,cost,net:benefit-cost,roi:cost>0?(benefit-cost)/cost*100:null};}
export function dealBrief(h:Hub){const p=h.enterprise||defaultEnterprisePlan(h),b=businessCase(p);return `# ${h.seller} × ${h.buyer}\n\nPrivate working commercial plan · proposed, not an offer or contract\n\n## Campaign\n${p.campaign} · ${p.stage}\nOwner: ${p.owner||"To assign"}\nNext: ${p.nextAction} — ${p.nextDate||"Date to agree"}\nTarget decision: ${p.closeDate||"To agree"}\nIndicative value: ${p.value===null?"Unpriced":`${p.currency} ${p.value}`}\n\n## Decision and scope\n${p.decision||"Decision to agree"}\nProcurement route: ${p.procurement||"Confirm with buyer"}\nScope: ${p.scope||"To define"}\nExclusions: ${p.exclusions||"To define"}\nSuccess: ${p.success||"Baseline and acceptance to agree"}\n\n## Stakeholders\n${p.stakeholders.map(x=>`- ${x.role}: ${x.person||"To identify"} · ${x.status}`).join("\n")}\n\n## Mutual action plan\n${p.milestones.map(x=>`- ${x.title}: ${x.status}; owner ${x.owner||"to assign"}; ${x.due||"date to agree"}; estimated ${x.weeks} weeks. Depends on: ${x.depends}. Accept when: ${x.acceptance}`).join("\n")}\n\n## Contract review register\n${p.contracts.map(x=>`- ${x.title}: ${x.status}; reviewer ${x.owner||"to assign"}. ${x.notes}${x.url?` [Reference](${x.url})`:""}`).join("\n")}\n\n## Business case hypothesis\n${b?`Estimated capacity value: ${p.currency} ${b.benefit.toFixed(0)} over ${p.businessCase.weeks} weeks. Proposed cost: ${p.currency} ${b.cost.toFixed(0)} over ${p.businessCase.months} months. Net: ${p.currency} ${b.net.toFixed(0)}. This values time; it is not a cash saving or revenue forecast.`:"Add and validate the baseline and price assumptions before calculating value."}\nInputs: ${JSON.stringify(p.businessCase)}\n\n## Funding to validate\n${p.funding.map(x=>`- ${fundingProgrammes.find(f=>f.id===x.id)?.name||x.id}: ${x.status}; applicant ${x.beneficiary||"to confirm"}; recorded amount ${x.amount??"not entered"}. ${x.notes}`).join("\n")}\nFunding is not deducted from the price or business case. Eligibility, approval and timing need separate confirmation.\n\nPrepared ${new Date().toISOString().slice(0,10)}. No contract has been signed, submission made or funding promised.\n`;}

export type VulnerabilityLevel = "stable" | "watch" | "at_risk" | "critical";
export type DealVulnerability = {
  score: number;
  level: VulnerabilityLevel;
  biggestConcern: string;
  nextBestAction: string;
  signals: string[];
};

/** Manager-cockpit style vulnerability from the deal plan (higher score = more at risk). */
export function dealVulnerability(input: {
  stage: typeof salesStages[number];
  owner?: string;
  nextAction?: string;
  nextDate?: string;
  closeDate?: string;
  value?: number | null;
  completed?: number;
  total?: number;
  blockedMilestones?: number;
  economicBuyerStatus?: string;
  businessCaseComplete?: boolean | null;
  asOf?: string; // YYYY-MM-DD
}): DealVulnerability {
  const asOf = input.asOf || new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const signals: string[] = [];
  let score = 0;

  const owner = (input.owner || "").trim();
  const nextAction = (input.nextAction || "").trim();
  const nextDate = (input.nextDate || "").trim();
  const closeDate = (input.closeDate || "").trim();
  const overdue = Boolean(nextDate && nextDate < asOf);
  const noNextDate = !nextDate;
  const noClose = !closeDate;
  const blocked = input.blockedMilestones || 0;
  const completed = input.completed || 0;
  const total = input.total || 0;
  const buyer = (input.economicBuyerStatus || "").trim();
  const buyerWeak = !buyer || buyer === "To identify" || buyer === "Identified";
  const caseOpen = input.businessCaseComplete === false;
  const lateStage = ["Proposal", "Negotiation", "Pilot", "Demonstration"].includes(input.stage);

  if (!owner) { score += 14; signals.push("No owner assigned"); }
  if (overdue) { score += 28; signals.push("Next action is overdue"); }
  else if (noNextDate) { score += 12; signals.push("No next action date"); }
  if (!nextAction) { score += 10; signals.push("Next action not written"); }
  if (noClose) { score += 8; signals.push("Decision date open"); }
  if (blocked > 0) { score += Math.min(24, 12 + blocked * 6); signals.push(blocked === 1 ? "1 milestone blocked" : `${blocked} milestones blocked`); }
  if (buyerWeak) { score += lateStage ? 18 : 10; signals.push("Economic buyer not confirmed"); }
  if (caseOpen && lateStage) { score += 16; signals.push("Business case not validated"); }
  if (input.value === null && lateStage) { score += 10; signals.push("Value still unpriced"); }
  if (total > 0 && completed === 0 && ["Demonstration", "Pilot", "Proposal", "Negotiation"].includes(input.stage)) {
    score += 12; signals.push("Mutual action plan not moving");
  }
  if (input.stage === "Parked") { score += 6; signals.push("Deal parked"); }

  score = Math.max(0, Math.min(100, score));
  const level: VulnerabilityLevel =
    score >= 70 ? "critical" : score >= 45 ? "at_risk" : score >= 22 ? "watch" : "stable";

  let biggestConcern = "Deal plan looks stable.";
  if (signals.length) {
    // Prefer commercial / access risks over admin nits
    const priority = [
      "Business case not validated",
      "Economic buyer not confirmed",
      "Next action is overdue",
      "1 milestone blocked",
      "milestones blocked",
      "Mutual action plan not moving",
      "Value still unpriced",
      "No owner assigned",
      "Decision date open",
      "Deal parked",
    ];
    biggestConcern = signals.slice().sort((a, b) => {
      const ia = priority.findIndex(p => a.includes(p));
      const ib = priority.findIndex(p => b.includes(p));
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    })[0];
  }

  let nextBestAction = nextAction || "Write the next action and date.";
  if (overdue) nextBestAction = nextAction ? `Recover overdue step: ${nextAction}` : "Set a dated next action this week.";
  else if (buyerWeak) nextBestAction = "Confirm the economic buyer and decision path.";
  else if (blocked > 0) nextBestAction = "Unblock the stalled milestone with a named owner.";
  else if (caseOpen && lateStage) nextBestAction = "Validate the business-case baseline with the sponsor.";
  else if (!owner) nextBestAction = "Assign a single deal owner.";
  else if (noNextDate) nextBestAction = "Put a date on the next action.";

  return { score, level, biggestConcern, nextBestAction, signals };
}
