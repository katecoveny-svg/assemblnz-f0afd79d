import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AGENTS, FLEET_AGENT_SLUGS_BY_KETE, agentBySlug } from '@/lib/agents';
import { INDUSTRY_KETES, KETES, WHANAU_KETE, type KeteSlug } from '@/lib/kete';

const root = process.cwd();

describe('Industry Pack smoke contracts', () => {
  it('keeps the canon at 8 industry kete plus Tōro', () => {
    expect(KETES.map((kete) => kete.slug)).toEqual([
      'waihanga',
      'manaaki',
      'pikau',
      'arataki',
      'auaha',
      'ako',
      'matauranga',
      'hoko',
      'toro',
    ]);
    expect(INDUSTRY_KETES).toHaveLength(8);
    expect(INDUSTRY_KETES.map((kete) => kete.slug)).not.toContain('toro');
    expect(WHANAU_KETE.slug).toBe('toro');
  });

  it('keeps every industry kete fleet resolvable and operator-ready', () => {
    for (const kete of INDUSTRY_KETES) {
      const fleet = FLEET_AGENT_SLUGS_BY_KETE[kete.slug];
      expect(fleet.length).toBeGreaterThanOrEqual(6);
      expect(fleet).toContain('iho');
      expect(fleet).toContain('signal');
      for (const slug of fleet) {
        expect(agentBySlug(slug), `${kete.slug}/${slug}`).toBeDefined();
      }
    }

    const agentSlugs = new Set(AGENTS.map((agent) => agent.slug));
    expect(agentSlugs.size).toBe(AGENTS.length);
  });

  it('keeps /start locked to the flat Industry Pack offer and no customer-facing AI copy', () => {
    const source = readFileSync(join(root, 'app/start/page.tsx'), 'utf8');
    expect(source).toContain('NZ$3,500/mo + GST');
    expect(source).toContain('No setup fee');
    expect(source).toContain('/start/signup?kete=');
    expect(source).not.toMatch(/\bAI\b/i);
  });

  it('keeps tenant RLS isolation helpers and member-scoped policies present', () => {
    const tenantMigration = readFileSync(
      join(root, 'supabase/migrations/20260508204928_toro_tenants.sql'),
      'utf8',
    );
    expect(tenantMigration).toContain('public.is_tenant_member');
    expect(tenantMigration).toContain('tenants_select_members');
    expect(tenantMigration).toContain('tenant_members_select_members');
    expect(tenantMigration).toContain('using (public.is_tenant_member(id))');
    expect(tenantMigration).toContain('using (public.is_tenant_member(tenant_id))');
  });

  it('keeps draft transition audit rows tenant-scoped and client-write denied', () => {
    const transitionMigration = readFileSync(
      join(root, 'supabase/migrations/20260511120000_toro_draft_transitions.sql'),
      'utf8',
    );
    expect(transitionMigration).toContain('tenant_id       uuid not null');
    expect(transitionMigration).toContain('tenant members read draft transitions');
    expect(transitionMigration).toContain('using (public.is_tenant_member(tenant_id))');
    expect(transitionMigration).toContain('Deliberately NO insert / update / delete policy');
  });

  it('keeps checkout authenticated and subscription-mode before Stripe handoff', () => {
    const checkout = readFileSync(
      join(root, 'supabase/functions/create-checkout/index.ts'),
      'utf8',
    );
    expect(checkout).toContain('auth.getUser');
    expect(checkout).toContain('priceId');
    expect(checkout).toContain('mode: "subscription"');
    expect(checkout).toContain('stripe.checkout.sessions.create');
  });

  it('keeps all industry kete represented in the fleet map', () => {
    const fleetKeys = Object.keys(FLEET_AGENT_SLUGS_BY_KETE) as KeteSlug[];
    for (const kete of INDUSTRY_KETES) {
      expect(fleetKeys).toContain(kete.slug);
    }
  });
});
