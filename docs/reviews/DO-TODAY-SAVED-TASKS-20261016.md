# Today saved tasks — 16 October 2026

Today now lists the actual open checklists and their next steps beside the existing Write/Talk/Add entry. Existing account save/open controls are directly under that list. Opening saved work does not automatically expand a second board; selecting a task opens its review.

Account storage remains explicit. Nothing is retrieved on page load or automatically uploaded. The existing owner-bound, revision-checked checklist service is reused; no flags, schema, permissions or providers changed. Pet routines remain session-only.

Within this page, explicit refresh compares local work against the last retrieved/saved baseline: untouched records follow remote edits/removals; dirty local records and local removals remain intact, with conflicts disclosed. A reload has no baseline and retains the conservative local-wins merge. A subsequent explicit consented save replaces the account collection.

Refresh invalidates review/provider consent and undo. Unfinished task/Pet editing blocks refresh, including an edit started while a GET is pending; the response uses the current callback and cannot silently discard edit text. Owner-keyed cloud state aborts and discards requests on account change.

Validation: 58 checklist/service/API/component tests and 12 account storage/interruption tests passed locally; scoped ESLint, macron and diff checks passed. Synthetic browser proof covers separate desktop browser restoration, no automatic read/upload, actual Today titles, remote update consent invalidation, held-response edit preservation, CAS conflicts, explicit removal retaining local work, and 320/375/430/600px layout. Hosted clean dependency typecheck/build/full core proof remain required before release.

Deployment prerequisites: existing do_personal_checklist_cloud migration (20260930063926), owner RLS, service-only revision-checked save RPC. Metadata-only production catalog inspection confirmed these exist; no private rows or save RPC were accessed. No additional migration or activation flag is required for this change. Real authenticated cross-device persistence is not claimed from synthetic fixtures.

Unrelated Gmail health remains reconnect/unverified in the normal signed-in Mail selector. No mail content, new OAuth scope, grant or private data was accessed. Talk remains Gemini Live; reported language/accent drift is an outstanding acceptance issue owned by the voice worker. No paid voice audition occurred.
