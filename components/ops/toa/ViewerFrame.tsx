'use client';

import { useEffect, useRef, useState } from 'react';
import { ArcChatPanel } from '@/components/ops/toa/ArcChatPanel';

/**
 * ViewerFrame — hosts Kate's BIM viewer (verbatim, in an iframe) with a
 * matariki-style loader while it boots, a floating ARC chat overlay anchored
 * bottom-left (the viewer's own controls live top-right), and the
 * walk-the-site escape hatch.
 */
const VIEWER = '/brand/toa-architects/16a-hubert-henderson/bim-viewer-enhanced.html';
const WALKTHROUGH = '/brand/toa-architects/16a-hubert-henderson/bim-walkthrough.html';
const CHAMPAGNE = '#bfa37a';

/** Nine-star cluster, champagne, gently pulsing while the viewer loads. */
function MatarikiLoader() {
  const stars: Array<[number, number, number, number]> = [
    // x%, y%, size px, delay s — loose Matariki cluster arrangement
    [50, 30, 10, 0],
    [38, 42, 7, 0.2],
    [61, 40, 8, 0.35],
    [30, 58, 6, 0.5],
    [47, 55, 9, 0.15],
    [66, 57, 6, 0.6],
    [41, 70, 7, 0.45],
    [57, 72, 6, 0.25],
    [72, 68, 5, 0.55],
  ];
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: '#161516' }}
    >
      <style>{`
        @keyframes mata-pulse { 0%,100% { opacity: 0.25; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.1); } }
        @media (prefers-reduced-motion: reduce) { .mata-star { animation: none !important; opacity: 0.8; } }
      `}</style>
      <div className="relative h-44 w-44">
        {stars.map(([x, y, s, d], i) => (
          <span
            key={i}
            className="mata-star absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: s,
              height: s,
              backgroundColor: CHAMPAGNE,
              animation: `mata-pulse 1.8s ease-in-out ${d}s infinite`,
              boxShadow: `0 0 ${s * 1.6}px ${CHAMPAGNE}66`,
            }}
          />
        ))}
      </div>
      <p
        className="absolute bottom-10 text-[11px] uppercase tracking-[0.3em]"
        style={{ color: `${CHAMPAGNE}aa` }}
      >
        loading the 16A model
      </p>
    </div>
  );
}

export function ViewerFrame() {
  const [loaded, setLoaded] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // The iframe often finishes loading before hydration attaches onLoad —
  // check readyState on mount, and time the loader out regardless so it can
  // never mask a working viewer.
  useEffect(() => {
    if (frameRef.current?.contentDocument?.readyState === 'complete') {
      setLoaded(true);
      return;
    }
    const t = setTimeout(() => setLoaded(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-[#161516]">
      <iframe
        ref={frameRef}
        src={VIEWER}
        title="16A Hubert Henderson Place — assembl BIM viewer (Enhanced)"
        className="block h-[72vh] min-h-[560px] w-full border-0"
        onLoad={() => setLoaded(true)}
      />
      {!loaded ? <MatarikiLoader /> : null}

      {/* viewer escape hatches — top-left, clear of the viewer's own controls */}
      <div className="absolute left-3 top-16 flex flex-col gap-1.5">
        <a
          href={WALKTHROUGH}
          target="_blank"
          rel="noreferrer"
          className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition hover:opacity-90"
          style={{ backgroundColor: CHAMPAGNE, color: '#1a1918' }}
        >
          walk the site →
        </a>
        <a
          href={VIEWER}
          target="_blank"
          rel="noreferrer"
          className="rounded-full px-3 py-1.5 text-[11px] text-white/90 transition hover:opacity-90"
          style={{ backgroundColor: 'rgba(22,21,22,0.75)' }}
        >
          full screen ↗
        </a>
      </div>

      {/* ARC chat overlay — top-left over empty canvas sky, below the walk
          pills; never fights the viewer's bottom audit drawer. Collapsible. */}
      {chatOpen ? (
        <div className="absolute left-3 top-[136px] w-[320px] max-w-[calc(100%-24px)] shadow-2xl">
          <div className="relative">
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              aria-label="Minimise ARC chat"
              className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#161516] text-xs text-white shadow"
            >
              –
            </button>
            <ArcChatPanel
              greeting="Kia ora Nick — the Te Aranga audit for 16A is drafted. B1 bracing and E2 weathertightness still need spec — want me to draft those next?"
              openers={[
                {
                  q: 'Yes — draft the B1 and E2 specs',
                  a: 'On it. B1: bracing schedule per NZS 3604 with the calcs the viewer flags as NEEDS SPEC. E2: weatherboard junctions against the E2/AS1 risk matrix, picking up the Work Section 2640 cladding spec already on file. Both land in your queue as drafts — nothing is issued until you approve.',
                },
                {
                  q: 'What did the Te Aranga audit surface?',
                  a: 'Six questions worth taking to the cultural lead and mana whenua — framed from the seven public principles, no determinations made. The audit names the rohe and stays a draft for review with mana whenua; open it from the Consent Companion tile below. That call is never mine.',
                },
                {
                  q: 'What blocks lodgement right now?',
                  a: 'One thing: the geotech PS1 + slope-stability statement for the 380 mm level difference. Third chase is drafted. The stormwater line note (E1) rides with it. Everything else on the pre-check is closed or in your queue.',
                },
              ]}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="absolute left-3 top-[136px] flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-xl"
          style={{ backgroundColor: '#0b1f3a', color: CHAMPAGNE, border: `1px solid ${CHAMPAGNE}55` }}
        >
          ARC · ask about 16A
        </button>
      )}
    </div>
  );
}
