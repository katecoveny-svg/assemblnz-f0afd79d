import type { Metadata } from 'next';
import Link from 'next/link';
import { AC02_HANDLE_PREFIX, LAB_HANDLE_PREFIX, WIDGET_KITS, WIDGET_LAB, WIDGET_PRODUCTS, WIDGET_PROTOTYPES, widgetSpec } from '@/lib/living';
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
  const groups = new Map<string, { handle: string; title: string; blurb: string; personalised: boolean }[]>();
  for (const p of WIDGET_PRODUCTS) groups.set(p.type, [...(groups.get(p.type) ?? []), { handle: p.handle, title: p.title, blurb: p.blurb, personalised: p.personalised }]);
  for (const k of WIDGET_KITS) {
    const type = k.collection === 'dayrally' ? 'dayrally kits' : 'Room kits';
    groups.set(type, [...(groups.get(type) ?? []), { handle: k.handle, title: k.title, blurb: k.note, personalised: k.lines.some((l) => WIDGET_PRODUCTS.find((p) => p.handle === l.handle)?.personalised) }]);
  }
  for (const l of WIDGET_LAB) {
    const type = `${l.type} · v0.3 pipeline · unprinted`;
    const spec = widgetSpec(`${LAB_HANDLE_PREFIX}${l.id}`)!;
    groups.set(type, [...(groups.get(type) ?? []), { handle: spec.handle, title: l.title, blurb: l.blurb, personalised: spec.choices.some((c) => c.options.some((o) => o.partIds.some((id) => id.endsWith('-name-pattern')))) }]);
  }
  for (const a of WIDGET_PROTOTYPES) {
    const type = `${a.brand === 'dayrally' ? 'dayrally' : 'Living'} prototypes · AC-02 · unprinted`;
    const spec = widgetSpec(`${AC02_HANDLE_PREFIX}${a.id}`)!;
    groups.set(type, [...(groups.get(type) ?? []), { handle: spec.handle, title: a.name, blurb: a.description, personalised: spec.lines.some((l) => ['wall-name-panel', 'rally-name-skin', 'pet-name-tag'].includes(l.handle) || l.handle.endsWith('-display-base')) }]);
  }
  return (
    <div className="lv">
      <div className="lv-wrap" style={{ padding: '3rem 0' }}>
        <p className="lv-eyebrow">assembl / living · product widgets</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>one product, made yours</h1>
        <p className="lv-lede" style={{ marginTop: '0.8rem' }}>Each widget offers the product’s real choices from the parts manifest and hands a typed item to the store page. Embed it in a Shopify product page with one Custom Liquid block:</p>
        <pre className="lv-mono" style={{ whiteSpace: 'pre-wrap', background: 'var(--lv-chalk)', padding: '1rem 1.2rem', borderRadius: 14, marginTop: '1rem', textTransform: 'none', letterSpacing: 0 }}>{SNIPPET}</pre>
        <p className="lv-small" style={{ marginTop: '0.6rem' }}>Guide: <code>docs/living/WIDGET-EMBED.md</code>. Nothing here sells anything; purchasing remains the store’s decision. AC-02 prototypes and lab items (the dayrally cam, rod, cast, wharf reel, the ride line and TURN mini) are real CAD that has never been printed: they carry no price and must not be listed.</p>
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
                    <p className="lv-mono">{spec.colours.length} colours{spec.choices.length ? ` · ${spec.choices.map((c) => c.label.toLowerCase()).join(' · ')}` : ''}{spec.lines.length ? ` · ${spec.lines.length} products` : ''}{p.personalised ? ' · personalised' : ''}</p>
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
