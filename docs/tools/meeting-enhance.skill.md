---
name: meeting-enhance
description: >
  Turn a meeting transcript into Granola-class structured notes: decisions,
  actions (owner/due when stated), follow-ups, and open questions. Key-gated
  HTTP tool. Drafts only — nothing is sent or assigned. Complements Meeting DO.
category: meeting
inputs:
  - name: transcript
    type: string
    required: true
    description: Meeting transcript or pasted notes.
  - name: title
    type: string
    required: false
    description: Optional meeting title.
endpoint: POST /api/tools/meeting-enhance
auth: Bearer test_… (sandbox) or live key
docs: /tools/meeting-enhance
---

# meeting-enhance

Use when an agent has a transcript and needs structured actions/decisions for human review. Complements Meeting DO (`/do/meetings`); does not replace the capture UI.

## Example

```bash
curl -sS -X POST "https://assembl.co.nz/api/tools/meeting-enhance" \
  -H "Authorization: Bearer test_assembl_demo_nz_who_runs_it" \
  -H "Content-Type: application/json" \
  -d '{"title":"Sprint sync","transcript":"Alex will ship the checklist by Friday. We agreed to launch next week. Budget still open."}'
```

## Adapters + honesty

- Sandbox (`test_…`) returns deterministic structured notes — no model call.
- Live reuses DO meeting-notes preparation when a model ladder is configured; otherwise 503.
- `draftsOnly: true` always — never claims email/assignment happened.

## Cap / receipts

Unit cost + daily cap on the key. Receipts at `GET /api/tools/keys/{keyId}/receipts`.
