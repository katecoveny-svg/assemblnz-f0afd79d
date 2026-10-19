import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AESTHETIC_PRESETS,
  CAD_MANIFEST,
  DAYRALLY_COLOURS,
  DAYRALLY_KITS,
  DAYRALLY_PRODUCTS,
  FOUNDATIONS,
  FOUNDATION_LABELS,
  INTERFACE_SPEC,
  KITS,
  LIVING_COLOURS,
  PRODUCTS,
  SPACE_ENTRIES,
  TEST_KIT,
  applyKit,
  billOfMaterials,
  newDesign,
} from '@/lib/living';
import { GridComposer } from './studio/GridComposer';
import './living.css';

export const metadata: Metadata = {
  title: 'assembl / living — one modular system, made to your space',
  description:
    'A modular interiors system that adapts to the person, their space and what they own. Grid, tile, stack, renter and light on one 42 mm quarter-turn standard. Show us your space, see three ways to improve it, assemble your design.',
};

const STEPS = [
  { n: '01', title: 'show us your space', line: 'Photograph a bedroom, door, desk, wardrobe or drawer. Tell us what is not working, in your words.' },
  { n: '02', title: 'assembl understands the space', line: 'What you said becomes a short list of needs and the parts that answer them. Shown back to you before anything is proposed.' },
  { n: '03', title: 'see three ways to improve it', line: 'A minimal refresh, a full organisation system, or a more expressive layout. Same parts, three starting points.' },
  { n: '04', title: 'assemble your design', line: 'Add boards, shelves, bins, hooks, cups and a name plate. Change colours and layout in a live preview drawn at real size.' },
  { n: '05', title: 'made for your space', line: 'Confirm the measurements that decide fit, approve the design and save a configuration the print partner quotes from.' },
];

function nzd(n: number) {
  return `NZ$${n.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}`;
}

function FoundationGlyph({ id }: { id: (typeof FOUNDATIONS)[number] }) {
  const ink = 'rgba(36, 11, 33, 0.55)';
  const fill = '#FFFDFB';
  switch (id) {
    case 'grid':
      return (
        <svg viewBox="0 0 200 120" aria-hidden>
          <rect x="40" y="10" width="120" height="100" rx="6" fill={fill} stroke={ink} />
          {Array.from({ length: 16 }, (_, i) => {
            const cx = 55 + (i % 4) * 30;
            const cy = 25 + Math.floor(i / 4) * 24;
            return <g key={i}><circle cx={cx} cy={cy} r="5" fill={ink} opacity=".45" /><rect x={cx - 1.5} y={cy - 8} width="3" height="16" rx="1" fill={ink} opacity=".45" /></g>;
          })}
        </svg>
      );
    case 'tile':
      return (
        <svg viewBox="0 0 200 120" aria-hidden>
          <rect x="24" y="16" width="152" height="88" rx="8" fill={fill} stroke={ink} />
          <line x1="76" y1="16" x2="76" y2="104" stroke={ink} /><line x1="128" y1="16" x2="128" y2="104" stroke={ink} /><line x1="24" y1="60" x2="176" y2="60" stroke={ink} />
          <circle cx="152" cy="82" r="12" fill="none" stroke={ink} opacity=".6" /><rect x="34" y="28" width="30" height="22" rx="6" fill="none" stroke={ink} opacity=".6" />
        </svg>
      );
    case 'stack':
      return (
        <svg viewBox="0 0 200 120" aria-hidden>
          <rect x="30" y="54" width="140" height="8" rx="4" fill={fill} stroke={ink} /><rect x="96" y="20" width="8" height="90" rx="4" fill={fill} stroke={ink} />
          <circle cx="100" cy="58" r="14" fill={fill} stroke={ink} /><circle cx="34" cy="58" r="8" fill={fill} stroke={ink} /><circle cx="166" cy="58" r="8" fill={fill} stroke={ink} />
        </svg>
      );
    case 'renter':
      return (
        <svg viewBox="0 0 200 120" aria-hidden>
          <rect x="60" y="8" width="80" height="112" rx="3" fill={fill} stroke={ink} />
          <path d="M70 8 v-2 h8 v22 h-8 M120 8 v-2 h8 v22 h-8" fill="none" stroke={ink} strokeWidth="3" />
          <rect x="66" y="30" width="68" height="68" rx="5" fill={fill} stroke={ink} />
          {Array.from({ length: 4 }, (_, i) => <circle key={i} cx={82 + (i % 2) * 36} cy={48 + Math.floor(i / 2) * 32} r="5" fill={ink} opacity=".45" />)}
        </svg>
      );
    case 'light':
      return (
        <svg viewBox="0 0 200 120" aria-hidden>
          <line x1="100" y1="0" x2="100" y2="22" stroke={ink} /><path d="M84 22 h32 l34 80 h-100 z" fill={fill} stroke={ink} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={88 + i * 5} y1="24" x2={60 + i * 16} y2="100" stroke={ink} opacity=".35" />)}
        </svg>
      );
  }
}

