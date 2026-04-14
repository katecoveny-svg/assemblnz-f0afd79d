

# Make Hero Text Stand Out Over New Video

## What changes
1. **Replace the hero video** with the newly uploaded `Māori_weaving_expanding_202604141815-2.mp4`
2. **Add a dark gradient overlay** between the video and text to ensure legibility — a semi-transparent scrim that darkens the center/bottom where text sits
3. **Add text shadow / backdrop** to the heading and subtitle so they pop against any busy video frame:
   - `text-shadow` with a soft dark glow on the h1
   - Slight frosted backdrop panel behind the text block (subtle, not a solid box — a soft radial dark wash)
4. **Reduce video opacity** slightly (from `opacity-80` to `opacity-60`) so the text layer dominates

## Technical detail

### Files
- **`public/hero-woven-video.mp4`** — replace with new upload
- **`src/pages/Index.tsx`** lines 166-176, 178-226:
  - Video: change opacity class to `opacity-60`
  - Add a new overlay div after the vignette: centered dark radial gradient scrim (`rgba(6,14,28,0.6)` center fading to transparent) positioned behind `z-10` text
  - h1: add `textShadow: "0 2px 30px rgba(0,0,0,0.8), 0 0 60px rgba(6,14,28,0.9)"`
  - Subtitle: add `textShadow: "0 1px 20px rgba(0,0,0,0.7)"`
  - Tagline ("Governed Intelligence"): add similar soft shadow
  - CTA buttons: add `backdrop-filter: blur(8px)` for glass effect against the video

