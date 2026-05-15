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
  logo_url: string | null;
  brand_color: string | null;
  billing_email: string | null;
  credit_nzd: number | string | null;
  is_active: boolean | null;
  status?: string | null;
  metadata: Record<string, unknown> | null;
};

const FALLBACK_BRAND = '#2B6B57';

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

export async function getPublicChatTenant(slug: string): Promise<PublicChatTenant> {
  const service = getServiceClient();
  const { data } = await service
    .from('tenants')
    .select('id,slug,name,kete_primary,logo_url,brand_color,billing_email,credit_nzd,is_active,status,metadata')
    .eq('slug', slug)
    .maybeSingle();

  if (!data) notFound();
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
    logoUrl: tenant.logo_url,
    brandColor: normaliseBrandColor(tenant.brand_color ?? metadata.brand_color),
    contactEmail:
      tenant.billing_email ??
      (typeof metadata.contact_email === 'string' ? metadata.contact_email : null),
    creditNzd: Number(tenant.credit_nzd ?? 0),
  };
}