export default function AssemblLivingPage() {
  const spec = INTERFACE_SPEC;
  const served = CAD_MANIFEST.parts.filter((p) => p.file).length;
  return (
    <div className="lv">
      <div className="lv-wrap">
        <section className="lv-hero">
          <span className="lv-eyebrow">assembl / living</span>
          <h1>One design system.<br />Different spaces.<br />Endless combinations.</h1>
          <p className="lv-lede">
            A modular interiors system that adapts to you, your space and what you own. Photograph the corner that is not working. We help design something beautiful and functional from compatible parts, printed to order.
          </p>
          <div className="lv-actions">
            <Link href="/living/studio" className="lv-btn">show us your space →</Link>
            <span className="lv-status" data-tone="quiet">designed, not yet printed · nothing for sale yet</span>
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-spaces">
          <div className="lv-section-head">
            <span className="lv-eyebrow">by space first, interest second</span>
            <h2 id="lv-spaces">Six doors into one catalogue.</h2>
            <p className="lv-small">A board is the same board in a teenager&rsquo;s room, a workshop or a vanity. The suggested accessories, kits and colours change.</p>
          </div>
          <div className="lv-grid lv-grid-3">
            {SPACE_ENTRIES.map((s) => (
              <Link key={s.id} href={`/living/studio?space=${s.id}`} className="lv-card">
                <h3>{s.name}</h3>
                <p className="lv-small">{s.line}</p>
                <ul>{s.examples.slice(0, 2).map((e) => <li key={e}>&ldquo;{e}&rdquo;</li>)}</ul>
              </Link>
            ))}
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-how">
          <div className="lv-section-head">
            <span className="lv-eyebrow">the photo-to-room workflow</span>
            <h2 id="lv-how">What happens, in order.</h2>
          </div>
          <div className="lv-grid lv-grid-3">
            {STEPS.map((s) => (
              <article key={s.n} className="lv-card" data-tone="chalk"><span className="lv-eyebrow">{s.n}</span><h3>{s.title}</h3><p className="lv-small">{s.line}</p></article>
            ))}
          </div>
          <div className="lv-note" style={{ marginTop: '1.2rem' }}>
            <span className="lv-status" data-tone="quiet">what a photo can and cannot do</span>
            <span>A single photograph cannot reliably establish exact physical measurements. Today the studio shows your photo back to you and does not read it. Fit is decided only by width and height you confirm, and by the door-gap gauge for over-door hangers.</span>
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-system">
          <div className="lv-section-head">
            <span className="lv-eyebrow">the assembl TURN standard · v0.1 proposed</span>
            <h2 id="lv-system">One key. Every accessory.</h2>
            <p className="lv-small">
              A {spec.pitch_mm} mm grid of keyways in an {spec.board_thickness_mm} mm board. Each accessory carries a flange; its TURN key pushes in upright and quarter-turns to lock, with a 0.35 mm detent so you feel the click. Single-key accessories carry a locator nub that stops them turning and takes the shear load. The same key holds a dayrally pod on a bike bar or a bag strap.
            </p>
          </div>
          <div className="lv-grid lv-grid-4">
            {FOUNDATIONS.map((f) => (
              <div key={f} className="lv-foundation">
                <FoundationGlyph id={f} />
                <h3>{FOUNDATION_LABELS[f].name}</h3>
                <p className="lv-small">{FOUNDATION_LABELS[f].line}</p>
                <div className="lv-strip">
                  {PRODUCTS.filter((p) => p.foundation === f).map((p) => <span key={p.handle} className="lv-tag">{p.title}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-kits">
          <div className="lv-section-head">
            <span className="lv-eyebrow">room kits are the merchandising layer</span>
            <h2 id="lv-kits">Buy a blank board and build it yourself, or start from a kit.</h2>
            <p className="lv-small">All the same grid. Someone can buy the vanity lab and later add a lure garage, or buy the gear wall and add a shelf for keys and a phone.</p>
          </div>
          <div className="lv-grid lv-grid-2">
            {KITS.map((k) => {
              const design = applyKit(newDesign({ space: k.space, surface: 'wall', aesthetic: k.aesthetic }), k);
              const bom = billOfMaterials(design);
              return (
                <article key={k.id} className="lv-card">
                  <GridComposer design={{ ...design, name: 'MILA' }} className="lv-mini" title={`${k.name} layout`} />
                  <h3>{k.name.toLowerCase()}</h3>
                  <p className="lv-small">{k.note} {bom.lines.map((l) => `${l.qty} × ${l.title.toLowerCase()}`).join(', ')}.</p>
                  <div className="lv-total">
                    <span className="lv-small">{bom.lines.reduce((s, l) => s + l.qty, 0)} items · {AESTHETIC_PRESETS[k.aesthetic].label}</span>
                    <b>{nzd(k.priceNzd)}</b>
                  </div>
                  <div className="lv-actions">
                    <Link href={`/living/studio?kit=${k.id}`} className="lv-btn" data-variant="small">open in the studio →</Link>
                    <span className="lv-status" data-tone="quiet">proposed · pre-quote</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-colour">
          <div className="lv-section-head">
            <span className="lv-eyebrow">colourways</span>
            <h2 id="lv-colour">Chalk to ink for the house. Tomato to cloud for dayrally.</h2>
            <p className="lv-small">PLA Matte for boards and trays, PETG for keys, hangers and anything that lives outdoors. Shades in translucent PETG, LED only.</p>
          </div>
          <div className="lv-swatches" style={{ marginBottom: '0.8rem' }}>
            {LIVING_COLOURS.map((c) => (
              <span key={c.id} className="lv-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.7rem 0.35rem 0.4rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: c.hex, boxShadow: 'inset 0 0 0 1px rgba(36,11,33,.15)' }} aria-hidden />{c.name}
              </span>
            ))}
          </div>
          <div className="lv-swatches">
            {DAYRALLY_COLOURS.map((c) => (
              <span key={c.id} className="lv-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.7rem 0.35rem 0.4rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: c.hex, boxShadow: 'inset 0 0 0 1px rgba(36,11,33,.15)' }} aria-hidden />{c.name}
              </span>
            ))}
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-dayrally">
          <div className="lv-section-head">
            <span className="lv-eyebrow">dayrally · the go-anywhere collection</span>
            <h2 id="lv-dayrally">Same key, out the door.</h2>
            <p className="lv-small">
              A pod&rsquo;s floor is a TURN flange with two keyways {spec.pitch_mm} mm apart, so every pod size locks onto every mount and onto any board at home. Four pod sizes, eight lid styles with a name or pattern inlaid flush, inserts for tackle, beach, tech, pens and cards, seven mounts, and the small things: charms, zip pulls, spoke beads, chair hooks, cable winders.
            </p>
          </div>
          <div className="lv-grid lv-grid-4">
            {DAYRALLY_KITS.map((k) => (
              <article key={k.handle} className="lv-card" data-tone="chalk">
                <h3>{k.title.replace('dayrally ', '').toLowerCase()}</h3>
                <p className="lv-small">{k.note}</p>
                <div className="lv-total"><span className="lv-small">{k.lines.reduce((s, l) => s + l.qty, 0)} items</span><b>{nzd(k.price_nzd)}</b></div>
              </article>
            ))}
          </div>
          <p className="lv-small" style={{ marginTop: '1rem' }}>{DAYRALLY_PRODUCTS.length} dayrally and bike products in the catalogue. No printed bottle cage and nothing with magnets: both are load-critical and wait for real testing. No hooks in any kit for children.</p>
        </section>

        <section className="lv-section" aria-labelledby="lv-honest">
          <div className="lv-grid lv-grid-2">
            <article className="lv-card" data-tone="plum">
              <span className="lv-eyebrow">where this is up to</span>
              <h2 id="lv-honest">Parts library {CAD_MANIFEST.pack}.</h2>
              <p>
                {CAD_MANIFEST.parts.length} print files generated from one parametric source, every one checked as a watertight single solid inside a 250 mm cube, with digital fit tests for the key, the boards, the hangers and the pods. {served} of them are served here for download. Nothing has been printed yet.
              </p>
              <ul>
                <li>Clamp, detent and clearance values are starting points for the test-print kit.</li>
                <li>No load limits are published until the 24-hour hook test has run; then half the passing weight.</li>
                <li>Over-door and rail hangers carry light things only. Shade sold alone, LED only; Energy Safety asked first.</li>
                <li>The TURN standard is original work. A prior-art check comes before any exclusivity claim.</li>
              </ul>
            </article>
            <article className="lv-card" data-tone="chalk">
              <span className="lv-eyebrow">before anything is sold</span>
              <h3>One test-print run answers the fit questions.</h3>
              <p className="lv-small">{TEST_KIT.files.length} files, about {TEST_KIT.total_g} g: a board coupon, keys at three clamp settings, the hook, the over-door hanger, a pocket-clearance coupon and a door-gap gauge. Printed by the same partner, on the same printers and materials we would sell with.</p>
              <ul>
                {TEST_KIT.files.map((f) => <li key={f.file}>{f.qty} × {f.name} · {f.material}</li>)}
              </ul>
              <div className="lv-actions">
                <Link href="/living/studio" className="lv-btn">open the studio →</Link>
                <a href={`/living/cad/${CAD_MANIFEST.pack}/manifest.json`} className="lv-btn" data-variant="ghost">parts manifest</a>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
