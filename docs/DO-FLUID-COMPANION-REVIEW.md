# Fluid surfaces and portable DO: review record

Date: 21 September 2026. Base: main `9dea26219ad3912c938a053ffa0be33a36bfe599` (includes the merged visual pass). Feature branch: `feat/assembl-fluid-makers-20260921`.

## Scope

Homepage, public Pursuit/Studio pages, DO home and task surfaces: rounded image frames, softer section transitions, bounded gradient light, tasteful scroll-linked heading colour, native scrolling and reduced-motion fallbacks. Accepted walkthrough content and approved platform wording remain in place.

The DO launcher now opens the shared working companion. The bubble and panel both move with pointer or keyboard; only their positions persist. Explicit area capture previews ordinary DOM text locally; click to capture, edit/discard, then use it in the DO editor. Forms, editable controls, marked private regions, hidden content and non-text media are excluded. Image alt text is labelled as a description, not pixel analysis. Page query strings/fragments are stripped from source URLs. Source text still may contain sensitive information: user review remains essential.

A user-approved screen share opens the existing Look workflow in its own first-party window and captures one reviewable snapshot. It is not continuous observation. Extension version 1.7.0 adds Place DO on this tab to the default panel, using the same generated companion and unchanged Chrome permissions. Website navigation preserves the mounted companion during SPA navigation; a page reload or another tab is not durable draft sync. A site may block embedded frames; reviewed context remains copyable for the normal first-party workspace.

Phone use adds a prominent home-screen guide, touch-sized controls and separate Share DO / Share reviewed notes actions. Native sharing is feature-detected, with file/text and copy fallbacks. Invitations contain a fixed public URL only; reviewed note sharing excludes the original transcript, recording and receipt. Cancelling native sharing never falls through to copying. No share target extension, universal phone overlay or automatic cross-device sync is claimed. Meeting-tab capture is disabled when the browser lacks display capture.

Meeting DO adds a local notepad beside the recorder. This is a useful preparation surface, not automatic meeting intelligence. See `DO-MEETING-PREEMPTIVE-DIRECTION.md` for the proposed next features.

## Private workspace access gap

`https://assembl-pursuit.katecoveny.chatgpt.site/studios` and `/agency` belong to a separate Sites project. The connected Sites account returned zero editable Sites. Library lookup did not resolve the source. No private hub or maker was edited, and no client data was moved. Image replacement, focal point/crop and frame/background controls in those private makers remain pending access to that existing project's source.

## Required review before production

- Desktop and real 375px visual proof of the new surfaces.
- Actual browser drag, point, cancel, keyboard, edit/discard, receipt and blocked-frame fallback flow.
- Chrome extension installation and host-CSP cases; account/session behaviour inside the first-party iframe.
- Real iPhone/Android Share menu, cancellation, home-screen launch and keyboard layout.
- Meeting microphone/tab-audio permission and provider paths with authorised test content.

Available automation results are recorded in the PR. The cloud browser cannot authenticate the protected Vercel preview on the user's behalf; the user specifically requested her own Chrome. Do not weaken deployment protection or claim screenshots of the previous live version prove this branch. This remains a draft until visual/runtime review is complete. No production merge or deployment was performed by this change.
