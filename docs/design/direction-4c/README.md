# Direction 4c Clear — implementation review

User-authorized homepage implementation, based on remote main `7a8c40305062fa102a46ff0b47fbedf05dd8623c`. No merge or production deployment authorized.

## Provenance and scope

Source project: https://claude.ai/design/p/9f22d4d4-067f-48dd-b031-a9b21e7da40e?file=Direction+4c+Clear.dc.html

Supplied ZIP SHA256: `932a5f70217addac0dd7127910dc07f4de566f9197e43471dff8090f86c2d5d3` (handoff record). The original HTML and `support.js` are preserved here unchanged. The untouched source directory remains outside this checkout. Assets, optimized 24-second 720p coastal clip, Three.js and tide engine are under `public/direction-4c/`. Three's embedded MIT notice is retained. `THREE-LICENSE.txt` supplies the complete license from the installed Three distribution.

The static design template is adapted into server-rendered markup in `components/site/direction-4c/markup.ts`. It is trusted build-time content, not a user-input HTML sink. The React controller mounts/disposes the existing animation engine. `support.js` and its dynamic template interpreter are reference-only, never executed by the app. The sole engine adaptation resolves Next's actual Instrument Sans font family for canvas lettering.

This is an intentionally homepage-specific composition. It reuses the supplied engine and existing product routes; it introduces no auth, provider, private route, database or execution primitives. Existing homepage components stay in-tree for rollback. The front-door guard accepts the authorized new homepage without removing its checks on DO or the retained atelier.

## Deliberate differences requiring review

- Simulated DO execution, microphone/file handlers and fake receipts are replaced by a glass entry card linking to existing `/do?tool=write`, `/do?tool=talk`, and `/do` routes. The established DO menu/voice implementation is unchanged. The existing site-wide Ask DO launcher remains.
- Product links use `/pursuit`, `/creative-studio`, `/do`; contact/install links remain on the current origin. No private `/studio` link is introduced.
- Mobile primary navigation remains visible in a second row; the reference hides it below 900px. Hardcoded accent-word widths/heights are removed to avoid clipped phone text.
- Reduced motion uses a static plum composition and visible useful-work message; no video or WebGL engine is started. The supplied reference still runs a rendering loop and scrubs video when scrolling.
- Review-only theme/clip replacement controls are omitted.
- Original CSS is scoped to this homepage, keyframes are namespaced, Next font variables are used, and headings explicitly retain white against plum despite global site heading rules.
- The reference's word-by-word blur and randomized text decoding are omitted; the supplied engine's section reveal/parallax and birds remain.

## Copy review — do not treat as verified product claims

The original reference remains the record of requested wording. Pending product/legal review, these implementation strings are safer provisional copy:

| Original | Review concern | Implementation |
| --- | --- | --- |
| Every receipt is sealed. | No universal tamper-evident receipt guarantee established. | Keep a record of the work; evidence/receipt coverage varies by tool. |
| Indirect collection must be notified; Privacy Act IPP 3A | Absolute legal shorthand with no exceptions/context verified. | Make information use clear; explicit design principle, no legal claim. |
| Nothing sends without a named person / nothing leaves without your yes | Universal approval claim not established across every integration. | Review consequential actions; approval at the action boundary. |
| Every email, booking and post is a draft… | Unsupported universal behavior; the design demo cannot prove real actions. | Tool-specific permissions/review and availability caveat. |

The exact supplied hero wording (“agentic AI…”) and lilac/rose accents are preserved under the explicit design request, rather than silently rewritten to the general copy/brand preferences. This review does not promote the design into company-wide canon.

## Verification

See `VERIFICATION.md` for checks and captured evidence. Visual captures are snapshots of a time-varying engine, not a claim of deterministic pixel identity. No authenticated action or external work was submitted.

Rollback: restore the `AssemblTheWorkHome` import/render in `app/page.tsx`; retained product/auth implementation remains untouched.
