import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { z } from 'zod';
import { entryDate } from './freight';
import { NzServiceError } from './auth';
export const CUSTOMS_URLS = {
    tariff: 'https://www.customs.govt.nz/media/0nmaamqd/tariff.tar.gz',
    currentFx: 'https://www.customs.govt.nz/media/tybjeibz/currentexchange.xml',
    historicFx: 'https://www.customs.govt.nz/media/v0pnq1nx/historicexchange.xml',
} as const;
export const tariffInput = z.object({ code: z.string().max(30).transform(v => v.replace(/[ .]/g, '').toUpperCase()).pipe(z.string().regex(/^\d{10}[A-Z]?$/)), entryDate }).strict();
export const fxInput = z.object({ currency: z.string().regex(/^[A-Z]{3}$/), entryDate }).strict();
const DAY = 86400000;
const sha = (b: Uint8Array | string) => createHash('sha256').update(b).digest('hex');
export type PublicSnapshot = {
    bytes: Uint8Array;
    url: string;
    observedAt: number;
    sha256: string;
};
export type PublicTransport = (url: typeof CUSTOMS_URLS[keyof typeof CUSTOMS_URLS], cap: number) => Promise<PublicSnapshot>;
/** Only fixed public Customs URLs, no credentials/user-derived URL, total deadline and streamed cap. */
export function createCustomsTransport(fetchImpl: typeof fetch = fetch, now = Date.now): PublicTransport {
    return async (url, cap) => {
        if (!Object.values(CUSTOMS_URLS).includes(url))
            throw new NzServiceError('invalid_input');
        const controller = new AbortController();
        let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const deadline = new Promise<never>((_, reject) => {
            timer = setTimeout(() => { controller.abort(); void reader?.cancel().catch(() => { }); reject(new NzServiceError('unavailable')); }, 8000);
        });
        const work = async () => {
            const r = await fetchImpl(url, { method: 'GET', redirect: 'error', credentials: 'omit',
                signal: controller.signal, headers: { Accept: url.endsWith('.xml') ? 'application/xml,text/xml' : 'application/gzip,application/octet-stream',
                    'User-Agent': 'assembl-nz-evidence/0.1 (+https://www.assembl.co.nz)' } });
            if (!r.ok || r.redirected || Number(r.headers.get('content-length')) > cap || !r.body) {
                await r.body?.cancel();
                throw new NzServiceError('unavailable');
            }
            reader = r.body.getReader();
            const chunks: Uint8Array[] = [];
            let size = 0;
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done)
                        break;
                    size += value.length;
                    if (size > cap) {
                        await reader.cancel();
                        throw new NzServiceError('unavailable');
                    }
                    chunks.push(value);
                }
            }
            finally {
                reader.releaseLock();
                reader = undefined;
            }
            const bytes = new Uint8Array(size);
            let offset = 0;
            for (const c of chunks) {
                bytes.set(c, offset);
                offset += c.length;
            }
            return { bytes, url, observedAt: now(), sha256: sha(bytes) };
        };
        try {
            return await Promise.race([work(), deadline]);
        }
        catch {
            throw new NzServiceError('unavailable');
        }
        finally {
            clearTimeout(timer);
            controller.abort();
        }
    };
}
/** In-memory archive reading only. Nothing is extracted to a path. Unknown/link/path members deny the archive. */
export function tariffMembers(compressed: Uint8Array): {
    details: string;
    stamp: string;
} {
    if (compressed.length > 8 * 1024 * 1024)
        throw new NzServiceError('unavailable');
    const archive = gunzipSync(compressed, { maxOutputLength: 96 * 1024 * 1024 });
    const allowed = new Set(['time_stamp.txt', 'Tariff_Details.csv', 'Tariff_Rates.csv', 'Tariff_Levies.csv', 'Tariff_Levy_Formulas.csv']);
    const seen = new Set<string>();
    let details = '';
    let stamp = '';
    let offset = 0;
    let ended = false;
    while (offset + 512 <= archive.length) {
        const header = archive.subarray(offset, offset + 512);
        if (header.every(b => b === 0)) {
            if (offset + 1024 > archive.length || archive.subarray(offset).some(b => b !== 0))
                throw new NzServiceError('unavailable');
            ended = true;
            break;
        }
        const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
        const prefix = header.subarray(345, 500).toString('utf8').replace(/\0.*$/, '');
        const type = String.fromCharCode(header[156]);
        const field = header.subarray(124, 136).toString('ascii').replace(/\0.*$/, '').trim();
        const recordedChecksum = parseInt(header.subarray(148, 156).toString('ascii').trim(), 8);
        const checksum = [...header].reduce((sum, b, i) => sum + (i >= 148 && i < 156 ? 32 : b), 0);
        if (!allowed.has(name) || prefix || seen.has(name) || !['0', '\0'].includes(type)
            || !/^[0-7]+$/.test(field) || checksum !== recordedChecksum)
            throw new NzServiceError('unavailable');
        seen.add(name);
        const size = parseInt(field, 8);
        const start = offset + 512;
        if (!Number.isSafeInteger(size) || start + size > archive.length)
            throw new NzServiceError('unavailable');
        if (name === 'Tariff_Details.csv') {
            if (size > 32 * 1024 * 1024)
                throw new NzServiceError('unavailable');
            details = new TextDecoder('windows-1252', { fatal: true }).decode(archive.subarray(start, start + size));
        }
        if (name === 'time_stamp.txt') {
            if (size > 256)
                throw new NzServiceError('unavailable');
            stamp = archive.subarray(start, start + size).toString('utf8').trim();
        }
        offset = start + Math.ceil(size / 512) * 512;
    }
    if (!ended || !details || !stamp)
        throw new NzServiceError('unavailable');
    return { details, stamp };
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function tariffDate(raw: string) {
    const m = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})(AM|PM)$/.exec(raw.trim());
    if (!m || +m[4] < 1 || +m[4] > 12 || +m[5] > 59)
        throw new NzServiceError('unavailable');
    const day = `${m[3]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    if (!entryDate.safeParse(day).success)
        throw new NzServiceError('unavailable');
    return { day, minute: (+m[4] % 12 + (m[6] === 'PM' ? 12 : 0)) * 60 + +m[5] };
}
export function parseNzStamp(stamp: string): number {
    const m = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{1,2}):(\d{2}):(\d{2})(?:\s+(AM|PM))?\s+(NZST|NZDT)\s+(\d{4})$/.exec(stamp.trim());
    if (!m || +m[5] > 59 || +m[6] > 59 || (m[7] ? +m[4] < 1 || +m[4] > 12 : +m[4] > 23))
        throw new NzServiceError('unavailable');
    const day = `${m[9]}-${String(MONTHS.indexOf(m[2]) + 1).padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    if (!entryDate.safeParse(day).success || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(day + 'T00:00:00Z').getUTCDay()] !== m[1])
        throw new NzServiceError('unavailable');
    const hour = m[7] ? +m[4] % 12 + (m[7] === 'PM' ? 12 : 0) : +m[4];
    const value = Date.UTC(+m[9], MONTHS.indexOf(m[2]), +m[3], hour - (m[8] === 'NZDT' ? 13 : 12), +m[5], +m[6]);
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(value).map(p => [p.type, p.value]));
    if (`${parts.year}-${parts.month}-${parts.day}` !== day || +parts.hour !== hour)
        throw new NzServiceError('unavailable');
    return value;
}
type TariffRecord = {
    code: string;
    description: string;
    statisticalUnit: string;
    supplementaryUnit: string;
    validFrom: string;
    validTo: string;
    row: number;
    startDay: string;
    endDay: string;
};
export function indexTariff(details: string): Map<string, TariffRecord[]> {
    const rows = details.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
    const expected = ['Tic Tariff Level 1', 'Tic Tariff Level 2', 'Tic Tariff Level 3', 'Tic Tariff Level 4', 'Tic Tariff Level 5', 'Tic Tariff Letter', 'Tic Tariff Section', 'Tic Statistical Unit', 'Tic Supplementary Unit', 'Tic Alternate Tariff Item', 'Tic Alternate Ind', 'Tic Gst Exempt Ind', 'Tic Start Date', 'Tic Expiry Date', 'Tic Tariff Description'];
    if (rows.length < 2 || rows.length > 250000 || JSON.stringify(rows[0].split('~').map(v => v.trim())) !== JSON.stringify(expected))
        throw new NzServiceError('unavailable');
    const index = new Map<string, TariffRecord[]>();
    for (let i = 1; i < rows.length; i++) {
        const c = rows[i].split('~');
        if (c.length !== 15 || c.slice(0, 5).some(v => !/^\d{2}$/.test(v)) || !/^[A-Z]$/.test(c[5]) || c[14].length > 2000)
            throw new NzServiceError('unavailable');
        const start = tariffDate(c[12]), end = tariffDate(c[13]);
        const code = c.slice(0, 5).join('') + c[5];
        const record = { code, description: c[14], statisticalUnit: c[7], supplementaryUnit: c[8], validFrom: c[12], validTo: c[13], row: i + 1, startDay: start.day, endDay: end.day };
        const key = code.slice(0, 10);
        const existing = index.get(key) ?? [];
        existing.push(record);
        index.set(key, existing);
    }
    return index;
}
export function selectTariff(details: string, code: string, date: string) { return tariffMatches(indexTariff(details), code, date); }
class PublicReferenceQualityError extends Error {
}
function tariffMatches(index: Map<string, TariffRecord[]>, code: string, date: string) {
    const allNumericCodeRows = index.get(code.slice(0, 10)) ?? [];
    if (allNumericCodeRows.some(r => r.startDay > r.endDay))
        throw new PublicReferenceQualityError();
    const candidates = allNumericCodeRows.filter(r => code.length === 10 || r.code === code);
    return candidates.filter(r => (code.length === 10 || r.code === code) && r.startDay <= date && date <= r.endDay);
}
/** Assembl engineering policy: observed daily 04:00 Auckland producer run, four-hour grace. Not a Customs SLA. */
export function tariffSnapshotStale(published: number, observed: number, now: number) {
    if (published > now + 600000 || observed > now || observed + DAY <= now)
        return true;
    const parts = (value: number) => Object.fromEntries(new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(value).map(p => [p.type, p.value]));
    const n = parts(now), p = parts(published);
    const today = `${n.year}-${n.month}-${n.day}`;
    const expected = +n.hour >= 8 ? today : new Date(Date.parse(today + 'T00:00:00Z') - DAY).toISOString().slice(0, 10);
    const pubDay = `${p.year}-${p.month}-${p.day}`;
    return pubDay < expected || (+p.hour < 4 && pubDay === expected);
}
const xmlText = (block: string, tag: string) => {
    const matches = [...block.matchAll(new RegExp(`<${tag}>\\s*([^<>]{1,150})\\s*</${tag}>`, 'g'))];
    if (matches.length !== 1)
        throw new NzServiceError('unavailable');
    return matches[0][1].trim();
};
type FxRecord = {
    currency: string;
    periodStart: string;
    periodEnd: string;
    foreignPerNzd: string;
    record: number;
    column: string;
};
export function indexFx(xml: string): FxRecord[] {
    const historic = /<historicExchangeRateList(?:\s[^>]*)?>/.test(xml);
    if (/<!DOCTYPE|<!ENTITY/i.test(xml) || (!historic && !/<exchangeRateList(?:\s[^>]*)?>/.test(xml)))
        throw new NzServiceError('unavailable');
    const records = [...xml.matchAll(historic ? /<historicExchangeRate(?:\s[^>]*)?>([\s\S]*?)<\/historicExchangeRate>/g : /<exchangeRate(?:\s[^>]*)?>([\s\S]*?)<\/exchangeRate>/g)];
    if (!records.length || records.length > 100000)
        throw new NzServiceError('unavailable');
    const rates: FxRecord[] = [];
    records.forEach((m, i) => {
        const currency = xmlText(m[1], 'currencyCode');
        if (!/^[A-Z]{3}$/.test(currency))
            throw new NzServiceError('unavailable');
        for (const suffix of historic ? [''] : ['Now', 'Future']) {
            const end = xmlText(m[1], `date${suffix}`).slice(0, 10);
            if (!entryDate.safeParse(end).success)
                throw new NzServiceError('unavailable');
            const raw = xmlText(m[1], `rate${suffix}`);
            if (!/^\d+(\.\d+)?$/.test(raw) || !Number.isFinite(Number(raw)) || Number(raw) <= 0)
                throw new NzServiceError('unavailable');
            if (end < '2020-01-01')
                continue;
            if (new Date(end + 'T00:00:00Z').getUTCDay() !== 0)
                throw new NzServiceError('unavailable');
            const start = new Date(Date.parse(end + 'T00:00:00Z') - 13 * DAY).toISOString().slice(0, 10);
            rates.push({ currency, periodStart: start, periodEnd: end, foreignPerNzd: raw, record: i + 1, column: suffix });
        }
    });
    return rates;
}
function fxMatches(rates: FxRecord[], currency: string, date: string) {
    const matches = rates.filter(v => v.currency === currency && v.periodStart <= date && date <= v.periodEnd);
    return matches.filter((v, i) => matches.findIndex(x => x.periodStart === v.periodStart && x.periodEnd === v.periodEnd && x.foreignPerNzd === v.foreignPerNzd) === i);
}
export function selectFx(xml: string, currency: string, date: string) { return fxMatches(indexFx(xml), currency, date); }
/** Public read-only adapter: bounded single-flight process cache, no customer data or filesystem ingestion. */
export function createCustomsReferences(transport: PublicTransport = createCustomsTransport(), now = Date.now) {
    const cache = new Map<string, {
        until: number;
        pending: Promise<PublicSnapshot>;
    }>();
    let active = 0;
    const parsedFx = new Map<string, {
        sha256: string;
        rates: FxRecord[];
    }>();
    const ratesFor = (s: PublicSnapshot) => { const existing = parsedFx.get(s.url); if (existing?.sha256 === s.sha256)
        return existing.rates; const rates = indexFx(new TextDecoder('utf-8', { fatal: true }).decode(s.bytes)); parsedFx.set(s.url, { sha256: s.sha256, rates }); return rates; };
    let parsedTariff: {
        sha256: string;
        index: Map<string, TariffRecord[]>;
        stamp: string;
        quarantined: number;
        quarantinedCodes: number;
    } | undefined;
    const load = async (url: typeof CUSTOMS_URLS[keyof typeof CUSTOMS_URLS], cap: number) => {
        const existing = cache.get(url);
        if (existing && existing.until > now())
            return existing.pending;
        if (active >= 2)
            throw new NzServiceError('unavailable');
        active++;
        const pending = transport(url, cap).finally(() => { active--; });
        cache.set(url, { until: now() + (url === CUSTOMS_URLS.tariff ? 3600000 : DAY), pending });
        try {
            return await pending;
        }
        catch {
            cache.delete(url);
            throw new NzServiceError('unavailable');
        }
    };
    const source = (s: PublicSnapshot) => ({ url: s.url, sha256: s.sha256, observedAt: new Date(s.observedAt).toISOString(),
        expiresAt: new Date(s.observedAt + DAY).toISOString(), attribution: 'Crown copyright — New Zealand Customs Service. Adapted for exact-code/period lookup; no endorsement.', licenceUrl: 'https://www.customs.govt.nz/about-us/about-this-website/copyright', parserVersion: '0.1.0' });
    return {
        async tariff(raw: unknown) {
            const parsed = tariffInput.safeParse(raw);
            if (!parsed.success)
                throw new NzServiceError('invalid_input');
            try {
                const s = await load(CUSTOMS_URLS.tariff, 8 * 1024 * 1024);
                if (parsedTariff?.sha256 !== s.sha256) {
                    const m = tariffMembers(s.bytes);
                    const index = indexTariff(m.details);
                    parsedTariff = { sha256: s.sha256, index, stamp: m.stamp, quarantined: [...index.values()].reduce((n, rows) => n + rows.filter(r => r.startDay > r.endDay).length, 0), quarantinedCodes: [...index.values()].filter(rows => rows.some(r => r.startDay > r.endDay)).length };
                }
                const { index, stamp, quarantined, quarantinedCodes } = parsedTariff;
                const published = parseNzStamp(stamp);
                const matches = tariffMatches(index, parsed.data.code, parsed.data.entryDate);
                const partialDay = matches.some(m => (tariffDate(m.validFrom).day === parsed.data.entryDate && tariffDate(m.validFrom).minute !== 0) || (tariffDate(m.validTo).day === parsed.data.entryDate && tariffDate(m.validTo).minute !== 1439));
                const stale = tariffSnapshotStale(published, s.observedAt, now());
                return { state: stale ? 'stale' : matches.length === 1 && !partialDay ? 'found' : matches.length ? 'ambiguous' : 'not_found',
                    suppliedCode: parsed.data.code, entryDate: parsed.data.entryDate,
                    matches: stale || partialDay || matches.length !== 1 ? [] : matches, source: { ...source(s), publishedAt: new Date(published).toISOString(), archiveMember: 'Tariff_Details.csv', freshnessPolicy: 'Observed 04:00 Auckland daily producer run, four-hour assembl grace; not a Customs SLA', snapshotQuality: quarantinedCodes ? 'degraded' : 'validated', quarantinedRecordCount: quarantined, quarantinedCodeCount: quarantinedCodes },
                    limitation: 'Exact supplied code existence/date lookup only; not classification, eligibility, tariff ruling or duty/levy calculation.' };
            }
            catch (error) {
                return { state: 'unavailable', reason: error instanceof PublicReferenceQualityError ? 'source_data_quality' : 'source_unavailable_or_schema_changed', suppliedCode: parsed.data.code, citation: CUSTOMS_URLS.tariff };
            }
        },
        async fx(raw: unknown) {
            const parsed = fxInput.safeParse(raw);
            if (!parsed.success)
                throw new NzServiceError('invalid_input');
            if (parsed.data.entryDate < '2020-01-01')
                return { state: 'date_out_of_range', limitation: 'Historical period semantics before 2020 are not supported.' };
            if (parsed.data.currency === 'NZD')
                return { state: 'found', currency: 'NZD', entryDate: parsed.data.entryDate, rate: '1.00', basis: 'identity conversion; not a downloaded Customs rate' };
            try {
                let s = await load(CUSTOMS_URLS.currentFx, 64 * 1024);
                let indexed = ratesFor(s);
                let matches = fxMatches(indexed, parsed.data.currency, parsed.data.entryDate);
                if (!matches.length) {
                    s = await load(CUSTOMS_URLS.historicFx, 8 * 1024 * 1024);
                    indexed = ratesFor(s);
                    matches = fxMatches(indexed, parsed.data.currency, parsed.data.entryDate);
                }
                const stale = s.observedAt > now() || s.observedAt + DAY <= now();
                return { state: stale ? 'stale' : matches.length === 1 ? 'found' : matches.length ? 'ambiguous' : indexed.some(r => r.currency === parsed.data.currency) ? 'date_out_of_range' : 'currency_not_published',
                    currency: parsed.data.currency, entryDate: parsed.data.entryDate, rates: stale || matches.length !== 1 ? [] : matches,
                    source: source(s), limitation: 'Official Customs published reference by entry date. Rate is foreign currency per NZD; no conversion, valuation or declaration is performed.' };
            }
            catch {
                return { state: 'unavailable', currency: parsed.data.currency, citation: CUSTOMS_URLS.currentFx };
            }
        },
    };
}
