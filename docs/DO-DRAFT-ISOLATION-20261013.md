# DO writing draft isolation — review candidate, 13 October 2026

## Scope and reuse

Extends the existing `local-drafts` primitive, writing editor and widget privacy boundary. Reuses the earlier `codex/do-auth-memory-reliability` idea of verified UUID-scoped keys, but removes its optional unscoped/guest fallback. Reuses existing server-cookie `getUser` authentication, native-review transient boundary, and local Playwright fixture approach. No new dependencies, database tables, cloud/provider memory flags, credentials, provider transmission, voice model, or navigation design.

This branch is a draft for independent review. Its Vercel branch deployment is disabled. Do not merge or deploy until approved.

## Changed behavior

- A server-verified UUID is required to list/save/remove account browser drafts. `/api/do/session` GET returns identity only, private/no-store; network/server errors produce 503, never a guest fallback. Missing/expired/anonymous sessions cannot access account storage. POST/DELETE sign-in behavior is unchanged.
- Widget ownership verification no longer queries optional personal-storage tables. Client auth events invalidate, but never authorize identity.
- Account switches/signout discard the old editor instance and revoke pending work. Same-owner reconnect hides the editor until verification succeeds; no model/provider request runs during reconnect. A parent workspace unmount, navigation or browser close still loses unsaved work.
- Anonymous writing is transient. Copy/download before sign-in; it is never silently assigned to the next account. Initial brief/offered context is not replayed into a different identity by the writer.
- Explicit browser saves use an owner-specific Web Lock plus a fresh identity check. A stale opened revision cannot overwrite or remove a changed copy. Repeated save clicks are bounded to one pending transaction.
- Corrupt, unreadable, quota-blocked, or full storage fails with a visible error. No truncation/eviction on the ninth save. Unsupported Web Locks fail without writing; download remains available. Saved-list changes refresh other tabs.
- This is account separation in application behavior, **not encryption or a security boundary against someone controlling the browser profile, DevTools, an extension, or same-origin script**.

## Migration and recovery

There is deliberately **no automatic migration**. `assembl:do:drafts:v1` and historical `:guest` records have no trustworthy owner. The application does not parse/display, adopt, delete or rewrite them. A neutral notice says older unowned records remain untouched. Existing UUID-scoped copies from earlier local work retain the same key and shape and can reopen after owner verification.

New account copies use `assembl:do:drafts:v1:<verified UUID>`. Switching A → B → A recovers A's saved reviewed draft unchanged. Logout does not delete saved copies. A malformed account record is preserved byte-for-byte and blocks writes rather than being interpreted as an empty list.

Legacy recovery is a remaining product gate, not a hidden migration: obtain the original device user's explicit request and establish ownership before a supervised local backup/recovery. Keep that backup private and out of repository/logs. Do not expose an “adopt everything” or raw-export button to whichever account signs in next. A future importer must show the verified destination, allow individual selection/review, copy rather than delete originals, and require separate confirmation. This patch cannot infer historical ownership.

Rollback: revert application changes; retain all keys. **Do not return to a version that automatically displays the legacy device-wide key on shared devices.** A safe rollback disables browser restore/save while leaving stored bytes intact. There is no schema rollback.

## Evidence and limits

- Unit tests: account/browser separation; reviewed draft recovery; unowned/guest data unchanged; unreadable/malformed/full storage; stale edit/remove rejection; serialized transactions; verification/unmount failure; unsupported locks; expired/anonymous/server-failed sessions.
- `scripts/review-do-draft-isolation.cjs`: fictional accounts A/B, populated reviewed source/text, switch/reopen, unowned quarantine, offline/reconnect, real browser localStorage events across two tabs, stale edit rejection, quota failure, cross-tab signout, anonymous transition, 375px screenshots. API/auth routes are intercepted; no real user conversations, tokens, database rows or provider calls.
- Production build/typecheck and DO test suite results accompany the PR. Public production evidence for voice PR #1523 is separate from this unpublished draft.
- Fixtures do not establish live Supabase session refresh/expiry behavior, iOS Safari/PWA suspension, storage eviction, device encryption, or cross-device persistence. Real mic/provider use remains user-initiated only. Browser storage is device-specific, not synced conversation history or approved long-term memory.

## Ranked release blockers and smallest safe release

1. **Shared-device leak on current live writing storage:** addressed by this candidate, pending independent review and real account-switch checks. Legacy ownership remains unknown.
2. **No isolated hosted persistence environment:** Preview previously pointed to production `wurwcrgxjjwqdaxqceey`; never use it for destructive fixture migrations. Local PGlite tests are not hosted RLS/network proof.
3. **No durable conversation history / long-term memory rollout:** conversation/voice state remains transient; do not market cloud recall. Proposed memory schema, readiness RPC, deletion/cleanup and provider-memory flags need a separate approved release.
4. **Actual-device reliability gates:** two real fixture accounts; logout/expired refresh session; phone/desktop reopen; iPhone/PWA background/restore; quota and Web Locks support; one user-initiated call after voice release.

