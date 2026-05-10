/**
 * Browser-side cryptographic verification for Mana Receipts.
 *
 * Mirrors the canonicalisation rules used by the signing edge function
 * at ~/Desktop/ASSEMBL-CURRENT/12-mana-receipts/02-edge-function-sign-receipt.ts:
 * the bytes that were signed are the SHA-256 of the canonical JSON body
 * (sorted keys, no whitespace, runtime fields like `signature_b64`,
 * `receipt_hash`, `id`, `verifier_url` excluded).
 */

import type { ManaReceipt } from './types';

interface AssemblAgentKey {
  id: string;
  algorithm: 'ed25519';
  public_key_b64: string;
  status?: string;
  inactive?: boolean;
}

interface AssemblAgentKeyring {
  issuer: string;
  issuer_domain: string;
  keys: AssemblAgentKey[];
}

export interface VerifyResult {
  ok: boolean;
  hash_match: boolean;
  signature_valid: boolean;
  error?: string;
  recomputed_hash?: string;
  key_inactive?: boolean;
}

const RUNTIME_FIELDS = new Set(['signature_b64', 'receipt_hash', 'id', 'verifier_url']);

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return (
    '{' +
    keys
      .map((k) => JSON.stringify(k) + ':' + canonicalize(obj[k]))
      .join(',') +
    '}'
  );
}

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return (
    'sha256:' +
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function decodeBase64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function fetchKeyring(): Promise<AssemblAgentKeyring> {
  const res = await fetch('/.well-known/assembl-agent-keys.json', {
    cache: 'no-cache',
  });
  if (!res.ok) {
    throw new Error('could not load Assembl public keys');
  }
  return (await res.json()) as AssemblAgentKeyring;
}

export async function verifyReceipt(
  rawReceipt: ManaReceipt | Record<string, unknown>,
): Promise<VerifyResult> {
  // Allow {receipt: {...}} envelope from the API.
  const receipt =
    'receipt' in (rawReceipt as Record<string, unknown>) &&
    typeof (rawReceipt as { receipt?: unknown }).receipt === 'object'
      ? ((rawReceipt as { receipt: ManaReceipt }).receipt)
      : (rawReceipt as ManaReceipt);

  if (!receipt || typeof receipt !== 'object') {
    return { ok: false, hash_match: false, signature_valid: false, error: 'receipt missing' };
  }
  if (!receipt.signature_b64) {
    return { ok: false, hash_match: false, signature_valid: false, error: 'signature missing' };
  }
  if (!receipt.receipt_hash) {
    return { ok: false, hash_match: false, signature_valid: false, error: 'receipt_hash missing' };
  }
  if (!receipt.key_id) {
    return { ok: false, hash_match: false, signature_valid: false, error: 'key_id missing' };
  }

  const body: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(receipt)) {
    if (!RUNTIME_FIELDS.has(k)) body[k] = v;
  }
  const canonical = canonicalize(body);
  const recomputed = await sha256Hex(canonical);
  const hash_match = recomputed === receipt.receipt_hash;

  let keyring: AssemblAgentKeyring;
  try {
    keyring = await fetchKeyring();
  } catch (e) {
    return {
      ok: false,
      hash_match,
      signature_valid: false,
      error: e instanceof Error ? e.message : 'keyring fetch failed',
      recomputed_hash: recomputed,
    };
  }

  const key = keyring.keys.find((k) => k.id === receipt.key_id);
  if (!key) {
    return {
      ok: false,
      hash_match,
      signature_valid: false,
      error: `unknown key_id: ${receipt.key_id}`,
      recomputed_hash: recomputed,
    };
  }

  const isPlaceholder = /placeholder/i.test(key.public_key_b64);
  if (key.inactive || isPlaceholder) {
    return {
      ok: false,
      hash_match,
      signature_valid: false,
      key_inactive: true,
      error:
        'public key is published as inactive — production key has not been minted yet',
      recomputed_hash: recomputed,
    };
  }

  let publicKey: Uint8Array;
  let signature: Uint8Array;
  try {
    publicKey = decodeBase64(key.public_key_b64);
    signature = decodeBase64(receipt.signature_b64);
  } catch {
    return {
      ok: false,
      hash_match,
      signature_valid: false,
      error: 'could not decode signature or public key',
      recomputed_hash: recomputed,
    };
  }

  const message = new TextEncoder().encode(canonical);
  let signature_valid = false;
  try {
    const k = await crypto.subtle.importKey(
      'raw',
      publicKey as BufferSource,
      { name: 'Ed25519' },
      false,
      ['verify'],
    );
    signature_valid = await crypto.subtle.verify(
      'Ed25519',
      k,
      signature as BufferSource,
      message as BufferSource,
    );
  } catch (e) {
    return {
      ok: false,
      hash_match,
      signature_valid: false,
      error:
        'this browser does not support Ed25519 in Web Crypto — open this page in Chrome 113+, Edge 113+, or Safari 17+',
      recomputed_hash: recomputed,
    };
  }

  return {
    ok: hash_match && signature_valid,
    hash_match,
    signature_valid,
    recomputed_hash: recomputed,
  };
}
