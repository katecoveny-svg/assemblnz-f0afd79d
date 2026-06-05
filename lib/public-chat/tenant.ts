import 'server-only';
import { notFound } from 'next/navigation';
import { getKete, type KeteSlug } from '@/lib/kete';
import { getServiceClient } from '@/lib/supabase/service';

export type PublicChatTenant = {
  id: string;
  slug: string;
  name: string;
  kete: KeteSlug;
  keteName: string;
  keteDomain: string;
  logoUrl: string | null;
  brandColor: string;
  contactEmail: string | null;
  creditNzd: number;
};

type TenantRow = {
  id: string;
  slug: string | null;
  name: string;
  kete_primary: string | null;
  brand_color: string | null;
  billing_email: string | null;
  is_active: boolean | null;
  status?: string | null;
  metadata: Record<string, unknown> | null;
};

const FALLBACK_BRAND = '#2B6B57';
const FALLBACK_TENANT_ID = '00000000-0000-0000-0000-000000000000';

export function isKeteSlug(value: unknown): value is KeteSlug {
  return (
    value === 'waihanga' ||
    value === 'manaaki' ||
    value === 'pikau' ||
    value === 'arataki' ||
    value === 'auaha' ||
    value === 'ako' ||
    value === 'matauranga' ||
    value === 'hoko' ||
    value === 'toro'
  );
}

function normaliseBrandColor(value: unknown): string {
  if (typeof value !== 'string') return FALLBACK_BRAND;
  const trimmed = value.trim();
  return /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed : FALLBACK_BRAND;
}

function tenantIsPubliclyActive(row: TenantRow): boolean {
  if (row.is_active === false) return false;
  if (!row.status) return true;
  return ['active', 'provisioned', 'trial'].includes(row.status);
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function optionalNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function fallbackTenant(slug: string): PublicChatTenant | null {
  if (!isKeteSlug(slug)) return null;
  const kete = getKete(slug);
  return {
    id: FALLBACK_TENANT_ID,
    slug,
    name: slug === 'toro' ? 'Tōro Whānau' : kete.name,
    kete: slug,
    keteName: kete.name,
    keteDomain: kete.industry,
    logoUrl: null,
    brandColor: slug === 'toro' ? FALLBACK_BRAND : kete.accent,
    contactEmail: 'hello@assembl.co.nz',
    creditNzd: 0,
  };
}

export async function getPublicChatTenant(slug: string): Promise<PublicChatTenant> {
  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch (error) {
    console.error('public chat service client unavailable', {
      slug,
      message: error instanceof Error ? error.message : String(error),
    });
    const fallback = fallbackTenant(slug);
    if (fallback) return fallback;
    notFound();
  }

  const { data, error } = await service
    .from('tenants')
    .select('id,slug,name,kete_primary,brand_color,billing_email,is_active,status,metadata')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('public chat tenant lookup failed', { slug, message: error.message });
    const fallback = fallbackTenant(slug);
    if (fallback) return fallback;
    notFound();
  }
  if (!data) {
    const fallback = fallbackTenant(slug);
    if (fallback) return fallback;
    notFound();
  }
  const tenant = data as TenantRow;
  if (!tenant.slug || !tenantIsPubliclyActive(tenant)) notFound();

  const metadata = tenant.metadata ?? {};
  const metadataKete = metadata.kete_primary ?? metadata.kete;
  const kete = isKeteSlug(tenant.kete_primary)
    ? tenant.kete_primary
    : isKeteSlug(metadataKete)
      ? metadataKete
      : 'waihanga';
  const keteDef = getKete(kete);

  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    kete,
    keteName: keteDef.name,
    keteDomain: keteDef.industry,
    logoUrl: optionalString(metadata.logo_url),
    brandColor: normaliseBrandColor(tenant.brand_color ?? metadata.brand_color),
    contactEmail:
      tenant.billing_email ??
      (typeof metadata.contact_email === 'string' ? metadata.contact_email : null),
    creditNzd: optionalNumber(metadata.credit_nzd),
  };
}
