/** NZ-first, reviewable workflows. These are preparation recipes, never connectors. */
export const LIFE_ADMIN_CATEGORIES = [
  'school', 'bills', 'vehicle', 'home', 'tradie', 'meals', 'transport',
  'returns', 'government', 'care', 'moving', 'travel',
] as const;
export type LifeAdminCategory = (typeof LIFE_ADMIN_CATEGORIES)[number];
export type LifeAdminTemplate = {
  id: LifeAdminCategory;
  name: string;
  description: string;
  prompt: string;
  keywords: RegExp;
  fields: { key: string; label: string; hint: string; required: boolean }[];
  steps: { key: string; title: string; detail: string; kind: 'preparation' | 'personal-action' }[];
  packTitle: string;
  guardrail: string;
  resources: { title: string; url: string; note: string }[];
};
const field = (key: string, label: string, hint: string, required = true) => ({ key, label, hint, required });
const step = (key: string, title: string, detail: string, kind: 'preparation' | 'personal-action' = 'personal-action') => ({ key, title, detail, kind });
export const LIFE_ADMIN_TEMPLATES: LifeAdminTemplate[] = [
  {
    id: 'school', name: 'School & whānau', description: 'Notice → dates, gear, permission and a family plan.',
    prompt: 'Paste the school notice, sports message or whānau plan. Leave out details you do not need.',
    keywords: /\b(school|kura|teacher|permission slip|whānau|whanau|camp|uniform|sports day|lunchbox)\b/i,
    fields: [field('event', 'What is happening?', 'Activity and school or group; a nickname is enough'), field('timing', 'Dates and times to check', 'Event date, return time and permission deadline; include the year'), field('gear', 'Gear, kai and costs', 'Copy the actual list, or say what is still missing'), field('permission', 'Permission or reply needed', 'Who needs to approve, what needs a reply, and by when')],
    steps: [step('brief', 'Review the family checklist', 'Check dates, gear and permission against the original notice.', 'preparation'), step('permission', 'Handle the permission or school reply', 'Review what will be agreed to and reply through the school’s normal channel.'), step('calendar', 'Put confirmed dates in your calendar', 'Check the school-specific date, year, travel and collection time.'), step('gear', 'Get the gear and kai ready', 'Use the actual supplied list; check what you already have.')],
    packTitle: 'Family notice checklist', guardrail: 'National term dates are guidance. Your school confirms its own start/end dates and events. Nothing is sent to a school or added to a calendar here.',
    resources: [{ title: 'Official school terms and holidays', url: 'https://www.education.govt.nz/school-terms-and-holidays-dates', note: 'Public reference. Check your own school’s dates.' }],
  },
  {
    id: 'bills', name: 'Bills & renewals', description: 'A bill, notice or renewal → a clear decision pack.',
    prompt: 'Paste the relevant bill or renewal text. Remove account, card and bank numbers.',
    keywords: /\b(bill|renewal|renew|electricity|power bill|broadband|subscription|insurance premium|invoice)\b/i,
    fields: [field('provider', 'Provider and service', 'Who sent the notice and what it covers'), field('amount', 'Amount, period and due date', 'Copy the exact currency, amount, frequency and date'), field('terms', 'Notice and cancellation terms', 'Auto-renewal, notice period, exit fee or “not stated”'), field('outcome', 'What would help?', 'Understand it, question a charge, compare or cancel')],
    steps: [step('brief', 'Review the bill and renewal summary', 'Separate what the notice says from questions still to answer.', 'preparation'), step('check', 'Check the charge and notice period', 'Use the original provider account or bill to verify the details.'), step('choose', 'Decide whether to keep, query or change it', 'Compare total costs and conditions. No savings or cancellation is assumed.'), step('record', 'Record the provider’s response or receipt', 'Keep confirmation of any payment, change or cancellation you make.')],
    packTitle: 'Bill and renewal decision pack', guardrail: 'No bank or provider account has been checked. No payment, cancellation, switch or savings claim is made.',
    resources: [{ title: 'Billy power comparison', url: 'https://billy.govt.nz/', note: 'Official public comparison service. You choose whether to give Billy bill details; DO does not upload them.' }, { title: 'Electricity Authority: compare and switch', url: 'https://www.ea.govt.nz/your-power/compare-and-switch/', note: 'Public guidance; no live price comparison inside this plan.' }],
  },
  {
    id: 'vehicle', name: 'WoF, rego & RUC', description: 'Separate the dates from the kilometres.',
    prompt: 'Add the vehicle notice or your own notes. Include the WoF/rego date or RUC distance if you have it.',
    keywords: /\b(wof|warrant of fitness|rego|registration|ruc|road user charges|odometer|vehicle)\b/i,
    fields: [field('vehicle', 'Vehicle and job', 'A vehicle nickname, and WoF, rego, RUC or several'), field('limits', 'Verified date or distance limit', 'WoF/rego expiry dates; for RUC, current odometer and purchased end distance'), field('next', 'What needs doing next?', 'Check expiry, arrange inspection, renew or check remaining RUC')],
    steps: [step('brief', 'Review the vehicle checklist', 'Keep WoF, licensing and RUC separate.', 'preparation'), step('verify', 'Verify the record with NZTA or the vehicle label', 'Compare the exact vehicle and current record, not a guessed expiry.'), step('action', 'Arrange the inspection or complete the NZTA step', 'You handle booking or payment on the official site or with your chosen provider.'), step('receipt', 'Keep the new expiry or distance record', 'Record the confirmation and update your own reminder.')],
    packTitle: 'Vehicle admin checklist', guardrail: 'RUC is distance-based. This does not calculate a legal entitlement to drive or check a vehicle record. NZTA transactions and inspection bookings happen outside DO.',
    resources: [{ title: 'NZTA online services', url: 'https://nzta.govt.nz/do-it-online', note: 'Official expiry checks, vehicle licensing and RUC entry points.' }, { title: 'NZTA: about RUC', url: 'https://www.nzta.govt.nz/vehicles/road-user-charges/about-ruc', note: 'Official explanation of distance-based RUC.' }],
  },
  {
    id: 'home', name: 'Home & council', description: 'Bins, rates, repairs and local notices in one place.',
    prompt: 'Paste the council or home notice. A suburb and council are often enough; avoid a full address unless needed.',
    keywords: /\b(council|rubbish|recycling|bins?|rates|watercare|landlord|leak|property maintenance)\b/i,
    fields: [field('area', 'Council or provider and area', 'Council/provider plus suburb, if useful'), field('job', 'What needs sorting?', 'Collection, rates notice, maintenance or another issue'), field('timing', 'Known date and missing details', 'Copy the notice date or say what must be checked')],
    steps: [step('brief', 'Review the home admin brief', 'Keep the notice and questions together.', 'preparation'), step('verify', 'Check the local council or provider source', 'Collection days and holiday shifts depend on the address and council.'), step('contact', 'Raise the request through the official channel', 'Check the recipient and details before submitting.'), step('follow', 'Keep the reference and next check date', 'Record a case number or a response when you have one.')],
    packTitle: 'Home and council brief', guardrail: 'No address lookup or council submission has happened. Council schedules vary; confirm the local source.',
    resources: [{ title: 'Auckland Council collection-day checker', url: 'https://www.aucklandcouncil.govt.nz/en/rubbish-recycling/rubbish-recycling-collections/rubbish-recycling-collection-days.html', note: 'Auckland only. Enter an address there if you choose; DO does not share it.' }],
  },
  {
    id: 'tradie', name: 'Tradie quotes', description: 'A clear job brief and an apples-with-apples checklist.',
    prompt: 'Describe the job or paste the quotes. Note the problem, scope, timing and any access constraints.',
    keywords: /\b(tradie|plumber|electrician|builder|quote|estimate|repair|renovation)\b/i,
    fields: [field('scope', 'Job and scope', 'What needs doing, what is included, and what is excluded'), field('place', 'Area and access constraints', 'General location, available times and safe access'), field('budget', 'Budget and timing', 'A budget if you have one, desired timing and urgency'), field('comparison', 'What each quote must include', 'GST, materials, labour, call-out, exclusions and payment terms')],
    steps: [step('brief', 'Review the quote request brief', 'Use the same scope for each provider.', 'preparation'), step('request', 'Choose providers and send the reviewed brief', 'Verify contact details and what personal details they need.'), step('compare', 'Compare scope, total price and conditions', 'Check quote versus estimate, exclusions, GST and payment terms.'), step('agree', 'Review and record any agreement yourself', 'Accepting a quote may create a commitment. Keep the written agreement.')],
    packTitle: 'Tradie quote brief', guardrail: 'No trade recommendation, quote request or contract acceptance is made. Check qualifications and the written scope with your chosen provider.',
    resources: [{ title: 'Consumer Protection: quotes and estimates', url: 'https://www.consumerprotection.govt.nz/general-help/guide-to-buying-smart/quotes-and-estimates', note: 'Public guidance for preparing and comparing quotes.' }],
  },
  {
    id: 'meals', name: 'Shopping & meals', description: 'Turn the week’s needs into a useful list.',
    prompt: 'List the meals, groceries or things you need. Add what you already have and your time or budget limits.',
    keywords: /\b(meals?|groceries|shopping list|dinner|pantry|supermarket|kai|lunch)\b/i,
    fields: [field('needs', 'Meals or items needed', 'One per line if that helps; include quantities you know'), field('have', 'Already at home', 'Pantry, freezer or supplies to use first'), field('constraints', 'People, preferences and budget', 'Servings, time, budget, dietary requirements and allergens to check')],
    steps: [step('brief', 'Review the meals and shopping pack', 'Start with what is already at home.', 'preparation'), step('list', 'Check quantities and the pantry', 'Confirm requirements and allergen labels; do not assume substitutions are safe.'), step('shop', 'Choose the shop and get the items', 'No live stock, prices, delivery slot or checkout is connected.'), step('ready', 'Record what is ready for the week', 'Keep substitutions and still-missing items visible.')],
    packTitle: 'Meals and shopping list', guardrail: 'No shopping account is connected. Prices, stock and delivery availability are not checked. Confirm food safety and dietary suitability yourself.', resources: [{ title: 'MPI: safe food preparation and storage', url: 'https://www.mpi.govt.nz/food-safety-home/preparing-and-storing-food-safely-at-home/safe-food-preparation-cooking-and-storage-at-home', note: 'Official food-safety guidance. Check suitability for your household.' }],
  },
  {
    id: 'transport', name: 'Everyday transport', description: 'Journey details and a backup plan before you go.',
    prompt: 'Add the trip, arrival time and constraints. A station or public landmark can replace a private address.',
    keywords: /\b(bus|train|ferry|commute|public transport|metlink|at hop|journey)\b/i,
    fields: [field('route', 'From and to', 'Stops, stations or landmarks; leave out private addresses if possible'), field('timing', 'Date and arrival time', 'Include the year and whether the time is fixed'), field('needs', 'Travel needs and backup', 'Accessibility, walking, transfers and a backup option to check')],
    steps: [step('brief', 'Review the journey brief', 'Confirm the date, places and arrival time.', 'preparation'), step('route', 'Check the operator’s current journey planner', 'Live timetable, disruptions and fares have not been fetched.'), step('backup', 'Choose a backup and departure reminder', 'Leave the buffer you need; times here are yours to confirm.'), step('travel', 'Record the journey as handled', 'No ticket, ride or transport booking is made by DO.')],
    packTitle: 'Journey and backup brief', guardrail: 'Live public transport is not connected in this plan. Operator services may offer a public planner without a user login.', resources: [],
  },
  {
    id: 'returns', name: 'Returns & complaints', description: 'Evidence, timeline and a clear request.',
    prompt: 'Describe what happened or paste the order and response text. Remove payment and account details.',
    keywords: /\b(return|refund|complaint|faulty|damaged|warranty|consumer guarantee)\b/i,
    fields: [field('purchase', 'Item, seller and purchase date', 'Include receipt reference only if useful'), field('problem', 'What happened and when?', 'Facts, attempts to resolve it, photos or other evidence you hold'), field('remedy', 'What would resolve it?', 'Your requested outcome, plus any seller response or deadline')],
    steps: [step('brief', 'Review the evidence and request pack', 'Keep facts, documents and the outcome you want separate.', 'preparation'), step('evidence', 'Gather the receipt and relevant evidence', 'Keep originals; add copies only where needed.'), step('contact', 'Send your reviewed request to the seller', 'Check the recipient and wording before sending.'), step('response', 'Record the response and next step', 'Use official guidance if the issue remains unresolved.')],
    packTitle: 'Return or complaint evidence pack', guardrail: 'Faulty goods and change-of-mind returns are different. This is admin preparation, not a legal determination or a promise of a refund.',
    resources: [{ title: 'Consumer Protection: faulty products', url: 'https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/faulty-and-unsafe-products', note: 'Public guidance. Your facts and the seller’s response still matter.' }, { title: 'Consumer Protection: change of mind', url: 'https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/change-of-mind', note: 'Check the seller’s own return policy.' }],
  },
  {
    id: 'government', name: 'Government paperwork', description: 'Requirements and unanswered questions, kept tidy.',
    prompt: 'Paste the public requirements or a redacted letter. Do not include passport, IRD, RealMe or other identity credentials.',
    keywords: /\b(government|ird|realme|passport|benefit|work and income|application form|citizenship)\b/i,
    fields: [field('service', 'Agency and application', 'Name the exact official service'), field('requirements', 'Requirements in the official notice', 'Documents, dates and steps exactly as stated'), field('questions', 'Missing information or questions', 'What you need to confirm with the agency')],
    steps: [step('brief', 'Review the paperwork checklist', 'Separate requirements from unanswered questions.', 'preparation'), step('check', 'Verify the current official requirements', 'Use the agency website; eligibility has not been established.'), step('collect', 'Gather the documents privately', 'Keep identity documents and credentials out of this plan.'), step('submit', 'Complete the official process yourself', 'Review declarations and any agreement, then retain the official confirmation.')],
    packTitle: 'Government paperwork checklist', guardrail: 'No eligibility assessment, agency account access, identity verification or government submission is performed. You complete declarations and sign-in yourself.', resources: [],
  },
  {
    id: 'care', name: 'Care appointments', description: 'Appointment logistics, questions and follow-through.',
    prompt: 'Add appointment logistics or a redacted letter. Leave out health details that are not needed for the admin.',
    keywords: /\b(appointment|clinic|doctor|dentist|hospital|care|referral|physio)\b/i,
    fields: [field('provider', 'Provider and admin task', 'Book, confirm, reschedule or prepare questions'), field('timing', 'Date, place and contact details to verify', 'Include the year, arrival instructions and travel needs'), field('questions', 'Admin questions and support needed', 'Cost, paperwork, access, interpreter or support person')],
    steps: [step('brief', 'Review the appointment admin checklist', 'Use only the logistics you chose to include.', 'preparation'), step('confirm', 'Contact the provider and confirm details', 'A proposed time is not a booking.'), step('prepare', 'Arrange transport and required paperwork', 'Confirm any clinical preparation directly with the provider.'), step('follow', 'Record the admin follow-through', 'Keep confirmation or the next appointment details yourself.')],
    packTitle: 'Care appointment admin checklist', guardrail: 'Admin support only. No diagnosis, treatment advice, clinical triage or appointment booking. Confirm clinical instructions with your provider.', resources: [],
  },
  {
    id: 'moving', name: 'Moving house', description: 'One checklist for the date, services and handover.',
    prompt: 'Add your moving date and what needs changing. Area names are enough to start; leave out keys or alarm codes.',
    keywords: /\b(moving|move house|new address|tenancy|bond|movers|house move)\b/i,
    fields: [field('date', 'Moving date and handover', 'Confirmed date, access and any key deadlines'), field('services', 'Services and people to update', 'Power, internet, council, delivery, school and others relevant to you'), field('logistics', 'Move-day logistics', 'Packing, transport, cleaning, readings and keys')],
    steps: [step('brief', 'Review the move checklist', 'Split before, moving day and after.', 'preparation'), step('services', 'Arrange service changes and address updates', 'Check each provider, costs and start/end dates before agreeing.'), step('handover', 'Complete the move and property handover', 'Keep meter readings, condition photos and agreements.'), step('confirm', 'Check confirmations and remaining loose ends', 'Record what is still waiting, rather than assuming every update worked.')],
    packTitle: 'Moving-house checklist', guardrail: 'No address has been shared, service transferred, bond submitted or tenancy changed by DO.', resources: [{ title: 'Tenancy Services: tenants ending a tenancy', url: 'https://www.tenancy.govt.nz/ending-a-tenancy/tenants-ending-a-tenancy-process/', note: 'Check the tenancy-specific notice and handover requirements; this does not issue notice.' }],
  },
  {
    id: 'travel', name: 'Travel admin', description: 'Bookings, documents and the bits between.',
    prompt: 'Paste a redacted itinerary or your travel notes. Do not include passport numbers, payment details or booking access codes.',
    keywords: /\b(travel|flight|hotel|holiday|itinerary|airport|baggage|visa)\b/i,
    fields: [field('trip', 'Trip and dates', 'Destinations, dates and whether each booking is confirmed'), field('documents', 'Requirements to verify', 'Passport validity, entry/transit rules and insurance questions; no document numbers'), field('logistics', 'Travel details still to sort', 'Transfers, baggage, check-in, accommodation and cancellations')],
    steps: [step('brief', 'Review the travel admin pack', 'Keep confirmed bookings separate from ideas.', 'preparation'), step('requirements', 'Verify current official travel requirements', 'Nationality, transit and destination can change the requirements.'), step('logistics', 'Handle bookings and travel logistics', 'Review the provider, final total, dates and cancellation terms yourself.'), step('ready', 'Record confirmations and final checks', 'Keep documents privately and recheck times with the provider.')],
    packTitle: 'Travel admin checklist', guardrail: 'No booking, check-in, insurance purchase or visa/entry decision is made. Current rules and provider confirmations must be checked separately.', resources: [{ title: 'SafeTravel: before you go', url: 'https://www.safetravel.govt.nz/before-you-go', note: 'Official travel-advisory and preparation guidance.' }, { title: 'Govt.nz: before you travel', url: 'https://www.govt.nz/browse/leaving-nz/before-you-travel/', note: 'Public document and planning guidance. Verify the requirements for your exact trip.' }],
  },
];
export function lifeAdminTemplate(category: LifeAdminCategory) {
  return LIFE_ADMIN_TEMPLATES.find((template) => template.id === category)!;
}
export function suggestLifeAdminCategory(source: string): LifeAdminCategory | null {
  return LIFE_ADMIN_TEMPLATES.find((template) => template.keywords.test(source))?.id ?? null;
}
export const LIFE_ADMIN_CAPABILITIES = [
  { name: 'Text → checklist', status: 'Works on this device', detail: 'Exact details, NZ workflow templates and reviewable packs. No provider needed.' },
  { name: 'Screenshot → reviewed notes', status: 'Provider-dependent', detail: 'Uses the existing DO vision service only after you approve the image.' },
  { name: 'Tailored draft', status: 'Provider-dependent', detail: 'Uses your DO sign-in and assembl’s configured generation providers after a separate choice.' },
  { name: 'NZTA road notices', status: 'Public live fetch', detail: 'No account needed. State-highway snapshots with source time, region filter and an unavailable state.' },
  { name: 'Official NZ guidance', status: 'Public links', detail: 'Open the official service yourself. Links do not prove an account or live data connection.' },
  { name: 'Saved checklists', status: 'Private account copy', detail: 'Choose Save to keep your collection in your Assembl account, then open it on another device. Later edits need another save. Chat and reminders are separate.' },
  { name: 'Email, calendar & household sharing', status: 'Not connected here', detail: 'Download a private pack or a calendar file. No inbox access, calendar sync or invitations.' },
  { name: 'Reminders & push', status: 'On-screen only', detail: 'Follow-up dates show when you open this workspace. No background check or notification is scheduled.' },
] as const;
