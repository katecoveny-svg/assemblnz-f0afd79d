'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * The /assembling hero scene — parent-canon 3D with a meaning:
 * two hairline threads (chrome = the journey, gold = the value layer) wind
 * around a gold seed that grows through an ~9s loop and softly pulses at the
 * end — value accruing through the wait, paid at the finish, then the next
 * wait begins. Gold dust drifts upward like earning ticks.
 *
 * Engineering: Kate's softbox PMREM recipe (emissive panels, BOOST 2.6 on
 * dark), IntersectionObserver-gated render loop, webglcontextlost guarded,
 * DPR capped, reduced-motion renders a single still frame.
 */

const NAVY = '#050F1C';

export function AssemblingScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement!;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    const size = () => {
      const r = host.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / Math.max(1, r.height);
      camera.updateProjectionMatrix();
    };
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const onCtxLost = (e: Event) => e.preventDefault();
    canvas.addEventListener('webglcontextlost', onCtxLost);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(NAVY, 0.02);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 0.2, 8.6);

    // softbox env — emissive panels are what give the hairlines their streaks
    const BOOST = 2.6;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();
    env.background = new THREE.Color('#07070A');
    const panel = (col: string, w: number, h: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(BOOST) }),
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel('#FFFFFF', 16, 6, 0, 9, 0);
    panel('#FFF2DC', 10, 12, -9, 2, 5);
    panel('#DCE6F2', 10, 10, 9, 2, -4);
    panel('#D4A843', 14, 4, 0, -7, 1);
    scene.environment = pmrem.fromScene(env, 0.02).texture;

    scene.add(new THREE.AmbientLight('#FFFFFF', 0.35));
    const rim = new THREE.PointLight('#D4A843', 55, 30);
    rim.position.set(4, 3, 4);
    scene.add(rim);
    const rim2 = new THREE.PointLight('#DCE6F2', 30, 26);
    rim2.position.set(-5, -2, 3);
    scene.add(rim2);

    const group = new THREE.Group();
    // seated left, behind the headline — the phone owns the right
    group.position.set(-2.1, 0.1, 0);
    scene.add(group);

    const chrome = new THREE.MeshPhysicalMaterial({
      color: '#D6DADF', metalness: 1, roughness: 0.04,
      envMapIntensity: 2.4, clearcoat: 1, clearcoatRoughness: 0.04,
    });
    const gold = new THREE.MeshPhysicalMaterial({
      color: '#D4A843', metalness: 1, roughness: 0.12,
      envMapIntensity: 2.2, clearcoat: 0.8, clearcoatRoughness: 0.1,
    });
    const black = new THREE.MeshPhysicalMaterial({
      color: '#0A0A0C', metalness: 0.9, roughness: 0.06,
      envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.03,
    });

    const threadA = new THREE.Mesh(new THREE.TorusKnotGeometry(1.55, 0.026, 640, 20, 2, 3), chrome);
    const threadB = new THREE.Mesh(new THREE.TorusKnotGeometry(1.95, 0.016, 640, 16, 3, 5), gold);
    const threadC = new THREE.Mesh(new THREE.TorusKnotGeometry(1.2, 0.03, 520, 20, 2, 5), black);
    threadB.rotation.x = 0.5;
    threadC.rotation.x = -0.35;
    group.add(threadA, threadB, threadC);

    // the seed — value accruing through the wait
    const seedMat = new THREE.MeshStandardMaterial({
      color: '#D4A843', metalness: 0.6, roughness: 0.15,
      emissive: '#D4A843', emissiveIntensity: 0.4,
    });
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.16, 48, 48), seedMat);
    group.add(seed);

    // gold dust, drifting upward like earning ticks
    const DUST = 150;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 14;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: '#D4A843', size: 0.02, transparent: true, opacity: 0.6, depthWrite: false }),
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
    const LOOP = 9; // seconds — the wait cycle: accrue, pay, begin again
    let raf = 0, t = 0;
    let cleanupIO: (() => void) | null = null;

    function tick() {
      raf = requestAnimationFrame(tick);
      t += 0.016;

      const p = (t % LOOP) / LOOP;                    // 0..1 through the wait
      const accrue = p < 0.86 ? p / 0.86 : 1;         // value building
      const payoff = p > 0.86 ? Math.sin(((p - 0.86) / 0.14) * Math.PI) : 0; // the moment it pays

      group.rotation.y = t * 0.1 + mx * 0.18;
      group.rotation.x = Math.sin(t * 0.16) * 0.08 + my * 0.1;
      threadB.rotation.z = t * 0.05;
      threadC.rotation.z = -t * 0.04;

      const s = 0.55 + accrue * 0.75 + payoff * 0.3;
      seed.scale.setScalar(s);
      seedMat.emissiveIntensity = 0.25 + accrue * 0.45 + payoff * 0.9;

      const pos = dustGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < DUST; i++) {
        let y = pos.getY(i) + 0.0035 + payoff * 0.004;
        if (y > 4.6) y = -4.6;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
    }

    if (reduced) {
      // one composed still: mid-accrual, no loop
      seed.scale.setScalar(1.0);
      seedMat.emissiveIntensity = 0.6;
      group.rotation.y = 0.6;
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