Smallest safe release: independently reviewed voice cleanup (already separately approved/released), then this account-scoped explicit local-writing save/reopen fix. Retain truthful “this account and browser only” language. No new memory-sharing promise, autonomous tasks or future image/email/order scope.

### Regression caught during verification

The companion test caught input loss when ownership revalidation hid an iframe while a same-page launcher moved keyboard focus into it. Embedded frames now revalidate on auth/storage events, page show, visible-page return, reconnect and explicit retry; mere focus movement inside the containing page does not hide the input. Standalone window focus still revalidates. Every storage mutation still verifies identity under its lock. The existing companion suite proves Write/close/reopen retains the same iframe and populated draft.

### Independent review follow-up

The inner writing hook now uses the existing ownership-invalidation helper for `SIGNED_IN`/`USER_UPDATED` while verification is pending. Four actual standalone-editor fixtures defer account A's response, announce B, then release A; only B's populated draft can reopen. The widget's outer privacy boundary already handles this pending-event case, so this is defensive coverage, not a demonstrated exposed widget-account bypass.

A populated two-tab reproduction showed that the original sidebar Remove action deleted tab B's newer saved revision while tab A retained a stale open editor. Remove now compares the opened snapshot when that draft is open; an untouched sidebar-only removal still compares the visible sidebar entry. The actual UI fixture checks the conflict and preservation, in addition to storage-unit tests.

### Existing users and the recovery gate

For an existing unscoped draft, the bytes remain, but the saved title and content no longer appear in the usable list. Signed-in, nonembedded writing shows: “Older device drafts have no recorded owner. They remain untouched and are not opened in this account.” Anonymous users see the page-only writing explanation. Both the unscoped and historical `:guest` key now trigger signed-in recovery guidance using key names only. The owner opens “Recovery options” explicitly; it never reads the stored unowned content. There is no legacy importer or export action in this candidate. Legitimate users may therefore lose application access to old work even though it is preserved.

Users with separately retained downloads can recover their known content into their own documents without opening the shared unknown list. Any supervised recovery must establish original-user authority and individual-item provenance outside the unowned key before disclosure; sign-in/device possession alone is insufficient on a shared profile. Copy only verified items with a visible destination and explicit approval; retain originals privately on-device. If provenance cannot be established, keep the data quarantined—there is no safe automatic recovery. General release requires accepting this access limitation or separately reviewing a recovery process. Do not claim migration is complete.

A further actual UI regression changes only the server identity response to B—without focus, auth or storage notifications—then clicks Save on populated A content. A distinct verified-owner-change error now invalidates both the writer and widget privacy boundary before any new owner is admitted. A's stored copy is untouched; no copy is assigned to B. A separate network-failure case proves unsaved edits remain visible and unchanged when identity cannot temporarily be checked. A confirmed account change intentionally clears the old unsaved view; it is not silently saved or transferred.

The same-editor recovery test also covers Remove → Save: a successful removal by this editor releases its saved revision so an explicit fresh save can recreate the copy. A removal by another tab does not release that revision and still conflicts. Completion of a save cannot replace the snapshot of a different draft opened while it was pending.

### Current-main integration

Merged main `7a8c40305062fa102a46ff0b47fbedf05dd8623c` into this review branch without rewriting its reviewed history. Retained newer voice/profile synchronization, Google auth, entry chrome and capability ideas. CI runs both ownership and the newer voice/menu suites; the new synthetic UI fixtures explicitly return the verified identity endpoint. The standalone ownership harness ignores imported CSS modules because its assertions concern state, while full browser CI covers styled integration. Regenerated Mac source mirrors from the combined tree; only the receiver fixture differs from main's ZIP contents. No legacy adoption, schema activation or deployment is introduced.


### Safe legacy recovery fallback

The historical schema has no owner ID, signed ownership record or other independently verifiable binding. Current authentication, an ownership checkbox, a remembered title or device possession cannot supply that missing evidence. A content-matching challenge would prove knowledge, not exclusive ownership; a broad preview/export would disclose other people's drafts. Neither is implemented.

The minimal safe path is owner-initiated guidance: open “Recovery options”, then use a download/document independently retained and known to be the user's own. “Continue with my own copy” only focuses the existing source field and preserves its contents. The user manually pastes their own copy; existing preparation consent/review and explicit account-scoped saving remain separate. This reconstructs work from an independently held copy; it does not recover or adopt the quarantined record.

If the only copy is quarantined, guidance says to leave browser data intact and not send the shared collection to support or a conversation. It starts no support request. Item-level recovery requires separately established ownership before disclosure; when that evidence is unavailable, quarantine remains. The product gap is therefore reduced to actionable, truthful guidance, not solved by claiming automatic migration.

Synthetic coverage includes both unscoped and guest-only keys, malformed legacy bytes with content reads actively blocked, unchanged editor contents when following the guidance, closed guidance after account changes, byte-for-byte preservation, no provider/database mutation and 375px screenshot/overflow checks. Only fixture text is used in evidence.
