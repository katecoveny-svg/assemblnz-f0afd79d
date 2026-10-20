import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CAD_MANIFEST, DAYRALLY_KITS, INTERFACE_SPEC, KITS } from '@/lib/living';
import { fredoka } from './fonts';
import { HeroWall } from './HeroWall';
import './living.css';

export const metadata: Metadata = {
  title: 'dayrally · by assembl / living — one system. endless days.',
  description:
    '3D printed kits for your room, your bike, your bag and the dog, all on one 42 mm quarter-turn key. Show us your space, pick a kit, printed to order.',
};

const SUN = '#f5c400';

/** The category row: a picture and a name, nothing else. */
const DOORS: { id: string; name: string; sub: string; art: string; href: string }[] = [
  { id: 'ride', name: 'ride', sub: 'bike', art: 'bike-set-sun', href: '/living/widget/al-kit-dayrally-ride-kit' },
  { id: 'scoot', name: 'scoot', sub: 'scooter', art: 'scoot-set-sun', href: '/living/widget/al-kit-dayrally-scoot-kit' },
  { id: 'fish', name: 'fish', sub: 'wharf & beach', art: 'rod-packed-lime', href: '/living/widget/al-kit-dayrally-fish-kit' },
  { id: 'everyday', name: 'everyday', sub: 'bag & belt', art: 'dayrally-everyday-flatlay', href: '/living/widget/al-kit-dayrally-everyday-kit' },
  { id: 'my-room', name: 'my room', sub: 'wall & desk', art: 'teen-room-flatlay', href: '/living/studio?space=my-room' },
  { id: 'my-space', name: 'my space', sub: 'vanity & drawer', art: 'vanity-cutout-sage', href: '/living/studio?space=my-space' },
  { id: 'work-and-create', name: 'work', sub: 'bench & workshop', art: 'shelf-3-sage', href: '/living/studio?space=work-and-create' },
  { id: 'pets-and-everyday', name: 'pets', sub: 'leads & names', art: 'hook-clay', href: '/living/studio?space=pets-and-everyday' },
];

/** Featured pieces: the catalogue handle and its render. */
const FEATURED: { handle: string; art: string }[] = [
  { handle: 'al-pod-standard', art: 'pod-standard-sky-waves' },
  { handle: 'al-board-4x4', art: 'board-4x4-chalk' },
  { handle: 'al-name-plate', art: 'name-plate-plum-mila' },
  { handle: 'al-number-plate', art: 'number-plate-lime' },
  { handle: 'al-hook', art: 'hook-clay' },
  { handle: 'al-shelf-3', art: 'shelf-3-sage' },
  { handle: 'al-cup', art: 'cup-plum' },
  { handle: 'al-bin-2', art: 'bin-2-oat' },
];

function nzd(n: number) {
  return `NZ$${n.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}`;
}

function KeyGlyph() {
  return (
    <svg viewBox="0 0 68 36" aria-hidden focusable="false">
      <rect x="2" y="9" width="64" height="18" rx="9" fill="#1a1a1a" />
      <circle cx="54" cy="18" r="3.2" fill="#fffdf8" />
    </svg>
  );
}

export default function AssemblLivingPage() {
  const served = CAD_MANIFEST.parts.filter((p) => p.file).length;
  const products = new Map(CAD_MANIFEST.products.map((p) => [p.handle, p]));
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
              <div className="ls-tile-art"><Image src={`/living/alpha/${d.art}.png`} alt="" fill sizes="(max-width: 700px) 45vw, 15vw" /></div>
              <b>{d.name}</b>
              <small>{d.sub}</small>
            </Link>
          ))}
        </nav>

        <section className="ls-band" aria-label="little adventures count">
          <div className="ls-band-art"><Image src="/living/alpha/dayrally-everyday-flatlay.png" alt="The dayrally everyday kit: a pod, its lid and insert, a bag tag and a charm, rendered from the print files" fill sizes="(max-width: 720px) 100vw, 50vw" /></div>
          <div className="ls-band-copy">
            <span className="ls-note">little adventures count.</span>
            <h2>same key.<br />out the door.</h2>
            <Link href="/living/widget/al-kit-dayrally-everyday-kit" className="ls-btn">see the everyday kit →</Link>
          </div>
        </section>

        <section className="ls-section" id="ls-shop" aria-labelledby="ls-featured">
          <div className="ls-head">
            <h2 id="ls-featured">featured.</h2>
            <Link href="/living/widget">view all →</Link>
          </div>
          <div className="ls-grid">
            {FEATURED.map(({ handle, art }) => {
              const p = products.get(handle);
              if (!p) return null;
              return (
                <Link key={handle} href={`/living/widget/${handle}`} className="ls-card">
                  <div className="ls-card-art"><Image src={`/living/alpha/${art}.png`} alt={p.title} fill sizes="(max-width: 680px) 50vw, 25vw" /></div>
                  <b>{p.title.replace('dayrally ', '').toLowerCase()}</b>
                  <div className="ls-price"><span>{nzd(p.price_nzd)}</span><small>proposed</small></div>
                  <span className="ls-btn" data-variant="small">see it →</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="ls-section" aria-labelledby="ls-kits-title">
          <div className="ls-head">
            <h2 id="ls-kits-title">kits.</h2>
            <span className="ls-mono">one key · {INTERFACE_SPEC.pitch_mm} mm · click, lock, go</span>
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
            <li className="ls-mono">{served} print files · {CAD_MANIFEST.pack}</li>
            <li className="ls-mono">designed · not yet printed · nothing for sale yet</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
