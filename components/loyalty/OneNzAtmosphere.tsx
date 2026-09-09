'use client';

/**
 * Soft volumetric space for the One NZ journey — spheres + light + DoF.
 * Not faceted diamond pods (Kate craft reject). Client teal as key light only.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PLUM = 0x240b21;
const KEY = 0x007c92;
const DEPTH = 0x00b0ca;
const FILL = 0x654a4e;
const CHALK = 0xf5f1f2;

type Orb = {
  mesh: THREE.Mesh;
  base: THREE.Vector3;
  drift: number;
  speed: number;
  phase: number;
};

export function OneNzAtmosphere({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 60);
    camera.position.set(0.4, 0.15, 8.6);

    const key = new THREE.DirectionalLight(KEY, 2.4);
    key.position.set(4.8, 5.2, 6.4);
    scene.add(key);

    const rim = new THREE.DirectionalLight(DEPTH, 0.85);
    rim.position.set(-3.2, 1.4, -2.5);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(FILL, 0.55);
    fill.position.set(-5.5, -2, 2.2);
    scene.add(fill);

    scene.add(new THREE.AmbientLight(PLUM, 0.55));
    scene.add(new THREE.HemisphereLight(CHALK, PLUM, 0.28));

    const orbs: Orb[] = [];
    const specs: Array<{
      r: number;
      pos: [number, number, number];
      metal: number;
      rough: number;
      opacity: number;
      color: number;
    }> = [
      { r: 1.15, pos: [2.6, 0.55, -1.2], metal: 0.92, rough: 0.12, opacity: 1, color: 0x3a2a34 },
      { r: 0.55, pos: [3.9, -0.85, 0.6], metal: 0.88, rough: 0.18, opacity: 1, color: 0x2c3840 },
      { r: 0.78, pos: [1.7, -1.4, 1.1], metal: 0.2, rough: 0.35, opacity: 0.55, color: 0x007c92 },
      { r: 0.42, pos: [4.4, 1.3, -0.2], metal: 0.95, rough: 0.08, opacity: 1, color: 0x4a3a42 },
      { r: 0.32, pos: [0.9, 1.7, 0.4], metal: 0.15, rough: 0.4, opacity: 0.4, color: 0x00b0ca },
      { r: 0.95, pos: [-3.4, -0.6, -2.4], metal: 0.9, rough: 0.16, opacity: 0.85, color: 0x2a1a24 },
    ];

    specs.forEach((s, i) => {
      const geo = new THREE.SphereGeometry(s.r, 48, 48);
      const mat = new THREE.MeshPhysicalMaterial({
        color: s.color,
        metalness: s.metal,
        roughness: s.rough,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        transparent: s.opacity < 1,
        opacity: s.opacity,
        iridescence: s.metal > 0.8 ? 0.35 : 0.1,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 420],
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...s.pos);
      scene.add(mesh);
      orbs.push({
        mesh,
        base: mesh.position.clone(),
        drift: 0.08 + (i % 3) * 0.04,
        speed: 0.18 + (i % 4) * 0.05,
        phase: i * 0.9,
      });
    });

    // Soft ground contact shadow disc
    const shadowGeo = new THREE.CircleGeometry(2.8, 48);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.28,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(2.4, -2.35, 0.2);
    scene.add(shadow);

    let raf = 0;
    let t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      if (!reduced) {
        orbs.forEach((o) => {
          o.mesh.position.x = o.base.x + Math.sin(t * o.speed + o.phase) * o.drift;
          o.mesh.position.y = o.base.y + Math.cos(t * o.speed * 0.85 + o.phase) * o.drift * 0.7;
          o.mesh.rotation.y = t * 0.08 + o.phase;
        });
        camera.position.x = 0.4 + Math.sin(t * 0.12) * 0.12;
        camera.lookAt(1.2, -0.1, 0);
      }
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(draw);
    };
    raf = window.requestAnimationFrame(draw);

    const onResize = () => {
      const nw = mount.clientWidth || window.innerWidth;
      const nh = mount.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      orbs.forEach((o) => {
        o.mesh.geometry.dispose();
        (o.mesh.material as THREE.Material).dispose();
      });
      shadowGeo.dispose();
      shadowMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
