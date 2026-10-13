"use client";
import { Plus, Trash2 } from "lucide-react";
import {
  knownIngredients,
  newIngredient,
  units,
  type IngredientRow,
} from "./ingredients";
export function IngredientEditor({
  rows,
  onChange,
}: {
  rows: IngredientRow[];
  onChange: (rows: IngredientRow[]) => void;
}) {
  const edit = (id: string, change: Partial<IngredientRow>) =>
    onChange(
      rows.map((r) =>
        r.id === id ? { ...r, ...change, confirmed: false } : r,
      ),
    );
  return (
    <div className="ld-ingredients">
      <h3>Your pantry, reviewed.</h3>
      <p>
        Confirm each ingredient yourself. Unknown is different from zero. Add
        missing items or remove anything you cannot verify. Removing an item
        means no stock is deducted for it.
      </p>
      <datalist id="ld-known-ingredients">
        {knownIngredients.map((k) => (
          <option key={k.id} value={k.name} />
        ))}
      </datalist>
      {rows.map((r, i) => (
        <fieldset key={r.id}>
          <legend>
            Ingredient {i + 1} · {r.source}
          </legend>
          <div className="ld-ingredient-fields">
            <label>
              Name
              <input
                aria-label={`Ingredient ${i + 1} name`}
                list="ld-known-ingredients"
                value={r.name}
                maxLength={70}
                onChange={(e) => edit(r.id, { name: e.target.value })}
              />
            </label>
            <label>
              Available
              <input
                aria-label={`Ingredient ${i + 1} quantity`}
                type="number"
                min="0"
                max="10000"
                step="any"
                placeholder="Unknown"
                value={r.amount ?? ""}
                onChange={(e) =>
                  edit(r.id, {
                    amount:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Unit
              <select
                aria-label={`Ingredient ${i + 1} unit`}
                value={r.unit ?? ""}
                onChange={(e) =>
                  edit(r.id, {
                    unit: (e.target.value || null) as IngredientRow["unit"],
                  })
                }
              >
                <option value="">Unknown</option>
                {units.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
            <button
              aria-label={`Remove ingredient ${i + 1}`}
              onClick={() => onChange(rows.filter((v) => v.id !== r.id))}
            >
              <Trash2 size={18} />
            </button>
          </div>
          <p className="ld-uncertainty">{r.uncertainty}</p>
          <label className="ld-check">
            <input
              type="checkbox"
              aria-label={`Confirm ingredient ${i + 1}`}
              checked={r.confirmed}
              disabled={
                !r.name.trim() ||
                r.amount === null ||
                !r.unit ||
                r.amount < 0 ||
                r.amount > 10000 ||
                !Number.isFinite(r.amount)
              }
              onChange={(e) =>
                onChange(
                  rows.map((v) =>
                    v.id === r.id ? { ...v, confirmed: e.target.checked } : v,
                  ),
                )
              }
            />
            <span>I checked this ingredient, usable quantity and unit.</span>
          </label>
        </fieldset>
      ))}
      <button
        className="ld-text-button"
        onClick={() => onChange([...rows, newIngredient()])}
        disabled={rows.length >= 30}
      >
        <Plus size={17} />
        Add ingredient
      </button>
    </div>
  );
}
