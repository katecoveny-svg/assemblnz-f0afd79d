'use client';

/**
 * Atmospheric plum field — faceted octahedron pods at varying depth + soft bokeh.
 * Craft lifted from Kate's Claude Design artifact; materials use dusty-rose/peach
 * so spatial depth reads without washing the page in One NZ turquoise.
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

/** Lit by One NZ accent — craft of artifact pods, not salmon wash. */
const POD_COLOR = 0x3a6f7c; // muted digital turquoise body
const POD_HI = 0x007c92; // locked accent specular
const PLUM = 0x170f13;

export function FacetedField({
  className,
  accent = true,
}: {
  className?: string;
  /** When true, key light + pod tint lean `#007C92` (journey). Homepage may pass false for quieter heather pods. */
  accent?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 80);
    camera.position.set(0, 0.2, 9.2);

    // Soft key + fill — atmospheric light falloff. Accent lights forms; not a flat teal wash.
    const body = accent ? POD_COLOR : 0x8a6a6e;
    const keyCol = accent ? POD_HI : 0xc4a08a;
    const key = new THREE.DirectionalLight(keyCol, accent ? 1.15 : 1.35);
    key.position.set(4, 5, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x654a4e, 0.5);
    fill.position.set(-5, -1, 2);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0x3a2034, 0.6));
    const rim = new THREE.PointLight(accent ? 0x00b0ca : 0xf5f1f2, accent ? 0.4 : 0.55, 24);
    rim.position.set(-2, 3, 4);
    scene.add(rim);

    const geo = new THREE.OctahedronGeometry(1, 0);
    const matSharp = new THREE.MeshStandardMaterial({
      color: body,
      roughness: 0.36,
      metalness: accent ? 0.35 : 0.22,
      flatShading: true,
    });
    const matSoft = new THREE.MeshStandardMaterial({
      color: body,
      roughness: 0.55,
      metalness: 0.18,
      flatShading: true,
      transparent: true,
      opacity: 0.5,
    });

    const pods: Pod[] = [];
    const placements: Array<[number, number, number, number, number, boolean]> = [
      // x, y, z, scale, speed, soft(bokeh)
      [-3.6, 1.8, -2.2, 0.55, 0.18, false],
      [3.8, 1.2, -3.4, 0.9, 0.12, true],
      [2.4, -1.6, -1.2, 0.42, 0.22, false],
      [-4.2, -0.8, -4.0, 1.15, 0.09, true],
      [0.6, 2.4, -5.0, 0.7, 0.14, true],
      [-1.8, -2.2, -2.8, 0.48, 0.2, false],
      [4.6, 0.2, -5.5, 1.4, 0.08, true],
      [-0.4, 0.6, -1.0, 0.28, 0.26, false],
      [1.2,  -2.6, -4.2, 0.85, 0.11, true],
      [-3.0, 2.6, -6.0, 1.05, 0.07, true],
    ];

    for (const [x, y, z, scale, speed, soft] of placements) {
      const mesh = new THREE.Mesh(geo, soft ? matSoft : matSharp);
      mesh.scale.setScalar(scale);
      mesh.position.set(x, y, z);
      mesh.rotation.set(0.4, 0.7, 0.15);
      scene.add(mesh);
      pods.push({
        mesh,
        base: new THREE.Vector3(x, y, z),
        drift: soft ? 0.18 : 0.1,
        speed,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Quiet central glow plane — soft light falloff in the plum world.
    const glowGeo = new THREE.PlaneGeometry(18, 12);
    const glowMat = new THREE.MeshBasicMaterial({
      color: PLUM,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    // Use a soft sprite-like radial via canvas texture
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    if (accent) {
      g.addColorStop(0, 'rgba(0,124,146,0.28)');
      g.addColorStop(0.45, 'rgba(0,176,202,0.08)');
      g.addColorStop(1, 'rgba(23,15,19,0)');
    } else {
      g.addColorStop(0, 'rgba(145,106,112,0.32)');
      g.addColorStop(0.45, 'rgba(101,74,78,0.1)');
      g.addColorStop(1, 'rgba(23,15,19,0)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    const glow = new THREE.Mesh(
      glowGeo,
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.9 }),
    );
    glow.position.set(1.5, 0.2, -6.5);
    scene.add(glow);
    void glowMat;

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
