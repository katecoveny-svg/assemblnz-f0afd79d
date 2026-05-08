# CLAUDE.md — assembl-web/plugins/ guardrails

> Nothing in this repository constitutes legal, tax, accounting, financial, immigration, customs, biosecurity, or health and safety advice. These agents draft work product — entries, memos, checklists, calculations, draft correspondence — for review by a qualified professional or licensed adviser. They do not file with Inland Revenue, lodge customs entries, submit WorkSafe notifications, make ACC claims, register entities with the Companies Office, send Privacy Commissioner breach notifications, or submit any document to a NZ government agency on the user's behalf; every output is staged for human sign-off. The user is responsible for verifying outputs and for compliance with all applicable New Zealand laws, including but not limited to the Privacy Act 2020, the Consumer Guarantees Act 1993, the Fair Trading Act 1986, the AML/CFT Act 2009, the Customs and Excise Act 2018, the Building Act 2004, the Construction Contracts Act 2002, the Health and Safety at Work Act 2015, and any tikanga Māori obligations relevant to their work.

---

## Hard rules (canon §10 — override everything else)

1. Every output is staged for human sign-off. Agents never submit, lodge, file, or send anything to a NZ government agency, regulator, or financial institution autonomously.
2. Named-prohibited-actions list is in every agent's system prompt. Explicit, not implicit.
3. No NZ legal, tax, customs, immigration, H&S, biosecurity, or financial advice. Always recommend a qualified professional or licensed adviser.
4. Tikanga Māori check required on every customer-facing output. Macrons enforced. Reserved taonga terms not used as product names. **The word 'AI' is banned in customer-facing copy** (use 'intelligent automation' or describe the function).
5. Privacy Act 2020 IPPs always apply. IPP 3A (effective 1 May 2026) for indirectly collected information.
6. Audit log every tool call to `assembl_audit_log`. 7-year retention.
7. File-based source of truth. `agent_prompts` table is a runtime cache, not the source.
8. The 'never build' MCP list (canon §8.1) is permanent. No PR may add lodgement / filing / submission MCP servers to any agent.

## Structural foolproofing (canon §7 — summary)

Adherence is enforced by shape, not post-hoc audit. Seven mechanisms:

1. **Hard-coded human-in-the-loop language** — every plugin's README and CLAUDE.md states 'every output staged for human sign-off'. Legal shield, not decoration.
2. **File-based, not database-based** — plugins are markdown and JSON. Compliance officers read system prompts and skills directly. Every change is a git diff.
3. **Connectors as MCP, not API keys in code** — data access goes through MCP servers. Agents have no raw credentials. NZ government APIs (NZBN, Companies Office, RBNZ Stats, Stats NZ) wrapped as MCP servers assembl operates.
4. **Sub-agents have scoped permissions** — every sub-agent's YAML declares `allowed_tools` (positive list) and `denied_tools` (explicit prohibitions). Three independent enforcement layers: (a) not in `allowed_tools`, (b) in `denied_tools`, (c) MCP server does not exist in `.mcp.json`. 'The agent went rogue' is technically impossible.
5. **Audit log on every tool call** — Supabase `assembl_audit_log` (RLS on `org_id`, 7-year retention per Customs Act s.405 and Tax Administration Act).
6. **Named-prohibited-actions list per agent** — every `agents/<slug>.md` system prompt has an explicit 'Will NOT do' list.
7. **Three-phase rollout playbook** — Foundation (now → end of May 2026); Pilot (June–July 2026, PIKAU + WAIHANGA); Scale (August 2026 onward, CBAFF + NZIA / Master Builders).

## Scope of this CLAUDE.md

This file scopes to `plugins/` only. The repo root has its own README that describes the Next.js website. The verbatim disclaimer above applies to the contents of `plugins/`, not the website.

The Vercel build excludes `plugins/` via `.vercelignore` and `vercel.json`'s `ignoreCommand`.

## Repo conventions

- Lowercase wordmark `assembl` everywhere in docs, comments, READMEs.
- Slug convention: `lowercase-kebab` (e.g. `pikau-customs-broker`, not `PIKAU` or `PikauCustomsBroker`).
- Markdown for skills (`skills/<slug>/SKILL.md`). YAML for agents (`agents/<slug>.yaml`, `subagents/<slug>.yaml`). Do not invent JSON for skills. Do not invent markdown for agents.
- `.mcp.json` lives in each plugin's root and registers MCP server entries.
- `.claude-plugin/plugin.json` is the manifest. `.claude-plugin/marketplace.json` (root only) lists installable plugins.
- Apache 2.0 license. Verbatim disclaimer at top of README.md and CLAUDE.md (this file). Do not paraphrase.
- No secrets in source code. `.env.example` only — never commit `.env`.
- The 'never build' MCP servers (canon §8.1) stay out of this repo entirely. PRs adding them are rejected.

## Build sequence

Read `CANON-plugin-architecture-2026-05-08.md` (locked 8 May 2026) before opening any PR. The 14-day build sequence is sequential, not parallel — Day N depends on Day N-1's verifiable artefact.

When something contradicts this guide, escalate to Kate Hudson (assembl Ltd). This repo is the spec; Kate is the source of truth.
