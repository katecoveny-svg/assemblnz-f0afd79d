import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
import {conceptSchema,type Concept} from '@/components/client-hub-migration/original/lib/concept-engine';
import {emptyOwnerHub} from './owner-policy';

export const interviewExamples=[{key:'airnz',label:'Air NZ · customer lifecycle'},{key:'pwc',label:'PwC · client preparation'},{key:'deloitte',label:'Deloitte · client preparation'}] as const;
export type InterviewExampleKey=typeof interviewExamples[number]['key'];
export function isInterviewExampleKey(value:unknown):value is InterviewExampleKey{return interviewExamples.some(x=>x.key===value);}
export const independentNotice='Independent concept by Kate Hudson. Sample data only; not commissioned, endorsed or integrated with the named organisation.';
export function interviewArtworkFor(id:string){
 const kind=id==='interview-deloitte'?'cloud':id==='interview-deloitte-role-pack'?'research':id==='interview-pwc'||id==='interview-deloitte-discovery'?'advisory':undefined;
 return kind?{src:`/cinematic/interview-${kind}.svg`,alt:`Illustrative ${kind==='cloud'?'cloud platform landscape':kind==='research'?'role-ready research pack':'client conversation brief'}; sample questions, no client data or connected systems.`}:undefined;
}

// Explicit author-written examples. No generation, customer records, claims of
// current programme entitlement or imported private workspace information.
export function createInterviewExample(key:InterviewExampleKey):Hub {
 const travel=key==='airnz',organisation=travel?'Air New Zealand':key==='pwc'?'PwC':'Deloitte';
 const h=emptyOwnerHub('Kate Hudson');
 const c:Concept=conceptSchema.parse({
  id:`interview-${key}`,title:travel?'Ready for the journey':'A better-prepared client conversation',
  promise:travel?'Turn the interval before a trip into a useful, traveller-controlled readiness brief.':'Turn a client question and checked public evidence into a clear conversation brief.',
  why:`${independentNotice} ${travel?'The hypothesis: clearer preparation can help a traveller understand their next step. Koru information and individual eligibility require current verification.':'The hypothesis: traceable preparation helps a team discuss the right problem before recommending work.'}`,
  agent:travel?'This local demonstration assembles chosen priorities into an editable sample readiness brief. It does not access a booking, loyalty account or eligibility service.':'This local demonstration assembles a chosen discussion lens into an editable sample client brief. Public retrieval and private client systems are not connected.',
  value:'A proposed improvement in comprehension, useful preparation and human handoff; no measured result is claimed.',
  metric:travel?'Test benefit comprehension, useful-brief completion and handoff quality against an agreed baseline.':'Test evidence traceability, brief completeness and time to a reviewed next step against an agreed baseline.',
  origin:'owner draft',createdAt:'2026-10-01',evidenceIds:[],reviewFlags:[],
  journey:{
   before:travel?'An illustrative traveller is preparing for a sample Auckland–Queenstown trip. No real itinerary or customer data is loaded.':'A fictional NZ client has a question about a proposed project. No actual client appointment, engagement or confidential records are represented.',
   during:'Choose the useful discussion lens, inspect the proposed output and edit it before any human handoff.',
   after:'The person reviews the draft and decides whether to take it to the responsible team. Nothing is sent from this demonstration.',
   wait:travel?'The natural pre-departure preparation interval; no delay or incentive is manufactured.':'The preparation period before a client meeting; no manufactured wait or reward.',
   reviewer:travel?'The traveller controls the draft. Airline staff must verify any eligibility or service request.':'The client and responsible adviser verify sources, scope and permission before relying on a draft.',
   question:travel?'What would make your next trip easier?':'What should we clarify before the next conversation?',
   options:travel?[
    {label:'Travelling with whānau',detail:'An editable family-readiness checklist for the sample trip.',items:['Agree a meeting point and who is travelling.','List packing and assistance questions for the responsible team.','Each person approves any information they choose to share.']},
    {label:'Understanding Koru benefits',detail:'Questions to verify against current published information and the traveller’s actual account.',items:['Identify the benefit question in the traveller’s own words.','Verify current terms and individual eligibility; none is assumed.','Ask the authorised airline team before any redemption or account change.']},
    {label:'A smooth arrival',detail:'An editable arrival plan, based only on the sample priorities selected here.',items:['Confirm the sample destination and preferred next step.','Collect transport or accommodation questions; no reservation is made.','Review the plan before contacting any provider.']},
   ]:[
    {label:'Check the evidence',detail:'A source-checking brief with uncertainty visible.',items:['Separate the fictional client question from a verified fact.','Record source publication time and last successful retrieval separately.','Mark unsupported assumptions and the reviewer responsible.']},
    {label:'Define a useful first scope',detail:'A bounded discovery brief for human review.',items:['Choose one problem and a finite deliverable.','Confirm client permission, data boundaries and success measures.','Identify access and integration dependencies before committing.']},
    {label:'Prepare the handoff',detail:'A clear meeting brief with a responsible human next step.',items:['Summarise the client’s chosen priority and outstanding questions.','Name the accountable reviewer without inventing a recipient.','Approve any later communication separately; nothing is sent here.']},
   ],
  },
  pilot:travel?'Proposed pilot: one pre-departure moment, a consented synthetic trial, an agreed baseline and airline review. Kate brings15 years of marketing and customer-journey experience across automotive and construction to the discovery and campaign design. Measures are hypotheses to test, not delivered results.':'Proposed pilot: one client question, a reviewed source/evidence brief and a finite next-step pack. Kate combines15 years of marketing/customer-journey experience with building the working assembl tools. Confirm buyer need, access and measurement before a commercial commitment.',
  gaps:travel?['Current Koru terms and approved content.','Actual eligibility and airline integration.','Consent, accessibility, service ownership and agreed measurement.']:['Actual buyer need and engagement permission.','Source retrieval, client-data access and retention.','Accountable review and an agreed pilot baseline.'],
 });
 const concepts=key==='deloitte'?[
  conceptSchema.parse({...c,title:'Cloud Platform Client Landscape Map',promise:'Explore a fictional cloud-client landscape, with evidence gaps and questions visible.',agent:'Prepare a proposed map of platform context, business questions and review responsibilities. No actual tenant inventory or procurement source has been retrieved.',journey:{...c.journey,question:'Which part of the proposed landscape needs review?'}}),
  conceptSchema.parse({...c,id:'interview-deloitte-role-pack',title:'Role-Ready Research Pack',promise:'Choose a role and assemble a finite research brief for a fictional client conversation.',journey:{...c.journey,question:'Who needs to understand this next?',options:[
   {label:'Platform engineer',detail:'A sample platform-question brief, not a discovered technical inventory.',items:['List architecture and dependency questions.','Mark access, security and delivery facts that require validation.','An accountable engineer reviews the evidence before use.']},
   {label:'Client conversation lead',detail:'A sample commercial-preparation brief.',items:['State the fictional client problem and proposed useful scope.','Separate buyer hypothesis from verified demand.','Confirm decision roles without inventing contacts or appointments.']},
   {label:'Evidence reviewer',detail:'A sample source and permission checklist.',items:['Record actual source publication and retrieval dates when supplied.','Zero sources are checked in this example; no claim is verified.','Confirm client permission and review before any handoff.']},
  ]}}),
  conceptSchema.parse({...c,id:'interview-deloitte-discovery',title:'Evidence-to-Conversation Brief'}),
 ]:[c];
 return hubSchema.parse({...h,name:`${organisation} · independent interview example`,buyer:`${organisation} · independent concept`,buyerRole:travel?'Customer lifecycle marketing interview':'Professional services interview',endUser:travel?'Sample traveller':'Fictional client and adviser',
  offer:concepts[0].promise,research:'',sources:[],reviewer:'Human reviewer to appoint',cinema:{mode:'still',title:'',description:''},
  engine:{...h.engine!,sector:travel?'travel':'custom',brief:`${independentNotice} ${c.journey.before}`,concepts,selected:c.id,requirements:[],evidence:[],researchPacket:''},
  design:{...h.design,name:concepts[0].title,client:'Kate Hudson',buyer:organisation,brief:independentNotice,frame:{...h.design.frame,content:{...h.design.frame.content,headline:concepts[0].title,intro:concepts[0].promise,proof:independentNotice},artwork:travel?{src:'/cinematic/concept-travel.webp',alt:'Illustrative airport preparation scene from the original workspace; not a verified Air NZ location or operation.'}:interviewArtworkFor(c.id)}},
 });
}
