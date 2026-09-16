export type WhoRunsItStatus = 'ok' | 'partial' | 'not_found';

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

export type WhoRunsItResult = {
  status: WhoRunsItStatus;
  query: string;
  legalName: string | null;
  nzbn: string | null;
  entityStatus: string | null;
  entityType: string | null;
  directors: WhoRunsItDirector[];
  registeredOffice: string | null;
  contactHints: WhoRunsItContactHints;
  sourceLinks: Array<{ label: string; url: string }>;
  sandbox: boolean;
  /** Honest gap notes — never invent live data */
  gaps: string[];
};

export type WhoRunsItInput = {
  company: string;
};
