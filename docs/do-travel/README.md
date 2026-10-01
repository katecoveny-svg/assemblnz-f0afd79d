# DO travel preparation — review module

Extends the existing `apps/do/shared/travel.ts` trip contract. `lib/do/travel/preparation.ts` imports bounded synthetic JSON, prepares a source-bound review draft, projects an instant-ordered timeline and applies an acknowledged summary to the existing editable trip. It does not change the shared UI.

Existing capabilities: editable trip, device-local saves, packing, maps, provider links, print/PDF and an unsent email draft. Air NZ customer workspaces are concept demonstrations, with no established airline API or partnership. Uber Direct is a separate delivery adapter and is not used for passenger transport.

Import requires `synthetic: true`, 1–20 flights, explicit local date/time, offset and IANA timezone. Source evidence includes observed, verified and expiry timestamps. Each flight preserves marketing and operating codes. Calendar errors, DST gaps, ambiguous dates, duplicate codeshares, reversed and overlapping travel are rejected. Date-line travel orders by UTC instant while preserving local dates.

The caller supplies an existing responsibility ID, completed run ID, revision and completion timestamp. This pure library does not verify ownership or persist records; integrate behind the existing authenticated owner/revision boundary. A preparation receipt exists only after successful parsing and validation. Review acknowledgement conveys no permission to book, send or pay. Heartbeat is not evidence verification.

Unknown fields are dropped by an allowlist, including booking reference, passenger name, ticket number, barcode and raw document content. No boarding-pass decoder or valid pass renderer exists. Source IDs must be opaque app IDs, never booking references. Do not persist original JSON, identifiers or document text to account memory, prompts, logs or analytics. Optional memory remains owner-review-only; this module writes none.

`upsertTravel` makes an identical completed-run retry idempotent, rejects older revisions and resets review on new imports. `applyTravelToTrip` requires acknowledgement of the exact revision. Timeline evidence can be synthetic or stale; flight status is always unknown. Imported schedules do not prove current gate, delay, boarding or arrival status.

`uberHandoff()` returns **opens Uber**, the official universal link `https://m.uber.com/looking`, and no location, payment or client identifiers. User chooses location, fare and terms in Uber. No ride is requested by DO. Official documentation checked 1 October 2026: [Uber deep links](https://developer.uber.com/docs/riders/ride-requests/tutorials/deep-links/introduction). URL shape is verified; actual device/app handoff is pending. Airport pickup eligibility and transport availability must be checked in the provider.

Integration blockers: shared visual owner must connect review/timeline to the existing trip; source selection/upload consent and local OCR are not implemented; real documents are disabled; provider approval, authorised status source, owner persistence, retention policy and device handoff proof are pending. Real booking stays disabled until an approved provider and explicit price/terms review exist. No account connection, external send, booking, hold, payment or paid API call is part of this module.

Validation: focused Vitest tests and changed-file ESLint; root typecheck. The fixtures are invented and contain no scannable airport pass. Rollback: remove the unreferenced module and this document; no schema or persisted data changes.
