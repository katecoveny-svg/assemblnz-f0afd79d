# DO connector contract audit

**Checked:** 17 September 2026 (UTC). **Scope:** the existing DO pack only: 13 apps / 14 mapped actions. **Disposition:** not ready to describe as “all connectors working”.

## Outcome and evidence boundary

- **All 14 existing component keys are published on Pipedream’s public action pages and exist in current upstream source; no component-ID replacement is indicated.** Public-page versions match the source versions below.
- **Two concrete auth-prop defects:** Google Sheets injects `google_sheets` but the component requires `googleSheets`; Stripe injects `stripe` but the component requires `app`. Correct both pack and dispatcher, not just one copy.
- **Two misleading permission claims:** DO’s Gmail setup contract requires a readonly grant, which cannot create Gmail drafts; Google Calendar create-event is an immediate real write, not a draft awaiting review in Calendar. Actual user grants were not inspected.
- **Cross-cutting execution defect:** `runConnectorAction` declares any HTTP-success body `ok:true`; it does not validate the Connect error envelope or action result. Linear can explicitly return `success:false` without throwing.
- **Slack migration gap:** this action’s app is `slack_v2`, while new Connect links request `slack`. Keep display/legacy naming distinct from the exact app required to execute.
- **No user/account endpoint, OAuth token endpoint, action run, paid call, or external mutation was used.** No keys were inspected. Public publication and static/mock proof are not connected-account, scope, tenant-availability, or successful-execution proof.

