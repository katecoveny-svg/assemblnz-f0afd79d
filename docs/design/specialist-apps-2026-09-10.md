# NZ retirement guide, Flux and Aroha

Three specialist workspaces extend the existing assembl public app framework at `/agents/retirement/app`, `/agents/flux/app` and `/agents/aroha/app`. The corresponding detail routes open the same experience. Older specialist chat links lead into the new workspace. The public agents page adds entry cards; existing copy and private journey gates are preserved.

## What works

- Retirement: six-stage family checklist, older-person priorities, chosen reviewer, permission before putting notes into chat, editable two-option cost comparison, downloadable family plan and a live specialist phone.
- Aroha: role/onboarding, leave/pay, fair conversation and workplace-change preparation; checklists, general notes, reviewer, chosen review date, downloadable brief and live phone.
- Flux: empty or explicitly fictional session pipeline; authenticated existing `public.leads` storage through owner-filtered routes and existing RLS; lead create/update, search, stage/value/owner/next action/date/permission, CSV export and draft follow-ups. Existing legacy notes are preserved. Public prospecting searches business websites and accepts only candidates with an actual first-party search result URL. Evidence and hypotheses remain separate.
- Separate manifests, icons, safe link sharing, portrait share cards and network-only scoped service workers for each app. Conversations and family/HR notes are not cached or persisted by these workspaces.

## Source handling

`lib/specialists/sources.ts` is the curated official catalogue. The chat server selects four relevant official pages before each retirement or HR model call. It uses direct, uncached HTTP retrieval with timeouts, a four-megabyte limit and redirects constrained to known official source hosts. The model receives selected plain-text passages, a SHA-256 content fingerprint, retrieval time and any detected page version date. Retrieved web content is untrusted reference material. No private user text is sent to an external search engine for legal/funding retrieval.

A separate factual editing pass receives the same actual sources. Missing sources, unverified thresholds, proposed reforms and effective-date distinctions must stay visible. This is source-based preparation, not exhaustive legal coverage, legal advice, a clinical assessment or a funding decision. The 1 April 2026 benefit-rate edition is explicitly dated; it must be replaced when a newer edition applies. Linked reports not actually read do not count as verified figures. No availability or village partnership is assumed.

## CRM and connectors

No database migration is needed. The current production schema and owner policies were inspected without reading customer records. `getUser()` verifies a non-anonymous user; every select/update filters by that owner. Account identities are never accepted from the client. Structured Flux next-step fields are versioned inside the existing notes field, retaining free-text notes. CSV cells escape quotes and neutralise formula prefixes.

Live prospecting uses the configured Anthropic web search tool, capped at four searches. It fails visibly if search is unavailable or first-party evidence is missing. Research does not contact anyone, buy data, assert consent or automatically create CRM records.

The HubSpot connection entry uses the existing Pipedream secure connect flow, bound to `tenant:flux-<authenticated-user-id>`. Connecting does not enable sync. External field mapping, write approvals and business-specific adapters still require setup and a real account test. Microsoft 365 and Salesforce are not claimed as connected. CSV is the usable handoff today. No send, sync or contact action is exposed to these specialist models.

## Validation

Local production build, changed-file lint, TypeScript and 38 focused tests passed. Tests cover failed source retrieval, redirect restrictions, text extraction, bounded relevant excerpts, cost arithmetic, contact/record validation, owner filtering, source provenance, deduplication, safe CSV and existing PWA/private boundaries. Browser checks include 375px layout and the family checklist. Hosted model, research and authenticated persistence verification are recorded separately when completed.
