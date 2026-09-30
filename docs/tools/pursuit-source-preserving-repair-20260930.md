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

## Live finding and partial shortlist follow-up

The authorised single preview run `9cf34eed-c4f1-4e0a-a8b9-109c8584cc0f` failed with `untraced_outreach_source`. Preview logs pinpointed `prospect.website` after 42,182ms initial research, five searches and seven overlong fields. Same-ID replay returned the durable failed reservation before provider execution; no fresh-ID retry was made. There was no draft or export. The failed payload was unavailable, so original research versus formatter reassignment could not be distinguished.

The existing campaign schema permits zero prospects. The follow-up therefore adds a partial shortlist parser used by both direct research and formatting repair. It first validates the campaign schema and seller, then requires each prospect's website and signal URL to occur in the returned source trail. It does not map guessed prospect homepages onto same-domain pages. Untraced identity/signal URLs, duplicate accounts and the seller itself are omitted with a clear counted gap. Every retained account and the complete retained set pass the unchanged strict parser. Seller, draft evidence, shape/length and formatter URL drift failures still fail the request.

Formatter validation now preserves company/website/signal associations, rather than treating a URL elsewhere in the original response as permission to move it onto another account. Safe diagnostics include only field, index and category. Research instructions require a search-returned primary company page before drafting an account and prefer fewer accounts or zero to exhausting a quota. Existing two-provider-call/five-search/token/deadline bounds are unchanged.

An empty set explicitly says **No verified shortlist** in its gap, response warning and UI. It exposes no outreach export or unsupported account. This is a completed research attempt with no verified prospect discovery, not a claim of finding leads. The retained evidence draft remains independently source validated.

Local proof: 47 focused tests cover mixed/all-invalid prospects, duplicate/seller identities, source-returned identity requirements, gap bounds, fatal seller/schema/draft failures, both research paths, and formatter insertion/reassignment. Browser proof adds zero-shortlist disclosure and absence of accounts/export at 375px and 1440px. Exact follow-up CI/preview status is recorded in the PR. A further capped preview smoke could verify the live prompt and partial-result behavior, but it requires separate authorisation; no additional provider call is implied by these tests.
