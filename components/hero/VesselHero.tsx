"use client";

/**
 * VesselHero — the Assembl signature 3D piece, Direction B "stacked".
 *
 * A balanced stack of cream-ceramic and translucent pounamu/teal/amber glass
 * forms, resting on a thin gold easel. The whole sculpture auto-fits the canvas
 * (so it never overflows the viewport on a laptop), sits at a gentle downward
 * angle so the discs read as real 3D forms, and you can drag to spin it.
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
  const [hintGone, setHintGone] = useState(false);

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
      const FOV = 30;
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

      // The whole sculpture lives in one group so we can centre + auto-fit it,
      // hanging inside a pivot so spin never fights the centring offset.
      const sculpture = new THREE.Group();
      const pivot = new THREE.Group();
      pivot.add(sculpture);
      scene.add(pivot);

      const ceramic = (c: number) =>
        new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, metalness: 0, envMapIntensity: 0.55 });
      const glass = (tint: number, att: number) =>
        new THREE.MeshPhysicalMaterial({
          color: 0xeaf5ef, transmission: 1, thickness: 0.45, roughness: 0.05, ior: 1.5,
          clearcoat: 1, clearcoatRoughness: 0.05, metalness: 0,
          attenuationColor: new THREE.Color(tint), attenuationDistance: att,
          envMapIntensity: 1.6, transparent: true, side: THREE.DoubleSide,
        });
      const gold = new THREE.MeshStandardMaterial({ color: 0xc9a24b, metalness: 1, roughness: 0.3, envMapIntensity: 1.3 });

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
        lens(0.96, 0.18, ceramic(CREAM2)),
        lens(1.02, 0.15, glass(0x2f6f5a, 1.5)),
        lens(0.82, 0.17, glass(0x7a5a2a, 1.3)),
        lens(0.96, 0.14, glass(0x356a86, 1.6)),
        lens(0.78, 0.18, ceramic(CREAM)),
        bowl(0.6, 1.1, glass(0x2f6f5a, 1.4)),
      ];
      const ys = [-1.45, -1.06, -0.74, -0.46, -0.16, 0.18, 0.5];
      items.forEach((m, i) => { m.position.y = ys[i]; m.userData.phase = i * 0.7; m.userData.baseY = ys[i]; sculpture.add(m); });
      const shell = lens(0.62, 0.42, ceramic(CREAM));
      shell.position.set(0.02, 0.92, 0); shell.rotation.z = 0.18; shell.userData.phase = 4.9; shell.userData.baseY = 0.92; sculpture.add(shell);
      const floaters = [...items, shell];

      // Thin gold easel — much finer brass than before.
      const bar = (a: number[], b: number[], r = 0.0095) => {
        const A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]);
        const g = new THREE.CylinderGeometry(r, r, A.distanceTo(B), 12);
        const m = new THREE.Mesh(g, gold);
        m.position.copy(A).lerp(B, 0.5);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
        sculpture.add(m);
      };
      const xL = -1.25, xR = 1.25, zF = 0.95, zB = -0.95, yBot = -1.78, yTop = 1.18;
      bar([xL, yBot, zF], [xR, yBot, zF]); bar([xL, yBot, zB], [xR, yBot, zB]);
      bar([xL, yBot, zF], [xL, yBot, zB]); bar([xR, yBot, zF], [xR, yBot, zB]);
      bar([xL, yBot, zF], [xL, yTop, zF]); bar([xL, yBot, zB], [xL, yTop, zB]);
      bar([xL, yTop, zF], [xL, yTop, zB]); bar([xL, yTop, zF], [-0.1, yTop, 0.0]);

      // Centre the sculpture on the pivot so rotation spins around its middle.
      const box = new THREE.Box3().setFromObject(sculpture);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      sculpture.position.sub(center);

      // Soft contact shadow, grounding the stack on the cream so it doesn't
      // read as a flat image pasted on top.
      const s = 256, cv = document.createElement("canvas"); cv.width = cv.height = s;
      const g2 = cv.getContext("2d")!;
      const grd = g2.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grd.addColorStop(0, "rgba(54,40,20,0.42)"); grd.addColorStop(0.5, "rgba(54,40,20,0.18)"); grd.addColorStop(1, "rgba(0,0,0,0)");
      g2.fillStyle = grd; g2.fillRect(0, 0, s, s);
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x * 2.4, size.x * 1.4),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -size.y / 2 - 0.18;
      pivot.add(shadow);

      const key = new THREE.DirectionalLight(0xfff3e3, 2.2); key.position.set(3.5, 5, 4); scene.add(key);
      const fill = new THREE.DirectionalLight(0xbfe3d2, 0.6); fill.position.set(-4, 1, 2); scene.add(fill);
      const back = new THREE.DirectionalLight(0xffffff, 1.2); back.position.set(-1, 2, -4); scene.add(back);
      scene.add(new THREE.AmbientLight(0xfff3e3, 0.35));
      const glint = new THREE.PointLight(0xffffff, 5, 14, 2); scene.add(glint);

      // ---- interaction state ----
      let mx = 0, my = 0, heroProgress = 0;
      let rotY = -0.35;   // current spin
      let rotVel = 0;     // drag momentum
      let dragging = false;
      let lastX = 0;

      const onMove = (e: PointerEvent) => {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
        if (dragging) {
          const dx = e.clientX - lastX;
          rotY += dx * 0.008;
          rotVel = dx * 0.008;
          lastX = e.clientX;
        }
      };
      const onDown = (e: PointerEvent) => {
        dragging = true; lastX = e.clientX; rotVel = 0;
        canvas.setPointerCapture?.(e.pointerId);
        setHintGone(true);
      };
      const endDrag = () => { dragging = false; };
      const onScroll = () => {
        const r = wrap.getBoundingClientRect();
        heroProgress = Math.min(Math.max(-r.top / Math.max(r.height, 1), 0), 1);
      };
      window.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", endDrag);
        window.removeEventListener("pointercancel", endDrag);
        window.removeEventListener("scroll", onScroll);
      });

      // Auto-fit: frame the whole sculpture with margin for the canvas aspect,
      // looking slightly down so the disc tops show (real depth, not flat).
      const fit = () => {
        const r = wrap.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        const aspect = r.width / Math.max(r.height, 1);
        camera.aspect = aspect; camera.updateProjectionMatrix();

        const margin = 1.32;
        const halfFov = (FOV * Math.PI) / 360;
        const fitH = (size.y / 2) / Math.tan(halfFov);
        const fitW = (size.x / 2) / Math.tan(halfFov) / aspect;
        const dist = margin * Math.max(fitH, fitW);
        camera.position.set(0, dist * 0.16, dist);
        camera.lookAt(0, 0, 0);
      };
      const ro = new ResizeObserver(fit); ro.observe(wrap); fit();
      cleanups.push(() => ro.disconnect());

      const clock = new THREE.Clock();
      const tick = () => {
        if (disposed) return;
        const t = clock.getElapsedTime();

        // Spin: idle drift + drag momentum + scroll + pointer parallax.
        if (!dragging) {
          rotY += (reduce ? 0 : 0.0016) + rotVel;
          rotVel *= 0.94;
        }
        pivot.rotation.y = rotY + mx * 0.5 + (reduce ? 0 : heroProgress * 0.9);
        pivot.rotation.x += ((-my * 0.14 + (reduce ? 0 : heroProgress * 0.12)) - pivot.rotation.x) * 0.06;
        pivot.position.y = reduce ? 0 : -heroProgress * 0.5;

        const spread = reduce ? 0 : heroProgress * 0.4;
        floaters.forEach((m) => {
          const baseY = m.userData.baseY as number;
          m.position.y = (baseY - center.y) * (1 + spread);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <>
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing" />
          <span
            className={`pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--text-secondary)] transition-opacity duration-700 ${hintGone ? "opacity-0" : "opacity-70"}`}
            aria-hidden
          >
            Drag to turn
          </span>
        </>
      )}
    </div>
  );
}
