# Reviewed shopping missions — 14 October 2026

Separate follow-up from main `8d85121397f48173ec746d876614a44055dd2cd4`. Review draft; release belongs to the coordinator.

## Working scope

- Both Shopper DO and the independent Everyday Rewards demonstrator offer Dinner tonight (one dinner), Use what I have (highest average confirmed ingredient coverage in the supported catalogue), and Cook extra for tomorrow (two dinners, same people, pantry deducted once).
- A lower-cost single-recipe replacement recomputes the **complete** consolidated, pack-rounded plan. Before/after totals use the same indicative or fictional price basis. The user must accept; acceptance invalidates quantity/basket review and any prepared receipt. It is not global budget optimisation or a cheapest-store claim.
- Ingredient explanations expose required quantity, confirmed pantry deduction, missing quantity, packs, line cost and purchased-pack leftovers, including pantry-covered lines.
- Shared `lib/do/shop/missions.ts` is pure calculation. Existing consolidation, catalogue, dietary parsing and review boundaries are reused. The demo fails closed for unsupported diets and excludes explicit known allergens; neither surface proves allergy safety.
- No new persistence, model call, cart/order/payment action, account permission or reward entitlement. Existing optional demo activity is unchanged and does not alter quantities or prices. A prepared receipt is not browser-execution authority.

## Product references

[Kroger's September 2026 assistant strategy](https://www.thekrogerco.com/ir-feed-item/kroger-details-ai-strategy-built-on-decades-retail-expertise-at-groceryshop-2026/) informed explicit meal missions and visible budget/diet inputs. [Albertsons' Safeway plugin announcement](https://www.albertsonsmediacollective.com/pr-details/2026/Albertsons-Companies-Expands-AI-Powered-Grocery-Shopping-with-New-Safeway-Plugin-in-ChatGPT/default.aspx) informed useful list preparation with shopper control. These references do not establish a Woolworths integration; this implementation has no merchant connection.

## Evidence

- 63 focused tests across `lib/do/shop` and the Everyday Rewards model/ingredients pass locally. Includes a 45-case mixed dietary-clause matrix: recognised spans never discard unsupported wording.
- Full TypeScript check and scoped ESLint pass. Macron check passes using `node --import tsx scripts/lint-macrons.ts` (the CLI wrapper's IPC socket is restricted locally). Brand and public-front-door guards pass.
- `scripts/review-shop-missions.cjs`: 40 checks at 1440px and 375px, no non-GET requests and no page errors. Verifies actual mission changes, preservation of edited first-dinner servings, pantry review gate, calculations, explicit cheaper-swap acceptance and invalidated approval, mixed unsupported diet blocking, reset of mission/diet state and no horizontal overflow.
- Screenshots and machine-readable checks: `output/shop-missions`. The Loyalty DO CI workflow runs both the existing regression script and this new proof, and uploads both evidence folders. Local screenshot review confirms desktop/mobile layout; production build remains a hosted CI gate.

## Release checklist

- [ ] Coordinator reviews exact PR head, hosted typecheck/build/tests and both browser proofs before publication.
- [ ] DB: no migration, SQL, grants, auth or profile change. Confirm existing continuity services independently if demonstrating saved list text.
- [ ] Persistence: editable plans, mission state and demo receipt remain in this tab. Reload/navigation can discard them; no new durable claim. Existing account-bound voice transport remains unchanged and carries no consent.
- [ ] Vercel: ordinary protected PR previews are allowed. No hosting configuration change is required; production merge/publication remains with the coordinator, who verifies intended commit/environment/aliases and runtime separately.
- [ ] Integrations: real retailer prices, stock, rewards, pairing, cart execution and checkout remain blocked. The separate browser bridge must require fresh observation, selected SKUs and explicit action approval.
- [ ] Voice: no real provider/microphone calls or accent-listening claim in this change.
- [ ] Rollback: revert this PR's mission UI/calculation additions; no DB or stored-data rollback required.
