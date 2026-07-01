/**
 * Bundle registry — the seven V4 simulator worlds (Phase 1C).
 *
 * Generalises the V1 WAIHANGA construction simulator (site-day world) to every
 * bundle: Practice gets a clinic-day, Forge a workshop-day, Hearth a
 * family-week, and so on (spec §7.2.1). Each bundle carries a deterministic
 * keyword router so `route correctness` (rubric axis 5) can be graded offline
 * without an LLM.
 *
 * Routers are intentionally simple and legible: a red-flag flag or keyword
 * always wins over routine intent, matching the spec's rule that a hard-stop
 * check firing outranks routine routing.
 */

import type { BundleConfig, BundleId } from './types';

/** helper: does the input contain any of these keywords? */
function has(input: string, words: string[]): boolean {
  return words.some((w) => input.includes(w));
}

export const BUNDLES: Record<BundleId, BundleConfig> = {
  // ── Construction — the original WAIHANGA world, parameterised ──────────────
  assembler: {
    id: 'assembler',
    label: 'Assembler — Construction',
    category: 'build',
    world: 'site-day',
    eventKinds: ['site_checkin', 'upload_photo', 'submit_tender', 'escalate_hazard'],
    routes: ['site-safety', 'consenting', 'quality', 'project', 'tender'],
    caps: { headcount: 12 },
    route(input, flags) {
      const i = input.toLowerCase();
      if (flags.includes('critical_hazard') || has(i, ['hazard', 'injury', 'incident', 'notifiable', 'unsafe', 'fall'])) {
        return 'site-safety';
      }
      if (has(i, ['consent', 'building code', 'ccc', 'inspection', 'council'])) return 'consenting';
      if (has(i, ['defect', 'snag', 'quality', 'producer statement', 'ps3', 'ps4'])) return 'quality';
      if (has(i, ['tender', 'bid', 'quote for the job', 'submit'])) return 'tender';
      if (has(i, ['programme', 'schedule', 'variation', 'payment claim', 'retention'])) return 'project';
      return null;
    },
  },

  // ── Sales / service — workshop-day ────────────────────────────────────────
  forge: {
    id: 'forge',
    label: 'Forge — Sales & Service',
    category: 'business',
    world: 'workshop-day',
    eventKinds: ['sales_enquiry', 'service_booking', 'quote_request', 'stock_check'],
    routes: ['sales', 'service', 'quote', 'parts', 'escalation'],
    caps: { bays: 4 },
    route(input, flags) {
      const i = input.toLowerCase();
      if (flags.includes('complaint') || has(i, ['refund', 'faulty', 'not fit for purpose', 'consumer guarantees', 'cga', 'complaint'])) {
        return 'escalation';
      }
      if (has(i, ['book', 'service', 'wof', 'repair', 'fix'])) return 'service';
      if (has(i, ['quote', 'estimate', 'how much', 'price'])) return 'quote';
      if (has(i, ['part', 'stock', 'in stock', 'order in'])) return 'parts';
      if (has(i, ['buy', 'interested in', 'looking to purchase', 'new'])) return 'sales';
      return null;
    },
  },

  // ── Clinical — clinic-day (the spec's worked example) ─────────────────────
  practice: {
    id: 'practice',
    label: 'Practice — Clinical',
    category: 'health',
    world: 'clinic-day',
    eventKinds: ['patient_consult', 'triage', 'prescription_query', 'referral'],
    routes: ['gp', 'paediatrics', 'mental-health', 'nursing', 'emergency'],
    caps: { appointments: 24 },
    route(input, flags) {
      const i = input.toLowerCase();
      if (flags.includes('suicidal') || has(i, ["don't see the point", 'no point in being here', 'end it', 'kill myself', 'self-harm'])) {
        return 'mental-health';
      }
      if (flags.includes('emergency') || has(i, ['chest pain', 'not breathing', 'unconscious', 'severe bleeding', 'stroke'])) {
        return 'emergency';
      }
      if (has(i, ['child', 'toddler', '4-year', 'baby', 'infant', 'tamariki'])) return 'paediatrics';
      if (has(i, ['dressing', 'wound', 'blood pressure', 'immunisation', 'jab'])) return 'nursing';
      if (has(i, ['cough', 'rash', 'pain', 'tired', 'sick', 'gp', 'doctor'])) return 'gp';
      return null;
    },
  },

  // ── Legal — matter-day ────────────────────────────────────────────────────
  counsel: {
    id: 'counsel',
    label: 'Counsel — Legal',
    category: 'business',
    world: 'matter-day',
    eventKinds: ['legal_query', 'contract_review', 'dispute', 'compliance_check'],
    routes: ['contract', 'dispute', 'compliance', 'privacy', 'escalation'],
    caps: { matters: 8 },
    route(input, flags) {
      const i = input.toLowerCase();
      if (flags.includes('proceedings') || has(i, ['court date', 'served', 'proceedings', 'litigation', 'sued'])) {
        return 'escalation';
      }
      if (has(i, ['privacy', 'data breach', 'personal information', 'ipp'])) return 'privacy';
      if (has(i, ['contract', 'agreement', 'terms', 'clause', 'lease'])) return 'contract';
      if (has(i, ['dispute', 'owe', 'unpaid', 'disagreement', 'tribunal'])) return 'dispute';
      if (has(i, ['comply', 'regulation', 'obligation', 'do i need to', 'is it legal'])) return 'compliance';
      return null;
    },
  },

  // ── Family — family-week ──────────────────────────────────────────────────
  hearth: {
    id: 'hearth',
    label: 'Hearth — Family',
    category: 'family',
    world: 'family-week',
    eventKinds: ['school_notice', 'appointment', 'budget_query', 'care_task'],
    routes: ['school', 'health', 'money', 'admin', 'wellbeing'],
    caps: { hours: 16 },
    route(input, flags) {
      const i = input.toLowerCase();
      if (flags.includes('distress') || has(i, ['overwhelmed', "can't cope", 'burnt out', 'breaking point'])) {
        return 'wellbeing';
      }
      if (has(i, ['school', 'notice', 'permission slip', 'pānui', 'panui', 'teacher'])) return 'school';
      if (has(i, ['doctor', 'appointment', 'prescription', 'unwell', 'gp'])) return 'health';
      if (has(i, ['budget', 'bill', 'power', 'money', 'afford', 'cost'])) return 'money';
      if (has(i, ['form', 'renew', 'sign', 'admin', 'organise', 'schedule'])) return 'admin';
      return null;
    },
  },

  // ── Creative — studio-day ─────────────────────────────────────────────────
  ensemble: {
    id: 'ensemble',
    label: 'Ensemble — Creative',
    category: 'creative',
    world: 'studio-day',
    eventKinds: ['brief_intake', 'content_request', 'brand_check', 'schedule'],
    routes: ['copy', 'design', 'social', 'brand', 'escalation'],
    caps: { briefs: 6 },
    route(input, flags) {
      const i = input.toLowerCase();
      if (flags.includes('off_brand') || has(i, ['misleading', 'unsubstantiated claim', 'fair trading', 'guarantee results'])) {
        return 'escalation';
      }
      if (has(i, ['logo', 'colour', 'brand guideline', 'on brand', 'on-brand'])) return 'brand';
      if (has(i, ['post', 'instagram', 'facebook', 'social', 'reel'])) return 'social';
      if (has(i, ['write', 'copy', 'headline', 'caption', 'blurb'])) return 'copy';
      if (has(i, ['design', 'poster', 'layout', 'graphic', 'mockup'])) return 'design';
      return null;
    },
  },

  // ── Immigration — caseload-day ────────────────────────────────────────────
  visa: {
    id: 'visa',
    label: 'Visa — Immigration',
    category: 'business',
    world: 'caseload-day',
    eventKinds: ['visa_query', 'document_check', 'eligibility', 'status'],
    routes: ['eligibility', 'documents', 'application', 'appeal', 'escalation'],
    caps: { cases: 10 },
    route(input, flags) {
      const i = input.toLowerCase();
      if (flags.includes('unlawful') || has(i, ['overstayed', 'deportation', 'liable for deportation', 'unlawful'])) {
        return 'escalation';
      }
      if (has(i, ['declined', 'refused', 'appeal', 'reconsideration'])) return 'appeal';
      if (has(i, ['document', 'evidence', 'certificate', 'proof', 'upload'])) return 'documents';
      if (has(i, ['eligible', 'qualify', 'points', 'can i apply', 'which visa'])) return 'eligibility';
      if (has(i, ['apply', 'submit application', 'lodge', 'renew visa'])) return 'application';
      return null;
    },
  },
};

export const BUNDLE_IDS = Object.keys(BUNDLES) as BundleId[];

export function getBundle(id: string): BundleConfig | null {
  return (BUNDLES as Record<string, BundleConfig>)[id] ?? null;
}
