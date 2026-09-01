'use client';

/**
 * Atmospheric plum field — faceted octahedron pods + soft bokeh.
 * Near-black plum bodies lit by ONE accent family `#007C92` (specular on facets).
 * Never salmon / magenta / flat teal wash across the canvas.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Pod = {
  mesh: THREE.Mesh;
  base: THREE.Vector3;
  drift: number;
  speed: number;
  phase: number;
};

/** Plum body — lifted so facets catch #007C92 key (was muddy near-black). */
const POD_BODY = 0x5c4652;
/** Journey lean — cool plum, not a teal wash. */
const POD_BODY_JOURNEY = 0x4a5560;
const KEY_ACCENT = 0x007c92;
const DEPTH = 0x00b0ca;
const FILL_PLUM = 0x654a4e;
const AMBIENT_PLUM = 0x1a1016;

export function FacetedField({
  className,
  accent = true,
}: {
  className?: string;
  /**
   * Journey: slightly cooler body + stronger key.
   * Homepage: same accent light family, quieter body — never muddy grey.
   * Key/specular always `#007C92`.
   */
  accent?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = accent ? 1.35 : 1.55;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 80);
    camera.position.set(0, 0.2, 9.2);

    const body = accent ? POD_BODY_JOURNEY : POD_BODY;

    // Single accent light family — `#007C92` key + depth rim. Plum fill only.
    // Homepage previously underlit (key ~1.05); raise so facets read as sculpture.
    const key = new THREE.DirectionalLight(KEY_ACCENT, accent ? 2.6 : 3.1);
    key.position.set(5.2, 6.4, 7.2);
    scene.add(key);

    const keySoft = new THREE.DirectionalLight(KEY_ACCENT, accent ? 0.85 : 1.1);
    keySoft.position.set(1.5, 2.2, 8);
    scene.add(keySoft);

    const fill = new THREE.DirectionalLight(FILL_PLUM, 0.55);
    fill.position.set(-6, -1.5, 3);
    scene.add(fill);

    scene.add(new THREE.AmbientLight(AMBIENT_PLUM, 0.55));

    const rim = new THREE.PointLight(DEPTH, accent ? 0.75 : 0.7, 28);
    rim.position.set(-2.4, 3.2, 5);
    scene.add(rim);

    const spark = new THREE.PointLight(KEY_ACCENT, accent ? 1.2 : 1.45, 18);
    spark.position.set(3.2, 1.4, 4.5);
    scene.add(spark);

    const geo = new THREE.OctahedronGeometry(1, 0);
    const matSharp = new THREE.MeshStandardMaterial({
      color: body,
      roughness: 0.16,
      metalness: 0.72,
      flatShading: true,
      emissive: KEY_ACCENT,
      emissiveIntensity: accent ? 0.08 : 0.12,
    });
    const matMid = new THREE.MeshStandardMaterial({
      color: body,
      roughness: 0.26,
      metalness: 0.55,
      flatShading: true,
      emissive: KEY_ACCENT,
      emissiveIntensity: 0.05,
    });
    const matSoft = new THREE.MeshStandardMaterial({
      color: body,
      roughness: 0.42,
      metalness: 0.32,
      flatShading: true,
      transparent: true,
      opacity: 0.62,
      emissive: KEY_ACCENT,
      emissiveIntensity: 0.03,
    });

    const pods: Pod[] = [];
    // x, y, z, scale, speed, soft(bokeh) — some closer to camera for depth layering
    const placements: Array<[number, number, number, number, number, 'sharp' | 'mid' | 'soft']> = [
      [-3.6, 1.8, -2.2, 0.55, 0.18, 'sharp'],
      [3.8, 1.2, -3.4, 0.9, 0.12, 'soft'],
      [2.4, -1.6, -1.2, 0.42, 0.22, 'sharp'],
      [-4.2, -0.8, -4.0, 1.15, 0.09, 'soft'],
      [0.6, 2.4, -5.0, 0.7, 0.14, 'soft'],
      [-1.8, -2.2, -2.8, 0.48, 0.2, 'mid'],
      [4.6, 0.2, -5.5, 1.4, 0.08, 'soft'],
      [-0.4, 0.6, -1.0, 0.32, 0.26, 'sharp'],
      [1.2, -2.6, -4.2, 0.85, 0.11, 'soft'],
      [-3.0, 2.6, -6.0, 1.05, 0.07, 'soft'],
      [3.2, -0.4, -0.6, 0.38, 0.2, 'sharp'],
      [-2.2, 0.2, -0.35, 0.26, 0.24, 'mid'],
    ];

    for (const [x, y, z, scale, speed, kind] of placements) {
      const mat = kind === 'sharp' ? matSharp : kind === 'mid' ? matMid : matSoft;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(scale);
      mesh.position.set(x, y, z);
      mesh.rotation.set(0.4, 0.7, 0.15);
      scene.add(mesh);
      pods.push({
        mesh,
        base: new THREE.Vector3(x, y, z),
        drift: kind === 'soft' ? 0.18 : 0.1,
        speed,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const glowGeo = new THREE.PlaneGeometry(18, 12);
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    // Accent glow behind device — restrained, not a field wash
    g.addColorStop(0, 'rgba(0,124,146,0.22)');
    g.addColorStop(0.4, 'rgba(0,176,202,0.06)');
    g.addColorStop(1, 'rgba(23,15,19,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    const glow = new THREE.Mesh(
      glowGeo,
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.95 }),
    );
    glow.position.set(1.5, 0.2, -6.5);
    scene.add(glow);

    let raf = 0;
    let t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      if (!reduced) {
        for (const p of pods) {
          p.mesh.position.y = p.base.y + Math.sin(t * p.speed + p.phase) * p.drift;
          p.mesh.rotation.y += 0.0025 + p.speed * 0.01;
          p.mesh.rotation.x += 0.0012;
        }
        camera.position.x = Math.sin(t * 0.08) * 0.25;
        camera.lookAt(0.4, 0, 0);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(draw);
    };

    if (reduced) {
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(draw);
    }

    const onResize = () => {
      const nw = mount.clientWidth || window.innerWidth;
      const nh = mount.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      geo.dispose();
      matSharp.dispose();
      matMid.dispose();
      matSoft.dispose();
      tex.dispose();
      glowGeo.dispose();
      (glow.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [accent]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
