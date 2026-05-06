'use client';

/**
 * KeteHero — interactive 3D kete totem for the homepage hero.
 *
 * Specs (locked, see Kaihanga modern-reactive-activation brief 2026-05-06):
 * - Three.js scene, transparent background, ~80vh container
 * - Pear/lantern silhouette wireframe in warm gold (#D4A853)
 * - Bead nodes at every lattice intersection
 * - 3 particle layers (sparks / dots / halos) drifting upward
 * - Cursor parallax (±5°), auto-rotate when idle
 * - Cursor proximity brightens nearby beads
 * - Click triggers a radial ripple + 5 pipeline-stage labels
 * - Reduced-motion fallback to /images/hero-kete-totem.png
 * - Full cleanup on unmount
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';

const GOLD_HEX = 0xd4a853;
const PIPELINE_LABELS = [
  { glyph: '◇', name: 'Kahu', pos: 'left-[16%] top-[28%]' },
  { glyph: '•', name: 'Iho', pos: 'right-[16%] top-[28%]' },
  { glyph: '✶', name: 'Tā', pos: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' },
  { glyph: '◇', name: 'Mahara', pos: 'left-[16%] bottom-[28%]' },
  { glyph: '◆', name: 'Mana', pos: 'right-[16%] bottom-[28%]' },
];

export default function KeteHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current) return;
    if (reducedMotion) return;

    const container = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const gold = new THREE.Color(GOLD_HEX);

    // ─── Build the kete totem ─────────────────────────────────────────
    const keteGroup = new THREE.Group();
    scene.add(keteGroup);

    // Pear/lantern silhouette: narrow at top, bulge at lower-mid, narrow at bottom
    function silhouetteRadius(y: number): number {
      const t = (y + 1) / 2; // 0 at bottom, 1 at top
      const base = 0.12;
      const amp = 0.7;
      // Gaussian centred at t=0.4 for the bulge
      return base + amp * Math.exp(-Math.pow((t - 0.4) / 0.32, 2));
    }

    const verticalRings = 9;
    const radialDivisions = 16;

    const vertices: THREE.Vector3[][] = [];
    for (let i = 0; i < verticalRings; i++) {
      const y = -1 + (2 * i) / (verticalRings - 1);
      const r = silhouetteRadius(y);
      const ring: THREE.Vector3[] = [];
      for (let j = 0; j < radialDivisions; j++) {
        const theta = (j / radialDivisions) * Math.PI * 2;
        ring.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      vertices.push(ring);
    }

    // Diamond-grid lattice (each vertex connects to next-ring-next-radial and next-ring-prev-radial)
    const linePositions: number[] = [];
    for (let i = 0; i < verticalRings - 1; i++) {
      for (let j = 0; j < radialDivisions; j++) {
        const v = vertices[i][j];
        const a = vertices[i + 1][(j + 1) % radialDivisions];
        const b = vertices[i + 1][(j - 1 + radialDivisions) % radialDivisions];
        linePositions.push(v.x, v.y, v.z, a.x, a.y, a.z);
        linePositions.push(v.x, v.y, v.z, b.x, b.y, b.z);
      }
    }
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.6 });
    const lattice = new THREE.LineSegments(lineGeom, lineMat);
    keteGroup.add(lattice);

    // Bead nodes at every intersection
    const beadGeom = new THREE.SphereGeometry(0.04, 12, 12);
    const beads: THREE.Mesh[] = [];
    for (let i = 0; i < verticalRings; i++) {
      for (let j = 0; j < radialDivisions; j++) {
        const beadMat = new THREE.MeshBasicMaterial({ color: gold });
        const bead = new THREE.Mesh(beadGeom, beadMat);
        bead.position.copy(vertices[i][j]);
        keteGroup.add(bead);
        beads.push(bead);
      }
    }

    // ─── Particle layers ─────────────────────────────────────────────
    function createLayer(count: number, size: number, opacity: number, spread: number) {
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;
        velocities[i] = 0.0008 + Math.random() * 0.0025;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: gold,
        size,
        transparent: true,
        opacity,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geom, mat);
      points.userData.velocities = velocities;
      points.userData.spread = spread;
      return points;
    }

    const sparks = createLayer(200, 0.02, 0.3, 5);
    const dots = createLayer(80, 0.06, 0.5, 4);
    const halos = createLayer(30, 0.15, 0.2, 6);
    scene.add(sparks);
    scene.add(dots);
    scene.add(halos);

    // ─── Interaction state ──────────────────────────────────────────
    const mouse = new THREE.Vector2();
    const targetTilt = new THREE.Vector2(0, 0);
    const currentTilt = new THREE.Vector2(0, 0);
    let cursorActive = false;
    let lastMove = 0;
    const ripples: { time: number; origin: THREE.Vector3 }[] = [];
    const raycaster = new THREE.Raycaster();
    const mousePos3D = new THREE.Vector3();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    function projectMouse(clientX: number, clientY: number) {
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onMouseMove(e: MouseEvent) {
      projectMouse(e.clientX, e.clientY);
      targetTilt.x = mouse.y * 0.087;
      targetTilt.y = mouse.x * 0.087;
      cursorActive = true;
      lastMove = performance.now();
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, mousePos3D);
    }

    function triggerRipple(clientX: number, clientY: number) {
      projectMouse(clientX, clientY);
      raycaster.setFromCamera(mouse, camera);
      const origin = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, origin);
      ripples.push({ time: performance.now(), origin });
      setClickCount((c) => c + 1);
    }

    function onClick(e: MouseEvent) {
      triggerRipple(e.clientX, e.clientY);
    }

    function onTouch(e: TouchEvent) {
      const t = e.touches[0];
      if (t) triggerRipple(t.clientX, t.clientY);
    }

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);
    container.addEventListener('touchstart', onTouch, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // ─── Animation loop ────────────────────────────────────────────
    let frameId = 0;
    function animate() {
      frameId = requestAnimationFrame(animate);

      // Auto-rotate when idle for 3s
      if (!cursorActive || performance.now() - lastMove > 3000) {
        keteGroup.rotation.y += 0.0008;
      }

      // Smooth tilt on cursor
      currentTilt.x += (targetTilt.x - currentTilt.x) * 0.05;
      currentTilt.y += (targetTilt.y - currentTilt.y) * 0.05;
      keteGroup.rotation.x = currentTilt.x;

      // Drift particles upward
      const drift = (points: THREE.Points) => {
        const positions = points.geometry.attributes.position.array as Float32Array;
        const velocities = points.userData.velocities as Float32Array;
        const spread = points.userData.spread as number;
        for (let i = 0; i < velocities.length; i++) {
          positions[i * 3 + 1] += velocities[i];
          if (positions[i * 3 + 1] > spread / 2) {
            positions[i * 3 + 1] = -spread / 2;
            positions[i * 3] = (Math.random() - 0.5) * spread;
            positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;
          }
        }
        points.geometry.attributes.position.needsUpdate = true;
      };
      drift(sparks);
      drift(dots);
      drift(halos);

      // Cursor proximity brightens beads
      if (cursorActive) {
        beads.forEach((bead) => {
          const wp = bead.getWorldPosition(new THREE.Vector3());
          const dist = wp.distanceTo(mousePos3D);
          const proximity = Math.max(0, 1 - dist / 1.5);
          const brightness = 1 + proximity * 0.5;
          (bead.material as THREE.MeshBasicMaterial).color.copy(gold).multiplyScalar(brightness);
        });
      } else {
        beads.forEach((bead) => {
          (bead.material as THREE.MeshBasicMaterial).color.copy(gold);
        });
      }

      // Ripple wave through beads
      const now = performance.now();
      const rippleSpeed = 0.003;
      const rippleDuration = 1500;
      ripples.forEach((ripple) => {
        const age = now - ripple.time;
        if (age > rippleDuration) return;
        const radius = age * rippleSpeed;
        beads.forEach((bead) => {
          const wp = bead.getWorldPosition(new THREE.Vector3());
          const dist = wp.distanceTo(ripple.origin);
          if (Math.abs(dist - radius) < 0.25) {
            const intensity = 1 - age / rippleDuration;
            (bead.material as THREE.MeshBasicMaterial).color
              .copy(gold)
              .multiplyScalar(1 + intensity * 0.8);
          }
        });
      });
      while (ripples.length > 0 && now - ripples[0].time > rippleDuration) {
        ripples.shift();
      }

      renderer.render(scene, camera);
    }
    animate();

    // ─── Cleanup ──────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchstart', onTouch);
      resizeObserver.disconnect();
      lineGeom.dispose();
      lineMat.dispose();
      beadGeom.dispose();
      beads.forEach((b) => (b.material as THREE.MeshBasicMaterial).dispose());
      [sparks, dots, halos].forEach((p) => {
        p.geometry.dispose();
        (p.material as THREE.PointsMaterial).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <img
          src="/images/hero-kete-totem.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      </div>
    );
  }

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
      <AnimatePresence>
        {clickCount > 0 && (
          <motion.div
            key={clickCount}
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: 'easeOut' }}
          >
            {PIPELINE_LABELS.map((label) => (
              <span
                key={label.name}
                className={`absolute ${label.pos} font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]`}
              >
                <span className="mr-1 text-[color:var(--assembl-soft-gold)]">{label.glyph}</span>
                {label.name}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
