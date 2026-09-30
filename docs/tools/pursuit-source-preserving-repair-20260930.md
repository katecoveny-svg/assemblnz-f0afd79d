# Pursuit outreach repair — 30 September 2026

Review branch based on production `ce99584feeb46b493d82ecf4036a70d0041a7342`. Defensive improvement; the exact live failure is not proven fixed.

## Diagnosis

The delegated live evidence reports initial research completed in 40,774 ms with one provider call, five searches and three `too_big` validation issues, followed by `untraced_source`. Code confirms that this enters the single formatting-only outreach pass. That error can come from either the original-URL preservation check or `parseGroundedDraft` checking evidence against the search trail. Without the original and repaired payloads, these causes cannot be distinguished. Read-only Vercel queries timed out over the wider range and returned no matching records over the narrowed range; they did not independently recover the failed payload.

Previously the formatter schema allowed arbitrary strings in URL fields. The instruction to copy URLs exactly was enforced only after generation. The repair now puts the original output's exact HTTPS strings into enums for `url`, `website` and the string branch of nullable `contactUrl`. A new per-request schema prevents cross-request contamination. These strings are not new evidence permissions: all original source, seller-domain, duplicate-account, contact-route and length validators remain in force. The original draft may itself contain an untraced URL, which continues to fail.

The change extends the existing Pursuit repair primitive, adds no tools, retries, leads, credentials, migrations or limits, and preserves nullable contacts. Safe diagnostic tags distinguish `original_urls` from `draft.evidence` in subsequent formatter validation failures; no URL, claim, account or key is logged.

Anthropic documents string enums and nullable `anyOf` support, but also warns about enum casing, schema compilation latency and incomplete/refused outputs. Keep independent validation and the existing deadline. Source: https://platform.claude.com/docs/en/build-with-claude/structured-outputs

## Proof and release boundary

Forty focused Pursuit/API tests pass, including a full mocked research-to-repair path with five searches and three overlong fields. Tests assert a second call without web tools, original URL enums, preserved output, nullable contacts, rejection of newly introduced URLs and rejection of original evidence missing from the search trail. Formatter schema tests cover missing URLs and request isolation. This is mocked transport proof, not live model quality or a replay of the failed request.

Changed-file ESLint, standard `pnpm lint`, canvas build and full `pnpm typecheck` pass with frozen-lockfile dependencies installed in the isolated worktree. Production build status is recorded in the PR. No UI files changed; no browser slot was used.

Before release: review this defensive change, obtain a coordinated preview/live proof slot using the existing approved provider configuration and unchanged capped allowance, verify schema acceptance, source-linked returned draft/campaign, durable receipt and same-ID replay, then approve merge/production deployment separately. No new configuration is required by this patch. Existing failed request IDs are durable failures; a fresh smoke test needs a fresh request ID. If the run still fails, use the new diagnostic field to investigate original research provenance rather than weakening validation.

Rollback: revert the repair commit; no data or configuration changes to undo.
