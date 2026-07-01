/**
 * lib/-adjacent FAQ content for /faq.
 *
 * Answer engines (ChatGPT Search, Perplexity, Claude, Google AI Overviews) cite
 * short, self-contained, factual paragraphs — not vibes. Each answer here is
 * written to stand alone as a citable chunk and reflects REAL, verifiable facts
 * (real prices, real agents, real people). Keep them accurate.
 */
import { PUBLIC_MARKETPLACE_AGENTS } from '@/lib/marketplace/agents';

export const LIVE_AGENT_COUNT = PUBLIC_MARKETPLACE_AGENTS.filter((a) => a.status === 'live').length;

export type Faq = { q: string; a: string };
export type FaqSection = { heading: string; items: Faq[] };

export const FAQ_SECTIONS: FaqSection[] = [
  {
    heading: 'About assembl',
    items: [
      {
        q: 'What is assembl?',
        a: `assembl (always lowercase) is an AI platform built in Aotearoa New Zealand. It is a marketplace of ${LIVE_AGENT_COUNT} specialist agents, each tuned for one real New Zealand job — school notices, GST, staff rosters, clinical notes, building consents, customs entries, employment law and more. An agent drafts the work; a named person on the team reviews and signs it off; every output ships with an evidence pack recording how it was made.`,
      },
      {
        q: 'Who founded assembl?',
        a: 'assembl was founded by Kate Hudson and is built in Aotearoa New Zealand. She started it to give people their time back — for the work that matters, and the life around it.',
      },
      {
        q: 'Is assembl a New Zealand company?',
        a: 'Yes. assembl is built in Aotearoa New Zealand. New Zealand law, council and sector rules, and tikanga are built into the agents from the start, not bolted on afterwards.',
      },
      {
        q: 'How is assembl different from ChatGPT or a general AI chatbot?',
        a: 'A general chatbot is a blank box that answers anything but knows nothing about your rules. assembl is the opposite: each agent does one specific New Zealand job with the relevant law and local knowledge built in, drafts a reviewable result, keeps the human in the loop, and attaches an evidence pack. You are not prompt-engineering — you are reviewing a draft.',
      },
      {
        q: 'What is a Mana Receipt?',
        a: 'A Mana Receipt is assembl\'s provenance layer. Every output is sealed with a record of the sources the agent used, the assumptions it made, and the named person who reviewed and approved it — a downloadable evidence pack you can file or hand to an auditor.',
      },
      {
        q: 'What is dash?',
        a: 'dash — "Get paid for the wait." — is assembl\'s sibling brand: a rewards and attention layer that pays people for the time they spend waiting and funds charity through ethical, New Zealand-first ad fill.',
      },
    ],
  },
  {
    heading: 'The agents and how they work',
    items: [
      {
        q: 'How many agents does assembl have?',
        a: `assembl currently offers ${LIVE_AGENT_COUNT} live specialist agents across family and whānau, business, trades and operations, creative, health, build and legal categories. The shelf grows as new New Zealand jobs are covered.`,
      },
      {
        q: 'Does the AI send or publish anything on its own?',
        a: 'No. Every agent drafts only. Nothing sends, files or publishes until a named person on your team reviews it and approves it. Agents draft; people decide.',
      },
      {
        q: 'Which agents are free to try?',
        a: 'Several agents are free — including Atlas (the AI adoption coach), 9am Brief, Fridge-to-List, Power Watch, Tide & Weather, Catch Log and Pilot (the agent maker). Beyond that, your first three messages with any paid agent are on us before you subscribe.',
      },
      {
        q: 'Can I build my own agent?',
        a: 'Yes. Pilot is a free, step-by-step agent maker that walks you through naming, building, testing and shipping your own agent — no code and no jargon. Your first build is free.',
      },
      {
        q: 'What does the health agent (Care Scribe) do?',
        a: 'Care Scribe writes the clinical note while the clinician focuses on the patient. It records the consult onshore, transcribes it in New Zealand English, and drafts the note — which a registered practitioner always reviews before it enters the record.',
      },
      {
        q: 'Do the agents know New Zealand law and regulations?',
        a: 'Yes. Agents cite the relevant New Zealand instruments — for example the Building Act 2004, Health and Safety at Work Act 2015, Privacy Act 2020, Consumer Guarantees Act 1993, Sale and Supply of Alcohol Act 2012, and the Customs and Excise Act 2018 — and draft the work for a qualified person to review and sign.',
      },
      {
        q: 'Are agents grouped into bundles?',
        a: 'assembl is moving to an industry-bundle model where a single lead agent routes work to the right specialist inside a bundle (for example Assembler for construction, Practice for health, Counsel for legal). You can still open individual agents today.',
      },
    ],
  },
  {
    heading: 'Pricing',
    items: [
      {
        q: 'How much does assembl cost?',
        a: 'assembl uses one simple ladder in New Zealand dollars: Free (your first three messages with any agent), Everyday at NZ$9.99 per month for a single everyday agent, Pro Stack at NZ$49 per month, Specialist at NZ$199 per month for a specialist agent, and All-Access at NZ$250 per month for every agent on the shelf.',
      },
      {
        q: 'What is the Pro Stack?',
        a: 'Pro Stack is NZ$49 per month and lets you pick three everyday agents plus one specialist agent — a middle rung so you do not have to jump straight to the NZ$199 specialist price to get a specialist in the mix.',
      },
      {
        q: 'What is All-Access?',
        a: 'All-Access is NZ$250 per month and includes every agent assembl offers, including the industry-vertical agents. It is the plan for a business that wants the whole shelf.',
      },
      {
        q: 'Is there a free tier?',
        a: 'Yes. A number of agents are free outright, and every paid agent gives you three free messages before you are asked to subscribe. You can try before you pay.',
      },
      {
        q: 'Are prices in New Zealand dollars and do they include GST?',
        a: 'Yes. All prices are in New Zealand dollars and are GST-inclusive.',
      },
      {
        q: 'Do I need a contract?',
        a: 'No. assembl plans are month-to-month subscriptions. You can start on a free agent, move up to Everyday, Pro Stack, Specialist or All-Access, and change as your needs change.',
      },
    ],
  },
  {
    heading: 'Trust, privacy and your data',
    items: [
      {
        q: 'Where does assembl store my data?',
        a: 'Data is hosted in Sydney today, with a New Zealand hosting option in progress. It is not stored in the United States.',
      },
      {
        q: 'Does the AI model see my customers\' names?',
        a: 'No. Personally identifiable information is masked before any model call — names and personal details stay with you. The model only ever sees masked content.',
      },
      {
        q: 'Is assembl compliant with the Privacy Act 2020?',
        a: 'assembl is designed to the New Zealand Privacy Act 2020, including Information Privacy Principle 3A. PII is stripped before any model call, and every output carries an auditable evidence pack.',
      },
      {
        q: 'What proof do I get that an output is trustworthy?',
        a: 'Every output ends in an evidence pack: a downloadable bundle listing the sources used, the assumptions made, and the named person who reviewed and approved it. You can hand it straight to an auditor.',
      },
      {
        q: 'Can I use assembl for regulated or professional work?',
        a: 'assembl drafts the work and always routes it to a qualified person for review — a registered clinician, a licensed building practitioner, a lawyer, a broker. It is a drafting and evidence tool, not a replacement for professional sign-off.',
      },
      {
        q: 'Does assembl train AI models on my data?',
        a: 'assembl masks personal details before any model call and is built around keeping your data close and reviewable. See the Trust Centre for the current sub-processor list and data-handling detail.',
      },
    ],
  },
  {
    heading: 'For New Zealand businesses',
    items: [
      {
        q: 'Who is assembl for?',
        a: 'assembl is for New Zealand small and medium businesses, tradespeople, clinics, families and professional teams who lose hours to document-heavy admin — reports, notices, compliance paperwork, customs entries — and want that load taken off without learning a new tool.',
      },
      {
        q: 'What industries does assembl cover?',
        a: 'Family and whānau admin, business and back-office, trades and operations, construction and build, health and service, creative and marketing, hospitality, retail, automotive, freight and customs, and legal.',
      },
      {
        q: 'Do I need to know how to prompt an AI?',
        a: 'No. That is the point. Each agent is pre-built for its job, so you describe the task in plain words and review a draft — no prompt engineering and no new app to master.',
      },
      {
        q: 'Is te reo Māori and tikanga supported?',
        a: 'Yes. Agents carry te reo Māori labels where they earn it, tikanga considerations are built in, and assembl includes agents specifically for te reo and cultural compliance. Māori data considerations are treated with care.',
      },
      {
        q: 'How do I get started?',
        a: 'Start free with Atlas, the AI adoption coach, which maps your week and points you to the agents that fit — honestly, including where AI will not help. From there you can open a free agent, try a paid one for three messages, or have Pilot build you a custom agent.',
      },
    ],
  },
];

export const ALL_FAQS: Faq[] = FAQ_SECTIONS.flatMap((s) => s.items);

/** assembl vs a generic AI chatbot — a citable comparison chunk. */
export const COMPARISON = {
  title: 'assembl vs a generic AI chatbot',
  columns: ['', 'assembl', 'Generic AI chatbot'],
  rows: [
    ['Built for', 'One specific New Zealand job per agent', 'Anything, in general'],
    ['New Zealand law', 'Cited and built in', 'Not guaranteed, often US-centric'],
    ['Human sign-off', 'Named reviewer before anything ships', 'None — you own the risk'],
    ['Evidence trail', 'Mana Receipt evidence pack on every output', 'None'],
    ['Privacy', 'PII masked before any model call; data in Sydney (NZ coming)', 'Varies; often US data centres'],
    ['Prompting', 'Not required — you review a draft', 'You engineer the prompt'],
    ['Pricing', 'From free; NZ$9.99–$250/month, GST-incl', 'Usually USD, per-seat'],
  ],
} as const;
