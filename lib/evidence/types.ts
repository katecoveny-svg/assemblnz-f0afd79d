/**
 * Mana Receipt — TypeScript shape for the Evidence Ledger UI.
 *
 * Mirrors the `public.mana_receipts` schema at
 * ~/Desktop/ASSEMBL-CURRENT/12-mana-receipts/01-schema.sql, plus a few
 * issuer fields that live in the JSON payload itself (issuer, verifier_url
 * etc) but aren't separate columns.
 */

export type ReceiptCitation =
  | {
      type: 'building_code';
      clause: string;
      doc?: string;
      version?: string;
      note?: string;
    }
  | {
      type: 'hs_code';
      code: string;
      gir?: string;
      note?: string;
    }
  | {
      type: 'privacy';
      ipp?: string;
      doc?: string;
      note?: string;
    }
  | {
      type: 'statute';
      act: string;
      section?: string;
      note?: string;
    }
  | {
      type: string;
      [key: string]: unknown;
    };

export interface ReceiptPouAttestation {
  passed: boolean;
  note?: string;
}

export interface ReceiptPou {
  rangatiratanga?: ReceiptPouAttestation;
  kaitiakitanga?: ReceiptPouAttestation;
  manaakitanga?: ReceiptPouAttestation;
  whanaungatanga?: ReceiptPouAttestation;
}

export interface ReceiptGates {
  voice?: boolean;
  tikanga?: boolean;
  truth?: boolean;
}

export interface ReceiptHitl {
  status?: 'pending_review' | 'reviewed' | 'rejected' | 'final';
  reviewer_role?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  deadline?: string;
}

export interface ManaReceipt {
  id: string;
  schema_version: string;
  issuer?: string;
  issuer_domain?: string;
  agent: string;
  agent_version: string;
  assembl_version?: string;
  domain: string;
  input_hash: string;
  output_hash: string;
  citations: ReceiptCitation[];
  pou: ReceiptPou;
  gates: ReceiptGates;
  hitl: ReceiptHitl;
  prev_hash: string | null;
  receipt_hash: string;
  signature_b64: string;
  key_id: string;
  created_at: string;
  issued_at?: string;
  verifier_url?: string;
  audit_log_id?: string | null;
}

export interface EvidenceSettings {
  retention: {
    receipts_months: number;
    audit_log_months: number;
    min_months: number;
    max_months: number;
  };
  public_verifier: 'on' | 'off';
  cite_when_uncertain: 'always_cite' | 'flag_for_human';
}

export const DEFAULT_EVIDENCE_SETTINGS: EvidenceSettings = {
  retention: {
    receipts_months: 84,
    audit_log_months: 84,
    min_months: 12,
    max_months: 360,
  },
  public_verifier: 'off',
  cite_when_uncertain: 'always_cite',
};
