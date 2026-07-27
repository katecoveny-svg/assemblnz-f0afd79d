import * as THREE from 'three';

/**
 * Fine objects.
 *
 * Kate, 2026-07-26: "the old 3d object was way finer and more dynamic".
 * She is right, and the numbers say why — the original homepage assembly used
 * torus tubes of 0.035 and 0.028, and the knot I put in front of her used 0.15.
 * Four to five times thicker. It read as plumbing.
 *
 * Everything here stays under 0.03 tube radius, uses high segment counts so the
 * curves are genuinely smooth at large scale, and is built from many light parts
 * rather than a few heavy ones. Motion is per-part, not just a group spin, so
 * the thing looks alive when it is standing still.
 */

export type FineKind = 'veil' | 'filament' | 'dust' | 'wire';

export const FINE: { kind: FineKind; label: string; note: string }[] = [
  { kind: 'veil', label: 'Veil', note: 'a glass core inside five hairline rings, each on its own axis' },
  { kind: 'filament', label: 'Filament', note: 'the knot drawn as a thread — 0.02 tube, 700 segments' },
  { kind: 'dust', label: 'Dust', note: '5,000 points on a drifting shell — the finest of the four' },
  { kind: 'wire', label: 'Wire', note: 'the original assembly as hairline edges, nothing solid' },
];

export type FineMats = {
  brass: THREE.MeshPhysicalMaterial;
  chrome: THREE.MeshPhysicalMaterial;
  dark: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
  line: THREE.LineBasicMaterial;
  points: THREE.PointsMaterial;
};

export function fineMaterials(dark: boolean, accent: string): FineMats {
  const metal = dark ? '#E4E7EB' : '#2A2E34';
  return {
    brass: new THREE.MeshPhysicalMaterial({ color: accent, metalness: 1, roughness: 0.09, envMapIntensity: 2.2, clearcoat: 0.9, clearcoatRoughness: 0.08 }),
    chrome: new THREE.MeshPhysicalMaterial({ color: metal, metalness: 1, roughness: 0.015, envMapIntensity: 2.6, clearcoat: 1, clearcoatRoughness: 0.02 }),
    dark: new THREE.MeshPhysicalMaterial({ color: dark ? '#0A1020' : '#14181F', metalness: 0.9, roughness: 0.05, envMapIntensity: 2.0, clearcoat: 1 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: dark ? '#DDE3EA' : '#F2F4F7', metalness: 0, roughness: 0.02,
      transmission: 0.99, thickness: 1.1, ior: 1.42, transparent: true,
      opacity: 0.5, envMapIntensity: 1.8,
    }),
    line: new THREE.LineBasicMaterial({ color: dark ? '#C9CED6' : '#3A3F47', transparent: true, opacity: dark ? 0.66 : 0.5 }),
    points: new THREE.PointsMaterial({
      color: dark ? '#E8EBEF' : '#2A2E34', size: 0.014,
      sizeAttenuation: true, transparent: true, opacity: dark ? 0.85 : 0.6,
    }),
  };
}

export type FineBuilt = {
  group: THREE.Group;
  /** per-frame life — the reason it reads as alive rather than as a still */
  animate: (t: number, prog: number) => void;
};

