'use client';
import { Plus, Trash2 } from 'lucide-react';
import { INGREDIENTS, ingredientByName } from '@/lib/do/shop/catalogue';
import type { Pantry, Unit } from '@/lib/do/shop/preparation';

export type PantryRow = { key: string; name: string; amount: number | null; unit: Unit | null; confirmed: boolean; source: 'brief' | 'manual' };
const UNITS: Unit[] = ['g', 'kg', 'ml', 'l', 'each'];
export function newPantryRow(name = '', source: PantryRow['source'] = 'manual'): PantryRow {
  const known = ingredientByName(name);
  return { key: crypto.randomUUID(), name: known?.name ?? name, amount: null, unit: known?.unit ?? null, confirmed: false, source };
}
/** Confirmed rows become reviewed pantry stock. Unknown is not zero: an unconfirmed row deducts nothing. */
export function reviewPantry(rows: PantryRow[]): { pantry: Pantry[]; issues: string[] } {
  const pantry: Pantry[] = [], issues: string[] = [], seen = new Set<string>();
  for (const row of rows) {
    const name = row.name.trim(), known = ingredientByName(name);
    if (!name) { issues.push('Name the ingredient or remove the row.'); continue; }
    if (!known) { issues.push(`${name}: not in this dinner catalogue, so it cannot be deducted. Keep it for your own notes.`); continue; }
    if (row.amount === null || !Number.isFinite(row.amount) || row.amount < 0 || row.amount > 10000 || !row.unit) { issues.push(`${known.name}: enter how much you have and the unit.`); continue; }
    const baseUnit = row.unit === 'kg' ? 'g' : row.unit === 'l' ? 'ml' : row.unit;
    if (baseUnit !== known.unit) { issues.push(`${known.name}: the catalogue counts this in ${known.unit}; do not guess a weight from a count.`); continue; }
    if (!row.confirmed) { issues.push(`${known.name}: tick to confirm you checked it.`); continue; }
    if (seen.has(known.id)) { issues.push(`${known.name}: listed twice; combine into one row.`); continue; }
    seen.add(known.id);
    pantry.push({ id: known.id, name: known.name, quantity: { amount: row.amount, unit: row.unit }, reviewed: true });
  }
  return { pantry, issues };
}
export function PantryEditor({ rows, onChange, disabled }: { rows: PantryRow[]; onChange: (rows: PantryRow[]) => void; disabled?: boolean }) {
  const edit = (key: string, change: Partial<PantryRow>) => onChange(rows.map(row => row.key === key ? { ...row, ...change, confirmed: false } : row));
  return <div className="shop-pantry">
    <datalist id="shop-known-ingredients">{INGREDIENTS.map(item => <option key={item.id} value={item.name} />)}</datalist>
    {rows.map((row, index) => <fieldset key={row.key} disabled={disabled}>
      <legend>Item {index + 1}{row.source === 'brief' ? ' · from your brief' : ''}</legend>
      <div className="shop-pantry-fields">
        <label>Ingredient<input aria-label={`Item ${index + 1} name`} list="shop-known-ingredients" value={row.name} maxLength={70} onChange={event => { const known = ingredientByName(event.target.value); edit(row.key, { name: event.target.value, unit: known?.unit ?? row.unit }); }} /></label>
        <label>You have<input aria-label={`Item ${index + 1} quantity`} type="number" min="0" max="10000" step="any" placeholder="Unknown" value={row.amount ?? ''} onChange={event => edit(row.key, { amount: event.target.value === '' ? null : Number(event.target.value) })} /></label>
        <label>Unit<select aria-label={`Item ${index + 1} unit`} value={row.unit ?? ''} onChange={event => edit(row.key, { unit: (event.target.value || null) as Unit | null })}><option value="">Unknown</option>{UNITS.map(unit => <option key={unit}>{unit}</option>)}</select></label>
        <button type="button" aria-label={`Remove item ${index + 1}`} onClick={() => onChange(rows.filter(item => item.key !== row.key))}><Trash2 size={16} /></button>
      </div>
      <label className="prep-check"><input type="checkbox" aria-label={`Confirm item ${index + 1}`} checked={row.confirmed} disabled={!row.name.trim() || row.amount === null || !row.unit} onChange={event => onChange(rows.map(item => item.key === row.key ? { ...item, confirmed: event.target.checked } : item))} />I checked this in the kitchen</label>
    </fieldset>)}
    <button type="button" className="shop-text-button" disabled={disabled || rows.length >= 30} onClick={() => onChange([...rows, newPantryRow()])}><Plus size={16} /> Add something you already have</button>
  </div>;
}
