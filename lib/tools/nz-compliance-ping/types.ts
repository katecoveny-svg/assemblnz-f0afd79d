export type CompliancePingStatus = 'ok' | 'partial' | 'not_found';

export type ComplianceFlagSeverity = 'info' | 'watch' | 'alert';

export type ComplianceFlag = {
  code: string;
  severity: ComplianceFlagSeverity;
  message: string;
  source: string;
};

export type CompliancePingResult = {
  status: CompliancePingStatus;
  query: string;
  legalName: string | null;
  nzbn: string | null;
  entityStatus: string | null;
  entityType: string | null;
  flags: ComplianceFlag[];
  sourceLinks: Array<{ label: string; url: string }>;
  adapters: {
    nzbn: 'live' | 'sandbox' | 'unavailable';
  };
  sandbox: boolean;
  /** Not legal advice */
  disclaimer: string;
  gaps: string[];
};

export type CompliancePingInput = {
  company: string;
};

export const COMPLIANCE_DISCLAIMER =
  'Public-register signals only. Not legal, tax, AML, or credit advice. Confirm on NZBN / Companies Office before acting.';
