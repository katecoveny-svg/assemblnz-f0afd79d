# Port the original client Studio into an isolated Next.js review

The existing private Studio contains the editable brief, brand tools, idea board and interactive client experience that a simplified replacement would lose. This change ports its58-file dependency closure into a gated local review route and retains the original journey renderer and supporting panels.

The review uses explicit synthetic, memory-only adapters that fail closed for unconnected providers, uploads and sharing. Custom briefs no longer inherit unrelated boats/landscape imagery: a neutral visual-direction prompt and provenance-aware contextual visual policy replace that fallback. Rounded clipping and mobile owner controls are scoped to the review.

Validation: full TypeScript, scoped lint0/0 and9 targeted tests pass. Headless desktop/mobile proof confirms editable arbitrary-client fields, keyboard board movement, consent-gated editable journey output and375px without horizontal overflow. Production build awaits the coordinated font patch/build slot. Pointer/touch, reduced motion, production storage, deployed-source reconciliation and live recipient/media isolation remain required.

This is a review checkpoint, not production cutover. No original source/data altered, credentials copied, DB migration applied, paid provider invoked or recipient grant issued. Keep original Site available. Audit confidential presets before any public bundle ships.

A second, disabled-by-default stage implements a new empty owner workspace without waiting for legacy-data import. The owner can author/edit an idea and save/reopen through verified existing sign-in, an exact activation allowlist and an optimistic revision RPC. No service-role bypass. Separate SQL/storage proposals remain unapplied. Seven additional tests pass (16 total), and isolated no-network Postgres verifies actual owner/recipient/media RLS, revision conflicts, expiry and revocation. Named prospect presets and stale connection claims are sanitised in the port. Real-account acceptance and publication remain gated.
