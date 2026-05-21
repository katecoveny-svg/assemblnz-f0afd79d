# Public Site Copy and Visual Plan

Last updated: 2026-05-21

## Purpose

The public site has drifted into repeated vessel cards, poetic but unclear headings, and legacy tool surfaces that feel like static one-page HTML. This plan gives assembl one source of truth for what each public page is for, what it should say, and what needs to be rebuilt first.

The governing skill for future copy passes is installed locally as `assembl-site-copy-chief`.

## Product Architecture

| Surface | Job |
| --- | --- |
| Homepage | Explain assembl in one screen: mahi that earns its proof, with a clear split between HAPAI tools, Kete packs, Workflows, and Evidence Packs. |
| HAPAI | Public shareable tools. One task, one useful result, linkable and postable. This is the adoption wedge. |
| Kete | Specialist operating areas for sectors and repeatable business domains. |
| Workflows | Repeatable jobs with inputs, review points, and evidence outputs. |
| Evidence packs | The trust object: sources, assumptions, checks, named reviewer, timestamp, and audit trail. |
| Public Assembly | Gated government navigator previews only until the iwi conversation and legal structure are settled. |

## Non-Negotiables

- Header tagline stays `Mahi that earns its proof.`
- `assembl` stays lowercase.
- HAPAI, Kete, and Workflows must not look like three names for the same thing.
- Every public claim must be true today or clearly marked pilot/demo/draft-only.
- Public tools must feel native, interactive, and useful, not iframe-era pages.
- Desktop layouts must hold a stable centre and stop leaving tiny islands of UI in huge cream space.
- Cormorant Garamond is for editorial emphasis, not every instruction or tool heading.

## Priority 0: Trust and First Impression

| Route | Current issue | Required reset |
| --- | --- | --- |
| `/` | Landing has shown old share-card imagery and unclear product split. | Generic assembl first viewport with 3D vessel motion, `Mahi that earns its proof.`, and three plain paths: HAPAI tools, Kete packs, Workflows. |
| `/how-it-works` | Drifts into a generic adoption essay and repeats HAPAI language. | Replace with a tight operating model: input, grounded retrieval, draft, human review, evidence pack, handoff. |
| `/hapai` | Hero and cards are clearer than before but still too waffly and static. | Reframe as `Tools for the job in front of you.` Show tools as native product tiles with live preview states and share images. |
| `/pricing` | Has linked to old Toro/pricing surfaces and risks false promises. | Audit every CTA. Make pricing honest: pilot, tool library, bespoke workflow build, no autonomous claims. |
| `/kete` | Can blur with workflows and HAPAI. | Position as specialist packs by operating area, each with grounded agents, tools, and live knowledge. |
| `/workflows` | Repetitive with kete and HAPAI. | Position as the repeatable jobs assembl can run with you: inputs, reviewers, output, proof. |

## Priority 0: HAPAI Tool Library

| Tool | Route | Current job | Reset needed |
| --- | --- | --- | --- |
| Study Helper | `/hapai/study-helper` | Turn notes, prompts, or photos into an NZ Curriculum study plan. | Keep generic version shareable; add photo parser and clearer teenage language. |
| Meeting Recorder | `/hapai/meeting-recorder` | Record/paste meeting input and produce notes/actions. | Rebuild as an EA-style tool: listen, transcribe, identify actions, prepare calendar/follow-up drafts. |
| The 9am Brief | `/hapai/9am-brief` | Convert loose morning signals into priorities. | Make it feel preemptive: weather, diary, school/sport, reminders, risks, and actions. |
| Vessel Studio | `/hapai/vessel-studio` | Generate brand vessel imagery. | Keep but make output path and draft-only signoff obvious. |
| Caption Composer | `/hapai/caption-composer` | Produce social captions. | Sharpen into post pack: headline, caption, alt text, email subject, share card. |
| Brief Generator | `/hapai/brief-generator` | Create project or pitch briefs. | Connect to evidence, assumptions, and next action checklist. |
| OG Card Generator | `/hapai/og-card-generator` | Generate share cards. | Replace static cramped UI with a polished share-image studio. |
| Tagline Workshop | `/hapai/tagline-workshop` | Generate tagline options. | Make it a brand line evaluator with proof/risk notes. |
| Project Picker | `/hapai/projects` | Rank candidate projects. | Make output decisive: build now, park, reject, next 3 steps. |
| Energy Calculator | `/hapai/energy-calculator` | NZ electrification estimates. | Confirm route state and proof sources before promoting. |
| Privacy Act One-Pager | `/hapai/privacy-act` | Privacy explainer. | Tie to PCO live citations and IPP 3A. |
| Fridge to Shopping List | `/hapai/fridge-to-list` | Photo-to-list household tool. | Keep as Toro/lifestyle proof of photo parsing and practical action. |
| Food Temperature Log | `/hapai/food-temp-log` | Hospitality compliance log. | Connect to Manaaki, audit trail, export/share. |

