import { readFile } from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import { DO_DISTRIBUTION_ORIGIN, doEmbedExample, doWidgetScript } from '@/apps/do/shared/distribution';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get('format');
  if (format !== 'extension' && format !== 'embed') return Response.json({ error: 'Choose format=extension or format=embed.' }, { status: 400 });
  const zip = new JSZip();
  const origin = DO_DISTRIBUTION_ORIGIN;
  try {
    if (format === 'extension') {
      // Fixed paths allow Next's file tracer to include only the public package files.
      const [manifest, html, js, css, icon16, icon48, icon128] = await Promise.all([
        readFile(path.join(process.cwd(), 'apps/do/extension/manifest.json')),
        readFile(path.join(process.cwd(), 'apps/do/extension/popup.html')),
        readFile(path.join(process.cwd(), 'apps/do/extension/popup.js')),
        readFile(path.join(process.cwd(), 'apps/do/extension/popup.css')),
        readFile(path.join(process.cwd(), 'apps/do/extension/icons/icon16.png')),
        readFile(path.join(process.cwd(), 'apps/do/extension/icons/icon48.png')),
        readFile(path.join(process.cwd(), 'apps/do/extension/icons/icon128.png')),
      ]);
      for (const [name, data] of [['manifest.json', manifest], ['popup.html', html], ['popup.js', js], ['popup.css', css], ['icons/icon16.png', icon16], ['icons/icon48.png', icon48], ['icons/icon128.png', icon128]] as const) zip.file(name, data);
      for (const name of ['background.js', 'sidepanel.html', 'sidepanel.js', 'sidepanel.css']) {
        zip.file(name, await readFile(path.join(process.cwd(), 'apps/do/extension', name)));
      }
      zip.file('README.md', `# DO browser extension\n\n1. Unzip this folder.\n2. Open Chrome or Edge Extensions and enable Developer mode.\n3. Choose Load unpacked and select this folder.\n4. Pin DO and click its toolbar icon to open the persistent visual builder beside your page. Select page text and choose Use selected page text, or paste directly. On a new tab, click the DO toolbar icon to grant selection access again. Review inputs before running any task. Requires Chrome 116 or newer, or a compatible Edge version.\n\n## Permissions\n\nActive tab and scripting are used only when you press a capture button. The background worker only configures the side panel; it never captures pages. There is no browsing-history collection, automatic field reading or automatic task execution. The only network host is ${origin}. Provider keys stay on assembl's server. The side panel stays beside your browser work. Unsaved inputs last while the panel remains loaded. Save recipes or download outputs before closing it; browser settings may restrict storage in embedded pages.\n\n## Product boundary\n\nThe extension prepares, extracts and records your review. It does not send, buy, book, submit, change accounts or monitor in the background. Three free tasks across writing and images, shared per network; enquire at assembl@assembl.co.nz for continued access. The side panel contains the visual builder for agent recipes and image generation. This is a direct install, not a Chrome Web Store listing.\n\nSource included in this package. Version 1.2.0.\n`);
    } else {
      zip.file('do-widget.js', doWidgetScript(origin));
      zip.file('example.html', doEmbedExample(origin));
      zip.file('README.md', `# DO website widget\n\nAdd this before the closing body tag:\n\n\`<script src="${origin}/api/do/widget" defer></script>\`\n\nOr serve the included do-widget.js from your own site. It opens the hosted DO workspace in an iframe.\n\nVisitors paste and review their own text before preparation. The launcher never reads your page, captures form inputs or starts a task. The host website cannot read the iframe's draft through this API.\n\nOptionally connect an explicit user-clicked button to window.assemblDo.open({text, title, url}). This offers text for review inside the widget; it never submits it automatically. Do not pass private information without permission.\n\nIf your site has a Content Security Policy, allow script-src ${origin} and frame-src ${origin}. The included launcher uses inline styles inside a shadow root; your style policy must allow these or you can adapt the source to your own approved stylesheet.\n\nThe hosted runtime stays with assembl. No model key is included. The visual builder assembles text tasks and image generation with a shared three-task trial; it does not execute actions or monitor later. See ${origin}/do for the current service.\n\nVersion 1.2.0.\n`);
    }
    const content = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    return new Response(content as BodyInit, { headers: {
      'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="assembl-do-${format}-1.2.0.zip"`,
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    return Response.json({ error: 'download_unavailable', message: 'The download could not be prepared. Please try again.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
