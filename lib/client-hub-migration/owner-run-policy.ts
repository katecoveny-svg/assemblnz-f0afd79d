import { z } from 'zod';

const uint = z.number().int().safe().nonnegative();
export const runPolicySchema = z.object({
  id:z.string().min(1).max(100), ownerId:z.uuid(), expiresAt:z.string().datetime(), maxRuns:z.literal(1), provider:z.enum(['openai','anthropic']),
  accountRef:z.string().min(1).max(100), model:z.string().min(1).max(100),
  pricingVersion:z.string().min(1).max(100),
  maxCalls:uint.min(1).max(10), maxInputTokens:uint.min(1).max(200_000),
  maxOutputTokens:uint.min(1).max(6000), maxUsdMicros:uint.min(1).max(10_000_000),
  inputUsdMicrosPerMillion:uint.max(1_000_000_000),
  outputUsdMicrosPerMillion:uint.max(1_000_000_000),
  tools:z.literal(false), cache:z.literal(false), retries:z.literal(0), repairs:z.literal(0),
}).strict();
export type RunPolicy = z.infer<typeof runPolicySchema>;
export const sourceReceiptSchema=z.object({id:z.string().min(1).max(100),sha256:z.string().regex(/^[a-f0-9]{64}$/),scope:z.enum(['public','owner-selected']),checkedAt:z.string().datetime()}).strict();
export const createRunSchema=z.object({runId:z.uuid(),inputFingerprint:z.string().regex(/^[a-f0-9]{64}$/),selectedSourceReceipts:z.array(sourceReceiptSchema).max(40),policyId:z.string().min(1).max(100)}).strict();
export type CreateRun = z.infer<typeof createRunSchema>;
export const claimActionSchema=z.object({runId:z.uuid(),actionId:z.uuid(),action:z.enum(['develop','build']),inputFingerprint:z.string().regex(/^[a-f0-9]{64}$/),expectedRevision:uint}).strict();
export type ClaimAction = z.infer<typeof claimActionSchema>;
export const usageSchema=z.object({inputTokens:uint.max(1_000_000),outputTokens:uint.max(1_000_000),cacheTokens:z.literal(0),toolCalls:z.literal(0)}).strict();
export type RunUsage=z.infer<typeof usageSchema>;
export function costMicros(policy:RunPolicy,inputTokens:number,outputTokens:number):number {
  const input=uint.parse(inputTokens), output=uint.parse(outputTokens);
  const numerator=BigInt(input)*BigInt(policy.inputUsdMicrosPerMillion)+BigInt(output)*BigInt(policy.outputUsdMicrosPerMillion);
  const value=(numerator+999_999n)/1_000_000n;
  if(value>BigInt(Number.MAX_SAFE_INTEGER))throw Error('run_cost_overflow');
  return Number(value);
}
export function reserveMicros(policy:RunPolicy):number {
  return costMicros(policy,policy.maxInputTokens,policy.maxOutputTokens);
}
