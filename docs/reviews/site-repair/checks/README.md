# Re-running browser evidence

Use a stable production build, not a dev server being rebuilt by another process:

```sh
pnpm build
pnpm start --hostname 127.0.0.1 --port 3000
```

These checks use Playwright but do not add it to the production application. Install it in a separate temporary QA workspace if needed, then set `PLAYWRIGHT_MODULE` to that workspace's absolute `node_modules/playwright/index.mjs`. A normal installed Playwright resolves without the override.

```sh
export BASE_URL=http://127.0.0.1:3000
export PLAYWRIGHT_MODULE=/absolute/qa/node_modules/playwright/index.mjs
mkdir -p /tmp/assembl-site-qa/evidence
node docs/reviews/site-repair/checks/hero-regression.mjs
node docs/reviews/site-repair/checks/interaction-check.mjs
node docs/reviews/site-repair/checks/context-loss.mjs
node docs/reviews/site-repair/checks/resilience.mjs
node docs/reviews/site-repair/checks/pages-check.mjs
```

The checks use synthetic draft handoff only, not paid generation, account access or external sending. Context-loss is deliberately induced in the test browser. Screenshots/default JSON output go to `/tmp/assembl-site-qa/evidence`. Inspect screenshots separately: DOM/canvas existence is not visual proof. A nonzero exit must be resolved before claiming the relevant interaction passes.

`hero-regression` checks mobile/desktop/reduced motion, CTA contrast and entry accessibility. `interaction-check` checks the actual scene, chapters, pause, keyboard move, modal and no-execution handoff. `resilience` checks full static information without WebGL/JS and offscreen disposal/remount. `pages-check` covers Studio, About, Contact, Task DO Maker, Office and Browser Runtime at desktop and 375px.
