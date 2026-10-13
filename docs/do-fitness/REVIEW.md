# DO Fitness — bounded first slice

Base: main `dc12199c0` (PR1560). Draft only; no merge, production configuration, SQL or provider setup authorised.

## Scope and authority

`/do/fitness` is a synthetic adult, session-only demonstration. One DO coordinates Fitness and a Shop ingredient review in the same interface. Uses the existing portable `AgentSpec`, Office projection, Strong catalogue/engine and Shop `consolidate`; no registry, agent store or database is created. Chief/Fitness request and response are explicit and revision-bound. Deterministic local preparation runs only after input review. It is not an autonomous specialist or live model runtime.

Reviewed inputs: goal, place, equipment, time, weekly frequency and food preference. Outputs: bounded movement draft, first four weeks from the donor programme, manual sample activity marker, up to two sample dinners, separately reviewed food-only ingredient handoff. Every material edit clears dependent draft/review/activity. Reload clears all sample state.

No account identity is accepted: the only contract scope is the fixed synthetic session. There is no health endpoint or persistent owner record. An authenticated adapter must resolve owner and purpose server-side before a future real-data slice. Do not reuse the synthetic scope as an authorization key.

## Donor findings and changes

- `lib/health/strong/{schema,catalogue,engine}.ts`, `components/health/StrongDashboard.tsx`, `/health/strong`: fictional donors, not private health records.
- Engine previously omitted equipment/location checks and fallback compatibility. Now it validates both and prevents duplicate fallback prescriptions; exact known dumbbell aliases are supported, location never implies gym equipment.
- Failed meal swaps previously returned a potentially conflicting original. Now a conflicting fallback returns null; existing Strong UI handles that result. Whole-plan validation is reusable and rerun on every selected recipe at the Fitness→Shop boundary.
- Catalogue allergy declarations are incomplete evidence. This slice withholds meals for all allergy/medical/unsupported requirements; declarations never establish product safety.
- Strong units include `ea`, `g dry` and `slices`. The adapter explicitly maps `ea`→`each`; unsupported units block handoff with the ingredient and original unit. It does not invent conversions or cast strings to Shop units.
- Strong sample nutrition targets are not used/exposed by this slice. No medication-derived targets, calorie prescriptions or invented clinical clearance. Review-required movements are withheld.
- Shop `lib/do/shop/preparation.ts` remains authoritative and unchanged. It consolidates servings/ingredients here; pantry, packs, budget, retailer offers and checkout are not yet reviewed by this slice.

## Privacy and boundaries

Health state is never stored in localStorage/sessionStorage, sent to a model, placed in URLs or sent to Shop. The allowlisted Shop payload contains only selected recipe definitions, servings, ingredient requirements and food constraints, plus synthetic routing/revision metadata. It excludes exercise, goals, activity, medication and nutrition targets. The receiver rebuilds from the current validated request and rejects stale review, unknown/duplicate recipes and extra fields.

`manual-record.ts` stages a strict synthetic user-entered record contract only. It retains amount text as entered and provides no dose advice, diagnosis, scheduling, dose changes, UI, persistence or Shop transmission. A real medication log requires separate privacy/retention/access/deletion review. HealthKit, GPS and Strava are unconnected; no assumed Strava API or AI data rights.

## Coordination

Shop PR1563 owns ShopJourney, PersonalDo, DoFocusWorkspace, voice and shared diagnostics: untouched. Its reviewedText embedding interface is not on this main baseline, so this slice does not claim that full Shop journey integration. It shows a local ingredient review using the authoritative preparation primitive. Saved PR1564 owns its routes/API/contracts: untouched. Shared DoUtilityDock adds only `/do/fitness`; retain `/do/saved` and other parallel additions when integrating.

## Validation and release gates

Local focused tests: 27 passed (Fitness contracts, Strong engine, Shop preparation); scoped ESLint passed. Hosted workflow `do-fitness-review.yml` runs current full typecheck, focused regressions, scoped lint, guarded production build and actual Next browser interactions at 375/1440. Browser script checks review gates, edits invalidating prior approval, withheld allergy/medical suggestions, no localStorage changes/outbound writes, reset on refresh and horizontal overflow; captures ready/reviewed/withheld states.

Ship readiness requires all of the following on the final commit:

1. Hosted typecheck, relevant regression tests, lint, guarded build and browser proof green; inspect downloaded screenshots, not only test exit codes.
2. Normal PR preview READY on exact head; verify `/do/fitness` and canonical glass asset. No production promotion.
3. Resolve review findings and preserve parallel shared-route changes.
4. For any real-user follow-up: authenticated owner/purpose resolution, health-specific retention/deletion/access controls, isolation and consent tests. No ordinary browser storage fallback.
5. For full Shop follow-up: integrate the reviewed food payload with the Shop owner's account boundary, preserve fresh food/pantry/budget review and do not transport health context.
6. For health integrations: separate policy, permissions and actual provider proof; no current access claim.

Rollback: revert this feature commit; no database/configuration or durable data migration exists.
