import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CAD_MANIFEST, DAYRALLY_KITS, HOME_RANGE, INTERFACE_SPEC, KITS, PRODUCTS, WIDGET_LAB } from '@/lib/living';
import { fredoka } from './fonts';
import './living.css';
import { POD_CONTENTS_NOTE } from '@/lib/living/pod-contents';

export const metadata: Metadata = {
  title: 'assembl / living — assembl it your way',
  description:
    '3D printed kits for your room, your bike, your bag and the dog, all on one 42 mm quarter-turn key. Shelving, furniture and decor for the house. Show us your space, pick a kit, printed to order.',
};

/** The four ways in: assembl my pod, my space, my ride, my day. */
const MODES: { id: string; line: string; art: string; photo?: boolean }[] = [
  { id: 'pod', line: 'a size, a lid, an insert, a mount, a charm', art: '/living/alpha/pod-standard-sky-waves.png' },
  { id: 'space', line: 'boards, shelves, cups, bins, hooks and pods on the wall', art: '/living/alpha/tackle-wall.png' },
  { id: 'ride', line: 'kit on the bar, stem, frame and post of any bike', art: '/living/boards/rally-ride-crop.jpg', photo: true },
  { id: 'day', line: 'fish, beach, school or ride: pack the day', art: '/living/boards/rally-explore-crop.jpg', photo: true },
];

/** The second home set: rendered assembled from their print files. */
const HOME_SET: { handle: string; art: string; name: string; line: string }[] = [
  { handle: 'lab-fluted-table', art: 'asm-lab-fluted-table-assembled', name: 'fluted side table', line: 'two drums and a top' },
  { handle: 'lab-grid-table', art: 'asm-lab-grid-table-assembled', name: 'grid side table', line: 'a pill with a grid on top' },
  { handle: 'lab-grid-table-round', art: 'asm-lab-grid-table-round-assembled', name: 'grid table, round', line: 'the same top on a drum' },
  { handle: 'lab-desk-set', art: 'asm-lab-desk-set-stacked', name: 'desk set', line: 'trays that stack on a grid' },
  { handle: 'lab-y-stool', art: 'asm-lab-y-stool-assembled', name: 'Y stool', line: 'three arms, one hub' },
  { handle: 'lab-magazine-rack', art: 'asm-lab-magazine-rack-assembled', name: 'magazine rack', line: 'a sling, a hoop, four legs' },
];

/** The pieces: catalogue products (priced, proposed) and lab items (designed, unpriced), each with its render. */
const PIECES: { handle: string; art: string; name?: string }[] = [
  { handle: 'al-pod-standard', art: 'pods-fish' },
  { handle: 'al-pod-mini', art: 'pods-mini-earbuds' },
  { handle: 'al-pod-tall', art: 'pods-cards' },
  { handle: 'al-pod-long', art: 'pods-pens' },
  { handle: 'lab-fish-ruler', art: 'ruler-fish-sky', name: 'fish ruler' },
  { handle: 'lab-emergency-pack', art: 'pocket-emergency-open', name: 'emergency pack' },
  { handle: 'lab-mini-emergency', art: 'pocket-mini-emergency', name: 'mini emergency kit' },
  { handle: 'lab-lip-sleeve', art: 'pocket-lip-sleeve', name: 'lip sleeve' },
  { handle: 'lab-friend-set', art: 'pocket-charms', name: 'friend set & charms' },
  { handle: 'lab-id-charm', art: 'pocket-id-charms', name: 'id charm' },
  { handle: 'lab-pack-case', art: 'tackle-wall', name: 'tackle wall' },
  { handle: 'lab-universal-saddle', art: 'tackle-universal', name: 'universal saddle' },
  { handle: 'lab-pen-g2', art: 'pocket-stationery', name: 'pen, eraser, toppers' },
  { handle: 'al-board-4x4', art: 'board-4x4-chalk' },
  { handle: 'al-name-plate', art: 'name-plate-plum-mila' },
  { handle: 'al-number-plate', art: 'number-plate-lime' },
  { handle: 'lab-dayrally-ride', art: 'ride-pod-tomato', name: 'ride pod' },
  { handle: 'al-hook', art: 'hook-clay' },
  { handle: 'al-shelf-3', art: 'shelf-3-sage' },
  { handle: 'al-cup', art: 'cup-plum' },
  { handle: 'al-bin-2', art: 'bin-2-oat' },
  { handle: 'lab-ride-grips', art: 'grips-name-sun', name: 'name grips' },
  { handle: 'lab-ride-phone', art: 'ride-phone-ink', name: 'phone mount' },
  { handle: 'lab-ride-watch', art: 'ride-watch-sky', name: 'watch mount' },
  { handle: 'lab-ride-bottle', art: 'ride-bottle-tangerine', name: 'bottle cup' },
  { handle: 'lab-ride-stand', art: 'ride-stand-mint', name: 'crank stand' },
  { handle: 'lab-ride-rack', art: 'bike-set-sun', name: 'rack set' },
  { handle: 'lab-scoot-fish', art: 'scoot-set-sun', name: 'scooter set' },
  { handle: 'lab-dayrally-rod', art: 'rod-packed-lime', name: 'packable rod' },
  { handle: 'lab-dayrally-cast', art: 'cast-kit-sky', name: 'casting rod' },
  { handle: 'lab-wharf-reel', art: 'rod-wharf-reel-tangerine', name: 'wharf reel' },
  { handle: 'lab-dayrally-cam', art: 'cam-exploded-ink-tomato', name: 'pinhole cam' },
  { handle: 'lab-mini-ride', art: 'mini-ride-kit-sun', name: 'mini mounts · ride' },
  { handle: 'lab-mini-explore', art: 'mini-explore-sun', name: 'mini mounts · explore' },
  { handle: 'al-bag-charm', art: 'charm-star-tangerine' },
  { handle: 'al-tray-custom', art: 'tray-2x1-oat', name: 'drawer tray' },
  { handle: 'al-tray-cutout', art: 'vanity-cutout-sage', name: 'cut-out tray' },
  { handle: 'al-node-corner', art: 'stack-nodes-ink', name: 'dowel joints' },
];

