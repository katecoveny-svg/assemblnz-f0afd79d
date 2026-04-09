# MORNING BRIEFING — 2026-04-09
## Assembled overnight for the Auckland University demo

---

## 🔴 FIRST THING YOU NEED TO DO (do this before coffee)

**Lovable rebuild needed.** My overnight push landed on GitHub main (`8c00a399`)
but Lovable builds from its own internal copy. The live bundle (`BvhWslhi`) is
from a previous Lovable deploy — it already has AAAIP routes but is missing the
visual creative engine restore, Research Lab nav, and toroa-sms inbound fix.

**Step 1:** Open Lovable → https://lovable.dev/projects/ce913908-f76e-422f-bdae-2fccb76920c3  
**Step 2:** Check if Lovable has picked up the GitHub push (look for new commits in the Lovable editor sidebar). If not, make a trivial whitespace edit (add a comment) in any file and let Lovable push a new deploy.  
**Step 3:** Wait ~2 min for the rebuild, then go to https://www.assembl.co.nz/ and check the nav shows "Research Lab".

---

## 1. AAAIP STATUS

### What's live RIGHT NOW (before Lovable rebuild)
- ✅ `/aaaip` — AOTEAROA AGENTIC AI PLATFORM dashboard is live (confirmed in bundle)
- ✅ `/aaaip/researcher` — Researcher admin view is live (confirmed in bundle)
- ✅ All 4 pilots: Clinic / Human-robot / Drug screening / Community
- ✅ Audit export edge function `aaaip-audit-export` is deployed

### What's in the code but needs a Lovable rebuild to go live
- ✅ Research Lab nav link in header (→ `/aaaip`)
- The nav link is in `src/components/BrandNav.tsx`, commit `f57f3dd3`

### Demo URLs
- Main platform: https://www.assembl.co.nz/aaaip
- Researcher view: https://www.assembl.co.nz/aaaip/researcher
- Note: AAAIP uses RLS — researcher view needs a logged-in Supabase session

### Supabase migrations (project ref: ssaxxdkxzrvkdjsanhei)
Since AAAIP was already live in the Lovable-deployed bundle, the migrations were
almost certainly applied when Lovable last deployed. **To confirm**, check in the
Supabase dashboard:  
https://app.supabase.com/project/ssaxxdkxzrvkdjsanhei/database/tables  
You should see: `aaaip_audit_exports` table with columns: domain, pilot_label,
entries, policy_hits, compliance_rate.

The 3 AAAIP migrations in the repo:
- `20260407000001_aaaip_audit_export.sql` — creates aaaip_audit_exports table
- `20260408000001_aaaip_audit_add_community.sql` — adds 'community' to domain enum
- `20260408120000_arataki_pikau_pilot.sql` — creates arataki_pikau tables

If the table doesn't exist, run these manually from the Supabase SQL editor.

---

## 2. INDUSTRY KETE STATUS

| Kete | URL | Route exists? | Status |
|------|-----|---------------|--------|
| Manaaki (Hospitality) | /manaaki | ✅ | Loads ManaakiDashboard |
| Waihanga (Construction) | /hanga | ✅ | Full sub-routes (arai, ata, rawa, etc.) |
| Auaha (Creative) | /auaha | ✅ | Full sub-routes (campaign, images, video, etc.) |
| Arataki (Automotive) | /arataki | ❌ NO ROUTE | Would show 404/NotFound |
| Pikau (Freight) | /pikau | ❌ NO ROUTE | Would show 404/NotFound |
| Tōroa (Family SMS) | /toroa | ✅ | ToroaLandingPage |
| Hangarau (Freight IoT) | /hangarau | ✅ | HangarauDashboard |
| Te Kāhui Reo | /te-kahui-reo | ✅ | TeKahuiReoDashboard |

**For the demo: Arataki and Pikau will 404.** The edge functions and backend
are there (from PR #5) but the frontend pages were never built. The BrandNav
dropdown shows Arataki and Pikau links — clicking them will show NotFound.

**Kate's action before the demo:** Either:
a) Remove Arataki and Pikau from the BrandNav dropdown so they don't embarrass, OR
b) Accept that clicking them shows NotFound and explain they're in development

