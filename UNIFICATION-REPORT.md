# Evidence Vessel Unification Report

Updated: 2026-05-15

## Imagery

- Next.js homepage hero and kete grid now prefer local vessel imagery where assets exist.
- Legacy SPA homepage hero and kete grid now use the same Evidence Vessel image language.
- Available vessel assets wired on both surfaces:
  - Manaaki: `manaaki-vessel.png`
  - Pīkau: `pikau-vessel.jpg`
  - Tōro: `toro-vessel.png`
- Missing vessel assets were not generated tonight, per instruction. Waihanga, Arataki, Auaha, Ako, Mātauranga, and Hoko use accent-colour monogram fallbacks in card/grid contexts.

## Video

- `vessel-rotate-720p.mp4` is wired as a subtle ambient texture behind the Next.js homepage vessel hero.
- The same video is used behind the Next.js kete CTA band and the legacy SPA final CTA band at low opacity.
- Legacy SPA `HeroNext` uses the video behind the Tōro vessel still, with the still image remaining the centrepiece.
- Reduced-motion users get the static final state; ambient video is hidden.

## Motion

- Core content reveals in the touched Next.js and SPA homepage/kete surfaces now start at opacity `0.7` or higher.
- Kete card reveals use the locked pattern: opacity `0.7`, `y: 12`, 80ms stagger, 400ms ease-out.
- Hover motion is restrained to quiet pounamu/accent fades, scale `1.02`, and `y: -2px`.
- Pearl Live keeps its numbers static; only the leading dot pulses gently from opacity `0.7` to `1` to `0.7`.
- Decorative-only sparkles and feather whispers retain opacity `0` where they are purely ornamental.

## Skipped

- No new vessel imagery was generated.
- Kete hero image replacement for Waihanga, Arataki, Auaha, Ako, Mātauranga, and Hoko was skipped because no matching local vessel assets exist in `public/img/kete` or `legacy-vite/public/img/kete`.
- `legacy-vite/public/tools/vessel-studio.html`, routing files, Supabase files, auth/API routes, middleware, and Next config were left untouched.
