/**
 * Pilot step-1 identity suggestions — icon only.
 *
 * Deterministic keyword matching, not an AI call: instant and reliable. Te reo
 * labels are no longer auto-suggested (English-first canon, 2026-06-24): a
 * drafted agent ships English-only and the user can add a te reo label by hand
 * if the word genuinely fits. See suggestTeReo below.
 *
 * Icon names map to the keys in components/marketplace/AgentIcon.tsx.
 */

interface IconRule {
  icon: string;
  tags: string[];
}

// Ordered most-specific first; first match wins. Icon keys are the LOCKED CANON
// avatar keys in components/marketplace/AgentIcon.tsx (not lucide names).
const ICON_RULES: IconRule[] = [
  { icon: 'tax', tags: ['tax', 'gst', 'expense', 'account', 'calculate', 'budget', 'finance'] },
  { icon: 'invoice', tags: ['invoice', 'receipt', 'statement', 'reconcile', 'money', 'payment', 'pay'] },
  { icon: 'panui', tags: ['contract', 'lease', 'tenancy', 'agreement', 'terms', 'policy', 'notice', 'letter', 'document', 'read', 'review', 'parse'] },
  { icon: 'shield', tags: ['legal', 'law', 'compliance', 'protect', 'secure', 'privacy', 'risk', 'audit', 'site', 'safety', 'construction', 'hazard', 'cert'] },
  { icon: 'social', tags: ['advert', 'marketing', 'promotion', 'campaign', 'social', 'post', 'caption', 'brand'] },
  { icon: 'hui', tags: ['meeting', 'minutes', 'hui'] },
  { icon: 'mic', tags: ['transcribe', 'record', 'notes', 'dictate'] },
  { icon: 'bell', tags: ['school', 'class', 'teacher', 'student', 'homework', 'ncea', 'study', 'learn'] },
  { icon: 'list', tags: ['meal', 'recipe', 'food', 'dinner', 'kitchen', 'cook', 'fridge', 'pantry', 'grocery', 'shopping', 'checklist'] },
  { icon: 'scribe', tags: ['patient', 'clinical', 'health', 'medical', 'gp', 'doctor', 'nurse', 'diagnos'] },
  { icon: 'whanau', tags: ['family', 'household', 'whānau', 'whanau', 'elder', 'care', 'home'] },
  { icon: 'anchor', tags: ['boat', 'marine', 'harbour', 'sea', 'vessel', 'maritime'] },
  { icon: 'tide', tags: ['tide', 'swell', 'wind', 'forecast', 'weather'] },
  { icon: 'fish', tags: ['fishing', 'fish', 'catch'] },
  { icon: 'container', tags: ['customs', 'import', 'export', 'cargo', 'container', 'freight', 'shipping'] },
  { icon: 'temp', tags: ['temperature', 'cool store', 'food safety', 'fridge log'] },
  { icon: 'roster', tags: ['calendar', 'schedule', 'roster', 'booking', 'appointment', 'reminder', 'shift'] },
  { icon: 'inbox', tags: ['reply', 'message', 'chat', 'inbox', 'email', 'triage', 'customer'] },
  { icon: 'voice', tags: ['phone', 'call', 'support', 'after hours', 'reception'] },
  { icon: 'power', tags: ['power', 'electricity', 'bill', 'energy', 'plan'] },
  { icon: 'koru', tags: ['travel', 'trip', 'flight', 'mileage', 'journey'] },
  { icon: 'store', tags: ['shop', 'retail', 'store', 'pos'] },
  { icon: 'stock', tags: ['stock', 'inventory', 'count', 'shelf'] },
  { icon: 'people', tags: ['team', 'staff', 'people'] },
  { icon: 'brief', tags: ['brief', 'morning', 'daily', 'digest', 'summary'] },
];

export function suggestIcon(text: string): string {
  const hay = text.toLowerCase();
  for (const rule of ICON_RULES) {
    if (rule.tags.some((t) => hay.includes(t))) return rule.icon;
  }
  return 'spark';
}

/**
 * Te reo labels are no longer auto-suggested (2026-06-24 English-first canon:
 * te reo only where it earns its place, and never machine-applied). Always
 * returns '' so a freshly drafted agent ships English-only; the user can add
 * a te reo label by hand if the word is genuinely the right one. The signature
 * is kept so callers (the identity route, the draft form) stay unchanged.
 */
export function suggestTeReo(_text: string): string {
  return '';
}

// Infer a marketplace category from the description so step-5 compliance
// (which keys off category) fires sensibly. Falls back to 'build'.
const CATEGORY_RULES: { tags: string[]; category: string }[] = [
  { tags: ['patient', 'clinical', 'health', 'medical', 'gp', 'nurse', 'hauora'], category: 'healthcare' },
  { tags: ['site', 'construction', 'builder', 'scaffold', 'hazard', 'safety'], category: 'trades' },
  { tags: ['advert', 'marketing', 'campaign', 'caption', 'social', 'brand', 'review'], category: 'creative' },
  { tags: ['lease', 'tenancy', 'contract', 'legal', 'law', 'court', 'dispute', 'consent'], category: 'legal' },
  { tags: ['tax', 'gst', 'invoice', 'payroll', 'wage', 'expense', 'account', 'pay', 'leave'], category: 'financial' },
  { tags: ['family', 'household', 'school', 'whānau', 'whanau', 'kid', 'parent'], category: 'family' },
  { tags: ['marine', 'tide', 'fishing', 'boat', 'sea', 'vessel'], category: 'maritime' },
  { tags: ['privacy', 'audit', 'compliance', 'certif', 'renewal'], category: 'compliance' },
  { tags: ['invoice', 'roster', 'inbox', 'meeting', 'customer', 'supplier', 'shop', 'retail'], category: 'business' },
];

export function inferCategory(text: string): string {
  const hay = text.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.tags.some((t) => hay.includes(t))) return rule.category;
  }
  return 'build';
}

/** Make a URL-safe slug from a name. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip macrons/accents for the slug
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}
