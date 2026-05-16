/**
 * Evidence pack canonical spec.
 * Spec: voyage-evidence-craft.md
 *
 * Every Assembl evidence pack is, at heart, a serialised value of
 * `EvidencePack` below. The PDF render, the in-product drawer, the
 * verifier route, and the audit-log row all derive from this shape.
 *
 * Two invariants this file exists to enforce:
 *   1. The canonical JSON form is deterministic — same input bytes ⇒
 *      same hash. We sort keys, normalise dates, and never let free
 *      HTML in via body content.
 *   2. The section templates are canonical. A monthly posture pack from
 *      Waihanga and a monthly posture pack from Pīkau have the same
 *      section ids and order, so they read as members of one family.
 */

import type { KeteSlug } from '@/lib/kete';

// ─────────────────────────────────────────────────────────────────────────────
// Shape
// ─────────────────────────────────────────────────────────────────────────────

export type EvidencePackKind = 'posture' | 'workflow' | 'verifier';
export type EvidencePackStatus = 'draft' | 'sealed';

export interface BilingualText {
  en: string;
  /** Te reo Māori. Equal weight to en. Never bracketed in render. */
  mi: string;
}

export interface PackSubject {
  /** 'project' | 'client_seat' | 'case' | 'invoice' | 'period' | … */
  kind: string;
  /** Operator-side ref — project id, client seat id, period code. */
  ref: string;
  /** Human label rendered on the cover. */
  label: string;
}

export interface Reviewer {
  name: string;
  role: string;
  email: string;
}

export interface AgentSection {
  /** Agent id (matches src/lib/agentSlugMap.ts canonical id). */
  agent: string;
  /** Section ids this agent drafted. */
  sectionIds: string[];
}

