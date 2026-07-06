import { Cormorant_Garamond } from 'next/font/google';

/**
 * PersonalOpener — the first thing Nick reads. A quiet personal note above the
 * product hero. "tēnā koe, Nick" is the only greeting; the italic line carries
 * the 16A Hubert Henderson hook — the house Kate lived in, that TOA drew the
 * extension for. No emoji, no exclamation. Cormorant lowercase, line two italic
 * (DIRECTION-LOCKED-2026-07-01).
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
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
