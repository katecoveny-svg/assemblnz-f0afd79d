import { AuthHeader } from '@/components/site/AuthHeader';
import { AuthFooter } from '@/components/site/AuthFooter';

/**
 * Auth layout for /start/signup — same canon chrome as /login. The global
 * SiteHeader/SiteFooter are suppressed on this route (see site-header.tsx →
 * isAuthSurface). The parent /start keeps the standard site chrome.
 */
export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <div className="flex-1">{children}</div>
      <AuthFooter />
    </div>
  );
}
