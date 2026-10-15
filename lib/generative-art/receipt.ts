import type { Family, FamilyPreset } from './families';

/**
 * The receipt line stamped on every export: family, preset, named choices and
 * seed. With the share link it regenerates the piece exactly.
 */
export function receiptFor(family: Family, preset: FamilyPreset, values: Record<string, number>, seed: number, text: string): string {
  const parts = [family.label.toLowerCase(), preset.label];
  for (const s of preset.sliders) {
    if (!s.options) continue;
    const label = s.options[Math.max(0, Math.min(s.options.length - 1, Math.round(values[s.key] ?? 0)))];
    parts.push(label === 'your word' && text.trim() ? `"${text.trim().slice(0, 24)}"` : label);
  }
  parts.push(`seed ${seed}`);
  return parts.join(' · ');
}
