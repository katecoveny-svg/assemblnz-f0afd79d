# Hermes Meta Business OAuth — Gap Matrix (Builder progress)

**Source:** Ops gap matrix 2026-09-17 · **Builder update:** PREVIEW PR work on `cursor/meta-business-oauth-preview-a149`

## Decision (locked)

| Item | Value |
|---|---|
| **Meta OAuth host** | `wurwcrgxjjwqdaxqceey` (assembl-prod, Sydney) |
| **Callback URI to register** | `https://wurwcrgxjjwqdaxqceey.supabase.co/functions/v1/meta-business/callback` |
| **Not the host** | `ssaxxdkxzrvkdjsanhei` — dead / legacy Lovable |
| **chatgpt.site Meta secrets paste** | Wrong surface |

## Gap matrix — Builder delta

| # | Hermes item | Ops status (2026-09-17) | Builder PREVIEW status |
|---|---|---|---|
| 1 | App + callback on agreed project | IN PROGRESS (not deployed) | **Out of scope** — no prod deploy / no Meta App redirect registration from this PR |
| 2 | Least-privilege scopes | PARTIAL (code) | **Unchanged** — read-first defaults already on main via #1328 |
| 3 | Asset selector + shared `meta_connection_id` | PARTIAL | **Landed in PREVIEW** — `/agency/connections` selector + shared id |
| 4 | Vaulted tokens / metadata DTO | PARTIAL (code) | **Hardened in PREVIEW** — migration retires April `access_token` table shape |
| 5 | Secure OAuth (signed state, no `postMessage('*')`) | PARTIAL (code) | **Unchanged** — already on main via #1328 |
| 6 | Meta Business card UI | MISSING | **Landed in PREVIEW** — `MetaBusinessCard` on `/agency/connections` |
| 7 | Privacy: Meta optional + deletion route | PARTIAL | **Landed in PREVIEW** — privacy copy + `/legal/meta-data-deletion` |

## Roles (unchanged)

| Role | Next |
|---|---|
| **Kate** | After PREVIEW/prod deploy of `meta-business`, register the **wurw** callback above. Secrets stay in Keychain vault — never chat/PR. |
| **Ops** | Vault hygiene; no live Meta publish without Kate yes. |
| **Builder** | This PREVIEW PR — card + selector + privacy/deletion. No prod deploy without Kate yes. |

## Secrets hygiene (separate)

Tracked `.env` still references dead `ssax…`. Do not invent replacements in this PR.
