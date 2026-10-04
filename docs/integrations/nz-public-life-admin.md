# NZ public life-admin sources · 30 September 2026

## Implemented: national highway conditions

**Creates** a small public-source adapter (`lib/do/nz-public-data.ts`) and free read-only endpoint (`GET /api/do/nz-public-data?source=nzta-traffic`). **Uses** DO's existing hashed, bounded per-process request backstop. No new account, credential, provider/model call, database, private context or third-party write is involved.

Objective: make an immediately useful NZ source work without asking a household to connect another account. Scope is Personal DO and reusable DO public-source reads. The upstream host/path/headers are constants; unknown query fields are rejected. The source receives no user notes, addresses, cookies, credentials, client IP headers or saved responsibilities. Region filtering belongs in the client after the national feed is fetched.

Official documentation:
- [NZTA no-account access description](https://www.nzta.govt.nz/about-us/our-data-and-official-information/use-our-data)
- [Published REST base and available services](https://www.nzta.govt.nz/about-us/our-data-and-official-information/use-our-data/about-the-apis)
- [Machine-readable WADL](https://trafficnz.info/service/traffic/rest/4?_wadl)
- [Traffic and Travel terms](https://www.nzta.govt.nz/about-us/our-data-and-official-information/use-our-data/terms-of-use)
- [Official current conditions](https://www.journeys.nzta.govt.nz/highway-conditions/traffic-and-travel-list-view)

### Upstream contract and verification

Request: `GET https://trafficnz.info/service/traffic/rest/4/events/all/10`, header `Accept: application/json`, no authentication. `10` is geometry zoom level, not result count. WADL confirms `events/all/{zoomlevel}`. This is a public road-event feed, not vehicle-registration or personal travel data.

Live read verified HTTP 200 on 30 September 2026 at 03:19:10 UTC: 348,673 bytes, 238 events. Top-level JSON is `response.roadevent[]`. Records included `Active`, `Scheduled` and `Resolved` states; do not label the entire result as active disruptions. Event dates can contain differing NZ daylight-saving offsets and an end date can be null. JSON allows a singleton `roadevent` and an explicit empty response; unexpected schemas fail the whole check instead of hiding a hazard. API timestamps and source text are preserved. Geometry and unrelated fields are omitted from the DO response.

The bounded adapter requests JSON with no-store, omits credentials, rejects redirects, limits the body to 2 MB and times out at 20 seconds. A standalone Node read succeeded in 12.6 seconds during validation, so an initial 12-second bound was too tight. Keep loading confined to this optional source panel, allow cancellation/retry, and never block the rest of the app. HTTP errors, non-JSON challenges, invalid payloads and source failure produce `status: unavailable`, an empty event list and an official fallback link. They never masquerade as clear roads. Output contains:

```
source: { id, name, url, documentationUrl, termsUrl, scope, attribution, chargingNote }
status: available | unavailable
freshness: fresh | unavailable
checkedAt: ISO timestamp of completed check
fetchedAt: ISO timestamp of successful fetch, otherwise null
cachedAt: null
cachePolicy: no-store
suggestedRefreshAfter: fetch + 60 seconds, otherwise null
events: { id, eventDescription, locationArea, eventType, impact, status,
          planned, region: {id, name}, eventComments, alternativeRoute,
          startDate, endDate, eventModified }[]
message: truthful snapshot/failure explanation
```

### Freshness, terms and product obligations

The live upstream responded with `Cache-Control: no-cache, no-store, max-age=0, must-revalidate`. The adapter deliberately has **no content cache and no stale-data fallback**; DO responses are also no-store. Always show fetched time. A UI retaining a response must label it as a past snapshot after `suggestedRefreshAfter`, and refresh before asserting current conditions. An event's modification date is not the feed retrieval time. The one-minute refresh suggestion is an application choice, not a published provider update frequency or SLA.

NZTA's terms require timely, accurate and geographically relevant presentation. Only notable officially verified events are covered; local roads and unreported hazards can be absent. Keep original text unaltered where it carries conditions or detours, retain attribution and link to the source. Avoid claims that no listed event means a road is safe or clear. NZTA permits charging for added service features, but not the underlying travel information; keep this endpoint/info free and do not represent it as a paid data partnership. No numeric API rate quota or SLA was verified. DO permits six requests/minute per process/IP namespace; production distributed flood protection remains a deployment concern.

### Proof and rollback

- Contract/parser/failure tests: `lib/do/nz-public-data.test.ts`
- Free-route/privacy-query/rate-limit tests: `app/api/do/nz-public-data/route.test.ts`
- Run: `pnpm exec vitest run lib/do/nz-public-data.test.ts app/api/do/nz-public-data/route.test.ts`
- Live check: request the route and verify real JSON, `status`, `fetchedAt`, event count and no-store headers; lack of upstream access must give 503 + official fallback.
- Verified through the local Next.js server: `GET /api/do/nz-public-data?source=nzta-traffic` returned HTTP 200, 238 real events and `fetchedAt: 2026-09-30T03:28:15.376Z`, with no-store headers, in 15 seconds. An unknown source returned 400; an upstream timeout returned the documented 503 fallback. A separate upstream read returned 502, so availability is not guaranteed. Deployment/preview egress remains a separate check.
- Focused contract tests: 19 passed; focused ESLint and `git diff --check` passed. Full-application build/typecheck and UI proof belong to the combined Personal DO integration; these checks are not a production-release claim.
- No API response bodies are logged or persisted by the implementation. The documentation's count is a historical validation result, never runtime fallback data.
- Rollback: remove the optional source UI consumption and these isolated adapter/route files. No data migration or account cleanup required.

## Additional verified sources, not fabricated live integrations

### Dates: national schools and public holidays

[Ministry school terms](https://www.education.govt.nz/school-terms-and-holidays-dates) publishes 2026–2028 facts and download links. Term 1 starts and Term 4 finishes can vary by school; teacher-only days and private-school calendars need the school's own source. **Licence caveat:** [Ministry copyright](https://www.education.govt.nz/copyright) currently specifies CC BY-NC 4.0 for website material unless stated otherwise. Do not redistribute its prose/calendar assets in a commercial product without permission/licence review. Original date facts can be source-linked; the hosted page returned 403 to a direct server read in this validation, and ICS bytes were not successfully verified. This is currently guidance/factual provenance, not a proven dynamic adapter.

[Govt.nz holiday dates](https://www.govt.nz/browse/work/public-holidays-and-work/public-holidays-and-anniversary-dates/) and [Employment NZ holiday dates](https://www.employment.govt.nz/leave-and-holidays/public-holidays/public-holidays-and-anniversary-dates) support cited holiday planning. Preserve actual and observed dates, and do not equate regional anniversaries with present-day council boundaries. Work entitlements depend on the person's usual workdays and local custom; avoid automatic legal/payroll conclusions. No current supported official JSON/ICS API was verified.

### Council collection days

[Auckland collection-day lookup](https://www.aucklandcouncil.govt.nz/en/rubbish-recycling/rubbish-recycling-collections/rubbish-recycling-collection-days.html) accepts a property address; provide a link or use an explicitly authorised address lookup. It is not a nationwide connector. Do not apply one council's holiday-delay rule to another.

[Taupō refuse layer](https://services7.arcgis.com/S7DHOirgbYgdtrbR/arcgis/rest/services/Refuse_Collection/FeatureServer/0) is a genuinely public CC BY 4.0 ArcGIS candidate. Live no-key GET verified HTTP 200:

```
https://services7.arcgis.com/S7DHOirgbYgdtrbR/arcgis/rest/services/Refuse_Collection/FeatureServer/0/query?where=1%3D1&outFields=ID%2CCollection_Day%2CLocation&returnGeometry=false&resultRecordCount=3&f=json
```

Response has `features[].attributes.{ID,Collection_Day,Location}`. Examples: Acacia Bay: Tuesday & Friday; Taupo: Wednesday. Three-result response had `exceededTransferLimit:true`; consumers must paginate using the object ID, not `ID` (observed values were not unique). Max record count 2,000, projected spatial reference 2193. Council describes data as indicative, not guaranteed/exhaustive. Last-Modified was September 2025; this cannot establish live holiday changes or a particular property's full rubbish/recycling service. No numeric caller SLA/rate entitlement verified. Not integrated in this release.

Dog registration remains a council-specific workflow: [Christchurch renewal](https://ccc.govt.nz/services/dogs-and-animals/register-your-dog/pay-your-dog-registration) needs customer/payment references; [Waikato renewal](https://www.waikatodistrict.govt.nz/services-facilities/animal-control/dogs/dog-registrations/renew-a-dog-s-registration) links to council sign-in. Public guidance can prepare a checklist; it cannot establish a user's registration/payment status.

### Transport feeds needing application setup

[Auckland Transport developer portal](https://dev-portal.at.govt.nz/) says free developer signup/subscription key is required, with 600 calls/minute and 35,000/week. [Realtime documentation](https://dev-portal.at.govt.nz/realtime-api) describes JSON/GTFS and at least 30-second updates. [AT data licence](https://at.govt.nz/about-us/at-data-sources) is CC BY 4.0, alongside API terms. [Metlink portal](https://opendata.metlink.org.nz/) also needs an application key. These need no separate consumer login once an operator integrates them, but they are not configured simply because their websites are public. No signup/key creation was performed here.

### Vehicle, bills and ordinary life admin

- [NZTA online services](https://nzta.govt.nz/do-it-online) and [RUC guidance](https://www.nzta.govt.nz/vehicles/road-user-charges/about-ruc): prepare checklists and reminders from user-entered expiry dates. RUC is distance-based; retain odometer and purchased end distance rather than invent a renewal date. No personal vehicle API was established. Do not hard-code WoF frequency or current fees from old memory.
- [Electricity Authority comparison guidance](https://www.ea.govt.nz/your-power/compare-and-switch/) now directs users to [Billy](https://billy.govt.nz/), its public free comparison service launched in March 2026. Prepare bill/contract-break-fee checks and link out. No public price-comparison API, household saving, retailer quote, bill upload or switch was verified/performed.
- [Quotes and estimates](https://www.consumerprotection.govt.nz/general-help/guide-to-buying-smart/quotes-and-estimates): organise tradie scope, assumptions and written quotes for comparison. Do not imply verified availability or accept a quote.
- [Faulty products](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/faulty-and-unsafe-products) and [change of mind](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/change-of-mind): prepare evidence and a reviewable enquiry. Distinguish statutory remedies from store-policy returns; do not promise a refund.
- [Tenancy ending process](https://www.tenancy.govt.nz/ending-a-tenancy/tenants-ending-a-tenancy-process/): moving checklist, notice-rule check, utility transfer preparation, final photos/inspection and bond review. No notices, cancellations or claims sent.
- [SafeTravel before you go](https://www.safetravel.govt.nz/before-you-go): passport/visa/insurance/advisory checklist; user-controlled registration. No travel account integration.
- [MPI food storage](https://www.mpi.govt.nz/food-safety-home/preparing-and-storing-food-safely-at-home/safe-food-preparation-cooking-and-storage-at-home): official safety reference for meal/use-up planning, without claiming supermarket prices or live stock.
- [Healthify appointment preparation](https://healthify.nz/hauora-wellbeing/h/healthcare-provider-visits): NZ charity guidance, explicitly not a government source. Prepare questions locally; no clinical decision or appointment booking integration.

All these public reads are separate from private invoices, account balances, school/health portals, identity documents and user-specific registrations. Private-source access and external sharing need their own explicit consent and integration. A public link is not proof of a connected account or completed action.
