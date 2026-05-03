// ═══════════════════════════════════════════════════════════════
// AAAIP — Auaha (Creative) Digital Twin
// ═══════════════════════════════════════════════════════════════

export type AuahaAssetKind = "copy" | "image" | "video" | "campaign";

export interface AuahaAsset {
  id: string;
  kind: AuahaAssetKind;
  label: string;
  usesThirdPartyAsset: boolean;
  licenceRef?: string;
  containsLikeness: boolean;
  likenessConsent: boolean;
  containsTeReo: boolean;
  kaitiakiReview: boolean;
  brandRisk: number;
  factScore: number;
  arrivedAt: number;
}

export interface AuahaWorld {
  now: number;
  inbox: AuahaAsset[];
  published: AuahaAsset[];
  rejected: AuahaAsset[];
  alerts: {
    licenceGaps: number;
    likenessGaps: number;
    teReoFlags: number;
    brandRisks: number;
  };
}

function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}

export interface AuahaSimOptions { seed?: number; arrivalRate?: number; }

const KINDS: AuahaAssetKind[] = ["copy", "image", "video", "campaign"];

export class AuahaSimulator {
  readonly world: AuahaWorld;
  private readonly rng: () => number;
  private readonly arrivalRate: number;
  private counter = 0;

  constructor(opts: AuahaSimOptions = {}) {
    this.rng = makeRng(opts.seed ?? 67);
    this.arrivalRate = opts.arrivalRate ?? 0.7;
    this.world = {
      now: 0,
      inbox: [],
      published: [],
      rejected: [],
      alerts: { licenceGaps: 0, likenessGaps: 0, teReoFlags: 0, brandRisks: 0 },
    };
  }

  tick() {
    this.world.now += 1;
    if (this.rng() < this.arrivalRate) this.world.inbox.push(this.spawnAsset());
  }

  publish(assetId: string): boolean {
    const asset = this.world.inbox.find((a) => a.id === assetId);
    if (!asset) return false;
    this.world.published.push(asset);
    this.world.inbox = this.world.inbox.filter((a) => a.id !== assetId);
    return true;
  }

  reject(assetId: string): boolean {
    const asset = this.world.inbox.find((a) => a.id === assetId);
    if (!asset) return false;
    this.world.rejected.push(asset);
    this.world.inbox = this.world.inbox.filter((a) => a.id !== assetId);
    return true;
  }

  injectUnlicensedAsset() {
    this.counter += 1;
    this.world.inbox.push({
      id: `aua-${this.counter}`,
      kind: "image",
      label: "Stock image without licence",
      usesThirdPartyAsset: true,
      licenceRef: undefined,
      containsLikeness: false,
      likenessConsent: false,
      containsTeReo: false,
      kaitiakiReview: false,
      brandRisk: 0.2,
      factScore: 0.9,
      arrivedAt: this.world.now,
    });
    this.world.alerts.licenceGaps += 1;
  }

  injectLikenessWithoutConsent() {
    this.counter += 1;
    this.world.inbox.push({
      id: `aua-${this.counter}`,
      kind: "video",
      label: "Video featuring a customer without consent",
      usesThirdPartyAsset: false,
      containsLikeness: true,
      likenessConsent: false,
      containsTeReo: false,
      kaitiakiReview: false,
      brandRisk: 0.1,
      factScore: 0.9,
      arrivedAt: this.world.now,
    });
    this.world.alerts.likenessGaps += 1;
  }

  injectTeReoAsset() {
    this.counter += 1;
    this.world.inbox.push({
      id: `aua-${this.counter}`,
      kind: "copy",
      label: "Campaign copy with te reo",
      usesThirdPartyAsset: false,
      containsLikeness: false,
      likenessConsent: false,
      containsTeReo: true,
      kaitiakiReview: false,
      brandRisk: 0.1,
      factScore: 0.9,
      arrivedAt: this.world.now,
    });
    this.world.alerts.teReoFlags += 1;
  }

  reset() {
    this.world.now = 0;
    this.world.inbox = [];
    this.world.published = [];
    this.world.rejected = [];
    this.world.alerts = { licenceGaps: 0, likenessGaps: 0, teReoFlags: 0, brandRisks: 0 };
    this.counter = 0;
  }

  private spawnAsset(): AuahaAsset {
    this.counter += 1;
    const thirdParty = this.rng() < 0.25;
    const hasLicence = thirdParty && this.rng() > 0.15;
    const likeness = this.rng() < 0.15;
    const likenessConsent = likeness && this.rng() > 0.2;
    const teReo = this.rng() < 0.1;
    const kaitiakiReview = teReo && this.rng() > 0.5;
    const brandRisk = this.rng() * 0.7;
    if (brandRisk > 0.6) this.world.alerts.brandRisks += 1;
    return {
      id: `aua-${this.counter}`,
      kind: KINDS[Math.floor(this.rng() * KINDS.length)],
      label: `Asset #${this.counter}`,
      usesThirdPartyAsset: thirdParty,
      licenceRef: hasLicence ? `CC-BY-${Math.floor(this.rng() * 9000) + 1000}` : undefined,
      containsLikeness: likeness,
      likenessConsent,
      containsTeReo: teReo,
      kaitiakiReview,
      brandRisk,
      factScore: 0.5 + this.rng() * 0.5,
      arrivedAt: this.world.now,
    };
  }
}
