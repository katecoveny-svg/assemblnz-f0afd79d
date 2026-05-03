/**
 * Kete accent palette
 *
 * Each industry kete has a soft accent colour (locked Brand Guidelines
 * v1.0, 24 April 2026). LiveWidgets pull from this map so every
 * dashboard section feels distinct without hardcoding hex values in
 * components.
 *
 * Values are HSL triples so they can be passed straight into Tailwind
 * via inline style `--kete-accent` or used with the soft-gold CTA token.
 */

import type { WidgetKete } from "@/config/widget-types";

export interface KeteAccent {
  /** Display label (sentence case). */
  label: string;
  /** Soft accent — used for tile borders, dot markers, ring focus. */
  accentHex: string;
  /** Darker variant for icon strokes / micro-text. */
  inkHex: string;
  /** Wash used for card surface tints. */
  washHex: string;
  /** Short te reo / English subtitle for the section header. */
  subtitle: string;
}

export const KETE_ACCENTS: Record<WidgetKete, KeteAccent> = {
  platform: {
    label: "Platform",
    accentHex: "#D9BC7A", // Soft Gold
    inkHex: "#9D8C7D",
    washHex: "#F7F3EE",
    subtitle: "Cross-kete signals",
  },
  manaaki: {
    label: "Manaaki",
    accentHex: "#E6D8C6", // Warm Linen
    inkHex: "#A38E73",
    washHex: "#FBF6EE",
    subtitle: "Hospitality",
  },
  waihanga: {
    label: "Waihanga",
    accentHex: "#CBB8A4", // Clay Sand
    inkHex: "#8E7C68",
    washHex: "#F7F1E8",
    subtitle: "Construction",
  },
  auaha: {
    label: "Auaha",
    accentHex: "#C8DDD8", // Pale Seafoam
    inkHex: "#6F908A",
    washHex: "#F0F6F4",
    subtitle: "Creative & marketing",
  },
  arataki: {
    label: "Arataki",
    accentHex: "#D5C0C8", // Dusky Rose
    inkHex: "#92707C",
    washHex: "#F6EFF1",
    subtitle: "Automotive & fleet",
  },
  pikau: {
    label: "Pikau",
    accentHex: "#B8C7B1", // Soft Moss
    inkHex: "#6F8467",
    washHex: "#EFF3EC",
    subtitle: "Freight & customs",
  },
  hoko: {
    label: "Hoko",
    accentHex: "#D8C3C2",
    inkHex: "#8F7170",
    washHex: "#F6EEED",
    subtitle: "Retail",
  },
  ako: {
    label: "Ako",
    accentHex: "#C7D6C7",
    inkHex: "#6F8D71",
    washHex: "#EEF4EE",
    subtitle: "Early childhood",
  },
  toro: {
    label: "Toro",
    accentHex: "#C7D9E8",
    inkHex: "#6F8AA8",
    washHex: "#EEF3F8",
    subtitle: "Family",
  },
};

export function getKeteAccent(kete: WidgetKete): KeteAccent {
  return KETE_ACCENTS[kete] ?? KETE_ACCENTS.platform;
}
