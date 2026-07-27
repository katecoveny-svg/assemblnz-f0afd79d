import * as THREE from 'three';

/**
 * Five things an "assembled object" could be.
 *
 * The homepage has always shown one: a navy core in a chrome band inside a
 * glass boundary, with parts orbiting and a brass ring around the lot. It reads
 * well but it is a sphere, and a sphere is the safest shape there is. These are
 * the alternatives worth looking at side by side before committing.
 *
 * Each returns a group centred on the origin, roughly 4 units across, so the
 * same camera and keyframes fit all five. Every one is built from separate,
 * nameable parts — nothing here is a single blob, because the whole argument of
 * the product is that it is assembled out of pieces you can point at.
 */

export type Mats = {
  brass: THREE.MeshPhysicalMaterial;
  chrome: THREE.MeshPhysicalMaterial;
  navy: THREE.MeshPhysicalMaterial;
  navyDark: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
};

export type ObjectKind = 'orb' | 'spine' | 'orrery' | 'lattice' | 'knot';

export const OBJECTS: { kind: ObjectKind; label: string; note: string }[] = [
  { kind: 'orb', label: 'Orb', note: 'the current one — core, band, boundary, orbiting parts' },
  { kind: 'spine', label: 'Spine', note: 'stacked plates on one axis — reads as a stack of decisions' },
  { kind: 'orrery', label: 'Orrery', note: 'nested rings, no solid centre — reads as a system, not a thing' },
  { kind: 'lattice', label: 'Lattice', note: 'struts and nodes — reads as scaffolding, closest to "assembled"' },
  { kind: 'knot', label: 'Knot', note: 'one continuous path — reads as a journey with no seams' },
];

