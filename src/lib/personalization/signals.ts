import type { DeviceType, TimeOfDay, EngagementDepth, KeteType, VisitorSignals } from './types';

const STORAGE_KEY = 'assembl_visitor';

interface StoredSignals {
  visitCount: number;
  pagesViewed: string[];
  lastKeteViewed: KeteType | null;
  firstVisit: string;
}

function getStoredSignals(): StoredSignals {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { visitCount: 0, pagesViewed: [], lastKeteViewed: null, firstVisit: new Date().toISOString() };
}

function persistSignals(data: StoredSignals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function getDeviceType(): DeviceType {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export function getTimeOfDay(): TimeOfDay {
  // NZ time — offset +12 (NZST) or +13 (NZDT)
  const nzTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Pacific/Auckland' }));
  const h = nzTime.getHours();
  if (h >= 5 && h < 9) return 'dawn';
  if (h >= 9 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function getUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  for (const [k, v] of params) {
    if (k.startsWith('utm_')) utms[k] = v;
  }
  return utms;
}

export function getReferralSource(): string | null {
  const ref = document.referrer;
  if (!ref) return 'direct';
  try {
    const url = new URL(ref);
    if (url.hostname.includes('google')) return 'google';
    if (url.hostname.includes('linkedin')) return 'linkedin';
    if (url.hostname.includes('facebook') || url.hostname.includes('fb.com')) return 'facebook';
    return url.hostname;
  } catch {
    return 'unknown';
  }
}

const KETE_PATHS: Record<string, KeteType> = {
  '/manaaki': 'manaaki',
  '/waihanga': 'waihanga',
  '/auaha': 'auaha',
  '/arataki': 'arataki',
  '/pikau': 'pikau',
  '/toro': 'toro',
  '/toroa': 'toro',
};

export function detectKeteFromPath(path: string): KeteType | null {
  for (const [prefix, kete] of Object.entries(KETE_PATHS)) {
    if (path.startsWith(prefix)) return kete;
  }
  return null;
}

export function collectSignals(): VisitorSignals {
  const stored = getStoredSignals();
  const currentPath = window.location.pathname;
  const keteFromPath = detectKeteFromPath(currentPath);

  // Update stored data
  stored.visitCount += 1;
  if (!stored.pagesViewed.includes(currentPath)) {
    stored.pagesViewed.push(currentPath);
    // Cap at 100 pages
    if (stored.pagesViewed.length > 100) stored.pagesViewed = stored.pagesViewed.slice(-100);
  }
  if (keteFromPath) stored.lastKeteViewed = keteFromPath;
  persistSignals(stored);

  const totalPages = stored.pagesViewed.length;
  let engagementDepth: EngagementDepth = 'new';
  if (totalPages >= 6) engagementDepth = 'engaged';
  else if (stored.visitCount > 1) engagementDepth = 'returning';

  return {
    referralSource: getReferralSource(),
    utmParams: getUtmParams(),
    deviceType: getDeviceType(),
    timeOfDay: getTimeOfDay(),
    region: null, // Phase 3
    visitCount: stored.visitCount,
    pagesViewed: stored.pagesViewed,
    lastKeteViewed: stored.lastKeteViewed,
    engagementDepth,
    scrollDepth: 0,
  };
}

export function recordPageView(path: string) {
  const stored = getStoredSignals();
  if (!stored.pagesViewed.includes(path)) {
    stored.pagesViewed.push(path);
  }
  const kete = detectKeteFromPath(path);
  if (kete) stored.lastKeteViewed = kete;
  persistSignals(stored);
}
