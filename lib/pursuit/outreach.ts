import { z } from 'zod';

// A source-linked proposal is not verified buying intent or permission to contact.
export function publicWebsite(value: string): string | null {
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !url.hostname.includes('.') || /^[\d:[\]]/.test(url.hostname) ||
        /(?:^|\.)(?:localhost|local|internal|test|example|invalid)$/.test(url.hostname)) return null;
    url.hash = '';
    return url.toString();
  } catch { return null; }
}
const text = (max: number) => z.string().trim().min(3).max(max);
export const OutreachCampaign = z.object({
  seller: z.object({ name: text(120), website: z.string().url().max(1000), offer: text(500) }).strict(),
  market: text(300),
  prospects: z.array(z.object({
    company: text(120), website: z.string().url().max(1000),
    buyerRole: text(120),
    signal: z.object({ claim: text(350), url: z.string().url().max(1000), publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable() }).strict(),
    fit: text(400), hypothesis: text(400), proof: text(300),
    contactUrl: z.string().url().max(1000).nullable(),
    unknowns: z.array(text(200)).min(1).max(4),
    subject: text(120), opening: text(1200), followUp: text(800),
  }).strict()).max(3),
  gaps: z.array(text(250)).min(1).max(5),
}).strict();
export type OutreachCampaign = z.infer<typeof OutreachCampaign>;
export type OutreachProspect = OutreachCampaign['prospects'][number];

export function parseOutreach(value: unknown, sourceUrls: string[], sellerWebsite: string): OutreachCampaign {
  const campaign = OutreachCampaign.parse(value);
  const known = new Set(sourceUrls.map(publicWebsite).filter(Boolean));
  const traced = (value: string) => {
    const url = publicWebsite(value);
    if (!url || !known.has(url)) throw new Error('untraced_outreach_source');
  };
  traced(campaign.seller.website);
  const host = (value: string) => new URL(publicWebsite(value)!).hostname.replace(/^www\./, '');
  if (host(campaign.seller.website) !== host(sellerWebsite)) throw new Error('seller_website_mismatch');
  const seen = new Set<string>();
  for (const prospect of campaign.prospects) {
    traced(prospect.website); traced(prospect.signal.url);
    if (prospect.contactUrl) traced(prospect.contactUrl);
    const domain = host(prospect.website);
    if (seen.has(domain) || domain === host(sellerWebsite)) throw new Error('duplicate_outreach_account');
    seen.add(domain);
  }
  return campaign;
}

export type OutreachCopy = { subject: string; opening: string; followUp: string };
export function reviewFingerprint(receipt: string, prospect: OutreachProspect, copy: OutreachCopy) {
  return JSON.stringify({ receipt, prospect, copy });
}
export function outreachExport(campaign: OutreachCampaign, prospect: OutreachProspect, copy: OutreachCopy, receipt: string, researchedAt: string) {
  return [
    'PURSUIT / REVIEWED OUTREACH DRAFT / NOT SENT',
    `Seller: ${campaign.seller.name} (${campaign.seller.website})`,
    `Account: ${prospect.company} (${prospect.website})`,
    `Suggested role to check: ${prospect.buyerRole}`,
    `Subject: ${copy.subject}`, '', copy.opening, '', 'FOLLOW-UP DRAFT', copy.followUp,
    '', 'EVIDENCE & REVIEW CONTEXT', prospect.signal.claim, prospect.signal.url,
    `Published: ${prospect.signal.publishedAt ?? 'Unknown; do not infer urgency'}`,
    `Researched: ${researchedAt}`, `Why it may fit: ${prospect.fit}`,
    `Hypothesis: ${prospect.hypothesis}`, `Proof to propose: ${prospect.proof}`,
    `Public contact route: ${prospect.contactUrl ?? 'Not found; needs research'}`,
    'A published route is not verified contact data or permission to send.',
    ...prospect.unknowns.map(item => `Still to check: ${item}`),
    `Research receipt: ${receipt}`, 'Reviewed for export only. No contact has been verified or message sent.',
  ].join('\n');
}
