/**
 * Public Ed25519 keyring for Mana Receipt verification.
 *
 * Reachable at the canonical `/.well-known/assembl-agent-keys.json` URL via
 * a rewrite configured in `next.config.ts`. The verifier page (and any
 * third party — BCAs, customs brokers, PI insurers) loads this file to
 * verify receipt signatures. Public keys are publishable; private keys
 * live only in Supabase edge function secrets.
 *
 * Source of truth for the keypair: ~/Desktop/ASSEMBL-CURRENT/12-mana-receipts/03-generate-keys.sh
 *
 * Until production keys are minted, the active key is published as
 * `inactive: true` so consumers know to expect verification failures
 * against scaffold receipts.
 *
 * Env override (production): set ASSEMBL_AGENT_KEYS_JSON in Vercel project
 * env to a JSON-encoded keyring and this route will return that verbatim.
 */

import { NextResponse } from 'next/server';

interface AssemblAgentKey {
  id: string;
  algorithm: 'ed25519';
  public_key_b64: string;
  status: 'active' | 'rotated' | 'revoked';
  inactive?: boolean;
  not_before?: string;
  not_after?: string;
}

interface AssemblAgentKeyring {
  issuer: string;
  issuer_domain: string;
  keys: AssemblAgentKey[];
  generated_at: string;
}

export const dynamic = 'force-static';

export function GET() {
  const override = process.env.ASSEMBL_AGENT_KEYS_JSON;
  if (override) {
    try {
      const parsed = JSON.parse(override) as AssemblAgentKeyring;
      return NextResponse.json(parsed, {
        headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' },
      });
    } catch {
      // Fall through to scaffold below if env value isn't valid JSON.
    }
  }

  const scaffold: AssemblAgentKeyring = {
    issuer: 'Assembl Limited',
    issuer_domain: 'assembl.co.nz',
    generated_at: '2026-05-09T00:00:00.000Z',
    keys: [
      {
        id: 'assembl-key-001',
        algorithm: 'ed25519',
        public_key_b64: 'PLACEHOLDER_PUBLIC_KEY_REPLACE_BEFORE_PRODUCTION',
        status: 'active',
        inactive: true,
        not_before: '2026-05-09T00:00:00.000Z',
      },
    ],
  };

  return NextResponse.json(scaffold, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
  });
}
