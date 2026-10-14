# Foundation UI contract

This is the integration contract for the visual owner; no UI components are changed in this PR.

## Optional account memory

Guest GET `/api/do/personal/memory` returns `records:[]`, `storage:'none'`, `saved:false`, `workspaceKey:'guest'`, notice and fictional-family boundary. No account link is needed. Authenticated GET returns account records only after storage/purge succeeds. A 503 means unavailable; never render local defaults as saved account data.

Use the server notice verbatim before consent. Show that memory is optional, owner-only and used only for the owner's review; it is not shared with family or providers. No live family-entry form, school/health ingestion, role expansion or provider-memory checkbox in this phase. The typed family preview accepts fictional generic aliases only.

POST requires same origin and a signed-in non-anonymous owner. The UI never supplies owner identity. Save includes `action:'save'`, a newly generated UUID for new context, `expectedRevision:0` (or current revision for edits), `subject:'self'`, kind preference/routine/ongoing_context, bounded text, `source:'owner_entered'`, observedAt, retentionDays 7/30/90, active, explicit consent/selfOnly/nonSensitive true and noticeVersion 1. Do not retain the three consent checkbox states across sessions or identity changes.

Show provenance, consent/review dates and expiry beside each saved record. Review/pause/delete send action, id and expectedRevision. A 409 means reload before editing; never silently replace a newer edit. Delete success returns a null record; remove text and clear local undo/caches. A new record after deletion/expiry needs a fresh UUID. A failed save/delete is unconfirmed, not successful. Paused records remain visible for review with active false; they do not grant any tools or preparation authority. The feature remains off until root release gates clear.

Clear component state, pending requests, drafts, consent and original input on identity/workspace switch. Discard late responses belonging to the previous workspace. Do not copy records into browser persistent storage, analytics, logs, assistant prompts, voice settings, availability/travel adapters or existing job notes automatically.

## Persistent preparation and review

Existing GET `/api/do/personal` retains responsibilities/runs/worker and adds `reviewQueue`. Responsibilities expose id/revision/nextRunAt/status/preparationRule/permissionExpiresAt. Worker health is computed from configuration and heartbeat; it is separate from draft completion and source verification.

Each queue item exposes id/responsibilityId/revision/status/receipt/requiresReview/preparedAt/evidence/externalAction. Receipts are pending, incomplete, prepared_draft, acknowledged_draft, preparation_failed or cancelled. Review acknowledges a draft; it does not authorize external actions. Render actual output/evidence and source freshness, never an invented booking or completion receipt. Existing save/pause/delete/review endpoints remain the source of job state.

Travel/availability callers must validate owner-scoped responsibility and run IDs plus revision server-side before persisting anything. Preserve observed/verified/expiry timestamps from adapters. A recent worker heartbeat is not verified live availability. No receipt may include original boarding-pass text, identifiers, family context, credentials or clinical information. Session-only manual original input must be cleared explicitly and on context switch.

## Maintenance status

Maintenance monitoring is service-only aggregate operational data, not a public or owner-visible cross-account dashboard. A support operator can derive health with memoryPurgeHealth. Show no always-on claim. Owner UI can explain expiry exclusion and unconfirmed cleanup honestly, without exposing aggregate counts or other users' identifiers. Scheduler activation and monitoring remain an operational release gate.
