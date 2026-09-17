/**
 * FAQ content — current public product architecture (2026-09-17).
 *
 * One source, three jobs: the visible /faq tool, FAQPage JSON-LD, and the
 * copy-for-AI surface. Keep answers concrete, current and aligned with
 * Pursuit / DO / Studio. Pricing belongs on /pricing.
 */
export type Faq = { cat: string; q: string; a: string };

export const FAQ_CATS = [
  'the assembl system',
  'Pursuit',
  'DO',
  'Studio',
  'trust & approval',
] as const;

export const FAQS: Faq[] = [
  {
    cat: 'the assembl system',
    q: 'What is assembl?',
    a: 'assembl is a New Zealand software company for finding, doing and showing valuable work. Pursuit finds evidence-backed opportunities, DO moves bounded work forward with the right agents, context and tools, and Studio turns the result into something people can see, test, approve or buy.',
  },
  {
    cat: 'the assembl system',
    q: 'Do Pursuit, DO and Studio have to be used together?',
    a: 'No. Each product can be used on its own. The larger advantage comes when the same context, permissions, evidence and learning move from the opportunity in Pursuit, through the work in DO, into the proof created in Studio.',
  },
  {
    cat: 'the assembl system',
    q: 'Where do agentic customer journeys fit?',
    a: 'They are a reusable capability inside the system, not a separate top-level product. Pursuit can identify the customer or commercial opportunity, DO can prepare and coordinate the useful next step, and Studio can design and demonstrate the experience.',
  },
  {
    cat: 'the assembl system',
    q: 'What is a rewarded or sponsored wait state?',
    a: 'It is an optional journey pattern for moments when a person is already waiting for useful work to finish. The rule is utility first: any reward, loyalty value or sponsor must improve the customer outcome and be clearly disclosed rather than interrupt the task.',
  },
  {
    cat: 'Pursuit',
    q: 'What does Pursuit do?',
    a: 'Pursuit brings relevant signals, source evidence and business context together so a team can see what is worth acting on next. That can include tenders, projects, buyer movement, customer friction, market changes or a client-specific opportunity.',
  },
  {
    cat: 'Pursuit',
    q: 'Is Pursuit just a tender finder?',
    a: 'No. Tenders and procurement are useful inputs, but Pursuit is broader business-development intelligence. Its job is to turn a relevant change or signal into a bounded opportunity with evidence, a value hypothesis and a practical next move.',
  },
  {
    cat: 'DO',
    q: 'What is DO?',
    a: 'DO is the action layer. It brings the right specialist agent, context, tools and permissions to a bounded job and keeps the prepared result, approval state and evidence visible. The aim is to work where the job already happens rather than force every task into a new app.',
  },
  {
    cat: 'DO',
    q: 'Is DO one chatbot?',
    a: 'No. DO is a portable product layer that can use different specialist agents and models for different jobs while keeping the same job context, permissions and evidence. The visible surface is only one part of that system.',
  },
  {
    cat: 'DO',
    q: 'Does DO send emails, publish or spend money on its own?',
    a: 'Not simply because a tool is connected. Consequential actions such as sending, publishing, spending or irreversible changes remain behind the approval and authority configured for that workflow, and completed actions should leave a receipt or other evidence.',
  },
  {
    cat: 'Studio',
    q: 'What does Studio make?',
    a: 'Studio makes the possibility visible. It can turn a brief, Pursuit opportunity or completed DO work into interactive demonstrators, websites, customer journeys, pitches, campaigns, imagery, film, motion, 3D experiences and other commercial proof.',
  },
  {
    cat: 'Studio',
    q: 'Is Studio only for marketing?',
    a: 'No. Marketing is one use. Studio is also useful when a team needs to demonstrate a proposed product, customer journey, service change, tender concept or future-state experience before committing to a full implementation.',
  },
  {
    cat: 'trust & approval',
    q: 'How do I know what is live and what is a demonstration?',
    a: 'assembl labels important states explicitly, including PREVIEW, PROPOSED, SIMULATED, READY FOR REVIEW and live or verified states where appropriate. A polished screen, successful build or connected credential is not treated as proof that an external action happened.',
  },
  {
    cat: 'trust & approval',
    q: 'Where is my data kept?',
    a: 'Data handling, hosting and access are agreed for each engagement and should match the sensitivity of the work and the systems involved. The trust centre explains the current security, privacy and governance posture in more detail.',
  },
  {
    cat: 'trust & approval',
    q: 'What if an agent gets something wrong?',
    a: 'The system is designed to keep sources, assumptions, approval state and evidence visible so a person can review important work before the next consequential step. High-risk work should use tighter permissions, review boundaries and verification rather than relying on a model answer alone.',
  },
  {
    cat: 'trust & approval',
    q: 'Do I need to be technical to work with assembl?',
    a: 'No. Start with the business problem, opportunity or outcome. assembl can map the context, show the proposed work visually, and agree the tools, permissions and review boundaries needed for the engagement.',
  },
];
