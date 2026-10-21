# RP01 print and physical verification plan

**All tests pending.** These are internal development acceptance targets, not certification standards or customer load ratings. Record failures as failures; repeat full relevant sequence after any material, geometry, slicer or fastener change. Start with standard; do not infer mini/tall/long performance from it.

## Specimens and records

Print at least three standard sets using the intended production printer/profile, plus a sacrificial gasket and fastener-fit sample. Give each specimen an ID. Record STL SHA256, material brand/colour/batch, drying, nozzle, extrusion width, layer height, temperature, cooling, orientation, perimeters, top/bottom layers, infill, supports, actual mass, hardware and operator. Photograph before/after. Use separate specimens for destructive tests and for baseline leakage where practical.

Suggested starting profile: PETG, 0.4 mm nozzle, 0.20 mm layers, six perimeters, at least 3.2 mm solid floor; inspect sliced thin-wall fill rather than assuming perimeter count creates the CAD wall. Lid 4 mm thick, with solid seal region; solid ribs/ears/columns. Gasket TPU 95A, 0.4 mm nozzle, 0.16 mm layers, solid cross-section, slow manufacturer-approved profile, dry filament. Temperature/retraction/drying from the exact filament supplier. The 1.6 mm gasket is ten layers at 0.16 mm. No seam gap is acceptable.

Shell upright and carrier plate-down; lid flat top-down (groove upward); gasket flat. Foam deck upright needs supports beneath raised platform; use a removable support interface and inspect feet. Carrier screw counterbores form short bridges that may need local support/cleanup. Lower the finished STLs at their existing z=0, do not rescale. Review every slicer layer before printing. CAD-manifold checks do not prove bridge quality.

## 1 · dimensional / closure gate

Measure shell/lid flatness across both axes and the full seal perimeter, wall/floor thickness, actual groove depth/width at eight stations, gasket thickness at eight stations, bore/nut fit and assembled height. Starting targets: seal land flatness ≤0.15 mm; no voids/burrs/strings crossing it; lip moves freely; each hard stop closes without forcing or visible bow. Measure a free gasket sample before and after 24 hours compressed; record recovery after 1 and 24 hours.

The nominal squeeze is 25%; select the actual gasket/channel combination to remain within an initial exploratory 15–30% target at all measured stations. A 95A printed gasket may require excessive closing force: if so, test a softer gasket/continuous commercial seal rather than increasing torque. Do not presume TPU interlayer sealing. Ink/contact-film checks should show a continuous contact band around the entire perimeter. Tighten diagonally in small steps using a low-range torque driver and record torque at first stop contact, lid bow and removal torque. No torque rating is supplied. Cycle open/close 100 times, inspect every 20, then repeat leak and compression checks.

Confirm TURN keys lock/unlock at least 50 times in a bench mount without cracking, excessive force or spontaneous release. Mark the locked orientation. Confirm side tool access with shell attached; keys must be preinserted before attaching the shell. Check every fastener head below the carrier remains recessed. Record any necessary fit adjustment as a new geometry revision.

## 2 · water ingress (unpowered, disposable contents)

Use dry absorbent paper inside and a 0.01 g scale for paper mass. Record empty dry assembly mass too. Do not put electronics or valuables inside.

1. Empty shell only: stand on dry paper, fill cavity to 5 mm below rim for 60 minutes. Target no external wet mark or visible seepage. Dry fully.
2. Closed dry pod: spray room-temperature fresh water from all sides for 10 minutes with ordinary low-pressure spray; document distance/flow/orientations. Dry outside carefully before opening. Target no visible interior wetting and paper gain ≤0.10 g relative to an exposed control paper handled identically.
3. Exploratory dunk: hold the closed pod so its top is 300 mm below the water surface for 60 seconds. Restrain gently without squeezing lid/walls. Record bubbles, exterior drying method, interior paper gain and visible wetting. Same initial acceptance target. This does **not** establish an IP rating or a service immersion capability.
4. Repeat after 100 closure cycles and after the drop and mounting tests. Any wetting fails the internal gate. Separate floor leakage, rim leakage, layer porosity and fastener/root cracks rather than treating all failures as a gasket issue.

Use cool/room-temperature water; avoid pressure/vacuum testing without a separately designed safe fixture. No formal IP test or electrical enclosure certification is included.

## 3 · impact

Guard the area, use eye protection and keep people clear. Fit 100 g inert secured payload; record total mass and closure torque. Drop closed pod from **1.5 m**, measured at its lowest point, onto concrete: bottom, top, four side orientations and four oblique rim/ear/lug orientations, **ten drops total**, each controlled and recorded. Test at least three specimens; inspect after every drop and stop if fragments detach.

