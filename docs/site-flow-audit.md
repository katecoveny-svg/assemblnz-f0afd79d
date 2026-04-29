# Assembl site flow — current state

_Read-only audit. Generated 2026-04-29 against `src/App.tsx` (618 lines), `src/data/pricing.ts`, `PRICING-LOCKED.md`, and the two requested page files._

---

## 1. Live routes

### Public marketing
| Route | Component | Status | Notes |
|---|---|---|---|
| `/` | `PearlIndex` (Index) | live page | Pilot Sprint NZ$2,500 homepage |
| `/quiet` | `QuietHeroPage` | live page | Alt hero |
| `/next` | `NextPreview` | live page | Preview/experimental |
| `/pricing` | `PricingPage` | live page | Tier ladder |
| `/platform` | `PlatformPage` | live page | Operator-as-platform |
| `/capabilities` | `CapabilitiesPage` | live page | |
| `/contact` | `ContactPage` | live page | Booking entry |
| `/how-it-works` | `HowItWorksPage` | live page | |
| `/status` | `StatusPage` | live page | |
| `/evidence` | `EvidenceGalleryPage` | live page | |
| `/evidence/share/:token` | `EvidencePackSharePage` | live page | Shared pack viewer |
| `/sample/:kete`, `/sample-evidence-pack` | `SampleEvidencePackPage` | live page | Marketing proof |
| `/agents` | `AgentMarketplacePage` | live page | |
| `/about`, `/founder` | `FounderPage` | live page | |
| `/about-platform` | `AboutPage` | live page | |
| `/case-studies` | `CaseStudiesPage` | live page | |
| `/data-sovereignty` | `DataSovereigntyPage` | live page | |
| `/developers` | `DevelopersPage` | live page | |
| `/trust` | `TrustPage` | live page | |
| `/mariner` | `MarinerLandingPage` | live page | Maritime kete |
| `/council` | `CouncilPage` | live page | |
| `/showcase` | `ShowcasePage` | live page | |
| `/migration` | `MigrationPage` | live page | |
| `/roi` | `RoiCalculatorPage` | live page | |
| `/learn` | `AssemblLearnPage` | live page | |
| `/knowledge` | `KnowledgeCataloguePage` | live page | |
| `/tools/compliance-calculator` | `ComplianceCalculatorPage` | live page | |
| `/proposal`, `/invest` | `InvestPage` | live page | |
| `/brand-guidelines` | `BrandGuidelinesPage` | live page | |
| `/privacy`, `/terms`, `/cookies`, `/disclaimer`, `/security`, `/data-privacy`, `/privacy-vault` | various | live page | Legal/policy |

### Kete landings
| Route | Component | Status | Notes |
|---|---|---|---|
| `/kete` | `KeteCollectionPage` | live page | Hub |
| `/kete/:slug` | `KeteDetailPage` | live page | Per-kete detail |
| `/manaaki` | `ManaakiLandingPage` | live page | |
| `/arataki` | `AratakiLandingPage` | live page | |
| `/pikau` | `PikauLandingPage` | live page | |
| `/pikau/cbaff` | `PikauCbaffLanding` | live page | CBAFF wedge |
| `/arataki/mta` | `ArtakiMtaLanding` | live page | MTA wedge |
| `/hoko` | `HokoLandingPage` | live page | |
| `/ako` | `AkoLandingPage` | live page | |
| `/auaha/about` | `AuahaLandingPage` | live page | |
| `/waihanga/about` | `WaihangaLandingPage` | live page | |
| `/toro` | `ToroaLandingPage` | live page | |

