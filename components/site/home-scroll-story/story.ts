// Home scroll story (30 Oct 2026): the lab's worlds assemble as the page scrolls.
// Find the friction. Assemble the journey. Prove the result.
// Every world is a lab simulation or render; each chapter carries its truth label in real text.

export type FrameSet = { dir: string; count: number; digits?: number };

export type Chapter = {
  id: string;
  kicker: string;
  /** Headline split so one word can carry the serif accent. */
  title: [before: string, accent: string, after?: string];
  body: string;
  /** Scroll-scrubbed frames, wide (desktop) and optionally square (phone). Played in order. */
  frames: FrameSet[];
  phoneFrames?: FrameSet[];
  /** Static frame for first paint, reduced motion and no-JS. */
  poster: string;
  phonePoster?: string;
  /** Truth label shown on the world, in real text. */
  label: string;
  world: string;
  /** Work steps that tick as the world assembles. Illustrative, never a live record. */
  steps: Array<{ tag: string; text: string }>;
  cta: { href: string; text: string };
  secondary?: { href: string; text: string };
};

export const frameSrc = (set: FrameSet, index: number): string =>
  `${set.dir}/f${String(index).padStart(set.digits ?? 3, '0')}.webp`;

/** All frame URLs of a chapter, in play order. */
export function framePaths(sets: FrameSet[]): string[] {
  return sets.flatMap(set => Array.from({ length: set.count }, (_, i) => frameSrc(set, i)));
}

/** Scroll progress of a tall section whose inner stage is sticky. 0 at its top, 1 when its end reaches the viewport bottom. */
export function sectionProgress(top: number, height: number, viewport: number): number {
  const travel = Math.max(1, height - viewport);
  return Math.max(0, Math.min(1, -top / travel));
}

/**
 * Which two frames to blend for a progress value, and how much of the second.
 * Blending neighbours keeps a 24-frame capture smooth and softens the cut between worlds.
 */
export function frameAt(progress: number, count: number): { a: number; b: number; mix: number } {
  if (count <= 1) return { a: 0, b: 0, mix: 0 };
  const x = Math.max(0, Math.min(1, progress)) * (count - 1);
  const a = Math.floor(x);
  return { a, b: Math.min(count - 1, a + 1), mix: x - a };
}

/** Load order: a coarse pass first (every `stride`th frame) so scrubbing works early, then the gaps. */
export function loadOrder(count: number, stride = 4): number[] {
  const first: number[] = [];
  const rest: number[] = [];
  for (let i = 0; i < count; i++) (i % stride === 0 || i === count - 1 ? first : rest).push(i);
  return [...first, ...rest];
}

/** Steps reveal evenly across the middle of a chapter's travel. */
export function stepsDone(progress: number, total: number): number {
  if (total <= 0) return 0;
  const start = 0.12, end = 0.86;
  return Math.max(0, Math.min(total, Math.floor(((progress - start) / (end - start)) * total) + 1));
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'pursuit',
    kicker: '01 · Pursuit · find the friction',
    title: ['An opportunity starts with a ', 'signal.'],
    body: 'Tenders, projects and market changes, brought back with the source attached.',
    frames: [{ dir: '/home-story/home', count: 24 }],
    poster: '/home-story/home/f012.webp',
    label: 'Simulated · lab home energy twin',
    world: 'A Kiwi home, cut open',
    steps: [
      { tag: 'signal', text: 'Evening peak spotted at 6pm' },
      { tag: 'source', text: 'Attached to the household model' },
      { tag: 'friction', text: 'Cold bedrooms, costly hours' },
      { tag: 'opportunity', text: 'A warmer home, worded for review' },
    ],
    cta: { href: '/contact', text: 'Discuss an opportunity' },
  },
  {
    id: 'do',
    kicker: '02 · DO · assemble the journey',
    title: ['What do you need to ', 'assembl?'],
    body: 'A guide to assembl. Clear answers about our work, capabilities and ways to get in touch.',
    frames: [{ dir: '/home-story/cafe', count: 24 }, { dir: '/home-story/store', count: 24 }],
    poster: '/home-story/cafe/f012.webp',
    label: 'Illustrative · café and supermarket twins',
    world: 'The café, then the supermarket',
    steps: [
      { tag: 'trigger', text: 'The Friday rush builds at the counter' },
      { tag: 'prepare', text: 'Roster and queue plan drafted' },
      { tag: 'review', text: 'A named person approves the change' },
      { tag: 'receipt', text: 'What changed, and why, kept on file' },
    ],
    cta: { href: '#try', text: 'Ask about assembl' },
  },
  {
    id: 'studio',
    kicker: '03 · Studio · show it',
    title: ['Give the idea a ', 'world', ' of its own.'],
    body: 'Websites, campaigns, image and film. Work people can see, change and try.',
    frames: [{ dir: '/home-story/showroom', count: 72 }],
    phoneFrames: [{ dir: '/home-story/showroom-sq', count: 72 }],
    poster: '/home-story/showroom/f000.webp',
    phonePoster: '/home-story/showroom-sq/f000.webp',
    label: 'Rendered · fictional dealer showroom',
    world: 'A dealer showroom, every angle',
    steps: [
      { tag: 'stock', text: 'One car, turned all the way round' },
      { tag: 'journey', text: 'Browse, compare, book a drive' },
      { tag: 'review', text: 'Dealer checks every claim' },
    ],
    cta: { href: '/contact', text: 'Discuss a project' },
    secondary: { href: '/lab', text: 'Try the 3D worlds in Lab' },
  },
];

export const MACHINES = [
  { src: '/home-story/machines/reactions.webp', name: 'Reaction rates', w: 900, h: 655 },
  { src: '/home-story/machines/atoms.webp', name: 'Atoms and the periodic table', w: 900, h: 565 },
  { src: '/home-story/machines/slushie.webp', name: 'States of matter', w: 900, h: 661 },
  { src: '/home-story/machines/vinyl.webp', name: 'Waves and sound', w: 900, h: 542 },
  { src: '/home-story/machines/particles.webp', name: 'Particles in motion', w: 900, h: 629 },
  { src: '/home-story/machines/claw.webp', name: 'Forces and the claw', w: 900, h: 303 },
] as const;

export const EVIDENCE = [
  { rule: 'Indirect collection must be notified.', source: 'legislation.govt.nz · Privacy Act 2020, IPP 3A' },
  { rule: 'Nothing sends without a named person.', source: 'assembl product rules' },
  { rule: 'Every job leaves a receipt.', source: 'assembl evidence pack specification' },
] as const;
