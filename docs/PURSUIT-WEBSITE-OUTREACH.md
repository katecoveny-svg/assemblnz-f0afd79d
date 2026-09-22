# Pursuit: website to reviewed outreach

Review implementation, 22 September 2026. Not a production deployment or proof of live provider quality.

## Brief and research

Kate requested research into origami.chat and a stronger website-to-sales-outreach workflow for Pursuit. Public product research on 22 September 2026:

- https://origami.chat/ — seller website → recommended plays → research/enrichment → reviewed campaigns. The site advertises email and LinkedIn sequencing, website visitor signals and contact-provider waterfalls. These are vendor claims, not independently tested performance.
- https://origami.chat/blog/find-owner-operating-manager-contact-information-company-website — website-led owner research, CSV handoff and built-in sequences.
- https://origami.chat/blog/linkedin-outreach-web-redesign-leads-2026 — signal-based prospect segmentation and a multi-touch outreach flow.

Pursuit's proposed advantage is commercial specificity and reviewable evidence, not a claim to outperform Origami's contact coverage or sending infrastructure. Keep the reason to approach, the uncertainty, the proposed proof and the actual draft together.

## Implemented

`/pursuit#website-outreach`: seller website + market brief + provider consent → bounded public research → zero to three distinct prospect accounts → evidence, fit hypothesis, proposed proof and unknowns → editable opening and follow-up → exact-draft review → text download with source trail and research receipt.

The Assembl Flex example supplies a brief only. It does not substitute fabricated leads. It explicitly describes the energy agent as a proposed concept.

**Extends** the existing `/api/pursuit/research` contract, provider transport, reservation/rate limits, private result storage and receipts. Adds optional `workflow: website_outreach` and optional `campaign` output. Old research requests and deck exports remain compatible. No schema migration or new credentials. Existing provider and public trial policy must be enabled.

**Creates** a typed outreach contract and draft/export review identity in `lib/pursuit/outreach.ts`. All seller, prospect, signal and contact URLs must occur in the returned search source trail. Seller domain must match the submitted site. Duplicate prospect domains and the seller itself are rejected. Source matching is not independent verification that the claims are true.

Outreach mode allows up to five provider searches and 5,000 output tokens per response, within the existing two-call and trial reservation bounds. Budget/quality should be evaluated before wider activation. Existing standard research remains at three searches and 2,400 output tokens.

## Limits and authority

- Public research only; no arbitrary server-side URL fetching or new browser crawler.
- No guessed people or email addresses. Buyer roles are suggestions; contact pages are not permission.
- Opening and follow-up are drafts; no message is sent, scheduled or recorded as sent.
- No connected mailbox, verified contact enrichment, CRM writes, campaign orchestration, suppression list or reply processing. These need a separately verified sender integration before real sending is introduced.
- Editing copy, switching prospects, changing the brief or rerunning research clears review. Review permits export only.
- Generated research is stored by the existing trial service. Draft edits remain in memory in the tab and are lost on reload unless downloaded.
- Empty results, provider failure and disabled trials do not return sample prospects.
- Production merge/deployment requires Kate's explicit authority.

## Acceptance and proof

- `lib/pursuit/outreach.test.ts`: input/consent, source links, seller identity, duplicate accounts, empty shortlist, exact-review binding, export provenance, provider request/response and failure behavior. Provider transport is mocked, not a live quality evaluation.
- `scripts/public-pursuit-browser.py`: adds desktop/375px website-to-outreach review, edit invalidation, download and stale-result reset. Fixtures are explicitly testing data, never product fallback. CI uploads screenshots and a report.
- Public Pursuit review workflow includes new tests and focused lint. Typecheck, production build and runtime evidence remain required before ship-ready status.

Rollback: revert this feature commit; no migrations, credentials, customer data deletion or production side effects to reverse.

## Next verified integration

Extend the existing agent email transport and DO approval/evidence primitives only after verifying ownership, recipient provenance, appropriate contact permission, suppression/unsubscribe handling, sender health, exact-content approvals, retry safety and delivery receipts. Do not treat an exported draft as a sent message.