### Kete dashboards
| Route | Component | Status | Notes |
|---|---|---|---|
| `/manaaki/dashboard` | `ManaakiDashboard` | dashboard | |
| `/arataki/dashboard` (+ `loan-cars`, `wof-calendar`, `parts`) | `AratakiLayout` | dashboard | Nested |
| `/arataki/legacy-dashboard` | `AratakiDashboard` | dashboard | Legacy |
| `/arataki/fuel-oracle`, `/arataki/vehicle-economy`, `/arataki/route-intelligence`, `/arataki/driver-compliance` | various | dashboard | Sub-tools |
| `/pikau/dashboard` (+ `customs`, `landed-cost`, `biosecurity`, `dangerous-goods`, `fta`) | `PikauLayout` | dashboard | Nested |
| `/pikau/legacy-dashboard` | `PikauDashboard` | dashboard | Legacy |
| `/hoko/dashboard` | `HokoDashboard` | dashboard | |
| `/ako/dashboard` | `AkoDashboard` | dashboard | |
| `/waihanga` (+ `arai`, `kaupapa`, `site-checkin`, `photos`, `tender`, `docs`, `comms`, `voice`, `ata`, `rawa`, `whakaae`, `pai`, `overview`, `architecture`, `subbies`) | `HangaLayout` | dashboard | Largest nested kete |
| `/waihanga/dashboard`, `/waihanga/workflow`, `/waihanga/workflows` | various | dashboard | |
| `/auaha` (+ `generate`, `gallery`, `audit`, `prompts`, `whaikorero`, `campaign`, `copy`, `image-studio`, `video`, `loom`, `podcast`, `ads`, `calendar`, `analytics`, `brand`, `web`, `speech-image`, `app-spark`, `brand-scan`, `reels`, `queue`) | `AuahaLayout` | dashboard | Largest nested studio |
| `/toro/dashboard` (+ `children`, `education`, `homework`, `health`, `money`, `routines`, `journal`, `go`, `logistics`, `app`, `install`, `travel`, `chat`, `route`, `school`, `transport`) | various | dashboard | Family suite |
| `/toro/legacy-dashboard` | `ToroaDashboard` | dashboard | Legacy |
| `/flux` (+ `deals`, `clients`, `follow-ups`, `call-prep`) | `FluxLayout` | dashboard | Sales |
| `/voyage/command`, `/voyage/plan` | `VoyageCommandPage`/`VoyagePlannerPage` | dashboard | |
| `/dashboard`, `/dashboards`, `/command`, `/workspace`, `/workspace/connections` | various | dashboard | Generic |
| `/operator/:slug`, `/operator/:slug/gates/:gateId` | `OperatorWorkspacePage`/`GateDetailPage` | dashboard | |
| `/care/:seniorId` | `CareDashboard` | dashboard | |
| `/hui` | `HuiMeetingCopilot` | dashboard | |
| `/my-apps`, `/apps/:appName` | `MyAppsPage`/`SparkAppViewer` | dashboard | |
| `/sector/workflows`, `/workflows`, `/settings/workflows` | various | dashboard | |
| `/aaaip`, `/aaaip/researcher`, `/aaaip/pitch-prep`, `/aaaip/landing` | various | dashboard | Research lab |
| `/simulator` | `SimulatorHub` | dashboard | |

### Demos
| Route | Component | Status | Notes |
|---|---|---|---|
| `/demos` | `DemosHub` | live page | |
| `/demos/pipeline` | `PipelineDemo` | live page | |
| `/demos/evidence-pack` | `EvidencePackDemo` | live page | |
| `/demos/confidence-scoring` | `ConfidenceScoringDemo` | live page | |
| `/demos/kaitiaki-gate` | `KaitiakiGateDemo` | live page | |

### Admin
| Route | Component | Status | Notes |
|---|---|---|---|
| `/admin` | `AdminLogin` | admin | |
| `/admin/forgot-password`, `/admin/reset-password` | various | admin | |
| `/admin/dashboard`, `/admin/health`, `/admin/leads`, `/admin/compliance`, `/admin/test-reports`, `/admin/knowledge`, `/admin/flint`, `/admin/test-lab`, `/admin/pikau-validator`, `/admin/claude-usage`, `/admin/github-sync`, `/admin/tnz-version`, `/admin/rag-status`, `/admin/tnz-send`, `/admin/eval/pikau`, `/admin/wiring-check`, `/admin/agent-inspector`, `/admin/design-system`, `/admin/analytics`, `/admin/messages`, `/admin/api-keys`, `/admin/sms`, `/admin/messaging`, `/admin/messaging-live`, `/admin/packs`, `/admin/migration-audit`, `/admin/pack-analytics`, `/admin/skill-wiring`, `/admin/showcase-videos`, `/admin/kb-priorities`, `/admin/knowledge-brain` | various | admin | |
| `/admin/agents`, `/admin/agents/inventory`, `/admin/agents/prompts`, `/admin/agents/prompts/diff` | various | admin | |
| `/admin/mcp` (+ `overview`, `toolsets`, `tools`, `logs`, `customers`, `migrate`, `policy`, `security`, `housekeeping`, `billing`, `server`, `health`, `e2e`, `api-keys`, `ambient`) | `AdminMcpLayout` | admin | Nested |

### Auth/onboarding
| Route | Component | Status | Notes |
|---|---|---|---|
| `/login`, `/signup` | `AuthPage` | live page | |
| `/onboarding` | `OnboardingPage` | live page | |
| `/start`, `/start/pending/:id` | `StartPage`/`StartPendingPage` | live page | |
| `/chat/:agentId` | `ChatPageKeyed` | live page | Per-agent chat |
| `/embed`, `/embed/:agentId` | `EmbedPage`/`EmbedChatWidget` | live page | |
| `/app/:agentId`, `/app/:agentId/workspace` | various | live page | |
| `/sign/:token` | `SignEnvelopePage` | live page | |
| `/settings/connections`, `/settings/integrations`, `/settings/integrations/legacy` | various | live page | |

