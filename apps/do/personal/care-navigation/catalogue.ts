/** Curated public navigation, reviewed on the stated date. No clinical or eligibility engine. */
export const NZ_CARE_REVIEWED_ON = '2026-09-30';
export const NZ_CARE_BOUNDARY = 'Navigation and preparation only. DO does not decide eligibility, give medical, financial or legal advice, submit forms, book care or monitor emergencies.';
export type NzCareSource = { title: string; organisation: string; url: string; reviewedOn: string };
const source = (title: string, organisation: string, url: string): NzCareSource => ({ title, organisation, url, reviewedOn: NZ_CARE_REVIEWED_ON });
export const NZ_CARE_SOURCES = {
  emergency: source('111 emergency services', 'NZ Police', 'https://www.police.govt.nz/call-111'),
  police: source('105 non-emergency reporting', 'NZ Police', 'https://www.police.govt.nz/use-105'),
  accessibleEmergency: source('Register for 111 TXT', 'NZ Police', 'https://www.police.govt.nz/111-txt/how-register-111-txt'),
  healthline: source('Which health service should I use?', 'Health New Zealand', 'https://www.healthnz.govt.nz/hospitals-services/which-health-service-should-i-use'),
  super: source('Who can get NZ Super', 'Work and Income', 'https://www.workandincome.govt.nz/eligibility/seniors/superannuation/who-can-get-it.html'),
  superApply: source('Apply for NZ Super', 'Work and Income', 'https://www.workandincome.govt.nz/online-services/superannuation'),
  superDocuments: source('Documents for an NZ Super application', 'Work and Income', 'https://www.workandincome.govt.nz/about-work-and-income/our-services/what-to-bring/nz-super'),
  gold: source('Get or replace a SuperGold Card', 'SuperGold / Ministry of Social Development', 'https://www.supergold.govt.nz/info_for_cardholders/how_to_get_a_supergold_card'),
  goldOffers: source('SuperGold discounts and transport', 'SuperGold / Ministry of Social Development', 'https://www.supergold.govt.nz/'),
  assessment: source('Get a needs assessment', 'New Zealand Government', 'https://www.govt.nz/browse/health/help-in-your-home/needs-assessment/'),
  assessmentDirectory: source('Find the right needs assessment service', 'Health New Zealand', 'https://www.healthnz.govt.nz/hospitals-services/services-support/support-services/needs-assessment-service'),
  olderPeople: source('Services for older people', 'Health New Zealand', 'https://www.healthnz.govt.nz/hospitals-services/services-support/older-people'),
  seniorline: source('Seniorline', 'Health New Zealand', 'https://www.healthnz.govt.nz/hospitals-services/services-support/support-services/older-people/seniorline'),
  residential: source('Residential care', 'Health New Zealand', 'https://www.healthnz.govt.nz/hospitals-services/services-support/older-people/residential-care'),
  subsidy: source('Residential Care Subsidy', 'Work and Income', 'https://www.workandincome.govt.nz/products/a-z-benefits/residential-care-subsidy.html'),
  loan: source('Residential Care Loan', 'Work and Income', 'https://www.workandincome.govt.nz/products/a-z-benefits/residential-care-loan'),
  gp: source('General practices and enrolment', 'Health New Zealand', 'https://www.healthnz.govt.nz/hospitals-services/services-support/general-practices'),
  respite: source('Respite care for older people', 'Health New Zealand', 'https://www.healthnz.govt.nz/hospitals-services/services-support/older-people/respite-care'),
  carers: source('Carer Support Subsidy', 'Health New Zealand', 'https://www.healthnz.govt.nz/hospitals-services/eligibility-subsidies/carer-support-subsidy'),
  advocacy: source('Talk to the Advocacy Service', 'Health and Disability Commissioner', 'https://www.hdc.org.nz/making-a-complaint/talk-to-the-advocacy-service/'),
  elderAbuse: source('Elder Abuse Response Service', 'Office for Seniors', 'https://www.officeforseniors.govt.nz/our-work/raising-awareness-of-elder-abuse/elder-abuse-response-service'),
  village: source('Occupation Right Agreements', 'Companies Office', 'https://www.companiesoffice.govt.nz/all-registers/retirement-villages/registered-documents/occupation-right-agreement/'),
  villageAdvice: source('Independent legal advice before signing', 'New Zealand Legislation', 'https://www.legislation.govt.nz/act/public/2003/0112/latest/DLM220864.html'),
} as const;
export type NzCareSourceId = keyof typeof NZ_CARE_SOURCES;
export type NzCareStep = { id: string; title: string; detail: string };
export type NzCareGuide = {
  id: string; title: string; summary: string; startWith: string; facts: string[];
  steps: NzCareStep[]; questions: string[]; documents: string[];
  boundary: string; sourceIds: NzCareSourceId[];
};
const step = (id: string, title: string, detail: string): NzCareStep => ({ id, title, detail });
export const NZ_CARE_GUIDES: readonly NzCareGuide[] = [
  {
    id: 'nz-super', title: 'NZ Super: where to start', summary: 'Application timing, residence questions and the paperwork to prepare.',
    startWith: 'Open Work and Income’s NZ Super guide. If the residence rules are unclear, ask their team to check your circumstances.',
    facts: ['NZ Super has age, residence-status and time-lived-in-NZ requirements. The required years depend on date of birth; overseas circumstances can matter.', 'Applications can start in the 12 weeks before your 65th birthday, or after you turn 65. Ask Work and Income about the start date if applying later.'],
    steps: [step('rules', 'Read the official eligibility guide', 'Flag residence history or overseas-pension questions for Work and Income. This checklist cannot decide whether you qualify.'), step('timing', 'Check your application window', 'Use the official application page to choose the online or paper route. Ask what deadlines apply to completing your application.'), step('documents', 'Prepare documents privately', 'Use the agency’s document list. Keep identity, bank and tax information outside DO; provide them only through the official process.'), step('follow-up', 'Plan how to follow up', 'Keep your application confirmation privately. Ask how to supply missing documents and how you will hear the decision.')],
    questions: ['How does my time living overseas affect the residence rules?', 'What evidence do you need, and by when?', 'Do I need to check any overseas pension or other support when applying?'],
    documents: ['Official identity and residence evidence requested by Work and Income.', 'A private timeline of time living overseas and any overseas pension details.', 'The exact document checklist from the official application; no numbers or copies in DO.'],
    boundary: 'Work and Income decides entitlement and payment. No payment amount or personal eligibility is calculated here.', sourceIds: ['super', 'superApply', 'superDocuments'],
  },
  {
    id: 'supergold', title: 'SuperGold & everyday costs', summary: 'Get or replace a card, check local travel and ask about other cost help.',
    startWith: 'Check the official SuperGold card page, then confirm the offer or travel rule with the actual provider.',
    facts: ['A card is sent automatically after NZ Super or Veteran’s Pension approval. People who do not receive these may still apply if they meet the card criteria.', 'A SuperGold Card and a Community Services Card have different purposes. Check whether you need to reapply for a Community Services Card when NZ Super is approved.'],
    steps: [step('card', 'Check your card route', 'Find whether you need to wait for a card, apply, or request a replacement through SuperGold.'), step('travel', 'Check local transport rules', 'Ask your regional operator about off-peak hours, booking requirements and whether a local travel card is needed.'), step('offer', 'Check the offer before paying', 'Confirm that the business participates, what is excluded and when you must show your card.'), step('costs', 'Ask about other cost support', 'Use SuperGold’s official support links to ask about help with essential costs. A discount card does not establish eligibility for another payment.')],
    questions: ['Does this journey qualify, and do I need a local transport card?', 'Does my Community Services Card need a separate application?', 'What do you need to replace a lost card?'],
    documents: ['Keep your card and any requested proof with you when contacting the official service.', 'Check your local operator’s published travel conditions before the journey.'],
    boundary: 'Offers and transport conditions vary. DO does not verify your card, enrol you or guarantee a discount.', sourceIds: ['gold', 'goldOffers'],
  },
  {
    id: 'home-support', title: 'Help at home & a needs assessment', summary: 'Prepare for a NASC conversation about everyday support.',
    startWith: 'Ask your GP about a needs assessment, or use Health NZ’s directory to contact the local needs assessment service.',
    facts: ['NASC means Needs Assessment and Service Coordination. It helps establish support needs and the services available.', 'The person needs to agree to an assessment. You can ask about a support person, whānau involvement, an interpreter and access needs.'],
    steps: [step('priorities', 'Choose the everyday tasks to discuss', 'Think about meals, personal care, getting around and help already available. You do not need to write health details here.'), step('contact', 'Find the local assessment route', 'Ask whether you can contact NASC directly or need a GP referral. Hospital staff can help with the pathway before discharge.'), step('support', 'Prepare for the conversation', 'Ask who can attend with you, what to bring and how to arrange language or accessibility support.'), step('plan', 'Ask for the written care plan', 'Check what is funded, what you pay, when support may start and who to contact if needs change or you disagree.')],
    questions: ['Which support could help me stay at home?', 'What will I pay, and who coordinates the providers?', 'What happens while I wait, and how can I request a reassessment?'],
    documents: ['The referral or appointment letter, if you have one.', 'A private list of daily tasks you want help with and support already in place.', 'Only the health information the assessor requests, shared directly with them.'],
    boundary: 'An assessor determines needs and available support. This guide does not assess safety at home or promise funded services.', sourceIds: ['assessment', 'assessmentDirectory', 'olderPeople'],
  },
  {
    id: 'residential-care', title: 'Rest-home care & funding', summary: 'Separate the care assessment, funding decision and admission agreement.',
    startWith: 'Ask NASC about a needs assessment. Seniorline can explain the route into care and where to ask about funding.',
    facts: ['Care needs and financial support are separate decisions. Work and Income handles the financial means assessment for the Residential Care Subsidy.', 'A Residential Care Loan may be an option in some circumstances. Check the subsidy first and obtain advice on the loan’s terms and effect on your home.'],
    steps: [step('assessment', 'Clarify the assessed level of care', 'Ask NASC what care is appropriate and how to find providers with suitable availability.'), step('funding', 'Get the right application and deadline', 'Ask the assessor and Work and Income which funding process applies. Confirm documents and the date by which they must arrive.'), step('charges', 'Ask for a full written cost breakdown', 'Check standard care, any premium room fee, optional extras, payment while awaiting a decision and charges when circumstances change.'), step('agreement', 'Have the agreement explained before signing', 'Get independent legal or financial advice where needed. Ask who can sign and what permission is needed for whānau to help.')],
    questions: ['What is covered, and what will I pay separately?', 'When would funding start if approved, and what do I pay while waiting?', 'If a loan is suggested, what security and repayment obligations apply?'],
    documents: ['The needs-assessment paperwork and the current funding application form.', 'Evidence of finances requested by Work and Income, kept private and sent directly to them.', 'The proposed admission agreement and a written schedule of all fees.'],
    boundary: 'No means test, asset threshold calculation, provider recommendation or loan decision is made here. Do not change or give away assets based on this guide.', sourceIds: ['residential', 'subsidy', 'loan', 'seniorline'],
  },
  {
    id: 'gp-appointments', title: 'Find a GP & prepare for appointments', summary: 'Enrolment, costs, access needs, referrals and follow-through.',
    startWith: 'Contact a local general practice to ask whether it is enrolling patients. For health advice, call Healthline on 0800 611 116.',
    facts: ['Enrolment and an appointment are separate steps. Ask the practice about eligibility, fees and availability.', 'Healthline offers free health advice by phone, 24 hours a day. In an emergency, call 111.'],
    steps: [step('enrol', 'Check the enrolment process', 'Ask what identification and eligibility evidence the practice requires, and how records are transferred from a previous practice.'), step('access', 'Explain practical support needs', 'Ask about an interpreter, a support person, accessibility, appointment length and transport.'), step('confirm', 'Confirm appointment details and costs', 'Check the date, place, arrival instructions, fees and cancellation rules directly with the provider. Confirm any clinical preparation with them.'), step('next', 'Know the next contact and next step', 'Ask how you will receive results, who follows up a referral, and whom to contact if you have not heard back.')],
    questions: ['Are you enrolling new patients, and what does a visit cost?', 'Can I have communication support or bring whānau?', 'Who should I contact about the referral or results, and when?'],
    documents: ['The practice’s enrolment checklist and appointment/referral letter.', 'A private list of questions and any medicine information your clinician requests; do not enter these in DO.'],
    boundary: 'This is appointment administration, not symptom checking, diagnosis or treatment advice. A provider confirms any booking and clinical instructions.', sourceIds: ['gp', 'healthline'],
  },
  {
    id: 'carer-breaks', title: 'A break for carers & whānau', summary: 'Ask about respite and Carer Support before arranging a break.',
    startWith: 'Ask the person’s needs assessor or healthcare provider about respite and support for their carer.',
    facts: ['Funded respite depends on an assessment and approval. Carer Support and residential respite have their own arrangements.', 'Availability, the support approved and additional charges must be checked before booking.'],
    steps: [step('needs', 'Describe the break you need', 'Consider dates, duration, support needs and what would make the break workable for both people.'), step('approval', 'Check the assessment and allocation', 'Ask about the options, approval, what is funded, expiry dates and the records you need.'), step('arrange', 'Confirm availability and extra costs', 'Ask the approved provider about dates, suitable care and any room or other extra charges before you commit.'), step('handover', 'Prepare the handover with the provider', 'Confirm what to bring, contact arrangements, transport and the return plan directly with the care team.')],
    questions: ['Which respite or Carer Support option might fit?', 'What approval do I need, and when does an allocation expire?', 'What costs or arrangements fall outside the funding?'],
    documents: ['Any approval/allocation letter and the official claim instructions.', 'The provider’s handover checklist, with care information shared directly and with permission.'],
    boundary: 'No allocation, reimbursement, place or booking is guaranteed. Do not pay on the assumption this guide establishes funding.', sourceIds: ['respite', 'carers', 'seniorline'],
  },
  {
    id: 'retirement-village', title: 'Thinking about a retirement village', summary: 'Questions for the operator and your independent lawyer.',
    startWith: 'Ask for the full agreement and disclosure documents, then arrange independent legal advice before signing.',
    facts: ['An Occupation Right Agreement sets out the right to occupy and the terms. The details of each agreement matter.', 'Independent legal advice is required before signing an Occupation Right Agreement. Your lawyer must explain its effect and witness signing.'],
    steps: [step('fit', 'Write down what matters to you', 'Consider location, access, social connection and the support you may want later.'), step('documents', 'Get the full document set', 'Ask for the agreement, disclosure statement, residents’ rights and Code of Practice to review with your lawyer.'), step('costs', 'Ask how the costs work over time', 'Ask about entry, ongoing and exit charges; fee increases; resale and repayment timing; and who pays for repairs.'), step('change', 'Ask what happens if needs change', 'Clarify whether care is available, whether it needs a separate agreement, what happens if a partner stays, and how you can leave.')],
    questions: ['What will I receive back when I leave, and when?', 'Which fees can change or continue after I leave?', 'What care is available, what is separate, and what happens if no place is available?'],
    documents: ['The proposed agreement and all referenced schedules, charges and disclosure documents.', 'A private affordability discussion with an appropriately qualified adviser, if needed.'],
    boundary: 'This is a question guide, not advice on buying into a village or interpreting your contract. Nothing is signed or agreed to in DO.', sourceIds: ['village', 'villageAdvice'],
  },
  {
    id: 'rights-support', title: 'Get support with a care concern', summary: 'Find an independent advocate or confidential elder-abuse support.',
    startWith: 'You can contact the independent Health and Disability Advocacy Service on 0800 555 050 to talk through a care concern.',
    facts: ['The Advocacy Service offers free, independent support with health or disability-service concerns.', 'The Elder Abuse Response Service offers a free, confidential 24-hour helpline: 0800 32 668 65. Call 111 if someone is in immediate danger.'],
    steps: [step('support', 'Choose someone safe to talk to', 'Use the official contact links below. You do not need to record the situation in this workspace.'), step('outline', 'Prepare only what you want to share', 'If safe, keep a private record of what happened, when, and what help or outcome you want. An advocate can help with this.'), step('permission', 'Agree who may be involved', 'Ask the service how consent and privacy work, including when helping someone else.'), step('follow-up', 'Clarify the next step with the service', 'Ask whom you can contact, how to get an update and what options are available. No complaint is sent from here.')],
    questions: ['Can someone help me understand my options?', 'What information do you need and who will see it?', 'Can I have a support person, interpreter or accessible information?'],
    documents: ['Only information you choose to share directly with the support service.', 'Avoid downloading or keeping sensitive notes on a shared device if doing so would put you at risk.'],
    boundary: 'DO does not investigate, send a complaint or contact emergency services. Opening a link or closing this panel does not erase browser history.', sourceIds: ['advocacy', 'elderAbuse', 'emergency'],
  },
];
export type NzCareContact = { id: string; title: string; number: string; href: string; description: string; sourceId: NzCareSourceId };
export const NZ_CARE_CONTACTS: readonly NzCareContact[] = [
  { id: 'emergency', title: 'Emergency: Police, Fire or Ambulance', number: '111', href: 'tel:111', description: 'Call for an emergency response. Do not wait for DO.', sourceId: 'emergency' },
  { id: 'healthline', title: 'Healthline', number: '0800 611 116', href: 'tel:0800611116', description: 'Free health advice, 24 hours a day.', sourceId: 'healthline' },
  { id: 'seniorline', title: 'Seniorline', number: '0800 725 463', href: 'tel:0800725463', description: 'Help finding older-person services. Mon–Fri, 8am–4pm NZ time.', sourceId: 'seniorline' },
  { id: 'police', title: 'Police: non-emergency', number: '105', href: 'tel:105', description: 'For non-emergency reports. Immediate danger: call 111.', sourceId: 'police' },
  { id: 'advocacy', title: 'Independent care advocacy', number: '0800 555 050', href: 'tel:0800555050', description: 'Free help with health and disability-service concerns.', sourceId: 'advocacy' },
  { id: 'elder-abuse', title: 'Elder Abuse Response Service', number: '0800 32 668 65', href: 'tel:08003266865', description: 'Free, confidential support, 24 hours a day.', sourceId: 'elderAbuse' },
];
export function nzCareGuide(id: string): NzCareGuide | undefined { return NZ_CARE_GUIDES.find((guide) => guide.id === id); }
/** Fixed review metadata, never a claim that sources were fetched by this session. */
export function nzCareReviewNeedsChecking(now = new Date()): boolean {
  const age = now.getTime() - Date.parse(`${NZ_CARE_REVIEWED_ON}T00:00:00Z`);
  return !Number.isFinite(age) || age < 0 || age >= 90 * 24 * 60 * 60 * 1_000;
}
export function nextNzCareStep(guide: NzCareGuide, checked: readonly string[]): NzCareStep | undefined {
  return guide.steps.find((item) => !checked.includes(item.id));
}
/** Exports only the chosen static guide and preparation ticks; accepts no personal notes. */
export function nzCareChecklistText(guide: NzCareGuide, checked: readonly string[] = []): string {
  return [
    `DO · ${guide.title}`, 'Private preparation checklist', `Official guidance reviewed: ${NZ_CARE_REVIEWED_ON}. Recheck the official source before acting.`,
    NZ_CARE_BOUNDARY, guide.boundary, '', 'START HERE', guide.startWith, '', 'KEY POINTS', ...guide.facts.map((item) => `- ${item}`),
    '', 'MY PREPARATION', 'Ticks mean preparation reviewed by you, not a service, assessment or application completed.',
    ...guide.steps.map((item) => `[${checked.includes(item.id) ? 'x' : ' '}] ${item.title}\n    ${item.detail}`),
    '', 'QUESTIONS TO ASK', ...guide.questions.map((item) => `- ${item}`), '', 'DOCUMENTS TO KEEP PRIVATELY', ...guide.documents.map((item) => `- ${item}`),
    '', 'OFFICIAL SOURCES', ...guide.sourceIds.map((id) => { const item = NZ_CARE_SOURCES[id]; return `${item.title} · ${item.organisation}\n${item.url}\nReviewed ${item.reviewedOn}`; }),
    '', 'Emergency in New Zealand: call 111. Healthline: 0800 611 116. DO does not monitor emergencies or place calls.',
    `${NZ_CARE_SOURCES.emergency.url}\n${NZ_CARE_SOURCES.healthline.url}`, '', 'Downloaded to this device only. No information has been sent to a provider, agency, model or whānau. Review before sharing this file yourself.',
  ].join('\n');
}