export function buildFine(kind: FineKind, m: FineMats): FineBuilt {
  const g = new THREE.Group();

  if (kind === 'veil') {
    // A glass core you can see through, held inside rings so thin they almost
    // disappear edge-on. Each ring keeps its own axis and its own speed, so the
    // silhouette never repeats.
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.78, 96, 96), m.glass);
    g.add(core);
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 3), m.brass);
    g.add(inner);

    const rings: THREE.Mesh[] = [];
    const beads: THREE.Mesh[] = [];
    const radii = [1.25, 1.6, 2.0, 2.45, 2.95];
    radii.forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, i === 2 ? 0.016 : 0.011, 12, 320),
        i === 2 ? m.brass : m.chrome,
      );
      ring.rotation.x = Math.PI / 2 + i * 0.34;
      ring.rotation.z = i * 0.5;
      g.add(ring); rings.push(ring);

      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 24), i % 2 ? m.brass : m.chrome);
      g.add(bead); beads.push(bead);
    });

    return {
      group: g,
      animate: (t, prog) => {
        rings.forEach((ring, i) => {
          ring.rotation.z = i * 0.5 + t * (0.06 + i * 0.022) * (i % 2 ? 1 : -1);
          ring.rotation.x = Math.PI / 2 + i * 0.34 + Math.sin(t * 0.15 + i) * 0.09;
        });
        beads.forEach((bead, i) => {
          const a = t * (0.3 + i * 0.11) + i * 1.7;
          const r = radii[i]!;
          bead.position.set(Math.cos(a) * r, Math.sin(a * 0.6) * r * 0.28, Math.sin(a) * r);
        });
        inner.rotation.y = t * 0.2;
        inner.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04 + prog * 0.5);
      },
    };
  }

  if (kind === 'filament') {
    // The knot she liked, drawn as a thread instead of a tube. Two windings
    // nested so the path crosses itself more, plus a hairline horizon ring.
    const a = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.02, 700, 20, 2, 3), m.chrome);
    const b = new THREE.Mesh(new THREE.TorusKnotGeometry(1.9, 0.013, 700, 16, 3, 5), m.brass);
    g.add(a, b);
    const horizon = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.008, 10, 300), m.chrome);
    horizon.rotation.x = Math.PI / 2.1;
    g.add(horizon);
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.2, 48, 48), m.brass);
    g.add(seed);
    return {
      group: g,
      animate: (t, prog) => {
        a.rotation.y = t * 0.1; a.rotation.x = Math.sin(t * 0.13) * 0.16;
        b.rotation.y = -t * 0.07; b.rotation.z = t * 0.05;
        horizon.rotation.z = t * 0.04;
        seed.scale.setScalar(1 + prog * 1.6);
      },
    };
  }

  if (kind === 'dust') {
    // The finest it can get: 5,000 points on a shell that breathes. No solid
    // surface anywhere, so it never looks like a rendered object.
    const N = 5000;
    const pos = new Float32Array(N * 3);
    const base = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // Fibonacci sphere — even coverage, no clumping at the poles
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = Math.PI * (3 - Math.sqrt(5)) * i;
      const shell = 1.55 + (i % 7) * 0.075;
      base[i * 3] = Math.cos(th) * r * shell;
      base[i * 3 + 1] = y * shell;
      base[i * 3 + 2] = Math.sin(th) * r * shell;
    }
    pos.set(base);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const cloud = new THREE.Points(geo, m.points);
    g.add(cloud);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.009, 10, 300), m.brass);
    ring.rotation.x = Math.PI / 2.2;
    g.add(ring);
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.22, 48, 48), m.brass);
    g.add(heart);
    return {
      group: g,
      animate: (t, prog) => {
        const p = geo.getAttribute('position') as THREE.BufferAttribute;
        const arr = p.array as Float32Array;
        // a slow travelling swell, so the shell is never a static sphere
        for (let i = 0; i < N; i++) {
          const k = 1 + Math.sin(t * 0.7 + base[i * 3] * 1.2 + base[i * 3 + 1] * 0.8) * 0.055;
          arr[i * 3] = base[i * 3] * k;
          arr[i * 3 + 1] = base[i * 3 + 1] * k;
          arr[i * 3 + 2] = base[i * 3 + 2] * k;
        }
        p.needsUpdate = true;
        cloud.rotation.y = t * 0.045;
        ring.rotation.z = -t * 0.05;
        heart.scale.setScalar(1 + prog * 1.4);
      },
    };
  }

  // wire — the original assembly with nothing solid left in it
  const edges = (geo: THREE.BufferGeometry, thresh = 12) =>
    new THREE.LineSegments(new THREE.EdgesGeometry(geo, thresh), m.line);
  const shell = edges(new THREE.IcosahedronGeometry(1.9, 2), 1);
  const cage = edges(new THREE.BoxGeometry(1.5, 1.5, 1.5));
  const oct = edges(new THREE.OctahedronGeometry(1.05, 0));
  g.add(shell, cage, oct);
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.34, 64, 64), m.brass);
  g.add(heart);
  const band = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.01, 10, 300), m.chrome);
  band.rotation.x = Math.PI / 2.3;
  g.add(band);
  return {
    group: g,
    animate: (t, prog) => {
      shell.rotation.y = t * 0.05; shell.rotation.x = t * 0.02;
      cage.rotation.y = -t * 0.09; cage.rotation.z = t * 0.04;
      oct.rotation.y = t * 0.14; oct.rotation.x = -t * 0.06;
      band.rotation.z = t * 0.03;
      heart.scale.setScalar(1 + Math.sin(t * 0.9) * 0.05 + prog * 0.9);
    },
  };
}
