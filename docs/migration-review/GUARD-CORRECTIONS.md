# Correction review after PR1448

PR1448 merged at 663c8ad, before the two later correction commits were pushed. The older merged implementation does not include the corrected apex/www guards or truthful disabled controls. This correction branch starts from current main d786a1c1f1c38970e864683720ca2ec4bbb91535 and reapplies only that tested implementation, preserving all newer main changes.

Only exact `/review/client-hub` and `/studio/workspace` paths bypass the apex/www splash and then reach their existing development/auth/enablement guards. Canonical owner login/callback returns stay on the requested host. Sibling Studio/customer routes retain their original gating; homepage/DO handling stays unchanged. Owner activation remains off by default, independently allowlisted and database-authorized.

The retained drawers disable unavailable Radar/inbox search, agent rebuild, image generation/hosted upload and company-film upload/playback. Copy states those connections are unavailable. Manual briefs, reviewed illustrative assets and local storyboard editing remain available. HTTPS logos can cause direct browser requests; this is not an offline or no-egress workspace. Reviewed CSP/outbound-asset policy remains a hardening gate.

Validation: 75 focused hub/auth tests, including apex/www exact routing, canonical sign-in returns, denied/synthetic approved owner session, rendered disabled image/film controls; scoped lint, brand guard and macron check pass. All 58 original Site source hashes and five dirty-source hashes are unchanged. Four illustrative assets and frozen unapplied SQL are unchanged from main; SQL SHA256 ce71a6f5cda98eee3a62ea48792d9e3a4e641d114082defaa0128a60e7668320. See evidence/guard-corrections-current-main.json.

Prior correction a924 passed the full build, 18 local production Host-header checks and exact-head CI. Those results do not establish this current-main reapplication's production readiness. Fresh exact-head CI/build and independent review are required. The separately reported security-proposals typecheck boundary belongs to its existing build owner; this PR does not alter it or claim its repair.

No original Site, DO visual slice, SQL/schema/extension, owner enablement, private record import, recipient sharing, provider credentials or production release is changed. No merge is authorized by this draft. Reversal: revert the correction commit; off-by-default workspace authorization remains intact.
