/**
 * Tōro filter pipeline — public types.
 *
 * Spec: outputs/TORO-V0.1-ARCHITECTURE-SPEC-2026-05-11.md (§4.3) — Open
 * WebUI-style pre/post hooks composed into a pipeline that every Tōro
 * draft runs through. Hard rule #20 of the canon: no Tōro draft skips
 * the pipeline.
 *
 * Phase boundaries:
 *   before_draft  — fire BEFORE the LLM is called. Mutates incoming
 *                   message (privacy redaction, tikanga gate, consent
 *                   check). Failures stop the pipeline immediately.
 *   after_draft   — fire AFTER the LLM produces a draft body, BEFORE
 *                   it surfaces in the approval inbox. Annotates
 *                   (age-gate, tikanga drift). Mostly non-blocking.
 *   before_send   — fire AFTER human approval, BEFORE Chatwoot send.
 *                   Audit-log write happens here.
 *
 * The shapes for memory and consent payloads use `any` / loose
 * structural types deliberately — the underlying tables ship in the
 * Phase 1 migration (toro_memory_blocks, toro_consent_grants) and the
 * downstream loader does the JSONB → typed-shape mapping. Filters
 * treat them as opaque enough to remain stable across schema
 * iteration.
 */

export type FilterPhase = 'before_draft' | 'after_draft' | 'before_send';

export interface LoadedMemoryBlocks {
  /** `toro_memory_blocks.content` for the `profile` block. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile?: any;
  /** `toro_memory_blocks.content` for the `routines` block. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routines?: any;
  /** Latest entries from `toro_episodic_events`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  episodic?: any[];
  /** `toro_memory_blocks.content` for the `notes` block. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notes?: any;
}

export interface ConsentGrant {
  entity_type: string;
  entity_id: string;
  skill_slug: string;
  granted_at: string;
  revoked_at: string | null;
  /** Optional time-bound expiry (ISO timestamp). null = never expires. */
  expires_at?: string | null;
}

export interface FilterContext {
  tenantId: string;
  conversationId: string;
  incomingMessage: string;
  /** Set after the LLM produces a draft (after_draft / before_send). */
  draftBody?: string;
  pluginSlug: string;
  /** The skill that handled the request, if dispatch resolved one. */
  skillSlug?: string;
  memoryBlocks: LoadedMemoryBlocks;
  consentGrants: ConsentGrant[];
}

export interface FilterResult {
  /** false = stop the pipeline. true = continue. */
  pass: boolean;
  /**
   * Replaces incomingMessage (before_draft) or draftBody (after_draft /
   * before_send) for downstream filters. If absent, the existing value
   * is kept.
   */
  modifiedBody?: string;
  /**
   * Human-readable explanation. Required when pass=false; optional
   * (informational) when pass=true.
   */
  reason?: string;
  /**
   * Object merged into the Mana Receipt's filter-attestation block.
   * One filter, one key by convention (e.g. `{ tikanga_after: 'passed' }`).
   */
  receiptAddition?: Record<string, unknown>;
}

export interface Filter {
  name: string;
  phase: FilterPhase;
  run: (ctx: FilterContext) => Promise<FilterResult>;
}
