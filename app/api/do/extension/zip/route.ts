import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXTENSION_ROOT = path.join(process.cwd(), 'apps/do/extension');
const ZIP_NAME = 'DO-Chrome-Extension.zip';

async function addDir(zip: JSZip, dir: string, prefix = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await addDir(zip, abs, rel);
    } else {
      const buf = await fs.readFile(abs);
      zip.file(rel, buf);
    }
  }
}

/** Zip the Chrome MV3 extension for Load unpacked (not a Mac .dmg). */
export async function GET() {
  try {
    const zip = new JSZip();
    await addDir(zip, EXTENSION_ROOT);
    const body = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${ZIP_NAME}"`,
        'Cache-Control': 'no-store',
        'X-DO-Extension-Path': 'apps/do/extension',
        'X-DO-Install-Hint':
          'Chrome → Extensions → Developer mode → Load unpacked → select the unzipped folder',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'zip failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
