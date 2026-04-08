// ═══════════════════════════════════════════════════════════════
// AAAIP — Community Portal Digital Twin
// A deterministic, seedable simulator producing a stream of
// posts to a researcher / industry / whānau community portal.
// Posts have realistic flag distributions so the moderation
// agent's policies are exercised end-to-end.
// ═══════════════════════════════════════════════════════════════

export type PostKind = "research" | "discussion" | "dataset" | "event" | "kōrero";

export interface CommunityPost {
  id: string;
  author: string;
  kind: PostKind;
  title: string;
  /** Predicted harm score, 0–1. */
  harmScore: number;
  /** Predicted factual-claim confidence, 0–1. */
  factScore: number;
  containsPii: boolean;
  authorPiiOptIn: boolean;
  containsTaonga: boolean;
  iwiConsent: boolean;
  teReoConcernFlag: boolean;
  arrivedAt: number;
}

export interface CommunityWorld {
  now: number;
  /** Pending posts waiting for the moderation agent. */
  inbox: CommunityPost[];
  /** Posts that have been published. */
  published: CommunityPost[];
  /** Posts that were rejected outright. */
  rejected: CommunityPost[];
  /** Counts surfaced in the dashboard KPI row. */
  totals: {
    teReoFlags: number;
    taongaFlags: number;
    piiFlags: number;
    harmFlags: number;
  };
}

// ── Pseudo-random LCG ─────────────────────────────────────────

function makeRng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

const AUTHORS = [
  "Aroha T.",
  "Hemi K.",
  "Mereana W.",
  "Sam L.",
  "Priya R.",
  "Wiremu B.",
  "Niko F.",
  "Hera M.",
];
const TITLES = [
  "Notes on whānau-led data governance",
  "Open dataset of harbour temperatures",
  "Wānanga: agentic AI and tikanga",
  "Te reo NER benchmark v2",
  "Hāngī recipe roundup",
  "Robotics symposium recap",
  "Drug-screening pipeline workshop",
  "Field notes from Te Tai Tokerau",
];
const KINDS: PostKind[] = ["research", "discussion", "dataset", "event", "kōrero"];

// ── Simulator ─────────────────────────────────────────────────

export interface CommunitySimOptions {
  seed?: number;
  /** Probability per tick a new post is submitted. */
  arrivalRate?: number;
}

export class CommunitySimulator {
  readonly world: CommunityWorld;
  private readonly rng: () => number;
  private readonly arrivalRate: number;
  private postCounter = 0;

  constructor(opts: CommunitySimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 19);
    this.arrivalRate = opts.arrivalRate ?? 0.65;
    this.world = {
      now: 0,
      inbox: [],
      published: [],
      rejected: [],
      totals: { teReoFlags: 0, taongaFlags: 0, piiFlags: 0, harmFlags: 0 },
    };
  }

  /** Advance one tick. */
  tick() {
    this.world.now += 1;
    if (this.rng() < this.arrivalRate) {
      this.world.inbox.push(this.spawnPost());
    }
  }

  /** Mark a post as published. */
  publish(postId: string): boolean {
    const post = this.world.inbox.find((p) => p.id === postId);
    if (!post) return false;
    this.world.published.push(post);
    this.world.inbox = this.world.inbox.filter((p) => p.id !== postId);
    return true;
  }

  /** Drop a post (reject / hide). */
  reject(postId: string): boolean {
    const post = this.world.inbox.find((p) => p.id === postId);
    if (!post) return false;
    this.world.rejected.push(post);
    this.world.inbox = this.world.inbox.filter((p) => p.id !== postId);
    return true;
  }

  /** Force-inject a post that violates several policies. */
  injectHarmfulPost() {
    this.postCounter += 1;
    const post: CommunityPost = {
      id: `post-${this.postCounter}`,
      author: "Anonymous",
      kind: "discussion",
      title: "Doxxing attempt",
      harmScore: 0.95,
      factScore: 0.2,
      containsPii: true,
      authorPiiOptIn: false,
      containsTaonga: false,
      iwiConsent: false,
      teReoConcernFlag: false,
      arrivedAt: this.world.now,
    };
    this.world.inbox.push(post);
    this.world.totals.harmFlags += 1;
    this.world.totals.piiFlags += 1;
  }

  /** Force-inject a taonga post without consent. */
  injectTaongaWithoutConsent() {
    this.postCounter += 1;
    const post: CommunityPost = {
      id: `post-${this.postCounter}`,
      author: "Researcher",
      kind: "dataset",
      title: "Audio archive of historical waiata",
      harmScore: 0.05,
      factScore: 0.95,
      containsPii: false,
      authorPiiOptIn: false,
      containsTaonga: true,
      iwiConsent: false,
      teReoConcernFlag: true,
      arrivedAt: this.world.now,
    };
    this.world.inbox.push(post);
    this.world.totals.taongaFlags += 1;
    this.world.totals.teReoFlags += 1;
  }

  reset() {
    this.world.now = 0;
    this.world.inbox = [];
    this.world.published = [];
    this.world.rejected = [];
    this.world.totals = { teReoFlags: 0, taongaFlags: 0, piiFlags: 0, harmFlags: 0 };
    this.postCounter = 0;
  }

  // ── Internals ────────────────────────────────────────────

  private spawnPost(): CommunityPost {
    this.postCounter += 1;
    const harmScore = this.rng() * 0.5; // most posts are clean
    const factScore = 0.4 + this.rng() * 0.6;
    const containsPii = this.rng() < 0.08;
    const authorPiiOptIn = containsPii && this.rng() > 0.4;
    const containsTaonga = this.rng() < 0.1;
    const iwiConsent = containsTaonga && this.rng() > 0.3;
    const teReoConcernFlag = this.rng() < 0.07;
    if (teReoConcernFlag) this.world.totals.teReoFlags += 1;
    if (containsTaonga) this.world.totals.taongaFlags += 1;
    if (containsPii) this.world.totals.piiFlags += 1;
    if (harmScore > 0.5) this.world.totals.harmFlags += 1;
    return {
      id: `post-${this.postCounter}`,
      author: AUTHORS[Math.floor(this.rng() * AUTHORS.length)],
      kind: KINDS[Math.floor(this.rng() * KINDS.length)],
      title: TITLES[Math.floor(this.rng() * TITLES.length)],
      harmScore,
      factScore,
      containsPii,
      authorPiiOptIn,
      containsTaonga,
      iwiConsent,
      teReoConcernFlag,
      arrivedAt: this.world.now,
    };
  }
}
