/**
 * Device capability probing for the Living Interface — quality tiers come
 * from real probes (WebGL renderer string, core count, device memory,
 * viewport size), never user-agent sniffing.
 */

export type QualityTier = 'high' | 'medium' | 'low';

export type QualityProfile = {
  tier: QualityTier;
  /** Particles in the sculpture at this tier. */
  particleCount: number;
  /** Base point scale fed to the shader. */
  pointSize: number;
  /** Device-pixel-ratio ceiling for the canvas. */
  maxDpr: number;
};

const TIER_PROFILES: Record<QualityTier, Omit<QualityProfile, 'tier'>> = {
  high: { particleCount: 4600, pointSize: 1.55, maxDpr: 2 },
  medium: { particleCount: 2800, pointSize: 1.45, maxDpr: 1.75 },
  low: { particleCount: 1400, pointSize: 1.3, maxDpr: 1.25 },
};

/** Small viewports get a materially reduced count regardless of GPU. */
const SMALL_VIEWPORT_CAP = 1600;

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|mesa off?screen/i;

function probeRendererString(): { hasWebgl: boolean; renderer: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return { hasWebgl: false, renderer: '' };
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { hasWebgl: true, renderer };
  } catch {
    return { hasWebgl: false, renderer: '' };
  }
}

/**
 * Probe once per page. Returns null when WebGL context creation fails —
 * callers render the static fallback instead of a canvas.
 */
let cached: QualityProfile | null | undefined;

export function probeQuality(): QualityProfile | null {
  if (cached !== undefined) return cached;
  if (typeof window === 'undefined') return null;

  const { hasWebgl, renderer } = probeRendererString();
  if (!hasWebgl) {
    cached = null;
    return cached;
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

  let tier: QualityTier = 'medium';
  if (SOFTWARE_RENDERER.test(renderer)) {
    tier = 'low';
  } else if (cores >= 8 && memory >= 8) {
    tier = 'high';
  } else if (cores <= 4 || memory <= 4) {
    tier = 'low';
  }

  const profile: QualityProfile = { tier, ...TIER_PROFILES[tier] };

  // Viewport probe (real measurement, not UA): small screens drop the count
  // hard so mobile never renders a dense field it cannot animate at 30fps.
  if (window.innerWidth < 700) {
    profile.particleCount = Math.min(profile.particleCount, SMALL_VIEWPORT_CAP);
    profile.pointSize = Math.min(profile.pointSize, 1.3);
    profile.maxDpr = Math.min(profile.maxDpr, 1.5);
  }

  cached = profile;
  return cached;
}

/** Test/dev hook — clears the memoised probe. */
export function resetQualityProbe(): void {
  cached = undefined;
}
