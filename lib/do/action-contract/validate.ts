import { actionContractSchema, universalResponseSchema } from './schemas';
import type { ActionContract, UniversalResponse } from './schemas';

export function validateActionContract(input: unknown): {
  ok: true;
  data: ActionContract;
} | {
  ok: false;
  issues: string[];
} {
  const parsed = actionContractSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((i) => `${i.path.join('.') || 'root'}: ${i.message}`),
    };
  }
  return { ok: true, data: parsed.data };
}

export function validateUniversalResponse(input: unknown): {
  ok: true;
  data: UniversalResponse;
} | {
  ok: false;
  issues: string[];
} {
  const parsed = universalResponseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((i) => `${i.path.join('.') || 'root'}: ${i.message}`),
    };
  }
  return { ok: true, data: parsed.data };
}
