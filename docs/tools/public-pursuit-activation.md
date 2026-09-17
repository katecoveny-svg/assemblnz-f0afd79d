# Public Pursuit trial activation

## Status and authority
This branch builds the interface and server implementation. It does not establish that a live provider call, production quota migration, paid billing or registry submission succeeded.

During implementation the connected Supabase `execute_sql` action on ASSEMBL project `vjsmwtpubjyelwdeueup` returned `You do not have permission to perform this action`. No migration or trial activation is claimed from that failed read. Do not work around account permissions by extracting credentials.

## Operator prerequisites
1. Confirm the Vercel deployment is connected to the intended Supabase project. Apply `supabase/migrations/20260918010000_public_pursuit_trial.sql` through an authorised database session. New tables and functions are service-role-only and the policy defaults OFF.
2. Review the anonymous-trial budget, per-client and global daily caps. Do not remove durable reservation or replace it with instance-local state.
3. Configure an approved web-search-capable model and its server-side credential. Never place it in a NEXT_PUBLIC variable or browser code.
4. Arrange verified daily deletion of old `public_pursuit_runs` through the authorised scheduler. The reservation function also cleans expired runs, but cannot by itself guarantee timed deletion without traffic. Publish the actual retention policy.
5. Enable only for one capped smoke test first. Submit a public brief, verify at least one provider web search, returned source links, the published-knowledge IDs and a durable receipt. Confirm a repeated identical request ID does not incur another provider call, and that concurrent requests cannot exceed caps.
6. Verify quota/full/unavailable/error states. A failed request never returns an invented example. Review the draft and export all six HTML slides with source URLs. This export is not PPTX and does not update a private client hub.
7. Test TypeSafe separately before enabling its checkbox: correct model/endpoint, explicit consent and returned decision. Its decision does not perform publication or send a pitch.
8. Only after these checks, open the bounded trial. This is not a paid tool or an activation of billing.

## Discovery
Public MCP and REST search return only explicitly published Assembl records. Test initialize, tools/list and tools/call, then verify published metadata against the official MCP Registry. Do not claim a third-party listing merely because server.json or llms.txt exists.

## Billing
No customer charges, Stripe prices, subscriptions or x402 settlements are created by this implementation. A separate paid-tool activation requires licensed upstream access, an agreed price/currency, API keys/entitlements, idempotent usage ledger, a settlement outbox and refund/failure behaviour. Track billed successful outcomes, not just page visits.
