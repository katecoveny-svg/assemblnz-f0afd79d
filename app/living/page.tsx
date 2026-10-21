import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CAD_MANIFEST, DAYRALLY_KITS, HOME_RANGE, INTERFACE_SPEC, KITS, PRODUCTS, WIDGET_LAB } from '@/lib/living';
import { fredoka } from './fonts';
import { HeroWall } from './HeroWall';
import './living.css';
import { POD_CONTENTS_NOTE } from '@/lib/living/pod-contents';

export const metadata: Metadata = {
  title: 'dayrally · by assembl / living — one system. endless days.',
  description:
    '3D printed kits for your room, your bike, your bag and the dog, all on one 42 mm quarter-turn key. Shelving, furniture and decor for the house. Show us your space, pick a kit, printed to order.',
};

const SUN = '#ffd200';

/** The category row: a picture and a name, nothing else. */
const DOORS: { id: string; name: string; sub: string; art: string; href: string }[] = [
  { id: 'ride', name: 'ride', sub: 'bike', art: '/living/alpha/bike-set-sun.png', href: '/living/widget/al-kit-dayrally-ride-kit' },
  { id: 'scoot', name: 'scoot', sub: 'scooter', art: '/living/alpha/scoot-set-sun.png', href: '/living/widget/al-kit-dayrally-scoot-kit' },
  { id: 'fish', name: 'fish', sub: 'wharf & beach', art: '/living/alpha/rod-packed-lime.png', href: '/living/widget/al-kit-dayrally-fish-kit' },
  { id: 'everyday', name: 'everyday', sub: 'bag & belt', art: '/living/alpha/pods-tech.png', href: '/living/widget/al-kit-dayrally-everyday-kit' },
  { id: 'home', name: 'home', sub: 'shelving, furniture & decor', art: '/living/cad/ac02/previews/small-flatpack-shelf.webp', href: '#ls-home' },
  { id: 'my-room', name: 'my room', sub: 'wall & desk', art: '/living/alpha/teen-room-flatlay.png', href: '/living/studio?space=my-room' },
  { id: 'my-space', name: 'my space', sub: 'vanity & drawer', art: '/living/alpha/vanity-cutout-sage.png', href: '/living/studio?space=my-space' },
  { id: 'work-and-create', name: 'work', sub: 'bench & workshop', art: '/living/alpha/shelf-3-sage.png', href: '/living/studio?space=work-and-create' },
  { id: 'pets-and-everyday', name: 'pets', sub: 'leads & names', art: '/living/alpha/hook-clay.png', href: '/living/studio?space=pets-and-everyday' },
];


/** The pieces: catalogue products (priced, proposed) and lab items (designed, unpriced), each with its render. */
const PIECES: { handle: string; art: string; name?: string }[] = [
  { handle: 'al-pod-standard', art: 'pods-fish' },
  { handle: 'al-pod-mini', art: 'pods-mini-earbuds' },
  { handle: 'al-pod-tall', art: 'pods-cards' },
  { handle: 'al-pod-long', art: 'pods-pens' },
  { handle: 'lab-fish-ruler', art: 'ruler-fish-sky', name: 'fish ruler' },
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

function KeyGlyph() {
  return (
    <svg viewBox="0 0 68 36" aria-hidden focusable="false">
      <rect x="2" y="9" width="64" height="18" rx="9" fill="#240b21" />
      <circle cx="54" cy="18" r="3.2" fill="#fffdf8" />
    </svg>
  );
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
      <section className="ls-hero" aria-labelledby="ls-title">
        <div className="lv-wrap ls-hero-grid">
          <div className="ls-hero-copy">
            <p className="ls-wordmark">dayrally <KeyGlyph /></p>
            <h1 id="ls-title">one system.<br />endless days.</h1>
            <p className="ls-sub">3D printed kits for your room, your bike, your bag and the dog. One key clicks them all together.</p>
            <div className="lv-actions">
              <Link href="/living/studio" className="ls-btn">show us your space →</Link>
              <a href="#ls-shop" className="ls-btn" data-variant="ghost">see the kits ↓</a>
            </div>
            <span className="ls-tag">designed · not yet printed · nothing for sale yet</span>
          </div>
          <HeroWall stage={SUN} caption={false} />
        </div>
      </section>

      <div className="lv-wrap">
        <nav className="ls-tiles" aria-label="pick a door">
          {DOORS.map((d) => (
            <Link key={d.id} href={d.href} className="ls-tile">
              <div className="ls-tile-art"><Image src={d.art} alt="" fill sizes="(max-width: 700px) 45vw, 15vw" /></div>
              <b>{d.name}</b>
              <small>{d.sub}</small>
            </Link>
          ))}
        </nav>

        <section className="ls-band" aria-label="little adventures count">
          <div className="ls-band-art"><Image src="/living/alpha/pods-beach.png" alt="A dayrally standard pod open with the beach insert: a sun balm tin, two lip balm tins and a key ring in their pockets, the lid behind. Rendered from the print files; the things are stand-ins at real size" fill sizes="(max-width: 720px) 100vw, 50vw" /></div>
          <div className="ls-band-copy">
            <span className="ls-note">little adventures count.</span>
            <h2>same key.<br />out the door.</h2>
            <p className="lv-small">{POD_CONTENTS_NOTE}</p>
            <Link href="/living/widget/al-kit-dayrally-everyday-kit" className="ls-btn">see the everyday kit →</Link>
          </div>
        </section>

        <section className="ls-section" id="ls-shop" aria-labelledby="ls-featured">
          <div className="ls-head">
            <h2 id="ls-featured">the pieces.</h2>
            <Link href="/living/widget">all {CAD_MANIFEST.products.length + WIDGET_LAB.length} →</Link>
          </div>
          <p className="lv-small">{POD_CONTENTS_NOTE}</p>
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

        <section className="ls-section" id="ls-home" aria-labelledby="ls-home-title">
          <div className="ls-head">
            <h2 id="ls-home-title">at home.</h2>
            <span className="ls-mono">shelving · furniture · decor · real CAD · unprinted</span>
          </div>
          <p className="lv-small">The house range from the AC-02 real-CAD collection: a shelf, a wall station, two valets, a planter, a shade, a clock, desk rails, vanity organisers and the pet walk kit. Pictured from their CAD, not from a print. No price until samples pass.</p>
          <div className="ls-grid">
            {HOME_RANGE.map((x) => (
              <Link key={x.handle} href={`/living/widget/${x.handle}`} className="ls-card" data-art="cad">
                <div className="ls-card-art"><Image src={x.preview} alt={`${x.name}: ${x.line}. CAD preview, not a print`} fill sizes="(max-width: 680px) 50vw, 25vw" /></div>
                <b>{x.name}</b>
                <small className="ls-line-sub">{x.line}</small>
                <div className="ls-price">
                  <span>{x.group}</span>
                  <small>prototype · unpriced</small>
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

        <section className="ls-band" aria-label="show us your space">
          <div className="ls-band-copy">
            <span className="ls-note">your room. your way.</span>
            <h2>photo in.<br />design out.</h2>
            <Link href="/living/studio" className="ls-btn">show us your space →</Link>
          </div>
          <div className="ls-band-art"><Image src="/living/alpha/teen-room-flatlay.png" alt="The teen room starter: boards, a name plate, hooks, a shelf and a cup" fill sizes="(max-width: 720px) 100vw, 50vw" /></div>
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
