import type { ReactNode } from 'react';
import OpsLayout from '@/app/customers/[slug]/ops/layout';

/**
 * The Happy Tails reference build lives on a static route
 * (app/customers/happy-tails/ops/page.tsx), which means the dynamic
 * [slug]/ops/layout.tsx does NOT apply to it — Next.js layouts only cascade
 * within their own route branch. Without this file the reference page
 * rendered bare: no OpsShell chrome, no BrandThemeProvider, so every
 * `var(--brand-*)` colour resolved to nothing and the page washed out.
 *
 * Reuse the slug layout verbatim with the slug pinned.
 */
export default function HappyTailsOpsLayout({ children }: { children: ReactNode }) {
  return <OpsLayout params={Promise.resolve({ slug: 'happy-tails' })}>{children}</OpsLayout>;
}
