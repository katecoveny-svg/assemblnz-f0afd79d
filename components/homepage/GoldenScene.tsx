'use client';

/**
 * GoldenScene — Kate's Three.js "golden glass spheres" scene, ported from
 * `~/Downloads/dash-gemini/golden-scene-source.js` into a self-contained,
 * client-only React component for the homepage hero.
 *
 * Faithful to the source spec:
 *   - Cream #FFFDE8 background, ACES Filmic tone mapping (exposure 1.4)
 *   - A cluster of ~55 spheres, golden / cream / white palette, alternating
 *     glass (transmission) and polished-metal materials
 *   - Soft physics: damping, mutual repulsion / collision response, a gentle
 *     centring spring, a floor, mouse repulsion, and a click "burst" impulse
 *   - Slow breathing of the whole cluster + a subtle camera parallax on mouse
 *
 * Deliberately reconstructed WITHOUT the heavy contact-shadow render targets and
 * SSCS post-process passes from the original: MeshPhysicalMaterial transmission
 * already carries the look, and skipping the composer keeps the hero cheap and
 * robust. Mobile / coarse-pointer / reduced-motion users never reach this
 * component — they get the static snapshot (see HeroGolden.tsx).
 *
 * Performance + lifecycle: pixelRatio is capped at 2, the geometry is shared
 * across every sphere, and everything (renderer, geometries, materials, env
 * texture, PMREM generator, RAF, listeners) is disposed on unmount.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const SPHERE_COUNT = 55;

// Golden + cream + white, straight from the source palette. `glass` toggles the
// transmission material; the rest get polished metal.
const PALETTE: { color: number; glass: boolean }[] = [
  { color: 0xffd700, glass: true },
  { color: 0xffffff, glass: false },
  { color: 0xffe066, glass: true },
  { color: 0xf5f5dc, glass: false },
  { color: 0xffd700, glass: true },
  { color: 0xffffff, glass: false },
  { color: 0xffe066, glass: true },
  { color: 0xf5f5dc, glass: false },
];

type Body = {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  radius: number;
};

export default function GoldenScene({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---- Renderer -------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // ---- Scene + camera -------------------------------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfffde8);

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 18);
    camera.lookAt(0, 0, 0);

    // ---- Environment (procedural — drives the glass + metal reflections) --
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    // ---- Lights ---------------------------------------------------------
    const ambient = new THREE.AmbientLight(0xfffbe6, 0.8);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff8c0, 1.8);
    key.position.set(5, 10, 8);
    scene.add(key);

    // ---- Spheres --------------------------------------------------------
    const group = new THREE.Group();
    scene.add(group);

    // One shared geometry, scaled per-mesh — cheap on memory.
    const geometry = new THREE.SphereGeometry(1, 48, 48);
    const materials: THREE.Material[] = [];
    const bodies: Body[] = [];

    const makeMaterial = (color: number, glass: boolean): THREE.Material => {
      if (glass) {
        return new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.05,
          metalness: 0.0,
          transmission: 0.92,
          thickness: 1.5,
          ior: 1.45,
          envMapIntensity: 0.6,
          transparent: true,
          opacity: 1.0,
          attenuationColor: new THREE.Color(color),
          attenuationDistance: 2.0,
          specularIntensity: 0.5,
          specularColor: new THREE.Color(0xffffff),
        });
      }
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.0,
        metalness: 0.78,
        envMapIntensity: 2.5,
        reflectivity: 1.0,
        specularIntensity: 1.0,
        specularColor: new THREE.Color(0xffffff),
      });
    };

    // Deterministic-ish placement so the cluster reads the same on every load
    // without depending on Math.random ordering for the look.
    for (let i = 0; i < SPHERE_COUNT; i++) {
      const p = PALETTE[i % PALETTE.length];
      const radius = 0.45 + Math.random() * 0.95;
      const material = makeMaterial(p.color, p.glass);
      materials.push(material);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.setScalar(radius);

      // Spawn inside a sphere of radius ~6 so they settle into a cluster.
      const dir = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
      ).normalize();
      const dist = Math.cbrt(Math.random()) * 5.5;
      mesh.position.copy(dir.multiplyScalar(dist));
      group.add(mesh);

      bodies.push({
        mesh,
        radius,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
        ),
      });
    }

    // ---- Interaction state ---------------------------------------------
    const pointer = new THREE.Vector2(0, 0); // NDC
    let pointerInside = false;
    const mouseWorld = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z = 0
    const parallax = new THREE.Vector2(0, 0); // smoothed camera offset target

    const updateMouseWorld = () => {
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(dragPlane, mouseWorld);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerInside = true;
      parallax.set(pointer.x, pointer.y);
    };
    const onPointerLeave = () => {
      pointerInside = false;
      parallax.set(0, 0);
    };
    const onPointerDown = () => {
      // Click burst — shove everything away from the cursor.
      updateMouseWorld();
      for (const b of bodies) {
        const d = b.mesh.position.clone().sub(mouseWorld);
        const len = d.length() || 0.001;
        const falloff = Math.max(0, 1 - len / 9);
        d.multiplyScalar((1 / len) * falloff * 9);
        b.vel.add(d);
      }
    };

    const el = renderer.domElement;
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', onPointerLeave);
    el.addEventListener('pointerdown', onPointerDown);

    // ---- Resize ---------------------------------------------------------
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // ---- Physics + render loop -----------------------------------------
    const clock = new THREE.Clock();
    let raf = 0;
    const FLOOR_Y = -5;
    const CONTAIN_R = 7;
    const tmp = new THREE.Vector3();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 1 / 30);
      const t = clock.elapsedTime;

      if (pointerInside) updateMouseWorld();

      // Per-body forces
      for (const b of bodies) {
        const pos = b.mesh.position;

        // Gentle pull toward centre so the cluster holds together.
        tmp.copy(pos).multiplyScalar(-0.45 * dt);
        b.vel.add(tmp);

        // Soft radial containment.
        const r = pos.length();
        if (r > CONTAIN_R) {
          tmp.copy(pos).multiplyScalar((-(r - CONTAIN_R) * 3.5 * dt) / r);
          b.vel.add(tmp);
        }

        // Mouse repulsion.
        if (pointerInside) {
          tmp.copy(pos).sub(mouseWorld);
          const d = tmp.length() || 0.001;
          if (d < 5) {
            tmp.multiplyScalar(((1 - d / 5) * 7 * dt) / d);
            b.vel.add(tmp);
          }
        }
      }

      // Pairwise collision / repulsion (O(n^2), n=55 → fine).
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const c = bodies[j];
          tmp.copy(a.mesh.position).sub(c.mesh.position);
          const d = tmp.length() || 0.001;
          const min = a.radius + c.radius;
          if (d < min) {
            const overlap = (min - d) * 0.5;
            tmp.multiplyScalar(overlap / d);
            a.mesh.position.add(tmp);
            c.mesh.position.sub(tmp);
            // Bleed a little velocity along the contact normal.
            a.vel.add(tmp.clone().multiplyScalar(2.2));
            c.vel.add(tmp.multiplyScalar(-2.2));
          }
        }
      }

      // Integrate + floor + damping.
      for (const b of bodies) {
        b.vel.multiplyScalar(0.94);
        b.mesh.position.addScaledVector(b.vel, dt);
        const floor = FLOOR_Y + b.radius;
        if (b.mesh.position.y < floor) {
          b.mesh.position.y = floor;
          b.vel.y = Math.abs(b.vel.y) * 0.5;
        }
      }

      // Whole-cluster breathing.
      const breathe = 1 + Math.sin(t * 0.5) * 0.02;
      group.scale.setScalar(breathe);
      group.rotation.y += 0.0012;

      // Camera parallax toward the cursor.
      camera.position.x += (parallax.x * 1.6 - camera.position.x) * 0.04;
      camera.position.y += (parallax.y * 1.1 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    tick();

    // ---- Cleanup --------------------------------------------------------
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
      el.removeEventListener('pointerdown', onPointerDown);
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      envRT.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (el.parentNode === mount) mount.removeChild(el);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
}
