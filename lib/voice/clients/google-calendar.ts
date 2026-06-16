/**
 * Thin Google Calendar client — free/busy + event create via a service
 * account. We mint an OAuth access token by signing a JWT (RS256) with the
 * service-account private key (no googleapis SDK dependency), then call the
 * Calendar REST API with fetch. `fetchImpl` and `now` are injectable so the
 * tools' unit tests can run fully offline.
 *
 * GOOGLE_SERVICE_ACCOUNT_JSON is the base64-encoded service-account JSON.
 */
import { createSign } from 'node:crypto';

type FetchImpl = typeof fetch;

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/calendar';

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function parseServiceAccount(b64Json: string): ServiceAccount {
  const json = JSON.parse(Buffer.from(b64Json, 'base64').toString('utf8'));
  if (!json.client_email || !json.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON missing client_email/private_key');
  }
  return json;
}

/** Sign the assertion JWT and exchange it for an access token. */
export async function getAccessToken(
  sa: ServiceAccount,
  fetchImpl: FetchImpl = fetch,
  nowSec: number = Math.floor(Date.now() / 1000),
): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: nowSec,
      exp: nowSec + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const signature = b64url(signer.sign(sa.private_key));
  const assertion = `${header}.${claim}.${signature}`;

  const res = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

export interface BusyInterval {
  start: string;
  end: string;
}

/** Query free/busy for a calendar within a window. */
export async function freeBusy(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
  fetchImpl: FetchImpl = fetch,
): Promise<BusyInterval[]> {
  const res = await fetchImpl('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ timeMin, timeMax, items: [{ id: calendarId }] }),
  });
  if (!res.ok) throw new Error(`freeBusy failed: ${res.status}`);
  const json = (await res.json()) as {
    calendars: Record<string, { busy: BusyInterval[] }>;
  };
  return json.calendars[calendarId]?.busy ?? [];
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

/** List events in a window (used for duplicate detection). */
export async function listEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
  fetchImpl: FetchImpl = fetch,
): Promise<CalendarEvent[]> {
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  );
  url.searchParams.set('timeMin', timeMin);
  url.searchParams.set('timeMax', timeMax);
  url.searchParams.set('singleEvents', 'true');
  const res = await fetchImpl(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`listEvents failed: ${res.status}`);
  return ((await res.json()) as { items?: CalendarEvent[] }).items ?? [];
}

/** Create a reservation event. Returns the event id. */
export async function createEvent(
  accessToken: string,
  calendarId: string,
  event: {
    summary: string;
    description: string;
    start: string;
    end: string;
  },
  fetchImpl: FetchImpl = fetch,
): Promise<{ id: string }> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.start },
      end: { dateTime: event.end },
    }),
  });
  if (!res.ok) throw new Error(`createEvent failed: ${res.status}`);
  return { id: ((await res.json()) as { id: string }).id };
}
