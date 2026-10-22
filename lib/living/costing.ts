/**
 * assembl / living — cost, price and timeline for anything the builder puts together
 * ----------------------------------------------------------------------------------
 * The same model as tools/living-cad/launch/cost_model.py (COSTING-20261021.md), so a builder total and a catalogue
 * row agree: filament by material, print hours by deposition rate plus a setup per job, machine time, handling
 * labour, a failure allowance, packing once per order, and a retail price that keeps the target margin after GST
 * and card fees. The timeline is print hours on one printer plus packing and NZ Post. All of it is an estimate,
 * never a quote, and nothing here is for sale.
 */

import { CAD_MANIFEST } from './catalogue';

export const COST_ASSUMPTIONS = {
  gst: 1.15,
  filamentPerKg: { 'PLA Matte': 42, PLA: 40, PETG: 45, Translucent: 48, ASA: 50, TPU: 75, 'PETG-CF': 95, 'PA12-CF': 150, 'PPA-CF': 190, PA: 110 } as Record<string, number>,
  depositionGPerH: { TPU: 7, 'PPA-CF': 11, 'PA12-CF': 11, 'PETG-CF': 12, PETG: 16, ASA: 15, PLA: 20 } as Record<string, number>,
  waste: 0.08,
  setupHPerJob: 0.12,
  extraCopyH: 0.02,
  machinePerH: 0.6,
  labourPerH: 35,
  handlingMinPerJob: 2.5,
  handlingMinPerCopy: 0.5,
  packMinPerOrder: 6,
  packagingSmall: 2.2,
  packagingLarge: 3.6,
  failure: 0.06,
  payPct: 0.0265,
  payFix: 0.3,
  margin: 0.55,
  printHoursPerDay: 14,
  packDays: 1,
  postDays: [1, 3] as [number, number],
  note: 'Estimated from the print files: mass by material, print time by deposition rate, NZD 35/h handling, packing once per order, 55 % margin after GST and card fees. Not a slicer result and not a quote.',
};

const A = COST_ASSUMPTIONS;
const PARTS = new Map(CAD_MANIFEST.parts.map((p) => [p.id, p]));

function rate<T>(table: Record<string, T>, material: string, order: string[], fallback: string): T {
  const m = material.toLowerCase();
  const k = order.find((key) => m.includes(key.toLowerCase()));
  return table[k ?? fallback];
}

const filamentRate = (material: string) => rate(A.filamentPerKg, material, ['PPA-CF', 'PA12-CF', 'PETG-CF', 'TPU', 'Translucent', 'ASA', 'PETG', 'PLA Matte', 'PLA', 'PA'], 'PETG');
const deposition = (material: string) => rate(A.depositionGPerH, material, ['TPU', 'PPA-CF', 'PA12-CF', 'PETG-CF', 'PETG', 'ASA', 'PLA'], 'PETG');

/** Shelf prices: 50 c steps to $20, whole dollars to $60, $5 steps above. */
export function shelfPrice(price: number): number {
  if (price <= 20) return Math.ceil(price * 2) / 2;
  if (price <= 60) return Math.ceil(price);
  return Math.ceil(price / 5) * 5;
}

export type PartLine = { id: string; qty: number };

export type Estimate = {
  grams: number;
  printHours: number;
  files: number;
  jobs: number;
  materialNzd: number;
  costNzd: number;
  priceNzd: number;
  days: { print: number; ready: number; door: [number, number] };
  unknown: string[];
};

/** Merges duplicate part ids (identical copies print in one job), then costs the lot as one order. */
export function estimate(lines: PartLine[]): Estimate {
  const merged = new Map<string, number>();
  for (const l of lines) if (l.qty > 0) merged.set(l.id, (merged.get(l.id) ?? 0) + l.qty);
  let g = 0, hours = 0, material = 0, jobs = 0, copies = 0;
  const unknown: string[] = [];
  for (const [id, q] of merged) {
    const p = PARTS.get(id);
    if (!p) { unknown.push(id); continue; }
    const mass = p.mass_g_pla * (p.material.includes('PETG') ? 1.27 / 1.24 : 1);
    g += mass * q;
    material += ((mass * (1 + A.waste)) / 1000) * filamentRate(p.material) * q;
    hours += A.setupHPerJob + A.extraCopyH * (q - 1) + (mass * q) / deposition(p.material);
    jobs += 1; copies += q;
  }
  const machine = hours * A.machinePerH;
  const handling = (A.labourPerH * (A.handlingMinPerJob * jobs + A.handlingMinPerCopy * copies)) / 60;
  const packing = (A.labourPerH * A.packMinPerOrder) / 60;
  const packaging = g * 1.3 + 40 > 300 ? A.packagingLarge : A.packagingSmall;
  const fail = A.failure * (material + machine);
  const cost = jobs ? material + machine + handling + fail + packing + packaging : 0;
  const ex = (cost + A.payFix) / (1 - A.margin - A.payPct * A.gst);
  const printDays = hours > 0 ? Math.ceil(hours / A.printHoursPerDay) : 0;
  const ready = printDays + (jobs ? A.packDays : 0);
  return {
    grams: Math.round(g * 10) / 10,
    printHours: Math.round(hours * 10) / 10,
    files: copies,
    jobs,
    materialNzd: Math.round(material * 100) / 100,
    costNzd: Math.round(cost * 100) / 100,
    priceNzd: jobs ? shelfPrice(ex * A.gst) : 0,
    days: { print: printDays, ready, door: jobs ? [ready + A.postDays[0], ready + A.postDays[1]] : [0, 0] },
    unknown,
  };
}
