/**
 * Seeds Kate + Adrian's private Italy 2026 trip into voyage_shared_trips.
 *
 * Reads marketing/voyage-italy/kate-adrian-seed-2026.json as the source of
 * truth. Generates a fresh, cryptographically random 32-char base64url
 * share_slug. Upserts on the row's external id (stored inside `payload`)
 * so re-running the script is idempotent (won't duplicate).
 *
 * USAGE
 *
 *   pnpm tsx scripts/seed-kate-italy-2026.ts
 *
 * REQUIRED ENV
 *
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * OUTPUT
 *
 *   1. Prints the share URL to stdout.
 *   2. Writes the URL to kate-italy-share-url.local.txt (gitignored).
 *
 * IDEMPOTENCY
 *
 *   The first run creates a row and remembers the generated share_slug.
 *   Subsequent runs UPDATE the existing row (matched by externalId inside
 *   payload->>'externalId') and KEEP the original slug. Pass --rotate-slug
 *   to issue a new slug (the old one will stop working).
 *
 * PRIVACY
 *
 *   The row has no RLS policies — only the service role can read it.
 *   The slug is the only auth. Treat the URL like a password.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

type SeedJson = {
  externalId: string;
  title: string;
  travellers: Array<{ id: string; name: string }>;
  [k: string]: unknown;
};

const ROOT = process.cwd();
const SEED_PATH = resolve(
  ROOT,
  'marketing/voyage-italy/kate-adrian-seed-2026.json',
);
const URL_OUTPUT = resolve(ROOT, 'kate-italy-share-url.local.txt');

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://www.assembl.co.nz';

function generateShareSlug(): string {
  // 24 bytes → 32 base64url chars → ~192 bits entropy. Unguessable.
  return randomBytes(24).toString('base64url');
}

function readSeed(): SeedJson {
  const raw = readFileSync(SEED_PATH, 'utf8');
  const parsed = JSON.parse(raw) as SeedJson;
  if (
    !parsed.externalId ||
    !parsed.title ||
    !Array.isArray(parsed.travellers)
  ) {
    throw new Error(
      'Seed JSON missing required fields (externalId, title, travellers)',
    );
  }
  return parsed;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      '✗ Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.',
    );
    process.exit(1);
  }

  const seed = readSeed();
  const rotateSlug = process.argv.includes('--rotate-slug');

  const client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Look for an existing row keyed by externalId inside payload.
  // We don't have a top-level external_id column — keep migrations zero-touch
  // and match via the JSONB ->> operator.
  const { data: existing, error: lookupErr } = await client
    .from('voyage_shared_trips')
    .select('share_slug,payload')
    .filter('payload->>externalId', 'eq', seed.externalId)
    .maybeSingle();

  if (lookupErr) {
    console.error('✗ Lookup failed:', lookupErr.message);
    process.exit(1);
  }

  let shareSlug: string;

  if (existing) {
    shareSlug = rotateSlug ? generateShareSlug() : existing.share_slug;
    const { error: updateErr } = await client
      .from('voyage_shared_trips')
      .update({
        share_slug: shareSlug,
        title: seed.title,
        travellers: seed.travellers.map((t) => t.name),
        payload: seed,
        updated_by: 'seed-script',
      })
      .filter('payload->>externalId', 'eq', seed.externalId);

    if (updateErr) {
      console.error('✗ Update failed:', updateErr.message);
      process.exit(1);
    }
    console.log(
      rotateSlug
        ? '↻ Rotated slug on existing row.'
        : '↺ Refreshed existing row (slug preserved).',
    );
  } else {
    shareSlug = generateShareSlug();
    const { error: insertErr } = await client
      .from('voyage_shared_trips')
      .insert({
        share_slug: shareSlug,
        title: seed.title,
        travellers: seed.travellers.map((t) => t.name),
        payload: seed,
        updated_by: 'seed-script',
      });

    if (insertErr) {
      console.error('✗ Insert failed:', insertErr.message);
      process.exit(1);
    }
    console.log('✓ Created new private trip row.');
  }

  const shareUrl = `${SITE_ORIGIN}/hapai/voyage-italy/v/${shareSlug}`;
  writeFileSync(URL_OUTPUT, `${shareUrl}\n`, 'utf8');

  console.log('');
  console.log('  Share URL (private — treat like a password):');
  console.log('    ' + shareUrl);
  console.log('');
  console.log('  Also written to: kate-italy-share-url.local.txt (gitignored)');
}

main().catch((err) => {
  console.error('✗ Unhandled error:', err);
  process.exit(1);
});
