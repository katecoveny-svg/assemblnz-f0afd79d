# Production Checklist — Outreach Kit 2026-05-15

**Kate's one-time prep before any cold email or demo follow-up ships.**

Total time investment: ~3-4 hours, single Saturday-morning session if uninterrupted.

---

## Prerequisites (do these BEFORE the production tasks below)

- [ ] **Codex dispatched on agent-deployment-surfaces** (or chat-demo route stubs marked `[STAGED]` in all email references) — otherwise the `/c/demo-<kete>` chat-demo links in V2 and demo emails are dead
- [ ] **Outreach kit branch merged to main** — these 13 markdown files land in `marketing/outreach-2026-05-15/` for Codex + designers to find
- [ ] **Sample data populated in each evidence-pack template** — replace `<PLACEHOLDER>` strings with realistic fake data (or anonymised real pilot data from Aironaut / TOA)

---

## Task 1 — Render 4 evidence pack PDFs (~30 min)

For each kete:

- [ ] **Waihanga:** `marketing/outreach-2026-05-15/waihanga/sample-evidence-pack.md` → PDF
- [ ] **Manaaki:** `marketing/outreach-2026-05-15/manaaki/sample-evidence-pack.md` → PDF
- [ ] **Pīkau:** `marketing/outreach-2026-05-15/pikau/sample-evidence-pack.md` → PDF
- [ ] **Arataki:** `marketing/outreach-2026-05-15/arataki/sample-evidence-pack.md` → PDF

**Two render paths:**

**Option A — pandoc on Kate's Mac** (fastest, fine for first pass):
```bash
cd ~/Desktop/assembl-web/marketing/outreach-2026-05-15
for kete in waihanga manaaki pikau arataki; do
  pandoc "$kete/sample-evidence-pack.md" \
    -o "$kete/sample-evidence-pack.pdf" \
    --pdf-engine=xelatex \
    -V geometry:margin=2cm \
    -V mainfont="Cormorant Garamond" \
    -V monofont="IBM Plex Mono"
done
```

**Option B — assembl's own council-pdf edge function** (canonical, but requires the renderer to be wired for marketing/ paths). Defer to second pass if Option A produces usable output.

**Acceptance:**
- Each PDF is 4-6 pages
- Cormorant Garamond renders for headings
- IBM Plex Mono renders for metadata labels
- Real-looking reviewer name, date, hash visible
- ALL `<PLACEHOLDER>` strings replaced with realistic fake data

---

## Task 2 — Record 4 Loom videos (~40 min total)

For each kete, follow `video-script-60s.md` step by step.

- [ ] **Waihanga:** ~10 min recording (with 1 retake budget)
- [ ] **Manaaki:** ~10 min recording
- [ ] **Pīkau:** ~10 min recording (the broker-not-agent line gets repeated 3 times — easy to fluff)
- [ ] **Arataki:** ~10 min recording

