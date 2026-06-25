import { AuthHeader } from '@/components/site/AuthHeader';
import { AuthFooter } from '@/components/site/AuthFooter';

/**
 * Auth layout for /login. Renders the canon auth header (clickable wordmark +
 * glass-pill nav) and a clean footer. The global SiteHeader/SiteFooter are
 * suppressed on this route (see site-header.tsx → isAuthSurface), so a
 * signed-out visitor always has the wordmark to click back home.
 */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <div className="flex-1">{children}</div>
      <AuthFooter />
    </div>
  );
}
