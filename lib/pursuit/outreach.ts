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
  const known = new Set(sourceUrls.map(publicWebsite).filter((url): url is string => Boolean(url)));
  const host = (value: string) => new URL(publicWebsite(value)!).hostname.replace(/^www\./, '');
  const exact = (value: string) => {
    const url = publicWebsite(value);
    return url && known.has(url) ? url : null;
  };
  // A search may return a company's news/about page, without returning its
  // homepage. Link the company to an observed page on that same domain.
  // This does not establish a new fact, a contact route or a buying signal.
  const identityPage = (value: string) => exact(value) ?? (publicWebsite(value)
    ? [...known].find(source => host(source) === host(value)) ?? value : value);
  const traced = (value: string, field: string) => {
    const url = publicWebsite(value);
    if (!url || !known.has(url)) {
      console.warn('public_research_source_validation', { field });
      throw new Error('untraced_outreach_source');
    }
  };
  campaign.seller.website = identityPage(campaign.seller.website);
  traced(campaign.seller.website, 'seller.website');
  if (host(campaign.seller.website) !== host(sellerWebsite)) throw new Error('seller_website_mismatch');
  const seen = new Set<string>();
  for (const prospect of campaign.prospects) {
    prospect.website = identityPage(prospect.website);
    traced(prospect.website, 'prospect.website');
    traced(prospect.signal.url, 'prospect.signal.url');
    // A guessed /contact page must not be presented as discovered evidence.
    // Missing optional contact data should not discard a sourced account.
    prospect.contactUrl = prospect.contactUrl ? exact(prospect.contactUrl) : null;
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
