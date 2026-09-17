import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import { DO_DISTRIBUTION_ORIGIN, doEmbedExample, doWidgetScript } from '@/apps/do/shared/distribution';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const VERSION = '1.6.0';
const EXTENSION_ROOT = path.join(process.cwd(), 'apps/do/extension');
const MACOS_ROOT = path.join(process.cwd(), 'apps/do/macos');
/** Keep in sync with scripts/package-do-downloads.mjs. */
export const EXTENSION_FILES = [
  'manifest.json',
  'background.js',
  'sidepanel.html',
  'sidepanel.js',
  'sidepanel.css',
  'portable.html',
  'portable-worker.js',
  'portable-core.js',
  'portable-background.js',
  'portable-launcher.js',
  'portable.css',
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
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await addDir(zip, full, name);
    else zip.file(name, await readFile(full));
  }
}
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('format');
  const format = ['mac', 'macos', 'mac-companion'].includes(raw || '') ? 'mac' : raw;
  if (!['extension', 'embed', 'mac'].includes(format || '')) {
    return Response.json({ error: 'Choose format=extension, format=mac or format=embed.' }, { status: 400 });
  }
  const zip = new JSZip();
  const origin = DO_DISTRIBUTION_ORIGIN;
  try {
    if (format === 'extension') {
      for (const name of EXTENSION_FILES) zip.file(name, await readFile(path.join(EXTENSION_ROOT, name)));
      zip.file('README.md', `# DO browser extension · v${VERSION}

Unzip → Chrome/Edge Extensions → Developer mode → Load unpacked → select this folder. Pin DO on the toolbar, then click it to grant active-page access.

Use the new launch panel for a movable first-party browser window with the normal Assembl sign-in. Choose Workspace, Meeting notes, or TypeSafe. **Bring selected text** copies only an explicit selection into the editor for review; it does not start a task. No account token is stored by this handoff.

Use **Show floating DO on this tab** for the in-page launcher. Dragging shares nothing. A browser pop-out is not an always-on-top native overlay. Microphone, provider and recording permissions remain separate.

Meeting notes open the existing recording-first Meeting DO. Local capture/download does not need a transcription key; transcription and voice require sign-in and configured server services. TypeSafe has its own owner allowlist and key. An opened window is not proof that those services connected.

Advanced browser-seat and authenticated job previews remain previews, not a completed cross-device records bridge. This package does not send, submit, book or pay.

Chrome 116+ or compatible Edge. Direct developer install, not a Chrome Web Store listing. Reload the extension after updates. Guide: ${origin}/do/install
`);
    } else if (format === 'mac') {
      await addDir(zip, MACOS_ROOT, 'macos');
      // Source ZIP builds must not depend on an absent full-repository asset path.
      for (const size of [192, 512]) {
        zip.file(`macos/resources/do-${size}.png`, await readFile(path.join(MACOS_ROOT, `resources/do-${size}.png`)));
      }
      zip.file('README.md', `# DO for Mac · development source · v${VERSION}

This is source, not a notarised public Mac installer. It includes the Swift source AND canonical icon resources needed to build independently of a repository checkout.

On a Mac with Xcode Command Line Tools:

\`\`\`bash
unzip DO-mac-companion.zip
cd macos
bash build.sh ~/Desktop/do-mac-build
open ~/Desktop/do-mac-build/DO.app
\`\`\`

The floating DO is draggable and remembers its position. Selected-text capture and reviewed paste require explicit Accessibility permission and clicks. The microphone permission handler prompts only for the primary Assembl workspace/meeting page; it does not silently grant capture or enable the camera.

Voice/recording still require successful device permission and provider tests. Use the normal browser workspace if embedded authentication or media support is unavailable. This source build is ad-hoc signed; Gatekeeper may warn. Do not disable Gatekeeper. Public distribution still needs Developer ID signing and notarisation.

Optional development disk image: \`bash package.sh ~/Desktop/do-mac-build\`.
Guide: ${origin}/do/install#mac
`);
    } else {
      zip.file('do-widget.js', doWidgetScript(origin));
      zip.file('example.html', doEmbedExample(origin));
      zip.file('README.md', `# DO website widget · v${VERSION}

Add before </body>: <script src="${origin}/api/do/widget" defer></script>

The launcher and panel can be moved. The widget never reads its host page or starts a task by itself. Voice and meeting capture open a first-party workspace, with separate sign-in and microphone permission. An explicitly supplied context is a draft input, not permission to execute.

Guide: ${origin}/do/install
`);
    }
    const filename = format === 'extension' ? `assembl-do-extension-${VERSION}.zip` : format === 'mac' ? 'DO-mac-companion.zip' : `assembl-do-embed-${VERSION}.zip`;
    const content = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
    return new Response(content as BodyInit, { headers: {
      'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    return Response.json({ error: 'download_unavailable', message: 'The download could not be prepared. Please try again.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
