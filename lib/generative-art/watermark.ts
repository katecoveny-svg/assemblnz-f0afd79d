/**
 * Assembl brand mark applied to shared assets — pngs, svgs, and the
 * standalone code exports. Bottom-right corner, auto-contrast against
 * whatever ground colour the family is running.
 */

const BRAND_LINE_1 = 'assembl';        // Instrument Sans, lowercase, medium: the wordmark
const BRAND_LINE_2 = 'assembl.co.nz';  // IBM Plex Mono: the address
const SANS = "'Instrument Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Relative luminance per WCAG — decides light-on-dark vs dark-on-light. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function watermarkColor(ground: string): string {
  return luminance(ground) > 0.55 ? '#492B3E' : '#F5F1F2';
}

/**
 * Raster exports are stamped once, by the studio shell (`compositeOverlay` in
 * GenerativeArtCanvas: wordmark, rose dot and receipt line). Families still
 * call this on their PNG paths; it now returns a clean copy so a piece never
 * carries two marks. SVG and code exports keep their own mark below.
 */
export function stampWatermarkOnCanvas(
  source: HTMLCanvasElement,
  _ground: string,
): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext('2d');
  if (!ctx) return source;
  ctx.drawImage(source, 0, 0);
  return out;
}

/**
 * Insert a watermark <g> block into an SVG string. Assumes the SVG has a
 * simple `<svg ... viewBox="0 0 W H">` opener; we parse those two numbers
 * to place the mark bottom-right.
 */
export function stampWatermarkOnSvg(svg: string, ground: string): string {
  const viewMatch = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  if (!viewMatch) return svg;
  const w = Number(viewMatch[1]);
  const h = Number(viewMatch[2]);
  const shortest = Math.min(w, h);
  const displaySize = Math.max(11, Math.min(22, Math.round(shortest * 0.024)));
  const monoSize = Math.max(8, Math.round(displaySize * 0.55));
  const margin = Math.round(shortest * 0.028);
  const gap = Math.round(displaySize * 0.15);
  const color = watermarkColor(ground);

  const wordY = h - margin - monoSize - gap;
  const stamp = `<g class="assembl-mark" pointer-events="none">
  <text x="${w - margin}" y="${wordY}" text-anchor="end"
        fill="${color}" fill-opacity="0.82"
        font-family="${SANS.replace(/'/g, '&apos;')}"
        font-weight="500" font-size="${displaySize}">${BRAND_LINE_1}</text>
  <text x="${w - margin}" y="${h - margin}" text-anchor="end"
        fill="${color}" fill-opacity="0.6"
        font-family="${MONO.replace(/'/g, '&apos;')}"
        font-size="${monoSize}">${BRAND_LINE_2}</text>
</g>`;

  // Append just before the closing </svg>.
  return svg.replace(/<\/svg>\s*$/, `${stamp}\n</svg>`);
}

export function watermarkHtmlSnippet(ground: string): string {
  const color = watermarkColor(ground);
  return `<div class="assembl-mark" aria-hidden="true">
  <span class="assembl-mark-word">${BRAND_LINE_1}</span>
  <span class="assembl-mark-url">${BRAND_LINE_2}</span>
</div>
<style>
  .assembl-mark {
    position: fixed;
    right: 24px;
    bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    color: ${color};
    pointer-events: none;
    z-index: 10;
  }
  .assembl-mark-word {
    font-family: ${SANS};
    font-weight: 500;
    font-size: clamp(14px, 1.6vw, 20px);
    opacity: 0.82;
  }
  .assembl-mark-url {
    font-family: ${MONO};
    font-size: clamp(9px, 1vw, 12px);
    opacity: 0.6;
    letter-spacing: 0.02em;
  }
</style>`;
}