### Redirects/legacy
| Route | Component | Status | Notes |
|---|---|---|---|
| `/app` → `/kete` | Navigate | redirect | |
| `/welcome` → `/onboarding` | Navigate | redirect | |
| `/try` → `/contact` | Navigate | redirect | |
| `/voyage`, `/voyage/italy`, `/voyage/wanaka` | Navigate | redirect | |
| `/chat/toroa(*)`, `/chat/toro(*)`, `/toroa(*)` → `/toro/app` or `/toro` | Navigate | redirect | Tōro consolidation |
| `/hanga(*)` → `/waihanga` | Navigate | redirect | Rename guard |
| `/helm(*)` → `/toro` | Navigate | redirect | |
| `/pakihi`, `/hangarau`, `/te-kahui-reo`, `/nexus`, `/aroha(*)`, `/landlord`, `/claims-register`, `/turf(*)`, `/skill-hub` → `/` | Navigate | redirect | Retired kete |
| `/aura` → `/manaaki` | Navigate | redirect | |
| `/fuel-savings` → `/arataki` | Navigate | redirect | |
| `/tradie-portal` → `/waihanga` | Navigate | redirect | |
| `/tikanga`, `/te-reo` → `/about` | Navigate | redirect | |
| `/brand-assets`, `/logo-stack`, `/brand-story` → `/brand-guidelines` | Navigate | redirect | |
| `/agents/:agentId` → `/chat/:agentId` | `AgentSlugRedirect` | redirect | |
| `/packs/:packSlug` → `/kete/:packSlug` | `PackSlugRedirect` | redirect | |
| `*` | `NotFound` | live page | 404 |

---

## 2. Two specific pages — current state

### `/pikau/cbaff` — `src/pages/PikauCbaffLanding.tsx`
- **Hero:** "Every importer's cost model just broke. Rebuild it once — keep it current automatically." Badge: _For CBAFF members · 1 April 2026 ready_.
- **Pricing/CTA:** Single offer — **Pikau pilot · 30 days, from NZ$5,000 ex GST**, fixed scope/timeline. CTAs: `Book a pilot` → `/contact?offer=pikau-pilot`, `See a sample pack` → `/sample-evidence-pack`. (Note: this $5,000 figure conflicts with the homepage Pilot Sprint at NZ$2,500 — see §4.)
- **Outcome guarantee card:** ≥99% landed-cost accuracy across first 50 consignments or next 30 days free.
- **Three pillars:** Landed Cost Calculator, Biosecurity Pre-Clearance, FTA Preference Builder (icon cards, no live interaction).
- **Agent/interactive elements:** None — entirely static marketing. No agent chat embedded. Single analytics event `page_version_seen` fires on mount.
- **Regulatory citations / disclaimers:** References Working Tariff Document, 2026 Goods Management Levy schedule, FTA preference rules, Customs/MPI as source feed (via Firecrawl). No formal disclaimer block. CBAFF member-number setup-credit footnote in guarantee card.

### `/waihanga/architecture` — `src/pages/WaihangaArchitecturePage.tsx`
- **Hero:** Eyebrow "ARC · Architecture Agent" + H1 "Design workflow, governed". Back-link to `/waihanga`.
- **Pricing/CTA:** None — this is an agent chat surface, not a marketing page. No tier cards, no booking link.
- **Agent/interactive elements:** Live streaming chat with the **ARC** agent via `agentChatStream({ agentId: "arc", packId: "waihanga" })`. 4 starter prompt cards (design stages, resource consent, H1 energy, BCA checklist). Markdown rendering of replies, textarea + send button, loading spinner.
- **System prompt embedded inline (`ARC_SYSTEM`) — references:** NZ Building Code clauses **B1, B2, C, E2, H1 (2022 update)**; **RMA** activity classes; **BCA / PIM / CCC** consent path; **CCA 2002**; **LBP** scope.
- **Disclaimers:** Operates in **DRAFT-ONLY mode** — system prompt explicitly states ARC "never autonomously file consents or sign off documents" and "every workflow produces an evidence pack referencing the relevant Building Code clauses". No visible UI disclaimer banner — the constraint lives only in the system prompt.
- **Styling:** Hard-coded hex `POUNAMU #3A7D6E` and `CHARCOAL #3D4250` inline — bypasses semantic tokens.

---

## 3. Pricing surfaces

**Locked tiers (per `PRICING-LOCKED.md` + `src/data/pricing.ts`, NZD ex GST):**
Family **$29** · Operator **$1,490 + $590 setup** · Leader **$1,990 + $1,290 setup** · Enterprise **$2,990 + $2,890 setup** · Outcome **from $5,000**.

