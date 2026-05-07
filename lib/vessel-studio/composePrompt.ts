import {
  activeFlagNegatives,
  BODY_INLINE_NEGATIVES,
  getKete,
} from './keteOptions';
import type { VesselStudioState } from './types';

// Free-form custom fields fill in after the canonical opener.
function composeCustomGrammar(state: VesselStudioState): string {
  const parts = [
    state.customMaterial.trim(),
    state.customForm.trim(),
    state.customPalette.trim(),
  ].filter(Boolean);
  const opener = 'editorial still-life photograph of a sculptural evidence vessel:';
  if (!parts.length) {
    return `${opener} a custom assembl vessel form (no material grammar set yet)`;
  }
  return `${opener} ${parts.join(', ')}`;
}

// Body template — single source for both Midjourney full prompt and Fal payload.
// Vessel: each kete grammar self-opens with "editorial still-life photograph…"
// Portrait: kete grammar self-opens with "editorial portrait photograph…" and
// uses portrait-specific camera spec.
export function composeBody(state: VesselStudioState): string {
  const k = getKete(state.kete);
  const grammar = k.id === 'custom' ? composeCustomGrammar(state) : k.grammar;
  const tonal = (k.tonalSignature || '').trim();
  const inlineNeg = BODY_INLINE_NEGATIVES.map((n) => `no ${n}`).join(' ');
  const isPortrait = !!k.portrait;

  const parts: string[] = [grammar, state.motion];

  if (isPortrait) {
    parts.push(state.lighting);
  } else {
    parts.push(
      `${state.lighting} from upper left casting a long warm shadow on a cream paper backdrop`
    );
    parts.push('museum quality');
  }

  if (tonal) parts.push(tonal);
  parts.push(inlineNeg);
  parts.push('shot on Hasselblad');
  parts.push(isPortrait ? '100mm portrait lens' : '100mm macro');
  parts.push(isPortrait ? 'f2.8' : 'f4');

  return parts.join(', ');
}

export function composeFlags(state: VesselStudioState): string {
  const k = getKete(state.kete);
  const flags: string[] = [];
  flags.push(`--ar ${state.ar}`);
  flags.push('--v 6');
  if (state.sref.trim()) flags.push(`--sref ${state.sref.trim()}`);
  if (state.variants > 1) flags.push(`--repeat ${state.variants}`);
  flags.push(`--no ${activeFlagNegatives(k).join(', ')}`);
  return flags.join(' ');
}

export function composeFull(state: VesselStudioState): string {
  return `${composeBody(state)} ${composeFlags(state)}`;
}

// The prompt sent to Fal: drop MJ flags, append flag-negatives as soft inline parenthetical.
export function composeForFal(state: VesselStudioState): string {
  const k = getKete(state.kete);
  const body = composeBody(state);
  const flagNegInline = `(${activeFlagNegatives(k)
    .map((n) => `no ${n}`)
    .join(', ')})`;
  return `${body} ${flagNegInline}`;
}
