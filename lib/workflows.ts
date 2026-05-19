import type { KeteSlug } from './kete';
import { getKete } from './kete';

export type WorkflowInput = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'datetime-local' | 'select' | 'checkboxes';
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export type Workflow = {
  slug: string;
  title: string;
  kete: KeteSlug;
  description: string;
  timeSavedMin: number;
  priceLabel: string;
  inputs: WorkflowInput[];
  systemPrompt: string;
  outputShape: 'markdown' | 'structured-html' | 'json';
  requirements: string[];
  whatItDoes: string[];
  sampleInput: Record<string, string | string[]>;
  sampleOutput: string;
  runsThisMonth: number;
  live?: boolean;
};

const COMMON_RULES = `RULES:
- NZ English. Macron-correct te reo where used.
- Lowercase "assembl" if mentioned.
- Tone: practical, calm, and specific.
- Do not invent facts that are not in the inputs.
- Return a draft for review by a named person on the user's team.`;

export const workflows: Workflow[] = [
  {
    slug: 'rfi-drafter',
    title: 'RFI drafter',
    kete: 'waihanga',
    description: 'Paste the clarification need, get an RFI with the contract clause cited and a response-by date suggested.',
    timeSavedMin: 15,
    priceLabel: 'Free during pilot',
    inputs: [
      { id: 'project_name', label: 'Project name', type: 'text', required: true, placeholder: 'Hāpai Workshops · 12 Ponsonby Rd renovation' },
      { id: 'contract_ref', label: 'Contract reference', type: 'text', required: true, placeholder: 'NZS 3910:2023 Schedule 1' },
      { id: 'clarification', label: 'Clarification needed', type: 'textarea', required: true, placeholder: "What's unclear?" },
      { id: 'recipient_name', label: 'Recipient name', type: 'text', required: true },
      { id: 'recipient_role', label: 'Recipient role', type: 'select', required: true, options: ['Architect', 'Engineer', 'Client', 'Council', 'Other'] },
    ],
    systemPrompt: `You are Waihanga, assembl's construction specialist. Draft a Request for Information (RFI) from the inputs.

OUTPUT FORMAT (return HTML only, no markdown fences):
<h2>RFI [auto-numbered] - [one-line summary of the question]</h2>
<p><strong>Project:</strong> [project_name]</p>
<p><strong>To:</strong> [recipient_name], [recipient_role]</p>
<p><strong>From:</strong> [Your team - leave blank for the user to fill]</p>
<p><strong>Contract reference:</strong> [contract_ref]</p>
<p><strong>Date:</strong> [today's NZ date in long format]</p>
<p><strong>Response required by:</strong> [today + 7 working days, NZ date]</p>

<h3>Clarification required</h3>
<p>[Restate the clarification as a clear question, professional tone, citing the relevant clause from the contract reference where reasonable.]</p>

<h3>Context</h3>
<p>[Two-sentence context - what is happening on site that triggered this RFI.]</p>

<h3>Impact if not resolved</h3>
<p>[Short statement: programme risk, cost risk, or safety risk - whichever is most relevant.]</p>

${COMMON_RULES}
- Cite the contract clause precisely when the input gives enough context.
- No "URGENT". No exclamation marks.
- If the clarification is unclear, ask a follow-up question in <h3>Suggested clarification before sending</h3>.`,
    outputShape: 'structured-html',
    requirements: [
      "Can't replace the LBP's judgment",
      "Doesn't connect to your project-management software yet",
      "Doesn't send the RFI - produces a draft for you to review and send",
    ],
    whatItDoes: ['Formats a clean RFI', 'Restates the site question clearly', 'Suggests a response date', 'Flags likely programme, cost, or safety impact'],
    sampleInput: {
      project_name: 'Hāpai Workshops · 12 Ponsonby Rd renovation',
      contract_ref: 'NZS 3910:2023 Schedule 1, clause 24A',
      clarification: 'The reflected ceiling plan conflicts with the services drawing above the kitchen pass.',
      recipient_name: 'Aroha Taylor',
      recipient_role: 'Architect',
    },
    sampleOutput: '<h2>RFI 001 - Ceiling service conflict above kitchen pass</h2><p><strong>Project:</strong> Hāpai Workshops · 12 Ponsonby Rd renovation</p><h3>Clarification required</h3><p>Please confirm which drawing takes precedence for the ceiling set-out above the kitchen pass, noting the conflict with clause 24A coordination requirements.</p>',
    runsThisMonth: 184,
    live: true,
  },
  {
    slug: 'allergen-incident-logger',
    title: 'Allergen incident logger',
    kete: 'manaaki',
    description: 'One paragraph describing what happened, get a Food Act 2014-aligned incident record with corrective actions.',
    timeSavedMin: 25,
    priceLabel: 'Free during pilot',
    inputs: [
      { id: 'venue_name', label: 'Venue name', type: 'text', required: true },
      { id: 'date_time', label: 'Date and time', type: 'datetime-local', required: true },
      { id: 'incident_summary', label: 'Incident summary', type: 'textarea', required: true, placeholder: 'What happened, in plain language' },
      { id: 'guest_outcome', label: 'Guest outcome', type: 'select', required: true, options: ['No reaction', 'Mild reaction', 'Serious reaction requiring medical'] },
      { id: 'staff_involved', label: 'Staff involved', type: 'text' },
    ],
    systemPrompt: `You are Manaaki, assembl's hospitality specialist. Generate a Food Act 2014-aligned allergen incident record from the inputs.

OUTPUT FORMAT (return HTML only):
<h2>Allergen incident record - [venue_name] · [date]</h2>
<h3>Incident summary</h3>
<p>[Restate the incident_summary professionally, in chronological order, with the time of day if given.]</p>
<h3>Allergen identified</h3>
<p>[Identify the likely allergen(s). If unclear, say "Allergen not yet confirmed - pending investigation".]</p>
<h3>Guest outcome</h3>
<p>[Restate guest_outcome with care. If "Serious reaction requiring medical", add the MPI notification line.]</p>
<h3>Immediate actions taken</h3>
<ul><li>[Infer 2-4 immediate actions from the summary]</li></ul>
<h3>Corrective actions for the Food Control Plan</h3>
<ul><li>[2-4 corrective actions appropriate to the allergen and incident type]</li></ul>
<h3>Sign-off required</h3>
<p>Verified by: [Duty Manager or Food Safety Officer name] · Date: [today]</p>

${COMMON_RULES}
- Always include the MPI notification line for serious reactions.
- No blame language.`,
    outputShape: 'structured-html',
    requirements: ["Doesn't notify MPI for you - flags when notification is required", "Doesn't replace a Duty Manager's sign-off", "Doesn't access your existing FCP system yet"],
    whatItDoes: ['Turns messy notes into an incident record', 'Flags notifiable serious reactions', 'Suggests corrective actions', 'Creates a sign-off block'],
    sampleInput: {
      venue_name: 'Harbour Room',
      date_time: '2026-05-19T18:30',
      incident_summary: 'Guest ordered dairy-free dessert but was served the standard panna cotta.',
      guest_outcome: 'Mild reaction',
    },
    sampleOutput: '<h2>Allergen incident record - Harbour Room · 19 May 2026</h2><h3>Incident summary</h3><p>A guest who ordered a dairy-free dessert was served the standard panna cotta.</p><h3>Corrective actions for the Food Control Plan</h3><ul><li>Review dessert allergen marking with front-of-house and kitchen staff.</li></ul>',
    runsThisMonth: 141,
    live: true,
  },
  {
    slug: 'customs-entry-drafter',
    title: 'Customs entry drafter',
    kete: 'pikau',
    description: 'Paste the commercial invoice details, get a tariff-coded entry draft ready for your broker.',
    timeSavedMin: 30,
    priceLabel: 'Industry Pack',
    inputs: [
      { id: 'importer_name', label: 'Importer name', type: 'text', required: true },
      { id: 'supplier_name', label: 'Supplier name', type: 'text', required: true },
      { id: 'country_of_origin', label: 'Country of origin', type: 'text', required: true },
      { id: 'goods_description', label: 'Goods description', type: 'textarea', required: true },
      { id: 'invoice_value_nzd', label: 'Invoice value NZD', type: 'number', required: true },
      { id: 'incoterm', label: 'Incoterm', type: 'select', required: true, options: ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DPU', 'DDP'] },
    ],
    systemPrompt: `You are Pīkau, assembl's logistics specialist. Draft a customs entry summary from the inputs, ready for review by a licensed customs broker.

OUTPUT FORMAT (return HTML only):
<h2>Customs entry draft - [importer_name]</h2>
<h3>Importer</h3><p>[importer_name]</p>
<h3>Supplier and origin</h3><p>[supplier_name] · [country_of_origin]</p>
<h3>Goods description</h3><p>[Polished version of goods_description.]</p>
<h3>Tariff classification (recommended)</h3><p>HS code: [Best-guess 4-6 digit HS code, or "broker to classify"]</p><p><strong>Broker verification required.</strong></p>
<h3>Customs value</h3><p>NZD [invoice_value_nzd], based on [incoterm] terms.</p>
<h3>Likely duty / GST exposure</h3><p>[Plain-English note. GST at 15% applies on customs value plus duty.]</p>
<h3>Documents the broker will need</h3><ul><li>Commercial invoice</li><li>Packing list</li><li>Bill of lading or airway bill</li><li>Certificate of origin if claiming preference</li></ul>

${COMMON_RULES}
- This is a draft only. Always state "broker verification required".
- If goods are food, plants, animal products, or wood: add an MPI biosecurity flag.`,
    outputShape: 'structured-html',
    requirements: ["Doesn't submit the entry to NZ Customs - broker does that", 'HS codes are recommendations, not authoritative', "Doesn't check FTA preferences against signed certificates of origin"],
    whatItDoes: ['Structures commercial invoice details', 'Suggests a classification path', 'Flags valuation adjustments', 'Lists broker document requirements'],
    sampleInput: {
      importer_name: 'North Shore Imports',
      supplier_name: 'Shenzhen Light Co',
      country_of_origin: 'China',
      goods_description: 'LED strip lighting kits for retail display shelves',
      invoice_value_nzd: '12800',
      incoterm: 'FOB',
    },
    sampleOutput: '<h2>Customs entry draft - North Shore Imports</h2><h3>Tariff classification (recommended)</h3><p>HS code: broker to classify. The description suggests electrical lighting equipment, but the exact code depends on kit components.</p><p><strong>Broker verification required.</strong></p>',
    runsThisMonth: 97,
    live: true,
  },
  {
    slug: 'wof-readiness-check',
    title: 'WoF readiness check',
    kete: 'arataki',
    description: 'Vehicle details in, tailored checklist of the things most likely to fail your next inspection.',
    timeSavedMin: 10,
    priceLabel: 'Free during pilot',
    inputs: [
      { id: 'make', label: 'Make', type: 'text', required: true },
      { id: 'model', label: 'Model', type: 'text', required: true },
      { id: 'year', label: 'Year', type: 'number', required: true },
      { id: 'last_wof_date', label: 'Last WoF date', type: 'date' },
      { id: 'recent_issues', label: 'Recent issues', type: 'textarea', placeholder: "Anything you've noticed" },
    ],
    systemPrompt: `You are Arataki, assembl's automotive and fleet specialist. Create a WoF readiness checklist from the inputs.

Return HTML only with sections for lights, tyres, glazing, seatbelts, brakes, steering/suspension, structure, and recent issues. Reference NZTA VIRM categories in plain English. ${COMMON_RULES}`,
    outputShape: 'structured-html',
    requirements: ["Doesn't replace an actual WoF inspection", "Doesn't guarantee a pass"],
    whatItDoes: ['Tailors checks by vehicle age', 'Highlights common fail items', 'Turns recent issues into inspection prompts'],
    sampleInput: { make: 'Toyota', model: 'Hiace', year: '2014', recent_issues: 'Left brake light intermittent' },
    sampleOutput: '<h2>WoF readiness checklist - 2014 Toyota Hiace</h2><h3>Check first</h3><ul><li>Left brake light: repair before inspection.</li><li>Tyres: check tread depth and sidewall damage.</li></ul>',
    runsThisMonth: 126,
    live: true,
  },
  {
    slug: 'caption-batch-composer',
    title: 'Caption batch composer',
    kete: 'auaha',
    description: "One brief in, captions tuned for each platform's rhythm out.",
    timeSavedMin: 20,
    priceLabel: 'Free during pilot',
    inputs: [
      { id: 'topic', label: 'Topic or campaign brief', type: 'textarea', required: true },
      { id: 'brand_voice_notes', label: 'Brand voice notes', type: 'textarea' },
      { id: 'platforms', label: 'Platforms', type: 'checkboxes', required: true, options: ['Instagram', 'LinkedIn', 'X', 'Facebook', 'TikTok'] },
    ],
    systemPrompt: `You are Auaha, assembl's creative specialist. Compose caption options for each selected platform.

Return HTML only. Use one <h3> per platform with two caption options and one short note on why the rhythm fits. Keep it concise, human, and specific. Avoid generic hype, filler, and obvious template language. ${COMMON_RULES}`,
    outputShape: 'structured-html',
    requirements: ["Doesn't post for you", "Doesn't access your existing brand-voice guidelines unless pasted in"],
    whatItDoes: ['Writes per-platform captions', 'Adapts tone to the supplied voice notes', 'Gives options without bloating the batch'],
    sampleInput: { topic: 'Launch a free meeting-notes cleaner for busy operators', platforms: ['LinkedIn', 'Instagram'] },
    sampleOutput: '<h2>Caption batch</h2><h3>LinkedIn</h3><p>Meetings are expensive enough without turning the notes into a second meeting...</p>',
    runsThisMonth: 211,
    live: true,
  },
  {
    slug: 'school-notice-rewriter',
    title: 'School notice rewriter',
    kete: 'ako',
    description: 'Paste a long notice, get short whānau-friendly versions for each year group you select.',
    timeSavedMin: 25,
    priceLabel: 'Free during pilot',
    inputs: [
      { id: 'original_notice', label: 'Original notice', type: 'textarea', required: true },
      { id: 'target_year_groups', label: 'Target year groups', type: 'checkboxes', required: true, options: ['Year 0-3', 'Year 4-6', 'Year 7-8', 'Year 9-13'] },
      { id: 'school_voice_notes', label: 'School voice notes', type: 'textarea', placeholder: 'Warm but firm, formal, etc.' },
    ],
    systemPrompt: `You are Ako, assembl's education specialist. Rewrite the notice for each selected year group.

Return HTML only. Put action items at the top, then a short whānau-friendly version for each year group. Keep the language warm, clear, and age-appropriate. ${COMMON_RULES}`,
    outputShape: 'structured-html',
    requirements: ["Doesn't send the notice", "Doesn't access your school management system"],
    whatItDoes: ['Shortens long notices', 'Splits versions by year group', 'Pulls action items to the top'],
    sampleInput: { original_notice: 'Reminder: athletics day is Friday. Students need hats, water, lunch, and house colours.', target_year_groups: ['Year 0-3', 'Year 4-6'] },
    sampleOutput: '<h2>Whānau notice versions</h2><h3>Actions</h3><ul><li>Pack a hat, water bottle, lunch, and house-colour clothing.</li></ul>',
    runsThisMonth: 102,
    live: true,
  },
  {
    slug: 'source-verifier',
    title: 'Source verifier',
    kete: 'matauranga',
    description: "Paste a claim and a document. Find out where the claim is supported, where it isn't, and what's missing.",
    timeSavedMin: 40,
    priceLabel: 'Industry Pack',
    inputs: [
      { id: 'claim', label: 'Claim to verify', type: 'textarea', required: true },
      { id: 'source_document', label: 'Source document', type: 'textarea', required: true, placeholder: 'Paste the full text or excerpt' },
    ],
    systemPrompt: `You are Mātauranga, assembl's knowledge specialist. Verify a claim against the source document.

Return HTML only with <h3>Where supported</h3>, <h3>Where unsupported</h3>, and <h3>Missing evidence</h3>. Use short direct quotes from the pasted source where helpful. Do not use external knowledge. ${COMMON_RULES}`,
    outputShape: 'structured-html',
    requirements: ["Only works with text you paste in - doesn't access external databases", "Can't verify academic credentials of the source"],
    whatItDoes: ['Checks a claim against a pasted source', 'Separates supported and unsupported parts', 'Names missing evidence'],
    sampleInput: { claim: 'The proposal commits to weekly reporting and named reviewer sign-off.', source_document: 'The supplier will provide monthly reports. Final outputs will be reviewed by the project sponsor.' },
    sampleOutput: '<h2>Source verification</h2><h3>Where supported</h3><p>Named review is partly supported: "reviewed by the project sponsor".</p><h3>Where unsupported</h3><p>Weekly reporting is not supported; the source says monthly reports.</p>',
    runsThisMonth: 88,
    live: true,
  },
  {
    slug: 'return-triage',
    title: 'Return triage',
    kete: 'hoko',
    description: 'Customer return request in, decision and reply draft out, within CGA-safe boundaries.',
    timeSavedMin: 12,
    priceLabel: 'Free during pilot',
    inputs: [
      { id: 'customer_message', label: 'Customer message', type: 'textarea', required: true },
      { id: 'purchase_date', label: 'Purchase date', type: 'date', required: true },
      { id: 'product_type', label: 'Product type', type: 'select', required: true, options: ['Consumer goods', 'Vehicle', 'Service', 'Other'] },
      { id: 'your_policy_summary', label: 'Your policy summary', type: 'textarea' },
    ],
    systemPrompt: `You are Hoko, assembl's commerce specialist. Triage the return request under the Consumer Guarantees Act 1993 and Fair Trading Act 1986.

Return HTML only. Decide: approve, partial remedy, or decline. Use the more generous rule: whichever favours the customer between statutory rights and the store policy. Include a customer reply draft. ${COMMON_RULES}`,
    outputShape: 'structured-html',
    requirements: ["Doesn't process the refund", "Doesn't replace a manager's discretion on edge cases"],
    whatItDoes: ['Classifies the return request', 'Applies the more generous rule', 'Drafts a customer reply'],
    sampleInput: { customer_message: 'The zip broke after two wears. I bought the jacket last month.', purchase_date: '2026-04-20', product_type: 'Consumer goods' },
    sampleOutput: '<h2>Return triage - approve remedy</h2><p>The reported fault appears to be a durability issue within a short period after purchase.</p><h3>Reply draft</h3><p>Thanks for letting us know...</p>',
    runsThisMonth: 173,
    live: true,
  },
  {
    slug: 'school-notice-parser',
    title: 'School notice parser',
    kete: 'toro',
    description: 'Paste the notice from school. Get the dates, gear list, and what your whānau need to do.',
    timeSavedMin: 8,
    priceLabel: 'Free in Tōro ($29/mo)',
    inputs: [
      { id: 'notice_text', label: 'Notice text', type: 'textarea', required: true },
      { id: 'child_name', label: 'Child name', type: 'text' },
    ],
    systemPrompt: `You are Tōro, assembl's whānau specialist. Parse a school notice into a clear family action plan.

Return HTML only with <h3>Key dates</h3>, <h3>What to bring</h3>, <h3>Actions by whānau</h3>, <h3>Cost or payment required</h3>, and <h3>Calendar-ready summary</h3>. ${COMMON_RULES}`,
    outputShape: 'structured-html',
    requirements: ["Doesn't add to your calendar automatically", "Doesn't pay for the trip - just flags the cost"],
    whatItDoes: ['Extracts dates', 'Builds a gear list', 'Names actions and costs', 'Creates a calendar-ready summary'],
    sampleInput: { notice_text: 'Camp is on 12 June. Bring sleeping bag, raincoat, lunch, and $18 by Friday.', child_name: 'Mika' },
    sampleOutput: '<h2>School notice parsed</h2><h3>Key dates</h3><ul><li>12 June - camp day</li><li>Friday - $18 payment due</li></ul><h3>What to bring</h3><ul><li>Sleeping bag</li><li>Raincoat</li><li>Lunch</li></ul>',
    runsThisMonth: 229,
    live: true,
  },
];

const planned: Array<Omit<Workflow, 'inputs' | 'systemPrompt' | 'outputShape' | 'whatItDoes' | 'sampleInput' | 'sampleOutput' | 'runsThisMonth' | 'live'>> = [
  { slug: 'variation-pack-builder', title: 'Variation pack builder', kete: 'waihanga', description: 'Change request and reason in, variation pack with CCA 2002 timing check out.', timeSavedMin: 35, priceLabel: 'Industry Pack', requirements: ["Doesn't submit the variation", "Doesn't replace QS review"] },
  { slug: 'site-observation-logger', title: 'Site observation logger', kete: 'waihanga', description: 'Voice or text in, structured site-observation record out, filed against the project.', timeSavedMin: 12, priceLabel: 'Free during pilot', requirements: ["Doesn't file into your PM tool yet"] },
  { slug: 'guest-reply-drafter', title: 'Guest reply drafter', kete: 'manaaki', description: "Paste a complaint or request, get a reply in your venue's voice.", timeSavedMin: 10, priceLabel: 'Free during pilot', requirements: ["Doesn't send the reply"] },
  { slug: 'supplier-comparison-manaaki', title: 'Supplier comparison', kete: 'manaaki', description: 'Paste two or three quotes, get a side-by-side with the better choice flagged.', timeSavedMin: 30, priceLabel: 'Industry Pack', requirements: ["Doesn't place orders"] },
  { slug: 'freight-exception-report', title: 'Freight exception report', kete: 'pikau', description: 'Cargo issue and carrier comms in, structured exception report with the trail out.', timeSavedMin: 20, priceLabel: 'Industry Pack', requirements: ["Doesn't lodge carrier claims"] },
  { slug: 'carrier-compliance-review', title: 'Carrier compliance review', kete: 'pikau', description: "Paste a carrier's monthly performance, get a compliance summary against your SLA.", timeSavedMin: 45, priceLabel: 'Industry Pack', requirements: ["Needs your SLA pasted in"] },
  { slug: 'cga-disclosure-generator', title: 'CGA disclosure generator', kete: 'arataki', description: 'Inputs from a vehicle sale, output a CGA-compliant disclosure statement.', timeSavedMin: 18, priceLabel: 'Industry Pack', requirements: ["Doesn't replace dealer sign-off"] },
  { slug: 'fleet-defect-log', title: 'Fleet defect log', kete: 'arataki', description: 'Paste a defect notification, get a structured fleet-compliance entry.', timeSavedMin: 12, priceLabel: 'Free during pilot', requirements: ["Doesn't update your fleet system yet"] },
  { slug: 'brief-drafter', title: 'Brief drafter', kete: 'auaha', description: 'Eight fields in, a single-page creative brief out, downloadable as PDF.', timeSavedMin: 30, priceLabel: 'Free during pilot', requirements: ["Doesn't create assets"] },
  { slug: 'tagline-shortlist', title: 'Tagline shortlist', kete: 'auaha', description: 'Brand and audience in, ten tagline candidates across five styles out.', timeSavedMin: 20, priceLabel: 'Free during pilot', requirements: ["Doesn't trademark-check the shortlist"] },
  { slug: 'assessment-summary', title: 'Assessment summary', kete: 'ako', description: 'Observations and assessments in, Te Whāriki-aligned summary out.', timeSavedMin: 35, priceLabel: 'Industry Pack', requirements: ["Needs educator review"] },
  { slug: 'parent-update-drafter', title: 'Parent update drafter', kete: 'ako', description: 'Centre or class events in, warm parent update out.', timeSavedMin: 15, priceLabel: 'Free during pilot', requirements: ["Doesn't send through your SMS"] },
  { slug: 'document-comparison', title: 'Document comparison', kete: 'matauranga', description: 'Two docs in, side-by-side of agreements and disagreements out.', timeSavedMin: 45, priceLabel: 'Industry Pack', requirements: ["Only compares pasted text"] },
  { slug: 'submission-drafter', title: 'Submission drafter', kete: 'matauranga', description: 'Consultation question and your position in, structured submission out.', timeSavedMin: 60, priceLabel: 'Industry Pack', requirements: ["Doesn't submit to the consultation portal"] },
  { slug: 'customer-reply-drafter', title: 'Customer reply drafter', kete: 'hoko', description: "Paste the message, get a reply in your shop's voice within CGA / FTA limits.", timeSavedMin: 10, priceLabel: 'Free during pilot', requirements: ["Doesn't send the reply"] },
  { slug: 'supplier-offer-comparison', title: 'Supplier offer comparison', kete: 'hoko', description: 'Paste supplier offers, get a side-by-side with terms-and-conditions diffs flagged.', timeSavedMin: 35, priceLabel: 'Industry Pack', requirements: ["Doesn't negotiate for you"] },
  { slug: 'weekly-plan', title: 'Weekly plan', kete: 'toro', description: "What's on this week in, structured family plan and meal plan out.", timeSavedMin: 25, priceLabel: 'Free in Tōro ($29/mo)', requirements: ["Doesn't book anything automatically"] },
  { slug: 'gear-list-generator', title: 'Gear list generator', kete: 'toro', description: 'Trip or event in, packing list and budget out.', timeSavedMin: 12, priceLabel: 'Free in Tōro ($29/mo)', requirements: ["Doesn't buy gear"] },
];

export const allWorkflows: Workflow[] = [
  ...workflows,
  ...planned.map((workflow, index) => ({
    ...workflow,
    inputs: [
      { id: 'brief', label: 'Brief', type: 'textarea' as const, required: true, placeholder: 'Paste the work your team would usually do manually' },
    ],
    systemPrompt: `You are ${getKete(workflow.kete).name}, assembl's ${getKete(workflow.kete).industry.toLowerCase()} specialist. Draft the ${workflow.title} workflow output from the user's brief. Return HTML only. ${COMMON_RULES}`,
    outputShape: 'structured-html' as const,
    whatItDoes: ['Structures the task', 'Drafts a review-ready output', 'Keeps the admin layer moving'],
    sampleInput: { brief: workflow.description },
    sampleOutput: `<h2>${workflow.title} draft</h2><p>${workflow.description}</p><h3>Reviewer note</h3><p>Check the details, edit where needed, then sign off.</p>`,
    runsThisMonth: 40 + index * 7,
    live: false,
  })),
];

export const featuredWorkflowSlugs = [
  'rfi-drafter',
  'allergen-incident-logger',
  'customs-entry-drafter',
  'caption-batch-composer',
  'school-notice-parser',
  'return-triage',
] as const;

export function getWorkflow(slug: string): Workflow | undefined {
  return allWorkflows.find((workflow) => workflow.slug === slug);
}

export function getWorkflowsByKete(kete: KeteSlug): Workflow[] {
  return allWorkflows.filter((workflow) => workflow.kete === kete);
}

export function workflowMessage(workflow: Workflow, inputs: Record<string, unknown>) {
  return [
    `Workflow: ${workflow.title}`,
    `Kete: ${getKete(workflow.kete).name}`,
    'Inputs:',
    ...workflow.inputs.map((input) => `${input.label}: ${formatInputValue(inputs[input.id])}`),
  ].join('\n');
}

function formatInputValue(value: unknown) {
  if (Array.isArray(value)) return value.join(', ');
  if (value === undefined || value === null || value === '') return '[not supplied]';
  return String(value);
}
