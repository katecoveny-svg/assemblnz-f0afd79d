import { redirect } from 'next/navigation';
import { palette } from '@assembl/canvas/tokens';
import { createClient } from '@/lib/supabase/server';
import { AdminLoginForm } from './AdminLoginForm';

/**
 * /admin/login — operator sign-in, canvas-styled.
 *
 * Lives OUTSIDE the (hub) route group so ensureAdmin() never gates it (which
 * would loop unauthenticated visitors). Magic link is the primary path (Kate:
 * assembl@assembl.co.nz), password is the optional fast path once one is set
 * at /account/security. Sessions honour the existing 90-day
 * "stay signed in" policy (lib/supabase/session-policy.ts).
 *
 * Already-authenticated visitors are bounced straight into the hub — the
 * (hub) gate then decides whether they are actually an operator.
 */

export const metadata = {
  title: 'operator sign-in — assembl',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo =
    redirectParam && redirectParam.startsWith('/admin') ? redirectParam : '/admin';

  // Signed in already? Straight through — the hub gate handles authorisation.
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect(redirectTo);
  } catch (e) {
    // redirect() throws on purpose — rethrow it; anything else (missing env)
    // just means we render the form.
    if ((e as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) throw e;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: palette.paper,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        fontFamily: 'var(--font-body), Lato, system-ui, sans-serif',
        color: palette.ink,
      }}
    >
      <AdminLoginForm redirectTo={redirectTo} />
    </div>
  );
}
