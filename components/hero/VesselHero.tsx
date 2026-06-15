"use client";

/**
 * VesselHero — the Assembl signature 3D piece, Direction B "stacked".
 *
 * A balanced stack of cream-ceramic and translucent pounamu/teal/amber glass
 * forms, floating on a thin gold easel. As you scroll the hero the stack gently
 * separates and turns — a small interactive motion-graphic moment.
 *
 * Client-only and self-contained: three.js is dynamically imported inside the
 * effect so it never touches the server bundle, and WebGL only runs after mount.
 * Falls back to a calm static surface when WebGL is unavailable or the visitor
 * prefers reduced motion.
 */

import { useEffect, useRef, useState } from "react";

export function VesselHero() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      let THREE: typeof import("three");
      let RoomEnvironment: typeof import("three/examples/jsm/environments/RoomEnvironment.js")["RoomEnvironment"];
      try {
        THREE = await import("three");
        ({ RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js"));
      } catch {
        if (!disposed) setFailed(true);
        return;
      }
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        setFailed(true);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0.2, 8.4);

      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

      const stack = new THREE.Group();
      scene.add(stack);

      const ceramic = (c: number) =>
        new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0, envMapIntensity: 0.5 });
      const glass = (tint: number, att: number) =>
        new THREE.MeshPhysicalMaterial({
          color: 0xeaf5ef, transmission: 1, thickness: 0.45, roughness: 0.06, ior: 1.5,
          clearcoat: 1, clearcoatRoughness: 0.05, metalness: 0,
          attenuationColor: new THREE.Color(tint), attenuationDistance: att,
          envMapIntensity: 1.5, transparent: true, side: THREE.DoubleSide,
        });
      const gold = new THREE.MeshStandardMaterial({ color: 0xc9a24b, metalness: 1, roughness: 0.34, envMapIntensity: 1.2 });

      const lens = (r: number, flat: number, mat: import("three").Material) => {
        const g = new THREE.SphereGeometry(r, 64, 36); g.scale(1, flat, 1);
        return new THREE.Mesh(g, mat);
      };
      const bowl = (r: number, flat: number, mat: import("three").Material) => {
        const g = new THREE.SphereGeometry(r, 64, 36, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5); g.scale(1, flat, 1);
        return new THREE.Mesh(g, mat);
      };

      const CREAM = 0xf2ead8, CREAM2 = 0xefe3ce;
      const items = [
        bowl(1.18, 1.15, ceramic(CREAM)),
        lens(0.96, 0.16, ceramic(CREAM2)),
        lens(1.02, 0.13, glass(0x2f6f5a, 1.5)),
        lens(0.82, 0.15, glass(0x7a5a2a, 1.3)),
        lens(0.96, 0.12, glass(0x356a86, 1.6)),
        lens(0.78, 0.16, ceramic(CREAM)),
        bowl(0.6, 1.1, glass(0x2f6f5a, 1.4)),
      ];
      const ys = [-1.45, -1.06, -0.74, -0.46, -0.16, 0.18, 0.5];
      items.forEach((m, i) => { m.position.y = ys[i]; m.userData.phase = i * 0.7; m.userData.baseY = ys[i]; stack.add(m); });
      const shell = lens(0.62, 0.42, ceramic(CREAM));
      shell.position.set(0.02, 0.92, 0); shell.rotation.z = 0.18; shell.userData.phase = 4.9; shell.userData.baseY = 0.92; stack.add(shell);
      const floaters = [...items, shell];

      const bar = (a: number[], b: number[], r = 0.018) => {
        const A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]);
        const g = new THREE.CylinderGeometry(r, r, A.distanceTo(B), 12);
        const m = new THREE.Mesh(g, gold);
        m.position.copy(A).lerp(B, 0.5);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
        stack.add(m);
      };
      const xL = -1.25, xR = 1.25, zF = 0.95, zB = -0.95, yBot = -1.78, yTop = 1.18;
      bar([xL, yBot, zF], [xR, yBot, zF]); bar([xL, yBot, zB], [xR, yBot, zB]);
      bar([xL, yBot, zF], [xL, yBot, zB]); bar([xR, yBot, zF], [xR, yBot, zB]);
      bar([xL, yBot, zF], [xL, yTop, zF]); bar([xL, yBot, zB], [xL, yTop, zB]);
      bar([xL, yTop, zF], [xL, yTop, zB]); bar([xL, yTop, zF], [-0.1, yTop, 0.0]);

      const s = 128, cv = document.createElement("canvas"); cv.width = cv.height = s;
      const g2 = cv.getContext("2d")!;
      const grd = g2.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grd.addColorStop(0, "rgba(50,38,20,0.35)"); grd.addColorStop(0.55, "rgba(50,38,20,0.16)"); grd.addColorStop(1, "rgba(0,0,0,0)");
      g2.fillStyle = grd; g2.fillRect(0, 0, s, s);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.86; scene.add(shadow);

      const key = new THREE.DirectionalLight(0xfff3e3, 2.1); key.position.set(3.5, 5, 4); scene.add(key);
      const fill = new THREE.DirectionalLight(0xbfe3d2, 0.6); fill.position.set(-4, 1, 2); scene.add(fill);
      const back = new THREE.DirectionalLight(0xffffff, 1.1); back.position.set(-1, 2, -4); scene.add(back);
      scene.add(new THREE.AmbientLight(0xfff3e3, 0.35));
      const glint = new THREE.PointLight(0xffffff, 5, 14, 2); scene.add(glint);

      let mx = 0, my = 0, heroProgress = 0;
      const onMove = (e: PointerEvent) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
      const onScroll = () => {
        const r = wrap.getBoundingClientRect();
        // 0 while the hero fills the viewport, → 1 as it scrolls away
        heroProgress = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      cleanups.push(() => { window.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll); });

      const resize = () => {
        const r = wrap.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / Math.max(r.height, 1); camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize); ro.observe(wrap); resize();
      cleanups.push(() => ro.disconnect());

      const clock = new THREE.Clock();
      const tick = () => {
        if (disposed) return;
        const t = clock.getElapsedTime();
        const spread = reduce ? 0 : heroProgress * 0.45;          // discs separate on scroll
        stack.rotation.y = (reduce ? 0 : t * 0.18) + mx * 0.4 + heroProgress * 0.9;
        stack.rotation.x += ((-my * 0.12) - stack.rotation.x) * 0.05;
        stack.position.y = -heroProgress * 0.6;
        floaters.forEach((m) => {
          const baseY = m.userData.baseY as number;
          m.position.y = baseY * (1 + spread);
          m.position.x = reduce ? 0 : Math.sin(t * 0.6 + (m.userData.phase as number)) * 0.012;
        });
        if (!reduce) glint.position.set(Math.cos(t * 0.7) * 5, 3, Math.sin(t * 0.7) * 5);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        renderer.dispose();
        pmrem.dispose();
        scene.traverse((o) => {
          const mesh = o as import("three").Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as import("three").Material | import("three").Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else if (mat) mat.dispose();
        });
      });
    })();

    return () => { disposed = true; cleanups.forEach((c) => c()); };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-[58%] w-[58%] rounded-full"
            style={{ background: "radial-gradient(circle at 38% 32%, #cfe6da, #9bc1b1 55%, #6f9a8a 100%)", boxShadow: "0 40px 90px rgba(60,90,80,0.25)" }}
            aria-hidden
          />
        </div>
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
