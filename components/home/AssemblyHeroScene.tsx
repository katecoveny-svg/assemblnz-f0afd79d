'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * assembl — homepage hero scene
 * -----------------------------
 * A premium Three.js scene ported from the assembl agent studio (Figma
 * direction): nine metallic "parts" of an agent drift in and assemble toward a
 * centre, on warm daylight paper. Motion communicates assembly, not decoration.
 *
 * - PMREM RoomEnvironment gives the gold/chrome/platinum their reflections.
 * - Alpha renderer so it sits on the hero's pearl canvas.
 * - Respects prefers-reduced-motion (renders one static assembled frame).
 * - Fully disposes GPU resources on unmount.
 *
 * `activeId` (optional) gently emphasises one part, so the surrounding
 * inspector panel and the scene stay in sync. No copy lives here.
 */

type MatType =
  | 'gold'
  | 'brushedGold'
  | 'chrome'
  | 'roseGold'
  | 'platinum'
  | 'warmBronze';

type PartSpec = {
  id: string;
  mat: MatType;
  geo: () => THREE.BufferGeometry;
  natural: [number, number, number];
  assembly: [number, number, number];
};

// Material palette — verbatim from the studio's mkMat contract.
const MATS: Record<MatType, [number, number, number, number]> = {
  gold: [0xd4a843, 0.12, 0.96, 2.2],
  brushedGold: [0xc09040, 0.32, 0.9, 1.9],
  chrome: [0xdedad4, 0.06, 1.0, 2.8],
  roseGold: [0xc49070, 0.16, 0.92, 2.0],
  platinum: [0xe0dcd8, 0.08, 1.0, 3.0],
  warmBronze: [0x9e8b6f, 0.25, 0.85, 1.8],
};

function mkMat(type: MatType): THREE.MeshStandardMaterial {
  const [color, roughness, metalness, envMapIntensity] = MATS[type];
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, envMapIntensity });
}

// The nine parts, with the studio's natural (dispersed) and assembly positions.
const PARTS: PartSpec[] = [
  { id: 'identity', mat: 'gold', geo: () => new THREE.SphereGeometry(0.7, 48, 48), natural: [0, 6.2, 0], assembly: [0, 4.1, 0] },
  { id: 'models', mat: 'brushedGold', geo: () => new THREE.IcosahedronGeometry(0.6, 0), natural: [-5.5, 3.8, -1.5], assembly: [-1.5, 3.2, 0.4] },
  { id: 'prompt', mat: 'warmBronze', geo: () => new THREE.BoxGeometry(0.9, 0.9, 0.9), natural: [5.2, 3.6, 0.8], assembly: [1.5, 3.2, 0.4] },
  { id: 'guardrails', mat: 'chrome', geo: () => new THREE.TorusGeometry(0.5, 0.16, 24, 64), natural: [0.5, 4.2, 3.8], assembly: [0, 2.85, 0] },
  { id: 'memory', mat: 'brushedGold', geo: () => new THREE.CapsuleGeometry(0.32, 0.7, 16, 32), natural: [-6, 2.5, 0.8], assembly: [-1.3, 2.2, -0.3] },
  { id: 'knowledge', mat: 'gold', geo: () => new THREE.OctahedronGeometry(0.66, 0), natural: [6, 2.5, 0.8], assembly: [1.3, 2.2, -0.3] },
  { id: 'reasoning', mat: 'roseGold', geo: () => new THREE.TorusKnotGeometry(0.36, 0.12, 140, 20, 2, 3), natural: [-1, 2.2, -4.5], assembly: [0, 1.8, 0] },
  { id: 'tools', mat: 'platinum', geo: () => new THREE.CylinderGeometry(0.34, 0.34, 0.8, 40), natural: [1, 2.2, 4.5], assembly: [0, 2.55, -1] },
  { id: 'evals', mat: 'chrome', geo: () => new THREE.DodecahedronGeometry(0.6, 0), natural: [4, 1.8, -3.5], assembly: [1, 1.4, 1] },
];

const CONNECTIONS: [string, string][] = [
  ['identity', 'prompt'], ['identity', 'models'], ['identity', 'guardrails'],
  ['prompt', 'models'], ['prompt', 'reasoning'], ['memory', 'reasoning'],
  ['knowledge', 'reasoning'], ['reasoning', 'tools'], ['guardrails', 'evals'],
  ['tools', 'evals'],
];