Source snapshot: [PipedreamHQ/pipedream commit 58ecb2670d841f1289cdfa109758ae79de8e630e](https://github.com/PipedreamHQ/pipedream/commit/58ecb2670d841f1289cdfa109758ae79de8e630e), upstream commit timestamp `2026-09-16T16:33:29Z`. All GitHub links below are pinned to this revision. Public action pages were fetched separately (HTTP 200) and their registry key/version/authentication fields inspected.

Local scope: `apps/do/shared/do-connector-pack.ts`, `capability-catalogue.ts`, their relevant tests, `lib/connectors/pipedream.ts` and tests, `lib/specialists/connector-drafts.ts`, `lib/agents/action-requests.ts`, `/api/do/connections`, and the narrow Gmail setup contract. Repo operating context: root AGENTS, START_HERE, context manifest, CURRENT and router. Only this audit document is a repository change by this audit.

## Discrepancy matrix

**Availability for every row:** **published + source verified; account execution unverified**. Auth names below are **component prop names**, not necessarily app slugs. OAuth applies except `linear_app` and `stripe`, whose current published apps are **API-key based**, with credentials held in the user’s Pipedream connected account.

Inputs list the minimal required data plus important bounds/defaults, **in addition to the server-pinned auth prop**. `ret` means the action’s return value inside the [Connect response envelope][connect-actions]. Returned provider objects are not a universal normalized DO output schema; the success checks below must be implemented and confirmed against an authorized response before promotion.

| DO action / app | Verified key, version, primary evidence | Auth prop; input → return contract | Current discrepancy / exact safe fix |
|---|---|---|---|
| `create_email_draft` / Gmail | `gmail-create-draft` **0.2.3** [source][gmail] · [published][gmail-pub] | `gmail`; required `body:string`; `to:string[]`, `subject:string` optional upstream; `bodyType` defaults `plaintext`. Returns Draft object. | ID/auth correct. **Blocked under the prescribed DO readonly grant.** Do not advertise `email_draft` as executable for that grant. Keep local preparation available; gate provider draft-write on separately consented, verified write-capable grant. For ordinary drafts validate reviewed recipients/subject/body even though upstream allows empty recipients/subject. Do not reuse Outlook `content`/`recipients` as Gmail props. Require returned draft `id`; never map send. |
| `create_email_draft` / Outlook | `microsoft_outlook-create-draft-email` **0.0.35** [source][outlook] · [published][outlook-pub] | `microsoftOutlook`; upstream data props optional: `recipients:string[]`, `subject`, `content`, `contentType:text\|html` (default text). Returns created message. | **Current specialist adapter is correctly wired** with `recipients`, `subject`, `content`, `contentType:'text'`; preserve it. Retain stricter local nonempty validation. Reject unreviewed `userId` (shared-mailbox target), `expand` (overrides prepared body), file inputs/extra recipients. Require a message identifier and draft evidence before claiming created. |
| `list_calendar_events` / Calendar | `google_calendar-list-events` **0.1.1** [source][cal-list] · [published][cal-list-pub] | `googleCalendar`; no mandatory data props upstream; `calendarId` defaults primary. `timeMin/timeMax`: RFC3339, `maxResults:integer`, `fields:string`. Returns event **array**, not `{items}`. | ID/auth correct; current note recommends but does not enforce compact fields. Require reviewed calendar/window, finite positive cap, `fields:'compact'`, normally `maxAttendees:1`; `orderBy:'startTime'` requires `singleEvents:true`. Empty array is valid. Upstream loops pages and trims total by `maxResults`; without a cap it can fetch all matches. |
| `create_calendar_event` / Calendar | `google_calendar-create-event` **1.1.2** [source][cal-create] · [published][cal-create-pub] | `googleCalendar`; required `summary`, `eventStartDate`, `eventEndDate` strings; calendar defaults primary; `attendees:string[]`; `sendUpdates:all\|externalOnly\|none`; `addSelfAsAttendee` defaults true. Returns created Event. | **Real calendar write**, not “draft-style”. Pack entry already says `approvalRequired:true`, but app/capability say prepare/draft. Make prepare local-only; require approval before provider insert; change capability/copy to calendar create/write. Map dates to exact component fields, not raw `start/end` objects. Review calendar, zone, exclusive end, attendees, recurrence and notifications. Require returned event `id` and receipt. |
| `add_sheet_row` / Sheets | `google_sheets-add-single-row` **3.0.1** [source][sheets] · [published][sheets-pub] | **`googleSheets`**; `sheetId:string`, `worksheetId:integer`, `myColumnData:string[]` (one row; source also normalizes scalar cell values); optional `rowIndex`. Append returns `updates` object, including updated range/counters. | **Auth mismatch:** both local maps omit authProp, so dispatch injects `google_sheets`. Set `authProp:'googleSheets'`. Validate numeric tab ID (including zero), not sheet title; map values to `myColumnData`, not `values` or raw Sheets API body. Reject `rowIndex` for append-only policy. Source uses `USER_ENTERED`: disallow unreviewed formulas, do not pretend this is RAW. Require updated range and row-count evidence. |
| `get_drive_file` / Drive | `google_drive-get-file-by-id` **0.0.22** [source][drive] · [published][drive-pub] | `googleDrive`; required `fileId:string`; `fields:string[]` optional. Returns File metadata object. | ID/auth correct; no typed adapter/bounds. Allowlist metadata `fields`, e.g. id/name/mimeType/modifiedTime/webViewLink; do not pass download/`alt=media` controls or infer file contents from metadata. Validate requested/returned file ID. |
| `post_slack_message` / Slack | `slack_v2-send-message` **0.2.4** [source][slack] · [published][slack-pub] | `slack`; app **`slack_v2`**; required `conversation:string`, `text:string`; `addToChannel:boolean` default false. Returns Slack send response (or scheduled response if `post_at` set). | Auth name is already correct. Use `slack_v2` for Connect/account app; logical `slack` may remain a UI alias. Do not assume a legacy `slack` grant works with v2. Map channel ID to **`conversation`**, not `channel`. Approval covers exact destination/text. Explicit `addToChannel:false`; reject unapproved `post_at`, sender overrides, broadcast and metadata. Disable footer (`include_sent_via_pipedream_flag:false`) or include it in preview; default appends one. Require provider `ok:true`, destination and message `ts`. |
| `create_lead` / HubSpot | `hubspot-create-or-update-contact` **1.0.1** [source][hubspot] · [published][hubspot-pub] | `hubspot`; required `objectProperties:object`, `updateIfExists:boolean`; use internal field names such as email/firstname/lastname. Returns contact object. | Fallback auth is correct; set explicitly in canonical contract. Pass `{objectProperties:{...reviewed contact fields},updateIfExists:false}` for create-only, not an untyped CRM payload. Enable true only for explicit overwrite approval; upstream is destructive/upsert-capable. Require returned contact `id`, record create vs update, and account for provider-required contact properties. |
| `create_lead` / Salesforce | `salesforce_rest_api-create-lead` **0.4.1** [source][salesforce] · [published][salesforce-pub] | `salesforce`; required **`Company:string`, `LastName:string`**; optional `FirstName`, `Email`, `Description`, `Phone`, `additionalFields:object`. Returns create-record response. | **Current specialist adapter’s capitalized fields and auth prop are correct**; do not change to camelCase. Reject unreviewed `additionalFields` (merged last and can override reviewed values). Organization validation rules/required custom fields still need authorized configuration. Require `success:true`, identifier and no provider errors. |
| `create_notion_page` / Notion | `notion-create-page` **1.0.1** [source][notion] · [published][notion-pub] | `notion`; required `parent:string` real page/data-source UUID or URL; optional title, `content:string` Markdown, **`properties:string` JSON** for database columns. Returns page object. | ID/auth correct; no contract adapter. Do not send raw Notion `{parent:{...},children:[...]}` or an assumed workspace root. Resolve/approve parent, map body→content and JSON-stringify reviewed flat database properties against that parent’s schema. Page creation and body appends are multiple writes: partial completion must not be blindly retried. Require page `id`; creation response alone does not prove every content block was verified. |
| `create_task` / Todoist | `todoist-create-task` **0.0.12** [source][todoist] · [published][todoist-pub] | `todoist`; required `content:string`; optional project/section/parent, description, `dueString`, `dueDate`, `dueDatetime`, priority. Returns task object. | ID/auth correct; no adapter. Map title→`content`, target→`project`/`section` (not API `project_id`/`section_id`), date→component camelCase prop. Explicitly review Inbox default and one due mode; preserve priority meaning (1 normal, 4 urgent). Require task `id`. |
| `create_task` / Linear | `linear_app-create-issue` **0.4.21** [source][linear] · [published][linear-pub] | `linearApp`; API-key app `linear_app`; required `teamId:string` **UUID**, `title:string`; optional projectId, description, assigneeId, stateId, labelIds, priority. Returns SDK issue payload with `success`; source uses `_issue.id`. | ID/auth correct. Do not alias OAuth app credentials into this API-key app or pass team short key (`ENG`). Validate team UUID and scope. **Return can be `success:false` without an exception**; require true plus issue identifier. Normalize the tested SDK serialization, not a guessed universal `{id}`. |
| `retrieve_invoice` / Stripe | `stripe-retrieve-invoice` **0.1.5** [source][stripe] · [published][stripe-pub] | **`app`**; required **`id:string`** invoice ID. Returns Invoice object. | **Auth mismatch:** both maps specify `stripe`; set `authProp:'app'`. Map invoice ID to nested configured_props `id` (not `invoiceId`); outer request `id` remains the component key. Validate returned invoice ID; minimize returned billing PII. User’s key-based connected account is separate from Assembl’s own billing Stripe configuration. |
| `list_folder` / Dropbox | `dropbox-list-file-folders-in-a-folder` **0.0.14** [source][dropbox] · [published][dropbox-pub] | `dropbox`; required `path:string` (root is empty string); defaulted booleans recursive=true, includeDeleted=false, includeHasExplicitSharedMembers=false, includeMountedFolders=false, includeNonDownloadableFiles=true; optional positive integer limit. Returns **entry array**, not `{entries}`. | ID/auth correct; unsafe implicit breadth. Pin reviewed path, `recursive:false`, `includeDeleted:false`, `includeMountedFolders:false` and an explicit small limit. Helper’s absent limit can paginate broadly despite prop prose suggesting 100. Return bounded array plus truncation/coverage status; do not promise complete folder inventory or downloaded content. |

### Required inherited-source evidence

The action file is not always the complete schema. Inspected inherited definitions include:

- [Gmail app][gmail-app]: body/type/recipient props, identity pre-call and actual `users.drafts.create` request.
- [Outlook app][outlook-app]: optional fields and body preparation.
- [Calendar app][calendar-app]: primary-calendar default, time/filter props and sendUpdates options.
- [Sheets worksheet base][sheets-base] and [Sheets app][sheets-app]: **googleSheets**, integer worksheet ID, append returning `resp.data.updates`, USER_ENTERED. This version overrides the base props; **`hasHeaders` is not required by current 3.0.1**.
- [Slack base][slack-base] and [Slack app][slack-app]: `slack` prop for app `slack_v2`, conversation/text, joins/footer/scheduling effects.
- [HubSpot base][hubspot-base]: required objectProperties, update behavior and return contact.
- [Salesforce base][salesforce-base] and [Lead fields][salesforce-fields]: required capitalized fields and additionalFields precedence.
- [Linear app][linear-app]: API-key SDK and raw createIssue return; [Notion app][notion-app]: title optional; [Dropbox app][dropbox-app]: flattened entries/pagination.

## Cross-cutting fixes, in safe implementation order

1. **Fix truth/authority before enabling dispatch.** Keep Gmail readonly pilot unchanged; suppress remote Gmail draft capability for that grant. `gmail.compose` permits **both drafts and sending**, not draft-only OAuth; never silently broaden the existing grant. If remote draft creation is needed later, add a separately approved consent/capability binding and enforce draft-only operations server-side. Calendar preparation stays local; approved provider creation is an external action. Google documents creation/notifications and no draft event status ([Gmail create][gmail-create-api], [Gmail scopes][gmail-scopes], [Calendar insert][calendar-insert]). Gmail component also calls userinfo; write consent must support that identity pre-call, not only the draft endpoint.
2. **One canonical action contract.** Generate `PIPEDREAM_ACTION_MAP` from the pack rather than maintaining two lists. Make `authProp`, required account app, input validator, result validator, effect/approval metadata and audited component version explicit. `actionMapFromPack()` currently drops `approvalRequired`; preserve it through dispatch. Apply Sheets=`googleSheets`, Stripe=`app`, and Slack Connect/account=`slack_v2`. No other component-key or auth renames are justified by this audit.
3. **Add strict per-action adapters before wider exposure.** Implement the exact row inputs above; reject unknown keys and nested auth objects. Build configured props from allowlisted validated data and inject **only** the correct server-selected `{authProvisionId}` last. The current wrong Sheets/Stripe prop means a caller-supplied *correct* auth prop is not overwritten; do not rely on external ownership enforcement to clean this up. Bind account/target/normalized payload to review, retain owner/healthy checks, and fail closed on unverified scope or app compatibility. New grant selection must not just choose the first healthy Gmail account.
4. **Normalize results and ambiguous failures.** [Connect][connect-actions] documents `{exports,os,ret}` and failures with `error`. Parse error object/structured error observations, then validate action-specific `ret`; never infer success from 2xx or `$summary`. Linear `success:false` is an explicit failure. Store minimum provider IDs/targets, component version, approval reference and verification evidence, not unrestricted mailbox/billing response bodies. The adapter’s 15-second HTTP timeout can occur after a provider write; mark unknown/reconcile, do not auto-repeat non-idempotent creates. Slack post-then-channel-lookup and Notion page-then-append can similarly fail after a write.
5. **Complete reachable, approval-gated execution, not just catalogue rows.** `/api/do/connections` lists/maps all entries but does not execute them; `availability` is configuration presence, not grant/capability health. `ConnectorActionPayload.action` currently admits only create_lead/add_sheet_row/create_email_draft; retain explicit action union/validation for new paths, bound approval at the server, and provide target-input configuration plus receipts. `runConnectorAction` itself currently neither checks a permit nor the dispatch flag; the inspected `decideActionRequest` caller does enforce operator approval plus the flag. Do not introduce direct ungated callers based on UI metadata. Report states separately: published → platform configured → user connected → required scope/target verified → approved → execution verified.
6. **Proof ladder.** First table-driven, network-mocked contract tests for every entry, both auth mismatch regressions, map parity, exact args/unknown-key rejection, wrong-owner/unhealthy accounts, aliases, insufficient-scope Gmail, calendar approval, 2xx error envelopes, false provider success, missing return IDs, empty read arrays and post-write timeout. Then, **only with separate user authority**, retrieve each project component definition (`GET /v1/connect/{project_id}/components/{key}`), configure target props as needed, compare version/configurable_props to the pinned contract, verify app/grant scopes, and run bounded consenting test-account read/write cases with receipts. Do not call those endpoints during this audit or promote based on publication alone.

## Primary-source conflicts and remaining uncertainty

- **Do not copy the marketplace’s generated auth snippets.** The current published [Sheets][sheets-pub], [Stripe][stripe-pub], [Slack][slack-pub] and [Linear][linear-pub] examples use the *app slug* as auth key (`google_sheets`, `stripe`, `slack_v2`, `linear_app`). Their linked component implementations require `googleSheets`, `app`, `slack`, `linearApp`. The [Connect definition/configuration guide][connect-actions] says configured prop keys follow component code. Prefer that explicit component contract; verify the actual project `configurable_props` before activation. Publication/version/schema tables were corroboration, not authority to copy generic examples.
- The same guide still demonstrates older dynamic Sheets props (`hasHeaders`, string-array worksheets). Current published/source **3.0.1** has integer `worksheetId` and fixed `myColumnData`, without hasHeaders/reloadProps. Use versioned current schema, not the generic guide’s dated example.
- `slack` is a **local compatibility alias**, not evidence that it is the correct Connect filter for `slack_v2`. Current source app is `slack_v2`; attempted `components/slack/slack.app.mjs` was 404, which alone does not prove every legacy registry alias is unavailable. Until an authorized project lookup verifies a legacy mapping, request/select v2 explicitly for this action.
- No full provider output JSON Schema is declared by these `.mjs` action definitions. Return types here come from inspected run/helper code; exact serialized SDK/provider details and target-specific requirements still require authorized response validation. Pipedream project entitlement/enabled apps, Google consent verification, actual grants, Slack membership, Salesforce org rules, Notion parent permissions, and API-key validity remain unverified.

## Required environment names only

No environment values were read or changed; this is a list of **code-required names**, not a readiness assertion.

| Purpose | Names |
|---|---|
| Base Connect configuration | `PIPEDREAM_CLIENT_ID`, `PIPEDREAM_CLIENT_SECRET`, `PIPEDREAM_PROJECT_ID` |
| Explicit environment selection (current code otherwise defaults to development) | `PIPEDREAM_PROJECT_ENVIRONMENT` |
| Existing DO narrow Gmail OAuth app | `DO_GMAIL_OAUTH_APP_ID` |
| Approved-action execution gate | `ACTION_DISPATCH_ENABLED` |
| Existing hosted owner authentication | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Existing approval/receipt persistence service | `SUPABASE_SERVICE_ROLE_KEY` |

These are the existing names used in `lib/connectors/pipedream.ts`, `lib/agents/action-requests.ts`, `lib/supabase/server.ts` and `service.ts`. No per-app secret environment variable is required by these action mappings. Linear/Stripe user credentials belong in their Pipedream connected accounts; do not substitute Assembl billing credentials. A future separate Gmail write-consent setting has **not** been implemented, so no invented env name is presented as required. Pipedream’s [custom OAuth client guide][oauth-clients] confirms `oauthAppId` belongs on a Connect Link URL; the current Gmail URL parameter itself is correct.

## Checks actually executed

```text
pnpm exec vitest run apps/do/shared/do-connector-pack.test.ts lib/connectors/pipedream.test.ts
Test Files  2 passed (2)
Tests       11 passed (11)
```

These existing tests assert catalogue strings, account ownership/health and mocked auth injection. They do **not** verify external schemas or execution; their success does not catch the two auth defects, unsupported Gmail draft scope or Connect/provider false-success results. No full build was rerun; parent work/build was left untouched. Public research cache is outside the repo in `/tmp/assembl-pipedream-contract-audit`; durable evidence is linked here.

## Primary references

[gmail]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/gmail/actions/create-draft/create-draft.mjs
[gmail-pub]: https://pipedream.com/apps/gmail/actions/create-draft
[outlook]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/microsoft_outlook/actions/create-draft-email/create-draft-email.mjs
[outlook-pub]: https://pipedream.com/apps/microsoft-outlook/actions/create-draft-email
[cal-list]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/google_calendar/actions/list-events/list-events.mjs
[cal-list-pub]: https://pipedream.com/apps/google-calendar/actions/list-events
[cal-create]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/google_calendar/actions/create-event/create-event.mjs
[cal-create-pub]: https://pipedream.com/apps/google-calendar/actions/create-event
[sheets]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/google_sheets/actions/add-single-row/add-single-row.mjs
[sheets-pub]: https://pipedream.com/apps/google-sheets/actions/add-single-row
[drive]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/google_drive/actions/get-file-by-id/get-file-by-id.mjs
[drive-pub]: https://pipedream.com/apps/google-drive/actions/get-file-by-id
[slack]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/slack_v2/actions/send-message/send-message.mjs
[slack-pub]: https://pipedream.com/apps/slack-v2/actions/send-message
[hubspot]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/hubspot/actions/create-or-update-contact/create-or-update-contact.mjs
[hubspot-pub]: https://pipedream.com/apps/hubspot/actions/create-or-update-contact
[salesforce]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/salesforce_rest_api/actions/create-lead/create-lead.mjs
[salesforce-pub]: https://pipedream.com/apps/salesforce-rest-api/actions/create-lead
[notion]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/notion/actions/create-page/create-page.mjs
[notion-pub]: https://pipedream.com/apps/notion/actions/create-page
[todoist]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/todoist/actions/create-task/create-task.mjs
[todoist-pub]: https://pipedream.com/apps/todoist/actions/create-task
[linear]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/linear_app/actions/create-issue/create-issue.mjs
[linear-pub]: https://pipedream.com/apps/linear-app/actions/create-issue
[stripe]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/stripe/actions/retrieve-invoice/retrieve-invoice.mjs
[stripe-pub]: https://pipedream.com/apps/stripe/actions/retrieve-invoice
[dropbox]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/dropbox/actions/list-file-folders-in-a-folder/list-file-folders-in-a-folder.mjs
[dropbox-pub]: https://pipedream.com/apps/dropbox/actions/list-file-folders-in-a-folder
[gmail-app]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/gmail/gmail.app.mjs
[outlook-app]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/microsoft_outlook/microsoft_outlook.app.mjs
[calendar-app]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/google_calendar/google_calendar.app.mjs
[sheets-base]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/google_sheets/actions/common/worksheet.mjs
[sheets-app]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/google_sheets/google_sheets.app.mjs
[slack-base]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/slack_v2/actions/common/send-message.mjs
[slack-app]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/slack_v2/slack_v2.app.mjs
[hubspot-base]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/hubspot/actions/common/common-create-object.mjs
[salesforce-base]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/salesforce_rest_api/actions/common/base-create-update.mjs
[salesforce-fields]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/salesforce_rest_api/common/sobjects/lead.mjs
[linear-app]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/linear_app/linear_app.app.mjs
[notion-app]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/notion/notion.app.mjs
[dropbox-app]: https://github.com/PipedreamHQ/pipedream/blob/58ecb2670d841f1289cdfa109758ae79de8e630e/components/dropbox/dropbox.app.mjs
[connect-actions]: https://pipedream.com/docs/connect/components/actions
[gmail-create-api]: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.drafts/create
[gmail-scopes]: https://developers.google.com/workspace/gmail/api/auth/scopes
[calendar-insert]: https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
[oauth-clients]: https://pipedream.com/docs/connect/managed-auth/oauth-clients
