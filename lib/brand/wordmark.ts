/**
 * Export-side brand wordmark + voice guard — the non-React companion to
 * `components/marketplace/Wordmark.tsx`.
 *
 * Ported from the old `assemblnz-f0afd79d-main/src/lib/pdfBranding.ts` brand
 * stamping (the geometric mark + tracking-watermark format) and the voice
 * contract in `agents/_shared/brand-prefix.md`. Any export pipeline (PDF,
 * generated imagery, shared briefs) calls into this so the wordmark, palette,
 * and forbidden-words rules live in exactly one place.
 */

/** Dash brand palette (locked 2026-06-23). Mirrors `PALETTE` in agents.ts. */
export const BRAND = {
  canary: '#FFD42A',
  canary2: '#FFE27A',
  ink: '#3A3832',
  body: '#56544B',
  paper: '#FFFFFF',
  cream: '#FFF7EC',
  hairline: '#EFEADC',
  gold: '#C79B1F',
  muted: '#8A8678',
} as const;

/** The wordmark, lowercase always. Never capitalise "assembl". */
export const WORDMARK = 'assembl' as const;

/**
 * Forbidden words/phrases — hard stop, never appears in user-facing output.
 * Ported verbatim from `agents/_shared/brand-prefix.md` and kept in sync with
 * the `SHARED_BRAND_PREFIX` in `lib/marketplace/agent-prompts.ts`.
 */
export const FORBIDDEN_PHRASES: readonly string[] = [
  'artificial intelligence',
  'smart brain',
  'enterprise-grade',
  'enterprise grade',
  'game-changer',
  'game changer',
  'sprint-ready',
  'audit-ready',
  'trained on',
  'cutting-edge',
  'revolutionary',
  'seamless',
  'world-class',
] as const;

/** A forbidden-phrase hit. `index` is the match offset in the scanned text. */
export type ForbiddenHit = { phrase: string; index: number };

/**
 * Scan text for forbidden brand phrases (case-insensitive, word-ish bounded).
 * Returns every hit so an export pipeline can refuse or flag before shipping.
 * Note: "AI"/"brain" are deliberately NOT regex-scanned here — they collide
 * with legitimate words (e.g. "available", "Bahrain"); the prompt layer owns
 * those. This guard catches the unambiguous slop phrases.
 */
export function scanForbidden(text: string): ForbiddenHit[] {
  const hits: ForbiddenHit[] = [];
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    let from = 0;
    for (;;) {
      const i = lower.indexOf(phrase, from);
      if (i === -1) break;
      hits.push({ phrase, index: i });
      from = i + phrase.length;
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

/**
 * Build the tracking watermark stamped onto every exported pack:
 *   `ASSEMBL-{SCOPE}-{yyyymmdd}-{short}`
 * Ported from `evidencePackPdf.ts` `buildWatermark`. `scope` is the agent
 * slug or kete; `short` is an 8-char id. Deterministic when `now`/`rand` given
 * (so callers in tests/SSR can pin it).
 */
export function buildWatermark(
  scope: string,
  now: Date = new Date(),
  rand: () => string = () => Math.random().toString(36).slice(2),
): { id: string; watermark: string } {
  const ts =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const short = rand().padEnd(8, '0').slice(0, 8);
  const id = `${ts}-${short}`;
  const safeScope = scope.replace(/[^a-z0-9]+/gi, '-').toUpperCase().replace(/^-+|-+$/g, '');
  return { id, watermark: `ASSEMBL-${safeScope || 'AGENT'}-${id}` };
}

/**
 * The standing AI/advice disclaimer stamped into export footers and sign-off
 * blocks. Ported from `pdfBranding.ts` line 302-303, kept verbatim so legal
 * wording lives in one place.
 */
export function exportDisclaimer(agentName: string): string {
  return (
    `Drafted by ${agentName} via ${WORDMARK}. A draft for a named human to check before it is sent, ` +
    `filed, lodged, or relied on. ${WORDMARK} does not provide legal, financial, tax, medical, or ` +
    `construction advice — consult a licensed professional for your situation.`
  );
}

/** Hex "#RRGGBB" → [r,g,b] for jsPDF / canvas fills. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
