/**
 * Canonical hashing + Mana Receipt chain math (Node side).
 *
 * The canonicalisation rules MUST match lib/evidence/verify.ts so a voice
 * receipt hashes identically wherever it is recomputed: sorted keys, no
 * whitespace, stable scalar serialisation. We reuse `canonicalize` from the
 * evidence module verbatim and add the chain helpers the brief specifies:
 *
 *   sha256       = sha256(canonical(payload))
 *   chain_hash   = sha256(prev_hash || sha256)
 *
 * `prev_hash` for receipt #1 is the seed (64 zeros, MANA_RECEIPT_PREV_HASH).
 * Hashes are bare lowercase hex (no "sha256:" prefix) to match the
 * mana_receipt table columns.
 */
import { createHash } from 'node:crypto';
import { canonicalize } from '@/lib/evidence/verify';

/** 64 zeros — the genesis prev_hash for the first receipt in the chain. */
export const GENESIS_PREV_HASH = '0'.repeat(64);

/** Bare lowercase hex sha256 of a string. */
export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** Hash a payload object via the shared canonical JSON form. */
export function hashPayload(payload: unknown): string {
  return sha256Hex(canonicalize(payload));
}

/** chain_hash = sha256(prev_hash || payload_hash). */
export function chainHash(prevHash: string, payloadHash: string): string {
  return sha256Hex(prevHash + payloadHash);
}

/**
 * Verify a contiguous chain of receipts. Returns the index of the first
 * broken link, or -1 if the whole chain is intact. Each entry must carry the
 * payload it claims to hash so tampering is detectable.
 */
export function verifyChain(
  receipts: Array<{ payload: unknown; sha256: string; prev_hash: string; chain_hash: string }>,
  genesis: string = GENESIS_PREV_HASH,
): number {
  let expectedPrev = genesis;
  for (let i = 0; i < receipts.length; i++) {
    const r = receipts[i];
    if (r.prev_hash !== expectedPrev) return i;
    if (hashPayload(r.payload) !== r.sha256) return i;
    if (chainHash(r.prev_hash, r.sha256) !== r.chain_hash) return i;
    expectedPrev = r.chain_hash;
  }
  return -1;
}