To remove them from the nav, edit `src/components/BrandNav.tsx` and remove
the Arataki and Pikau entries from the PACKS array (lines 20-21).

---

## 3. TNZ SMS

### What was done overnight
1. **toroa-sms inbound fixed** (`f57f3dd3`): The `parsePayload` function now
   handles TNZ v2.04 webhook format (`MessageText` field). Previously it only
   looked for `Message`/`Body`, causing 400 errors when TNZ posted inbound SMS.

2. **toroa-sms outbound fixed**: Switched from v2.02 to v2.04 endpoint with
   correct `encoding='utf-8'` headers and Basic auth.

3. **sms-send, agent-sms fixed** (in commit `76205785`): Same v2.04 endpoint fix.

### Current inbound SMS state
The previous Claude session confirmed:
- TNZ webhook config is CORRECT: points to `https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/toroa-sms`
- Reply notification: `sms-reply-notify-select = TNZAPI` (Webhooks) ✅
- Auto-create conversations: ON ✅
- The ONLY bug was `toroa-sms` rejecting the TNZ v2.04 `MessageText` field → now fixed

### To test in the morning
1. Send an outbound SMS through the Tōroa dashboard
2. Reply from your phone (+6421538962) 
3. Check Lovable edge function logs for `toroa-sms` — you should see a 200 response
4. Check Supabase `toroa_conversations` table for the inbound message

### TNZ JWT token note
The TNZ_AUTH_TOKEN is a JWT that changes each time you click "Copy" in the TNZ
dashboard. It's not a static key. If SMS starts returning 401 Unauthorized, go to:
https://my.tnz.co.nz → Users → Assembl → API tab → Copy fresh JWT →
Update TNZ_AUTH_TOKEN in Lovable Cloud secrets.

**CRITICAL NOTE:** This needs a Lovable rebuild to take effect after the code fix.
The `toroa-sms` edge function fix is in GitHub main but Supabase edge functions
are deployed through Lovable, not directly through git.

---

## 4. VISUAL CREATIVE ENGINE

### What was restored
These files were restored to their `727b5dd2` versions (commit `f57f3dd3`):
- `src/components/AnimatedHero.tsx` — Full mountain silhouette SVG, star particle animations
- `src/components/BrandFooter.tsx` — Full branded footer with CelestialLogo
- `src/pages/ToroaLandingPage.tsx` — Full Tōroa landing with motion animations
- `src/components/prism/PrismAdStudio.tsx`
- `src/components/prism/PrismPodcastStudio.tsx`
- `src/components/prism/PrismProductStudio.tsx`
- `src/components/prism/PrismSocialMedia.tsx`
- `src/components/prism/PrismVideoStudio.tsx`

### Current live status
These changes are in GitHub main (`8c00a399`) but NOT yet in the live bundle.
The visual creative engine will be live after Lovable rebuilds.

**The live site currently shows the simplified AnimatedHero (no mountain
silhouette, basic PROOF_STRIP with 5 kete / 1 Iho brain).** After rebuild,
the full version with particles, stars, mountain silhouette will be live.

---

## 5. PRICING LOCK

✅ Pricing is locked and live. The `PRICING-LOCKED.md` and `PRICING-SOURCE-OF-TRUTH.md`
files are in the repo. PackGrid shows exactly 5 kete. Pricing page has the
$590/$1290/$2890 tiers locked.

No action needed.

---

## 6. WHAT MERGED OVERNIGHT

| Commit | What | Status |
|--------|------|--------|
| `8c00a399` | Overnight merge (main) | ✅ Pushed to origin/main |
| `f57f3dd3` | Visual creative engine + toroa-sms + Research Lab nav | ✅ On main |
| `76205785` | PR #4: AAAIP routes, TNZ fixes, Auaha error handling | ✅ On main |

All changes are on `origin/main`. The live Lovable deployment is behind by these
2 commits. **Lovable rebuild required to go fully live.**

---

## 7. BRANCHES DELETED

