# Shopping call investigation — 21 October 2026

## Evidence and boundary

Inspected current main `0dbfd45` in an isolated checkout of `katecoveny-svg/assemblnz-f0afd79d`; unrelated Dayrally changes were not edited. Checked local Codex memory summary, repository instructions, context router/current evidence, factory primitives and existing browser/voice work before editing.

Connected Mac Chrome reproduction used the existing `https://www.assembl.co.nz/do` tab. Its ended-call transcript contained two user turns asking about Woolworths and signed-in browser access, and two DO replies refusing browser/account access. The live task starter explicitly says it cannot fill a live cart. No new live microphone session was started. Woolworths in this browser showed signed-out entry, no chosen delivery address/time, and $0 cart; no account/cart changes were made.

This is a real missing-capability boundary, not merely a model refusing an available tool:

- `apps/do/shared/gemini-live.ts`: tools are `compile_do_agent` (editable brief only) and bounded public Parliament evidence. The prompt accurately disallows app control and purchases. Changing that prompt cannot grant browser access.
- `app/do/DoGeminiLive.tsx`: a persistent Gemini WebSocket sends 16kHz microphone frames, plays streamed audio, handles server interruption by stopping queued playback, and continues receiving turns. It is not just browser text-to-speech. Actual latency, unfinished-thought handling, interruptions, accent and recognition quality were not measured in this investigation.
- Calls intentionally end on page hiding, minimising, offline/page exit; reviewed shopping handoff also ends the call. Those boundaries prevent the desired conversation-while-shopping experience today. This patch preserves hidden-page/minimising/offline shutdown and the existing Shopper handoff; it adds a separately reviewed browser-task handoff that can keep the same-tab call open.
- `components/do/browser/BrowserTaskReview.tsx` is a reviewed companion flow for a fictional local storefront. `apps/do/browser/retailers/gate.ts` keeps Woolworths disabled. Native selected-tab authority, installed-extension permissions, extension-owned read consent, retailer DOM mapping, account/store/cart binding, durable claims and site-access review are unresolved gates. Prior pilot recognition work exists; do not duplicate it or flip its release flag.
- `/api/do/browser-actions` remains unavailable. Desktop companion pairing is not a working phone-to-desktop execution bridge.

## Local candidate

The existing call entry now offers a device-local ring followed by Answer/Decline. No microphone or provider request occurs in the invitation component. Answer invokes the existing checks and setup; it does not bypass consent, entitlement, voice revision or allowance checks. Decline, 30-second timeout, page hiding, offline state and unmount stop the ring. A synchronous settled guard prevents duplicate answers. Audio ownership is shared with the existing call/readout primitive. Reduced motion is respected. This is an in-app call, not an outbound telephone call.

Regression scripts were updated to include Answer before their existing provider/media tests. They were not executed in this investigation; passing older results must not be attributed to this patch.

## Additional local foundations

Reviewed voice notes can now enter the existing browser-task panel without closing the same-tab call. The handoff binds the verified owner, rejects duplicate/pending reviews synchronously and does not transmit browser contents or receipts to the voice provider. Owner change clears the review and closes the old call. No external authority is inferred from speech.

The connection broker now clears old observation/proposal/approval/receipt before a new read, and rejects stale or future-dated observations. A failed refresh cannot leave an old proposal approvable. Companion runtime and both browser archives were regenerated without permission-manifest changes; nothing was installed.

## Validation

- Locked repository dependencies installed without lockfile changes. Whole-app TypeScript check and scoped ESLint passed. Brand guard passed; canonical context health passed with 29 existing review warnings.
- Final focused run: 179 tests across 16 files passed, covering invitation lifecycle, actual call integration, owner-bound handoff, broker invalidation/freshness, synthetic native protocol, retailer gates and download parity.
- Full suite: 4,181 passed, 3 skipped, one unrelated image-rendering test exceeded the default 5-second timeout. Rechecking its complete brand identity file with a 30-second allowance passed all 13 tests. This is not an unqualified clean full-suite result.
- Connected Mac Chrome tested the actual invitation at desktop/375px: repeated Answer produced one callback, Decline and timeout stopped it. A second harness exercised actual call/review/broker components with fake media/provider and fictional account/cart: edited spoken brief → owner-bound review → separate read grant → quantity 2 → exact approval → execution → readback receipt. The mocked conversation stayed open; repeated approval was rejected; disconnect removed authority; account change cleared review and stopped the old call.
- The four updated provider/browser regression scripts were not executed. No actual microphone, provider roundtrip, conversational quality, installed native extension or Woolworths basket was verified.
- Production webpack build passed (exit 0), including TypeScript and all 208 static pages. Default Turbopack stalled and was cancelled; an initial sandboxed webpack attempt could not resolve Google Fonts. The successful local build used network access for those build dependencies. No deployment occurred.

