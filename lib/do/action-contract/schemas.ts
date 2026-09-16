import { z } from 'zod';

import {
  ACTION_STAGES,
  ACTION_STATUSES,
  CONTRACT_VERSION,
  RISK_CLASSES,
} from './constants';

export const riskClassSchema = z.enum(RISK_CLASSES);
export const actionStageSchema = z.enum(ACTION_STAGES);
export const actionStatusSchema = z.enum(ACTION_STATUSES);

export const actionDefinitionSchema = z.object({
  name: z.string().min(1).max(128),
  namespace: z.string().min(1).max(128),
  version: z.string().min(1).max(32),
  title: z.string().min(1).max(256),
  description: z.string().max(2000).default(''),
  risk_class: riskClassSchema,
  idempotent: z.boolean().default(false),
  undoable: z.boolean().default(false),
  transports: z.array(z.enum(['rest', 'sdk', 'mcp', 'webhook'])).min(1),
});

export const actionContractSchema = z.object({
  contract_version: z.literal(CONTRACT_VERSION).default(CONTRACT_VERSION),
  action: actionDefinitionSchema,
  input_schema: z.record(z.string(), z.unknown()),
  output_schema: z.record(z.string(), z.unknown()).optional(),
  permissions: z
    .object({
      scopes: z.array(z.string()).default([]),
      max_amount: z.number().nullable().optional(),
      requires_human: z.boolean().default(false),
    })
    .default({ scopes: [], requires_human: false }),
  adapters: z
    .object({
      primary: z.string().min(1),
    })
    .optional(),
  policy_refs: z.array(z.string()).default([]),
});

export const doErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  retryable: z.boolean().default(false),
  details: z.record(z.string(), z.unknown()).default({}),
});

export const universalResponseSchema = z.object({
  ok: z.boolean(),
  action_id: z.string().nullable().default(null),
  action_name: z.string().nullable().default(null),
  stage: actionStageSchema,
  status: actionStatusSchema,
  prep_id: z.string().nullable().default(null),
  permit_id: z.string().nullable().default(null),
  receipt_id: z.string().nullable().default(null),
  wait_id: z.string().nullable().default(null),
  verify: z
    .object({
      passed: z.boolean(),
      checks: z.array(z.string()).default([]),
    })
    .nullable()
    .default(null),
  result: z.unknown().nullable().default(null),
  errors: z.array(doErrorSchema).default([]),
  risk: z.object({
    class: riskClassSchema,
    flags: z.array(z.string()).default([]),
  }),
  meta: z.object({
    contract_version: z.literal(CONTRACT_VERSION).default(CONTRACT_VERSION),
    idempotency_key: z.string().nullable().default(null),
    request_id: z.string().min(1),
    server_time: z.string().min(1),
  }),
});

export const prepareRequestSchema = z.object({
  action_name: z.string().min(1).max(128),
  namespace: z.string().min(1).max(128).default('demo'),
  args: z.record(z.string(), z.unknown()),
  idempotency_key: z.string().trim().min(8).max(128).optional(),
  tenant_id: z.string().trim().min(1).max(128).default('ten_demo'),
  agent_id: z.string().trim().min(1).max(128).optional(),
});

export const permitRequestSchema = z.object({
  prep_id: z.string().min(1),
  scopes: z.array(z.string()).optional(),
  ttl_seconds: z.number().int().min(30).max(86_400).optional(),
  constraints: z
    .object({
      args_hash: z.string().optional(),
      max_uses: z.number().int().min(1).max(100).optional(),
    })
    .optional(),
});

export const executeRequestSchema = z.object({
  permit_id: z.string().min(1),
  prep_id: z.string().min(1),
  idempotency_key: z.string().trim().min(8).max(128).optional(),
  /** Optional attacker/test override — normally ignored; execute uses locked prep args. */
  args: z.record(z.string(), z.unknown()).optional(),
});

export const waitRegisterRequestSchema = z.object({
  action_id: z.string().min(1),
  kind: z.string().min(1).max(64).default('external_confirmation'),
  timeout_seconds: z.number().int().min(1).max(86_400).default(3600),
});

export const waitResolveRequestSchema = z.object({
  wait_id: z.string().min(1),
  result: z.unknown().optional(),
});

export const verifyRequestSchema = z.object({
  action_id: z.string().min(1),
  checks: z.array(z.string()).default(['result_present']),
});

export const receiptRequestSchema = z.object({
  action_id: z.string().min(1).optional(),
  receipt_id: z.string().min(1).optional(),
}).refine((v) => Boolean(v.action_id || v.receipt_id), {
  message: 'action_id or receipt_id is required',
});

export type ActionContract = z.infer<typeof actionContractSchema>;
export type UniversalResponse = z.infer<typeof universalResponseSchema>;
export type DoError = z.infer<typeof doErrorSchema>;
export type PrepareRequest = z.infer<typeof prepareRequestSchema>;
export type PermitRequest = z.infer<typeof permitRequestSchema>;
export type ExecuteRequest = z.infer<typeof executeRequestSchema>;
export type WaitRegisterRequest = z.infer<typeof waitRegisterRequestSchema>;
export type WaitResolveRequest = z.infer<typeof waitResolveRequestSchema>;
export type VerifyRequest = z.infer<typeof verifyRequestSchema>;
export type ReceiptRequest = z.infer<typeof receiptRequestSchema>;
