# Freight-only owner release gates — inactive

Use `docs/services/nz-freight-owner-permission.md` as the single concrete owner permission bundle: separate freight-only Vercel project, exact host/region, quota/cleanup permissions and recommended US$20/30-day budget with freight-only shutdown atUS$15. These are proposals, not approvals. Root reviews implementation choices and exact source artifact first. Kate is asked to approve the resulting infrastructure and cost decision, not select algorithms.

- Approve the exact freight hostname, TLS/protection and public challenge/privacy/terms/support paths. No architecture activation.
- Approve quota-only persistent access: private counters, UUID/fenced leases, 48-hour cleanup target, requiring independently scheduled bounded cleanup and overdue monitoring before a deletion guarantee; no content/customer identity. SQL remains unapplied until separately authorised and concurrency/privilege/deadline tested.
- Approve actual hosting isolation and US-region processing. Shared-project parent credentials and resource headroom are unproved; a separate project on the existing platform is an alternative requiring approval, not a created resource.
- Supply and approve an incremental spending ceiling, alerts and plugin-only shutdown. No amount or price is invented. Anonymous denial traffic can still incur platform cost. Vercel team-wide auto-pause affects all production projects and is delayed; no team-wide pause is authorised.
- Approve truthful privacy/support/source-rights disclosures after actual log/retention/platform proof. Publisher personal account identifiers stay internal.

Technical gates: host-wide deny before ordinary app/static/auth handling; deployed release AND quota control both default off; full-function/child memory and termination proof; least-privilege quota credential; rejected RPC/log resource proof; actual HTTPS MCP/edge/outage/stale/rollback tests. No publication, client registration, credentials, grants or production settings in this artifact.

Independent bounded cleanup and health receipts now have disposable SQL proof; the actual Cron scheduler/monitor is not installed. Real pg8.23.1 driver timeout/abort proof uses a fixture-only loopback protocol bridge; hosted TLS/credential/network partition and whole-function termination proof remain required.
