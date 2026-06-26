import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Shared chrome for the Arataki operator overlay. Adds a slim back-to-
 * marketplace bar above every Arataki tool (loan-cars, service-match, …) so an
 * operator who arrived from /agents/arataki always has a way home. Canon
 * palette — paper ground, Space Mono eyebrow, canary accent — to match the
 * tool surfaces below it. Structure of each tool page is untouched.
 */
export default function AratakiOperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="border-b border-[rgba(61,66,80,0.12)] bg-[color:var(--assembl-paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8 lg:px-10">
          <Link
            href="/agents/arataki"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3D4250] transition hover:text-[#C79B1F]"
          >
            <ArrowLeft size={15} aria-hidden /> Back to the marketplace
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9D8C7D]">
            assembl · Arataki operator
          </span>
        </div>
      </nav>
      {children}
    </div>
  );
}
