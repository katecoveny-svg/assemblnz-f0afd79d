# Spaces in play

Added to The Kitchen Machine on 23 October 2026 at `spatial-twins.html`.

## Implemented

- Original, inspectable spatial models for a conceptual Winger Penrose workshop, home, school, grocery store and retail store.
- Camera orbit, top-down floor-plan view, roof and label toggles, zoom, time playback and keyboard-accessible area selection.
- Synthetic workshop queue with finite inspection, service-bay and final-check capacity. Approval and parts delays occur off-bay. Timings are inspectable in a vehicle schedule.
- Hourly energy balance with zone loads, solar, optional home battery, occupancy and flexible-load/zoning choices. Explicit baseline comparison.
- Imported CSV load snapshots with known-zone, unit, timestamp, duplicate and completeness validation; freshness flags and source labels. No live IoT connection.
- Local floor-plan image reference, editable review briefs and pilot briefs. Nothing is sent to external systems.
- WebGL rendering with a lightweight Canvas geometric fallback using the same 3D transforms. The fallback draws rounded primitives as flat faces.
- Existing kitchen planning and New World companion code preserved.

## Claim ledger

| Source, reviewed 23 October 2026 | Supported use | Limit / rights |
|---|---|---|
| https://winger.co.nz/locations/customer-service-centre/ | Penrose service, WOF, repairs, tyres, customer café, parts centre across the road | Public service context only. No exact plan, bay count, operating data, endorsement or integration. No media copied. |
| https://www.education.govt.nz/our-work/strategies-policies-and-programmes/property-and-infrastructure/te-haratau/energy-survey-schools | Energy monitoring supports operating and property decisions | No site-specific efficiency or savings claim. |
| https://www.schoolproperty.govt.nz/designing-school-property/guidance-on-building-products/solar-panels-at-school/ | Schools have relevant solar and energy-control choices | No funding, payback or compliance claim made. |
| https://www.woolworths.co.nz/help/policies/store-policies | Grocery review / substitution context | No new retailer integration. |
| https://www.mitre10.co.nz/guides-and-advice/ | Product understanding and practical guides are relevant retail contexts | No affiliation or use of their media. |
| https://april-zhu.com/colorfigures | Inspectable, rotating, interactive visual concept | Original code and models here; no Colorfigures code installed or copied. |
| https://airsup.ai/lab/arizona-fab and user-supplied screenshots | Spatial operations inspiration | Page body not retrieved successfully; performance and simulation claims not independently verified or reused. |

## Model contract

All layout geometry, equipment counts, sensor/occupancy patterns, vehicles and power numbers are demonstrative assumptions. This is a prototype of a digital twin interface, not a connected or calibrated digital twin.

Workshop: ten jobs, arrivals every 18 minutes; one 15-minute inspection station; 1–3 service bays; recurring 55/80/45/100/65-minute work durations; one 10-minute check station. With extra bookings there are thirteen jobs. Waiting jobs do not occupy service bays. Capacity is a simplified proxy and does not include staff skills, breaks, parts inventory, walking time or real appointment commitments.

Energy: 24 one-hour intervals. The solar profile is a 06:00–18:00 sine curve times kW capacity and a sunlight multiplier. A home battery starts empty and has a 3 kW power limit, 95% charging efficiency and 95% discharge efficiency. kWh follows from kW × 1 hour. Remaining battery energy carries to the end-of-day balance but is not used as a next-day initial condition. No tariff, annual yield, thermal comfort, food safety, carbon or guaranteed saving calculation exists.

CSV: `zone_id,power_kw,timestamp`; one row per load zone, nonnegative power in kW, ISO timestamp with timezone, no future timestamps beyond 60 seconds. More than 15 minutes old is marked stale. Snapshot overlays and the independent example-day forecast are explicitly distinguished. No solar or battery telemetry is imported by this schema.

## Next steps for a genuine Penrose twin

1. Winger supplies or authorises floor plans / measurements. Validate rooms, bay types, doors, circulation and the across-road parts location.
2. Use anonymised job IDs and permissioned job-stage event timestamps. Define queue semantics with a service adviser and workshop manager.
3. Replay historical days, compare predicted to observed timings and record uncertainty.
4. Trial a single read-only operational view and human-approved customer-update draft.
5. Treat messaging, bookings or equipment changes as separate integrations with explicit review and action records.

For energy projects, start with an asset/circuit register, authorised interval-meter exports and occupancy schedules. Room-level demand needs circuit or device measurements; whole-building meters cannot independently establish room-level consumption. HVAC, air-quality and safety control require site expertise and additional models.

## Validation

`npm test` covers existing kitchen and New World behaviour plus `tests/twins.test.mjs`: 108 workshop/energy configurations, resource non-overlap, chronological stage order, overload completion, electrical power balance, battery energy conservation, capacity and dispatch limits, unchanged energy when flexible loads shift, essential refrigeration, and malformed/stale snapshot handling.

Browser QA uses the supervised local preview. The cloud browser has WebGL disabled; the geometric Canvas fallback and UI are exercised visually. Native WebGL visual verification remains a limit and should be checked on a WebGL-capable phone/desktop. Neither real customer data nor live building controls were used.
