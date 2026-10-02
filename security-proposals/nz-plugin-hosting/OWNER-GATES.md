# Freight-only owner release gates — inactive

Use `docs/services/nz-freight-owner-permission.md` as the single concrete owner permission bundle: separate freight-only Vercel project, exact host/region, quota/cleanup permissions and recommended soft US$20/30-day operating target with separately acknowledged unbounded overshoot risk with freight-only shutdown atUS$15. These are proposals, not approvals. Root reviews implementation choices and exact source artifact first. Kate is asked to approve the resulting infrastructure and cost decision, not select algorithms.

- Approve the exact freight hostname, TLS/protection and public challenge/privacy/terms/support paths. No architecture activation.
- Approve quota-only persistent access: private counters, UUID/fenced leases, 48-hour cleanup target, requiring independently scheduled bounded cleanup and overdue monitoring before a deletion guarantee; no content/customer identity. SQL remains unapplied until separately authorised and concurrency/privilege/deadline tested.
- Approve actual hosting isolation and US-region processing. The selected recommendation is a separate freight-only project on the existing platform, requiring approval and project environment/OIDC trust/resource proof; no shared-parent deployment is selected and no project is created.
- Supply and approve an incremental spending ceiling, alerts and plugin-only shutdown. No amount or price is invented. Anonymous denial traffic can still incur platform cost. Vercel team-wide auto-pause affects all production projects and is delayed; no team-wide pause is authorised.
- Approve truthful privacy/support/source-rights disclosures after actual log/retention/platform proof. Publisher personal account identifiers stay internal.

Technical gates: host-wide deny before ordinary app/static/auth handling; deployed release AND quota control both default off; full-function/child memory and termination proof; least-privilege quota credential; rejected RPC/log resource proof; actual HTTPS MCP/edge/outage/stale/rollback tests. No publication, client registration, credentials, grants or production settings in this artifact.

Independent bounded cleanup and health receipts now have disposable SQL proof; the actual Cron scheduler/monitor is not installed. Real pg8.23.1 driver timeout/abort proof uses a fixture-only loopback protocol bridge; hosted TLS/credential/network partition and whole-function termination proof remain required.
