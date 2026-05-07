import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'dashboard · assembl',
    template: '%s · dashboard · assembl',
  },
  // Dashboard pages are founder/admin-only — keep them out of search engines.
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[color:var(--assembl-paper)]">{children}</div>;
}
