# plugins/_fleet/

> Nothing in this directory constitutes legal, tax, accounting, financial, immigration, customs, biosecurity, or health and safety advice. These agents draft work product — entries, memos, checklists, calculations, draft correspondence — for review by a qualified professional or licensed adviser. They do not file with Inland Revenue, lodge customs entries, submit WorkSafe notifications, make ACC claims, register entities with the Companies Office, send Privacy Commissioner breach notifications, or submit any document to a NZ government agency on the user's behalf; every output is staged for human sign-off.

---

**Fleet-level platform agents.** These three agents sit ABOVE the eight industry kete plugins and the one whānau navigator (`tōro`). They are not industry packs — they orchestrate, audit, and govern everything the kete plugins produce.

| Agent | Role | Where invoked |
|---|---|---|
| `kaihanga` 🤖 | Build orchestrator + chief strategist | Hyperagent (this thread), Codex on Kate's Mac, any code-execution lane |
| `reo` 📜 | Brand voice + NZ legislation citations + five-gate Tā audit | Before any public-facing copy ships (LinkedIn, Substack, kete pages, emails, decks) |
| `auaha` 🎨 | Creative output evaluator (visual + copy under AUAHA Creative Output Rubric) | Before any visual asset, brand-film scene, social card, or kete-page imagery ships |

## Why `_fleet/` and not `<kete>/agents/`?

The Plugin Architecture Canon (8 May 2026) puts industry orchestrator agents under `managed-agent-cookbooks/<slug>/` — for example `managed-agent-cookbooks/pikau-customs-broker/agent.yaml`. Those are kete-specific.

Kaihanga, Reo, and AUAHA are different shape:
- They run continuously, not per-call
- They apply across ALL kete (Reo's rubric audits Waihanga copy and Manaaki copy alike)
- They have hard rules that override individual kete prompts
- They are how the fleet stays coherent

Putting them in `_fleet/` keeps the kete plugin directories clean and gives Codex a single canonical location to find every platform-level agent persona.

## What each agent folder contains

Four files per agent. Read them in this order:

1. **`AGENT.md`** — identity, role, when invoked, handoffs to other agents
2. **`SYSTEM-PROMPT.md`** — verbatim system prompt that defines the agent's behaviour
3. **`SKILLS.md`** — the skills/rubrics this agent loads and when each fires
4. **`HARD-RULES.md`** — non-negotiable constraints (never sign ToS, never accept credentials in chat, etc.)

## For Codex (loading these into a working session)

Open the `AGENT.md` first. It tells you which other files to load and in what order. If you're working on, say, a draft LinkedIn post, you'd load:

```
plugins/_fleet/agents/reo/AGENT.md
plugins/_fleet/agents/reo/SYSTEM-PROMPT.md
plugins/_fleet/agents/reo/HARD-RULES.md
plugins/_fleet/HARD-RULES.md
```

…and run Reo's five Tā gates against the draft before returning it.

For multi-agent work (e.g. brand-film: Reo writes script → AUAHA generates visuals + scores them → Kaihanga ships PR), load each agent's AGENT.md in handoff order.

## Source

This export is the snapshot of canonical agent personas from Hyperagent's runtime config (and from canonical reference docs where the Hyperagent agent isn't yet saved as a named agent). Each agent's `AGENT.md` documents its source provenance.

The Hyperagent runtime is still the source of truth for live agent execution. This `_fleet/` directory is the **versioned snapshot** that Codex and any other code-execution surface can read.

When an agent's prompt is updated in Hyperagent, the change should be mirrored into the matching file here via a draft PR. The repo is the audit trail.

## Status

| Agent | Source | Slice version | Last sync |
|---|---|---|---|
| kaihanga | Hyperagent live config (sourceAgentId `cmom5pc1606m307ad7kdsszzz`) | v0.1 | 2026-05-15 |
| reo | Constructed from Reo Brand Voice Rubric + Brand Output Doc Format skill + Founder Strategy doc | v0.1 | 2026-05-15 |
| auaha | Constructed from AUAHA Creative Output Rubric + Brand Spec — Live | v0.1 | 2026-05-15 |

This is the **first slice** — Kate's seeing the shape before we generalise. Once the structure is ratified, the remaining fleet agents (Kawa, Āwhi, Whetū, Tūtei, Hoahoa, Kaiwhakairo, Strategist) and the kete-specific agents (WHAKAAĒ, ĀRAI, KAUPAPA, ATA, etc.) follow the same pattern.
