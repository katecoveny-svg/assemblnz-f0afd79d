import { afterEach, describe, expect, it, vi } from 'vitest';
import { outreachExport, parseOutreach, publicWebsite, reviewFingerprint, type OutreachCampaign } from './outreach';
import { TrialInput } from './public-contract';
import { runPublicResearch } from './public-research';

const campaign: OutreachCampaign = {
  seller: { name: 'Fixture seller', website: 'https://seller.example.com/', offer: 'A fictional service for testing only.' },
  market: 'Fictional New Zealand businesses',
  prospects: [{ company: 'Fixture buyer', website: 'https://buyer.example.com/', buyerRole: 'Operations manager',
    signal: { claim: 'Fictional published service announcement for this test.', url: 'https://buyer.example.com/news', publishedAt: null },
    fit: 'Their published service may fit the seller offer.', hypothesis: 'Could a short demonstration help their team?', proof: 'Propose a small walkthrough for review.', contactUrl: null,
    unknowns: ['No buyer, budget or contact permission established.'], subject: 'A proposed service walkthrough', opening: 'Your announcement describes a new service. Would a short walkthrough be useful?', followUp: 'Possible later follow-up: would a one-page outline help?' }],
  gaps: ['Contact verification and permission to send are outstanding.'],
};
const urls = ['https://seller.example.com/', 'https://buyer.example.com/', 'https://buyer.example.com/news'];
const draft = { company: 'Fixture seller', title: 'A proposed market approach', summary: 'A fictional source-backed opportunity prepared for testing.', evidence: [{ claim: 'The fictional seller describes a service.', url: urls[0] }], opportunity: 'Propose a source-linked conversation with a relevant business.', proposedWork: 'Prepare an independent walkthrough for a reviewer.', deliverables: ['A research brief', 'A proposed walkthrough'], nextSteps: ['Review the source evidence', 'Confirm the buyer role'], unknowns: ['No demand has been established.'] };
const input = { requestId: '72b1797b-420a-4c56-a6bf-cf74832c948e', company: urls[0], goal: 'Find relevant businesses for a service pilot.', consent: true as const, useTypeSafe: false, workflow: 'website_outreach' as const };
afterEach(() => vi.unstubAllEnvs());
describe('website-led outreach boundaries', () => {
  it('requires a public seller website and consent without changing legacy company research', () => {
    expect(TrialInput.safeParse(input).success).toBe(true);
    expect(TrialInput.safeParse({ ...input, company: 'some business' }).success).toBe(false);
    expect(TrialInput.safeParse({ ...input, consent: false }).success).toBe(false);
    const { workflow: _, ...legacy } = input;
    expect(TrialInput.safeParse({ ...legacy, company: 'NZ Post' }).success).toBe(true);
  });
  it('rejects local, credential-bearing, numeric and unsafe websites', () => {
    for (const url of ['http://seller.com', 'https://127.0.0.1', 'https://[::1]', 'https://user:pw@seller.com', 'https://service.local', 'https://service.internal', 'javascript:alert(1)']) expect(publicWebsite(url)).toBeNull();
    expect(publicWebsite('seller.co.nz')).toBe('https://seller.co.nz/');
  });
  it('requires every company, signal and contact link to have a returned source', () => {
    expect(parseOutreach(campaign, urls, input.company).prospects).toHaveLength(1);
    expect(() => parseOutreach(campaign, urls.slice(0, 2), input.company)).toThrow('untraced_outreach_source');
    const changed = structuredClone(campaign); changed.prospects[0].contactUrl = 'https://buyer.example.com/contact';
    expect(() => parseOutreach(changed, urls, input.company)).toThrow('untraced_outreach_source');
  });
  it('rejects substituted sellers and duplicate prospect domains', () => {
    expect(() => parseOutreach(campaign, urls, 'https://different.example.com')).toThrow('seller_website_mismatch');
    const changed = structuredClone(campaign); changed.prospects.push(changed.prospects[0]);
    expect(() => parseOutreach(changed, urls, input.company)).toThrow('duplicate_outreach_account');
  });
  it('permits an honest empty shortlist and unknown dates', () => {
    expect(parseOutreach({ ...campaign, prospects: [] }, urls, input.company).prospects).toEqual([]);
    expect(parseOutreach(campaign, urls, input.company).prospects[0].signal.publishedAt).toBeNull();
  });
  it('binds review to the exact copy, prospect and research receipt', () => {
    const p = campaign.prospects[0]; const copy = { subject: p.subject, opening: p.opening, followUp: p.followUp };
    const initial = reviewFingerprint('receipt-a', p, copy);
    expect(reviewFingerprint('receipt-a', p, { ...copy, opening: 'Edited message' })).not.toBe(initial);
    expect(reviewFingerprint('receipt-b', p, copy)).not.toBe(initial);
    expect(reviewFingerprint('receipt-a', { ...p, company: 'Another account' }, copy)).not.toBe(initial);
    const exported = outreachExport(campaign, p, copy, 'receipt-a', '2026-09-22');
    expect(exported).toContain(p.signal.url); expect(exported).toContain('NOT SENT'); expect(exported).toContain('Unknown; do not infer urgency');
  });
  it('runs website research through the existing bounded provider and returns campaign provenance', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'fixture-only');
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ stop_reason: 'end_turn', content: [
      { type: 'server_tool_use', name: 'web_search' },
      { type: 'web_search_tool_result', content: urls.map(url => ({ type: 'web_search_result', url, title: 'Fixture source' })) },
      { type: 'text', text: JSON.stringify({ draft, campaign }) },
    ], usage: { input_tokens: 100, output_tokens: 100 } }), { status: 200 }));
    const result = await runPublicResearch(input, false, fetcher);
    expect(result.campaign?.prospects).toHaveLength(1); expect(result.trace.sources).toHaveLength(3);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const request = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(request.tools[0].max_uses).toBe(5); expect(request.system).toContain('SELLER');
  });
  it('does not substitute leads after a provider failure', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'fixture-only');
    await expect(runPublicResearch(input, false, vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 503 })))).rejects.toThrow('research_provider_http_503');
  });
});

