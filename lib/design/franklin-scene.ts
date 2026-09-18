/** Three deliberate camera positions in the authored Blender room, glTF Y-up. */
export const FRANKLIN_ASSETS = {
  model: '/do/world/franklin-v1/office.glb',
  poster: '/do/world/franklin-v1/hero-wide.jpg',
  mobilePoster: '/do/world/franklin-v1/hero-mobile.jpg',
} as const;
export type Point3 = readonly [number, number, number];
const desktop: readonly Point3[] = [[-4.8, 1.93, 7.6], [-2.35, 1.78, 4.2], [1.1, 1.7, 3.8]];
const mobile: readonly Point3[] = [[-2.25, 1.95, 7.2], [-1.8, 1.85, 4.8], [1.0, 1.75, 4.6]];
const targets: readonly Point3[] = [[1.0, 1.13, -1.3], [-0.5, 1.1, -2.2], [4.5, 0.9, -0.55]];
const mobileTargets: readonly Point3[] = [[1.7, .99, -.5], [.1, 1.0, -1.7], [3.15, .75, -.2]];
const blend = (a: Point3, b: Point3, t: number): [number, number, number] => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
export function franklinView(progress: number, compact = false) {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const phase = p * 2.999;
  const i = Math.min(2, Math.floor(phase));
  const next = Math.min(2, i + 1);
  const t = Math.max(0, Math.min(1, ((phase-i)-.58)/.42));
  const eased = t*t*t*(t*(t*6-15)+10);
  const poses = compact ? mobile : desktop;
  const looks = compact ? mobileTargets : targets;
  return { position: blend(poses[i], poses[next], eased), target: blend(looks[i], looks[next], eased), fov: compact ? 58 : 47 };
}
