import './type-lab.css';

/**
 * Six typographic directions for the homepage headline.
 *
 * Kate, 2026-07-28, with two Pinterest references — a MUSE editorial poster and
 * a NORD wordmark: "i like these text looks with the minamilist fonts and type
 * effects and placement can you play with some differetn visual satyles".
 *
 * Every study carries the SAME words, so what differs is only face, scale,
 * tracking, case, rhythm and placement. No 3D in here on purpose: the panels
 * are about type, and a canvas per panel would both slow the page and hide the
 * thing being judged. Internal, noindex.
 */

const LEDE =
  'Intuitive agentic customer journeys, built in Aotearoa — every enquiry, handover and follow-up designed to earn its keep. Including the waiting, which is the part everybody else writes off.';

export function TypeLab({ only }: { only?: number }) {
  // when a single study is requested, drop the chrome so the direction fills
  // the frame exactly as it would on a real page
  const show = (n: number) => only === undefined || only === n;
  return (
    <div className="tl" data-only={only ?? 'all'}>
      {only === undefined && (
      <header className="tl-head">
        <h1>Type directions</h1>
        <p>
          Six treatments · same words in every one · pick a direction, or parts of
          several — internal, not indexed
        </p>
      </header>
      )}

      {/* 01 — the MUSE poster */}
      {show(1) && (
      <section className="tl-study tl-editorial">
        <span className="tl-tag">01 — editorial</span>
        <div className="ed-main">
          <div className="ed-brand">
            assembl
            <small>Intuitive agentic customer journeys</small>
          </div>

          <h2 className="ed-h">
            Agentic customer journeys, <em>assembled.</em>
          </h2>

          <div>
            <div className="ed-folio">01</div>
            <div className="ed-rule" />
            <div className="ed-details">
              <div>
                <b>The wait</b>
                Value is created not just by outcomes, but by how intelligently we
                use the in-between moments. The wait state is no longer idle time.
              </div>
              <div>
                <b>The loop</b>
                Intent signal, wait prediction, value delivery, value exchange —
                and what they choose during it makes the next wait better.
              </div>
            </div>
          </div>
        </div>

        <div className="ed-side">
          <span className="ed-pill">NZ</span>
          Aotearoa // 2026
          <span>001 — agentic customer journeys</span>
        </div>

        <div className="tl-note">
          The space is the statement — headline small, margins enormous, masthead
          rotated down the edge. Reads as a design studio, not a SaaS page.
        </div>
      </section>
      )}

      {/* 02 — the NORD wordmark */}
      {show(2) && (
      <section className="tl-study tl-tracked">
        <span className="tl-tag">02 — tracked</span>
        <div>
          <div className="tk-word">ASSEMBL</div>
          <div className="tk-rule" />
          <div className="tk-sub">intuitive agentic customer journeys</div>
        </div>
        <div className="tl-note">
          One word, 0.42em tracking, nothing else in frame. Maximum confidence,
          minimum information — best as a landing beat that resolves on scroll.
        </div>
      </section>
      )}

      {/* 03 — edge to edge */}
      {show(3) && (
      <section className="tl-study tl-stack">
        <span className="tl-tag">03 — stack</span>
        <div>
          <div className="st-line">Agentic</div>
          <div className="st-line thin">customer</div>
          <div className="st-line rule">journeys,</div>
          <div className="st-line thin">assembled.</div>
          <p className="st-sub">{LEDE}</p>
        </div>
        <div className="tl-note">
          Type as texture: lines packed to 0.82 leading, alternating weight, one
          hairline for rhythm. Closest to what is live now, pushed harder.
        </div>
      </section>
      )}

      {/* 04 — the spec sheet */}
      {show(4) && (
      <section className="tl-study tl-spec">
        <span className="tl-tag">04 — spec</span>
        <div className="sp-hero">
          <h2>
            Agentic customer journeys, <b>assembled.</b>
          </h2>
        </div>
        <div className="sp-k">Anatomy</div>
        <div className="sp-v">Intent signal · wait prediction · value delivery · value exchange</div>
        <div className="sp-k">Built</div>
        <div className="sp-v">Aotearoa New Zealand</div>
        <div className="sp-k">The wait</div>
        <div className="sp-v">Designable, measurable, monetisable</div>
        <div className="sp-k">Approval</div>
        <div className="sp-v">A named person, every time</div>
        <div className="tl-note">
          Credibility from structure rather than scale. Suits the buyer who has to
          justify this to a board — and it is the only one that survives being
          screenshotted into a slide.
        </div>
      </section>
      )}

      {/* 05 — hollow display */}
      {show(5) && (
      <section className="tl-study tl-outline">
        <span className="tl-tag">05 — outline</span>
        <div>
          <div className="ol-h">
            Agentic customer
            <br />
            journeys,
            <br />
            <span className="hollow">assembled.</span>
          </div>
          <p className="ol-sub">{LEDE}</p>
        </div>
        <div className="tl-note">
          Drawn, not filled — so the sculpture stays visible through the counters,
          and the fill sweeps across so the word literally assembles. The only one
          that lets the 3D and the headline occupy the same space honestly.
        </div>
      </section>
      )}

      {/* 06 — rule and column */}
      {show(6) && (
      <section className="tl-study tl-split">
        <span className="tl-tag">06 — split</span>
        <h2 className="sl-h">
          The wait state is no longer idle time. <em>It&rsquo;s designable.</em>
        </h2>
        <div className="sl-bar" />
        <div className="sl-side">
          <span className="k">001 — Aotearoa</span>
          {LEDE}
        </div>
        <div className="tl-note">
          Cormorant, one hairline, everything hanging off it. Quietest of the six
          — and the only one that uses the serif already in the brand.
        </div>
      </section>
      )}
    </div>
  );
}
