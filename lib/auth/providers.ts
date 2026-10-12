import 'server-only';
export type SocialProvider = 'google' | 'apple';
export type ProviderStatus = Record<SocialProvider, boolean>;
const unavailable: ProviderStatus = { google: false, apple: false };
/** Read only public provider booleans; never retrieve management secrets. */
export async function getConfiguredAuthProviders(): Promise<ProviderStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { ...unavailable };
  try {
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key }, cache: 'no-store', signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return { ...unavailable };
    const settings = await response.json();
    return { google: settings.external?.google === true, apple: settings.external?.apple === true };
  } catch { return { ...unavailable }; }
}
/** Explicit release gates attest provider callback/account checks have passed. */
export async function getReadyAuthProviders(): Promise<ProviderStatus> {
  if (process.env.AUTH_GOOGLE_VERIFIED !== '1' && process.env.AUTH_APPLE_VERIFIED !== '1') return { ...unavailable };
  const configured = await getConfiguredAuthProviders();
  return {
    google: configured.google && process.env.AUTH_GOOGLE_VERIFIED === '1',
    apple: configured.apple && process.env.AUTH_APPLE_VERIFIED === '1',
  };
}