function nzd(n: number) {
  return `NZ$${n.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}`;
}

export default function AssemblLivingPage() {
  const served = CAD_MANIFEST.parts.filter((p) => p.file).length;
  const products = new Map(CAD_MANIFEST.products.map((p) => [p.handle, p]));
  const catalogue = new Map(PRODUCTS.map((p) => [p.handle, p]));
  const lab = new Map(WIDGET_LAB.map((l) => [`lab-${l.id}`, l]));
  const pieces = PIECES.map(({ handle, art, name }) => {
    const p = products.get(handle) ?? catalogue.get(handle);
    const l = lab.get(handle);
    const title = name ?? (p?.title ?? l?.title ?? handle).replace('dayrally ', '').toLowerCase();
    const price = p?.price_nzd ?? 0;
    return { handle, art, title, price: price > 0 ? price : null, lab: Boolean(l) };
  });
  return (
    <div className={`lv lv-sun ${fredoka.variable}`}>
      <section className="lx-hero" aria-labelledby="ls-title">
        <div className="lx-hero-media"><Image src="/living/renders/living-hero-home-set.jpg" alt="The fluted side table, the grid side tables, the desk set on top of one, the magazine rack and the Y stool, rendered at true scale from their print files" fill priority sizes="100vw" className="lx-hero-img" /></div>
        <div className="lv-wrap lx-hero-copy">
          <p className="ls-mono">assembl / living · dayrally</p>
          <h1 id="ls-title">assembl it<br />your way.</h1>
          <p className="lx-sub">Pick the parts, drop them in, see it whole and priced.</p>
          <div className="lv-actions">
            <Link href="/living/assembl/pod" className="ls-btn">assembl yours →</Link>
            <a href="#ls-shop" className="ls-btn" data-variant="ghost">the pieces ↓</a>
          </div>
          <span className="lx-tag">rendered from the print files · nothing printed or for sale yet</span>
        </div>
      </section>

      <div className="lv-wrap">
        <nav className="lx-modes" aria-label="assembl my">
          {MODES.map((m) => (
            <Link key={m.id} href={`/living/assembl/${m.id}`} className="lx-mode" data-photo={m.photo ? 'true' : undefined}>
              <span className="lx-mode-art"><Image src={m.art} alt="" fill sizes="(max-width: 760px) 50vw, 25vw" /></span>
              <span className="lx-mode-text"><small>assembl my</small><b>{m.id}</b><span>{m.line}</span></span>
            </Link>
          ))}
        </nav>
        <p className="lx-fine">rally in the ride and day pictures is from the dayrally concept boards, not a photo of printed parts.</p>
      </div>

      <section className="lx-band" aria-labelledby="lx-fish">
        <Image src="/living/boards/dayrally-bike-20261020.jpg" alt="Concept board: rally the dachshund on a wharf beside a bike with dayrally pods, a kid fishing off the end" fill sizes="100vw" className="lx-band-img" />
        <div className="lv-wrap lx-band-copy">
          <h2 id="lx-fish">fish day.</h2>
          <p>The pack rod, soft-bait cases on the wall, a ruler for the catch.</p>
          <Link href="/living/assembl/day" className="ls-btn" data-variant="sun">pack a fish day →</Link>
          <span className="lx-tag">concept board</span>
        </div>
      </section>

      <div className="lv-wrap">
        <section className="lx-split" aria-labelledby="lx-ride">
          <div className="lx-split-art"><Image src="/living/boards/rally-ride-kit-crop.jpg" alt="Concept board: rally beside handlebars carrying a cam mount, a light and a phone mount" fill sizes="(max-width: 760px) 100vw, 55vw" /></div>
          <div className="lx-split-copy">
            <h2 id="lx-ride">any bike.</h2>
            <p>One saddle seats bars, stems, posts and tubes from 22 to 45 mm. Pods, bottles and phones key on.</p>
            <div className="lx-split-render"><Image src="/living/alpha/tackle-universal.png" alt="The universal saddle with its strap on a 32 mm tube, rendered from the print files" fill sizes="240px" /></div>
            <Link href="/living/assembl/ride" className="ls-btn">assembl my ride →</Link>
          </div>
        </section>

        <section className="ls-section" id="ls-home" aria-labelledby="ls-home-title">
          <div className="ls-head">
            <h2 id="ls-home-title">at home.</h2>
            <span className="ls-mono">new · rendered assembled · unprinted</span>
          </div>
          <div className="lx-home">
            {HOME_SET.map((x) => (
              <Link key={x.handle} href={`/living/widget/${x.handle}`} className="lx-home-card">
                <span className="lx-home-art"><Image src={`/living/alpha/${x.art}.png`} alt={`${x.name}, rendered from its print files`} fill sizes="(max-width: 760px) 50vw, 33vw" /></span>
                <b>{x.name}</b>
                <small>{x.line}</small>
              </Link>
            ))}
          </div>
          <div className="lx-home-strip" aria-label="More for the house">
            {HOME_RANGE.map((x) => (
              <Link key={x.handle} href={`/living/widget/${x.handle}`} className="lx-strip-card">
                <span><Image src={x.preview} alt={`${x.name}. CAD preview, not a print`} fill sizes="160px" /></span>
                <small>{x.name}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="ls-section" id="ls-shop" aria-labelledby="ls-featured">
          <div className="ls-head">
            <h2 id="ls-featured">the pieces.</h2>
            <Link href="/living/widget">all {CAD_MANIFEST.products.length + WIDGET_LAB.length} →</Link>
          </div>
          <div className="ls-grid">
            {pieces.map((x) => (
              <Link key={x.handle} href={`/living/widget/${x.handle}`} className="ls-card">
                <div className="ls-card-art"><Image src={`/living/alpha/${x.art}.png`} alt={x.art.startsWith('pods-') ? `${x.title}. ${POD_CONTENTS_NOTE}` : x.title} fill sizes="(max-width: 680px) 50vw, 25vw" /></div>
                <b>{x.title}</b>
                <div className="ls-price">
                  {x.price ? <span>{nzd(x.price)}</span> : <span>lab</span>}
                  <small>{x.price ? 'proposed' : x.lab ? 'designed · unpriced' : 'made to measure'}</small>
                </div>
                <span className="ls-btn" data-variant="small">see it →</span>
              </Link>
            ))}
          </div>
        </section>


        <section className="ls-section" aria-labelledby="ls-kits-title">
          <div className="ls-head">
            <h2 id="ls-kits-title">kits.</h2>
            <span className="ls-mono">the assembl TURN key · {INTERFACE_SPEC.pitch_mm} mm · click, lock, go</span>
          </div>
          <div className="ls-kits">
            {DAYRALLY_KITS.map((k) => (
              <Link key={k.handle} href={`/living/widget/${k.handle}`} className="ls-kit">
                <b>{k.title.replace('dayrally ', '').toLowerCase()}</b>
                <span>{k.lines.map((l) => (products.get(l.handle)?.title ?? l.handle).replace('dayrally ', '').toLowerCase()).join(' · ')}</span>
                <div className="ls-price"><span>{nzd(k.price_nzd)}</span><small>{k.lines.reduce((s, l) => s + l.qty, 0)} items</small></div>
              </Link>
            ))}
            {KITS.map((k) => (
              <Link key={k.id} href={`/living/studio?kit=${k.id}`} className="ls-kit">
                <b>{k.name.toLowerCase()}</b>
                <span>{k.note.split('.')[0]}.</span>
                <div className="ls-price"><span>{nzd(k.priceNzd)}</span><small>at home</small></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="lx-studio" aria-label="show us your space">
          <p>Not sure where to start? <Link href="/living/studio">Show us your space</Link> and we design the fit.</p>
        </section>
      </div>

      <footer className="ls-foot">
        <div className="lv-wrap ls-foot-grid">
          <p className="ls-line">plan. build. print. go.</p>
          <ul>
            <li className="ls-mono">by assembl / living</li>
            <li className="ls-mono">the assembl TURN standard · {served} print files · {CAD_MANIFEST.pack}</li>
            <li className="ls-mono">designed · not yet printed · nothing for sale yet</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
