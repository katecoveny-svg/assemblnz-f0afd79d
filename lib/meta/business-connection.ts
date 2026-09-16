/**
 * Client helpers for the Meta Business OAuth surface.
 * Tokens never leave the edge function — UI only sees metadata + meta_connection_id.
 */

export type MetaCapability = {
  pursuit_read?: boolean;
  studio_organic_publish?: boolean;
  paid_activation?: boolean;
};

export type MetaConnectionStatus = {
  connected: boolean;
  expiring?: boolean;
  meta_connection_id?: string;
  id?: string;
  business_id?: string | null;
  business_name?: string | null;
  page_id?: string | null;
  page_name?: string | null;
  instagram_id?: string | null;
  instagram_username?: string | null;
  ad_account_id?: string | null;
  ad_account_name?: string | null;
  scopes?: string[] | null;
  status?: string;
  capability?: MetaCapability | null;
  token_expires_at?: string | null;
  last_verified_at?: string | null;
  last_error?: string | null;
  error?: string;
};

export type MetaAssetOption = {
  id: string;
  name: string;
  meta?: Record<string, string | null>;
};

export type MetaAssetsResponse = {
  meta_connection_id: string;
  selected: {
    business_id: string | null;
    page_id: string | null;
    instagram_id: string | null;
    ad_account_id: string | null;
  };
  businesses: MetaAssetOption[];
  pages: MetaAssetOption[];
  instagram: MetaAssetOption[];
  ad_accounts: MetaAssetOption[];
  error?: string;
};

export type MetaAssetSelection = {
  meta_connection_id: string;
  business_id: string | null;
  business_name: string | null;
  page_id: string | null;
  page_name: string | null;
  instagram_id: string | null;
  instagram_username: string | null;
  ad_account_id: string | null;
  ad_account_name: string | null;
};

function functionsBase(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Supabase URL is not configured');
  return `${url.replace(/\/$/, '')}/functions/v1/meta-business`;
}

async function authHeaders(accessToken: string): Promise<HeadersInit> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function startMetaBusinessOAuth(
  accessToken: string,
  opts?: { organisationId?: string; redirectAfter?: string },
): Promise<{ auth_url: string }> {
  const params = new URLSearchParams();
  if (opts?.organisationId) params.set('organisation_id', opts.organisationId);
  if (opts?.redirectAfter) params.set('redirect_after', opts.redirectAfter);
  // Phase-1 optional insight scope — write scopes stay deferred.
  params.set('scopes', 'instagram_manage_insights');

  const response = await fetch(
    `${functionsBase()}/start?${params.toString()}`,
    { method: 'GET', headers: await authHeaders(accessToken) },
  );
  const payload = (await response.json()) as { auth_url?: string; error?: string };
  if (!response.ok || !payload.auth_url) {
    throw new Error(payload.error ?? 'Could not start Meta Business connection');
  }
  return { auth_url: payload.auth_url };
}

export async function fetchMetaConnectionStatus(
  accessToken: string,
): Promise<MetaConnectionStatus> {
  const response = await fetch(`${functionsBase()}/status`, {
    method: 'GET',
    headers: await authHeaders(accessToken),
    cache: 'no-store',
  });
  const payload = (await response.json()) as MetaConnectionStatus;
  if (!response.ok) {
    throw new Error(payload.error ?? 'Could not load Meta connection status');
  }
  return payload;
}

export async function fetchMetaAssets(
  accessToken: string,
  opts?: { businessId?: string | null; pageId?: string | null },
): Promise<MetaAssetsResponse> {
  const params = new URLSearchParams();
  if (opts?.businessId) params.set('business_id', opts.businessId);
  if (opts?.pageId) params.set('page_id', opts.pageId);

  const response = await fetch(
    `${functionsBase()}/assets?${params.toString()}`,
    { method: 'GET', headers: await authHeaders(accessToken), cache: 'no-store' },
  );
  const payload = (await response.json()) as MetaAssetsResponse;
  if (!response.ok) {
    throw new Error(payload.error ?? 'Could not load Meta assets');
  }
  return payload;
}

export async function saveMetaAssetSelection(
  accessToken: string,
  selection: MetaAssetSelection,
): Promise<{ ok: boolean; meta_connection_id: string }> {
  const response = await fetch(`${functionsBase()}/assets`, {
    method: 'POST',
    headers: await authHeaders(accessToken),
    body: JSON.stringify(selection),
  });
  const payload = (await response.json()) as {
    ok?: boolean;
    meta_connection_id?: string;
    error?: string;
  };
  if (!response.ok || !payload.meta_connection_id) {
    throw new Error(payload.error ?? 'Could not save Meta assets');
  }
  return { ok: true, meta_connection_id: payload.meta_connection_id };
}

export function sharedMetaConnectionId(
  status: MetaConnectionStatus | null | undefined,
): string | null {
  return status?.meta_connection_id ?? status?.id ?? null;
}
