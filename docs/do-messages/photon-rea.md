# Photon / Instinct investigation

Checked 12 October 2026 NZ. This reconstruction uses public behaviour and documented patterns, not private implementation or proprietary model extraction.

## Sources and provenance

- Photon: https://photon.codes/ and official https://github.com/photon-hq/imessage-kit, checked at commit `20a1536d7f56686b2973a27103949c5495955785`; package `@photon-ai/imessage-kit` 3.0.0, MIT.
- Instinct: https://instinct.com/ public product description. No original Instinct source repository was established; similarly named third-party projects are not evidence of its implementation.
- REA: https://github.com/morluto/rea, CLI `rea-agents@6.4.0`.

REA was installed and invoked with `analyze-javascript-application /tmp/assembl-photon-reference --format json`. It inventoried 73 files, then returned `capability_unavailable`, category `unsupported_provider`, provider `process-ownership`, operation `prepare_owned_process`. Its required procps command failed with `fatal library error, lookup self`. No complete REA analysis is claimed. Its ownership protection was not bypassed. The README and source were inspected directly as the fallback.

## What the source establishes

Photon's iMessage Kit runs on macOS. Reading the Messages database needs Full Disk Access. Sending uses AppleScript and the Messages application. Observing delivery is a separate step from accepting a send request. These requirements cannot be eliminated by adding a website form. The broader Photon framework supports transports with their own setup and credentials.

Instinct's public presentation suggests contextual, conversation-led assistance. That supports a product direction; it does not establish a connector-free route into a person's messages, phone or accounts.

## Relevant patterns implemented

| Pattern | Assembl implementation | Boundary |
|---|---|---|
| Conversation continuity | Separate named threads; explicit local save and private backups | No automatic inbox reading; browser storage is not encrypted |
| Turn a request into useful next steps | Literal candidate lines; editable owners, dates and completion | No inferred commitment or claim an action was executed |
| Review outgoing work | Exact reply preview; edits invalidate approval | Source/private notes excluded; selected tasks only |
| Handoff with truthful status | Native share sheet, copy/download and ICS export | The user chooses the sending/calendar app; no delivery or booking assertion |
| Voice as another output | Owned temporary speech jobs and original voice designs | Not a telephone transport or an iMessage agent |

Photon's macOS SDK is not installed as a Linux website runtime dependency. The reusable design tools are pinned separately. Unrelated presentation, satellite, company-orchestration and generic voice-cloning repositories were not added to Assembl's dependency graph. Existing Remotion, GSAP, Framer Motion and Canvas foundations remain available for future approved demo/animation work.

Live calls need a real carrier/SIP/telephony route and an operational host. User-facing setup can be handled by Assembl, but underlying network transport and hosting requirements still exist. No connector-free calling claim is made by this branch.
