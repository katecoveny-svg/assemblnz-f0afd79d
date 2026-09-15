# DO family Gmail pilot

## Implemented

- `/do/family`: account-owned school-admin review board, chosen sender addresses and 7/14/30-day window, explicit processing consent, source quotations, original email links, download, disconnect and sign-out.
- `/api/do/family`: reads up to 20 matching messages using Gmail's API through Pipedream. No attachments, sending, mailbox mutations, calendar changes or background polling.
- Authenticated, non-anonymous Supabase user determines the Pipedream owner (`do:user:<uuid>`). Caller-supplied IDs cannot select another account. The old shared `family` demo OAuth flow is not used.
- Only one shared trial task is reserved per completed digest. Empty and failed runs release the reservation. The existing network-based three-task allowance remains; this is not account billing.
- Source text is used transiently for generation. The response includes extracted quotations and source metadata, not complete email bodies. DO does not save the digest. Pipedream and model providers process the request under their own configured retention policies.
- The model must return a typed result. Every item must cite a supplied message and contain an exact quotation found in that message. This prevents fabricated source citations; it does not prove every interpretation correct. Parent review remains necessary.

## Required before activating Gmail

1. Configure a custom Gmail OAuth client in the existing Pipedream project, requesting `https://www.googleapis.com/auth/gmail.readonly` plus only necessary identity scopes. Do not use the default broader Gmail client.
2. Finish Google's applicable consent/verification and test-user configuration for the intended release. Register the Pipedream-issued callback URI with that Google OAuth client.
3. Set `DO_GMAIL_OAUTH_APP_ID` in the matching Vercel environment to the custom Pipedream OAuth app ID. This is a non-secret identifier; Google client secrets remain inside Pipedream. Existing `PIPEDREAM_*` server configuration is also required.
4. Existing pilot users can sign in on the DO page with their Supabase account. Public self-service account creation/recovery is not implemented here; do not advertise general onboarding yet.
5. In the production environment, connect a consenting test account. Verify restricted scopes on the Google consent screen and the connected owner, then test an actual school-message digest, an empty search, disconnect, expired access, and another user's inability to see the account.
6. Verify desktop and 375px mobile UI. This release's interactive verification remains blocked by the existing browser approval usage limit.

Without the custom OAuth app ID the page explicitly says "Gmail pilot setup needed" and offers an enquiry. It must not claim a connection exists.

## Known limits

- At most 20 recent matching emails; partial results are marked when Gmail returns another page. Up to 4,000 characters per message; shortened messages are marked. Attachments are not read.
- A digest is an on-demand task. There is no recurring inbox schedule or notification service yet.
- Gmail links require the user to open the Google account they connected.
- Sign-out clears the visible board; download is an explicit local export.
- Flight monitoring, appointment availability, meeting recording and child study sessions remain separate requested services. Do not describe these as delivered by this Gmail slice.

## Primary implementation references

- https://pipedream.com/docs/connect/api-proxy
- https://pipedream.com/docs/connect/managed-auth/oauth-clients
- https://pipedream.com/docs/apps/oauth-clients
- https://supabase.com/docs/guides/auth/auth-email-passwordless