| Surface | Family | Operator | Leader | Enterprise | Outcome | Verdict |
|---|---|---|---|---|---|---|
| `src/data/pricing.ts` | $29 | $1,490 + $590 | $1,990 + $1,290 | $2,990 + $2,890 | from $5,000 | ✅ matches lock |
| `src/pages/PricingPage.tsx` | — | (not in grep window) | $1,990 + $1,290 | $2,990 + $2,890 | from $5,000 | ✅ shown values match |
| `src/pages/PearlIndex.tsx` (homepage) | $29 (Tōro line) | — | — | — | — | ⚠️ Hero advertises **NZ$2,500 Pilot Sprint** (not in tier ladder); also stale string `"From $399/mo"` at line 340 |
| `src/components/FAQSection.tsx` | $29 | $1,490 + $590 | $1,990 + $1,290 | $2,990 + $2,890 | from $5,000 | ✅ matches lock |
| `src/components/PaywallModal.tsx` | — | **$590/mo** (label only) | **$1,290/mo** (label only) | — | — | ❌ shows monthly fee only (no setup, mislabels Operator/Leader as $590/$1,290 instead of $1,490/$1,990 + setup). Inherited from `STRIPE_TIERS.starter/pro` legacy labels. |
| `public/llms.txt` | $29 | **$590/mo + $1,490 setup** | **$1,290/mo + $1,990 setup** | **$2,890/mo + $2,990 setup** | from $5,000 | ❌ monthly and setup figures **transposed** vs. lock |
| `index.html` (OG/title/JSON-LD) | — | — | — | — | — | ❌ Title/OG still advertise **"Pilot in 30 Days from $15k"** — stale, contradicts both homepage ($2,500) and PIKAU page ($5,000) |
| `src/data/stripeTiers.ts` labels | — | "Operator — $590/mo" | "Leader — $1,290/mo" | "Enterprise — $2,890/mo" | — | ❌ labels show only the monthly half (downstream source of `PaywallModal` mislabel) |

**`scripts/check-kete-names.ts`:** ✅ ran clean — `No standalone HANGA references found. All clear.`

---

## 4. Open questions

1. **Pilot price contradiction.** Three different pilot price points are live simultaneously: `index.html` says **$15k**, homepage hero says **NZ$2,500**, `/pikau/cbaff` says **from NZ$5,000**. None matches the locked tier ladder. Pick one and propagate.
2. **`public/llms.txt` has monthly/setup transposed** for Operator, Leader and Enterprise — LLM scrapers will publish wrong numbers.
3. **`index.html` `<title>`, OG and Twitter meta** still carry the retired "Pilot in 30 Days from $15k" copy. JSON-LD also needs review for the new offer.
4. **`PaywallModal` + `stripeTiers.ts` labels** present only the monthly fee and use the lower number — they look like a discount vs. the real Operator/Leader prices on the pricing page. Either drop setup-fee mention from labels or include it.
5. **`PearlIndex.tsx` line 340** still has a stale `"From $399/mo"` string somewhere in the priority-products data — not on the rendered hero but present in the file.
6. **Lock-file vs. code drift on the kete count.** `PRICING-LOCKED.md` lists **5 locked kete** ("retired Hanga renamed to Waihanga"); `src/data/pricing.ts` and `public/llms.txt` describe **7 industry kete + Tōro** (Manaaki, Waihanga, Auaha, Arataki, Pikau, Hoko, Ako). The locked-count guard `scripts/check-kete-count.ts` enforces "seven industry kete + Tōro", so `PRICING-LOCKED.md` is the stale document.
7. **`/pikau/cbaff` "Talk to us"** links to `/contact` (not `/contact?offer=pikau-pilot`) — analytics will lose attribution for that secondary CTA.
8. **`WaihangaArchitecturePage`** uses inline hex colours rather than semantic tokens (`POUNAMU`, `CHARCOAL`) — diverges from the design-system rule.
9. **Legacy redirects to `/`** for `/landlord`, `/aroha`, `/turf`, `/claims-register`, `/skill-hub`, `/nexus`, `/pakihi`, `/hangarau`, `/te-kahui-reo` — confirm none are still linked from external campaigns before removing.
10. **Two architecture files coexist:** `WaihangaArchitecturePage.tsx` (chat) at `/waihanga/architecture` and `WaihangaWorkflow.tsx` at `/waihanga/workflow` plus `WaihangaWorkflows.tsx` at `/waihanga/workflows` — three near-identical route names, easy to mis-link.
11. **`/mariner` and `/trust`** are still live pages but the homepage strategy brief said to retire Mariner CTAs — confirm intent.
12. **`AratakiLandingPage` vs. `ArtakiMtaLanding`** — file name typo (`Artaki`) for the `/arataki/mta` wedge; harmless but worth noting.
