'use client';

/**
 * KeteHero — wow-factor 3D kete totem.
 *
 * Amplified per Kaihanga's wow-factor brief 2026-05-06:
 * - 24×12 lattice (was 16×8) with prominent emissive bead nodes
 * - 4 particle layers: 800 sparks, 250 glow dots, 80 halos, 12 god-rays
 * - Bloom post-processing for premium glow
 * - Atmospheric exponential fog (Paper colour)
 * - Continuous breathing pulse on idle
 * - Cursor tracker trail
 * - Click triggers 5-stage pipeline animation (Kahu → Iho → Tā → Mahara → Mana)
 *   with HTML overlay glyph labels fading in time with each stage
 * - Listens to KeteAccentContext — hovering a kete card in the grid
 *   subtly tints the hero kete to that kete's accent colour
 * - prefers-reduced-motion: full fallback to static PNG poster
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect } from 'postprocessing';
import { useKeteAccent } from '@/components/KeteAccentContext';

const GOLD_HEX = 0xd4a853;
const PAPER_HEX = 0xfaf7f2;

const PIPELINE_STAGES = [
  { glyph: '◇', name: 'Kahu', delay: 0,    pos: 'left-[14%] top-[24%]' },
  { glyph: '→', name: 'Iho',  delay: 200,  pos: 'right-[14%] top-[24%]' },
  { glyph: '✦', name: 'Tā',   delay: 400,  pos: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' },
  { glyph: '§', name: 'Mahara', delay: 600, pos: 'left-[14%] bottom-[24%]' },
  { glyph: '◆', name: 'Mana', delay: 800,  pos: 'right-[14%] bottom-[24%]' },
];

const HORIZONTAL_DIVS = 24;
const VERTICAL_DIVS = 12;
const SPARK_COUNT = 800;
const GLOW_DOT_COUNT = 250;
const HALO_COUNT = 80;
const GODRAY_COUNT = 12;

export default function KeteHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [visibleStages, setVisibleStages] = useState<number[]>([]);

  // Cross-component tint from kete grid hover
  const { accent } = useKeteAccent();
  const tintRef = useRef<THREE.Color | null>(null);
  useEffect(() => {
    if (accent) {
      tintRef.current = new THREE.Color(accent);
    } else {
      tintRef.current = null;
    }
  }, [accent]);

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

    // ─── Scene + camera + renderer ──────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(PAPER_HEX, 0.06);

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

    // ─── Bloom post-processing ──────────────────────────────────
    let composer: EffectComposer | null = null;
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(
        new EffectPass(
          camera,
          new BloomEffect({ intensity: 1.4, luminanceThreshold: 0.25, luminanceSmoothing: 0.4 }),
        ),
      );
    } catch {
      composer = null; // fall back to plain renderer.render if postprocessing fails
    }

    const gold = new THREE.Color(GOLD_HEX);

    // ─── Build the kete totem ─────────────────────────────────
    const keteGroup = new THREE.Group();
    scene.add(keteGroup);

    function silhouetteRadius(y: number): number {
      const t = (y + 1) / 2;
      const base = 0.12;
      const amp = 0.7;
      return base + amp * Math.exp(-Math.pow((t - 0.4) / 0.32, 2));
    }

    const vertices: THREE.Vector3[][] = [];
    for (let i = 0; i < VERTICAL_DIVS; i++) {
      const y = -1 + (2 * i) / (VERTICAL_DIVS - 1);
      const r = silhouetteRadius(y);
      const ring: THREE.Vector3[] = [];
      for (let j = 0; j < HORIZONTAL_DIVS; j++) {
        const theta = (j / HORIZONTAL_DIVS) * Math.PI * 2;
        ring.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      vertices.push(ring);
    }

    // Diamond-grid lattice lines
    const linePositions: number[] = [];
    for (let i = 0; i < VERTICAL_DIVS - 1; i++) {
      for (let j = 0; j < HORIZONTAL_DIVS; j++) {
        const v = vertices[i][j];
        const a = vertices[i + 1][(j + 1) % HORIZONTAL_DIVS];
        const b = vertices[i + 1][(j - 1 + HORIZONTAL_DIVS) % HORIZONTAL_DIVS];
        linePositions.push(v.x, v.y, v.z, a.x, a.y, a.z);
        linePositions.push(v.x, v.y, v.z, b.x, b.y, b.z);
      }
    }
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: gold,
      transparent: true,
      opacity: 0.7,
    });
    const lattice = new THREE.LineSegments(lineGeom, lineMat);
    keteGroup.add(lattice);

    // Bead nodes — emissive Mesh so they bloom
    const beadGeom = new THREE.SphereGeometry(0.05, 14, 14);
    const beads: THREE.Mesh[] = [];
    for (let i = 0; i < VERTICAL_DIVS; i++) {
      for (let j = 0; j < HORIZONTAL_DIVS; j++) {
        const beadMat = new THREE.MeshStandardMaterial({
          color: 0x000000,
          emissive: gold,
          emissiveIntensity: 1.2,
          roughness: 0.6,
        });
        const bead = new THREE.Mesh(beadGeom, beadMat);
        bead.position.copy(vertices[i][j]);
        keteGroup.add(bead);
        beads.push(bead);
      }
    }

    // ─── Particle layers ─────────────────────────────────────
    function createLayer(count: number, size: number, opacity: number, spread: number, vy: number) {
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;
        velocities[i] = vy * (0.5 + Math.random());
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

    const sparks = createLayer(SPARK_COUNT, 0.018, 0.35, 6, 0.0014);
    const dots = createLayer(GLOW_DOT_COUNT, 0.05, 0.5, 5, 0.002);
    const halos = createLayer(HALO_COUNT, 0.16, 0.18, 7, 0.0011);
    const godrays = createLayer(GODRAY_COUNT, 0.4, 0.08, 8, 0.0007);
    scene.add(sparks);
    scene.add(dots);
    scene.add(halos);
    scene.add(godrays);

    // ─── Interaction state ──────────────────────────────────
    const mouse = new THREE.Vector2();
    const targetTilt = new THREE.Vector2();
    const currentTilt = new THREE.Vector2();
    let cursorActive = false;
    let lastMove = 0;
    const ripples: { time: number; origin: THREE.Vector3 }[] = [];
    const raycaster = new THREE.Raycaster();
    const mousePos3D = new THREE.Vector3();
    const trackerPos = new THREE.Vector3();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    let pulsePhase = 0;

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

      // Sequence the 5 stage labels in
      PIPELINE_STAGES.forEach((stage, idx) => {
        setTimeout(() => {
          setVisibleStages((prev) => Array.from(new Set([...prev, idx])));
        }, stage.delay);
      });
      // Clear all stages after 4s
      setTimeout(() => setVisibleStages([]), 4500);
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
      composer?.setSize(w, h);
    });
    resizeObserver.observe(container);

    // ─── Animation loop ─────────────────────────────────────
    let frameId = 0;
    function animate() {
      frameId = requestAnimationFrame(animate);

      const now = performance.now();

      // Auto-rotate when idle for 2s
      if (!cursorActive || now - lastMove > 2000) {
        keteGroup.rotation.y += 0.0009;
      }

      // Smooth tilt
      currentTilt.x += (targetTilt.x - currentTilt.x) * 0.05;
      currentTilt.y += (targetTilt.y - currentTilt.y) * 0.05;
      keteGroup.rotation.x = currentTilt.x;

      // Cursor tracker trail (slower than cursor itself, smooth follow)
      if (cursorActive) {
        trackerPos.lerp(mousePos3D, 0.08);
      }

      // Continuous breathing pulse
      pulsePhase += 0.005;
      const pulse = 0.85 + 0.25 * Math.sin(pulsePhase); // 0.6 → 1.1

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
      drift(godrays);

      // Compute the bead colour per-frame:
      // base = gold, optionally blended toward kete-accent tint (from grid hover)
      const baseColor = new THREE.Color(GOLD_HEX);
      if (tintRef.current) {
        baseColor.lerp(tintRef.current, 0.55);
      }

      // Tint the lattice line colour too (subtle)
      const latticeColor = new THREE.Color(GOLD_HEX);
      if (tintRef.current) {
        latticeColor.lerp(tintRef.current, 0.3);
      }
      lineMat.color.copy(latticeColor);

      // Update beads — proximity glow + ripple + breathing pulse + tracker trail
      beads.forEach((bead) => {
        const wp = bead.getWorldPosition(new THREE.Vector3());

        let intensity = 1.2 * pulse; // baseline + pulse

        if (cursorActive) {
          // Proximity glow
          const distMouse = wp.distanceTo(mousePos3D);
          const proximity = Math.max(0, 1 - distMouse / 1.5);
          intensity += proximity * 1.8;

          // Tracker trail
          const distTracker = wp.distanceTo(trackerPos);
          const trail = Math.max(0, 1 - distTracker / 1.0);
          intensity += trail * 0.6;
        }

        // Ripple wave
        ripples.forEach((ripple) => {
          const age = now - ripple.time;
          if (age > 1500) return;
          const radius = age * 0.0028;
          const dist = wp.distanceTo(ripple.origin);
          if (Math.abs(dist - radius) < 0.3) {
            const rippleIntensity = 1 - age / 1500;
            intensity += rippleIntensity * 1.6;
          }
        });

        const mat = bead.material as THREE.MeshStandardMaterial;
        mat.emissive.copy(baseColor);
        mat.emissiveIntensity = Math.min(intensity, 4);
      });

      // Cull old ripples
      while (ripples.length > 0 && now - ripples[0].time > 1500) {
        ripples.shift();
      }

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    }
    animate();

    // ─── Cleanup ────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchstart', onTouch);
      resizeObserver.disconnect();
      lineGeom.dispose();
      lineMat.dispose();
      beadGeom.dispose();
      beads.forEach((b) => (b.material as THREE.MeshStandardMaterial).dispose());
      [sparks, dots, halos, godrays].forEach((p) => {
        p.geometry.dispose();
        (p.material as THREE.PointsMaterial).dispose();
      });
      composer?.dispose();
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
            {PIPELINE_STAGES.map((stage, idx) => (
              <motion.span
                key={stage.name}
                className={`absolute ${stage.pos} font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]`}
                initial={{ opacity: 0, y: 8 }}
                animate={
                  visibleStages.includes(idx)
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 8 }
                }
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <span className="mr-1.5 text-[color:var(--assembl-pounamu)]">{stage.glyph}</span>
                {stage.name}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