**Per-video setup (one-time at start of session):**
- Browser: Chrome, no extensions visible, no other tabs visible
- Loom: 1080p, system audio OFF (we don't want background notification sounds), mic ON (AirPods Pro fine)
- Audio environment: quiet room, no fan, no kids in the next room
- Cam: optional. PiP camera in lower-right at 200px diameter is fine. No cam is also fine.

**Per-video acceptance:**
- Exactly ~60 seconds (anything 55-65s passes)
- Subtitled (Loom auto-generate, edit for accuracy)
- "Anyone with link" sharing enabled (NOT "Loom signup required")
- Custom thumbnail set to a screenshot of the pack PDF or key UI moment
- Loom title matches the script's recommended title

**Post-recording:**
- [ ] Copy each Loom URL
- [ ] Replace `[LOOM-URL-WAIHANGA]`, `[LOOM-URL-MANAAKI]`, `[LOOM-URL-PIKAU]`, `[LOOM-URL-ARATAKI]` placeholders in the 12 cold-email variants

---

## Task 3 — Generate 4 hero images (~20 min total)

For each kete, follow `hero-image-spec.md`.

- [ ] **Waihanga:** Vessel Studio prompt → generate → review → save as `waihanga-evidence.png` (1600×900 minimum)
- [ ] **Manaaki:** same
- [ ] **Pīkau:** same
- [ ] **Arataki:** same

**Vessel Studio path:** `legacy-vite/public/tools/vessel-studio.html`

**If Vessel Studio struggles with the document-mockup geometry** (typography on cream paper at perspective), fall back to:
- Figma (Kate can hand-lay the document in 15 min using existing assembl brand library)
- Canva (lower fidelity but works for first-pass thumbnails)
- Photoshop / Affinity Designer (if higher fidelity needed)

**Per-image acceptance:**
- 16:9 ratio (1600×900 minimum, 3200×1800 retina preferred)
- Warm paper `#FAF7F2` dominant ≥80%
- Pounamu `#2B6B57` accent only — not dominant
- Document mockup is recognisable as a real compliance document at LinkedIn-thumbnail size (400px wide)
- No bitmap photography of subjects (no construction sites, no kitchens, no shipping containers, no cars)
- Lowercase `assembl` if wordmark visible

---

## Task 4 — Upload assets to assembl.co.nz (~10 min)

PDFs:
- [ ] Upload to `/public/assets/sample-packs/waihanga.pdf` (and similar for other 3 kete)
- [ ] Final URLs: `https://www.assembl.co.nz/assets/sample-packs/<kete>.pdf`
- [ ] Confirm URLs return 200 OK (curl test or browser)

Hero images:
- [ ] Upload to `/public/assets/hero/<kete>-evidence.png`
- [ ] Final URLs: `https://www.assembl.co.nz/assets/hero/<kete>-evidence.png`
- [ ] Confirm URLs return 200 OK

**Note:** These uploads are STATIC files in the Next.js `public/` directory. Add via PR + Vercel auto-deploys within ~3 min. Don't use Supabase storage for these — they're marketing assets, not user data.

---

## Task 5 — Final pre-flight email check (~15 min)

Before any cold email or demo email leaves your outbox:

- [ ] Every `[LOOM-URL-*]` placeholder replaced with a real Loom URL
- [ ] Every `[STAGED — chat demo route pending...]` annotation either resolved (route is live) OR removed from emails that won't reference chat
- [ ] Every email has the correct PDF attachment (Waihanga email gets Waihanga pack, etc.)
- [ ] Hero images embed correctly when previewed in Gmail / Outlook (some clients strip inline images — test first)
- [ ] Lowercase `assembl` everywhere — `grep -i "Assembl"` returns zero hits in email files
- [ ] No bare "AI" in customer copy — use "intelligent automation" or describe the function
- [ ] Tōro takes the macron, never Tōroa
- [ ] Recipient list verified — no duplicates, no test addresses, no Aironaut listed twice as different contacts

---

## Optional but recommended

- [ ] **Add a CI lint** for capital-A `\bAssembl\b` in markdown + code files (catches the PR #173 drift class forever). Cowork can wire this in ~30 min — non-blocking for outreach but high-leverage.
- [ ] **Bookmark the LinkedIn Post Inspector** (`linkedin.com/post-inspector/`) — paste the assembl URL after merging Phase 1 portal redesign and the share card should pick up Option A positioning + new hero image
- [ ] **Set up a follow-up reminder cadence** — outreach without a 2-week / 6-week ping is dead outreach. Use Gmail Snooze or whatever cadence tool Kate prefers

---

## What to do AFTER outreach goes out

When a recipient replies positively:

1. **Send them the Loom video first** (warm follow-up #1) — easier to watch than read
2. **Then the chat demo link** (warm follow-up #2 if Codex has shipped agent-deployment-surfaces by then) — `assembl.co.nz/c/demo-<kete>`
3. **Then the live-call booking link** (Pilot Sprint conversation) — `assembl.co.nz/pilot-sprint`

When a recipient replies negatively or doesn't reply within 2 weeks:

- Don't send another cold email (this isn't outbound-spam). One follow-up max, then drop.

---

## Total prep time estimate

| Task | Time |
|---|---|
| Render 4 PDFs (pandoc) | 30 min |
| Record 4 Loom videos | 40 min |
| Generate 4 hero images | 20 min |
| Upload assets | 10 min |
| Pre-flight email check | 15 min |
| Buffer for hiccups | 30 min |
| **Total** | **~2 hr 25 min** |

If everything works first try: under 2 hours. Realistic with one retake budget per task: ~3 hours. With one major hiccup (Vessel Studio failing, pandoc font issue, etc.): up to 4 hours.

Single Saturday morning. Done.

---

**Outreach kit produced by Kaihanga · 15 May 2026 · brand canon enforced (lowercase assembl, no bare AI, macron on Tōro)**
