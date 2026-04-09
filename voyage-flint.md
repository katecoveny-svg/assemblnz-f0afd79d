# Voyage Flint — Scope & Review Workflow

> **What is this?** The authoritative reference for how Flint integrates with Assembl. Read this before making any change to Flint's configuration, the page manifest, or the guard code.

---

## 1. What Flint owns

Flint is authorised to draft and propose edits to the **six Assembl marketing landing pages** only:

| Page | Route | Kete colour |
|------|-------|-------------|
| Homepage | `/` | `#3A7D6E` (Waihanga teal — brand neutral) |
| Manaaki | `/manaaki` | `#D4A843` (gold) |
| Waihanga | `/waihanga` | `#3A7D6E` (teal) |
| Auaha | `/auaha` | `#F0D078` (yellow-gold) |
| Arataki | `/arataki` | `#C65D4E` (rust) |
| Pikau | `/pikau` | `#5AADA0` (turquoise) |

The editable regions within each page are declared in `assembl-page-manifest.json` (repo root). Flint must read the manifest and only touch regions listed under `editableRegions`.

---

## 2. What Flint does NOT own

Flint is **explicitly blocked** from editing:

- `/aaaip` and all sub-routes — live AAAIP simulation dashboard, hands-off
- `/toroa/dashboard`, `/toroa/app`, `/toroa/install` — Tōro whānau app
- Any Kete dashboard routes (e.g. `/waihanga/safety`, `/manaaki/compliance`)
- `nav` and `footer-legal` regions on every page (locked in manifest)
- `hero-tagline` on the homepage (version-locked brand copy)
- `wananga-quote` on all Kete pages (te reo integrity — kaitiaki only)
- `kete-name` on all Kete pages — canonical Māori names are not negotiable

If Flint proposes an edit to a locked region or a blocked route, the guard returns `block` and the edit must not be committed.

---

## 3. Canonical Kete naming rules

These are hard constraints. Violations are auto-rejected by the guard.

**Current canonical names** (use exactly as written):
Manaaki · Waihanga · Auaha · Arataki · Pikau · Tōro

**Retired names** (must never appear in Flint-generated copy):
Hanga · Pakihi · Waka · Hangarau · Hauora · Te Kāhui Reo

**Tōro specifics:**
- Tōro is the **SMS-first whānau family navigator** — Bird icon, not maritime.
- Do not use "Tōroa" as a product name in marketing copy. The repo uses `toroa` as a URL slug for legacy reasons, but the *marketing brand name* is **Tōro**.
- Do not reference maritime metaphors (Mariner, Helm, ship imagery) — all retired.

**Arataki specifics:**
- Arataki is **Automotive** — do not sub-brand it as "Automotive Intelligence" or any variation. The Kete name is the brand.

---

## 4. Review workflow

```
Flint drafts edit
       │
       ▼
flintGuard.evaluateFlintProposal(proposal)          ← src/aaaip/integrations/flint-guard.ts
       │
       ├─ verdict: "block"      → Hard reject. Log auditId. Do not commit. Flint notified.
       │
       ├─ verdict: "needs_human" → Queue for brand/kaitiaki review.
       │                           Do NOT auto-commit.
       │                           Attach auditSummary(result) to review request.
       │                           Human approves → proceed to commit step.
       │
       └─ verdict: "allow"      → Commit edit to main branch.
                                  Embed auditSummary(result) in commit message.
                                  Lovable detects push → auto-syncs to preview.
```

### Commit message format

Every Flint-generated commit **must** include the audit trail:

```
feat(flint): update <page>/<region>

flint-audit: {"auditId":"flint-audit-...","page":"...","verdict":"allow",...}
```

The `auditId` is the durable link between the live site and the compliance decision that approved it.

---

## 5. AAAIP policy gates

All Flint proposals run against the **Auaha compliance engine** regardless of which page is being edited. These six policies always apply:

| Policy id | Name | Severity | What triggers it |
|-----------|------|----------|-----------------|
| `auaha.copyright` | Copyrighted material must be licensed | **block** | Third-party asset without a licence ref |
| `auaha.likeness_consent` | Likeness consent required | **block** | Identifiable person without model release |
| `auaha.brand_safety` | Brand safety filter | warn → needs_human | `brandRisk > 0.6` |
| `auaha.te_reo_integrity` | Te reo integrity check | warn → needs_human | Te reo content without kaitiaki review |
| `auaha.misinfo_check` | Misinformation check | warn → needs_human | `factScore < 0.55` |
| `auaha.uncertainty_handoff` | Defer to humans when uncertain | warn → needs_human | Flint confidence < 0.7 |

Policy definitions: `src/aaaip/policy/auaha.ts`
Guard implementation: `src/aaaip/integrations/flint-guard.ts`
Page manifest: `assembl-page-manifest.json`

---

## 6. Kill-switches

If Flint needs to be suspended immediately:

1. **Environment variable** — Unset or rotate `FLINT_API_KEY` in the deployment environment. Flint loses API access instantly; no code change needed.
2. **Manifest flag** — Set `"flintOwned": false` on any page entry in `assembl-page-manifest.json`. The guard should check this before evaluation (caller's responsibility to read the manifest).
3. **Route-level block** — Add any route to `globalConstraints.flintMustNotEdit` in the manifest. Callers should enforce this before calling the guard.

---

## 7. Rollback

If a bad Flint edit lands on main:

1. Find the commit by searching for `flint-audit:` in git log: `git log --grep="flint-audit" --oneline`
2. Revert the commit: `git revert <sha>` (creates a new commit — no force-push needed)
3. Push revert to main — Lovable syncs automatically
4. File the `auditId` from the commit message in the post-mortem; use it to look up the full compliance decision in the audit log

Because every Flint commit carries the audit trail in the commit message, rollback is always traceable.

---

## 8. Environment variables

| Variable | Purpose | Where set |
|----------|---------|-----------|
| `FLINT_API_KEY` | Authenticates Assembl to the Flint MCP server | Supabase Edge Function secrets / Vercel env |

**Never put the API key in source code or chat.** Rotate immediately if exposed.

Flint MCP endpoint: `https://mcp.tryflint.com/mcp`

---

## 9. Files in this integration

| File | Purpose |
|------|---------|
| `assembl-page-manifest.json` | Page ownership, colour tokens, messaging hooks, locked regions |
| `src/aaaip/integrations/flint-guard.ts` | Compliance evaluation wrapper — call this before every commit |
| `src/aaaip/policy/auaha.ts` | Source of truth for the six creative policies |
| `voyage-flint.md` | This document |
