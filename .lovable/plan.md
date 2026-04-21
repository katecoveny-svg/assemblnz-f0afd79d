

# End-to-end audit & remediation

## Audit findings

| Area | Status | Evidence |
|---|---|---|
| **Page scroll bouncing back** | 🔴 Broken | Lenis smooth-scroll mounted site-wide via `GlobalMotionShell` fights React route transitions and intercepts wheel/touch on long pages — re-anchors to top. |
| **Live data → dashboards** | 🟢 Healthy (data side) | Knowledge brain: 119 active sources, 98 OK, 119/119 checked in 24h. 6 IoT functions present. |
| **Memory persistence** | 🟢 Working | `agent_memory` 50 rows (48 in last 7d), `business_memory` 9, `shared_context` 2 (low — agents not writing back enough). `memory_extraction_queue` 10 backlog. |
| **Inter-agent comms** | 🟡 Plumbing exists, low usage | `workflow_executions` only 11 rows total, `proactive_alerts` 19 in 7 days. Cross-pack `AGENT_KETE_MAP` exists in `pdfBranding.ts` but few real cross-kete handoffs firing. |
| **Evidence packs** | 🔴 Mostly fake | Only 4 rows in `evidence_packs` table, all from 2026-04-11. Of 8 kete generators: 3 functional (Manaaki/Arataki/Auaha), 1 fully cosmetic (Waihanga `setTimeout`), 4 missing or orphaned. None produce a downloadable PDF. |
| **Chat → branded PDF** | 🟡 Partial | `MessagePDFButton` exists (per-message), but no "generate evidence pack from this conversation" path. `pdfBranding.ts` is excellent and reusable. |
| **Brand consistency** | 🟡 Mixed | Waihanga `EvidencePacks.tsx` still uses ochre/yellow `hsl(42,78%,60%)` — violates locked no-yellow rule. |
| **Founder/About page** | 🟢 Ready for new images | Both pages structured cleanly with framer-motion sections. |

## What I'll build

### 1. Fix scroll-jump (highest impact — affects every page)
- Disable Lenis on long content pages by extending `DISABLED_PREFIXES` in `GlobalMotionShell.tsx` to also skip `/founder`, `/about`, `/pricing`, `/how-it-works`, `/kete`, all `/*/dashboard` routes, `/knowledge-brain`, `/evidence-gallery`, etc. — keep Lenis only on the marketing index where it adds polish.
- Add a tiny `ScrollToTop` component that runs `window.scrollTo(0,0)` on `pathname` change (fixes the related "new page opens scrolled mid-way" bug).

### 2. Unified branded evidence-pack PDF service
- Build `src/lib/evidencePackPdf.ts` — a single `generateEvidencePackPDF({kete, title, sections, sources, watermark, conversation?})` that uses existing `pdfBranding.ts` (header/footer/kete colours) and produces a Maunga-style cover, table of contents, body sections, source pointers, and signature block. Removes ochre — uses the locked teal/pounamu palette only.
- Insert a row into `evidence_packs` and trigger client download.

### 3. Wire every dashboard to the real generator
- Replace the cosmetic `setTimeout` in `src/components/waihanga/EvidencePacks.tsx` with the real generator (Building Consent + Resource Consent packs).
- Update `KeteEvidencePackPanel` (used by Manaaki, Auaha, Haven, etc.) to call the unified generator and download a PDF instead of just inserting a JSON row.
- Add the same panel to `Pikau`, `Arataki`, `Ako`, `Hoko`, `Toro` dashboards (currently missing UI triggers).

### 4. Generate evidence pack from chat
- Add a "Generate evidence pack" button to the chat composer toolbar (`ChatPage.tsx`) next to the existing per-message PDF button.
- Posts the full conversation through a small client function: extracts agent claims + sources from the transcript, calls the unified generator, downloads branded PDF, and saves to `evidence_packs`.
- The button is contextual — appears once 3+ assistant messages exist.

### 5. Lift inter-agent + proactive activity (light touch — surface what's already there)
- Make sure `workflow_executions` and `proactive_alerts` are visible on each kete dashboard with a small "Cross-agent activity (last 7 days)" panel — drives confidence the symbiotic system is alive.
- Audit `memory_extraction_queue` (10 stuck) — call `memory-extractor` to drain.

### 6. Brand-consistency sweep on broken pages
- `EvidencePacks.tsx` (Waihanga): replace `hsl(42,78%,60%)` ochre with `#3A7D6E` pounamu.
- Spot-check the 4 dashboards we touch for any other yellow/emoji violations.

### 7. Founder & About images
- Add a placeholder grid of 3–4 image slots in `FounderPage.tsx` and `AboutPage.tsx`. **Awaiting your uploads.** Once you send them I'll drop them into `src/assets/` and wire the imports.

## Technical notes

- PDF generation client-side (jspdf already in tree). No edge function needed for the standard packs.
- Watermark format unchanged: `ASSEMBL-{KETE}-{timestamp}-{shortid}`.
- All packs SIMULATED-flagged unless the input data is real (per evidence-bundles/generator.ts rules).
- Scroll fix is route-config only — zero risk to chat/dashboard pages that own their scroll containers.

## Out of scope for this pass
- Deep redesign of dashboards (only fixing brand violations on touched files).
- New IoT integrations (live-data plumbing already healthy).
- Knowledge-brain new-source seeding (separate task already shipped 119 sources).

## Question before I start
Please send the founder/about images you want included. I'll add image slot placeholders now and swap them in when you upload — or I can wait and do the founder/about update in a single follow-up. Either way I'll proceed with items 1–6 immediately on approval.

