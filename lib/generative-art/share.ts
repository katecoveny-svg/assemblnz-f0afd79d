import type { FamilyId } from './families';

interface ShareCopy {
  title: string;
  text: string;
}

/** One-line share copy per family — a shape a viewer can read at a glance. */
export function shareCopyFor(family: FamilyId, presetLabel: string): ShareCopy {
  const map: Record<FamilyId, string> = {
    assembly: `${presetLabel} assembling, from assembl generative assembly`,
    orbit: `${presetLabel} — rings around a core, from assembl generative assembly`,
    line: `Just made ${presetLabel} in assembl generative assembly — layered translucent line art, entirely in the browser`,
    chrome: `${presetLabel} — real-time chrome + glass in assembl generative assembly`,
    flow: `${presetLabel} — particle flow through curl noise, in assembl generative assembly`,
    constellation: `${presetLabel} — a network of nodes and edges, from assembl generative assembly`,
    grid: `${presetLabel} — algorithmic grid, from assembl generative assembly`,
    waves: `${presetLabel} — real-time silk sheet, from assembl generative assembly`,
    reaction: `${presetLabel} — Gray-Scott chemistry live on the GPU, from assembl generative assembly`,
    boids: `${presetLabel} — flocking physics, from assembl generative assembly`,
    attractors: `${presetLabel} — chaos in phase space, from assembl generative assembly`,
    growth: `${presetLabel} — L-system fractal growth, from assembl generative assembly`,
    chladni: `${presetLabel} — Chladni resonance patterns, from assembl generative assembly`,
    verlet: `${presetLabel} — Verlet spring-mesh cloth, from assembl generative assembly`,
    marble: `${presetLabel} — ink-on-water marbling, from assembl generative assembly`,
    terrain: `${presetLabel} — 3D heightmap terrain, from assembl generative assembly`,
    sandpile: `${presetLabel} — Bak-Tang-Wiesenfeld avalanche, from assembl generative assembly`,
    ripples: `${presetLabel} — 2D wave equation on a pond, from assembl generative assembly`,
    dla: `${presetLabel} — diffusion-limited coral growth, from assembl generative assembly`,
  };
  return {
    title: `${presetLabel} · assembl`,
    text: map[family],
  };
}

export interface ShareIntent {
  key: 'twitter' | 'linkedin' | 'facebook' | 'reddit' | 'copy';
  label: string;
  href?: string;
  onClick?: () => Promise<void> | void;
}

/**
 * Build the intent URLs for a given share URL + text. Runs entirely in
 * the browser — no share tokens or backend involved.
 */
export function shareIntents(url: string, text: string): ShareIntent[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return [
    {
      key: 'twitter',
      label: 'x / twitter',
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    },
    {
      key: 'linkedin',
      label: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    },
    {
      key: 'facebook',
      label: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`,
    },
    {
      key: 'reddit',
      label: 'reddit',
      href: `https://www.reddit.com/submit?url=${u}&title=${t}`,
    },
  ];
}

/**
 * Try the browser-native share sheet (mobile). Includes the PNG when the
 * browser supports file sharing. Resolves to true on success, false if
 * unsupported or the user cancelled.
 */
export async function tryNativeShare(args: {
  url: string;
  title: string;
  text: string;
  pngBlob?: Blob | null;
  filename?: string;
}): Promise<boolean> {
  const nav = globalThis.navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  if (typeof nav?.share !== 'function') return false;

  const withFile: ShareData & { files?: File[] } = {
    title: args.title,
    text: args.text,
    url: args.url,
  };
  if (args.pngBlob) {
    try {
      const file = new File([args.pngBlob], args.filename ?? 'assembl.png', {
        type: 'image/png',
      });
      const withFilePayload = { ...withFile, files: [file] };
      if (nav.canShare?.(withFilePayload)) {
        await nav.share(withFilePayload);
        return true;
      }
    } catch {
      // fall through to url-only share
    }
  }
  try {
    await nav.share(withFile);
    return true;
  } catch {
    return false;
  }
}
