/**
 * FAQ content — the living-OS answer set (rewrite 2026-07-17).
 * Nine plain questions. No marketplace pricing ladder, no retired agent names.
 * Pricing figures live on /pricing; these answers link rather than restate.
 */
export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: 'What is assembl?',
    a: 'assembl gives your business a Business Genome — one connected record of how your business actually works: your services, your people, your customers, your prices, your policies. It then runs your website, your customer desk, your bookings and your admin from that one source. Change a fact once and every surface updates. Less admin, more mahi.',
  },
  {
    q: 'Do I need to be technical?',
    a: 'No. You answer a few plain questions about your business and assembl assembles the rest — the site, the desk, the workflows. You review and approve. You never touch code or write prompts.',
  },
  {
    q: 'What does it actually do, day to day?',
    a: 'It drafts the repeating work. A customer emails; assembl reads it against your Genome, drafts the reply and shows you the sources. An enquiry comes in; it triages it and preps the booking. Your prices change; every page and quote follows. You stay in the loop — it does the typing.',
  },
  {
    q: 'Does it send emails or make bookings on its own?',
    a: 'No. Everything an agent produces is a draft. Nothing emails a customer, books a slot or spends a cent until a named person on your team approves it. The work is done for you; you hold the pen.',
  },
  {
    q: 'What does it cost?',
    a: 'You start with a fixed-price Founding Pilot — we build your first working slice and you see it run before committing further. The current figure is on the pricing page.',
  },
  {
    q: 'Where is my data kept, and is my customers’ information safe?',
    a: 'Your data is hosted in New Zealand by default. assembl is built around the Privacy Act 2020: every piece of personal information records why it was collected and who is allowed to read it, and a customer’s details are only ever seen by an agent scoped to see them. You can view, correct or remove what is held.',
  },
  {
    q: 'How is this different from ChatGPT or an AI chatbot?',
    a: 'A chatbot answers questions in a box and forgets you when you close it. assembl holds your real business context and does the recurring work — replying, triaging, booking, keeping your knowledge current — with the sources shown and a person’s approval on anything that leaves the building.',
  },
  {
    q: 'What if it gets something wrong?',
    a: 'You catch it before it ships, because nothing ships without you. Every draft shows what it read and where it is unsure, so you are correcting a draft, not cleaning up after a send. Correct a fact once and it is corrected everywhere at once.',
  },
  {
    q: 'How do I start?',
    a: 'Answer a few questions and watch assembl assemble your first working slice, or book a Founding Pilot and we build it with you. Either way, you see it run before you decide anything.',
  },
];
