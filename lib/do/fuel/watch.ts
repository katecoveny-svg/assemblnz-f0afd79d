import { z } from 'zod';

/**
 * Fuel watch: when to fill up, from dated prices and the person's own tank. Deterministic.
 * Prices come from MBIE's weekly national monitoring (an average, not a pump) and from
 * observations the person records at a station. Advice is a suggestion with its reason;
 * DO does not know the pump price until someone looks at it.
 */
export const FUEL_TYPES = ['91', '95', 'diesel'] as const;
export type FuelType = typeof FUEL_TYPES[number];
export const FUEL_LABEL: Record<FuelType, string> = { '91': 'Regular 91', '95': 'Premium 95', diesel: 'Diesel' };

export const fuelObservation = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** NZD per litre. */
  price: z.number().min(0.5).max(10),
  source: z.enum(['mbie_weekly', 'mbie_fallback', 'station']),
  label: z.string().max(80),
}).strict();
export type FuelObservation = z.infer<typeof fuelObservation>;

export const fuelTank = z.object({
  fuel: z.enum(FUEL_TYPES),
  tankLitres: z.number().min(10).max(200),
  /** Litres in the tank now, as read off the gauge. */
  litresLeft: z.number().min(0).max(200),
  /** Litres used in a typical week. */
  weeklyLitres: z.number().min(1).max(500),
  /** Price per litre the person considers good; null means use the recent median. */
  targetPrice: z.number().min(0.5).max(10).nullable(),
}).strict().refine(value => value.litresLeft <= value.tankLitres, 'Litres left cannot exceed the tank.');
export type FuelTank = z.infer<typeof fuelTank>;

export type FuelAdvice = {
  action: 'fill-now' | 'top-up' | 'wait' | 'no-price';
  current: FuelObservation | null;
  recentMedian: number | null;
  trend: 'rising' | 'falling' | 'flat' | 'unknown';
  daysOfFuel: number;
  weeklyCost: number | null;
  fillCost: number | null;
  /** NZD difference on a full fill between today's price and the target or median. */
  fillDifference: number | null;
  reason: string;
};
const median = (values: number[]) => { const s = [...values].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const round = (value: number, places = 2) => Math.round(value * 10 ** places) / 10 ** places;

export function fuelAdvice(tank: FuelTank, observations: FuelObservation[], now = new Date()): FuelAdvice {
  const parsedTank = fuelTank.parse(tank);
  const today = now.toISOString().slice(0, 10);
  const valid = observations.map(value => fuelObservation.parse(value)).filter(value => value.date <= today).sort((a, b) => a.date.localeCompare(b.date));
  const daysOfFuel = round(parsedTank.litresLeft / (parsedTank.weeklyLitres / 7), 1);
  const toFill = parsedTank.tankLitres - parsedTank.litresLeft;
  const current = valid.at(-1) ?? null;
  if (!current) return { action: 'no-price', current: null, recentMedian: null, trend: 'unknown', daysOfFuel, weeklyCost: null, fillCost: null, fillDifference: null, reason: 'No dated price yet. Add the pump price you saw, or wait for the weekly MBIE figure.' };
  const earlier = valid.slice(0, -1).filter(value => Date.parse(current.date) - Date.parse(value.date) <= 8 * 7 * 86_400_000).map(value => value.price);
  const recentMedian = earlier.length >= 2 ? round(median(earlier), 3) : null;
  const trend: FuelAdvice['trend'] = earlier.length >= 2 ? (current.price > median(earlier.slice(-2)) + 0.02 ? 'rising' : current.price < median(earlier.slice(-2)) - 0.02 ? 'falling' : 'flat') : 'unknown';
  const benchmark = parsedTank.targetPrice ?? recentMedian;
  const weeklyCost = round(parsedTank.weeklyLitres * current.price);
  const fillCost = round(toFill * current.price);
  const fillDifference = benchmark === null ? null : round(toFill * (current.price - benchmark));
  const price = `$${current.price.toFixed(2)}/L (${current.label}, ${current.date})`;
  if (daysOfFuel <= 2) return { action: 'fill-now', current, recentMedian, trend, daysOfFuel, weeklyCost, fillCost, fillDifference, reason: `About ${daysOfFuel} days of fuel left. Fill up at ${price}; running out costs more than any price difference.` };
  if (benchmark !== null && current.price <= benchmark) return { action: 'fill-now', current, recentMedian, trend, daysOfFuel, weeklyCost, fillCost, fillDifference, reason: `${price} is at or below your ${parsedTank.targetPrice !== null ? 'target' : 'recent median'} of $${benchmark.toFixed(2)}. A full fill today is about $${fillCost.toFixed(2)}${fillDifference !== null && fillDifference < 0 ? `, $${Math.abs(fillDifference).toFixed(2)} less than at the benchmark` : ''}.` };
  if (trend === 'rising') return { action: 'top-up', current, recentMedian, trend, daysOfFuel, weeklyCost, fillCost, fillDifference, reason: `${price} is above your benchmark and prices have been rising. Topping up now beats waiting; a full fill would cost about $${Math.abs(fillDifference ?? 0).toFixed(2)} more than at the benchmark.` };
  return { action: 'wait', current, recentMedian, trend, daysOfFuel, weeklyCost, fillCost, fillDifference, reason: `${price} is above your benchmark${trend === 'falling' ? ' and prices have been falling' : ''}. With about ${daysOfFuel} days of fuel, waiting for a better price is reasonable.` };
}

/** The reviewed words handed to Personal DO for a daily watch. No address or plate. */
export function fuelWatchAsk(tank: Pick<FuelTank, 'fuel' | 'targetPrice'>, region: string | null) {
  return `Watch ${FUEL_LABEL[tank.fuel]} prices${region ? ` around ${region}` : ''} each morning. ${tank.targetPrice !== null ? `My target is $${tank.targetPrice.toFixed(2)} a litre.` : 'Tell me when the price is below the recent median.'} Prepare a short note saying whether to fill up today and why, with the price source and date. Do not buy anything.`;
}