## Native acceptance blocker

The read-only attempt to open `chrome://extensions/` was denied by the browser tool's protocol policy (HTTP/HTTPS only). No alternate surface or workaround was used. The user must inspect the installed DO companion name/version, enabled status and displayed site access before an existing native installation can be assessed. No install, reload, enable or new permission grant is requested at this stage. Woolworths sign-in comes later, after native fictional-store acceptance is ready.

## Next bounded acceptance path

1. Review this candidate, run the updated full-component provider regression scripts. Do not release solely on the synthetic invitation proof.
2. Complete the existing desktop companion's native fictional-store sequence: select exact tab → owner/read consent → observe → reviewed quantities → approve → execute → reread receipt; test cancel, repeated commands, account changes and uncertain outcomes.
3. With explicit installation/site-access approval and the user's own signed-in Woolworths session, validate one narrow retailer path and the account/store/cart binding. Do not copy cookies or share accounts. Do not enable retailer writes before these gates are proved.
4. Test one user-specified small basket and reread quantities/totals, stopping before checkout. A future optional DO-payment action needs its own exact merchant/basket/total/currency/action review; this investigation authorizes no purchase and adds no payment capability.
5. Validate the new same-tab conversation/review path with a real provider; separately design background-call mode and any model-visible execution bridge. Retain per-owner context isolation, cancellation and receipts. Existing privacy shutdown must not be silently removed.

Existing Voice Studio is at `app/creative-studio/voices/` (including VoiceStudio and BrandVoiceWorkspace). Reuse it; cloning is neither required nor authorized here. NZ voice quality and te reo Māori comprehension/pronunciation need competent-speaker and latency/interruptibility testing. Prompt accent instructions are not acoustic proof. Broader requirements remain explicit follow-ups: Pacific/Auckland with DST, consented location, sourced weather/local/school information, dated political/legal retrieval, and per-user/tenant private-context isolation. Current call Parliament lookup is not a general fresh NZ knowledge feed.

No push, PR, merge, deployment, purchase, new credential grant, permission change, recording upload or provider contract was performed.

## Broader capability matrix (source audit, not production certification)

Reuse prior [runtime audit](site-repair/do-runtime-audit.md), [reliability review](../DO-RELIABILITY-REVIEW-20261013.md), [release reconciliation](DO-RELEASE-RECONCILIATION-20261014.md), [travel/mail audit](DO-TRAVEL-MAIL-RELIABILITY-20261019.md), and [account rollout hardening](../do-personal/ACCOUNT-ROLLOUT-HARDENING.md). The master roadmap already references Instinct as vendor claims and marks its third-party integration route unverified; no separate Instinct implementation was located in this scoped search. Historical audit defects must be rechecked: for example the old anonymous Browser Runtime finding is now superseded in source by `doOwner()` and owner-filtered lookup/listing in `app/api/do/browser-runtime/route.ts`.

