/**
 * consent.before_draft — Home Assistant-style per-entity consent gate.
 *
 * For each entity_type the draft will need (parsed from the
 * dispatched skill's metadata when available; otherwise stub to
 * ['child_profile','calendar']), confirm a matching active grant
 * exists in `toro_consent_grants` for the (tenant_id, skill_slug,
 * entity_type) tuple.
 *
 * Two-tier lookup:
 *   1. fast path — `ctx.consentGrants` is already populated by the
 *      caller (recommended; the runtime batch-loads grants for the
 *      tenant once per request).
 *   2. fallback — query Supabase directly. Only fires when the
 *      caller didn't pre-load. Keeps the filter usable in tests
 *      and one-off contexts.
 *
 * Returns pass=false with `reason: "consent_missing: <entity_type>"`
 * on the FIRST missing grant. The reason format is the contract
 * the inbox UI matches on for its "[grant required]" CTA.
 */
import type { Filter, FilterContext, FilterResult, ConsentGrant } from './types';
import { createClient } from '@/lib/supabase/server';

// Fallback when a skill doesn't declare its required entity types.
// Most Tōro skills touch one or both of these, so they're a safe default.
const DEFAULT_REQUIRED_ENTITY_TYPES = ['child_profile', 'calendar'];

export const consentBeforeDraft: Filter = {
  name: 'consent_before_draft',
  phase: 'before_draft',
  async run(ctx: FilterContext): Promise<FilterResult> {
    const required = await resolveRequiredEntityTypes(ctx);
    const skillSlug = ctx.skillSlug ?? ctx.pluginSlug;

    const grants = ctx.consentGrants.length > 0
      ? ctx.consentGrants
      : await loadConsentGrantsFromDb(ctx.tenantId, skillSlug);

    const now = Date.now();

    for (const entityType of required) {
      const matched = grants.find((g) => isActiveGrantFor(g, entityType, skillSlug, now));
      if (!matched) {
        return {
          pass: false,
          reason: `consent_missing: ${entityType}`,
          receiptAddition: {
            consent_before: { status: 'missing', entity_type: entityType, skill: skillSlug },
          },
        };
      }
    }

    return {
      pass: true,
      receiptAddition: {
        consent_before: {
          status: 'all_granted',
          entity_types: required,
          skill: skillSlug,
        },
      },
    };
  },
};

function isActiveGrantFor(
  grant: ConsentGrant,
  entityType: string,
  skillSlug: string,
  nowMs: number,
): boolean {
  if (grant.entity_type !== entityType) return false;
  if (grant.skill_slug !== skillSlug) return false;
  if (grant.revoked_at !== null) return false;
  if (grant.expires_at) {
    const expiresAt = Date.parse(grant.expires_at);
    if (!Number.isNaN(expiresAt) && expiresAt <= nowMs) return false;
  }
  return true;
}

/**
 * Skills will eventually declare the entity types they need in their
 * frontmatter (something like `required_entities: [child_profile,
 * calendar, school_portal]`). Until that lands, this resolver
 * returns the default list. Wired through ctx.skillSlug so future
 * lookups can per-skill-cache.
 */
async function resolveRequiredEntityTypes(_ctx: FilterContext): Promise<string[]> {
  return [...DEFAULT_REQUIRED_ENTITY_TYPES];
}

async function loadConsentGrantsFromDb(
  tenantId: string,
  skillSlug: string,
): Promise<ConsentGrant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('toro_consent_grants')
    .select('entity_type, entity_id, skill_slug, granted_at, revoked_at, expires_at')
    .eq('tenant_id', tenantId)
    .eq('skill_slug', skillSlug)
    .is('revoked_at', null);

  if (error || !data) return [];
  return (data as ConsentGrant[]).filter((g) => {
    if (!g.expires_at) return true;
    const expiresAt = Date.parse(g.expires_at);
    return Number.isNaN(expiresAt) || expiresAt > Date.now();
  });
}
