import Image from 'next/image';
import Link from 'next/link';
import { HOME_RANGE } from '@/lib/living';

/**
 * The rest of the room, inside the studio: shelving, furniture and decor from the AC-02 collection, each opening its
 * prototype widget. The studio's board carries the Grid wall pieces; these stand beside it, unpriced until samples pass.
 */
export function HomeRangeStrip({ heading = 'and the rest of the room.' }: { heading?: string }) {
  return (
    <section className="lv-panel lv-home" aria-labelledby="lv-home-title">
      <div className="lv-section-head" style={{ marginBottom: 0 }}>
        <span className="lv-eyebrow">at home · shelving · furniture · decor</span>
        <h2 id="lv-home-title">{heading}</h2>
        <p className="lv-small">Real CAD from the AC-02 collection, pictured from the CAD, not from a print. Open one to see its parts and the assembled view. No price until samples pass.</p>
      </div>
      <div className="lv-home-row">
        {HOME_RANGE.map((x) => (
          <Link key={x.handle} href={`/living/widget/${x.handle}`} className="lv-home-card">
            <span className="lv-home-art"><Image src={x.preview} alt={`${x.name}: ${x.line}. CAD preview, not a print`} fill sizes="(max-width: 700px) 60vw, 220px" /></span>
            <b>{x.name}</b>
            <small>{x.group} · prototype</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
