# DO appointment availability — bounded review module

Status: review branch, no live clinic/tradie feed or booking execution. Base main `c631aa875a19fee84e37f2e2ad84d391df361980` (1 October 2026). Creates a pure availability contract; reuses DO fixture conventions, strict Zod connector-input conventions, and the prepare → review boundary. UI, personal jobs and travel remain separately owned.

## Existing source and actual capability

- `apps/do/shared/fixtures.ts` and `templates.ts`: explicitly DEMO physio-cancellation and tradie-availability examples, not public live slots.
- `apps/do/shared/do-connector-pack.ts`, `connector-contracts.ts`, `lib/connectors/pipedream.ts`: account-scoped generic email/calendar and other app actions, configuration and approval checks. No physio/tradie slot action. A user's free calendar time is not a provider's appointment availability.
- `lib/living-site/bookings.ts`, `booking-store.ts`: requested preferred date/time and controlled status transitions; no public appointment inventory. Keep that existing request lifecycle for any later booking integration.
- `lib/voice/tools/check_availability.ts`: Manaaki restaurant business-hours/calendar free-busy computation. Intentionally not reused to infer public clinic/tradie capacity.
- No LockedIn-named path in the recursive main tree; no LockedIn module found under app/lib/apps. A differently named service or external product needs its actual source supplied.

## Usable now and what remains disconnected

`directoryHandoffs(service)` returns manual Healthpoint or Builderscrack destinations, labelled enquiry-only. URLs contain no private area, coordinates, symptoms or contact information. Opening a destination is a user action; this module never opens it automatically, posts a job or contacts anyone.

`createPublicDirectoryAdapter(verifiedPublicRecords, allowedPublicOrigins)` supports a reviewed provider shortlist with public booking links. The caller must verify provider records and link ownership, and have permission to use the records. It does not scrape, fetch, geocode or discover URLs. It removes all supplied slots and changes evidence to directory-only. `prepareAvailabilityEnquiry` produces an editable local enquiry containing only the explicitly requested search preferences; nothing is sent. No real directory records are bundled or claimed searched here.

The default `disconnectedAdapters` returns no appointments and individual not-connected states. Official sources checked on 1 October 2026:

| Provider | Documented capability | Module readiness |
|---|---|---|
| [Healthpoint](https://healthpointltd.health/healthpoint-directory/healthpoint-api/) | Directory API through registration/contact | Not connected; listings are not slots. [Public directory](https://www.healthpoint.co.nz/) permits manual provider lookup; its page prohibits scraping without written permission. |
| [Cliniko](https://docs.api.cliniko.com/openapi/service) | Available/next available time endpoints honour clinic, appointment-type and practitioner online-booking visibility | Not connected; [user-scoped authorised keys](https://docs.api.cliniko.com/) are required. No credentials requested/configured. |
| [Nookal](https://support.nookal.com/hc/en-us/articles/9191502612239-Generating-API-Keys) | Account integration key setup | Not connected; key setup alone does not verify the slot schema. |
| [Tradify](https://www.tradifyhq.com/integrations/api) | No public API | No fabricated slot adapter. |
| [Builderscrack](https://builderscrack.co.nz/) | Provider/quote matching | Manual enquiry handoff; neither a slot feed nor a confirmed visit. |

## Contract and integration

Import from `lib/do/availability`. No new route, model call, database, credentials, paid provider or shared UI edits.

```ts
const report = await searchAvailability(input, disconnectedAdapters);
const links = directoryHandoffs(input.service);
// A future trusted, owner-scoped provider adapter supplies real evidence.
const review = prepareAvailabilityReview(report, 'adapterId:resultId');
const enquiry = prepareAvailabilityEnquiry(input, report, 'adapterId:resultId');
```

Input: service category, explicitly requested location label and optional coordinates, travel radius, offset-qualified start/end instants, IANA timezone, optional maximum NZD budget and supported accessibility preferences. At most 31 days, 200 km, eight unique adapters, 50 candidates per adapter and 50 results. Each adapter has a bounded abortable timeout. Distance is straight-line distance, not a road route or travel-time guarantee. Without both coordinates, radius remains unverified and blocks a booking review; no hidden geocoder sends the user's location elsewhere.

Results distinguish `provider_confirmed_available` (dated provider-slot observation), `awaiting_confirmation` (stale/unconfirmed candidate time) and `enquiry_only` (no confirmed slot). Confirmed availability requires a provider-slot-capable registered adapter, slot evidence, observed timestamp and unexpired expiry. Local freshness is capped at five minutes even when upstream promises longer. Business hours, directory descriptions and the user's calendar cannot establish capacity. Availability remains an observation, never a hold or confirmed booking. Unknown distance/access/total price/terms stays visible as checks needed and blocks review. Only exact totals including GST qualify; estimates/hourly/from prices never silently become totals.

Confirmation contains exact provider ID/name, provider service ID/label/category, start/end, IANA timezone, location, total NZD price including GST, terms, observation/source/reference and expiry. It always carries `requiresUserApproval: true`, `externalAction: none`, `held: false`, `booked: false`, `actionState: prepared_only`. Future execution must obtain specific approval for this exact object, recheck evidence, ownership and price/terms, and use the existing approved action/booking lifecycle. A client-supplied report is not trusted provider proof.

`createSyntheticAdapter(now)` is separately imported from `fixtures.ts`. Live mode skips synthetic adapters; synthetic mode skips live adapters. Fixture results are labelled synthetic and cannot prepare a live review or real enquiry. No synthetic provider data is a real public availability claim.

## Minimal provider onboarding

1. Provider consent and an authorised read-only feed, or independently verified public booking-page ownership and allowed source/link origins. Never private-portal scraping, authentication/bot bypass or inferred business-hours availability.
2. Exact provider/practitioner/location/service identity and booking eligibility; for Cliniko, approved business/practitioner/appointment-type IDs and booking visibility. Document feed semantics and access scope before implementing transport.
3. Zoned start/end, timezone, source/reference, observation/expiry and cancellation changes. Honour provider rate limits, abortion and rechecks; no patient records or health information requested.
4. Verified total price including GST, cancellation/payment terms and practical accessibility. Missing values remain confirmation gaps.
5. Owner-scoped adapter registration and approved public origins. Any future credential storage/transport and consequential execution are separate work requiring explicit authorisation. No new keys or paid providers added by this change.

## Urgent administration boundary

`appointmentHelpBoundary` is available independently of search or provider configuration. It does not assess symptoms, decide whether waiting is safe, offer reassurance, promise monitoring or call anyone. It points to the parent-researched [official Health NZ service-routing page](https://www.healthnz.govt.nz/hospitals-services/which-health-service-should-i-use). Current content verification in this environment returned HTTP 403 via browser and curl; no phone numbers or clinical advice were copied from that inaccessible page. The UI owner should keep this guidance reachable before any form submission.

No user health data, saved private memory, family data or implicit private location is used. Inputs are in-memory only, never logged, persisted or included in handoff URLs. A future adapter may receive only the explicit preferences necessary for the requested search; private owner-review memory is not a provider input.

## Proof and reversal

Run `pnpm exec vitest run lib/do/availability/availability.test.ts`, `pnpm typecheck`, and `pnpm exec eslint lib/do/availability --max-warnings=0`. Tests exercise disconnected and synthetic/live modes, evidence freshness/expiry, exact review, input/URL validation, distance/budget/access gaps, provider batch failure and timeouts, curated directories, drafts and the independent help boundary. No visible UI or production-build path is altered. Remove these isolated files and the primitive-registry row to reverse the change; no data migration or external side effect requires reversal.
