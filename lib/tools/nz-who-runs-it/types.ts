export type WhoRunsItStatus = 'ok' | 'partial' | 'not_found';

/** Public-register director fields only — never residential address or DOB. */
export type WhoRunsItDirector = {
  name: string;
  role?: string;
  appointedOn?: string | null;
};

export type WhoRunsItContactHints = {
  emails: string[];
  phones: string[];
  websites: string[];
  notes: string[];
};

export type WhoRunsItPrivacy = {
  /** Always true for this tool — directors are public-register PII. */
  directorsArePersonalInformation: true;
  notice: string;
  doNot: string[];
  sources: string[];
};

export type WhoRunsItAdapters = {
  nzbn: 'live' | 'sandbox' | 'unavailable';
  companiesOffice: 'live' | 'sandbox' | 'skipped' | 'unavailable';
};

export type WhoRunsItResult = {
  status: WhoRunsItStatus;
  query: string;
  legalName: string | null;
  nzbn: string | null;
  companyNumber: string | null;
  entityStatus: string | null;
  entityType: string | null;
  directors: WhoRunsItDirector[];
  registeredOffice: string | null;
  contactHints: WhoRunsItContactHints;
  sourceLinks: Array<{ label: string; url: string }>;
  adapters: WhoRunsItAdapters;
  privacy: WhoRunsItPrivacy;
  sandbox: boolean;
  /** Honest gap notes — never invent live data */
  gaps: string[];
};

export type WhoRunsItInput = {
  company: string;
};

export const WHO_RUNS_IT_PRIVACY: WhoRunsItPrivacy = {
  directorsArePersonalInformation: true,
  notice:
    'Director names (and any residential addresses on source registers) are personal information under the Privacy Act 2020. This tool returns only public-register name/role/appointment fields and cites NZBN + Companies Office. Do not build secondary director profiles or redistribute beyond the calling workflow (IPP 1, 9, 11).',
  doNot: [
    'Do not scrape or attach residential addresses or dates of birth.',
    'Do not aggregate directors across companies into a private dossier.',
    'Do not treat this output as AML/CFT, credit, or fitness-to-trade advice.',
  ],
  sources: [
    'NZBN public register — https://www.nzbn.govt.nz/',
    'Companies Office public register — https://www.business.govt.nz/services/business-data',
  ],
};
