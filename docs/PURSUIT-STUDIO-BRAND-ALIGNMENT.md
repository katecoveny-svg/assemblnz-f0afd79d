# Pursuit links and Assembl creative direction

22 September 2026. Review implementation; no production deployment from this task.

Kate reported that the hosted Pursuit address showed the old company homepage and asked for Pursuit and Assembl creative output to match the current main site.

## Findings and scope

- Browser inspection confirmed that `www.assembl.co.nz` has the current atelier homepage and approved platform wording. `assembl-pursuit.katecoveny.chatgpt.site` still serves the older ocean homepage.
- The global nav/footer, DO scene links, retired playground redirect and public agent metadata still contained links to that stale root.
- The existing `CreativeStudioShell` and `BrandImageMaker` were no longer mounted by a page. Their image direction included obsolete rose-gold tokens and their design/caption iframes pointed to absent public files.
- The existing private `/studios` and `/agency` workspaces belong to a separate Sites project. The connected Sites account returned no owned or editable projects; Library search did not resolve its Site identity. `/agency` led to ordinary ChatGPT sign-in. This change does **not** edit that host, its generation prompts, access rules or saved work.

## Changes

Public Pursuit links now use `/pursuit`; private hub links use the existing host's `/studios` path. The retired playground redirects to `/pursuit` before the splash gate. Creative Studio's private `/agency` link is preserved.

`/creative-studio/assembl`, linked from the Studio overview, restores the existing local post/image makers. It uses the current homepage and Studio reference images, Instrument Sans, IBM Plex Mono for metadata, and plum/rose/chalk/paper. Users can edit a message, choose a format, export PNG, upload a reference or prepare an image. An image can be carried into a post without an implicit upload. It replaces broken iframe tool entries with the two working maker components, rather than recreating private client workspaces.

`lib/creative/assembl-brand.ts` is shared by the interface, downloadable prompt and the image API. Explicit `assembl-2026-09` requests receive canonical art direction on the server. Other client briefs remain untouched. Provider rate limiting remains in place. No provider call is made on page load; Generate explicitly discloses sending the brief/reference. Generations remain drafts.

Canvas exports resolve the actual next/font family instead of silently falling back to Arial. The Assembl kit has a separate versioned storage key so an older local kit cannot silently replace the new defaults. Export dimensions remain in the controls, not baked into the artwork.

## Review and remaining proof

- Targeted route/API tests exercise the actual provider boundary with a mock: canonical Assembl context, unchanged client briefs, invalid profile/brief rejection and retained rate limiting.
- Middleware checks cover the public maker and retired Pursuit redirect on apex, www and preview hosts, alongside existing private client gating.
- Navigation/company tests were reconciled with already-accepted September 21 copy and DO entry rules. Their old assertions also failed on the baseline before this change.
- Local TypeScript, focused ESLint and brand/front-door/macron checks passed during implementation. See PR for final test/build results.
- Browser visual review at desktop and 375px and a real configured provider generation remain required. The cloud browser cannot open the local server. Do not treat mocked generation or a successful build as image quality proof.

To replace the separately hosted old homepage and update its private agency maker, open this task from the workspace that owns that existing Site. Reuse its source and identity; preserve client records and access. Do not create a replacement Site to bypass missing access.

Reversal: revert this PR. The private workspaces and saved client content are unaffected.
