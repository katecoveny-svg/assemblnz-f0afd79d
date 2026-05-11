# Evidence pack artefacts

Three self-contained, browser-ready evidence pack artefacts.
No dependencies, no JavaScript build step — open the `.html` file
directly in a browser and the pack renders. Each artefact prints
cleanly to A4 (one section per page) — use **Print → Save as PDF**
in the browser for a portable PDF.

Spec: `voyage-evidence-craft.md`
Canonical source: `lib/evidence/fixtures.ts`

## What's in here

| File | Pack | Status | Hero invariants demonstrated |
|------|------|--------|------------------------------|
| `waihanga-precheck.html` | Waihanga · s14B precheck · 27 King St | **sealed** | Soft-gold seal, hash chain on every page, Acceptable Solution citations, agent attribution |
| `co-parenting-april.html` | Tōro · Co-parenting · April posture | **sealed** | Evidence Act 2006 s 137 citation, IRD-reconciled expense ledger, navigator sign-off — the Family Court demo |
| `customs-entry-draft.html` | Pīkau · Customs entry MAW1234567 | **draft** | DRAFT watermark on every page, muted seal, verifier inactive |
| `milestone-certificate.html` | Tāmata · Milestone certificate · 100 packs sealed | n/a | The "we noticed you" object — surprise moment §G.4 |
| `verifier-badge.html` | Embeddable verifier badge | n/a | The small embed for email signatures, lawyer letterhead, BCA correspondence |

## How to view

```bash
# Open directly (macOS)
open public/evidence-pack/artefacts/waihanga-precheck.html

# Linux
xdg-open public/evidence-pack/artefacts/waihanga-precheck.html

# Or drag the .html file into a Chrome / Safari / Firefox window.
```

## How to print

In the browser print dialog:

- **Paper size:** A4
- **Margins:** None (the pack defines its own outer margin)
- **Background graphics:** ON (cream paper colour must print)
- **Headers and footers:** OFF (each page has its own foot line)

## Notes

These artefacts are static HTML snapshots of the three fixture packs.
The in-product render at `/evidence-pack/preview` is the live version
that picks up code changes; these files are pinned for sharing,
emailing, attaching to a contract, or printing on cream stock.

Re-generate any time by running the same fixtures through
`supabase/functions/generate-evidence-pack` (returns PDF) or by
opening `/evidence-pack/preview` and using Save Page As.
