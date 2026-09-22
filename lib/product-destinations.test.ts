import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCT_DESTINATIONS, PURSUIT_SITE_ORIGIN } from './product-destinations';
import { PURSUIT_AGENT_BRIEF } from './pursuit/agent-brief';
import { nav } from './site-config';

describe('public product and private workspace destinations', () => {
  it('keeps public Pursuit navigation on the current main site', () => {
    expect(nav.find(item => item.label === 'Pursuit')?.href).toBe('/pursuit');
    expect(PURSUIT_AGENT_BRIEF.primaryCta.href).toBe('/pursuit#try-pursuit');
    expect(PRODUCT_DESTINATIONS.pursuit.example).toBe('/pursuit#website-outreach');
    for (const file of ['components/site/site-footer.tsx', 'components/do/DoSpatialScene.tsx', 'app/preview/do-world/World.tsx', 'app/agency/connections/AgencyConnectionsClient.tsx', 'middleware.ts']) {
      expect(readFileSync(file, 'utf8'), file).not.toContain(PURSUIT_SITE_ORIGIN);
    }
  });
  it('deep-links existing private work without changing its host', () => {
    expect(PRODUCT_DESTINATIONS.pursuit.hub).toBe(`${PURSUIT_SITE_ORIGIN}/studios`);
    expect(PURSUIT_AGENT_BRIEF.hub).toBe(PRODUCT_DESTINATIONS.pursuit.workspace);
    const published = JSON.parse(readFileSync('public/pursuit/agent-brief.json', 'utf8'));
    expect(published).toEqual(PURSUIT_AGENT_BRIEF);
    expect(published.hub).toBe(PURSUIT_AGENT_BRIEF.hub);
    expect(published.primaryCta.href).toBe(PURSUIT_AGENT_BRIEF.primaryCta.href);
    expect(PRODUCT_DESTINATIONS.studio.workspace).toBe(`${PURSUIT_SITE_ORIGIN}/agency`);
  });
});
