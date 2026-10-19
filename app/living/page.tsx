import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AESTHETIC_PRESETS,
  CAD_MANIFEST,
  COLOURWAY_SWATCHES,
  FOUNDATIONS,
  FOUNDATION_LABELS,
  INTERFACE_SPEC,
  KITS,
  PARTS,
  SPACE_ENTRIES,
  applyKit,
  billOfMaterials,
  bundledPriceBand,
  newDesign,
} from '@/lib/living';
import { GridComposer } from './studio/GridComposer';
import './living.css';

export const metadata: Metadata = {
  title: 'assembl / living — one modular system, made to your space',
  description:
    'A modular interiors system that adapts to the person, their space and what they own. Grid, tile, stack and rail on one 24 mm interface. Photograph your space, see three ways to improve it, assemble your design.',
};

const STEPS = [
  { n: '01', title: 'show us your space', line: 'Photograph a bedroom, drawer, desk, wardrobe or wall. Tell us what is not working, in your words.' },
  { n: '02', title: 'assembl understands the space', line: 'What you said becomes a short list of needs and the parts that answer them. Shown back to you before anything is proposed.' },
  { n: '03', title: 'see three ways to improve it', line: 'A minimal refresh, a full organisation system, or a more expressive layout. Same parts, three starting points.' },
  { n: '04', title: 'assemble your design', line: 'Add panels, shelves, trays, hooks and rails. Change colours and layout in a live preview drawn at real size.' },
  { n: '05', title: 'made for your space', line: 'Confirm the measurements that decide fit, approve the design and save a configuration a manufacturer can quote from.' },
];

function nzd(n: number) {
  return `NZ$${n.toLocaleString('en-NZ')}`;
}

function FoundationGlyph({ id }: { id: (typeof FOUNDATIONS)[number] }) {
  const ink = 'rgba(36, 11, 33, 0.55)';
  const fill = '#FFFDFB';
  switch (id) {
    case 'grid':
      return (
        <svg viewBox="0 0 200 120" aria-hidden>
          <rect x="40" y="10" width="120" height="100" rx="8" fill={fill} stroke={ink} />
          {Array.from({ length: 20 }, (_, i) => (
            <circle key={i} cx={52 + (i % 5) * 24} cy={22 + Math.floor(i / 5) * 24} r="3.2" fill={ink} opacity=".5" />
          ))}
        </svg>
      );
    case 'tile':
      return (
        <svg viewBox="0 0 200 120" aria-hidden>
          <rect x="30" y="20" width="80" height="80" rx="8" fill={fill} stroke={ink} />
          <rect x="114" y="20" width="56" height="38" rx="6" fill={fill} stroke={ink} />
          <rect x="114" y="62" width="56" height="38" rx="6" fill={fill} stroke={ink} />
          <rect x="106" y="54" width="16" height="12" rx="2" fill={ink} opacity=".5" />
        </svg>
      );
    case 'stack':
      return (
        <svg viewBox="0 0 200 120" aria-hidden>
          <rect x="30" y="40" width="140" height="8" rx="2" fill={fill} stroke={ink} />
          <rect x="30" y="48" width="6" height="56" fill={fill} stroke={ink} />
          <rect x="97" y="48" width="6" height="56" fill={fill} stroke={ink} />
          <rect x="164" y="48" width="6" height="56" fill={fill} stroke={ink} />
          <rect x="44" y="18" width="52" height="20" rx="4" fill={fill} stroke={ink} />
          <rect x="112" y="18" width="52" height="20" rx="4" fill={fill} stroke={ink} />
        </svg>
      );
    case 'rail':
      return (
        <svg viewBox="0 0 200 120" aria-hidden>
          <rect x="20" y="44" width="160" height="28" rx="4" fill={fill} stroke={ink} />
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={i} cx={36 + i * 21.5} cy="58" r="3.2" fill={ink} opacity=".5" />
          ))}
          <path d="M57 72 v24 h8" fill="none" stroke={ink} strokeWidth="3" />
          <path d="M122 72 v24 h8" fill="none" stroke={ink} strokeWidth="3" />
        </svg>
      );
  }
}

