import type { Metadata } from 'next';
import Link from 'next/link';
import { WIDGET_PRODUCTS, widgetSpec } from '@/lib/living';
import '../living.css';

export const metadata: Metadata = {
  title: 'Product widgets — assembl / living',
  robots: { index: false, follow: false },
};

const SNIPPET = `<div id="assembl-widget"></div>
<script src="https://shop.assembl.co.nz/living/widget.js"
  data-handle="{{ product.handle }}"
  data-mount="#assembl-widget" async></script>`;

/** Index of every product widget, with the store embed snippet. Not linked from the storefront. */
export default function WidgetIndexPage() {
  const groups = new Map<string, typeof WIDGET_PRODUCTS>();
  for (const p of WIDGET_PRODUCTS) groups.set(p.type, [...(groups.get(p.type) ?? []), p]);
  return (
    <div className="lv">
      <div className="lv-wrap" style={{ padding: '3rem 0' }}>
        <p className="lv-eyebrow">assembl / living · product widgets</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>one product, made yours</h1>
        <p className="lv-lede" style={{ marginTop: '0.8rem' }}>Each widget offers the product’s real choices from the parts manifest and hands a typed item to the store page. Embed it in a Shopify product page with one Custom Liquid block:</p>
        <pre className="lv-mono" style={{ whiteSpace: 'pre-wrap', background: 'var(--lv-chalk)', padding: '1rem 1.2rem', borderRadius: 14, marginTop: '1rem', textTransform: 'none', letterSpacing: 0 }}>{SNIPPET}</pre>
        <p className="lv-small" style={{ marginTop: '0.6rem' }}>Guide: <code>docs/living/WIDGET-EMBED.md</code>. Nothing here sells anything; purchasing remains the store’s decision.</p>
        {[...groups.entries()].map(([type, products]) => (
          <section key={type} style={{ marginTop: '2.2rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>{type}</h2>
            <div className="lv-grid lv-grid-3">
              {products.map((p) => {
                const spec = widgetSpec(p.handle)!;
                return (
                  <Link key={p.handle} href={`/living/widget/${p.handle}`} className="lv-card">
                    <h3>{p.title}</h3>
                    <p className="lv-small">{p.blurb}</p>
                    <p className="lv-mono">{spec.colours.length} colours{spec.choices.length ? ` · ${spec.choices.map((c) => c.label.toLowerCase()).join(' · ')}` : ''}{p.personalised ? ' · personalised' : ''}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
