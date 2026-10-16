# Widget phone Talk ordering — 16 October 2026

The selected Talk view previously kept the text composer and handoff above the call controls. On a 375×812 phone the Call button remained below the first viewport even after hiding the composer because the large decorative hero consumed the available height.

Pass selected Talk state into the existing conversation component. Hide, rather than unmount, the idle text composer and handoff while Talk is selected. Keep the admitted call panel exposed across Write selection while starting/live/resuming; the existing voice component retains End/mute controls. On phones only, selected Talk uses a compact heading and the existing header brand mark. Returning to Write restores its existing presentation and editor.

No Gemini configuration, voice selection, microphone permission, worker, provider, lease, account or schema changes. Opening Talk remains navigation and does not start audio or provider dispatch.

Validation: 28 isolated companion-entry browser checks pass, including direct /do/widget?entry=talk at 375×812, first-viewport Call control, editor/draft/iframe identity retention, readiness failures, queued-entry cancellation and no microphone, speech, provider POST, foreign traffic or runtime errors. 16 focused component/conversation/entry/handoff/call integration tests pass, including active call → Write parent visibility and retained text. Scoped ESLint, macron and diff checks pass. Screenshot: direct-talk-375.png in the companion entry proof artifact. Hosted clean core validation and exact-head independent review are release gates.

Real acoustic acceptance remains unresolved and is separate from this layout correction. No microphone, paid audition, private transcript or real retailer action was used.
