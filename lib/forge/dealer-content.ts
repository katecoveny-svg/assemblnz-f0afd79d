import { z } from 'zod';

export const DEALER_MARQUES = ['Subaru', 'Toyota', 'Ford', 'Mazda', 'Hyundai', 'Kia', 'Mitsubishi', 'Volkswagen', 'Audi', 'BMW', 'Mercedes-Benz', 'Other'] as const;
export const CAMPAIGN_TYPES = ['Vehicle introduction', 'Test drive', 'Service reminder', 'Owner invitation'] as const;
export const dealerBriefSchema = z.object({
  marque: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1, 'Add a vehicle model.').max(80),
  dealership: z.string().trim().min(1).max(100),
  location: z.string().trim().max(80),
  campaign: z.enum(CAMPAIGN_TYPES),
  facts: z.string().trim().min(1, 'Add the facts this campaign can use.').max(2000),
  contact: z.string().trim().max(200),
  reviewer: z.string().trim().min(1).max(80),
});
export type DealerBrief = z.infer<typeof dealerBriefSchema>;
export const dealerPackSchema = z.object({
  headline: z.string().min(1).max(140),
  social: z.string().min(1).max(2400),
  listing: z.string().min(1).max(2400),
  email: z.string().min(1).max(2400),
  script: z.string().min(1).max(2400),
});
export type DealerPack = z.infer<typeof dealerPackSchema>;
export type DealerChannel = Exclude<keyof DealerPack, 'headline'>;
export const DEALER_CHANNELS: { id: DealerChannel; label: string }[] = [
  { id: 'social', label: 'Social' }, { id: 'listing', label: 'Listing' },
  { id: 'email', label: 'Email' }, { id: 'script', label: '15s script' },
];

/** No specifications, price, stock, offer or availability is inferred by the template. */
export function buildDealerTemplate(b: DealerBrief): DealerPack {
  const vehicle = `${b.marque} ${b.model}`;
  const place = b.location ? ` in ${b.location}` : '';
  const lines = b.facts.split(/\n/).map(s => s.trim()).filter(Boolean);
  const facts = lines.join('\n');
  const action = b.campaign === 'Service reminder' ? 'Ask our team about a service appointment.'
    : b.campaign === 'Owner invitation' ? 'Talk with our team about your next ownership step.'
      : b.campaign === 'Test drive' ? 'Ask our team to arrange a test drive.'
        : 'Contact our team for the details.';
  const headline = b.campaign === 'Service reminder' ? `Your ${vehicle}. Its next service.`
    : b.campaign === 'Owner invitation' ? `More from your ${vehicle}.`
      : b.campaign === 'Test drive' ? `Meet the ${vehicle}.` : `${vehicle}. A closer look.`;
  const contact = b.contact ? `\n${b.contact}` : '';
  return {
    headline,
    social: `${headline}\n\n${facts}\n\n${action}\n${b.dealership}${place}.${contact}`,
    listing: `${vehicle}\n${b.dealership}${place}\n\n${facts}\n\n${action}${contact}`,
    email: `Subject: ${headline}\n\nHello,\n\nA closer look at the ${vehicle} from ${b.dealership}${place}.\n\n${facts}\n\n${action}${contact}\n\n${b.dealership}`,
    script: `0–3s · Open on the actual ${vehicle}.\nOn screen: “${headline}”\n\n3–9s · Show details supported by these supplied facts:\n${facts}\n\n9–12s · Hold on the vehicle.\nOn screen: “${b.dealership}${place}”\n\n12–15s · Close with: “${action}”${contact}\n\nUse approved vehicle footage. Check every on-screen claim before production.`,
  };
}

export function dealerPackText(brief: DealerBrief, pack: DealerPack, origin: string): string {
  return `# ${brief.marque} ${brief.model} · campaign draft\n\nPrepared for: ${brief.reviewer}\nMethod: ${origin}\nStatus: draft for human review; nothing published\n\n## Supplied facts\n${brief.facts}\n\n## Headline\n${pack.headline}\n\n${DEALER_CHANNELS.map(c => `## ${c.label}\n${pack[c.id]}`).join('\n\n')}\n`;
}
