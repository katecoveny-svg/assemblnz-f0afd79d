import { z } from 'zod';
/** Staged contract only. No UI, persistence, provider, schedule or dosing interpretation. */
export const ManualMedicationRecordSchema = z.object({
  sample: z.literal(true), source: z.literal('user-entered'), reviewed: z.literal(true),
  medicineLabel: z.string().trim().min(1).max(80),
  recordedAt: z.iso.datetime({ offset: true }),
  amountAsEntered: z.string().regex(/^\d{1,4}(\.\d{1,4})?$/),
  unitAsEntered: z.enum(['mg', 'ml']),
  action: z.literal('record-only'),
}).strict();
