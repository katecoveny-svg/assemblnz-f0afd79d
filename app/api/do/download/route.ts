import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import { DO_DISTRIBUTION_ORIGIN, doEmbedExample, doWidgetScript } from '@/apps/do/shared/distribution';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VERSION = '1.5.0';
const EXTENSION_ROOT = path.join(process.cwd(), 'apps/do/extension');
const MACOS_ROOT = path.join(process.cwd(), 'apps/do/macos');

const EXTENSION_FILES = [
  'manifest.json',
  'background.js',
  'sidepanel.html',
  'sidepanel.js',
  'sidepanel.css',
  'floating.js',
  'selection-badge.js',
  'popup.html',
  'popup.js',
  'popup.css',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'icons/do-spark.svg',
] as const;

async function addDir(zip: JSZip, dir: string, prefix: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await addDir(zip, full, name);
    else zip.file(name, await readFile(full));
  }
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('format');
  const format =
    raw === 'mac' || raw === 'macos' || raw === 'mac-companion'
      ? 'mac'
      : raw;
  if (format !== 'extension' && format !== 'embed' && format !== 'mac') {
    return Response.json(
      { error: 'Choose format=extension, format=mac or format=embed.' },
      { status: 400 },
    );
  }
  const zip = new JSZip();
  const origin = DO_DISTRIBUTION_ORIGIN;
  try {
    if (format === 'extension') {
      for (const name of EXTENSION_FILES) {
        zip.file(name, await readFile(path.join(EXTENSION_ROOT, name)));
      }
      zip.file(
        'README.md',
        `# DO browser extension · v${VERSION}

1. Unzip this folder.
2. Open Chrome → \`chrome://extensions\` (or Edge Extensions).
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select this unzipped folder.
5. Pin **DO by assembl** on the toolbar. Select page text to light the badge.
6. Click the toolbar icon to open the side panel.

If the extension shows **Inactive**, open Errors — usually a JavaScript syntax issue. Every packaged \`.js\` file starts with \`'use strict';\` (quoted). Reload after fixing.

## Meeting DO + sign-in

Use **Sign in** / **Meeting DO** in the side panel. Those open a normal assembl browser tab so OAuth can finish. After sign-in, return to the side panel and click **Refresh builder** if needed.

## Household Floor browser seat

Open ${origin}/do/household, install the public template, copy the DO id + \`do-browser-seat:<uuid>\` session key into **Advanced · browser seat**, open a school/council/AT tab, tick consent, then **Capture page for this DO**.

Dragging the floating D-mark does **not** share your screen. Selected text is only captured when you choose Use selection / Help with this page.

Requires Chrome 116+ or compatible Edge. Direct install — not a Chrome Web Store listing.

Source: assembl monorepo \`apps/do/extension\`.
`,
      );
    } else if (format === 'mac') {
      await addDir(zip, MACOS_ROOT, 'macos');
      zip.file(
        'README.md',
        `# DO for Mac · development source · v${VERSION}

There is **no notarised public Mac installer** in this package yet.

This zip contains the Swift companion source from \`apps/do/macos\`.

## Build on a Mac (Xcode Command Line Tools)

\`\`\`bash
unzip DO-mac-companion.zip
cd macos
./build.sh ~/Desktop/do-mac-build
open ~/Desktop/do-mac-build/DO.app
\`\`\`

Optional disk image (still ad-hoc signed, not notarised):

\`\`\`bash
bash package.sh ~/Desktop/do-mac-build
\`\`\`

## Honesty

- Development / ad-hoc signed only — Gatekeeper may warn.
- Accessibility for selected text is opt-in via a labelled control.
- Dragging the floating D does not capture or share your screen.
- A public Download Mac DO.app requires Developer ID signing + notarisation (not claimed here).

Install guide: ${origin}/do/install
`,
      );
    } else {
      zip.file('do-widget.js', doWidgetScript(origin));
      zip.file('example.html', doEmbedExample(origin));
      zip.file(
        'README.md',
        `# DO website widget · v${VERSION}

Add before \`</body>\`:

\`<script src="${origin}/api/do/widget" defer></script>\`

Or serve \`do-widget.js\` from your site. Opens the hosted DO workspace in an iframe.

The launcher never reads your page or starts a task by itself.
See ${origin}/do and ${origin}/do/install.
`,
      );
    }
    const filename =
      format === 'extension'
        ? `assembl-do-extension-${VERSION}.zip`
        : format === 'mac'
          ? 'DO-mac-companion.zip'
          : `assembl-do-embed-${VERSION}.zip`;
    const content = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    return new Response(content as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return Response.json(
      {
        error: 'download_unavailable',
        message: 'The download could not be prepared. Please try again.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
