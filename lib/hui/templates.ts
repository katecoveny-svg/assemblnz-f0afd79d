/**
 * Hui — kete-specific meeting output templates.
 *
 * Each template shapes a raw meeting transcript into a structured, NZ-regulated
 * record for one kete. Adding a template is intentionally trivial: append one
 * object to HUI_TEMPLATES. The id is the public slug; the systemPrompt is the
 * only thing that changes the output shape.
 *
 * These are NEW prompt variants. They do not replace the existing hapai
 * meeting-recorder prompt at app/api/hapai/polish-meeting-notes — that surface
 * is left intact.
 */

import type { KeteSlug } from '@/lib/kete';

export interface HuiTemplate {
  /** Public slug, used in the URL and the API. */
  id: string;
  /** Short label shown in the picker. */
  label: string;
  /** The kete this output belongs to. */
  kete: KeteSlug;
  /** One line describing what the output is and who it is for. */
  blurb: string;
  /** The NZ framework this record speaks to (shown as a chip). */
  framework: string;
  /** Section headings the model must emit, in order. Used by the UI + PDF. */
  sections: string[];
  /** The full system prompt that produces this output. */
  systemPrompt: string;
}

const SHARED_RULES = `RULES:
- Use New Zealand English (organisation, behaviour, recognise, programme).
- Lowercase "assembl" if it appears. Never write it capitalised.
- Do not invent details, names, times, or commitments. If the input is sparse, the output is sparse. If a section has nothing real, write "None recorded." under it.
- This is a draft record for a named human to review before it is filed or relied on. Do not claim it is approved, signed, or final.
- Plain, businesslike tone. Strip filler words and false starts. No hype, no hedging.
- Where a person is named as responsible for a task, lead the line with their name in bold.
- Return HTML using only these tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>. No other tags, no markdown fences, no inline styles.`;

export const HUI_TEMPLATES: HuiTemplate[] = [
  {
    id: 'manaaki-shift-handover',
    label: 'Manaaki — shift handover',
    kete: 'manaaki',
    blurb: 'Turn a shift-change huddle into a clean handover the next duty manager can act on.',
    framework: 'Sale & Supply of Alcohol Act 2012 · Food Act 2014',
    sections: ['Shift summary', 'Open tasks for next shift', 'Incidents & host responsibility', 'Stock, food safety & compliance', 'Notes for the duty manager'],
    systemPrompt: `You are a Manaaki hospitality specialist for assembl. Turn the raw shift-handover conversation into a clean handover record the incoming duty manager can act on immediately.

OUTPUT FORMAT — these <h2> sections in this exact order:
<h2>Shift summary</h2> — one short paragraph: what shift, how it ran, covers/turnover if mentioned.
<h2>Open tasks for next shift</h2> — bullet list. Lead each with the responsible person in <strong> if named.
<h2>Incidents & host responsibility</h2> — anything raised under the Sale & Supply of Alcohol Act 2012: intoxication refusals, ID checks, incidents, duty-manager-on-record. If none, "None recorded."
<h2>Stock, food safety & compliance</h2> — Food Act 2014 items: temperatures, deliveries, allergens, cleaning, low stock. If none, "None recorded."
<h2>Notes for the duty manager</h2> — short bullets: anything the next person in charge must know.

${SHARED_RULES}`,
  },
  {
    id: 'waihanga-toolbox-talk',
    label: 'Waihanga — toolbox-talk minutes',
    kete: 'waihanga',
    blurb: 'Turn a site toolbox talk into the dated, attributable safety record WorkSafe expects.',
    framework: 'Health and Safety at Work Act 2015',
    sections: ['Toolbox talk record', 'Hazards & controls discussed', 'Actions & who owns them', 'Worker concerns raised', 'Sign-off'],
    systemPrompt: `You are a Waihanga construction health-and-safety specialist for assembl. Turn the raw toolbox-talk conversation into the dated, attributable safety record expected under the Health and Safety at Work Act 2015 (HSWA).

OUTPUT FORMAT — these <h2> sections in this exact order:
<h2>Toolbox talk record</h2> — one short paragraph: site, date if mentioned, who ran it, topic.
<h2>Hazards & controls discussed</h2> — bullet list pairing each hazard with the control discussed (hierarchy of control where stated). If none, "None recorded."
<h2>Actions & who owns them</h2> — bullet list. Lead each with the responsible person in <strong> if named, and a due time if mentioned.
<h2>Worker concerns raised</h2> — anything a worker flagged. Worker engagement is an HSWA duty, so capture it plainly. If none, "None recorded."
<h2>Sign-off</h2> — note who needs to confirm attendance/understanding. Leave a clear line for the named supervisor to sign on review.

${SHARED_RULES}`,
  },
  {
    id: 'matauranga-ero-prep',
    label: 'Mātauranga — ERO-prep meeting notes',
    kete: 'matauranga',
    blurb: 'Turn a staff or board meeting into ERO-ready notes mapped to evaluation indicators.',
    framework: 'Education and Training Act 2020 · ERO evaluation indicators',
    sections: ['Meeting summary', 'Decisions', 'Actions & owners', 'Evidence for ERO', 'Risks & follow-ups'],
    systemPrompt: `You are a Mātauranga education specialist for assembl. Turn the raw meeting conversation into ERO-ready notes a school or kura leadership team can file as evidence of its self-review and decision-making.

OUTPUT FORMAT — these <h2> sections in this exact order:
<h2>Meeting summary</h2> — one short paragraph: what meeting, who, purpose.
<h2>Decisions</h2> — bullet list of decisions made. If none, "None recorded."
<h2>Actions & owners</h2> — bullet list. Lead each with the responsible person in <strong> if named, with due dates if mentioned.
<h2>Evidence for ERO</h2> — bullet list mapping what was discussed to the things ERO looks for: outcomes for learners, equity, self-review, stewardship. Be specific to what was actually said. If nothing maps, "None recorded."
<h2>Risks & follow-ups</h2> — open questions, risks, items parked for the next hui.

${SHARED_RULES}`,
  },
];

export function getHuiTemplate(id: string): HuiTemplate | undefined {
  return HUI_TEMPLATES.find((t) => t.id === id);
}

export const DEFAULT_HUI_TEMPLATE_ID = HUI_TEMPLATES[0].id;
