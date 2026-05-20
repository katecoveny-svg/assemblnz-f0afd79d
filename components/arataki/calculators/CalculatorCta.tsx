import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CalculatorCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-[8px] border border-[#2B6B57]/35 bg-[#2B6B57]/8 px-4 py-3 text-sm font-medium text-[#2B6B57] transition hover:border-[#2B6B57] hover:bg-[#2B6B57] hover:text-[#FAF7F2]"
    >
      {children} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
