'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function OAuthButtons({
  tenantId,
  slug,
}: {
  tenantId: string;
  slug: string;
}) {
  const supabase = createClient();
  const [busy, setBusy] = useState<'xero' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function connect(provider: 'xero' | 'google') {
    setBusy(provider);
    setError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Sign in again before connecting tools.');

      const functionName = provider === 'xero' ? 'xero-oauth-start' : 'oauth-initiate';
      const body =
        provider === 'xero'
          ? {
              tenant_id: tenantId,
              return_url: `/app/${slug}/onboarding?${provider}=connected`,
            }
          : {
              provider_code: 'google',
              organisation_id: tenantId,
              redirect_after: `/app/${slug}/onboarding?google=connected`,
            };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );
      const payload = (await response.json()) as { auth_url?: string; error?: string };
      if (!response.ok || !payload.auth_url) {
        throw new Error(payload.error ?? `Could not start ${provider} connection.`);
      }
      window.location.assign(payload.auth_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void connect('xero')}
        disabled={busy !== null}
        className="btn-ghost inline-flex h-11 w-full items-center justify-center px-5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy === 'xero' ? 'Opening Xero...' : 'Connect Xero'}
        <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => void connect('google')}
        disabled={busy !== null}
        className="btn-ghost inline-flex h-11 w-full items-center justify-center px-5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy === 'google' ? 'Opening Google...' : 'Connect Google Workspace'}
        <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
      </button>
      {error ? <p className="text-sm text-[#7A2519]">{error}</p> : null}
    </div>
  );
}
