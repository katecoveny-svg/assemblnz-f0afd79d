# DO purple companion and bills research

## Delivered in this source change

- A violet orb with a four-point sparkle, shared across homepage launcher, website embed, browser side panel and toolbar icons.
- Homepage and embed pointer dragging, with keyboard movement. The Chrome/Edge side panel can explicitly inject a floating control into the active webpage. No permanent content script or new host permission was added.
- Browser floating control opens DO, drags within the page and can be removed. It reads no page content. Selection capture remains a separate user action.
- `/do/bills`: New Zealand electricity, broadband and mobile research using Gemini's Google Search tool, plus a deterministic first-year cost calculator. The API accepts a strict set of numeric/category/region criteria; raw bills and account identifiers are not accepted. Research refuses answers without search queries and HTTPS source metadata. Source-backed does not mean every interpretation or price is independently verified; users must review provider terms and obtain any address-specific quote.
- The shared three-task trial applies to research. Failed or ungrounded responses refund their reservation. The calculator is local and free.
- A native macOS development companion under `apps/do/macos`, with a draggable floating orb, menu-bar control, hosted workspace, explicit Accessibility-gated selected-text capture, local review and safe supported-field insertion. No webpage-to-native action bridge exists. No Return/Send key is issued.

## Material limits

- The browser companion lives inside individual webpages. Browser settings pages and PDF viewers can restrict injection. Install/pin the extension, grant the active tab by clicking its toolbar button, then choose Show floating DO.
- The Mac companion is an ad-hoc signed Apple Silicon development build, not a Developer ID signed or notarised public release. It was compiled and signature-verified, not interactively tested. Do not bypass macOS security controls.
- Native app interaction currently means selected-text capture and reviewed insertion in compatible accessible fields. General autonomous clicking, visual screen understanding, multi-step computer control and screenshots are not implemented.
- Bill PDF/image reading, automatic bill discovery and ongoing price watches are not implemented. The bill reference text box stays local; people confirm the comparison figures themselves.
- Budget support currently covers household service costs and a first-year comparison, not a connected household budget ledger or regulated financial product advice.
- Browser and native interaction/visual testing remain unverified under the existing browser approval usage-limit block.

## References checked

- https://developer.chrome.com/docs/extensions/reference/api/sidePanel
- https://developer.chrome.com/docs/extensions/develop/concepts/activeTab
- https://ai.google.dev/gemini-api/docs/google-search

## Native build

`apps/do/macos/build.sh /private/tmp/assembl-do-native-build`

Use a local build directory. Some iCloud-synchronised folders add Finder metadata that prevents code signing. The build does not remove quarantine or disable any macOS control.
