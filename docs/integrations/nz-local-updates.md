# Personal DO: weather and official updates

Review implementation, 30 September 2026. No production-release claim.

## Scope and implementation

Objective: useful NZ weather and dated official hazard information without asking the household to connect another account. Personal DO is the product surface. This **extends** the public-source adapter pattern established by NZTA (`lib/do/nz-public-data.ts`) and **uses** DO's existing hashed per-process request backstop. It creates a fixed-place forecast/cache adapter and a typed public-information contract, not another agent or background monitoring system.

- Shared contract and fixed city centres: `apps/do/personal/local-updates.ts`
- Bounded server adapters: `lib/do/nz-local-updates.ts`
- Public route: `GET /api/do/nz-local-updates`
- Optional component: `LifeAdminLocalUpdates` in `app/do/personal/`, no props
- Mount: secondary Around you area, coordinated with the Personal DO interface owner

The two source reads are independent and user-triggered. The endpoint does not read account state or the assistant's private context. No database, model, credential creation, provider signup, paid subscription, notification enrolment, emergency dispatch or production change is involved. No data is fabricated as a fallback.

## Sources and permissions verified

### Weather: MET Norway Locationforecast

Public point-forecast endpoint: `https://api.met.no/weatherapi/locationforecast/2.0/compact`.

