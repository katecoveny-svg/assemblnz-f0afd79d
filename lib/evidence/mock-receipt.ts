/**
 * Mock receipt used when the mana_receipts table isn't queryable yet
 * (Kaihanga ships it Day 7.5). Mirrors the example at
 * ~/Desktop/ASSEMBL-CURRENT/12-mana-receipts/example-receipt.json.
 *
 * The signature is intentionally fake — `signature_b64: "fAkE_..."` — so a
 * verifier run against this mock will correctly fail signature check while
 * still letting the rest of the UI render.
 */
import type { ManaReceipt } from './types';

export const MOCK_RECEIPT: ManaReceipt = {
  id: '8a7c5e1b-2f4d-4a9b-8c3e-1d2f3e4a5b6c',
  schema_version: 'v1',
  issuer: 'Assembl Limited',
  issuer_domain: 'assembl.co.nz',
  agent: 'WHAKAAĒ',
  agent_version: '1.0.0',
  assembl_version: '0.5.0',
  domain: 'architecture',
  input_hash:
    'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  output_hash:
    'sha256:6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
  citations: [
    {
      type: 'building_code',
      clause: 'B1',
      doc: 'B1/AS1',
      version: 'Amendment 21 (2024)',
      note: 'Structure — single-storey timber-frame extension within scope',
    },
    {
      type: 'building_code',
      clause: 'E1',
      doc: 'E1/AS1',
      version: 'Amendment 12 (2023)',
      note: 'Surface water — site context reviewed; no overland flow path identified',
    },
    {
      type: 'building_code',
      clause: 'H1',
      doc: 'H1/AS1',
      version: '5th edition (2022)',
      note: 'Energy efficiency — climate zone 1, R-values flagged for verification',
    },
  ],
  pou: {
    rangatiratanga: {
      passed: true,
      note: 'Owner directs scope and final consent decision.',
    },
    kaitiakitanga: {
      passed: true,
      note: 'Site context (E1 surface water, H1 thermal envelope) considered.',
    },
    manaakitanga: {
      passed: true,
      note: 'Plain-English summary included for owner alongside technical pre-check.',
    },
    whanaungatanga: {
      passed: true,
      note: 'BCA escalation path identified; owner introduced to LBP register.',
    },
  },
  gates: {
    voice: true,
    tikanga: true,
    truth: true,
  },
  hitl: {
    status: 'pending_review',
    reviewer_role: 'licensed_architect',
    deadline: '2026-05-12T17:00:00+12:00',
  },
  prev_hash:
    'sha256:c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2',
  receipt_hash:
    'sha256:f7c3bc1d808e04732adf679965ccc34ca7ae3441ba0b3fd2b7b7dcf1ce6c2e15',
  signature_b64: 'fAkE_signature_for_example_only_paste_a_real_one_to_verify==',
  key_id: 'assembl-key-001',
  created_at: '2026-05-09T15:42:18.413Z',
  issued_at: '2026-05-09T15:42:18.413Z',
  verifier_url:
    'https://assembl.co.nz/verify?id=8a7c5e1b-2f4d-4a9b-8c3e-1d2f3e4a5b6c',
  audit_log_id: null,
};
