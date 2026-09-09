/**
 * Higgsfield / CoS media registry for the cinematic homepage (declutter PREVIEW).
 *
 * Visual system = video + stills (no R3F mesh clutter on `/`).
 * Kate-approved package:
 * - still A fa6fe811 — hero poster
 * - still B 2e5e76fe — wait / mid scroll still
 * - video  9a8c5c81 — full-bleed hero loop
 *
 * Prefer vendored `/public/cinematic-home/*` over CloudFront hotlinks.
 */

export type CinematicMediaSlotId = 'hero' | 'mid' | 'assemble';

export type CinematicMediaSlotDef = {
  id: CinematicMediaSlotId;
  /** CoS / Higgsfield job id when known. */
  jobId?: string;
  label: string;
  /** Prefer `<video>` when videoReady; component falls back to poster. */
  videoSrc: string;
  posterSrc: string;
  /** True once the mp4 is committed under public/. */
  videoReady: boolean;
  /** Scroll progress window [start, end] for atmosphere crossfade (0–1). */
  progressRange: readonly [number, number];
};

export const CINEMATIC_MEDIA = {
  hero: {
    id: 'hero',
    jobId: '9a8c5c81-6689-4807-bdb2-f1a1d396baa0',
    label: 'hero loop · Cinema Studio assemble-on-plum',
    videoSrc: '/cinematic-home/hf-9a8c5c81.mp4',
    posterSrc: '/cinematic-home/hf-fa6fe811.png',
    videoReady: true,
    progressRange: [0, 0.28] as const,
  },
  mid: {
    id: 'mid',
    jobId: '2e5e76fe-0bd9-4762-beab-098b4bdc4190',
    label: 'mid-scroll assemble beat · Kate-approved still B',
    /** Mid beat prefers still B; video may loop behind as atmosphere. */
    videoSrc: '/cinematic-home/hf-9a8c5c81.mp4',
    posterSrc: '/cinematic-home/hf-2e5e76fe.png',
    videoReady: false,
    progressRange: [0.22, 0.72] as const,
  },
  assemble: {
    id: 'assemble',
    jobId: '9a8c5c81-6689-4807-bdb2-f1a1d396baa0',
    label: 'assemble beat · Cinema Studio 3.0 loop',
    videoSrc: '/cinematic-home/hf-9a8c5c81.mp4',
    posterSrc: '/cinematic-home/hf-2e5e76fe.png',
    videoReady: true,
    progressRange: [0.55, 1] as const,
  },
} as const satisfies Record<CinematicMediaSlotId, CinematicMediaSlotDef>;

export const CINEMATIC_MEDIA_SLOTS: readonly CinematicMediaSlotDef[] = [
  CINEMATIC_MEDIA.hero,
  CINEMATIC_MEDIA.mid,
  CINEMATIC_MEDIA.assemble,
];