export function makeMaterials(): Mats {
  return {
    brass: new THREE.MeshPhysicalMaterial({ color: '#D4A843', metalness: 1, roughness: 0.07, envMapIntensity: 2.0, clearcoat: 0.8, clearcoatRoughness: 0.1 }),
    chrome: new THREE.MeshPhysicalMaterial({ color: '#D6DADF', metalness: 1, roughness: 0.02, envMapIntensity: 2.4, clearcoat: 1, clearcoatRoughness: 0.03 }),
    navy: new THREE.MeshPhysicalMaterial({ color: '#0C1836', metalness: 0.85, roughness: 0.06, envMapIntensity: 2.0, clearcoat: 1, clearcoatRoughness: 0.05 }),
    navyDark: new THREE.MeshPhysicalMaterial({ color: '#081026', metalness: 0.9, roughness: 0.04, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.04 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#E8EAEC', metalness: 0.1, roughness: 0.02, transmission: 0.95, thickness: 2, transparent: true, opacity: 0.85, envMapIntensity: 1.5 }),
  };
}

/** Parts a stage can light up, so every object can answer the same scroll. */
export type Built = {
  group: THREE.Group;
  parts: THREE.Mesh[];
  ring: THREE.Mesh | null;
  /** called on each stage change — lets an object restate itself, not just turn */
  setStage?: (stage: number) => void;
};

/** (p, q) winding pairs — genuinely different knots, in rising complexity, so
 *  the object looks like it is being assembled as you go down the page. */
export const KNOT_WINDINGS: [number, number][] = [[2, 3], [3, 4], [2, 5], [3, 5]];

export function buildObject(kind: ObjectKind, m: Mats, dark = true): Built {
  /** The visible body: bright metal on a dark page, dark metal on a light one. */
  const body = dark ? m.chrome : m.navy;
  const g = new THREE.Group();
  const parts: THREE.Mesh[] = [];
  let ring: THREE.Mesh | null = null;

  if (kind === 'orb') {
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.3, 96, 96), m.navyDark);
    g.add(core);
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.085, 24, 128), body);
    band.rotation.x = Math.PI / 2.4; band.rotation.z = Math.PI / 9;
    g.add(band);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.95, 64, 64), m.glass.clone());
    g.add(shell);
    const specs: [THREE.BufferGeometry, THREE.Material, number][] = [
      [new THREE.BoxGeometry(0.9, 0.9, 0.9), m.glass.clone(), 0],
      [new THREE.CapsuleGeometry(0.34, 0.85, 12, 32), m.brass.clone(), Math.PI / 2],
      [new THREE.BoxGeometry(0.85, 0.85, 0.16), m.chrome.clone(), Math.PI],
      [new THREE.BoxGeometry(0.55, 0.55, 0.55), m.navy.clone(), Math.PI * 1.5],
    ];
    specs.forEach(([geo, mat, a]) => {
      const p = new THREE.Mesh(geo, mat);
      p.position.set(Math.cos(a) * 2.9, Math.sin(a * 1.3) * 0.5, Math.sin(a) * 2.9);
      g.add(p); parts.push(p);
    });
    ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.035, 16, 160), m.brass.clone());
    ring.rotation.x = Math.PI / 2.3; g.add(ring);
  }

  if (kind === 'spine') {
    // A stack. Each plate is a decision the agent made, sitting on the one below.
    const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 24), body);
    g.add(axis);
    const mats = [m.navyDark, m.chrome, m.brass, m.glass, m.navy];
    for (let i = 0; i < 5; i++) {
      const r = 1.5 - i * 0.17;
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.15, 64), mats[i]!.clone());
      plate.position.y = 1.85 - i * 0.92;
      plate.rotation.y = i * 0.42;
      g.add(plate); parts.push(plate);
    }
    ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.03, 14, 140), m.brass.clone());
    ring.rotation.x = Math.PI / 2; g.add(ring);
  }

  if (kind === 'orrery') {
    // No centre of gravity on purpose — a system of relationships, not an object.
    const hub = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 2), m.brass);
    g.add(hub);
    const tilts = [0.0, 0.6, 1.15, 1.7];
    const radii = [1.25, 1.85, 2.5, 3.15];
    tilts.forEach((t, i) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(radii[i]!, 0.028, 14, 150),
        (i % 2 ? body : m.brass).clone());
      r.rotation.x = Math.PI / 2 + t; r.rotation.z = t * 0.7;
      g.add(r);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 32),
        (i % 2 ? m.navyDark : m.chrome).clone());
      bead.position.set(Math.cos(i * 1.6) * radii[i]!, 0, Math.sin(i * 1.6) * radii[i]!);
      bead.rotation.x = t;
      g.add(bead); parts.push(bead);
    });
    ring = null;
  }

  if (kind === 'lattice') {
    // Closest to the word: struts and nodes, visibly put together.
    const n = 2;
    const step = 1.5;
    const nodes: THREE.Vector3[] = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      if (Math.abs(x) + Math.abs(y) + Math.abs(z) > n) continue;
      nodes.push(new THREE.Vector3(x * step, y * step, z * step));
    }
    nodes.forEach((p, i) => {
      const isCore = p.length() < 0.01;
      const node = new THREE.Mesh(
        new THREE.IcosahedronGeometry(isCore ? 0.34 : 0.19, 2),
        (isCore ? m.brass : i % 3 === 0 ? m.chrome : m.navyDark).clone(),
      );
      node.position.copy(p);
      g.add(node);
      if (isCore || i % 4 === 0) parts.push(node);
    });
    // struts between neighbours exactly one step apart
    const strut = new THREE.CylinderGeometry(0.022, 0.022, 1, 10);
    for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
      const d = nodes[a]!.distanceTo(nodes[b]!);
      if (Math.abs(d - step) > 0.01) continue;
      const s = new THREE.Mesh(strut, body);
      s.scale.y = d;
      s.position.copy(nodes[a]!).add(nodes[b]!).multiplyScalar(0.5);
      s.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        nodes[b]!.clone().sub(nodes[a]!).normalize(),
      );
      g.add(s);
    }
    ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.03, 14, 150), m.brass.clone());
    ring.rotation.x = Math.PI / 2.2; g.add(ring);
  }

  if (kind === 'knot') {
    // One continuous path — a journey with no seams, which is the pitch. The
    // winding changes with the scroll so the path gets more involved as the
    // page argues for more of the journey.
    const geos = KNOT_WINDINGS.map(([p, q]) =>
      new THREE.TorusKnotGeometry(1.55, 0.15, 300, 32, p, q));
    const path = new THREE.Mesh(geos[0], body);
    g.add(path);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.58, 64, 64), dark ? m.navyDark : m.brass);
    g.add(inner); parts.push(inner);
    // brass markers on the path — the moments a person approved. One shows at
    // the top of the page and the rest arrive as you go, so it reads as being
    // put together rather than sitting there finished.
    const beads: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 32), m.brass.clone());
      bead.position.set(Math.cos(a) * 1.9, Math.sin(a * 1.5) * 0.8, Math.sin(a) * 1.9);
      bead.visible = i === 0;
      g.add(bead); parts.push(bead); beads.push(bead);
    }
    ring = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.028, 14, 150), m.brass.clone());
    ring.rotation.x = Math.PI / 2.4; g.add(ring);

    return {
      group: g, parts, ring,
      setStage: (stage: number) => {
        const i = Math.max(0, Math.min(geos.length - 1, stage));
        if (path.geometry !== geos[i]) path.geometry = geos[i]!;
        beads.forEach((b, bi) => { b.visible = bi <= stage; });
      },
    };
  }

  return { group: g, parts, ring };
}