## Priority 1: Public Trust and Compliance Pages

| Route | Job | Notes |
| --- | --- | --- |
| `/privacy` | Public privacy statement. | Must reference Privacy Act 2020 and IPP 3A accurately. |
| `/ai-use` | Explain model use, human review, and data boundaries. | Must avoid overclaiming autonomy. |
| `/te-tiriti` | Te Tiriti commitment. | Must stay truthful and avoid implying iwi co-design before it happens. |
| `/legal/privacy` | Legal privacy route. | Decide whether to consolidate with `/privacy` or redirect. |
| `/legal/terms` | Terms. | Audit against current product claims. |
| `/legal/disclaimer` | Disclaimer. | Ensure tools and public chat do not exceed this posture. |

## Priority 1: Kete and Specialist Pages

| Route group | Job | Reset needed |
| --- | --- | --- |
| `/kete/[slug]` | Specialist pack pages. | Standardise hero, live data, tools, agents, proof, and boundaries. |
| `/c/[slug]` | Public chat for each kete. | Ensure every agent needing live data can retrieve it, not just Pikau. |
| `/kete/toro/*` | Toro lifestyle surfaces. | Bring logo/imagery back into assembl visual system; remove off-brand SMS/pricing confusion. |
| `/kete/arataki/*` | Dealer/operator tools. | Keep functional dashboard aesthetic, not marketing vessel aesthetic. |
| `/operator/arataki/*` | Dealer pilot surfaces. | Treat as app surfaces, not public marketing. |

## Priority 2: Other Public Routes to Classify

| Route | Decision needed |
| --- | --- |
| `/agents`, `/agents/[slug]` | Keep only if agent pages explain concrete jobs and draft-only limits. |
| `/docs`, `/docs/[slug]` | Decide if public docs or internal leftovers. |
| `/evidence-pack`, `/evidence-pack/preview` | Keep as proof demo, but make one canonical evidence pack example. |
| `/industry-pack` | Decide whether this becomes Kete or Workflows. |
| `/insurance`, `/insurance/results/[id]` | Verify if sellable or demo-only. |
| `/electrify`, `/electrify/results/[id]` | Verify if sellable or demo-only. |
| `/press` | Keep founder/media assets only if current. |
| `/start`, `/start/signup`, `/contact` | Audit CTAs and route intent. |
| `/verify` | Keep if evidence-pack verification works end-to-end. |

## Copy Direction

Homepage:

> Mahi that earns its proof.
>
> assembl turns real work into reviewed outputs with sources, actions, and a record you can stand behind.

HAPAI:

> Tools for the job in front of you.
>
> Try one real task before you do it the old way. Paste, upload, record, or photograph the thing you are stuck on; get a draft, checklist, or next action you can actually use.

How it works:

> From messy input to reviewed output.
>
> assembl gathers the task, grounds it in live sources where available, drafts the work, asks a human to review it, and keeps the evidence pack.

Kete:

> Specialist packs for repeat work.
>
> Each kete brings together tools, agents, knowledge sources, and review rules for a specific operating area.

Workflows:

> Repeatable jobs, not one-off prompts.
>
> A workflow defines the inputs, steps, reviewer, output, and evidence trail so the useful thing can happen again.

## Visual Direction

- Build one shared page shell for marketing pages and one shared app shell for HAPAI tools.
- Restore a generic assembl 3D vessel/motion system to the homepage first viewport.
- Stop using unrelated static vessel share cards as primary heroes.
- Give HAPAI cards real product previews, not decorative images.
- Use hover motion and glow sparingly on meaningful interactions: open tool, share, upload, record, ask, export.
- Keep buttons icon-led where possible and consistent across tools.
- Avoid nested cards and isolated narrow columns on desktop.

## Execution Order

1. Route integrity audit: remove or redirect dead legacy links from nav, pricing, footer, HAPAI, and kete pages.
2. Homepage reset: restore generic 3D assembl hero and product split.
3. HAPAI shell: rebuild list page and tool pages into one polished native framework.
4. How it works rewrite: operating model, not adoption essay.
5. Kete/workflows separation: make each page type obvious.
6. Share assets: generate one sharp share image per HAPAI tool.
7. Live data grounding: generalise retrieval beyond Pikau and expose source notes where relevant.
8. Sellable-state audit: mark each product `sell now`, `demo only`, or `do not promise yet`.
