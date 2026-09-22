# Pursuit links and Assembl creative direction

22 September 2026. The owner merged PR #1412 during verification. Provider corrections and the broader signal story continue in PR #1413; no production merge by this task.

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
- Browser review at 375px and 1440px passed, including four exported PNG dimensions. A real configured Gemini image generation also succeeded. The cloud browser cannot open the local server. Do not treat mocked generation or a successful build as image quality proof.

To replace the separately hosted old homepage and update its private agency maker, open this task from the workspace that owns that existing Site. Reuse its source and identity; preserve client records and access. Do not create a replacement Site to bypass missing access.

Reversal: revert this PR. The private workspaces and saved client content are unaffected.

## Follow-up: public demo, copy and reliability

Kate also asked for a copy-skill pass, a clearer public example and working public research links. Write Like Me was used with the repo copy standard; available writing samples were limited, so the canonical positioning and Kate’s direct instructions led the edit.

- Pursuit now uses a paper/plum layout and the actual homepage atelier image. The old low-contrast gradient heading and generic animated tiles are replaced by a selectable policy-to-business research path, following Kate’s correction that the example must show Assembl’s breadth. No sample claims are presented as live research.
- The public website preset now fills only Assembl’s website. It no longer inserts the internal Flex energy-retailer sales brief. The separate Flex simulator is unchanged.
- Both public research forms show the current network/site allowance and UTC reset, and refresh after either submits. Atomic database reservation remains the authority. A limit response includes `Retry-After`; failed provider attempts still count because they may incur cost.
- Read-only inspection of `assembl-prod` found a live policy of 1 attempt/network and 5/site daily, with a timeout recorded on 22 September. Under Kate’s request to increase the allowance, a conditional update changed that existing enabled policy to 3/network and 20/site. A subsequent SELECT verified it. No schema, activation, TypeSafe or billing change was made. To reverse this configuration change, restore those two values to 1 and 5; reverting code alone does not reverse it.
- Research provider calls now allow 75 seconds per request within a shared 100-second research deadline; the route allows 120 seconds and the browser 115. The former 35-second call deadline was too short for a multi-search brief. Search count and token limits remain bounded.
- The native Google image connection replaces retired Imagen with `gemini-3.1-flash-image`. Reference bytes are passed as `inlineData`, and intermediate thought images are excluded. Uploaded photographs default to reference off; selecting an included homepage asset turns it on. The disclosure sits beside Generate. A provider that cannot use reference pixels cannot silently substitute a text-only result.
- Studio controls use paper surfaces, legible plum type and rounded previews. Existing canvas exports, local editing and image-to-post handoff remain the working primitives.

Verification before the follow-up push: 70 focused tests across 13 files, TypeScript, changed-file ESLint, brand/front-door guards, Python syntax and diff checks passed. CI checks real PNG dimensions at 375px and 1440px using a mocked provider response; that test is explicitly not evidence of a real generation. The first browser build hit an unrelated Spline package export failure under webpack. The workflow was restored to the normal production build after the concurrent Immersive review successfully built this same source with Turbopack.

Provider migration reference: https://ai.google.dev/gemini-api/docs/generate-content/image-generation (checked 22 September 2026).


Live follow-up verification found that the longer research request reached a response (about 42 seconds) but its outreach shape was rejected. The existing formatter only repaired the pitch, not the campaign. A single constrained formatting pass now repairs the complete response, with no extra search, the original length checks and rejection of newly inserted source URLs. Two regression tests exercise this boundary.

The first native image call returned HTTP 400 with the guide’s v1 `responseFormat` payload. The request now follows the installed Google SDK 2.22.0 serialization and API reference: v1beta `generateContent` with `imageConfig`. Structured logs expose rejected field names only, never reference bytes, briefs or provider error prose. The real-provider recheck succeeded: Gemini returned an architectural image using the included homepage reference. Image-to-post handoff and four PNG dimensions also passed the separate browser build test.


Kate’s latest correction replaces the small-business opening with Parliament, NZBN, legislation, Beehive, Waka Kotahi and GeoNet. The hero links to official source pages and distinguishes an illustrative research path from the public web-search trial. It reads actual document/change totals from the existing homepage endpoint; no simulated ticker or invented counts. Keyed connections are not labelled active without evidence. The primary CTA now opens general company/sector research before the optional website outreach form.

The second outreach live check timed out after approximately 84 seconds. The formatter had a separate 28-second cap; its cap is now 45 seconds within the unchanged 100-second overall deadline. Provider documentation confirms that initial schema compilation adds latency. The prompt requests shorter drafts and stage logs record only timing, counts and validation paths, never researched content. Final live research verification remains pending.


Configured company research succeeded on the preview in 11 seconds with a saved NZ Post draft and three source links. The website shortlist reached a valid-shaped answer in 39 seconds but failed source validation. Business identity links now use an actual search-returned page on the same domain when the homepage itself was not returned. Untraced optional contact URLs are omitted; published signal links must still match an exact search-returned source. The formatter is checked for new URLs before this deterministic identity-link resolution. Regression tests retain rejection of missing signal evidence, unrelated seller domains and formatter-inserted sources. Lower-page product cards also receive legible plum copy and proper padding after a visual check found inherited pale text on paper surfaces.
