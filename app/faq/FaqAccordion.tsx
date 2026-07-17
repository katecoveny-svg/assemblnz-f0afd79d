'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { Faq } from './faq-content';

/** An expand/collapse accordion — first item open, one open at a time. */
export function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="mx-auto max-w-3xl">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="border-t border-[rgba(49,60,66,0.12)] last:border-b">
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="text-lg font-medium text-[#313c42] md:text-xl">{f.q}</span>
                <span
                  aria-hidden
                  className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-[rgba(63,115,115,0.35)] text-[#3f7373] transition-transform"
                  style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
                >
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
            </h3>
            <div
              className="grid transition-all duration-300 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-7 text-base leading-relaxed text-[#5a6b6f] md:text-[17px]">
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
