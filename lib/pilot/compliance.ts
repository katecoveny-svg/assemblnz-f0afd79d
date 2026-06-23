/**
 * Pilot compliance map — step 5.
 *
 * From the agent's category and what it handles, Pilot auto-adds the NZ Acts
 * and standards the generated system prompt must cite. This is the codified
 * version of the brief's category → compliance rules, plus a keyword pass so
 * an agent that handles personal data picks up the Privacy Act even if its
 * category doesn't obviously imply it.
 */

export interface ComplianceItem {
  /** short id */
  id: string;
  /** the citation as it should appear in copy and prompts */
  label: string;
  /** one-line why-it-applies, shown to the user */
  reason: string;
}

const ITEMS: Record<string, ComplianceItem> = {
  privacy: {
    id: 'privacy',
    label: 'Privacy Act 2020 + IPP 3A',
    reason: 'It handles personal information, so it must follow the privacy principles and note automated processing.',
  },
  fairTrading: {
    id: 'fairTrading',
    label: 'Fair Trading Act 1986 + ASA codes',
    reason: 'It produces advertising or claims, so they must not mislead.',
  },
  employment: {
    id: 'employment',
    label: 'Holidays Act 2003 + Employment Relations Act 2000',
    reason: 'It touches pay, leave or employment, so it must follow employment law.',
  },
  construction: {
    id: 'construction',
    label: 'Health and Safety at Work Act 2015 + NZS 3910',
    reason: 'It works on construction or site safety, so it must follow HSWA and the standard contract.',
  },
  health: {
    id: 'health',
    label: 'Health and Disability Commissioner code',
    reason: 'It touches patient or health information, so it must follow the HDC code.',
  },
  consumer: {
    id: 'consumer',
    label: 'Consumer Guarantees Act 1993',
    reason: 'It deals with goods, returns or services, so consumer guarantees apply.',
  },
};

const CATEGORY_RULES: Record<string, string[]> = {
  family: ['privacy'],
  business: ['privacy'],
  creative: ['fairTrading'],
  trades: ['construction'],
  healthcare: ['health', 'privacy'],
  legal: ['privacy'],
  compliance: ['privacy'],
  financial: ['privacy'],
};

const KEYWORD_RULES: { tags: string[]; item: string }[] = [
  { tags: ['personal', 'customer detail', 'name', 'address', 'email', 'contact', 'health record', 'patient'], item: 'privacy' },
  { tags: ['advertis', 'marketing', 'promotion', 'claim', 'campaign', 'review', 'social'], item: 'fairTrading' },
  { tags: ['pay', 'payroll', 'leave', 'holiday', 'roster', 'wage', 'employee', 'staff'], item: 'employment' },
  { tags: ['site', 'safety', 'hazard', 'construction', 'builder', 'scaffold'], item: 'construction' },
  { tags: ['patient', 'clinical', 'health', 'medical', 'gp', 'diagnos'], item: 'health' },
  { tags: ['return', 'refund', 'warranty', 'faulty', 'goods', 'guarantee'], item: 'consumer' },
];

/**
 * Resolve the compliance items for a draft. Combines the category default with
 * a keyword scan over the free-text the user has entered.
 */
export function resolveCompliance(category: string, freeText: string): ComplianceItem[] {
  const ids = new Set<string>(CATEGORY_RULES[category] ?? []);
  const hay = freeText.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.tags.some((t) => hay.includes(t))) ids.add(rule.item);
  }
  return [...ids].map((id) => ITEMS[id]).filter(Boolean);
}

/** Just the citation labels (what gets stored on the draft). */
export function complianceLabels(category: string, freeText: string): string[] {
  return resolveCompliance(category, freeText).map((c) => c.label);
}
