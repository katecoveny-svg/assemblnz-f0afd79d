import {z} from "zod/v3";
import type {Hub} from "./pursuit-hub";

export const reviewStates=["Not assessed","In review","Evidence supplied","Accepted for this pilot","Not applicable"] as const;
export const securitySchema=z.object({
 operator:z.string().max(180),customer:z.string().max(180),contact:z.string().max(180),
 deployment:z.enum(["managed","client","hybrid"]),environment:z.string().max(400),region:z.string().max(240),
 data:z.string().max(1800),retention:z.string().max(1000),itOwner:z.string().max(180),legalOwner:z.string().max(180),
 reviews:z.array(z.object({id:z.string().max(60),status:z.enum(reviewStates),owner:z.string().max(180),evidence:z.string().max(1800)}).strict()).max(20),
}).strict();
export type SecurityPlan=z.infer<typeof securitySchema>;
export const securityChecks=[
 {id:"scope",title:"Pilot scope and data boundary",detail:"Named sponsor, purpose, permitted data, excluded use, success measure and end date."},
 {id:"terms",title:"Commercial agreement",detail:"Legal entities, scope, price, IP and brand rights, liability, insurance, support and termination."},
 {id:"privacy",title:"Privacy and data-processing schedule",detail:"Processing instructions, roles, provider chain, locations, AI use, notices, access and correction."},
 {id:"identity",title:"Identity and tenant isolation",detail:"Client SSO/MFA, roles, least privilege, offboarding and independent company-isolation tests."},
 {id:"security",title:"Security assurance",detail:"Threat model, independent penetration test, vulnerability handling, dependency review and evidence."},
 {id:"operations",title:"Operational readiness",detail:"Monitoring, incident contacts, response targets, backup restoration, availability and rollback."},
 {id:"exit",title:"Retention and exit",detail:"Agreed deletion/export process, backup expiry, legal holds and evidence of completion."},
 {id:"integration",title:"Integration acceptance",detail:"Approved API scopes, client test environment, consent, failure handling and named release owner."},
 {id:"ai",title:"AI and content review",detail:"Provider terms, training and retention settings, prompt-injection tests, source quality and human review."},
 {id:"accessibility",title:"Accessibility and media rights",detail:"Keyboard and assistive-technology review, motion controls, captions, footage and brand permissions."},
] as const;
export const deploymentOptions=[
 {id:"managed",title:"assembl-managed pilot",description:"Use the current hosted workspace with approved public or synthetic data first.",responsibility:"assembl operates the application and its suppliers. The client approves the purpose, data and users. Enterprise terms and service commitments must be agreed.",status:"Current hosting model; enterprise production approval remains open."},
 {id:"client",title:"Client-hosted licence",description:"The client or its IT provider operates a separately implemented instance in an approved environment.",responsibility:"The client owns cloud accounts, identity, keys, storage, model access and operational monitoring. assembl supplies and supports agreed software. Support access and updates need a contract.",status:"Proposed implementation option; no client-hosted package has been deployed or certified."},
 {id:"hybrid",title:"Client-controlled agent and data",description:"Keep selected processing and documents behind the client’s approved gateway, with a defined hub connection.",responsibility:"Map exactly what leaves the client environment: prompts, extracts, replies, logs and support data. Client-hosted agents do not automatically keep every copy inside that environment.",status:"IT connection brief available; a client gateway and its data boundary still need configuration and testing."},
] as const;
export const securitySources=[
 {title:"NZ Privacy Commissioner · third-party responsibilities",url:"https://www.privacy.org.nz/assets/New-order/Resources-/Publications/Guidance-resources/2024-11-21-s11-third-party-providers.pdf",note:"Outsourcing does not remove the customer’s privacy responsibilities. Agree security, use, breach reporting, retention and access."},
 {title:"NZ Privacy Commissioner · privacy statements",url:"https://www.privacy.org.nz/resources-and-learning/knowledge-base/view/312/",note:"Explain collection, purpose, recipients, required information and access/correction rights. Assess indirect collection notices for lead research."},
] as const;
export function defaultSecurity(h:Pick<Hub,"seller">):SecurityPlan{return {operator:"Assembl New Zealand Limited",customer:h.seller,contact:"",deployment:"managed",environment:"",region:"",data:"Public sources, original illustrative media and synthetic demonstration information. No production customer records in the initial evaluation.",retention:"",itOwner:"",legalOwner:"",reviews:securityChecks.map(x=>({id:x.id,status:"Not assessed",owner:"",evidence:""}))};}
export function securityBrief(h:Hub){
 const p=h.security||defaultSecurity(h),mode=deploymentOptions.find(x=>x.id===p.deployment)!;
 return `# assembl enterprise evaluation pack

WORKING DRAFT FOR LEGAL AND IT REVIEW · ${new Date().toISOString().slice(0,10)}
This pack is not signed terms, a security certification or authority to connect production systems. Complete the placeholders, validate implementation and have qualified advisers settle the agreement before use.

## Parties and purpose
Software supplier: ${p.operator||"[ASSEMBL LEGAL ENTITY TO CONFIRM]"}
Workspace customer: ${p.customer||h.seller}
Pitch recipient in this example: ${h.buyer}
Privacy / support contact: ${p.contact||"[CONTACT TO CONFIRM]"}
IT owner: ${p.itOwner||"[TO ASSIGN]"}
Legal reviewer: ${p.legalOwner||"[TO ASSIGN]"}

The workspace agreement is between assembl and its customer. A pitch that customer prepares for another organisation is a separate relationship. Brand references and proposed demos do not establish endorsement, appointment or access to the recipient’s systems.

## Draft evaluation terms — negotiation basis
1. Purpose and scope. Supply a time-bounded evaluation of the specified research, concept, creative and demonstration functions. Attach deliverables, acceptance criteria, named users, fees, dates and exclusions in a signed order. No production rollout is authorised by this draft.
2. Permitted use. Use only information the customer is entitled to provide and the agreed data classes. Do not include credentials, regulated records or sensitive personal information unless the data schedule and security review explicitly permit them. Sources and documents are reference data, not instructions granting an agent authority.
3. Outputs and review. Agent outputs are drafts. The customer checks factual accuracy, rights, claims, accessibility and fitness for purpose before use. Neither a priority score nor an illustrative demo is an assurance of a sales result. No external sending, tender submission, purchase or system change is authorised by this evaluation.
4. Confidentiality. Use confidential material only to perform the agreed service. Limit access to authorised personnel and approved providers under appropriate duties. Define permitted disclosures, legal compulsion, return and continuing obligations in the agreement.
5. Intellectual property. Each party retains its pre-existing IP. Agree the customer’s licence to the platform, rights to bespoke deliverables, source access, reusable components and generated content. Confirm client brand and media permissions; third-party and open-source terms continue to apply. Generated content is not guaranteed exclusive or non-infringing.
6. Service and change. Define support hours, incidents, maintenance, release notice, rollback, availability and backup recovery targets. The current prototype does not establish a production SLA. Material provider, data-use or scope changes need the agreed review process.
7. Risk allocation. Legal advisers must settle warranties, exclusions, liability caps and exceptions, indemnities, insurance, governing law, dispute resolution and non-excludable rights. No zero-liability or blanket compliance claim is made here.
8. Exit. Define expiry, suspension, export format, transition assistance, deletion deadlines and backup/legal-hold exceptions. Specify what survives termination. A revoked demo link stops future service access; it cannot recall copies already downloaded or forwarded.

## Draft data-processing and security schedule
Document the parties’ actual legal roles for each processing purpose and applicable jurisdiction. A hosting location alone does not determine those roles.
- Approved purpose and data: ${p.data}
- Environment: ${mode.title}; ${p.environment||"[ENVIRONMENT TO AGREE]"}
- Regions and all transfers: ${p.region||"[APPLICATION, STORAGE, MODEL, LOG AND SUPPORT LOCATIONS TO VERIFY]"}
- Retention, export and deletion: ${p.retention||"[PER-DATA-CLASS PERIODS, BACKUP EXPIRY AND DELETION PROCESS TO AGREE]"}
- Instructions: process only documented, lawful instructions; identify collection sources, recipients, access permissions and any downstream sharing.
- Providers: attach the actual contracting/subprocessor chain, purpose, data, location, retention and change-notice process. Confirm supplier agreements and international transfer protections where applicable.
- AI: record the exact service, model gateway, prompt/output use and training/retention settings. The library supplies reviewed reference extracts; it does not fine-tune a model. Do not contractually promise a provider’s no-training or zero-retention setting until verified for the account and service.
- Controls: agree encryption, key management, access control, tenant isolation, vulnerability management, upload handling, monitoring and evidence. Certifications belonging to a hosting provider are not assembl certifications.
- Incidents: name reachable contacts, notification triggers, agreed response times and the responsibility for regulatory/individual notices. Require prompt cooperation, containment and evidence preservation; the contract must support applicable statutory duties.
- Rights: define assistance for access, correction, complaints, deletion and any applicable individual rights within required timeframes.
- Support: record personnel, approved access, access duration and audit records. Client-hosted support can still expose client information if logs, screenshots or extracts leave the environment.
- Exit: agree export, deletion, backups, legal holds, provider copies and written evidence of completion. Archiving a library reference excludes it from retrieval; it is not deletion of its file or historical outputs.

## Draft privacy notice — complete before publication
${p.operator||"[LEGAL ENTITY]"} operates the agreed assembl service. Contact ${p.contact||"[PRIVACY CONTACT AND ADDRESS]"} about personal information and access or correction requests.
The signed-in workspace uses account identity, material the authorised operator supplies, saved work and selected service requests to provide research, drafting, media and demonstrations. Identify the final categories and lawful purposes for the deployed service. Explain what is optional and what cannot work without the required information.
Private documents and workspace notes are not included in the standard shared demo. Sharing is disabled in this port. A future recipient projection requires authenticated, expiring, revocable grants; a URL alone grants no access. The demonstrator keeps interactive choices in the current visit unless the visitor downloads a brief. Infrastructure providers may receive ordinary request information; verify and disclose logs and retention separately.
AI requests include the selected brief, conversation context and relevant approved reference extracts. Research can use external web search. Describe the actual service providers and international transfers in the final notice. Explain notices or applicable exceptions for personal information collected indirectly through lead research.
Publish the confirmed retention schedule, contact method, access/correction process and complaint route. Do not publish this draft with unresolved entity, contact, provider or retention details.

## Implementation approach
${mode.title}: ${mode.description}
${mode.responsibility}
Status: ${mode.status}

1. Discovery and review: agree one use case, business owner, data map, success measure, terms and delivery estimate.
2. Isolated test: use synthetic data and a separately approved test environment. Test identity, document permissions, failure states and outputs.
3. Read-only connection: the client’s IT team configures SSO and minimum API scopes through its approved gateway. Verify data and logs before any expanded access.
4. Controlled pilot: limited users, monitoring, support contacts, correction and rollback. A named client owner decides acceptance.
5. Production decision: settle outstanding assurance, procurement and support requirements before wider access or consequential actions.

For a client platform, first replace or adapt the current Sites identity, Cloudflare Workers runtime, D1 database and R2 file bindings, and the Supabase/AI service path. Package and test the application in the chosen environment; configure client identity, data store, object storage, secrets, approved model service and network policy. A downloadable demonstration HTML file is not the complete server application.

## Review register
${p.reviews.map(r=>`- ${securityChecks.find(x=>x.id===r.id)?.title||r.id}: ${r.status}. Owner: ${r.owner||"to assign"}. Evidence/decision: ${r.evidence||"not supplied"}`).join("\n")}

## Sources checked 13 September 2026
${securitySources.map(x=>`- [${x.title}](${x.url}): ${x.note}`).join("\n")}
`;
}