export default function AssemblLivingPage() {
  const spec = INTERFACE_SPEC;
  return (
    <div className="lv">
      <div className="lv-wrap">
        <section className="lv-hero">
          <span className="lv-eyebrow">assembl / living</span>
          <h1>
            One design system.
            <br />
            Different spaces.
            <br />
            Endless combinations.
          </h1>
          <p className="lv-lede">
            A modular interiors system that adapts to you, your space and what you own. Photograph the corner that is not working. We help design something beautiful and functional from compatible parts, made to measure.
          </p>
          <div className="lv-actions">
            <Link href="/living/studio" className="lv-btn">
              show us your space →
            </Link>
            <Link href="/living/shop" className="lv-btn" data-variant="ghost">explore the collection →</Link>
            <span className="lv-status" data-tone="quiet">prototype parts · nothing for sale yet</span>
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-spaces">
          <div className="lv-section-head">
            <span className="lv-eyebrow">by space first, interest second</span>
            <h2 id="lv-spaces">Six doors into one catalogue.</h2>
            <p className="lv-small">A panel is the same panel in a teenager&rsquo;s room, a workshop or a vanity. The suggested accessories and colourways change.</p>
          </div>
          <div className="lv-grid lv-grid-3">
            {SPACE_ENTRIES.map((s) => (
              <Link key={s.id} href={`/living/studio?space=${s.id}`} className="lv-card">
                <h3>{s.name}</h3>
                <p className="lv-small">{s.line}</p>
                <ul>
                  {s.examples.slice(0, 2).map((e) => (
                    <li key={e}>&ldquo;{e}&rdquo;</li>
                  ))}
                </ul>
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
              <article key={s.n} className="lv-card" data-tone="chalk">
                <span className="lv-eyebrow">{s.n}</span>
                <h3>{s.title}</h3>
                <p className="lv-small">{s.line}</p>
              </article>
            ))}
          </div>
          <div className="lv-note" style={{ marginTop: '1.2rem' }}>
            <span className="lv-status" data-tone="quiet">what a photo can and cannot do</span>
            <span>
              A single photograph cannot reliably establish exact physical measurements. Today the studio shows your photo back to you and does not read it. Fit is decided only by width and height you confirm, with a tape, an A4 sheet as a reference or a phone depth scan.
            </span>
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-system">
          <div className="lv-section-head">
            <span className="lv-eyebrow">one modular product ecosystem</span>
            <h2 id="lv-system">Four foundations. One interface.</h2>
            <p className="lv-small">
              Every part shares interface {CAD_MANIFEST.interface}: a {spec.pitch_mm} mm pitch, Ø{spec.hole_mm} mm holes, Ø{spec.peg_mm} mm pegs and a {spec.tile_footprint_mm} mm tile footprint. The physical engineering differs for walls, surfaces and drawers; the customer experiences one family.
            </p>
          </div>
          <div className="lv-grid lv-grid-4">
            {FOUNDATIONS.map((f) => (
              <div key={f} className="lv-foundation">
                <FoundationGlyph id={f} />
                <h3>{FOUNDATION_LABELS[f].name}</h3>
                <p className="lv-small">{FOUNDATION_LABELS[f].line}</p>
                <div className="lv-strip">
                  {PARTS.filter((p) => p.foundation === f).map((p) => (
                    <span key={p.id} className="lv-tag">{p.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-kits">
          <div className="lv-section-head">
            <span className="lv-eyebrow">the kits are the merchandising layer</span>
            <h2 id="lv-kits">Buy a blank panel and build it yourself, or start from a kit.</h2>
            <p className="lv-small">All the same grid. Someone can buy the get-ready wall and later add gaming accessories, or buy the tackle wall and add a ledge for keys and phone.</p>
          </div>
          <div className="lv-grid lv-grid-2">
            {KITS.map((k) => {
              const design = applyKit(newDesign({ space: k.space, surface: 'wall', aesthetic: k.aesthetic }), k);
              const bom = billOfMaterials(design);
              const band = bundledPriceBand(bom);
              return (
                <article key={k.id} className="lv-card">
                  {design.placements.length > 0 ? (
                    <GridComposer design={design} className="lv-mini" title={`${k.name} layout`} />
                  ) : (
                    <div className="lv-mini" style={{ padding: '1rem' }}>
                      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                        {bom.lines.map((l) => (
                          <li key={l.partId}>{l.qty} × {l.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <h3>{k.name}</h3>
                  <p className="lv-small">{k.description}</p>
                  <div className="lv-total">
                    <span className="lv-small">{bom.lines.reduce((s, l) => s + l.qty, 0)} parts · {AESTHETIC_PRESETS[k.aesthetic].label}</span>
                    <b>{nzd(band.lowNzd)}–{nzd(band.highNzd)}</b>
                  </div>
                  <div className="lv-actions">
                    <Link href={`/living/studio?kit=${k.id}`} className="lv-btn" data-variant="small">
                      open in the studio →
                    </Link>
                    <span className="lv-status" data-tone="quiet">indicative · not yet quoted</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-colour">
          <div className="lv-section-head">
            <span className="lv-eyebrow">colourways</span>
            <h2 id="lv-colour">Warm chalk to graphite. Nothing loud.</h2>
          </div>
          <div className="lv-swatches">
            {Object.entries(COLOURWAY_SWATCHES).map(([id, c]) => (
              <span key={id} className="lv-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.7rem 0.35rem 0.4rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: c.hex, boxShadow: 'inset 0 0 0 1px rgba(36,11,33,.15)' }} aria-hidden />
                {c.label}
              </span>
            ))}
          </div>
        </section>

        <section className="lv-section" aria-labelledby="lv-honest">
          <div className="lv-grid lv-grid-2">
            <article className="lv-card" data-tone="plum">
              <span className="lv-eyebrow">where this is up to</span>
              <h2 id="lv-honest">Engineering pack {CAD_MANIFEST.pack}.</h2>
              <p>
                {PARTS.length} parts, each exported as editable STEP and printable STL from one parametric source, each checked as a valid single solid with a watertight mesh. That is a digital manufacturing check, not a physical strength, fit or wall-mounting test.
              </p>
              <ul>
                <li>All parts are light-duty prototypes. No load ratings are published.</li>
                <li>Not for clothes rails, heavy shelving or anything safety-critical.</li>
                <li>Wall panels fix with screws and anchors suited to the wall. Printed parts are not anchors.</li>
                <li>The interface is original work. A prior-art check comes before any exclusivity claim.</li>
              </ul>
            </article>
            <article className="lv-card" data-tone="chalk">
              <span className="lv-eyebrow">next real-world milestone</span>
              <h3>One pegboard starter kit, printed, assembled and tested in a bedroom.</h3>
              <ul>
                <li>Print and test the first samples: real dimensions, peg fit, finish, usability.</li>
                <li>Refine the interface into a connection every approved accessory can rely on.</li>
                <li>Build the first sellable starter kit: a panel, several useful accessories, optional personalisation.</li>
                <li>Open purchasing only when a manufacturer has accepted the files, pricing and fulfilment.</li>
              </ul>
              <div className="lv-actions">
                <Link href="/living/studio" className="lv-btn">open the studio →</Link>
                <a href={`/living/cad/${CAD_MANIFEST.pack}/manifest.json`} className="lv-btn" data-variant="ghost">CAD manifest</a>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