export interface Citation {
  /** 1-indexed footnote mark used in body. */
  n: number;
  /** Short reference, e.g. 'Building Act 2004 s 14B(1)(a)'. */
  ref: string;
  /** One-line context — what this citation supports. */
  context: string;
  /** Verifiable URL where the source lives. */
  url?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Body block kinds
// ─────────────────────────────────────────────────────────────────────────────

export type Block =
  | { kind: 'paragraph'; text: string; cites?: number[] }
  | { kind: 'list'; items: string[]; cites?: number[] }
  | { kind: 'pullQuote'; text: string; attributedTo?: string }
  | { kind: 'callout'; tone: 'pounamu' | 'draft' | 'sealed'; text: string }
  | { kind: 'table'; columns: string[]; rows: string[][]; caption?: string }
  | { kind: 'signature'; signedBy: string; signedAt: string };

export interface Section {
  id: string;
  title: BilingualText;
  body: Block[];
  draftedBy: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hash chain
// ─────────────────────────────────────────────────────────────────────────────

export interface HashChain {
  prevHash: string;
  thisHash: string;
  /** ISO 8601 in NZST (UTC+12 or UTC+13 in NZDT). null while draft. */
  sealedAt: string | null;
  /** Public verifier URL — '/evidence/verify/:thisHash'. */
  verifierUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// The pack itself
// ─────────────────────────────────────────────────────────────────────────────

export interface EvidencePack {
  id: string;
  tenantId: string;
  kete: KeteSlug;
  kind: EvidencePackKind;
  title: BilingualText;
  subject: PackSubject;
  /** ISO 8601, always serialised in NZST. */
  issuedAt: string;
  status: EvidencePackStatus;
  reviewer: Reviewer | null;
  agentLoadout: AgentSection[];
  sections: Section[];
  citations: Citation[];
  hashChain: HashChain;
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical JSON — deterministic, hashable
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a deterministic string representation of an EvidencePack
 * suitable for SHA-256 hashing. Object keys are sorted; undefined values
 * are dropped; numbers and strings serialise as JSON.stringify would.
 *
 * The hash chain field is excluded — the hash is over the pack content,
 * not its own hash.
 */
export function canonicalJson(pack: EvidencePack): string {
  const { hashChain: _omit, ...content } = pack;
  return stableStringify(content);
}

function stableStringify(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map(stableStringify).join(',') + ']';
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
    return (
      '{' +
      keys
        .map((k) => JSON.stringify(k) + ':' + stableStringify(obj[k]))
        .join(',') +
      '}'
    );
  }
  return 'null';
}

/** SHA-256 over the canonical JSON form. Browser + Deno crypto. */
export async function hashPack(pack: EvidencePack): Promise<string> {
  const data = new TextEncoder().encode(canonicalJson(pack));
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical section templates
// ─────────────────────────────────────────────────────────────────────────────
// Section ids are stable across kete so packs of the same kind read as
// members of one family. New kinds can be added; existing kinds cannot
// renumber.

export interface SectionTemplate {
  id: string;
  title: BilingualText;
  description: string;
  /** May appear empty (no flags) but cannot be omitted. */
  required: boolean;
}

export const POSTURE_SECTIONS: SectionTemplate[] = [
  {
    id: 'tuapapa',
    title: { en: 'Foundation', mi: 'Tūāpapa' },
    description: 'What this pack is, what period, who it is for.',
    required: true,
  },
  {
    id: 'mahi-i-mahia',
    title: { en: 'Work completed', mi: 'Mahi i mahia' },
    description: 'What the operator and agents did this period.',
    required: true,
  },
  {
    id: 'rehita',
    title: { en: 'Ledger', mi: 'Rēhita' },
    description: 'Data appendix — expenses, contracts, sessions, lodgements.',
    required: true,
  },
  {
    id: 'whakatupato',
    title: { en: 'Flags', mi: 'Whakatūpato' },
    description: 'Escalations triggered, risks accepted, drift observed.',
    required: true,
  },
  {
    id: 'anga-whakamua',
    title: { en: 'Forward posture', mi: 'Anga whakamua' },
    description: 'Next period plan, decisions deferred.',
    required: true,
  },
  {
    id: 'whakapono',
    title: { en: 'Attestation', mi: 'Whakapono' },
    description: 'Named reviewer sign-off.',
    required: true,
  },
  {
    id: 'pou-taunaki',
    title: { en: 'Citations', mi: 'Pou taunaki' },
    description: 'Every citation, numbered.',
    required: true,
  },
];

export const WORKFLOW_SECTIONS: SectionTemplate[] = [
  {
    id: 'tuapapa',
    title: { en: 'Foundation', mi: 'Tūāpapa' },
    description: 'What this pack is, what workflow, who it is for.',
    required: true,
  },
  {
    id: 'te-ahua-o-te-mahi',
    title: { en: 'The work itself', mi: 'Te āhua o te mahi' },
    description: 'The actual deliverable, in body form.',
    required: true,
  },
  {
    id: 'whakaaro',
    title: { en: 'Reasoning', mi: 'Whakaaro' },
    description: 'Condensed agent thinking trace, cited.',
    required: true,
  },
  {
    id: 'whakatupato',
    title: { en: 'Flags', mi: 'Whakatūpato' },
    description: 'Escalations triggered, risks accepted.',
    required: true,
  },
  {
    id: 'whakapono',
    title: { en: 'Attestation', mi: 'Whakapono' },
    description: 'Named reviewer sign-off.',
    required: true,
  },
  {
    id: 'pou-taunaki',
    title: { en: 'Citations', mi: 'Pou taunaki' },
    description: 'Every citation, numbered.',
    required: true,
  },
];

export const VERIFIER_SECTIONS: SectionTemplate[] = [
  {
    id: 'tahuhu',
    title: { en: 'Spine', mi: 'Tāhuhu' },
    description: 'What was sealed, when, by whom.',
    required: true,
  },
  {
    id: 'mokihi',
    title: { en: 'Chain', mi: 'Mōkihi' },
    description: 'Prev hash, this hash, verifier URL.',
    required: true,
  },
  {
    id: 'pou-taunaki',
    title: { en: 'Citations', mi: 'Pou taunaki' },
    description: 'The original pack the proof refers to.',
    required: true,
  },
];

export function templateFor(kind: EvidencePackKind): SectionTemplate[] {
  switch (kind) {
    case 'posture':
      return POSTURE_SECTIONS;
    case 'workflow':
      return WORKFLOW_SECTIONS;
    case 'verifier':
      return VERIFIER_SECTIONS;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationIssue {
  severity: 'error' | 'warning';
  path: string;
  message: string;
}

/**
 * Lightweight validator. Runs before seal. Catches the most common defects:
 *   - missing bilingual labels
 *   - missing reviewer on sealed status
 *   - section template mismatch
 *   - claim without citation in a non-flag section
 *   - Machine tells and hedge words (basic regex pass — the LLM rewrite handles
 *     the rest)
 */
export function validatePack(pack: EvidencePack): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!pack.title.en || !pack.title.mi) {
    issues.push({
      severity: 'error',
      path: 'title',
      message: 'Title must have both en and mi.',
    });
  }

  if (pack.status === 'sealed' && !pack.reviewer) {
    issues.push({
      severity: 'error',
      path: 'reviewer',
      message: 'Sealed pack requires a named reviewer.',
    });
  }

  if (pack.status === 'sealed' && !pack.hashChain.sealedAt) {
    issues.push({
      severity: 'error',
      path: 'hashChain.sealedAt',
      message: 'Sealed pack requires a sealedAt timestamp.',
    });
  }

  const template = templateFor(pack.kind);
  const expectedIds = template.map((t) => t.id);
  const actualIds = pack.sections.map((s) => s.id);
  for (const want of expectedIds) {
    if (!actualIds.includes(want)) {
      issues.push({
        severity: 'error',
        path: `sections.${want}`,
        message: `Required section "${want}" missing for kind "${pack.kind}".`,
      });
    }
  }

  // Voice — basic regex pass. The full pass is the linter in §6.
  const tells = /\b(as an A[Ii]|I hope this helps|let'?s explore|in summary|exciting|amazing|delighted|thrilled)\b/i;
  const hedges = /\b(might|seems to|appears to|could potentially|perhaps)\b/i;
  pack.sections.forEach((section) => {
    section.body.forEach((block, i) => {
      const text =
        block.kind === 'paragraph' ? block.text :
        block.kind === 'list' ? block.items.join(' ') :
        block.kind === 'pullQuote' ? block.text :
        block.kind === 'callout' ? block.text :
        '';
      if (tells.test(text)) {
        issues.push({
          severity: 'error',
          path: `sections.${section.id}.body[${i}]`,
          message: 'Machine tell detected. Rewrite or remove.',
        });
      }
      if (hedges.test(text)) {
        issues.push({
          severity: 'warning',
          path: `sections.${section.id}.body[${i}]`,
          message: 'Hedge word detected. Evidence packs do not hedge.',
        });
      }
    });

    // Every non-flag section should cite at least once.
    if (section.id !== 'whakatupato' && section.id !== 'whakapono' && section.id !== 'tahuhu' && section.id !== 'mokihi') {
      const hasCitation = section.body.some((b) => 'cites' in b && (b.cites?.length ?? 0) > 0);
      if (!hasCitation) {
        issues.push({
          severity: 'warning',
          path: `sections.${section.id}`,
          message: 'Section has no citations. Body claims must cite.',
        });
      }
    }
  });

  // Cover wordmark casing — guard against drift.
  if (/Assembl|ASSEMBL/.test(JSON.stringify(pack.title))) {
    issues.push({
      severity: 'error',
      path: 'title',
      message: 'Wordmark must be lower-case "assembl".',
    });
  }

  return issues;
}

/** Convenience — true iff zero errors. Warnings allowed. */
export function isSealable(pack: EvidencePack): boolean {
  return !validatePack(pack).some((i) => i.severity === 'error');
}
