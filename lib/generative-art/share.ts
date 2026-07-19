import type { FamilyId } from './families';

interface ShareCopy {
  title: string;
  text: string;
}

/** One-line share copy per family — a shape a viewer can read at a glance. */
export function shareCopyFor(family: FamilyId, presetLabel: string): ShareCopy {
  const map: Record<FamilyId, string> = {
    line: `Just made ${presetLabel} in the assembl creative playground — layered translucent line art, entirely in the browser`,
    chrome: `${presetLabel} — real-time chrome + glass in the assembl creative playground`,
    flow: `${presetLabel} — particle flow through curl noise, in the assembl creative playground`,
    constellation: `${presetLabel} — a network of nodes and edges, from the assembl creative playground`,
    grid: `${presetLabel} — algorithmic grid, from the assembl creative playground`,
    waves: `${presetLabel} — real-time silk sheet, from the assembl creative playground`,
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
