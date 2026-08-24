const PARLIAMENT_BILLS_ORIGIN = 'https://bills.parliament.nz';

export const PARLIAMENT_BILL_FEEDS = {
  proposed: `${PARLIAMENT_BILLS_ORIGIN}/rss?set=ProposedMembersBill`,
  introduced: `${PARLIAMENT_BILLS_ORIGIN}/rss?set=Bills`,
} as const;

export const FOOD_WASTE_BILL_TITLE = 'Waste Minimisation (Food Waste) Amendment Bill';

export type ParliamentBillStage = 'proposed' | 'introduced';

export interface ParliamentBillRecord {
  id: string;
  title: string;
  url: string;
  stage: ParliamentBillStage;
}

export interface ParliamentBillDetail {
  lodgedDate: string | null;
  memberInCharge: string | null;
  summary: string | null;
  drawn: boolean | null;
}

export interface FeaturedParliamentBill extends ParliamentBillRecord, ParliamentBillDetail {
  statusLabel: string;
}

export interface ParliamentBillWatch {
  proposed: ParliamentBillRecord[];
  introduced: ParliamentBillRecord[];
  featured: FeaturedParliamentBill | null;
  capturedAt: string;
  degraded: boolean;
  errors: string[];
}

function decodeXml(value: string): string {
  return value
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readTag(item: string, tag: string): string {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

export function parseParliamentBillRss(
  xml: string,
  stage: ParliamentBillStage,
): ParliamentBillRecord[] {
  const records: ParliamentBillRecord[] = [];
  const seen = new Set<string>();

  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const item = match[1];
    const id = readTag(item, 'guid');
    const title = readTag(item, 'title');
    const url = readTag(item, 'link');

    if (!id || !title || !url || seen.has(id)) continue;
    seen.add(id);
    records.push({ id, title, url, stage });
  }

  return records;
}

function formatParliamentDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;

  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function parseProposedBillDetail(value: unknown): ParliamentBillDetail {
  if (!value || typeof value !== 'object') {
    return { lodgedDate: null, memberInCharge: null, summary: null, drawn: null };
  }

  const record = value as {
    ProposedDate?: unknown;
    Description?: unknown;
    Members?: Array<{ PreferredFormOfAddress?: unknown; IsInCharge?: unknown }>;
    BillBallots?: Array<{ Drawn?: unknown }>;
  };
  const member = record.Members?.find((candidate) => candidate.IsInCharge === true);
  const drawn = record.BillBallots?.find((ballot) => typeof ballot.Drawn === 'boolean')?.Drawn;

  return {
    lodgedDate: formatParliamentDate(record.ProposedDate),
    memberInCharge:
      typeof member?.PreferredFormOfAddress === 'string'
        ? member.PreferredFormOfAddress
        : null,
    summary: typeof record.Description === 'string' ? record.Description.trim() || null : null,
    drawn: typeof drawn === 'boolean' ? drawn : null,
  };
}

function normalizedTitle(title: string): string {
  return title.toLocaleLowerCase('en-NZ').replace(/[^a-z0-9]+/g, ' ').trim();
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/rss+xml, application/xml, text/html;q=0.9, */*;q=0.8',
      'User-Agent': 'assembl-regulatory-watch/1.0 (+https://www.assembl.co.nz)',
    },
  });

  if (!response.ok) throw new Error(`${response.status} from ${url}`);
  return response.text();
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'assembl-regulatory-watch/1.0 (+https://www.assembl.co.nz)',
    },
  });

  if (!response.ok) throw new Error(`${response.status} from ${url}`);
  return response.json();
}

export async function getParliamentBillWatch(): Promise<ParliamentBillWatch> {
  const capturedAt = new Date().toISOString();
  const errors: string[] = [];
  const [proposedResult, introducedResult] = await Promise.allSettled([
    fetchText(PARLIAMENT_BILL_FEEDS.proposed),
    fetchText(PARLIAMENT_BILL_FEEDS.introduced),
  ]);

  const proposed =
    proposedResult.status === 'fulfilled'
      ? parseParliamentBillRss(proposedResult.value, 'proposed')
      : [];
  const introduced =
    introducedResult.status === 'fulfilled'
      ? parseParliamentBillRss(introducedResult.value, 'introduced')
      : [];

  if (proposedResult.status === 'rejected') errors.push(String(proposedResult.reason));
  if (introducedResult.status === 'rejected') errors.push(String(introducedResult.reason));

  const target = normalizedTitle(FOOD_WASTE_BILL_TITLE);
  const introducedRecord = introduced.find((record) => normalizedTitle(record.title) === target);
  const proposedRecord = proposed.find((record) => normalizedTitle(record.title) === target);
  const featuredRecord = introducedRecord ?? proposedRecord ?? null;
  let featured: FeaturedParliamentBill | null = null;

  if (featuredRecord) {
    let detail: ParliamentBillDetail = {
      lodgedDate: null,
      memberInCharge: null,
      summary: null,
      drawn: null,
    };

    if (featuredRecord.stage === 'proposed') {
      try {
        detail = parseProposedBillDetail(
          await fetchJson(
            `${PARLIAMENT_BILLS_ORIGIN}/api/data/ProposedMembersBill/${featuredRecord.id}`,
          ),
        );
      } catch (error) {
        errors.push(String(error));
      }
    }

    featured = {
      ...featuredRecord,
      ...detail,
      statusLabel:
        featuredRecord.stage === 'introduced'
          ? 'Introduced Bill · current'
          : detail.drawn === false
            ? 'Proposed Member’s Bill · not drawn'
            : 'Proposed Member’s Bill · awaiting introduction',
    };
  }

  return {
    proposed,
    introduced,
    featured,
    capturedAt,
    degraded: proposed.length === 0 || introduced.length === 0,
    errors,
  };
}
