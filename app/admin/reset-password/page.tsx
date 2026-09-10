import { palette } from '@assembl/canvas/tokens';
import { createClient } from '@/lib/supabase/server';
import { AdminResetPasswordForm } from './AdminResetPasswordForm';

/**
 * /admin/reset-password — set a new operator password after a recovery email.
 * Outside the (hub) group so ensureAdmin does not gate the form before the
 * password is saved. Requires a session from /auth/confirm.
 */

export const metadata = {
  title: 'set password — assembl operator',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminResetPasswordPage() {
  let hasSession = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasSession = Boolean(user);
  } catch {
    hasSession = false;
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
      <AdminResetPasswordForm hasSession={hasSession} />
    </div>
  );
}
