# Tōro filter pipeline

Open WebUI–style pre/post hooks composed into a phase-aware pipeline that every Tōro draft runs through. Spec: [`outputs/TORO-V0.1-ARCHITECTURE-SPEC-2026-05-11.md`](../../../outputs/TORO-V0.1-ARCHITECTURE-SPEC-2026-05-11.md) §4.3.

> **Hard rule #20 (canon).** No Tōro draft skips the pipeline. Removing or replacing a filter is a per-tenant configuration choice with an audit trail; bypassing the pipeline entirely is forbidden. The `runPipeline()` call is the only sanctioned entry-point and it must run on every inbound message and every outbound send.

## Phases

```
incoming Chatwoot message
  │
  ▼
┌────────────────────┐
│   before_draft     │  ← runs BEFORE the LLM is called
│                    │
│  • tikanga (gate)  │  pass=false ⇒ stop, surface reason in inbox
│  • privacy (redact)│  always pass=true; modifiedBody ⇒ next filter
│  • consent (gate)  │  pass=false ⇒ stop, "consent_missing: <type>"
└─────────┬──────────┘
          ▼
   LLM produces draft
          │
          ▼
┌────────────────────┐
│   after_draft      │  ← runs AFTER the LLM, BEFORE the inbox surface
│                    │
│  • age_gate        │  flags parent_only if a child name is present
│  • tikanga (drift) │  flags missing macrons / banned tokens
└─────────┬──────────┘
          ▼
   draft surfaces in
   /app/toro/inbox
          │
          ▼
   tenant member approves
          │
          ▼
┌────────────────────┐
│   before_send      │  ← runs AFTER human approval, BEFORE Chatwoot
│                    │
│  • audit           │  writes assembl_audit_log; pass=false ⇒ blocks send
└─────────┬──────────┘
          ▼
   Chatwoot API
   POST /messages
          │
          ▼
   Mana Receipt assembled
   from collected receiptAdditions
```

## Files

| File | Role |
| --- | --- |
| `types.ts` | `FilterPhase`, `FilterContext`, `FilterResult`, `Filter`, `ConsentGrant`, `LoadedMemoryBlocks`. |
| `registry.ts` | `TORO_DEFAULT_PIPELINE`, `runPipeline()`, `collectReceiptAdditions()`. |
| `tikanga-before-draft.ts` | Reserved-term gate on the incoming message. |
| `privacy-before-draft.ts` | Redacts NZ phone / IRD / NHI / bank-account patterns to `[REDACTED:phone]` etc. |
| `consent-before-draft.ts` | Per-entity-type consent check against `toro_consent_grants`. |
| `age-gate-after-draft.ts` | Flags drafts that mention a child by name (parent-only approval). |
| `tikanga-after-draft.ts` | Cultural-drift check on the generated draft (macrons, banned tokens). |
| `audit-before-send.ts` | Writes `assembl_audit_log` row; returns its id as `audit_log_id` for Mana Receipt. |
| `index.ts` | Public surface — import the registry and named filters from here. |
| `__tests__/` | Vitest unit tests, one per filter + a registry test. |

## Lifecycle

A typical inbound message goes through three `runPipeline()` calls:

```ts
import {
  TORO_DEFAULT_PIPELINE,
  runPipeline,
  collectReceiptAdditions,
} from '@/lib/toro/filters';

// 1. before_draft — runs on the inbound message before any LLM call.
const pre = await runPipeline(TORO_DEFAULT_PIPELINE, 'before_draft', ctx);
if (!pre.pass) {
  // surface reason in inbox UI; do not call LLM, do not write draft
  return { blocked: true, reason: pre.results.at(-1)?.result.reason };
}

// 2. invoke the LLM with pre.ctx (incomingMessage may be redacted)
const draftBody = await callLlm(pre.ctx.incomingMessage, /* …context… */);

// 3. after_draft — runs on the generated draft before inbox surface.
const post = await runPipeline(
  TORO_DEFAULT_PIPELINE,
  'after_draft',
  { ...pre.ctx, draftBody },
);

// 4. write toro_drafts row with post.ctx.draftBody, plus the merged
//    receipt additions for the eventual Mana Receipt.
const receiptAdditions = collectReceiptAdditions([...pre.results, ...post.results]);
await insertDraft({ /* … */, draftBody: post.ctx.draftBody, receiptAdditions });

// 5. (later, on tenant-member approval) before_send — audit + send.
const send = await runPipeline(
  TORO_DEFAULT_PIPELINE,
  'before_send',
  { ...post.ctx, draftBody: editedOrApprovedBody },
);
if (!send.pass) {
  // audit write failed; block the send, surface error.
}
const auditLogId = collectReceiptAdditions(send.results).audit_log_id;
await chatwoot.postMessage(conversationId, editedOrApprovedBody);
await assembleManaReceipt({ /* …, */ audit_log_id: auditLogId, filters: collectReceiptAdditions([...pre.results, ...post.results, ...send.results]) });
```

