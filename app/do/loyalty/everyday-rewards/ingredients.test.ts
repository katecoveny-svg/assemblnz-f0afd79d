import { describe, it, expect } from "vitest";
import {
  parseIngredientObservation,
  reviewIngredients,
  type IngredientRow,
} from "./ingredients";
import { planShop } from "./model";
const candidate = (
  name = "Tomatoes",
  amount: number | null = 400,
  unit: string | null = "g",
) =>
  JSON.stringify({
    ingredients: [{ name, amount, unit, uncertainty: "Check this." }],
  });
const confirm = (rows: IngredientRow[]) =>
  rows.map((r) => ({ ...r, confirmed: true }));
describe("grocery observation review adapter", () => {
  it("never turns image quantities into approved pantry stock", () => {
    const parsed = parseIngredientObservation(candidate(), "photo");
    expect(parsed.rows[0].confirmed).toBe(false);
    expect(reviewIngredients(parsed.rows).pantry).toEqual([]);
    expect(
      reviewIngredients(confirm(parsed.rows)).pantry[0].quantity.amount,
    ).toBe(400);
  });
  it("keeps unknown quantities unknown, not zero", () => {
    const p = parseIngredientObservation(candidate("Tomatoes", null), "photo");
    expect(p.rows[0].amount).toBeNull();
    expect(reviewIngredients(confirm(p.rows)).issues.length).toBe(1);
  });
  it("rejects malformed, excessive, unsafe and ambiguous provider output", () => {
    for (const text of [
      "there may be some tomatoes",
      candidate("Tomatoes", -1),
      candidate("Tomatoes", 400, "cups"),
      JSON.stringify({
        ingredients: [{ name: "Tomatoes", amount: "400", unit: "g" }],
      }),
      "```json\n" + candidate() + "\n```\n```json\n" + candidate() + "\n```",
    ])
      expect(parseIngredientObservation(text, "photo").rows).toEqual([]);
  });
  it("maps only explicit reviewed voice lines, never prose amounts", () => {
    expect(
      parseIngredientObservation(
        "Tomatoes | 600 | g\nRice | ? | g",
        "voice",
      ).rows.map((r) => r.amount),
    ).toEqual([600, null]);
    expect(
      parseIngredientObservation(
        "I think I have about half a bag of rice",
        "voice",
      ).rows,
    ).toEqual([]);
  });
  it("rejects duplicate identities and incompatible units until corrected", () => {
    const p = confirm(parseIngredientObservation(candidate(), "photo").rows);
    expect(
      reviewIngredients([
        ...p,
        { ...p[0], id: "other", name: "tomato" },
      ]).issues.join(),
    ).toContain("duplicate");
    expect(
      reviewIngredients([{ ...p[0], unit: "each" }]).issues.join(),
    ).toContain("do not guess");
  });
  it("retains confirmed custom items but discloses catalogue coverage", () => {
    const p = confirm(
      parseIngredientObservation(candidate("Chickpeas", 200), "photo").rows,
    );
    expect(reviewIngredients(p).uncovered).toEqual(["Chickpeas"]);
    expect(reviewIngredients(p).pantry).toHaveLength(1);
  });
  it("uses confirmed photo quantities in chosen recipe and whole-pack basket", () => {
    const p = parseIngredientObservation(
      JSON.stringify({
        ingredients: [
          { name: "Tomatoes", amount: 600, unit: "g" },
          { name: "Rice", amount: 500, unit: "g" },
        ],
      }),
      "photo",
    );
    const stock = reviewIngredients(confirm(p.rows));
    const plan = planShop(stock.pantry, 4, true, 4000, "rice-night");
    expect(plan.basket.find((l) => l.ingredientId === "tomato")?.packs).toBe(0);
    expect(plan.basket.find((l) => l.ingredientId === "rice")?.packs).toBe(0);
    expect(plan.estimatedMinor).toBe(1000);
  });
  it("exposes the existing empty-pantry budget boundary without changing arithmetic", () => {
    expect(planShop([], 8, true, 4000).estimatedMinor).toBe(4300);
    expect(planShop([], 8, true, 4000).blockers).toContain(
      "Estimated basket exceeds the NZD budget",
    );
    expect(planShop([], 8, true, 5000).blockers).toEqual([]);
  });
});
