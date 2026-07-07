# SPARK static tool scaffold

Public SPARK tools live at `public/hapai/[tool-name]/` and use three files:

- `index.html` for the landing page
- `[tool-name].html` for the assembl edition
- `[tool-name]-generic.html` for the white-label edition

Import the shared shell before any tool-specific styles or scripts:

```html
<link rel="stylesheet" href="/hapai/_scaffold/shell.css">
...
<script src="/hapai/_scaffold/shell.js"></script>
```

The shell provides:

- shared palette, type, focus, touch-target, safe-area, brand-config, and founder-canon styles
- `HapaiShell.initBrandConfig()` using `assembl-tools-brand-config`
- `HapaiShell.initApiKeyInput()`
- `HapaiShell.copyToClipboard()`
- `HapaiShell.callAnthropicHaiku()`

For new tools, keep only tool-specific CSS and JS inline. Use the cached portrait asset for founder notes:

`/img/about/kate-hudson-portrait-blue-shirt.webp`

Canon checks:

- lowercase `assembl`
- no standalone banned term in customer copy
- 44px touch targets
- 16px form text
- single column below 600px
- visitor content and keys stay in the browser
