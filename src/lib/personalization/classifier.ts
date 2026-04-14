import type { KeteType, VisitorSignals } from './types';

interface ClassificationResult {
  industry: KeteType | null;
  confidence: number;
}

const SEARCH_TERM_MAP: Record<string, KeteType> = {
  'construction': 'waihanga',
  'building': 'waihanga',
  'builder': 'waihanga',
  'consent': 'waihanga',
  'site safety': 'waihanga',
  'h&s': 'waihanga',
  'bim': 'waihanga',
  'restaurant': 'manaaki',
  'hospitality': 'manaaki',
  'food safety': 'manaaki',
  'liquor': 'manaaki',
  'hotel': 'manaaki',
  'cafe': 'manaaki',
  'bar': 'manaaki',
  'tourism': 'manaaki',
  'freight': 'pikau',
  'customs': 'pikau',
  'shipping': 'pikau',
  'logistics': 'pikau',
  'import': 'pikau',
  'export': 'pikau',
  'creative': 'auaha',
  'marketing': 'auaha',
  'agency': 'auaha',
  'design': 'auaha',
  'content': 'auaha',
  'branding': 'auaha',
  'car dealer': 'arataki',
  'dealership': 'arataki',
  'automotive': 'arataki',
  'vehicle': 'arataki',
  'motor': 'arataki',
  'family': 'toro',
  'school': 'toro',
  'kids': 'toro',
  'whānau': 'toro',
  'whanau': 'toro',
};

export function classifyVisitor(signals: VisitorSignals): ClassificationResult {
  // Check for QA override
  const params = new URLSearchParams(window.location.search);
  const forceIndustry = params.get('force_industry') as KeteType | null;
  if (forceIndustry && ['manaaki', 'waihanga', 'auaha', 'arataki', 'pikau', 'toro'].includes(forceIndustry)) {
    return { industry: forceIndustry, confidence: 1.0 };
  }

  const scores: Record<KeteType, number> = {
    manaaki: 0, waihanga: 0, auaha: 0, arataki: 0, pikau: 0, toro: 0,
  };

  // 1. Pages viewed (strongest signal)
  for (const page of signals.pagesViewed) {
    if (page.startsWith('/manaaki')) scores.manaaki += 3;
    if (page.startsWith('/waihanga')) scores.waihanga += 3;
    if (page.startsWith('/auaha')) scores.auaha += 3;
    if (page.startsWith('/arataki')) scores.arataki += 3;
    if (page.startsWith('/pikau')) scores.pikau += 3;
    if (page.startsWith('/toro') || page.startsWith('/toroa')) scores.toro += 3;
  }

  // 2. Last kete viewed (recency bonus)
  if (signals.lastKeteViewed) {
    scores[signals.lastKeteViewed] += 5;
  }

  // 3. UTM / referral clues
  const utmContent = Object.values(signals.utmParams).join(' ').toLowerCase();
  const referral = (signals.referralSource || '').toLowerCase();
  const searchContext = `${utmContent} ${referral}`;

  for (const [term, kete] of Object.entries(SEARCH_TERM_MAP)) {
    if (searchContext.includes(term)) {
      scores[kete] += 4;
    }
  }

  // 4. Device + time heuristic (Toro bias)
  if (signals.deviceType === 'mobile' && (signals.timeOfDay === 'evening' || signals.timeOfDay === 'night')) {
    scores.toro += 2;
  }

  // Find winner
  let best: KeteType | null = null;
  let bestScore = 0;
  for (const [kete, score] of Object.entries(scores) as [KeteType, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = kete;
    }
  }

  // Minimum threshold
  if (bestScore < 3) {
    return { industry: null, confidence: 0 };
  }

  const confidence = Math.min(bestScore / 15, 1.0);
  return { industry: best, confidence };
}
