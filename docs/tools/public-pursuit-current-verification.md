# Public Pursuit verification / 18 September 2026

## Runtime authority and status

Production database: assembl-prod, `wurwcrgxjjwqdaxqceey`. Migrations for public quota, receipts and seven-day retention were applied using the authorised connector. The unrelated project permission failure reported during parallel work is not the status of this production database.

Anonymous roles cannot select research runs or execute the reservation RPC. Owner-hash/input-hash checks and duplicate reservations were tested inside a transaction that was rolled back. Daily cleanup `assembl-public-pursuit-retention` is active at 03:15 UTC. Records expire after seven days and are purged on daily cleanup or reservation; do not promise deletion at an exact second.

## First real canary failed

Workflow `35289042023`, artifact `10525048333`, used ONE independent public Bunnings New Zealand / PowerPass brief. It received HTTP 503, not a completed draft. Saved run `1b5fd00b-e0ad-4823-812f-604164bbc1d8` is failed. No success, customer adoption, pitch export or TypeSafe call is proven by this canary. Runtime logs and the saved trace contained only a generic error, so the cause is not established.

The policy was returned to disabled immediately after the failed test: enabled=false, typesafe_enabled=false, global_daily_limit=3, client_daily_limit=1. No paid pricing or customer charge was enabled.

This change adds allowlisted diagnostic codes only. Never log provider bodies, prompts, keys, IPs or complete errors. Existing failure behaviour, consent, caps and private data boundaries remain unchanged. A further canary needs deliberate bounded activation and must be reported separately.

## Reconciliation

PR #1367 has already shipped a overlapping canvas implementation. Preserve that version and its review gate. Do not merge the entire divergent #1366 over it. This follow-up carries only the verified DO copy/download parity fixes and safe diagnostics. No alternate custom PowerPoint code is included: the actual exported deck is six-slide editable HTML, printable to PDF.

## Visual boundary

The Scandi Blender asset and three stills were generated and saved, but their existence is not visual acceptance. The first workroom render is too sparse and washed out. Preserve the accepted main WorldScene until the replacement passes visual and browser review. Generated concept images are not a completed Blender walkthrough.
