import type { Hub } from '@/components/client-hub-migration/original/lib/pursuit-hub';

const scenarioArtwork: Record<string, readonly string[]> = {
  grocery: ['/cinematic/nadir-grocery.jpg', '/cinematic/foodstuffs-aerial.jpg'],
  travel: ['/cinematic/nadir-travel.jpg', '/cinematic/concept-travel.webp'], trade: ['/cinematic/nadir-trade.jpg'],
  manufacturing: ['/cinematic/nadir-manufacturing.jpg'], government: ['/cinematic/nadir-government.jpg'],
  school: ['/cinematic/nadir-school.jpg'], village: ['/cinematic/nadir-village.jpg'], works: ['/cinematic/nadir-works.jpg'],
};

// Relevance/provenance is separate from access: this policy never grants media
// access or asserts branding approval. Server owner/recipient checks still apply.
export function hubArtworkPolicy(hub: Pick<Hub, 'engine' | 'design'>) {
  const sector = hub.engine?.sector || 'custom';
  const src = hub.design.frame.artwork?.src || '';
  const interviewId=hub.engine?.selected||'';
  const expected=interviewId==='interview-deloitte'?'/cinematic/interview-cloud.svg':interviewId==='interview-deloitte-role-pack'?'/cinematic/interview-research.svg':['interview-pwc','interview-deloitte-discovery'].includes(interviewId)?'/cinematic/interview-advisory.svg':'';
  if(expected&&src===expected)return {src,provenance:'scenario' as const,label:'Independent illustrative workflow · 0 checked sources'};
  if (/^\/api\/media\?id=[0-9a-f-]{36}$/.test(src))
    return { src, provenance: 'selected' as const, label: 'Selected visual · review for this brief' };
  if (sector !== 'custom' && scenarioArtwork[sector]?.includes(src))
    return { src, provenance: 'scenario' as const, label: 'Illustrative scenario · not an approved client asset' };
  return { src: '', provenance: 'prompt' as const, label: 'Visual direction required' };
}
