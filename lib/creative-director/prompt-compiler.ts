/**
 * Prompt compiler — casual user prompt → structured CREATIVE INTENT block.
 * Deterministic heuristics for PREVIEW; swap for a model ladder later.
 */

import type { CreativeIntent } from './types';

const BANNED_SLOP = [
  'unlock',
  'revolutionise',
  'revolutionize',
  'ai-powered',
  'seamless',
  'seamlessly',
  'supercharge',
  'game-changing',
  'cutting-edge',
  'empower',
  'elevate',
] as const;

const DEFAULT_AVOID = [
  'card-grid SaaS heroes',
  'purple AI gradients',
  'corporate network node clichés',
  'koru tourism decoration',
  'Māori motifs as surface garnish',
  'chatbot / robot imagery',
  ...BANNED_SLOP.map((w) => `"${w}" copy`),
];

const DEFAULT_QUALITY = [
  'One unforgettable visual idea per viewport',
  'Motion readable within ~2s (camera / assembly / depth)',
  'Respect prefers-reduced-motion — fully assembled state',
  'Palette stays plum / paper / heather for assembl-owned frames',
  'NZ through geography, material, light — never garnish',
  'Plain English — no unlock / revolutionise / AI-powered slop',
];

function detectBrand(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('energy') || lower.includes('power') || lower.includes('household')) {
    return 'NZ energy retailer (DEMO fixture — fictional)';
  }
  if (lower.includes('bank') || lower.includes('finance')) {
    return 'NZ financial services (DEMO — fictional)';
  }
  if (lower.includes('assembl')) {
    return 'assembl';
  }
  return 'Brand from brief (DEMO — extract pending live research)';
}

function detectAudience(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('household') || lower.includes('home')) {
    return 'Household decision-makers comparing energy plans';
  }
  if (lower.includes('business') || lower.includes('sme')) {
    return 'NZ SME operators';
  }
  return 'People who need the job done without software theatre';
}

function detectEmotion(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('cinematic') || lower.includes('phenomenal')) {
    return 'Quiet awe — competence made visible';
  }
  if (lower.includes('calm') || lower.includes('trust')) {
    return 'Calm confidence';
  }
  return 'Clarity and gathered control';
}

function detectNzContext(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('energy') || lower.includes('household')) {
    return 'Aotearoa household light — winter evening, meter, plan choice. Geography and material, not tourism.';
  }
  if (lower.includes('nz') || lower.includes('aotearoa') || lower.includes('new zealand')) {
    return 'Aotearoa light and material — no postcard framing.';
  }
  return 'Aotearoa context assumed for assembl work — light, weather, material honesty.';
}

function detectReferences(prompt: string): string[] {
  const refs: string[] = [
    'Minimalist aerial / top-down fine art',
    'MANY → COORDINATION → ONE organic assembly',
  ];
  const lower = prompt.toLowerCase();
  if (lower.includes('cinematic') || lower.includes('video')) {
    refs.push('Cinematic depth with still camera, moving subjects');
  }
  if (lower.includes('agent') || lower.includes('assembl')) {
    refs.push('Agent as quiet coordinator — never mascot');
  }
  return refs;
}

function detectHero(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('energy') && lower.includes('plan')) {
    return 'Top-down table of household energy fragments assembling into one clear plan object';
  }
  if (lower.includes('agent')) {
    return 'A single assembling field where many signals become one decision';
  }
  return 'One dominant visual plane — edge-to-edge — carrying a single idea';
}

function detectMotion(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('assembl')) {
    return 'Organic assembly: scattered pieces coordinate into one form within ~2s; camera stays still.';
  }
  return 'Camera minimal; objects assemble; evidence locks last. Reduced-motion → assembled end state.';
}

function coreIdeaFromPrompt(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Untitled idea — waiting for a brief.';
  // First sentence or first ~140 chars as the core idea spine.
  const sentence = cleaned.split(/(?<=[.!?])\s+/)[0] ?? cleaned;
  return sentence.length > 160 ? `${sentence.slice(0, 157)}…` : sentence;
}

/**
 * Compile a casual prompt into a CREATIVE INTENT block.
 * Pure function — safe for tests and DEMO fixtures.
 */
export function compileCreativeIntent(rawPrompt: string): CreativeIntent {
  const prompt = rawPrompt.trim();
  return {
    coreIdea: coreIdeaFromPrompt(prompt),
    brand: detectBrand(prompt),
    audience: detectAudience(prompt),
    emotion: detectEmotion(prompt),
    nzContext: detectNzContext(prompt),
    references: detectReferences(prompt),
    avoid: [...DEFAULT_AVOID],
    hero: detectHero(prompt),
    motion: detectMotion(prompt),
    qualityGate: [...DEFAULT_QUALITY],
    rawPrompt: prompt,
  };
}

/** Format intent as a pasteable CREATIVE INTENT block for agents / humans. */
export function formatCreativeIntentBlock(intent: CreativeIntent): string {
  return [
    'CREATIVE INTENT',
    '───────────────',
    `Core idea: ${intent.coreIdea}`,
    `Brand: ${intent.brand}`,
    `Audience: ${intent.audience}`,
    `Emotion: ${intent.emotion}`,
    `NZ context: ${intent.nzContext}`,
    `Hero: ${intent.hero}`,
    `Motion: ${intent.motion}`,
    '',
    'References:',
    ...intent.references.map((r) => `  · ${r}`),
    '',
    'Avoid:',
    ...intent.avoid.map((a) => `  · ${a}`),
    '',
    'Quality gate:',
    ...intent.qualityGate.map((q) => `  · ${q}`),
  ].join('\n');
}
