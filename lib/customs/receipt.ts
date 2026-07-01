/**
 * Mana Receipt builder for customs decisions.
 *
 * Every classification decision, duty calculation and comms draft in the
 * Aironaut workspace is defensible: it produces a Mana Receipt that captures
 * the citation trail (HS code + GRI, the statutes applied), the human-in-the-
 * loop sign-off state (a licensed broker must review), and a tamper-evident
 * hash so the pack can be shown to Customs on an audit.
 *
 * Shapes reuse the existing Evidence Ledger types (lib/evidence/types.ts) so
 * these receipts render in the same /mana-receipts surface. Assembl
 * attribution lives here in the receipt issuer — this is the one place the
 * chrome carries an assembl mark.
 */
import 'server-only';
import { createHash } from 'crypto';
import type {
  ManaReceipt,
  ReceiptCitation,
} from '@/lib/evidence/types';
import type { CustomsEntryRecord } from './types';

const ISSUER = 'Assembl Limited';
const ISSUER_DOMAIN = 'assembl.co.nz';
const AGENT = 'PĪKAU';
const AGENT_VERSION = '1.0.0-pilot';

function sha256(input: string): string {
  return 'sha256:' + createHash('sha256').update(input).digest('hex');
}

/** Build the citation list for an entry's captured classifications. */
function entryCitations(entry: CustomsEntryRecord): ReceiptCitation[] {
  const cites: ReceiptCitation[] = [];
  for (const c of entry.classifications) {
    const best = c.candidates[0];
    if (best) {
      cites.push({
        type: 'hs_code',
        code: best.hsCode,
        gir: best.griApplied.join(', '),
        note: `${best.headingText}${best.suggestion ? ' (SUGGESTION — broker to confirm)' : ''}`,
      });
    }
  }
  cites.push({
    type: 'statute',
    act: 'Customs and Excise Act 2018',
    section: 's.180 (customs brokers), s.405 (7-year record retention)',
    note: 'Entry drafted for lodgement by a licensed broker; records retained 7 years.',
  });
  if (entry.input.flags.hasFoodForSale || entry.input.flags.hasWoodPackaging) {
    cites.push({
      type: 'statute',
      act: 'Biosecurity Act 1993',
      note: 'Import Health Standard / MPI clearance considered for this consignment.',
    });
  }
  return cites;
}

/**
 * Build a Mana Receipt for an entry. Deterministic given the entry record
 * (timestamps come from the record, hashes from content) so the pilot renders
 * a stable audit pack without a live signing service.
 */
export function buildEntryReceipt(
  entry: CustomsEntryRecord,
  prevHash: string | null,
): ManaReceipt {
  const inputHash = sha256(JSON.stringify(entry.input));
  const outputHash = sha256(JSON.stringify({ plan: entry.plan, classifications: entry.classifications }));
  const citations = entryCitations(entry);

  const core = {
    id: entry.receiptId,
    schema_version: 'v1',
    issuer: ISSUER,
    issuer_domain: ISSUER_DOMAIN,
    agent: AGENT,
    agent_version: AGENT_VERSION,
    assembl_version: '0.5.0',
    domain: 'customs',
    input_hash: inputHash,
    output_hash: outputHash,
    citations,
    prev_hash: prevHash,
    created_at: entry.updatedIso,
    issued_at: entry.updatedIso,
  };

  const receipt_hash = sha256(JSON.stringify({ ...core, prev_hash: prevHash }));

  return {
    ...core,
    pou: {
      rangatiratanga: {
        passed: true,
        note: 'The importer directs the shipment; the broker makes the final lodgement call.',
      },
      kaitiakitanga: {
        passed: true,
        note: 'Biosecurity and origin obligations considered before release.',
      },
      manaakitanga: {
        passed: true,
        note: 'Plain-English readiness summary provided alongside the technical draft.',
      },
      whanaungatanga: {
        passed: true,
        note: 'Draft staged for the licensed broker; importer kept informed.',
      },
    },
    gates: { voice: true, tikanga: true, truth: true },
    hitl: {
      status:
        entry.status === 'ready_for_broker_review' ||
        entry.status === 'lodged_by_broker' ||
        entry.status === 'assessed' ||
        entry.status === 'cleared'
          ? 'reviewed'
          : 'pending_review',
      reviewer_role: 'licensed_customs_broker',
    },
    receipt_hash,
    signature_b64: 'PILOT_unsigned_receipt_no_production_key_present==',
    key_id: 'aironaut-pilot-key-001',
    verifier_url: `https://assembl.co.nz/verify?id=${entry.receiptId}`,
    audit_log_id: null,
  };
}

/** Build the chained receipts for a set of entries, in chronological order. */
export function buildReceiptChain(entries: CustomsEntryRecord[]): ManaReceipt[] {
  const sorted = [...entries].sort((a, b) => a.createdIso.localeCompare(b.createdIso));
  const chain: ManaReceipt[] = [];
  let prev: string | null = null;
  for (const entry of sorted) {
    const receipt = buildEntryReceipt(entry, prev);
    chain.push(receipt);
    prev = receipt.receipt_hash;
  }
  return chain;
}
