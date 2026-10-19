# Homepage CI repair — 19 October 2026

The public homepage already uses Direction4cHome. Browser jobs still expected the retired scene headline, chapter controls and inner header, causing a null-parent failure before meaningful checks ran. This repair changes test expectations, not the approved homepage.

The boundary matrix retains all seven viewport sizes in both motion modes, overflow and touch-target checks, and real assistant open/close/focus assertions. It now verifies the coastal poster/video, ready renderer, keyboard pause, reduced-motion state and actual DO entry links. The shared Python proof replaces obsolete homepage assertions in immersive and Pursuit reviews; Pursuit's walkthrough, historical evidence, no-research-submit checks, Studio gallery and no-JavaScript checks remain. Command navigation still verifies destination content/canonical URLs, keyboard focus, filtering, dismissal races and redirects; its homepage signature and motion controls now match the coastal page. Workflow path filters include the current implementation and shared proof helper.

Both `/preview/the-work` and `/living/shop` exclusions are retained in the public assistant router. Explicit positive and negative boundary cases prevent accidental suppression of `/living`, Space Studio, `/living-site` and lookalike paths. Main's #1620 context record and the homepage preview record coexist.

Local proof: 14 homepage boundary cases, immersive review (four routes at desktop/375px plus reduced/no-JavaScript), Pursuit walkthrough across desktop/375px and both motion modes, and command navigation at desktop/375px passed. Focused PR1614 checks: 43 tests. Browser proof blocks external mutations and does not establish production deployment.
