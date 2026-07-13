export type FormationName =
  | 'signal'
  | 'wing'
  | 'school'
  | 'constellation'
  | 'rivers'
  | 'genome';

export type FormationSet = Record<FormationName, Float32Array>;

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random: () => number) {
  const u = Math.max(random(), 0.0001);
  const v = Math.max(random(), 0.0001);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function setPoint(target: Float32Array, index: number, x: number, y: number, z: number) {
  const offset = index * 3;
  target[offset] = x;
  target[offset + 1] = y;
  target[offset + 2] = z;
}

const MATARIKI: Array<[number, number, number]> = [
  [-1.55, 0.68, 0.08],
  [-0.92, 1.24, -0.02],
  [-0.42, 0.42, 0.12],
  [0.08, 1.04, -0.08],
  [0.52, 0.2, 0.1],
  [1.02, 0.78, 0.02],
  [1.48, -0.05, 0.06],
  [0.76, -0.82, -0.04],
  [-0.18, -0.58, 0.08],
];

const GENOME_CLUSTERS: Array<[number, number, number]> = [
  [-1.45, 0.68, 0.08],
  [-0.7, 1.24, -0.08],
  [0.18, 0.94, 0.08],
  [1.28, 0.6, -0.06],
  [-1.35, -0.34, -0.02],
  [-0.45, -0.08, 0.16],
  [0.48, -0.2, -0.12],
  [1.42, -0.42, 0.08],
  [-0.62, -1.04, -0.08],
  [0.62, -0.98, 0.06],
];

/**
 * One stable set of positions for the entire opening sequence. Keeping every
 * formation at the same length lets the GPU scene morph a single point cloud
 * instead of mounting a new scene for each idea.
 */
export function createLivingGenomeFormations(count: number, seed: number): FormationSet {
  const random = mulberry32(seed);
  const signal = new Float32Array(count * 3);
  const wing = new Float32Array(count * 3);
  const school = new Float32Array(count * 3);
  const constellation = new Float32Array(count * 3);
  const rivers = new Float32Array(count * 3);
  const genome = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 0.2 + Math.pow(random(), 0.62) * 3.5;
    setPoint(
      signal,
      i,
      Math.cos(angle) * radius + normal(random) * 0.15,
      Math.sin(angle) * radius * 0.62 + normal(random) * 0.1,
      normal(random) * 0.55,
    );

    const wingT = random();
    const feather = Math.floor(random() * 16) / 15;
    const wingX = -2.35 + wingT * 4.45;
    const wingArch = 1.42 * Math.sin(wingT * Math.PI) - 0.72;
    const featherFall = feather * (0.2 + wingT * 1.12);
    setPoint(
      wing,
      i,
      wingX + normal(random) * 0.05,
      wingArch - featherFall + normal(random) * 0.045,
      (feather - 0.5) * 0.48 + normal(random) * 0.05,
    );

    const schoolX = -2.25 + random() * 4.45;
    const schoolBody = Math.max(0.08, 1 - Math.pow((schoolX + 0.1) / 2.45, 2));
    const schoolY = normal(random) * 0.58 * schoolBody + Math.sin(schoolX * 1.55) * 0.16;
    const tail = schoolX < -1.6 ? (schoolX + 2.25) * 0.68 : 0;
    setPoint(
      school,
      i,
      schoolX,
      schoolY + (random() > 0.5 ? tail : -tail),
      normal(random) * 0.42 * schoolBody,
    );

    const star = MATARIKI[i % MATARIKI.length];
    const starSpread = i < MATARIKI.length * 20 ? 0.045 : 0.16 + random() * 0.18;
    setPoint(
      constellation,
      i,
      star[0] + normal(random) * starSpread,
      star[1] + normal(random) * starSpread,
      star[2] + normal(random) * starSpread * 0.6,
    );

    const riverY = -1.7 + random() * 3.45;
    const branch = (i % 7) - 3;
    const branchStrength = Math.max(0, (riverY + 0.25) / 2.2);
    const riverX = Math.sin(riverY * 1.42) * 0.28 + branch * 0.22 * branchStrength;
    setPoint(
      rivers,
      i,
      riverX + normal(random) * 0.045,
      riverY + normal(random) * 0.035,
      branch * 0.035 + normal(random) * 0.045,
    );

    const cluster = GENOME_CLUSTERS[i % GENOME_CLUSTERS.length];
    const clusterSpread = 0.13 + random() * 0.24;
    setPoint(
      genome,
      i,
      cluster[0] + normal(random) * clusterSpread,
      cluster[1] + normal(random) * clusterSpread * 0.72,
      cluster[2] + normal(random) * clusterSpread * 0.5,
    );
  }

  return { signal, wing, school, constellation, rivers, genome };
}

export const FORMATION_ORDER: FormationName[] = [
  'signal',
  'wing',
  'school',
  'constellation',
  'rivers',
  'genome',
];

export const FORMATION_LABELS: Record<FormationName, string> = {
  signal: 'first signals',
  wing: 'collective knowledge',
  school: 'coordinated movement',
  constellation: 'patterns become visible',
  rivers: 'work begins to flow',
  genome: 'your living business genome',
};

export const GENOME_CLUSTER_POSITIONS = GENOME_CLUSTERS;