| Capability | Working / partial / missing | Evidence and next proof |
|---|---|---|
| Natural two-way voice | Partial: persistent streaming and interruption code implemented; two conversational turns visible in live transcript | Current Gemini client; recent real-device barge-in, turn timing, corrections and NZ/te reo audition still needed. No guarantee of accent or human-like comprehension. |
| Grocery execution | Missing live capability; planning and synthetic cart foundation exist | Woolworths source gate remains false; no installed authenticated retailer execution or receipt proved. |
| Durable private memory | Partial: owner-bound review, revision, retention, deletion and scoped provider-consent primitives | `memory.ts`, `memory-use.ts`, `memory-use-storage.ts`; production enrollment/configuration, restore/new-session/two-owner/revocation/deletion acceptance not reverified. Current memory notice explicitly excludes health records and information about other people. Do not market this as a secure family/health vault or ingest such data under the current contract. |
| Proactive work | Partial: responsibilities, bounded wake-ups, worker health and preparation flows | Existing preparation is not proof of autonomous external execution. Verify deployed scheduler, current consent, idempotency, cancellation and outcome on a selected task before claiming always-on delivery. |
| Mail | Partial: bounded read-only Gmail review under verified owner/account grant and separate consent | `apps/do/mail/capability.ts` checks readonly scopes and fresh grant metadata; release flag defaults off. Current call has no private mail tool. No send/automatic morning scan proved here. |
| Calendar, SMS, other agents | Missing from this call's tool surface; broader connector inventory is not an integrated path | No iOS SMS or Claude/Codex cross-agent visibility verified. Need actual provider/action contracts and exact recipient/action approval before claiming execution. |
| Flights / appointments | Partial preparation; live flight booking unproved/closed | Existing travel/mail audit records owner search authority gate, no verified reprice → approval → booking/payment → servicing chain. Do not equate a prepared receipt with booking. |
| Bills savings | Partial advertised-offer comparison/watch, not realised savings | `bills-watch.ts` explicitly calls no model/inbox/action and uses a separately refreshed public price book. Eligibility, fees, switching/provider confirmation and next-bill savings need evidence. |
| NZ grounding | Partial curated sources and timezone use | Bills watch uses Pacific/Auckland; current voice tool is Parliament-only. Whole-system Auckland/DST, consented location, weather/local places/schools and current law/politics remain acceptance requirements rather than established universal knowledge. |
| Portable agent | Partial web/widget/native/extension surfaces | No proved phone-to-desktop connected execution session. Shared branding/launchers do not transfer native browser authority or private account context. |
| Approvals and isolation | Implemented primitives, incomplete connected execution | Owner/revision/expiry, exact action review and cancellation foundations exist. Every new connector must bind its real external identity and receipt; a model prompt cannot provide this. |

Marketing: the observed live shopping starter already qualifies that it prepares a list and cannot fill a live cart. Retain that qualification. Broader claims such as “does your supermarket shopping”, “books flights”, “sends texts”, “always remembers your family/health”, or “keeps itself current on NZ law” should remain proposed or narrowly qualified until their specific live acceptance passes. This was a scoped claim audit, not an exhaustive crawl of every public marketing page.

## Follow-up: prepared brief truth (22 October)

`compile_do_agent` is a pure prepare operation. The live compile endpoint has no durable save. Its result now says `saved:false` and `persistence:none`; the call renders the brief itself, an explicit unsaved heading and a nearby jump link. A repeated compile cannot overwrite an unreviewed prepared brief, including across a new call in the same mounted tab. Cancelled/obsolete results cannot announce successful preparation. Review continues through the existing notes flow; no new storage, account permissions or background execution were added.

Focused mocked tests cover success/location/review, repeated requests, failure and cancelled late responses. These do not establish what Kate's live provider actually said, nor recover her particular brief. Connected Mac browser inspection timed out; the existing live tab was not refreshed or overwritten.

### NZ conversational voice recommendation (documentation, not listening approval)

The active integration remains Gemini Live; the available options are Kore, Aoede, Puck and Charon. Existing NZ instructions are not an accent guarantee. Google documents continuous audio and conversational history in its [Live API](https://ai.google.dev/gemini-api/docs/live-api), so replacing it with clip TTS would not satisfy continuous conversation.

The existing Voice Studio already lists Azure `en-NZ-MollyNeural` and `en-NZ-MitchellNeural` in `lib/voice/assembl/brand.ts`; no replacement studio is needed. Microsoft's [language catalogue](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support) identifies these as NZ English voices. [Voice Live language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live-language-support) supports the Speech service's standard voices. Its [overview](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live) documents interruption detection, end-of-turn detection and function calling. This supports a bounded Azure Voice Live audition as the next candidate, not a claim that it is integrated or sounds natural.

Compare existing Gemini against both NZ candidates using identical unfinished thoughts, corrections, interruptions, grocery quantities and task-result follow-ups. Measure response delay and interruption stop time, confirm continued listening while a tool is pending, and obtain NZ speaker plus competent te reo Māori evaluation. Test recognition separately from synthesis. Confirm region/processing, existing account access, licensing and costs before enabling any provider. No voice was cloned, new provider provisioned or paid audition run for this repair.
