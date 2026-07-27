'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * /assembling hero scene v2 — "same same but different" (Kate, 28 Jul).
 *
 * Paper world, navy and brass. A brass ring carries six navy-gloss parts —
 * capsule, sphere, seal, lens, bar, and one brass torus — that drift in from
 * scatter, DOCK into their slots (the assembly), hold as one object with a
 * soft brass pulse, breathe apart, and assemble again. A nine-second loop:
 * the product's name, performed. No torus-knot threads — that's the
 * homepage's object; this page gets its own.
 *
 * Lighting is the gallery's light softbox (the recipe that makes navy gloss
 * and brass read on paper). IO-gated, contextlost-guarded, reduced-motion
 * shows the assembled still.
 */

export function AssemblingScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement!;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;

    const onCtxLost = (e: Event) => e.preventDefault();
    canvas.addEventListener('webglcontextlost', onCtxLost);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(0, 0.4, 9);

    const size = () => {
      const r = host.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / Math.max(1, r.height);
      camera.updateProjectionMatrix();
    };

    // light softbox — the gallery recipe: bright panels make the metals speak
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color('#0A0A0D');
    const panel = (col: string, w: number, h: number, x: number, y: number, z: number, p: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(p) }),
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel('#FFFFFF', 18, 7, 0, 10, 0, 4.4);
    panel('#FFF2E0', 12, 12, -10, 3, 4, 3.2);
    panel('#EDF2F8', 12, 12, 10, 3, -3, 3.0);
    panel('#D4A843', 16, 4, 0, -7, 0, 1.8);
    scene.environment = pmrem.fromScene(env, 0.02).texture;

    scene.add(new THREE.AmbientLight('#FFFFFF', 0.5));
    const key = new THREE.DirectionalLight('#FFFFFF', 1.6);
    key.position.set(5, 8, 6);
    scene.add(key);
    const warm = new THREE.PointLight('#D4A843', 26, 24);
    warm.position.set(-4, -2, 4);
    scene.add(warm);

    const navy = new THREE.MeshPhysicalMaterial({
      color: '#0C1836', metalness: 0.85, roughness: 0.06,
      envMapIntensity: 2.0, clearcoat: 1, clearcoatRoughness: 0.05,
    });
    const navyDeep = new THREE.MeshPhysicalMaterial({
      color: '#050F1C', metalness: 0.9, roughness: 0.05,
      envMapIntensity: 2.1, clearcoat: 1, clearcoatRoughness: 0.04,
    });
    const brass = new THREE.MeshPhysicalMaterial({
      color: '#B8964F', metalness: 1, roughness: 0.14,
      envMapIntensity: 2.0, clearcoat: 0.7, clearcoatRoughness: 0.12,
    });
    const brassBright = new THREE.MeshPhysicalMaterial({
      color: '#D4A843', metalness: 1, roughness: 0.08,
      envMapIntensity: 2.2, clearcoat: 0.9, clearcoatRoughness: 0.08,
    });

    const group = new THREE.Group();
    // right-of-centre and lifted — the copy column is sacred ground
    group.position.set(0.7, 0.55, 0);
    scene.add(group);

    // the carrier — a brass ring, gently inclined
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.045, 26, 140), brass);
    ring.rotation.x = Math.PI / 2.35;
    group.add(ring);

    // the core — what the parts assemble around
    const coreMat = new THREE.MeshStandardMaterial({
      color: '#D4A843', metalness: 0.65, roughness: 0.15,
      emissive: '#D4A843', emissiveIntensity: 0.25,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 48, 48), coreMat);
    group.add(core);

    // six parts — rounded canon forms, navy with one brass voice
    const partGeos: THREE.BufferGeometry[] = [
      new THREE.CapsuleGeometry(0.14, 0.34, 8, 24),
      new THREE.SphereGeometry(0.19, 40, 40),
      new THREE.CylinderGeometry(0.2, 0.2, 0.12, 48),          // the seal
      new THREE.SphereGeometry(0.2, 40, 24).scale(1, 0.55, 1), // the lens
      new THREE.CapsuleGeometry(0.1, 0.52, 8, 24),             // the bar
      new THREE.TorusGeometry(0.17, 0.055, 20, 60),            // the brass loop
    ];
    const partMats = [navy, navyDeep, navy, navyDeep, navy, brassBright];

    type Part = { mesh: THREE.Mesh; slot: THREE.Vector3; scatter: THREE.Vector3; spin: number };
    const parts: Part[] = [];
    // deterministic scatter — no per-frame randomness, the loop must be calm
    const SCATTER = [
      [2.9, 1.6, 0.8], [-2.6, 2.0, -0.9], [3.1, -1.2, -1.1],
      [-2.9, -1.7, 0.7], [1.9, 2.5, -1.4], [-1.6, -2.6, 1.2],
    ];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const slot = new THREE.Vector3(Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2.35);
      const mesh = new THREE.Mesh(partGeos[i], partMats[i]);
      mesh.rotation.set(i * 0.7, i * 1.1, i * 0.4);
      group.add(mesh);
      parts.push({ mesh, slot, scatter: new THREE.Vector3(...(SCATTER[i] as [number, number, number])), spin: 0.3 + i * 0.08 });
    }

    // brass specks, drifting up — quiet on paper
    const DUST = 90;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 12;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: '#B8964F', size: 0.018, transparent: true, opacity: 0.35, depthWrite: false }),
    );
    scene.add(dust);

    let mx = 0, my = 0;
    const onPointer = (e: PointerEvent) => {
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    };
    addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('resize', size);
    size();

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const LOOP = 9;
    let raf = 0, t = 0;
    let cleanupIO: (() => void) | null = null;
    const ease = (x: number) => x * x * (3 - 2 * x);

    const poseParts = (assembly: number, pulse: number, time: number) => {
      // assembly: 0 = scattered, 1 = docked
      parts.forEach((p, i) => {
        const stagger = Math.min(1, Math.max(0, assembly * 1.5 - i * 0.09));
        const k = ease(stagger);
        p.mesh.position.lerpVectors(p.scatter, p.slot, k);
        p.mesh.position.y += Math.sin(time * 0.9 + i * 1.3) * 0.05 * (1 - k * 0.6);
        p.mesh.rotation.y += 0.016 * p.spin * (1.6 - k);
        p.mesh.rotation.x += 0.016 * p.spin * 0.4 * (1 - k);
        const s = 1 + pulse * 0.08;
        p.mesh.scale.setScalar(s);
      });
      core.scale.setScalar(0.75 + assembly * 0.45 + pulse * 0.35);
      coreMat.emissiveIntensity = 0.15 + assembly * 0.3 + pulse * 0.8;
      (ring.material as THREE.MeshPhysicalMaterial).emissive = new THREE.Color('#D4A843');
      (ring.material as THREE.MeshPhysicalMaterial).emissiveIntensity = pulse * 0.35;
    };

    function tick() {
      raf = requestAnimationFrame(tick);
      t += 0.016;

      const p = (t % LOOP) / LOOP;
      // 0→0.5 assemble · 0.5→0.78 hold · 0.78→0.86 pulse · 0.86→1 breathe apart
      let assembly: number, pulse = 0;
      if (p < 0.5) assembly = p / 0.5;
      else if (p < 0.86) {
        assembly = 1;
        if (p > 0.78) pulse = Math.sin(((p - 0.78) / 0.08) * Math.PI);
      } else assembly = 1 - ease((p - 0.86) / 0.14) * 0.9;

      group.rotation.y = t * 0.12 + mx * 0.16;
      group.rotation.x = Math.sin(t * 0.14) * 0.06 + my * 0.08;
      ring.rotation.z = t * 0.05;

      poseParts(assembly, pulse, t);

      const pos = dustGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < DUST; i++) {
        let y = pos.getY(i) + 0.003 + pulse * 0.003;
        if (y > 4.2) y = -4.2;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
    }

    if (reduced) {
      group.rotation.y = 0.5;
      poseParts(1, 0, 0);
      renderer.render(scene, camera);
    } else {
      let running = false;
      const start = () => { if (!running) { running = true; tick(); } };
      const stop = () => { if (running) { running = false; cancelAnimationFrame(raf); } };
      const io = new IntersectionObserver(
        (es) => { (es[0]?.isIntersecting ? start : stop)(); },
        { rootMargin: '120px 0px' },
      );
      io.observe(host);
      cleanupIO = () => { stop(); io.disconnect(); };
    }

    return () => {
      cleanupIO?.();
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onPointer);
      removeEventListener('resize', size);
      canvas.removeEventListener('webglcontextlost', onCtxLost);
      pmrem.dispose();
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
    };
  }, []);

  return (
    <div className="asm-scene" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
