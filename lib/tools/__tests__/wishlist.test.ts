import { describe, it, expect } from "vitest";
import { buildFallbackSpec, parseWishlistSpec, WISHLIST_KETE } from "@/lib/tools/wishlist";

describe("buildFallbackSpec", () => {
  it("routes a customs wish to Pīkau", () => {
    const spec = buildFallbackSpec("a freight broker", "draft customs entries from invoices");
    expect(spec.kete).toBe("Pīkau");
    expect(spec.drafts).toHaveLength(3);
  });

  it("routes a food/allergen wish to Manaaki", () => {
    const spec = buildFallbackSpec("a cafe", "keep our allergen menu matrix current");
    expect(spec.kete).toBe("Manaaki");
  });

  it("falls back to Core for an unmatched wish", () => {
    const spec = buildFallbackSpec("a widget startup", "something entirely novel and unmatched");
    expect(spec.kete).toBe("Core");
  });

  it("always includes three checks with the Privacy Act 2020", () => {
    const spec = buildFallbackSpec("a shop", "handle returns");
    expect(spec.checks).toHaveLength(3);
    expect(spec.checks.some((c) => /privacy act 2020/i.test(c))).toBe(true);
  });

  it("uses a conservative default of 4 hours and a forLine with the business + wish", () => {
    const spec = buildFallbackSpec("Joe's Garage", "WoF reminders");
    expect(spec.hoursPerWeek).toBe(4);
    expect(spec.forLine).toContain("Joe's Garage");
    expect(spec.forLine).toContain("WoF reminders");
  });
});

describe("parseWishlistSpec", () => {
  const business = "a cafe";
  const wish = "allergen tracking";

  it("parses a clean JSON object", () => {
    const raw = JSON.stringify({
      kete: "Manaaki",
      specialistName: "a Manaaki hospitality drafter",
      drafts: ["a", "b", "c"],
      checks: ["x", "y", "Privacy Act 2020 check"],
      hoursPerWeek: 5,
      forLine: "for a cafe, taking 'allergen tracking' off their plate",
    });
    const spec = parseWishlistSpec(raw, business, wish);
    expect(spec?.kete).toBe("Manaaki");
    expect(spec?.hoursPerWeek).toBe(5);
  });

  it("tolerates prose around the JSON", () => {
    const raw = "Here you go:\n{\"kete\":\"Core\",\"drafts\":[\"a\",\"b\",\"c\"],\"checks\":[\"x\",\"y\",\"z\"],\"hoursPerWeek\":3,\"forLine\":\"f\",\"specialistName\":\"s\"}\nThanks";
    expect(parseWishlistSpec(raw, business, wish)).not.toBeNull();
  });

  it("returns null for non-JSON (caller then falls back)", () => {
    expect(parseWishlistSpec("not json at all", business, wish)).toBeNull();
    expect(parseWishlistSpec("", business, wish)).toBeNull();
  });

  it("injects the Privacy Act check when the model omits it", () => {
    const raw = JSON.stringify({
      kete: "Hoko",
      specialistName: "s",
      drafts: ["a", "b", "c"],
      checks: ["one", "two", "three"],
      hoursPerWeek: 4,
      forLine: "f",
    });
    const spec = parseWishlistSpec(raw, business, wish);
    expect(spec?.checks.some((c) => /privacy act 2020/i.test(c))).toBe(true);
  });

  it("coerces an unknown kete to Core and clamps hours", () => {
    const raw = JSON.stringify({
      kete: "Nonsense",
      specialistName: "s",
      drafts: ["a", "b", "c"],
      checks: ["x", "y", "Privacy Act 2020"],
      hoursPerWeek: 999,
      forLine: "f",
    });
    const spec = parseWishlistSpec(raw, business, wish);
    expect(spec?.kete).toBe("Core");
    expect(spec?.hoursPerWeek).toBeLessThanOrEqual(20);
  });

  it("exposes the canonical kete list", () => {
    expect(WISHLIST_KETE).toContain("Pīkau");
    expect(WISHLIST_KETE).toContain("Core");
  });
});
