# Selected-tab reader and conversational companion — local review

Historical evidence for preserved candidate `7749934523`. See [the subsequent integration report](DO-COMPANION-INTEGRATION-20261015.md) for actual extension image/text binding, bounded voice resumption and the shared work board. Remaining-gap statements below describe the first candidate.

Base: `5b990e31034d9ea0c4248996a34760ad3e459c04`.
Branch: `codex/do-selected-tab-foundation-20261015`.
Status: local code and controlled tests, not installed, published or live-verified.

## Implemented

- `apps/do/browser/selected-tab/reader.ts`: reusable read-only contract, toolbar-only trusted entrypoint, verified owner/selected tab/document/origin binding, 60-second expiry, status sink required before reading, cancellation/abort and post-read checks. Origin-only evidence URL, capture time, adapter completeness, untrusted-page label. Strict fixture adapter rejects extra fields. No script input, network/cookie/credential API, tab enumeration or mutation.
- `DoFocusWorkspace` now mounts one conversational companion for Write and Talk. Existing drafting tools remain under Tools. The parent owner key still unmounts all conversation state on account change. `assembl:do-focus` continues revealing the workspace and focusing its primary input.
- `DoCompanionConversation` and optional controlled turns in `PersonalDoAssistant` reuse existing text reasoning and opt-in kept conversations. A successful voice transcript joins the same ordered turns; typing during a call uses that call's socket and audio reply path. After a call, the last exchange supports a typed follow-up. Context sent into a new call still requires review; no automatic whole-history replay.
- Explicitly offered selected text or image-derived text can be reviewed and attached to conversation notes. Attaching clears prior provider consent. Removing the attachment clears supplied notes. Capture is not permission to send to a provider.
- `distribution.ts` is canonical for `floating.js`. Talk now requests the existing iframe's call options; microphone delegation is scoped to its configured Assembl origin. The browser still decides whether the embedding site's policy permits this. Minimise sends a stop signal; iframe and local conversation stay mounted. Drag/keyboard movement behavior is preserved. Source URLs now omit paths, queries and fragments.
- Call UI puts verbose context/privacy explanations in details while keeping microphone/provider consent visible. A simple visual state marker, mute/end controls, live typed input, approved deadline and latest provider usage are shown. Usage is labelled non-billing. No limits, voice model or NZ configuration changed.

## Evidence

- 18 Node selected-tab contract cases: activation, expiry, cancellation while connecting/reading, identity changes, unsupported sites, private URL fields, strict schema, prompt-injection-as-data and unavailable status rendering.
- 31 Vitest checks across nine suites: shared typed/voice turns, existing voice wire/session cleanup, account conversation prefix/CAS contract, entry availability, page-context exclusions, position bounds, and actual generated floating script in a DOM-shaped VM fixture.
- Full repository TypeScript check and scoped ESLint pass using the existing dependency tree, with a worktree-local link to the already-installed `tsup` dependency. No dependency installation or package edits.
- `node scripts/review-do-companion-static.cjs` server-renders the actual component with a fictional text sample. [Static preview](do-companion-local/preview.html). It is unhydrated and clearly labelled; no screenshot, interaction, audible or mobile browser proof is claimed.
- `node --import tsx scripts/generate-do-companion.ts` regenerates the extension; parity is tested.

Run the fixture tests with:

```sh
node --experimental-strip-types --test apps/do/browser/selected-tab/reader.test.mjs
node node_modules/vitest/vitest.mjs run apps/do/shared/companion-floating.test.ts apps/do/shared/companion-conversation.test.ts apps/do/shared/companion-entry.test.ts apps/do/shared/companion-position.test.ts apps/do/shared/gemini-live-session.test.ts apps/do/shared/gemini-live-wire.test.ts apps/do/shared/voice-session-resources.test.ts apps/do/personal/conversation.test.ts apps/do/shared/page-context-script.test.ts
```

## Real functionality versus remaining gap

The generated floating companion uses the existing real DOM selected-text/pointed-area reader, not synthetic cart data. It excludes editable/private/hidden regions and only offers the reviewed selection to the conversation. Unsupported forms, frames, canvas, browser-internal pages or embedding-policy failures remain unavailable. It does not order, book, or connect Air NZ, shopping or appointments.

The new stronger selected-tab reader is **not yet wired to a native MV3 host**. Its trusted host must obtain the owner and exact active top-frame identity, bind a fixed reviewed adapter, handle toolbar/navigation/tab/owner/UI events and render status. The existing floating text offer is untrusted user-reviewed input, not proof of that stronger grant. The fixture pilot's mutation path remains unchanged and fixture-only. Installed files and manifests were not read or changed.

To make this usable in Kate's installed companion, next work is to review/integrate that host, assemble the reviewed extension candidate, then obtain permission for a temporary isolated Chromium/native test and (separately) an installation. No permission widening is assumed. Microphone and provider tests also require their own explicit authority. Existing Chrome extension-management denial is not bypassed.

Native Mac source already contains a floating NSPanel, draggable orb, explicit selected-text capture and a first-party microphone prompt. None was installed or exercised here. Native interruption proof still awaits unlock and temporary-test approval. Phone should reuse this responsive signed-in widget and existing account conversation API; no native phone rewrite or universal cross-app access is implied. Cross-device save/resume remains dependent on deployed storage availability and real owner/CAS tests.

## Ongoing conversation / voice ownership

This task owns companion UI, local shared turns and context review. The mobile-shell task owns LifeAdmin/TodayTasks only. Voice task `01a13339-5156-7327-8aa8-df68eeb310eb` owns NZ configuration and finite spend policy. Kate's reported NZ/American drift and cross-talk remain failed/pending acoustic acceptance; these changes do not fix or verify them.

Automatic resumption is deliberately not wired. Voice owner requires a server-owned logical-call lease bound to owner, consent/profile/voice revision, model, absolute paid deadline and budget reservation. Resume must preserve the deadline/config, must not acquire another quota slot or refund from client usage, and must be revoked by End/minimise/hidden/offline/owner switch. No automatic microphone reacquisition, no replay of uncertain input, no durable/logged handles. Server admission and one-use ephemeral-token compatibility are not yet implemented. A new paid window needs explicit reviewed continuation until a larger budget is approved.

Google documents session resumption through setup and a subsequent returned handle, and GoAway before connection termination: [session management](https://ai.google.dev/gemini-api/docs/live-api/session-management). Provider usage fields are defined in the [Live WebSocket reference](https://ai.google.dev/api/live). These provider mechanisms do not grant Assembl budget authority. Current UI retains the transcript and shows a fresh-review message; it does not claim seamless reconnection or authoritative spend metering.

No production build, browser rendering/375px screenshot, real audible output, session renewal, signed-in persistence, live provider request, live account visit, push, installation, installed permission grant or deployment was performed. The user-authorized local iframe delegation change still needs review and browser proof before shipping.
