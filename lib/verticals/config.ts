/** Public verticals only. Client rooms never belong in this registry. */
export const VERTICAL_SLUGS = ['arc', 'forge', 'customs', 'ensemble', 'retirement', 'flux', 'aroha'] as const;
export type VerticalSlug = (typeof VERTICAL_SLUGS)[number];

export type Vertical = {
  slug: VerticalSlug;
  name: string;
  field: string;
  agent: string;
  agentName: string;
  title: string;
  description: string;
  greeting: string;
  reviewer: string;
  output: string;
  image: string;
  imageAlt: string;
  starters: { label: string; prompt: string }[];
};

export const VERTICALS: Record<VerticalSlug, Vertical> = {
  retirement: {
    slug: 'retirement', name: 'Retirement guide', field: 'Retirement living · Aotearoa', agent: 'retirement', agentName: 'Retirement guide',
    title: 'A next chapter. At their pace.', description: 'Help someone you care about explore retirement living, understand the questions and prepare a move on their terms.',
    greeting: 'Who are you helping, and what matters to them? We can explore independent village living, support at home or the residential care pathway. Start with general details; your family can take this one step at a time.',
    reviewer: 'Older person, independent lawyer and care or financial adviser as needed', output: 'Family preparation plan', image: '/brand/vertical-apps/retirement/study.png', imageAlt: 'Illustrative family plan, source notes and priorities',
    starters: [
      { label: 'Help us start the conversation', prompt: 'We are helping a parent explore retirement living. They value independence and being close to friends. Prepare a first family conversation, with staying at home included as an option. Do not assume they want to move.' },
      { label: 'Check current care funding', prompt: 'What does the current official Residential Care Subsidy page say about asset thresholds for a person aged 65 or older, including a partner staying at home? Explain the separate assessment steps and cite the current page.' },
      { label: 'Prepare for the village lawyer', prompt: 'We have not signed an occupation right agreement. Help us prepare questions about deferred management fees, ongoing charges, leaving the village and cooling-off rights. Verify the law before giving deadlines.' },
    ],
  },
  flux: {
    slug: 'flux', name: 'Flux', field: 'Sales & customer relationships', agent: 'flux', agentName: 'Flux',
    title: 'Every lead. A considered next step.', description: 'Research business fit, organise your pipeline and prepare relevant follow-ups for your team to review.',
    greeting: 'What do you sell, who is it useful for, and what is the next conversation you want to earn? I can help research fit and prepare the follow-up. Your pipeline and connected tools stay under your control.',
    reviewer: 'Sales owner', output: 'Sales brief', image: '/brand/vertical-apps/flux/study.png', imageAlt: 'Illustrative sales brief and evidence folio',
    starters: [
      { label: 'Define our ideal customer', prompt: 'We help regional NZ businesses turn customer waiting into useful preparation. Help me define a narrow ideal customer and three observable public signals of fit. Keep commercial assumptions labelled.' },
      { label: 'Prepare a helpful follow-up', prompt: 'A prospect requested more information after our demo. We have not agreed a budget or meeting. Draft a short follow-up that asks one useful question, without inventing promises or sending anything.' },
      { label: 'Review our pipeline', prompt: 'Help me review a small sales pipeline. Give me a practical sequence for checking source evidence, buyer need, next action, owner and follow-up date. Do not invent lead scores.' },
    ],
  },
  aroha: {
    slug: 'aroha', name: 'Aroha', field: 'People & work · Aotearoa', agent: 'aroha', agentName: 'Aroha',
    title: 'Good work begins with people.', description: 'NZ HR and employment law — agreements, disciplinary process, leave, and the true cost of a hire, drafted for you to check.',
    greeting: 'What is happening in your team? We can prepare a role, an onboarding plan, a leave question or a fair conversation. Use role descriptions instead of employee names. A person reviews each next step.',
    reviewer: 'HR lead or employment lawyer', output: 'HR preparation brief', image: '/brand/vertical-apps/aroha/study.png', imageAlt: 'Illustrative HR preparation folio',
    starters: [
      { label: 'Prepare a new starter plan', prompt: 'Prepare a first-week onboarding plan for a customer service role in a small NZ team. We have not finalised hours or the agreement. Keep decisions and missing details visible.' },
      { label: 'Check current pay settings', prompt: 'Check the current official adult minimum wage and employer KiwiSaver settings, including effective dates and exceptions that need checking. Cite only pages you read.' },
      { label: 'Plan a fair conversation', prompt: 'A team member has missed a deadline. No findings have been made. Help an HR lead prepare a fair first conversation that hears their perspective and does not predetermine an outcome.' },
    ],
  },
  arc: {
    slug: 'arc', name: 'ARC', field: 'Architecture & design', agent: 'whakaae', agentName: 'Whakaaē',
    title: 'Talk the plan through.',
    description: 'Turn a project question into a clear brief for your architect or consent team to review.',
    greeting: 'What are you working on? Share a project question or try a sample. I can prepare a brief, identify missing information and help you plan the next conversation.',
    reviewer: 'Architect or consent team', output: 'Project brief',
    image: '/brand/agent-studies/arc-harbour-terraces.webp', imageAlt: 'Architectural concept study of Auckland terrace homes',
    starters: [
      { label: 'Prepare for a first meeting', prompt: 'Sample project: we are planning two timber terrace homes in Auckland. We have not selected a site or architect. Prepare five useful questions for our first architect meeting. Do not assume consent requirements.' },
      { label: 'Organise a council question', prompt: 'Sample council RFI: please clarify the proposed cladding material and provide the relevant detail. Help me prepare a short response structure for the architect. We have not confirmed the material yet.' },
      { label: 'Check the source', prompt: 'Search the current NZ knowledge sources for who is responsible for a building consent application. Cite what you actually find; say if the source is unavailable.' },
    ],
  },
  forge: {
    slug: 'forge', name: 'Forge', field: 'Automotive', agent: 'arataki', agentName: 'Arataki',
    title: 'Keep the next step moving.',
    description: 'Prepare an enquiry reply, a service update or a dealership brief, ready for your team to check.',
    greeting: 'What needs preparing at the dealership? Share the facts you have, or try a sample Subaru enquiry. I will keep the gaps visible and leave the next action with your team.',
    reviewer: 'Dealership or service team', output: 'Customer draft',
    image: '/brand/transport/subaru-reference.webp', imageAlt: 'Illustrative Subaru WRX assembly model',
    starters: [
      { label: 'Reply to a Subaru enquiry', prompt: 'Sample enquiry: a customer asks to see a blue Subaru WRX this weekend. Stock, price and appointments are unconfirmed. Draft a short reply for our sales team to review, with one useful question. Do not invent availability.' },
      { label: 'Prepare a service update', prompt: 'Sample service visit: inspection underway, no findings or completion time confirmed. The customer needs the car for school pickup. Draft a helpful update and one question for the service adviser to ask.' },
      { label: 'Brief a campaign', prompt: 'Prepare a short dealership content brief for a Subaru WRX photo shoot. Only confirmed facts: blue exterior, Subaru WRX. Ask for the missing details before making specifications, price or availability claims.' },
    ],
  },
  customs: {
    slug: 'customs', name: 'Gateway', field: 'Customs & freight', agent: 'pikau', agentName: 'Pīkau',
    title: 'Get the entry ready for review.',
    description: 'Organise the shipment details and missing documents before the broker takes the next step.',
    greeting: 'What is arriving, and what do you know so far? I can organise a shipment brief and questions for your broker. Start with sample goods and keep personal or commercial identifiers out of the demo.',
    reviewer: 'Customs broker', output: 'Shipment brief',
    image: '/brand/transport/boat-reference.webp', imageAlt: 'Illustrative container vessel assembly model',
    starters: [
      { label: 'Prepare a sea-freight brief', prompt: 'Sample shipment: timber furniture arriving in Auckland by sea. We have a supplier invoice but no confirmed wood species, treatment evidence or origin documents. Prepare a missing-information brief for our broker. Do not invent a tariff code or clearance status.' },
      { label: 'Prepare an air-freight update', prompt: 'Sample shipment: replacement machine parts arriving by air, with arrival time and clearance unconfirmed. Draft a short customer update and questions for the freight team. Do not promise a release date.' },
      { label: 'Check the source', prompt: 'Search NZ official knowledge for the information required to prepare a commercial import entry. Cite only sources you actually retrieve. Do not provide an unverified tariff code or rate.' },
    ],
  },
  ensemble: {
    slug: 'ensemble', name: 'Ensemble', field: 'Creative studio', agent: 'auaha', agentName: 'Auaha',
    title: 'Put your brief to work.',
    description: 'Explore a direction, prepare copy and shape a creative package for someone to approve.',
    greeting: 'What are we making? Tell me the audience, the confirmed facts and the format. I can help shape the brief and prepare draft copy for your reviewer.',
    reviewer: 'Creative lead or business owner', output: 'Creative draft',
    image: '/generated/creative-agency/anchors/prism-cafe.png', imageAlt: 'Sample café campaign studio still',
    starters: [
      { label: 'Start a café brief', prompt: 'Sample brief: a fictional Wellington café wants a winter social post. Confirmed facts: coffee is served, and customers can sit inside. Give me three short headline directions and flag any facts we need before publishing. No invented offers.' },
      { label: 'Shape a short film', prompt: 'Prepare a 15-second production script for a fictional ceramic studio: hands, clay and a finished cup. No voiceover. Mark it as a script for review, not a generated film.' },
      { label: 'Check a campaign claim', prompt: 'Sample copy says our coffee is the most sustainable in New Zealand, but we have no evidence. Rewrite it using only the fact that we serve coffee in reusable ceramic cups in the café. Flag the unsupported claim for review.' },
    ],
  },
};

