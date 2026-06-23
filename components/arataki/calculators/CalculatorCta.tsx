import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CalculatorCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-[8px] border border-[#3A3832]/35 bg-[#3A3832]/8 px-4 py-3 text-sm font-medium text-[#3A3832] transition hover:border-[#3A3832] hover:bg-[#3A3832] hover:text-[#FFF7EC]"
    >
      {children} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