describe('outreach formatting repair', () => {
  const researched = (value: unknown, extraUrls: string[] = []) => Response.json({ stop_reason: 'end_turn', content: [
    { type: 'server_tool_use', name: 'web_search' },
    { type: 'web_search_tool_result', content: [...urls, ...extraUrls].map(url => ({ type: 'web_search_result', url, title: 'Fixture source' })) },
    { type: 'text', text: JSON.stringify(value) },
  ] });
  it('repairs an overlong campaign once without starting another search', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'fixture-only');
    const long = structuredClone(campaign); long.prospects[0].opening = 'A'.repeat(1300);
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(researched({ draft, campaign: long }))
      .mockResolvedValueOnce(Response.json({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ draft, campaign }) }] }));
    const result = await runPublicResearch(input, false, fetcher);
    expect(result.campaign).toEqual(campaign);
    expect(result.trace.providerCalls).toBe(2);
    expect(result.trace.webSearches).toBe(1);
    const formatting = JSON.parse(String(fetcher.mock.calls[1][1]?.body));
    expect(formatting.tools).toBeUndefined();
    expect(formatting.output_config.format.schema.properties.campaign).toBeDefined();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('rejects a new source inserted during formatting even if search returned it', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'fixture-only');
    const long = structuredClone(campaign); long.prospects[0].opening = 'A'.repeat(1300);
    const altered = structuredClone(campaign); altered.prospects[0].contactUrl = 'https://buyer.example.com/contact';
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(researched({ draft, campaign: long }, [altered.prospects[0].contactUrl!]))
      .mockResolvedValueOnce(Response.json({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ draft, campaign: altered }) }] }));
    await expect(runPublicResearch(input, false, fetcher)).rejects.toThrow('untraced_source');
  });
});
