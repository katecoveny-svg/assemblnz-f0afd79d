/**
 * Read a business's brand colours off their own pages.
 *
 * Deterministic on purpose: a language model asked to "guess the brand hex"
 * invents plausible-but-wrong colours, and a wrong brand colour is worse than
 * none. Counting what the stylesheets actually use is boring and correct — it
 * found #F06022 (66 uses) on Ryman's site, which is exactly their orange.
 *
 * The ranking rewards saturated, mid-lightness colours that appear often, and
 * throws away the paper/ink/grey scaffolding every site has.
 */

export interface BrandColours {
  /** The colour the brand leads with. */
  primary: string;
  /** A distinct second colour, when the site really has one. */
  secondary: string | null;
  /** A third, for accents. */
  accent: string | null;
  /** Darkest frequent colour — used for text/ink. */
  ink: string;
}

interface Scored {
  hex: string;
  count: number;
  score: number;
}

function hexOf(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function parseHex(raw: string): [number, number, number] | null {
  let h = raw.replace('#', '').toLowerCase();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 || /[^0-9a-f]/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Saturation + lightness in HSL terms, 0..1. */
function satLight(r: number, g: number, b: number): { s: number; l: number; hue: number } {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (d !== 0) {
    if (max === R) hue = ((G - B) / d) % 6;
    else if (max === G) hue = (B - R) / d + 2;
    else hue = (R - G) / d + 4;
  }
  hue = (hue * 60 + 360) % 360;
  return { s, l, hue };
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Collect every colour literal in a blob of CSS/HTML with a frequency count. */
function tally(source: string, into: Map<string, number>): void {
  const hexes = source.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) ?? [];
  for (const h of hexes) {
    const rgb = parseHex(h);
    if (!rgb) continue;
    const key = hexOf(...rgb);
    into.set(key, (into.get(key) ?? 0) + 1);
  }
  const rgbs = source.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g) ?? [];
  for (const r of rgbs) {
    const nums = r.match(/\d+/g);
    if (!nums || nums.length < 3) continue;
    const key = hexOf(Number(nums[0]), Number(nums[1]), Number(nums[2]));
    into.set(key, (into.get(key) ?? 0) + 1);
  }
}

/**
 * Rank the tallied colours and pick a brand palette.
 * Exported separately so the fetching stays in the route (and testable here).
 */
export function rankColours(counts: Map<string, number>): BrandColours | null {
  const scored: Scored[] = [];
  let darkest: { hex: string; l: number } | null = null;

  for (const [hex, count] of counts) {
    const rgb = parseHex(hex);
    if (!rgb) continue;
    const { s, l } = satLight(...rgb);

    // Track the darkest reasonably-common colour for ink.
    if (l < 0.3 && count >= 2 && (!darkest || l < darkest.l)) darkest = { hex, l };

    // Discard the scaffolding: near-white, near-black, and unsaturated greys.
    if (l > 0.93 || l < 0.08) continue;
    if (s < 0.22) continue;

    // Favour frequency, but don't let a hundred uses of a pale tint beat the
    // real brand colour: weight by saturation and by being mid-lightness.
    const lightnessFit = 1 - Math.abs(l - 0.5) * 1.4;
    scored.push({ hex, count, score: Math.log2(count + 1) * (0.45 + s) * Math.max(0.25, lightnessFit) });
  }

  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);

  const primary = scored[0];
  const primaryHue = satLight(...parseHex(primary.hex)!).hue;

  // Secondary must be a genuinely different hue, not a shade of the primary.
  const secondary = scored.slice(1).find((c) => {
    const { hue } = satLight(...parseHex(c.hex)!);
    return hueDistance(hue, primaryHue) > 40;
  }) ?? null;

  const secondaryHue = secondary ? satLight(...parseHex(secondary.hex)!).hue : null;
  const accent = scored.slice(1).find((c) => {
    if (secondary && c.hex === secondary.hex) return false;
    const { hue } = satLight(...parseHex(c.hex)!);
    return hueDistance(hue, primaryHue) > 25 && (secondaryHue === null || hueDistance(hue, secondaryHue) > 25);
  }) ?? null;

  return {
    primary: primary.hex,
    secondary: secondary?.hex ?? null,
    accent: accent?.hex ?? null,
    ink: darkest?.hex ?? '#1A1918',
  };
}

/** Tally a page plus any stylesheet bodies already fetched for it. */
export function extractBrandColours(sources: string[]): BrandColours | null {
  const counts = new Map<string, number>();
  for (const s of sources) tally(s, counts);
  return rankColours(counts);
}

/**
 * Stylesheet URLs referenced by a page, ranked so the brand's own theme sheet
 * is fetched first.
 *
 * Document order is the wrong order: sites commonly load a dozen per-module
 * stylesheets before the main theme file, and a module's link-blue can easily
 * out-score the real brand colour if the theme sheet never gets fetched.
 * (Ryman's theme sheet is last on the page, and skipping it turned their green
 * into a stray cyan.) So: theme-looking names first, same-origin next.
 */
export function stylesheetUrls(html: string, base: URL, cap = 8): string[] {
  const candidates: Array<{ url: string; rank: number }> = [];
  const re = /<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi;
  const links = html.match(re) ?? [];
  const seen = new Set<string>();

  for (const tag of links) {
    const m = tag.match(/href=["']([^"']+)["']/i);
    if (!m) continue;
    let u: URL;
    try {
      u = new URL(m[1], base);
    } catch {
      continue;
    }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') continue;
    const where = `${u.hostname}${u.pathname}`;
    // Third-party frameworks ship their own palettes — never the brand's.
    if (/bootstrap|font-awesome|fontawesome|normalize|splide|swiper|slick|lightbox|jquery|cookieconsent/i.test(where)) continue;
    const key = u.toString();
    if (seen.has(key)) continue;
    seen.add(key);

    let rank = 2;
    if (/theme|stylesheet|main|global|site|brand|style\b|styles\b|tokens|variables/i.test(u.pathname)) rank = 0;
    else if (/module_|component|widget/i.test(u.pathname)) rank = 3;
    if (u.hostname !== base.hostname && rank !== 0) rank += 1; // prefer their own host
    candidates.push({ url: key, rank });
  }

  return candidates
    .sort((a, b) => a.rank - b.rank)
    .slice(0, cap)
    .map((c) => c.url);
}
