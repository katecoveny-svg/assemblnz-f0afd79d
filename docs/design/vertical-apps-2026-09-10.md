# Public vertical apps

ARC, Forge, Gateway (at `/agents/customs`) and Ensemble now have dedicated app routes at `/agents/<slug>/app`. Each story includes a realistic phone that calls the same live specialist endpoint as its app. Approved copy, existing illustrations, films, 3D controls, dealership content studio and scripted examples remain intact.

## What is connected

The new public endpoint uses assembl's existing model fallback router and read-only NZ knowledge search. ARC uses Whakaaē; Forge uses Arataki; Gateway uses Pīkau; Ensemble uses Auaha. Replies are drafts for a reviewer. These public apps have no account, CRM, project-file, booking, publishing or lodgement tools. No scripted response is substituted for a failed model call. Source receipts distinguish retrieved sources, unavailable sources and a reply prepared without a live search.

Conversation text lives in the current page session and is sent to the configured model provider for replies. There is no client transcript persistence or new transcript database. Existing generation usage/model-call logging is reused. Drafts can be edited, assigned a reviewer label and explicitly downloaded as text. Naming a reviewer neither notifies them nor approves the draft.

## Install and sharing

- Four distinct manifest IDs and starts, with app-specific 192/512 icons and Apple touch icons.
- Narrow workers at `/agents/<slug>/`, never the site root. No caches; no API interception; no offline message queue. Network failures show a self-contained offline explanation. Authentication responses pass through.
- The global legacy worker cleanup preserves only the four exact new worker scopes alongside existing tenant workers. Existing stale-shell recovery remains active.
- Chrome/Edge install prompt support, plus Safari/iPhone/iPad/Android instructions when no install event is offered. Browser/OS support governs the actual install UI. We do not install anything on the user's device during testing.
- Same-origin app paths share browser permissions and storage with assembl. The existing root app can suppress an inner app's install promotion on some browsers; the manual browser install path remains documented. These are public demos, not isolation boundaries for client data.
- Sharing carries only the clean current-origin app address. Invite queries, preview parameters, drafts and messages are never attached. Social previews have 1200 × 630 cards; downloadable portrait cards are 1080 × 1350.

## Verification

Focused tests cover scope isolation, private-route exclusion, offline network behaviour, manifest metadata, input validation, cross-origin rejection, request limits, provider failure and source receipts. Typecheck, targeted lint, repository lint and a production build pass. Chrome has emitted the native install-availability event for the ARC app on localhost. Hosted live-response and final mobile checks are recorded in the review handoff after deployment.

PWA references: [MDN installability](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [same-origin app limits](https://web.dev/articles/building-multiple-pwas-on-the-same-domain).
