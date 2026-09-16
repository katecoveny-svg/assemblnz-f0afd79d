# Household Floor DO + browser seat — 16 September 2026 (NZ)

## What landed

Assembl DO twin of Household Floor as a **runnable, shareable** product slice — not a saved Builder plan stub.

### Public share (tonight)

- `/do/household` — widget-y floating-orb aesthetic, pin/template/place/run metaphor  
- **Public scrubbed template** `public_household_floor` (fictional Avery / Quinn / Harper) — **Share tonight**  
- Customisation: display name, plum accent colours, avatar marks  
- **Run evening board** / morning board → Needs you / Working / Done  
- UX honesty: Save to Office ≠ running agent (Builder + Office copy + Household honesty band)

### Owner-private path

- Template `owner_private_household_floor` + `/do/household?install=owner-private`  
- Same seats/schedules; personal household context  
- API install requires sign-in; UI can install device-local with a do-not-share warning  
- **Do not offer extensively tonight**

### Browser seat v0 (`apps/do/extension` 1.4.0)

- Per-DO session key  
- Open URL · consented page text · optional screenshot · receipt  
- Learn-mode playbook stub  
- Catalog hosts for SchoolBridge-style / AT / Council  
- Explicit follow-ups: isolated Chromium profiles + ScreenCaptureKit multi-frame learn mode  

### Docs

- `docs/do-templates/HOUSEHOLD-FLOOR.md`  
- `docs/do-templates/DO-BROWSER-SEAT.md`  
- `docs/do-templates/HOUSEHOLD-FLOOR-DO-SPEC.md`  
- `docs/do-templates/DO-CONNECTORS.md` — Pipedream → DO declare → connect → tools  

### Connectors (Pipedream)

- DOs / Household Floor declare `connectors` / `requiredConnectors` (no tokens in templates)  
- UI states: sign in · setup needed · connect · connected · needs reconnect  
- Reuses `/api/do/connections` + `connectDoGmail` — no second OAuth stack  
- Optional Gmail on public HF template (school mail); drafts-only  

### Trial (402 tonight)

- Signed-in DO owners **bypass** the anonymous 3-task network trial on prepare / family / vision / image / bills  
- If Kate still sees `402 trial_exhausted`, she is signed out — sign in, then retry  

## What Kate can click tomorrow morning

1. `https://www.assembl.co.nz/do/household` (or local `/do/household`)  
2. Install **public** template → customise → **Share tonight**  
3. Download extension ZIP → Load unpacked → paste DO id / session key → consent capture on a school tab  
4. **Connectors** tab → Connect Gmail (optional) via Pipedream — or `/do/connections`  
5. **Run evening board** → clear Needs you drafts (nothing auto-sends)  
6. Private seed only if she needs her real context — never in the public share pack  
7. If prepare returns 402: **sign in** (signed-in owners bypass the 3-task network trial)

## Needs-You

- Live deploy / preview promotion of this branch (no merge/deploy from the agent)  
- Confirm durable Office migrations still healthy on assembl-prod (from #1296) if signed-in private persist is required  
- Optional host permission prompts in Chrome for `*.bridge.school.nz` on first school capture  
- Isolated per-DO Chromium profiles + Mac ScreenCaptureKit learn mode remain follow-ups  
- Full cron scheduler (vs tick API) still open  
- Do not put owner-private PII into marketing/share cards  

## Verify

```bash
pnpm exec vitest run \
  apps/do/shared/household-floor.test.ts \
  apps/do/shared/browser-seat.test.ts \
  apps/do/shared/do-connectors.test.ts \
  apps/do/shared/trial.test.ts \
  app/api/do/household/route.test.ts \
  app/api/do/browser-seat/route.test.ts
pnpm typecheck
```

Manual:

1. Open `/do/household` → install public → run evening board → see Needs you cards  
2. Customise accent/mark/name → preview orb updates  
3. Share tonight copies public link text only  
4. Extension side panel browser seat rejects capture without consent  
