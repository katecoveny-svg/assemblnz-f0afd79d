# Pursuit review candidate — no successful live result yet

Branch: feat/pursuit-live-home-20261002. Base: 5ba9818f97470c2feacdfff661e7889ff059ba9e.

Exact failed request: 0abb1150-ec69-4a36-946d-4afe44579bf4, production deployment dpl_BE5sEd9WvviQucgvG1ffNaPc8pDF, HTTP503 untraced_source. Scoped runtime logs: researched stage, 14893ms, providerCalls1, webSearches2, issues[]. General draft source validation failed before formatting. Exact rejected URL not retained, so URL drift/context citation are hypotheses, not proven root cause.

Candidate preserves exact source provenance, adds field/index/category diagnostics only, clarifies model citation permission, prevents illustrated fixture fallback after failure, reuses exact request identity and improves pending/failed recovery messages. No provider/search/token/cost/admission/config changes. Server replay/pending/failed tests prove no research invocation. Mocked browser tests at375/1440 prove same-ID/body recovery, no fixture presented as result, exhausted-allowance changed brief blocked, no page errors/overflow. Every browser research POST was intercepted; these tests prove UI, not live provider success. 24 tests, focused ESLint, typecheck passed. No production build performed in this stage.

exact-uncommitted-workspace.patch includes every source edit plus the unwired homepage component/CSS drafts, which are NOT part of the bounded recovery candidate PR. They need design coordination and a successful genuine recording before integration. Browser evidence/script included. actual-failure.png and pursuit-source-recording.mp4 contain the actual FAILED live request, not a successful demo. No further paid requests authorized before independent review.

## Independent review correction (local, not pushed)

Review found that same-ID recovery through reserveTrial could start research if no row existed. Recovery now sends X-Pursuit-Recovery: lookup-only, which the server enforces by calling recoverTrial only. Its GET query matches ID, principal hash and frozen input hash; missing rows return not_found, never insert. Lookup bypasses the provider-key requirement and cannot call research, reserve, complete or fail. Input body is frozen at first submit; TypeSafe availability changes no longer affect the fingerprint. Pending/unknown/failed/not-admitted/not-found UI states are distinct.

37 focused tests, ESLint, typecheck pass. Browser proof at375/1440 covers TypeSafe availability changing, identical body/mode, rejected429 then missing row, early stop then missing row, network failure then pending receipt. All POSTs intercepted and zero provider calls. Storage query shape tested with mocked HTTP; no live database/credential/config changes.

PR1461 remote remains3179a10c961c5f7503d3734fefae77b3ee6ee219. Independent review approved the lookup-only correction. The final copy distinguishes checking saved status from researching, and says generic failed receipts did not complete. The bounded revision is being committed in one push; no paid retry is approved. exact-uncommitted-workspace.patch is against that remote head; full-candidate.patch is against5ba9818f97470c2feacdfff661e7889ff059ba9e. Unwired homepage drafts are bundled only, not release-ready.
