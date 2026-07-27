/**
 * FAQ content — repositioned to agentic customer journeys (2026-07-26).
 *
 * One source, three jobs: the visible /faq tool, the FAQPage JSON-LD engines
 * lift answers from, and the "copy for your AI" button on each card. Answers
 * stay at two-to-four sentences on purpose — this is a tool, not an essay —
 * and pricing figures live on /pricing so nothing here goes stale.
 */
export type Faq = { cat: string; q: string; a: string };

export const FAQ_CATS = [
  'agentic journeys',
  'working with assembl',
  'trust & approval',
  'the agentic era',
] as const;

export const FAQS: Faq[] = [
  {
    cat: 'agentic journeys',
    q: 'What is an agentic customer journey?',
    a: 'A customer relationship run by a team of specialist AI agents inside your business — one watching for work coming due, one noticing customers gone quiet, one drafting the next step, one checking it against your rules. Each agent has a single job and a written limit, and a named person approves anything that reaches a customer. assembl designs and runs them for New Zealand businesses, first enquiry to tenth year.',
  },
  {
    cat: 'agentic journeys',
    q: 'What is agentic CX?',
    a: 'Customer experience delivered by cooperating agents rather than one chatbot. It is proactive across the whole journey — reading the signals your systems already hold and preparing each next step — instead of reacting to a single message in a chat box.',
  },
  {
    cat: 'agentic journeys',
    q: 'What is a rewarded wait state?',
    a: 'The loading spinner, replaced. While agents work, your customer watches the work happen, earns a small credit toward what they are already buying, and answers one optional question in return. You learn something; they get something; the time was being wasted anyway. Tap through one on the homepage.',
  },
  {
    cat: 'agentic journeys',
    q: 'What are the six parts of an assembl agent?',
    a: 'Knowledge (what it may read), signals (what it watches for), ability (the one job it does), boundary (where it stops), approval (whose yes it needs) and the flight log (what it did, kept). The full schema is published at /agent-schema — walk it in 3D on the homepage gallery.',
  },
  {
    cat: 'working with assembl',
    q: 'Do I need to be technical?',
    a: 'No. Paste your website into the builder and watch an agent assemble itself from your own business. From there we write your business down properly together, and you review and approve — you never touch code or write prompts.',
  },
  {
    cat: 'working with assembl',
    q: 'What does it do day to day?',
    a: 'It drafts the repeating work. An enquiry arrives; an agent reads it against everything your business knows and drafts the reply with its sources shown. A warranty nears its end; the follow-up is prepared before anyone remembered. You stay the decision — it does the typing.',
  },
  {
    cat: 'working with assembl',
    q: 'What does it cost?',
    a: 'One working agent installed in about two weeks for a fixed price, then a monthly fee to keep it running and accurate. Current figures are on the pricing page — they are deliberately not repeated here.',
  },
  {
    cat: 'working with assembl',
    q: 'How fast do we see something real?',
    a: 'The builder shows you an agent drafted from your own website in about ten seconds, free. A working agent doing one real job takes about two weeks, and it runs against your real work in week two — with honest numbers on whether it helped.',
  },
  {
    cat: 'trust & approval',
    q: 'Does it send emails or spend money on its own?',
    a: 'No. Everything an agent produces is a draft. Nothing emails a customer, books a slot or spends a cent until a named person approves it — that rule is written into every agent as its boundary, not into a policy document nobody reads.',
  },
  {
    cat: 'trust & approval',
    q: 'Where is my data kept?',
    a: 'Hosted for Aotearoa New Zealand and built around the Privacy Act 2020: personal information records why it was collected and who may read it, and an agent only sees what its written knowledge section allows. The trust centre states the full posture plainly.',
  },
  {
    cat: 'trust & approval',
    q: 'What if an agent gets something wrong?',
    a: 'You catch it before it ships, because nothing ships without you. Every draft shows what it read and where it was unsure, and the flight log keeps measured numbers separate from calculated ones — so you correct a draft, not clean up after a send.',
  },
  {
    cat: 'the agentic era',
    q: 'How is this different from a chatbot?',
    a: 'A chatbot answers questions in a box and forgets you. An agentic customer journey holds your real business context and does the recurring work across years of the relationship — replying, preparing, following through — with a person approving anything that leaves the building.',
  },
  {
    cat: 'the agentic era',
    q: 'Is my website ready for AI search?',
    a: 'Probably not — most sites are nearly invisible to the assistants people now ask for recommendations. Run the free check at /ai-ready: eight honest checks, a score out of 100, and a personalised agentic customer journey drafted from your own site.',
  },
  {
    cat: 'the agentic era',
    q: 'How do I get my business recommended by AI assistants?',
    a: 'Let the AI crawlers in, publish a machine map (llms.txt), define your business in structured data, and keep question-shaped text they can lift — then use the same phrases everywhere so engines learn what you are. The /ai-ready report shows exactly which of these your site already does.',
  },
];
