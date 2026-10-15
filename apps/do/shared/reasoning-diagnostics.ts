import { APICallError, NoObjectGeneratedError, NoOutputGeneratedError } from 'ai';

export type GenerationStage = 'provider' | 'model' | 'finish' | 'schema' | 'evidence';
/** Closed diagnostic vocabulary only. Never serialize error/cause, messages,
 * headers, model-returned identifiers, prompts, outputs or owner identity. */
export function generationFailureDiagnostic(error: unknown, stage: GenerationStage, timedOut: boolean) {
  if (timedOut) return { category: 'timeout' } as const;
  if (APICallError.isInstance(error)) return {
    category: 'provider_http' as const,
    status: Number.isInteger(error.statusCode) && error.statusCode! >= 100 && error.statusCode! <= 599 ? error.statusCode : null,
  };
  if (NoObjectGeneratedError.isInstance(error)) return { category: 'structured_output' } as const;
  if (NoOutputGeneratedError.isInstance(error)) return { category: 'empty_output' } as const;
  if (stage === 'model') return { category: 'wrong_model' } as const;
  if (stage === 'finish') return { category: 'incomplete_output' } as const;
  if (stage === 'schema') return { category: 'schema_validation' } as const;
  if (stage === 'evidence') return { category: 'evidence_validation' } as const;
  return { category: 'provider_or_sdk' } as const;
}
