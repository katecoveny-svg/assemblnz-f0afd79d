import { describe, it, expect } from "vitest";
import {
  getKeteAccent,
  keteAccentHex,
  hexToRgb,
  keteAccentRgba,
} from "@/lib/keteColors";
import { ASSEMBL_TOKENS } from "@/design/assemblTokens";

/**
 * Brand Guidelines v1.0 (Mārama Whenua) — locked 24 April 2026.
 * If any of these assertions fail, the colour palette has drifted from
 * the brand source of truth. Update the brand guide before changing values.
 */
describe("keteColors — brand palette lock", () => {
  const expected: Record<string, string> = {
    pikau:    "#B8C7B1", // Soft Moss
    hoko:     "#D8C3C2", // Blush Stone
    ako:      "#C7D6C7", // Soft Sage
    toro:     "#C7D9E8", // Moonstone Blue
    manaaki:  "#E6D8C6", // Warm Linen
    waihanga: "#CBB8A4", // Clay Sand
    arataki:  "#D5C0C8", // Dusky Rose
    auaha:    "#C8DDD8", // Pale Seafoam
  };

  it.each(Object.entries(expected))(
    "%s resolves to brand-locked accent %s",
    (slug, hex) => {
      expect(keteAccentHex(slug)).toBe(hex);
    }
  );

  it("matches the assemblTokens.ts industry hex values exactly", () => {
    const tokenMap = Object.fromEntries(
      Object.values(ASSEMBL_TOKENS.industries).map((entry) => [
        entry.name.toLowerCase(),
        entry.accent_hex,
      ])
    );
    // Spot-check a few — both sources should agree.
    expect(tokenMap["hospitality"]).toBe(expected.manaaki);
    expect(tokenMap["construction"]).toBe(expected.waihanga);
    expect(tokenMap["creative"]).toBe(expected.auaha);
    expect(tokenMap["family"]).toBe(expected.toro);
  });

  it("falls back to platform accent for unknown / nullish slugs", () => {
    expect(getKeteAccent(undefined).label).toBe("Platform");
    expect(getKeteAccent(null).label).toBe("Platform");
    expect(getKeteAccent("not-a-kete").label).toBe("Platform");
  });

  it("normalises slug casing and punctuation", () => {
    expect(keteAccentHex("MANAAKI")).toBe(expected.manaaki);
    expect(keteAccentHex("Waihanga")).toBe(expected.waihanga);
    expect(keteAccentHex("toro-04")).toBe(expected.toro);
  });
});

describe("keteColors — hex utilities", () => {
  it("converts hex to comma-separated rgb triplet", () => {
    expect(hexToRgb("#FFFFFF")).toBe("255, 255, 255");
    expect(hexToRgb("#000000")).toBe("0, 0, 0");
    expect(hexToRgb("#E6D8C6")).toBe("230, 216, 198"); // Manaaki Warm Linen
  });

  it("tolerates hex without leading hash", () => {
    expect(hexToRgb("D8C3C2")).toBe("216, 195, 194"); // Hoko Blush Stone
  });

  it("builds rgba strings from a kete slug + alpha", () => {
    expect(keteAccentRgba("manaaki", 0.18)).toBe("rgba(230, 216, 198, 0.18)");
  });
});