// Map the hero's six inspector parts onto the nine scene parts for emphasis.
const ACTIVE_MAP: Record<string, string> = {
  memory: 'memory',
  knowledge: 'knowledge',
  intelligence: 'reasoning',
  voice: 'identity',
  abilities: 'tools',
  boundaries: 'guardrails',
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function AssemblyHeroScene({
  activeId,
  className,
}: {
  activeId?: string;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<string | undefined>(activeId);
  activeRef.current = activeId;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 520;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 140);
    camera.position.set(0, 3.4, 16);
    camera.lookAt(0, 2.6, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    scene.add(new THREE.AmbientLight(0xfff8ee, 0.9));
    const sun = new THREE.DirectionalLight(0xfff8ee, 2.3);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffe8d8, 0.6);
    fill.position.set(-14, 8, -8);
    scene.add(fill);
    const mood = new THREE.PointLight(0xb0c4ff, 0.4, 40, 2);
    mood.position.set(0, 12, 0);
    scene.add(mood);

    // Build parts.
    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];
    const groups = new Map<string, THREE.Group>();
    const state = PARTS.map((spec, i) => {
      const geo = spec.geo();
      const mat = mkMat(spec.mat);
      geos.push(geo);
      mats.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      const group = new THREE.Group();
      group.add(mesh);
      group.position.set(...spec.natural);
      scene.add(group);
      groups.set(spec.id, group);
      return { spec, group, mesh, phase: i * 0.7, current: new THREE.Vector3(...spec.natural) };
    });

    // Connection lines (gold hairlines that appear once assembled).
    const lineMat = new THREE.LineBasicMaterial({ color: 0xb8964f, transparent: true, opacity: 0 });
    mats.push(lineMat);
    const lines = CONNECTIONS.map(([from, to]) => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      geos.push(g);
      const line = new THREE.Line(g, lineMat);
      scene.add(line);
      return { from, to, geo: g };
    });

    const lerp = new THREE.Vector3();
    const target = new THREE.Vector3();
    let raf = 0;
    let prev = performance.now();
    let elapsed = 0;
    // Assemble-in progress (0 dispersed → 1 assembled).
    let progress = reduce ? 1 : 0;

    const setAssembledPositions = (t: number) => {
      for (const s of state) {
        target.set(...s.spec.assembly);
        lerp.set(...s.spec.natural).lerp(target, easeInOutCubic(t));
        s.current.copy(lerp);
        s.group.position.copy(lerp);
      }
    };

    const updateLines = (visible: number) => {
      for (const l of lines) {
        const a = groups.get(l.from)!.position;
        const b = groups.get(l.to)!.position;
        const pos = l.geo.attributes.position as THREE.BufferAttribute;
        pos.setXYZ(0, a.x, a.y, a.z);
        pos.setXYZ(1, b.x, b.y, b.z);
        pos.needsUpdate = true;
      }
      lineMat.opacity = visible;
    };

    const renderFrame = () => {
      const active = activeRef.current ? ACTIVE_MAP[activeRef.current] : undefined;
      for (const s of state) {
        const isActive = s.spec.id === active;
        const ts = isActive ? 1.24 : 1.0;
        const cs = s.group.scale.x;
        s.group.scale.setScalar(cs + (ts - cs) * 0.12);
        s.group.rotation.y += 0.0016;
        s.group.rotation.x = Math.sin(elapsed * 0.5 + s.phase) * 0.12;
        s.group.position.y = s.current.y + (progress >= 1 ? Math.sin(elapsed * 0.8 + s.phase) * 0.07 : 0);
      }
      updateLines(progress >= 0.9 ? 0.22 : 0);
      renderer.render(scene, camera);
    };

    if (reduce) {
      setAssembledPositions(1);
      renderFrame();
    } else {
      const tick = () => {
        raf = requestAnimationFrame(tick);
        const now = performance.now();
        const dt = Math.min((now - prev) / 1000, 0.05);
        prev = now;
        elapsed += dt;
        if (progress < 1) {
          progress = Math.min(1, progress + dt / 2.4);
          setAssembledPositions(progress);
        }
        renderFrame();
      };
      // Small settle before assembling, so parts read as "drifting in".
      setAssembledPositions(0);
      raf = requestAnimationFrame(tick);
    }

    const onResize = () => {
      const w = mount.clientWidth || width;
      const h = mount.clientHeight || height;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (reduce) renderFrame();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
}