## Adding a new filter

1. Create `lib/toro/filters/<phase>-<name>.ts`. Export a `Filter` object whose `name` is `snake_case_with_phase_suffix` (e.g. `tikanga_before_draft`). One filter per file — keeps test imports tight.
2. Body shape:
   ```ts
   import type { Filter, FilterContext, FilterResult } from './types';

   export const myFilter: Filter = {
     name: 'my_filter_name',
     phase: 'before_draft', // or 'after_draft' or 'before_send'
     async run(ctx: FilterContext): Promise<FilterResult> {
       // pure local computation OR a single Supabase call
       return { pass: true, receiptAddition: { my_filter: 'passed' } };
     },
   };
   ```
3. Add the filter to `TORO_DEFAULT_PIPELINE` in `registry.ts` at the right phase position.
4. Add a unit test under `__tests__/<name>.test.ts`. Cover at minimum: pass case, fail case (if blocking), edge case (missing/empty fields).
5. Re-export from `index.ts` if external callers will reach for it directly.

## Composition rules

- **Filters are values, not functions registered by name.** This makes per-tenant overrides a one-line array transformation rather than a registration plumbing job.
- **Order matters within a phase.** `runPipeline()` iterates the array and threads `modifiedBody` between filters. Don't depend on a filter that hasn't run.
- **A filter must do exactly one thing.** No "tikanga + privacy" combo filters. Composition is the registry's job.
- **No network calls outside Supabase.** `consent-before-draft` and `audit-before-send` are the only filters that hit the database; everything else is pure local computation. Calling third-party APIs from inside a filter is a hard no — it makes the pipeline slow, expensive, and unobservable.

## Audit pattern

Each filter produces a `receiptAddition` object that downstream Mana Receipt assembly merges into the receipt's `filters` block. Convention:

| Filter | receiptAddition key |
| --- | --- |
| `tikanga_before_draft` | `tikanga_before` |
| `privacy_before_draft` | `privacy_before` |
| `consent_before_draft` | `consent_before` |
| `age_gate_after_draft` | `age_gate` |
| `tikanga_after_draft` | `tikanga_after` |
| `audit_before_send` | `audit_log_id`, `audit_before` |

`collectReceiptAdditions()` shallow-merges the lot into one object. Use deterministic, filter-specific keys to avoid collisions.

The `audit_log_id` returned by `audit_before_send` is the FK Mana Receipt assembly uses to anchor the receipt to its underlying audit row (canon §7.5 and the Mana Receipts schema).

## Per-tenant overrides

Once tenant configuration ships, swap individual filters or rearrange order by deriving a tenant-specific array from `TORO_DEFAULT_PIPELINE`:

```ts
// Tenant who has signed off on a stricter privacy policy:
const tenantPipeline: Filter[] = [
  ...TORO_DEFAULT_PIPELINE.filter((f) => f.name !== 'privacy_before_draft'),
  myStricterPrivacyFilter,
];
```

The override itself must be auditable: load it from a tenant-config row, not from code branches keyed by tenant id.

## Testing

```sh
pnpm test                # one-shot
pnpm test:watch          # watch mode
pnpm test lib/toro/filters/__tests__/privacy-before-draft.test.ts  # one file
```

Vitest is configured (`vitest.config.ts`) to only pick up `lib/**/*.test.ts` and `app/**/*.test.ts` — the existing Deno tests in `supabase/functions/**` keep using `deno test`.
