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
- `docs/do-templates/DO-CONNECTORS.md` — Pipedream first-party path  
- `docs/do-templates/DO-MCP-GATEWAY.md` — Composio / Zapier / Treg marketplace MCP  
- `docs/do-templates/DO-NZ-LIVE.md` — NZ Live toolkit  
- `docs/do-templates/DO-PORTABLE-AGENT.md` — agent everywhere vision  

### Connectors + DO MCP gateway + NZ Live

- Pipedream Connect: first-party Gmail / mapped actions (complementary)
- **DO MCP gateway** (marketplace): Composio primary · Zapier long-tail · Treg pay-per-call — `docs/do-templates/DO-MCP-GATEWAY.md`
- **NZ Live toolkit**: AT · weather · NZBN · GeoNet · Parliament · Beehive · fuel · (Waka Kotahi stub) — `docs/do-templates/DO-NZ-LIVE.md`
- Cursor IDE MCP ≠ DO MCP
- **Portable agent**: floating ✦ / Mac orb / Household Floor are the same object — `docs/do-templates/DO-PORTABLE-AGENT.md`
- UI: `/do/connections#mcp-gateway` + NZ Live status cards + HF MCP allowlist  

### Trial model (product rule)

- **Anonymous / public sandbox:** `DO_TRIAL_LIMIT` free tasks per network IP (default **3**)  
- **Signed-in Assembl DO owner:** unlimited prepare — `reserveDoTrial` bypassed  
- If Kate still sees `402 trial_exhausted`, she is signed out — sign in, then retry  
- Ops mid-demo reset (optional):  
  `DELETE FROM agent_chat_sessions WHERE agent_slug LIKE 'do-trial-%' AND anon_id = 'do-network:<hmac>';`  

## What Kate can click tomorrow morning

1. `https://www.assembl.co.nz/do/household` (or local `/do/household`)  
2. Install **public** template → customise → **Share tonight**  
3. Download extension ZIP → Load unpacked → paste DO id / session key → consent capture on a school tab  
4. **Connectors** tab → Pipedream Gmail (optional) + MCP allowlist cards — or `/do/connections#mcp-gateway`  
5. **Run evening board** → clear Needs you drafts (nothing auto-sends)  
6. Private seed only if she needs her real context — never in the public share pack  
7. If prepare returns 402: **sign in** (signed-in owners bypass the network sandbox trial)

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
  apps/do/shared/do-connector-pack.test.ts \
  apps/do/shared/trial.test.ts \
  apps/do/shared/catalogues.test.ts \
  app/api/do/household/route.test.ts \
  app/api/do/browser-seat/route.test.ts
pnpm typecheck
```

Manual:

1. Open `/do/household` → install public → run evening board → see Needs you cards  
2. Customise accent/mark/name → preview orb updates  
3. Share tonight copies public link text only  
4. Extension side panel browser seat rejects capture without consent  
5. `/do/connections` shows Connect for Gmail / Calendar / Sheets / Slack / HubSpot (setup needed when env missing)  
6. Signed-in prepare does not 402; signed-out exhaustion shows sign-in + enquire  
