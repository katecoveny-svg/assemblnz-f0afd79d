# DO access and core-flow review — 20 September 2026

## Scope and authority

Kate asked to check the connected site, make DO accessible from the homepage and prioritise working core actions. This review branch supersedes the 17 September public explanation-only navigation lock. It does not authorise production deployment, bypass sign-in, enable dispatch, expose private family data or claim autonomous execution.

Canon loaded: root AGENTS and START_HERE, context manifest/CURRENT/router, brand and copy standards, Factory and primitive registry. Reuses the existing product frame, writing preparation, local draft store and Meeting DO. No new provider or storage system.

## Confirmed findings

- Live `/do`, `/do/widget` and `/do/meetings` returned HTTP 200. A page existing did not make the product discoverable.
- In the browser, `/do` described opening a workspace but linked only to contact and other products.
- Meeting DO allowed recording/pasting before revealing that note preparation required sign-in. This review exercised fictional pasted text; microphone permission was not requested.
- The full-page hosted workspace always passed `embedded=true`. This hid its existing browser save/reopen controls.
- The frame's sign-in link always returned to the widget, even from Meetings.
- A live anonymous writing task with fictional text successfully returned a generated draft. This proves that particular preparation path, not transcription, sending or all models.
- Read-only runtime endpoints reported writing and transcription configured. Credentials being configured are not end-to-end provider proof.
- Vercel connector continued returning `oauth_token_invalid_grant` after reconnection was reported. GitHub reported a successful Vercel deployment for the Meeting DO merge. No Vercel account or credential changes were made.

## Changes

- `/do` opens Everyday work, Meeting DO and School & family notice preparation before the established atelier story.
- The school/family door opens the existing planning task. It does not imply an inbox, Today feed, bus tracker or connected calendar.
- Browser companion is labelled as a setup guide.
- Homepage product calls to action say Open DO / Open workspace.
- Shared chrome returns to DO home and sign-in returns to the current task route.
- Full-page writing restores browser save/reopen; embedded surfaces keep their existing isolation.
- Exhausted anonymous trials get an actionable sign-in-and-check-connection path while retaining the draft. Known unavailable writing does not offer a runnable writing button; exact extraction remains an option.
- Meeting sign-in and unavailable-transcription guidance is visible before capture. Existing consent and authentication remain required.

## Acceptance

Verify homepage → DO home → each offered destination, including an unknown task query falling back safely. On desktop and 375px, verify readable links/controls and no horizontal overflow. Prepare/review/edit/save/reopen a fictional writing draft. Confirm embeddings do not offer local persistence. Check Meeting DO exposes sign-in before recording. Run typecheck, relevant tests, changed-file lint, production build and brand/macron/navigation guards.

## Release boundaries

Real signed-in microphone/Deepgram, school Gmail, meeting email dispatch, durable meeting jobs and native/extension permissions need separate acceptance. No messages, invites or payments were sent. This review is not a full DO rebuild.

Rollback: revert this change. Existing browser drafts and queued meeting requests are not deleted.
