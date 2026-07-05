'use client';

/**
 * KidsLessons — short animated "motion lessons" for tamariki learning to fish.
 *
 * Pure inline-SVG + CSS-keyframe animation (no video asset needed; a real
 * video can slot into each card later). Each lesson loops a simple motion —
 * baiting a hook, a safe cast, tying a hook, letting a fish go gently — with
 * plain kid-friendly steps. All motion pauses under prefers-reduced-motion.
 */

const GOLD = '#BFA37A';
const CORAL = '#C97B63';
const PAUA = '#2E7D74';
const INK = '#2A2620';

type Lesson = { title: string; steps: string[]; art: React.ReactNode };

const LESSONS: Lesson[] = [
  {
    title: 'Bait the hook',
    steps: ['Hold the hook by the bend, point away from your fingers.', 'Thread the bait on so the point just peeks out.', 'A grown-up checks it before you cast.'],
    art: (
      <svg viewBox="0 0 120 120" width="100%" height="120" aria-hidden>
        <path d="M60 20 L60 62 Q60 84 42 84 Q30 84 30 72" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M30 72 l-5 -6 M30 72 l7 -3" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <g className="ml-bait">
          <ellipse cx="42" cy="82" rx="11" ry="8" fill={CORAL} />
          <ellipse cx="42" cy="82" rx="5" ry="3.5" fill="#e6b4a2" />
        </g>
      </svg>
    ),
  },
  {
    title: 'Cast it safe',
    steps: ['Look behind you — is it clear?', 'Point the rod up, then gently lob it out.', 'No big swings near people.'],
    art: (
      <svg viewBox="0 0 120 120" width="100%" height="120" aria-hidden>
        <g className="ml-rod" style={{ transformOrigin: '30px 100px' }}>
          <line x1="30" y1="100" x2="86" y2="34" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
        </g>
        <path className="ml-line" d="M86 34 Q104 60 96 92" fill="none" stroke={PAUA} strokeWidth="2" strokeDasharray="120" />
        <circle className="ml-sinker" cx="96" cy="92" r="4" fill={INK} />
      </svg>
    ),
  },
  {
    title: 'Tie a hook (uni knot)',
    steps: ['Thread the line through the eye, make a loop.', 'Wrap through the loop 4–5 times.', 'Wet it, pull it tight, trim the tag.'],
    art: (
      <svg viewBox="0 0 120 120" width="100%" height="120" aria-hidden>
        <path d="M20 60 L70 60" stroke={INK} strokeWidth="3" />
        <circle cx="78" cy="60" r="9" fill="none" stroke={INK} strokeWidth="3" />
        <path className="ml-knot" d="M70 60 q18 -20 30 0 q-14 22 -30 6" fill="none" stroke={GOLD} strokeWidth="3" strokeDasharray="140" />
      </svg>
    ),
  },
  {
    title: 'Let it go gently',
    steps: ['Wet your hands first.', 'Hold it softly, no fingers in the gills.', 'Point it into the water and let it swim off.'],
    art: (
      <svg viewBox="0 0 120 120" width="100%" height="120" aria-hidden>
        <path d="M4 96 q30 -6 60 0 t56 0" fill="none" stroke={PAUA} strokeWidth="2" opacity="0.5" />
        <g className="ml-fish">
          <ellipse cx="52" cy="60" rx="26" ry="14" fill={CORAL} />
          <path d="M78 60 l16 -10 l-4 10 l4 10 z" fill="#b06a54" />
          <circle cx="34" cy="56" r="3" fill={INK} />
        </g>
      </svg>
    ),
  },
];

export function KidsLessons() {
  return (
    <div className="kl-grid">
      {LESSONS.map((l, i) => (
        <div key={l.title} className="kl-card" style={{ animationDelay: `${i * 90}ms` }}>
          <div className="kl-art">{l.art}</div>
          <h3 style={{ fontFamily: 'var(--font-brand-display)', fontSize: 18, fontWeight: 600, color: INK, margin: '4px 0 0' }}>{l.title}</h3>
          <ol style={{ margin: '10px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {l.steps.map((s) => (
              <li key={s} style={{ fontSize: 12.5, lineHeight: 1.5, color: '#5b5548' }}>{s}</li>
            ))}
          </ol>
        </div>
      ))}
      <style jsx>{`
        .kl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; }
        .kl-card {
          border: 1px solid ${GOLD}55; border-radius: 20px; padding: 16px 18px 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,255,255,0.62));
          backdrop-filter: blur(12px); box-shadow: 0 16px 44px rgba(154,123,58,0.12), inset 0 1px 0 rgba(255,255,255,0.7);
          opacity: 0; transform: translateY(14px); animation: kl-in 0.6s ease forwards;
        }
        .kl-art { display: grid; place-items: center; height: 120px; }
        @keyframes kl-in { to { opacity: 1; transform: none; } }
        :global(.ml-bait) { animation: ml-bait 2.6s ease-in-out infinite; }
        @keyframes ml-bait { 0% { transform: translate(28px,-10px); opacity: 0; } 35% { opacity: 1; } 60%,100% { transform: translate(0,0); opacity: 1; } }
        :global(.ml-rod) { animation: ml-rod 2.8s ease-in-out infinite; }
        @keyframes ml-rod { 0%,100% { transform: rotate(0deg); } 30% { transform: rotate(-22deg); } 55% { transform: rotate(8deg); } }
        :global(.ml-line) { animation: ml-line 2.8s ease-in-out infinite; }
        @keyframes ml-line { 0%,45% { stroke-dashoffset: 120; opacity: 0; } 70% { opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 1; } }
        :global(.ml-sinker) { animation: ml-sinker 2.8s ease-in-out infinite; }
        @keyframes ml-sinker { 0%,55% { opacity: 0; } 75%,100% { opacity: 1; } }
        :global(.ml-knot) { animation: ml-knot 3s ease-in-out infinite; }
        @keyframes ml-knot { 0% { stroke-dashoffset: 140; } 70%,100% { stroke-dashoffset: 0; } }
        :global(.ml-fish) { animation: ml-fish 3s ease-in-out infinite; transform-origin: 52px 60px; }
        @keyframes ml-fish { 0%,60% { transform: translateX(0) rotate(0deg); } 70% { transform: translateX(0) rotate(-6deg); } 100% { transform: translateX(70px) rotate(4deg); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .kl-card { animation: none; opacity: 1; transform: none; }
          :global(.ml-bait), :global(.ml-rod), :global(.ml-line), :global(.ml-sinker), :global(.ml-knot), :global(.ml-fish) { animation: none; }
          :global(.ml-line), :global(.ml-knot) { stroke-dashoffset: 0; }
          :global(.ml-sinker) { opacity: 1; }
          :global(.ml-bait) { transform: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