Target: lid remains closed, no cracks/delamination, no lost fasteners, continuous seal land, no broken lug/carrier, and subsequent water test passes. Cosmetic scuffs are recorded. Repeat separately at the actual intended payload once specified; this 100 g test does not create a payload rating. Printed layer direction and cold/heat exposure may materially change results.

## 4 · flotation / retrieval

Weigh the real printed assembly, hardware, keys, foam and intended contents. Test **off the scooter mount**, with a slack recovery line and supervision. Never rely on the pod as a flotation device.

- Fresh water baseline, closed and empty: release gently in six orientations. Record stable orientation, time to settle, lowest seal height above water and total wet mass at 1, 10 and 30 minutes.
- Add inert load in 25 g steps, measuring freeboard and stability each time. An initial development target is ≥10 mm freeboard to the lowest seam for 30 minutes, with no ingress; this is deliberately stricter than merely remaining at the surface. Stop before loss/retrieval risk. Actual accepted payload remains undecided until data review and margin selection.
- Repeat with the selected foam and with the lid deliberately open/compartment fully flooded. Foam-under-deck does not guarantee flooded floatation. Record whether it floats, floats inverted, slowly sinks or sinks immediately. Repeat after a 24-hour water soak of foam and after impact.
- Test retrieval eye on a bench at 10 N for 60 seconds in three directions, then ten pulls at that force. Inspect hole/root. This is an exploratory test target, not rated strength. Use measured retrieval loads to choose the next test. A snag can exceed this load dramatically.

Buoyancy estimate: in fresh water, 1 cm³ of submerged displacement offsets about 1 g. For flooded flotation, foam's required net lift must exceed the submerged apparent weight of plastic, metal and contents; conservatively use their full air mass plus margin if displaced solids are not measured. For foam density rho in g/cm³, net lift is roughly V×(1−rho) grams. Measure foam density and water absorption; use actual part/contents mass. The 6 mm space is limited and ribs/feet reduce it. If the required volume will not fit, use a separately tested external float or redesign; do not state the deck makes the pod float.

`validation.json` includes an **ideal sealed body reference displacement**, excluding expanded rim/carrier and using a simple stadium envelope; it is not an exact buoyancy calculation. The solid-PETG mass estimate uses 1.27 g/cm³ and excludes TPU, metal and payload. Neither number is a float claim. Carrier adds considerable weight; the mini's margin in particular must be established experimentally.

## 5 · mounting security

First mount on a restrained representative tube in a guarded bench fixture; **no public-road or ridden test at this stage**. Measure actual tube geometry and use the existing saddle's intended strap. Check steering, folding, brakes, cables, knees, wheel clearance and key/tool access on the stationary intended vehicle. No named scooter model has been measured here.

1. Record all fit dimensions and key orientation; apply witness marks across keys, carrier, saddle and strap. Photograph strap routing and tension.
2. With 100 g secured dummy payload, apply a measured 20 N static pull for 60 seconds in each of the six principal directions. Apply 1 N·m slowly in each twist direction. Record slip in mm/degrees, key movement, cracks and permanent deformation. Initial target: no release, no cracks, <1 mm slip and <2° rotation. These arbitrary development proof targets are not rated service loads.
3. Apply 1,000 alternating ±5 N cycles at about 1 Hz laterally and fore/aft with a force-controlled fixture; inspect every 100 cycles. Record fixture method, acceleration/force and mounting offset. Retest static retention and water ingress. A shaker specification should be chosen after measuring actual service vibration; no road-vibration equivalence is claimed.
4. Leave intended load mounted 24 hours at room temperature, then repeat fit/retention checks to look for creep. Only after baseline success, test controlled warm conditioning at 45°C for 4 hours in a non-food chamber and repeat; this is a development screen, not a safe temperature limit.
5. Before any supervised private-area dynamic trial, review bench data, choose actual service load and a tested secondary retention method, confirm vehicle-owner/operator permission, and ensure no control/steering interference. Do not use a loose 2 m line near wheels or steering. Public/shared scooters need separate operator approval.

## Release gates

All specimen IDs and measurements recorded; dimensional fit accepted on intended production process; water/impact/mount tests passed with recorded margins; flotation payload and orientations measured; gasket life/creep and hardware retention reviewed; every marketed size tested independently; revised claims reviewed. No stock activation, store claims, public riding or production release is authorised by this CAD package.

| Specimen | Printer/profile | Dry mass | Gasket/land dimensions | Closure torque | Leak before/after | Drop result | Float payload/freeboard | Mount force/slip | Decision |
|---|---|---|---|---|---|---|---|---|---|
| pending | | | | | | | | | |
