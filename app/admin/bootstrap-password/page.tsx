import { palette } from '@assembl/canvas/tokens';
import {
  bootstrapSecretConfigured,
  founderEmailsForUi,
} from '@/lib/admin/bootstrap-password';
import { BootstrapPasswordForm } from './BootstrapPasswordForm';

/**
 * /admin/bootstrap-password — outside the (hub) gate.
 * One-time founder password set when magic-link SMTP is down.
 */

export const metadata = {
  title: 'founder password bootstrap — assembl operator',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AdminBootstrapPasswordPage() {
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
      <BootstrapPasswordForm
        secretConfigured={bootstrapSecretConfigured()}
        founderEmails={founderEmailsForUi()}
      />
    </div>
  );
}
