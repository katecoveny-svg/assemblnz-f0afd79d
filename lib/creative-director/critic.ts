/**
 * Creative Critic agent stub.
 * Checklist + mock critique for v0; wired so Chromium screenshot loop can grow in.
 */

import type {
  ArtDirection,
  ConstructGrammar,
  CreativeIntent,
  CriticCheck,
  CriticResult,
} from './types';

export interface CriticInput {
  intent: CreativeIntent;
  direction: ArtDirection;
  construct: ConstructGrammar;
  /** Optional future: real screenshot data URLs / paths. */
  screenshots?: string[];
}

const REJECT_CONDITIONS: Array<{
  id: string;
  label: string;
  /**
   * Return fail detail if reject fires, or null if pass.
   * PREVIEW uses heuristics on intent/direction/construct text.
   */
  evaluate: (input: CriticInput) => string | null;
}> = [
  {
    id: 'card-grid-hero',
    label: 'Reject card-grid SaaS heroes',
    evaluate: ({ direction }) =>
      /card.?grid|three.?column|feature.?row/i.test(
        `${direction.composition} ${direction.metaphor}`,
      )
        ? 'Composition reads as a card grid.'
        : null,
  },
  {
    id: 'purple-gradient',
    label: 'No AI purple gradients',
    evaluate: ({ direction }) =>
      /purple|indigo|neon|glow/i.test(direction.paletteNote)
        ? 'Palette mentions banned purple/neon language.'
        : null,
  },
  {
    id: 'one-idea',
    label: 'One unforgettable visual idea per viewport',
    evaluate: ({ direction }) =>
      direction.metaphor.length < 40
        ? 'Metaphor too thin — idea not legible.'
        : null,
  },
  {
    id: 'motion-2s',
    label: 'Motion visible within ~2s',
    evaluate: ({ direction }) =>
      !/2s|assembl|scroll|orbit|unfold|drift/i.test(direction.motion)
        ? 'Motion story does not promise early readable change.'
        : null,
  },
  {
    id: 'reduced-motion',
    label: 'Respect reduced-motion',
    evaluate: ({ direction, intent }) => {
      const blob = `${direction.motion} ${intent.qualityGate.join(' ')}`;
      return /reduced-motion|assembled end|fully assembled/i.test(blob)
        ? null
        : 'No reduced-motion end-state called out.';
    },
  },
  {
    id: 'nz-no-cliche',
    label: 'NZ without tourism / motif garnish',
    evaluate: ({ intent, direction }) => {
      const blob = `${intent.nzContext} ${direction.metaphor}`.toLowerCase();
      if (/\bkoru\b|haka postcard|fern sticker/.test(blob)) {
        return 'NZ cliché / motif garnish detected.';
      }
      return null;
    },
  },
  {
    id: 'copy-slop',
    label: 'Plain English — no slop words',
    evaluate: ({ intent }) => {
      const blob = `${intent.coreIdea} ${intent.hero}`.toLowerCase();
      const hit = ['unlock', 'revolutionise', 'ai-powered', 'seamless', 'supercharge'].find(
        (w) => blob.includes(w),
      );
      return hit ? `Slop word in intent: ${hit}` : null;
    },
  },
  {
    id: 'grammar-fit',
    label: 'Construct grammar fits the direction',
    evaluate: ({ direction, construct }) => {
      const fit: Record<string, ConstructGrammar[]> = {
        'aerial-assembly': ['cinematic-video', 'spatial-r3f'],
        'object-world': ['spatial-r3f', 'cinematic-video'],
        'editorial-scroll': ['editorial-css-gsap'],
      };
      const ok = fit[direction.id] ?? [];
      return ok.includes(construct)
        ? null
        : `Construct ${construct} is a weak fit for ${direction.title}.`;
    },
  },
  {
    id: 'registry-blocks',
    label: 'Registry blocks named for construct',
    evaluate: ({ direction }) =>
      direction.registryBlocks.length >= 2
        ? null
        : 'Direction does not name enough registry blocks.',
  },
];

/**
 * Run Creative Critic. Failures become revise reasons.
 * When screenshots are absent, notes DEMO honesty for the mock plate.
 */
export function runCreativeCritic(input: CriticInput): CriticResult {
  const checks: CriticCheck[] = REJECT_CONDITIONS.map((rule) => {
    const fail = rule.evaluate(input);
    if (fail) {
      return {
        id: rule.id,
        label: rule.label,
        severity: 'fail' as const,
        detail: fail,
      };
    }
    return {
      id: rule.id,
      label: rule.label,
      severity: 'pass' as const,
      detail: 'Clear.',
    };
  });

  // Soft warn if no real screenshots yet — does not fail the PREVIEW.
  if (!input.screenshots?.length) {
    checks.push({
      id: 'screenshot-loop',
      label: 'Chromium screenshot loop',
      severity: 'warn',
      detail:
        'DEMO mock — no real screenshots yet. Hook Chromium capture here later; checklist still authoritative.',
    });
  }

  const reviseReasons = checks
    .filter((c) => c.severity === 'fail')
    .map((c) => `${c.label}: ${c.detail}`);

  return {
    passed: reviseReasons.length === 0,
    checks,
    reviseReasons,
    mockScreenshotNote: input.screenshots?.length
      ? `${input.screenshots.length} frame(s) attached for critique.`
      : 'DEMO plates only — critic ran on checklist + direction text.',
  };
}
