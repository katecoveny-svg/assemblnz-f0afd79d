import localFont from 'next/font/local';


/**
 * PersonalOpener — the first thing Nick reads. A quiet personal note above the
 * product hero. "tēnā koe, Nick" is the only greeting; the italic line carries
 * the 16A Hubert Henderson hook — the house Kate lived in, that TOA drew the
 * extension for. No emoji, no exclamation. Cormorant lowercase, line two italic
 * (DIRECTION-LOCKED-2026-07-01).
 */
const cormorant = localFont({
  src: [
    { path: '../../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../../lib/fonts/assets/cormorant-garamond-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../../lib/fonts/assets/cormorant-garamond-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../../lib/fonts/assets/cormorant-garamond-italic.woff2', weight: '500', style: 'italic' },
    { path: '../../../lib/fonts/assets/cormorant-garamond-italic.woff2', weight: '600', style: 'italic' },
  ],
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Cormorant Garamond Build Fallback'],
});

export function PersonalOpener() {
  return (
    <section aria-label="A note for Nick" className="max-w-2xl px-1">
      <h2
        className={`${cormorant.className} lowercase text-3xl leading-[1.05] md:text-4xl`}
        style={{ color: '#161516' }}
      >
        tēnā koe, Nick.
      </h2>
      <p
        className={`${cormorant.className} mt-2 text-xl italic leading-snug md:text-2xl`}
        style={{ color: '#4a4a42' }}
      >
        remember 16A Hubert Henderson? here&apos;s what ARC could have handled
        while you drew.
      </p>
    </section>
  );
}