export function getVertical(slug: string): Vertical | undefined {
  return VERTICAL_SLUGS.includes(slug as VerticalSlug) ? VERTICALS[slug as VerticalSlug] : undefined;
}

export function verticalForPath(path: string): Vertical | undefined {
  const match = /^\/agents\/([^/]+)(?:\/|$)/.exec(path);
  return match ? getVertical(match[1]) : undefined;
}

export function isVerticalWorkerScope(scope: string): boolean {
  try { return VERTICAL_SLUGS.some(slug => new URL(scope).pathname === `/agents/${slug}/`); }
  catch { return false; }
}

/** Share only the app address. Never carry queries, invites or chat content. */
export function verticalShareUrl(origin: string, slug: VerticalSlug): string {
  return new URL(`/agents/${slug}/app`, origin).href;
}

export function verticalManifest(v: Vertical) {
  const base = `/agents/${v.slug}`;
  return {
    id: `${base}/app`, name: `${v.name} · assembl`, short_name: v.name,
    description: v.description, lang: 'en-NZ', start_url: `${base}/app?source=homescreen`,
    scope: base, display: 'standalone', background_color: '#FFFDFB', theme_color: '#240B21',
    categories: ['business', 'productivity'],
    icons: [192, 512].map(size => ({ src: `/brand/vertical-apps/${v.slug}/icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png', purpose: 'any maskable' })),
    shortcuts: [
      { name: `Talk to ${v.agentName}`, short_name: 'Chat', url: `${base}/app` },
      { name: 'Explore the story', short_name: 'Story', url: base },
    ],
  };
}