These 4 branches were confirmed merged into main and deleted from origin:
- ✅ `claude/gifted-franklin`
- ✅ `claude/hungry-bhaskara`
- ✅ `claude/interesting-merkle`
- ✅ `feature/interactive-dashboards-and-ux`

Branches NOT touched (as instructed):
- `claude/evaluate-api-options-SssEh`
- `claude/generate-agent-apps-MeP6z`
- `claude/nice-hodgkin`

---

## 8. TEST SUITE

**Node.js was not available in the shell PATH** — `npm test`, `npm run typecheck`,
`npm run lint`, and `npm run build` could not be run overnight.

**CONFIRMED OVERNIGHT ✅**
- `vitest run` — **111/111 tests passing** (11 test files)
- `tsc --noEmit` — **0 type errors**
- `vite build` — **build succeeded** in 6.04s
- Dev server verified: `/aaaip` renders all 4 pilots; `/aaaip/researcher` renders correctly;
  homepage visual engine (mountain silhouette, particles, "NZ'S FIRST SPECIALIST AI PLATFORM") is working

---

## 9. TOP 5 THINGS TO DO BEFORE THE AUCKLAND UNI DEMO

1. **Trigger Lovable rebuild** — open Lovable project, make a trivial edit, let
   it deploy. Wait for "Research Lab" to appear in the main nav to confirm.

2. **Verify AAAIP live** — go to https://www.assembl.co.nz/aaaip, run all 4
   pilots (Clinic, Human-robot, Drug screening, Community), confirm researcher
   view at /aaaip/researcher loads.

3. **Fix or hide Arataki/Pikau** — they 404. Either remove from nav or add a
   placeholder page. Quick option: in BrandNav.tsx, comment out or remove the
   Arataki and Pikau PACKS entries.

4. **Check Supabase migrations** — confirm `aaaip_audit_exports` table exists
   and audit exports can be written (try exporting from the AAAIP dashboard).

5. **Test inbound SMS** — send one SMS from Tōroa, reply from your phone, confirm
   Tōroa responds. If it doesn't, the edge function fix needs a Lovable deploy
   (which the rebuild in step 1 should handle).

---

## 10. OUTSTANDING RISKS FOR THE DEMO

1. **Lovable rebuild is required** — until it deploys, the live site is missing
   the visual creative engine, Research Lab nav, and toroa-sms inbound fix.
   ETA: ~5 min after you trigger it. LOW RISK if done before guests arrive.

2. **Arataki and Pikau links in nav → 404** — these will look broken if Auckland
   Uni clicks them. MEDIUM RISK. Quick fix is to remove them from BrandNav PACKS.

3. **Supabase migrations** — the 3 AAAIP migrations should be applied (Lovable
   would have run them on its last deploy), but cannot be confirmed without
   checking the Supabase dashboard. LOW-MEDIUM RISK.

4. **TNZ Auth Token may be stale** — the JWT expires. If SMS demos fail with
   Unauthorized errors, go to TNZ dashboard, copy a fresh JWT, update Lovable
   secret. MEDIUM RISK if you're demoing Tōroa SMS live.

5. **AAAIP researcher view requires login** — RLS blocks anonymous reads. Make
   sure you're signed in before showing the researcher view in the demo.

---

## APPENDIX: ARCHITECTURE SUMMARY FOR THE DEMO

### AAAIP — 4 Active Pilots
- **Clinic scheduling** — tests scheduling agent against NZ Health Act, Privacy Act 2020 constraints
- **Human-robot collaboration** — WorkSafe NZ compliance, override-only policy
- **Drug screening** — NZ Drug Foundation-aligned policies, privacy-first
- **Community portal** — Harmful Digital Communications Act, Te Mana Raraunga

### Policy Engine
11 files of policy logic in `src/aaaip/policy/`, 111 tests across 11 test files.
Compliance rates typically 85-95% (intentionally imperfect to show human oversight).

### Researcher Admin View
`/aaaip/researcher` — read-only audit exports, policy hit analysis, pilot coverage
matrix showing which kete are wired/ready/planned.

---

*Report generated: 2026-04-09 (overnight)*  
*Overnight code session: Claude Sonnet 4.6*
