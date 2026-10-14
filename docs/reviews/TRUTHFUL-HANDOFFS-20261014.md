# Local truthful handoffs extraction — 14 October 2026

Base f62bf077ab399a9797fbefa276afc3e3ad20332b. Focused extraction from preserved fdf6ce87; no old layout, fonts or navigation copied.

Trust-pack now returns 503 when every configured receipt/delivery leg fails. Only persisted receipt, successful Slack response or confirmed email acceptance permits accepted:true. Unexpected notification rejection does not discard a confirmed database receipt. This proves acceptance by one leg, not a human reply or inbox delivery. The form preserves fields on failure, non-JSON and unconfirmed HTTP 200; disables edits while pending; only confirmed acceptance clears the draft. Success copy states that the form collects no reply email.

Hui output is reconstructed through a small HTML allowlist without attributes. Provider drafts remain explicitly unverified. Failed/unconfigured/empty provider output preserves raw notes in original order and labels them as raw, unreviewed notes, without invented decisions or actions. Export sanitizes again and retains the submitted provenance label; that label is not independently authenticated evidence. Input size/type bounds and provider timeout are explicit. Existing local-storage hydration is deferred with unmount protection to satisfy current React lint. No transcription, provider activation, payment or authority changes.

Validation: 19 focused route/sanitizer tests; full typecheck; scoped ESLint. Synthetic browser script scripts/review-trust-receipt.cjs exercises 503, malformed JSON, unconfirmed 200 and confirmed acceptance, draft preservation and pending edit lock. All requests intercepted; no live providers, persisted submissions or private records.

Local candidate only. Independent review and hosted CI remain pending; no push, PR, merge or deploy requested for this overnight extraction.

Independent review correction: the previous export parser silently discarded headingless/preamble content and reordered lists after paragraphs. Export now walks sanitized markup in document order, retaining headingless, preamble, subheading and list-item text; heading-only output is explicitly rejected. Four added regressions cover paragraph-only actual content, mixed order, malformed markup escaped by sanitizer, and empty-body rejection. 23 focused tests pass, with full typecheck and scoped route lint. New exact head requires independent re-review; previous candidate is superseded.
