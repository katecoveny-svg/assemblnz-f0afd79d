

## Upgrade KeteParticleCanvas to Match Reference Image

The reference image shows **flowing woven strands with intense volumetric glow** — thick harakeke-textured fibers radiating from a vanishing point, bathed in bright cyan/teal light with golden accents. The current canvas is a kete-shaped constellation of dots with thin connections. This plan transforms it into something much closer to the reference.

### What Changes

**1. KeteParticleCanvas.tsx — Complete visual overhaul**

- **Flowing strands instead of dot-to-dot connections**: Replace the paired quadratic bezier connections with long, continuous flowing curves that sweep across the canvas from a perspective vanishing point (bottom-center toward top-corners), like harakeke fibers being pulled from the earth
- **Thicker, luminous strands**: Increase line widths from 0.8-1.2px to 2-4px with heavy `ctx.shadowBlur` (15-25px) in cyan/teal to create the volumetric glow from the reference
- **Strand texture**: Add a subtle herringbone/chevron pattern along the thicker gold strands by drawing tiny V-shaped marks at intervals — mimicking the woven texture visible in the reference
- **Perspective depth**: Strands converge toward a central vanishing point with parallax — closer strands are brighter/wider, distant ones are thinner/dimmer
- **Particle sparkle**: Scatter tiny bright point particles (1-2px, high opacity) along and between strands — the "digital dust" visible in the reference
- **Brighter color palette**: Push the teal from `rgba(58,125,110)` up to `rgba(79,228,167)` and `rgba(0,220,200)` for the intense cyan glow; keep gold strands as warm contrast
- **Ambient fog/mist**: Draw soft, large radial gradients (200-400px radius, very low opacity) drifting slowly across the canvas to simulate the atmospheric haze in the reference

**2. Index.tsx hero background**

- Deepen the radial gradient bloom behind the canvas — increase pounamu glow from 12% to 18% opacity to let the strands feel like they're emitting light into the surrounding space
- Add a subtle animated CSS radial gradient pulse (scale breathing 1.0-1.05 over 4s) on the backdrop glow layer

### Technical Approach

- All rendering stays on a single 2D canvas for performance
- Strands are drawn as long bezier paths (8-12 control points each) rather than short node-to-node segments
- `ctx.shadowBlur` and `ctx.shadowColor` handle the volumetric glow (GPU-accelerated on most browsers)
- Mouse interaction: strands near cursor brighten and warp slightly toward it (existing logic, amplified)
- Mobile: reduce strand count from ~24 to ~12, reduce shadowBlur from 20 to 8

### Files Modified
- `src/components/whariki/KeteParticleCanvas.tsx` — rewrite drawing logic
- `src/pages/Index.tsx` — adjust hero background glow layers

