/* assembl · client brand palettes
 *
 * A demonstrator borrows the client's colours so it feels like theirs, but assembl's
 * own rules still win: paper stays paper, the accent appears at most three times, and
 * nothing gets set in a colour that fails contrast just because it is on brand.
 *
 * That last part is the whole reason this file exists. Giltrap's house steel blue is
 * #76A6BD — lovely, and 2.4:1 on paper, which is unreadable as text. So every brand
 * colour is measured on the way in and demoted to a stroke if it can't carry type.
 */

const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };

function luminance(hex) {
  const h = hex.replace('#', '');
  const s = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(s, 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* Darken toward black until the colour clears the threshold. Keeps the hue, which
   is what a brand team actually cares about, while making it legible. */
export function darkenTo(hex, against, target = 4.5) {
  const h = hex.replace('#', '');
  const s = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  let n = parseInt(s, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  for (let i = 0; i < 40; i++) {
    const cur = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    if (contrast(cur, against) >= target) return cur;
    r = Math.round(r * 0.92); g = Math.round(g * 0.92); b = Math.round(b * 0.92);
  }
  return '#14171A';
}

export function applyBrand(data, root = document.documentElement) {
  const brand = data.brand || {};
  const paper = '#FCFCFA';
  const primary = brand.primary || data.client?.accent || '#456B67';
  const secondary = brand.secondary || primary;

  /* the stroke versions keep the true brand colour — borders and rules only need 3:1 */
  root.style.setProperty('--brand-line', primary);
  root.style.setProperty('--brand-line-2', secondary);

  /* the text versions are measured, and demoted if they can't carry type */
  const primaryText = darkenTo(primary, paper);
  const secondaryText = darkenTo(secondary, paper);
  root.style.setProperty('--brand', primaryText);
  root.style.setProperty('--brand-2', secondaryText);

  /* the accent is the client's own product moment — at most three uses per page */
  root.style.setProperty('--accent', primaryText);

  return {
    primary, primaryText,
    demoted: primaryText.toLowerCase() !== primary.toLowerCase(),
    ratio: contrast(primary, paper).toFixed(2),
    typeface: brand.typeface || null,
    source: brand.source || null,
  };
}
