import type { Pantry, Unit } from "@/lib/do/shop/preparation";
export type IngredientRow = {
  id: string;
  name: string;
  amount: number | null;
  unit: Unit | null;
  confirmed: boolean;
  source: "manual" | "photo" | "voice" | "sample";
  uncertainty: string;
};
export const knownIngredients = [
  {
    id: "tomato",
    name: "Tomatoes",
    unit: "g",
    aliases: ["tomato", "tomatoes"],
  },
  {
    id: "aubergine",
    name: "Aubergine",
    unit: "each",
    aliases: ["aubergine", "aubergines", "eggplant"],
  },
  { id: "pasta", name: "Pasta", unit: "g", aliases: ["pasta"] },
  { id: "basil", name: "Basil", unit: "each", aliases: ["basil"] },
  { id: "rice", name: "Rice", unit: "g", aliases: ["rice"] },
  { id: "egg", name: "Eggs", unit: "each", aliases: ["egg", "eggs"] },
  {
    id: "bread",
    name: "Bread slices",
    unit: "each",
    aliases: ["bread slice", "bread slices"],
  },
] as const;
export const units: Unit[] = ["g", "kg", "ml", "l", "each"];
const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
export function ingredientIdentity(name: string) {
  return knownIngredients.find((k) =>
    k.aliases.some((a) => a === normalise(name)),
  );
}
export function newIngredient(
  source: IngredientRow["source"] = "manual",
): IngredientRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: null,
    unit: null,
    confirmed: false,
    source,
    uncertainty: "Quantity and identity need your review.",
  };
}
/** Strict candidate extraction, never approval. Prose and malformed output cannot become stock. */
export function parseIngredientObservation(
  text: string,
  source: "photo" | "voice",
): { rows: IngredientRow[]; notice: string } {
  if (text.length > 16000)
    return {
      rows: [],
      notice: "Observation too long. Add ingredient rows manually.",
    };
  let values: unknown;
  try {
    const blocks = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)];
    if (blocks.length > 1) throw new Error("Multiple candidate blocks");
    const candidate = blocks.length === 1 ? blocks[0][1] : text.trim();
    const parsed = JSON.parse(candidate);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.ingredients) ||
      parsed.ingredients.length > 30
    )
      throw new Error("Invalid ingredient list");
    values = parsed.ingredients;
  } catch {
    // Deliberate voice/manual convention only. Never infer a quantity from ordinary prose.
    const lines = text.trim().split("\n").filter(Boolean);
    if (
      !lines.length ||
      lines.length > 30 ||
      lines.some(
        (l) =>
          !/^[^|]{1,70}\|\s*(?:\?|\d+(?:\.\d+)?)\s*\|\s*(?:g|kg|ml|l|each|\?)\s*$/i.test(
            l,
          ),
      )
    )
      return {
        rows: [],
        notice:
          "No reliable ingredient rows found. Review the original notes and add rows manually, or use one line per ingredient: Tomatoes | 400 | g. Use ? for unknown quantities.",
      };
    values = lines.map((l) => {
      const [name, amount, unit] = l.split("|").map((s) => s.trim());
      return {
        name,
        amount: amount === "?" ? null : Number(amount),
        unit: unit === "?" ? null : unit.toLowerCase(),
        uncertainty: "From reviewed notes; confirm against your kitchen.",
      };
    });
  }
  const rows: IngredientRow[] = [];
  for (const v of values as unknown[]) {
    if (!v || typeof v !== "object")
      return {
        rows: [],
        notice: "Invalid ingredient row. Nothing was applied.",
      };
    const r = v as Record<string, unknown>;
    if (
      typeof r.name !== "string" ||
      !r.name.trim() ||
      r.name.length > 70 ||
      (r.amount !== null &&
        (typeof r.amount !== "number" ||
          !Number.isFinite(r.amount) ||
          r.amount < 0 ||
          r.amount > 10000)) ||
      (r.unit !== null && !units.includes(r.unit as Unit)) ||
      (r.uncertainty !== undefined &&
        (typeof r.uncertainty !== "string" || r.uncertainty.length > 300))
    )
      return {
        rows: [],
        notice:
          "Invalid or unsupported ingredient value. Nothing was applied; edit the source or add rows manually.",
      };
    rows.push({
      id: `${source}-${rows.length}`,
      name: r.name.trim(),
      amount: r.amount as number | null,
      unit: r.unit as Unit | null,
      source,
      confirmed: false,
      uncertainty:
        typeof r.uncertainty === "string"
          ? r.uncertainty
          : "Identity, quantity and usability require your confirmation.",
    });
  }
  return {
    rows,
    notice: rows.length
      ? "Candidates only. Confirm identity, quantity and usability before planning."
      : "No ingredients identified. Add rows manually; nothing was inferred.",
  };
}
export function reviewIngredients(rows: IngredientRow[]): {
  pantry: Pantry[];
  issues: string[];
  uncovered: string[];
} {
  const pantry: Pantry[] = [],
    issues: string[] = [],
    uncovered: string[] = [],
    seen = new Set<string>();
  for (const row of rows) {
    const name = row.name.trim(),
      known = ingredientIdentity(name),
      id = known?.id ?? `other-${normalise(name)}`;
    if (
      !name ||
      name.length > 70 ||
      row.amount === null ||
      !Number.isFinite(row.amount) ||
      row.amount < 0 ||
      row.amount > 10000 ||
      !row.unit ||
      !units.includes(row.unit)
    ) {
      issues.push(
        `${name || "New ingredient"}: enter a valid identity, quantity and unit.`,
      );
      continue;
    }
    if (!row.confirmed) {
      issues.push(`${name}: confirm identity, quantity and usability.`);
      continue;
    }
    if (seen.has(id)) {
      issues.push(
        `${name}: duplicate ingredient. Combine the quantities into one row.`,
      );
      continue;
    }
    seen.add(id);
    const baseUnit =
      row.unit === "kg" ? "g" : row.unit === "l" ? "ml" : row.unit;
    if (known && baseUnit !== known.unit) {
      issues.push(
        `${name}: this recipe catalogue needs ${known.unit}; do not guess a weight from a count.`,
      );
      continue;
    }
    if (!known) uncovered.push(name);
    pantry.push({
      id,
      name: known?.name ?? name,
      quantity: { amount: row.amount, unit: row.unit },
      reviewed: true,
    });
  }
  return { pantry, issues, uncovered };
}
export const groceryQuestion =
  'Review only visible food ingredients in this fridge/pantry photo. In your What I can see section include exactly one JSON code block: {"ingredients":[{"name":"Tomatoes","amount":null,"unit":"g","uncertainty":"Weight cannot be determined from this photo"}]}. Maximum 20 rows. Quantity must be null unless an exact count or clear package quantity is visible. Do not guess weights, hidden stock, freshness, expiry, allergens or food safety. Use units g, kg, ml, l or each; use null if unclear. Do not include non-food items. These are uncertain candidates for human correction, never approved stock.';
