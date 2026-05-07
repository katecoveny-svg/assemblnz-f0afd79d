import type { SocialSize } from './types';

// 15 social media size definitions, copied verbatim from the standalone.
export const EXPORT_SIZES: readonly SocialSize[] = [
  { group: 'Instagram', name: 'Post', w: 1080, h: 1080 },
  { group: 'Instagram', name: 'Portrait', w: 1080, h: 1350 },
  { group: 'Instagram', name: 'Story / Reel', w: 1080, h: 1920 },
  { group: 'TikTok', name: 'Vertical', w: 1080, h: 1920 },
  { group: 'LinkedIn', name: 'Post', w: 1200, h: 627 },
  { group: 'LinkedIn', name: 'Banner', w: 1584, h: 396 },
  { group: 'LinkedIn', name: 'Square', w: 1080, h: 1080 },
  { group: 'X', name: 'Post', w: 1600, h: 900 },
  { group: 'YouTube', name: 'Thumbnail', w: 1280, h: 720 },
  { group: 'YouTube', name: 'Channel Banner', w: 2560, h: 1440 },
  { group: 'Facebook', name: 'Post', w: 1200, h: 630 },
  { group: 'Facebook', name: 'Cover', w: 820, h: 312 },
  { group: 'Pinterest', name: 'Pin', w: 1000, h: 1500 },
  { group: 'Web', name: 'Hero', w: 1920, h: 1080 },
  { group: 'Web', name: 'Email Banner', w: 600, h: 200 },
];

export function slugifyName(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[\s/]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function fileNameFor(sz: SocialSize): string {
  return `${slugifyName(sz.group)}-${slugifyName(sz.name)}-${sz.w}x${sz.h}.jpg`;
}

export function sizeLabel(sz: SocialSize): string {
  return `${sz.group} · ${sz.name}`;
}