- [Official HOWTO and global coverage](https://api.met.no/doc/locationforecast/HowTO)
- [Terms of service: identification, caching, privacy, no SLA](https://api.met.no/doc/TermsOfService)
- [Licensing and attribution](https://api.met.no/doc/License): CC BY 4.0 / NLOD 2.0 unless stated otherwise
- [Global-model limitations](https://docs.api.met.no/doc/locationforecast/FAQ.html)

Locationforecast supplies model forecasts, including NZ, without an end-user login or API key. It does not become a locally observed temperature, a MetService forecast, an official NZ warning, or an emergency-monitoring service by being retrieved now. The UI explicitly distinguishes the model update, forecast times and retrieval/cache time. Local terrain and conditions can differ from a coarse global city-centre forecast.

The request identifies the app with `User-Agent: assembl-personal-do/1.0 (+https://assembl.co.nz)`. A proxy prevents forwarding the user's IP, credentials and client headers to MET Norway. The provider receives only an allowlisted public city-centre coordinate pair, never the user's exact address. The app's public website identity should remain reachable with company contact information; an operator changing the app/domain must update the identifying User-Agent.

The adapter respects `Expires`, retains `Last-Modified`, revalidates with the exact `If-Modified-Since` header after expiry, and handles 304 without claiming that new data was downloaded. Absent/expired Expires gets a conservative 15-minute cache. 403/429 causes a provider-wide cooldown of at least 15 minutes and honours any longer Retry-After. In-flight calls are deduplicated per city. Keys are bounded by the 21 allowed places. The cache is process-local; scale-out deployments need shared caching/edge flood controls to avoid redundant upstream requests across workers. No numeric provider SLA or unlimited commercial capacity is asserted.

Attribution and a CC BY link are visible next to results. Transformations are declared: selected forecast fields and m/s-to-km/h wind conversion. Rainfall totals retain their exact one-hour or six-hour forecast interval. Missing precipitation is unknown, never zero. Unit/schema drift fails closed. A model older than 24 hours or lacking a near-current forecast point is unavailable; that bound is an application safety choice, not a provider freshness promise.

Live direct-provider verification at approximately 03:49 UTC on 30 September 2026 returned HTTP 200, an Expires header, Last-Modified and the documented compact JSON. A second live **adapter** validation at approximately 03:56 UTC passed for both sources and confirmed that the next same-city call was served as `cached`. This was a direct outbound check, not production/preview route proof.

### Official dated updates: GeoNet

Public endpoint: `https://api.geonet.org.nz/news/geonet`, `Accept: application/json;version=2`.

- [Official API contract](https://api.geonet.org.nz/)
- [GeoNet policy, attribution and disclaimer](https://www.geonet.org.nz/policy)
- [CC BY 3.0 New Zealand](https://creativecommons.org/licenses/by/3.0/nz/)

The payload is `feed[]`, with original `title`, `published`, `link` and optional `tag`. Results retain source publication dates; sorting and selecting five headlines does not turn old bulletins into current active alerts. The latest retrieved article can be weeks old. We fetch the national feed, not city-filtered headlines, and explicitly label that scope. The API's live response in this validation contained ten items. Only exact HTTPS `www.geonet.org.nz/news/…`, `/vabs/…` and `/response/…` links are accepted; arbitrary URLs, credentials, ports and query/fragment links are rejected. React renders headline text without HTML interpretation. Malformed entries fail the whole check rather than disappearing silently.

GeoNet checks are cached for one minute, with a matching UI freshness boundary; this is an application cache interval, not the publication cadence or an emergency SLA. On errors, no stale fallback is presented as a successful refresh. The UI credits GeoNet, Earth Sciences New Zealand and programme sponsors, links the licence, and says this is a selected national source rather than comprehensive news.

### Official NZ warning and emergency destinations

- [MetService weather warnings](https://www.metservice.com/warnings/home)
- [National Emergency Management Agency / Civil Defence](https://www.civildefence.govt.nz/)
- [Get Ready preparedness](https://getready.govt.nz/)
- [NZ Police: call 111 for Police, Fire or Ambulance emergency response](https://www.police.govt.nz/call-111)

These are visible official links, not scraped live alert feeds. DO does not infer that no news means there is no hazard. The emergency text and call link remain available before any fetch and when a source is unavailable.

MetService's [data policy](https://about.metservice.com/our-data-access-policy) distinguishes open warning/observation products from personal-use-only public website material. Its [Point Forecast product](https://data.metservice.com/product/point-forecast-api) and [API terms](https://data.metservice.com/terms-service) require registration/app-approved terms for commercial API use. This implementation does not scrape its city forecasts or create an app key. A future MetService forecast integration requires that provider access/licensing work, not a new household login. A verified MetService CAP adapter could be separate future work; no current feed coverage is implied here.

## Privacy, retrieval and UI contract

Supported requests:

```text
GET /api/do/nz-local-updates?source=weather&place=auckland
GET /api/do/nz-local-updates?source=geonet-news
```

All unknown/duplicate parameters are rejected before provider access. Weather requires a fixed city ID; news rejects location fields. No arbitrary host, coordinates, notes, address, user ID, responsibility or access token can be passed through. Selecting a city itself does not fetch or persist it. The labelled button makes the provider and city-centre disclosure clear before retrieval. Browser geolocation and storage are not used.

Browser/CDN responses use `Cache-Control: no-store`; the explicitly described bounded provider cache is server-side. Snapshots expose `status`, `freshness` (`fetched`, `cached`, `revalidated`, `unavailable`), `checkedAt`, original `fetchedAt`, `validUntil` and a truthful message. Source publication/model times remain separate. Unavailable sources return 503 with no forecast/headlines; invalid inputs return 400; excessive client refreshes return 429 with Retry-After.

The browser calls Assembl's relative API with `credentials: same-origin` and `mode: same-origin`. This retains existing site/deployment-access cookies for protected previews; it does not change access controls or send those cookies to a provider. Upstream adapters independently use `credentials: omit`, fixed headers and no forwarded request context. NZTA's browser client already uses fetch's default same-origin credential behaviour. A regression check covers both sides of this boundary after a protected-preview weather check exposed the original client's overly broad `omit` setting.

The component ages displayed snapshots after `validUntil`. Closing a disclosure, changing cities, pressing Stop or unmounting aborts/invalidate the client request and prevents a late result from appearing. A server request already underway may finish to populate the shared public cache. Refresh is manual; there is no background emergency check, push notification, automatic location sharing or autonomous downstream action.

## Proof, remaining gates and rollback

- `lib/do/nz-local-updates.test.ts`, `app/api/do/nz-local-updates/route.test.ts` and `app/do/personal/LifeAdminLocalUpdates.test.ts`: 53 focused tests passed (72 when run together with the existing NZTA source/route tests)
- Coverage includes units, missing rainfall, forecast intervals, old/future models, safe links, original publication dates, malformed/oversized payloads, Expires/304, single-flight, failure backoff, Retry-After, unknown cities, private query rejection, 400/429/503 and explicit no-account routes
- Focused TypeScript (the new contract, adapters, route and component), ESLint, `git diff --check`, brand guard and macron guard: passed
- One temporary direct-outbound live adapter test: passed; removed after validation to keep the ordinary test suite deterministic
- Full-repository typecheck, build and mobile/desktop screenshot/interaction proof are combined-integration gates owned by the parent builder/interface work. An attempted standalone aggregate typecheck hit the runner's memory limit. Local loopback browser proof was not performed because the parent reported an environment restriction; branch-preview validation remains required
- Required preview checks: no request before explicit click; actual route weather/news responses and source timestamps; repeat refresh/cached state; city change during a pending request; Stop and close/reopen; unavailable response; keyboard-only controls; 375px and larger-text layout

Rollback removes the optional component mount and these isolated files. There is no migration, saved household data, external account or credential to unwind.
