/**
 * Pilot tool registry — the curated shelf of tools and NZ data sources Pilot
 * suggests in step 4.
 *
 * This is a static, NZ-first registry rather than a live MCP query: the
 * end-user app cannot reach the build-time mcp-registry MCP, and the tools that
 * matter to a New Zealander building an agent are the official NZ sources
 * (Companies Office, IRD, MBIE, marine forecasts, the Privacy Commissioner,
 * Fair Trading) plus the everyday connectors. Each entry carries keyword tags
 * so Pilot can suggest the right ones from a plain-English goal + inputs.
 *
 * Adding a tool = one entry here. No other change needed.
 */

export interface PilotTool {
  id: string;
  name: string;
  /** one-line plain-English description shown beside the toggle */
  blurb: string;
  /** grouping shown in the picker */
  group: 'NZ government' | 'Data & docs' | 'Calendar & comms' | 'Web & search' | 'Files';
  /** keywords used to auto-suggest this tool from the goal/inputs text */
  tags: string[];
}

export const PILOT_TOOLS: PilotTool[] = [
  // ── NZ government ────────────────────────────────────────────────────
  {
    id: 'companies-office',
    name: 'Companies Office',
    blurb: 'Look up a company, directors, shareholders and the NZBN register.',
    group: 'NZ government',
    tags: ['company', 'business', 'director', 'nzbn', 'shareholder', 'incorporat', 'register', 'supplier'],
  },
  {
    id: 'ird',
    name: 'Inland Revenue (IRD)',
    blurb: 'GST, PAYE, provisional tax rules and IRD number checks.',
    group: 'NZ government',
    tags: ['tax', 'gst', 'paye', 'ird', 'invoice', 'expense', 'income', 'provisional', 'rebate'],
  },
  {
    id: 'mbie',
    name: 'MBIE',
    blurb: 'Employment law, tenancy, building and consumer guidance from MBIE.',
    group: 'NZ government',
    tags: ['employ', 'tenancy', 'building', 'consumer', 'holiday', 'leave', 'wage', 'mbie', 'consent'],
  },
  {
    id: 'privacy-commissioner',
    name: 'Privacy Commissioner',
    blurb: 'Privacy Act 2020 guidance, IPPs and breach assessment.',
    group: 'NZ government',
    tags: ['privacy', 'personal information', 'breach', 'data', 'ipp', 'consent', 'customer detail'],
  },
  {
    id: 'fair-trading',
    name: 'Commerce Commission — Fair Trading',
    blurb: 'Fair Trading Act and advertising claim rules.',
    group: 'NZ government',
    tags: ['advertis', 'marketing', 'claim', 'price', 'promotion', 'fair trading', 'misleading', 'sale'],
  },
  {
    id: 'worksafe',
    name: 'WorkSafe NZ',
    blurb: 'Health and Safety at Work Act guidance and notifiable events.',
    group: 'NZ government',
    tags: ['safety', 'hazard', 'site', 'worksafe', 'hswa', 'incident', 'construction', 'risk'],
  },
  {
    id: 'nz-legislation',
    name: 'NZ Legislation',
    blurb: 'The full text of NZ Acts and regulations, cited by section.',
    group: 'NZ government',
    tags: ['act', 'law', 'legislation', 'regulation', 'legal', 'statute', 'clause'],
  },
  {
    id: 'nz-gazette',
    name: 'NZ Gazette',
    blurb: 'Official government notices and appointments.',
    group: 'NZ government',
    tags: ['notice', 'gazette', 'official', 'appointment', 'tender'],
  },
  {
    id: 'metservice-marine',
    name: 'MetService marine forecast',
    blurb: 'Tides, swell, wind and coastal marine forecasts.',
    group: 'NZ government',
    tags: ['marine', 'weather', 'tide', 'swell', 'wind', 'forecast', 'fishing', 'boat', 'coastal', 'sea'],
  },
  {
    id: 'gtfs-transit',
    name: 'NZ public transport (GTFS)',
    blurb: 'Live bus, train and ferry times from AT, Metlink and ORC.',
    group: 'NZ government',
    tags: ['bus', 'train', 'ferry', 'transport', 'transit', 'timetable', 'commute', 'route'],
  },

  // ── Data & docs ──────────────────────────────────────────────────────
  {
    id: 'document-reader',
    name: 'Document reader',
    blurb: 'Read PDFs, Word docs and scanned images, including OCR.',
    group: 'Data & docs',
    tags: ['document', 'pdf', 'word', 'contract', 'letter', 'notice', 'scan', 'photo', 'image', 'read', 'invoice', 'statement'],
  },
  {
    id: 'spreadsheet',
    name: 'Spreadsheet',
    blurb: 'Read and write rows in a spreadsheet — totals, tables, exports.',
    group: 'Data & docs',
    tags: ['spreadsheet', 'excel', 'csv', 'table', 'calculation', 'total', 'numbers', 'data', 'count', 'log'],
  },
  {
    id: 'database',
    name: 'Database',
    blurb: 'Query a connected database for records and history.',
    group: 'Data & docs',
    tags: ['database', 'records', 'history', 'query', 'sql', 'lookup'],
  },
  {
    id: 'pdf-export',
    name: 'PDF export',
    blurb: 'Produce a tidy, assembl-wordmarked PDF of the output.',
    group: 'Data & docs',
    tags: ['pdf', 'export', 'report', 'document', 'pack', 'print', 'summary'],
  },

  // ── Calendar & comms ─────────────────────────────────────────────────
  {
    id: 'calendar',
    name: 'Calendar',
    blurb: 'Read and add calendar events with reminders.',
    group: 'Calendar & comms',
    tags: ['calendar', 'event', 'date', 'reminder', 'appointment', 'schedule', 'booking', 'meeting', 'deadline'],
  },
  {
    id: 'email',
    name: 'Email',
    blurb: 'Read an inbox and draft replies — never sent without sign-off.',
    group: 'Calendar & comms',
    tags: ['email', 'inbox', 'reply', 'message', 'triage', 'correspondence'],
  },
  {
    id: 'sms',
    name: 'SMS / text',
    blurb: 'Draft and send text messages (with your confirmation).',
    group: 'Calendar & comms',
    tags: ['sms', 'text', 'message', 'reminder', 'notify', 'check-in'],
  },

  // ── Web & search ─────────────────────────────────────────────────────
  {
    id: 'web-search',
    name: 'Web search',
    blurb: 'Search the web for current information and cite the source.',
    group: 'Web & search',
    tags: ['search', 'web', 'research', 'current', 'news', 'lookup', 'find'],
  },
  {
    id: 'web-fetch',
    name: 'Read a web page',
    blurb: 'Fetch and read a specific web page or feed.',
    group: 'Web & search',
    tags: ['web', 'page', 'url', 'website', 'fetch', 'feed', 'scrape'],
  },

  // ── Files ────────────────────────────────────────────────────────────
  {
    id: 'drive-folder',
    name: 'Drive folder',
    blurb: 'Read files from a connected Google Drive or OneDrive folder.',
    group: 'Files',
    tags: ['drive', 'folder', 'files', 'onedrive', 'google drive', 'storage', 'documents'],
  },
];

export function pilotToolById(id: string): PilotTool | undefined {
  return PILOT_TOOLS.find((t) => t.id === id);
}

/**
 * Suggest tools from free-text (goal + inputs + description). Scores each tool
 * by how many of its tags appear in the haystack and returns the best matches.
 * Always returns at least the document reader + PDF export as sensible defaults
 * when nothing else matches, since almost every agent reads something in and
 * produces something out.
 */
export function suggestTools(text: string, limit = 6): string[] {
  const hay = text.toLowerCase();
  const scored = PILOT_TOOLS.map((t) => {
    const score = t.tags.reduce((n, tag) => (hay.includes(tag) ? n + 1 : n), 0);
    return { id: t.id, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.id);

  if (scored.length === 0) return ['document-reader', 'pdf-export'];
  return scored;
}
