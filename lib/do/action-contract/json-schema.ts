import { CONTRACT_VERSION, RISK_CLASSES, ACTION_STAGES, ACTION_STATUSES } from './constants';

/**
 * JSON Schema drafts for Action Contract + universal response (OpenAPI-friendly).
 * Kept as plain objects so routes and OpenAPI can embed without a generator.
 */
export const actionContractJsonSchema = {
  $id: 'https://assembl.co.nz/schemas/do-action-contract-0.1.0.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'DO Action Contract',
  type: 'object',
  required: ['contract_version', 'action', 'input_schema'],
  additionalProperties: false,
  properties: {
    contract_version: { const: CONTRACT_VERSION },
    action: {
      type: 'object',
      required: ['name', 'namespace', 'version', 'title', 'risk_class', 'transports'],
      properties: {
        name: { type: 'string' },
        namespace: { type: 'string' },
        version: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        risk_class: { type: 'string', enum: [...RISK_CLASSES] },
        idempotent: { type: 'boolean' },
        undoable: { type: 'boolean' },
        transports: {
          type: 'array',
          items: { type: 'string', enum: ['rest', 'sdk', 'mcp', 'webhook'] },
          minItems: 1,
        },
      },
    },
    input_schema: { type: 'object' },
    output_schema: { type: 'object' },
    permissions: {
      type: 'object',
      properties: {
        scopes: { type: 'array', items: { type: 'string' } },
        max_amount: { type: ['number', 'null'] },
        requires_human: { type: 'boolean' },
      },
    },
    adapters: {
      type: 'object',
      properties: { primary: { type: 'string' } },
    },
    policy_refs: { type: 'array', items: { type: 'string' } },
  },
} as const;

export const universalResponseJsonSchema = {
  $id: 'https://assembl.co.nz/schemas/do-universal-response-0.1.0.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'DO Universal Response',
  type: 'object',
  required: ['ok', 'stage', 'status', 'errors', 'risk', 'meta'],
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean' },
    action_id: { type: ['string', 'null'] },
    action_name: { type: ['string', 'null'] },
    stage: { type: 'string', enum: [...ACTION_STAGES] },
    status: { type: 'string', enum: [...ACTION_STATUSES] },
    prep_id: { type: ['string', 'null'] },
    permit_id: { type: ['string', 'null'] },
    receipt_id: { type: ['string', 'null'] },
    wait_id: { type: ['string', 'null'] },
    verify: {
      type: ['object', 'null'],
      properties: {
        passed: { type: 'boolean' },
        checks: { type: 'array', items: { type: 'string' } },
      },
    },
    result: {},
    errors: {
      type: 'array',
      items: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          retryable: { type: 'boolean' },
          details: { type: 'object' },
        },
      },
    },
    risk: {
      type: 'object',
      required: ['class'],
      properties: {
        class: { type: 'string', enum: [...RISK_CLASSES] },
        flags: { type: 'array', items: { type: 'string' } },
      },
    },
    meta: {
      type: 'object',
      required: ['contract_version', 'request_id', 'server_time'],
      properties: {
        contract_version: { const: CONTRACT_VERSION },
        idempotency_key: { type: ['string', 'null'] },
        request_id: { type: 'string' },
        server_time: { type: 'string', format: 'date-time' },
      },
    },
  },
} as const;
