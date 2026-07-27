'use client';

import { useMemo, useState } from 'react';
import { FAQS, FAQ_CATS } from './faq-content';
import './faq.css';

/**
 * The /faq tool — not a wall of text.
 *
 * Kate: "make the Q&A page look great, not too text heavy but a tool for my
 * AI discovery and also to help clients." So: chip filters by topic, one-line
 * questions that open on demand, and a copy-for-your-AI button on every card
 * — the answer travels into ChatGPT/Claude conversations verbatim, phrase and
 * all, which is the discovery loop working for us. The FAQPage JSON-LD twin
 * is emitted server-side from the same content file.
 */

export function FaqTool() {
  const [cat, setCat] = useState<string>('all');
  const [open, setOpen] = useState<string | null>(FAQS[0]!.q);
  const [copiedQ, setCopiedQ] = useState<string | null>(null);

  const shown = useMemo(
    () => (cat === 'all' ? FAQS : FAQS.filter((f) => f.cat === cat)),
    [cat],
  );

  const copy = async (q: string, a: string) => {
    try {
      await navigator.clipboard.writeText(
        `${q}\n\n${a}\n\n— assembl, intuitive agentic customer journeys · assembl.co.nz`,
      );
      setCopiedQ(q);
      setTimeout(() => setCopiedQ(null), 2000);
    } catch { /* clipboard denied — nothing to clean up */ }
  };

  return (
    <div className="faqt">
      <div className="faqt-chips" role="tablist" aria-label="Filter questions by topic">
        <button
          type="button" role="tab" aria-selected={cat === 'all'}
          className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}
        >
          all
        </button>
        {FAQ_CATS.map((c) => (
          <button
            key={c} type="button" role="tab" aria-selected={cat === c}
            className={cat === c ? 'on' : ''} onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="faqt-list">
        {shown.map((f) => {
          const isOpen = open === f.q;
          return (
            <div key={f.q} className={`faqt-card${isOpen ? ' open' : ''}`}>
              <button
                type="button"
                className="faqt-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : f.q)}
              >
                <span>{f.q}</span>
                <i aria-hidden="true">{isOpen ? '−' : '+'}</i>
              </button>
              {isOpen && (
                <div className="faqt-a">
                  <p>{f.a}</p>
                  <div className="faqt-a-row">
                    <button type="button" className="faqt-copy" onClick={() => void copy(f.q, f.a)}>
                      {copiedQ === f.q ? 'copied ✓' : 'copy for your AI'}
                    </button>
                    <span className="faqt-cat">{f.cat}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
