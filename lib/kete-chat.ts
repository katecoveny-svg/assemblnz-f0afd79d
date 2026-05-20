import { getKete, type KeteSlug } from '@/lib/kete';

export type KeteWidgetMode = 'marketing' | 'operator';

export type KeteWidgetCopy = {
  eyebrow: string;
  title: string;
  prompt: string;
  buttonLabel: string;
};

const KETE_PROMPTS: Record<KeteSlug, string> = {
  waihanga: 'Ask what is missing from a project pack, consent pathway, RFI response, or evidence trail.',
  manaaki: 'Ask about food safety, venue compliance, guest recovery, roster evidence, or shift risk.',
  pikau: 'Ask about customs entries, tariff classification, biosecurity documents, or shipment readiness.',
  arataki: 'Ask about dealer leakage, loan cars, service-to-sales, fleet risk, or the next best pilot surface.',
  auaha: 'Ask about campaign claims, brand evidence, creative approvals, or content workflow risk.',
  ako: 'Ask about centre operations, ratios, safety checks, whānau comms, or ERO evidence.',
  matauranga: 'Ask about school reporting, NCEA tracking, board packs, attendance, or pastoral signals.',
  hoko: 'Ask about CGA, Fair Trading, returns, supplier records, retail privacy, or stock risk.',
  toro: 'Ask what Tōro can help remember across school, food, routines, trips, money, and the week ahead.',
};

export function publicChatUrl(kete: KeteSlug, agent?: string) {
  const params = new URLSearchParams();
  if (agent) params.set('agent', agent);
  const query = params.toString();
  return `/c/${kete}${query ? `?${query}` : ''}`;
}

export function publicChatEmbedUrl(kete: KeteSlug, agent?: string) {
  const params = new URLSearchParams();
  if (agent) params.set('agent', agent);
  const query = params.toString();
  return `/c/${kete}/embed${query ? `?${query}` : ''}`;
}

export function getKeteWidgetCopy(
  kete: KeteSlug,
  mode: KeteWidgetMode = 'marketing',
): KeteWidgetCopy {
  const def = getKete(kete);
  const isOperator = mode === 'operator';

  return {
    eyebrow: isOperator ? `${def.name} · operator assistant` : `${def.name} · live assistant`,
    title: isOperator ? `Ask ${def.name} about this workspace.` : `Ask ${def.name} before you book.`,
    prompt: KETE_PROMPTS[kete],
    buttonLabel: isOperator ? `Ask ${def.name}` : `Ask ${def.name}`,
  };
}
