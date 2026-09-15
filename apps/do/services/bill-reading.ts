import { z } from 'zod';
export const BILL_IMAGE_LIMIT = 2 * 1024 * 1024;
export const billReading = z.object({
  category: z.enum(['electricity', 'broadband', 'mobile']).nullable(),
  currency: z.enum(['NZD', 'other', 'unknown']),
  monthlyCost: z.number().min(1).max(10000).nullable(),
  usage: z.number().min(0).max(100000).nullable(),
  unit: z.enum(['kWh', 'Mbps', 'GB', 'unknown']),
  exitFee: z.number().min(0).max(10000).nullable(),
}).strict();
export type BillReading = z.infer<typeof billReading>;
/** Unknown currency or mismatched units must never silently populate NZ comparisons. */
export function safeBillReading(value: unknown): BillReading {
  const data = billReading.parse(value);
  if (data.currency !== 'NZD') { data.monthlyCost = null; data.exitFee = null; }
  const expected = data.category === 'electricity' ? 'kWh' : data.category === 'broadband' ? 'Mbps' : data.category === 'mobile' ? 'GB' : null;
  if (data.unit !== expected) data.usage = null;
  if (data.monthlyCost === null && data.usage === null && data.exitFee === null) throw new Error('No usable figures');
  return data;
}
