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

/** One timeline per chapter: a short hold at each end, the world and the steps share the middle. */
export function storyProgress(sectionP: number): number {
  return Math.max(0, Math.min(1, (sectionP - 0.05) / 0.88));
}

/** Steps tick in time with the world: step i lands a quarter of the way into its slice of the timeline. */
export function stepsDone(progress: number, total: number): number {
  if (total <= 0) return 0;
  let done = 0;
  for (let i = 0; i < total; i++) if (progress >= (i + 0.25) / total) done = i + 1;
  return done;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'pursuit',
    kicker: '01 · Pursuit · find it',
    title: ['Find where the ', 'hours', ' go.'],
    body: 'We look at your business from the outside in: the jobs that pile up and the questions customers keep asking. You get a short list of what to fix first, with where each finding came from.',
    frames: [{ dir: '/home-story/home', count: 24 }],
    poster: '/home-story/home/f012.webp',
    label: 'Simulated · lab home energy twin',
    world: 'A Kiwi home, cut open',
    steps: [
      { tag: 'spotted', text: 'The house peaks at 6pm every winter night' },
      { tag: 'traced', text: 'Linked back to the household model' },
      { tag: 'cost', text: 'Cold bedrooms, the dearest hours on the bill' },
      { tag: 'next step', text: 'A warmer-home plan, written up for review' },
    ],
    cta: { href: '/pursuit', text: 'Find the work' },
    secondary: { href: '/contact', text: 'Talk about your business' },
  },
  {
    id: 'do',
    kicker: '02 · DO · do it',
    title: ['The prep is done. ', 'You', ' decide.'],
    body: 'DO gets the job ready while you look after customers. Nothing goes out until a named person says yes, and every job keeps a record of what changed.',
    frames: [{ dir: '/home-story/cafe', count: 24 }, { dir: '/home-story/store', count: 24 }],
    poster: '/home-story/cafe/f012.webp',
    label: 'Illustrative · café and supermarket twins',
    world: 'The café, then the supermarket',
    steps: [
      { tag: 'rush', text: 'The Friday lunch queue starts to build' },
      { tag: 'drafted', text: 'Roster and queue plan ready to check' },
      { tag: 'approved', text: 'The manager reads it and says yes' },
      { tag: 'recorded', text: 'What changed, and why, kept on file' },
    ],
    cta: { href: '/do', text: 'Prepare the work' },
    secondary: { href: '/assembling', text: 'Explore active customer journeys' },
  },
  {
    id: 'studio',
    kicker: '03 · Studio · show it',
    title: ['See it working ', 'before', ' you build it.'],
    body: 'A website, a customer journey or a 3D demonstrator your team can click through, so you can judge the idea before you spend on it.',
    frames: [{ dir: '/home-story/showroom', count: 72 }],
    phoneFrames: [{ dir: '/home-story/showroom-sq', count: 72 }],
    poster: '/home-story/showroom/f000.webp',
    phonePoster: '/home-story/showroom-sq/f000.webp',
    label: 'Rendered · fictional dealer showroom',
    world: 'A dealer showroom, every angle',
    steps: [
      { tag: 'built', text: 'One car, turned all the way round' },
      { tag: 'journey', text: 'Browse, compare, book a test drive' },
      { tag: 'checked', text: 'The dealer signs off every claim' },
    ],
    cta: { href: '/studio', text: 'Show the possibility' },
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

/** Independent demonstrators listed on the homepage before this story; kept with their own truth wording. */
export const DEMONSTRATORS = [
  { href: 'https://assembl-lab.vercel.app/whaiao-story/', img: '/images/site/whaiao-pavilion.jpg', w: 1800, h: 1100, alt: 'Blender-rendered illustrative courtyard pavilion', tag: 'Architecture · independent demonstrator', title: 'A project, opened up.', text: 'Explore spaces, discuss options and keep the conversation together after a hui. Illustrative architecture, not an approved Whaiao project.' },
  { href: 'https://assembl-lab.vercel.app/study/patterns/', img: '/images/site/living-studio.jpg', w: 1200, h: 900, alt: 'A sculpture poster exported from Living Studio', tag: 'Creative tool · made in your browser', title: 'Your colours. Your creation.', text: 'Sculpt a form, tune its finish and make a shareable piece of your own. No account needed.' },
] as const;
