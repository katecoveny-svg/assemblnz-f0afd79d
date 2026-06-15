"use client";

/**
 * VesselHero — the Assembl signature 3D piece, Direction B "stacked".
 *
 * A balanced stack of cream-ceramic and translucent pounamu/teal/amber glass
 * forms, floating on a thin gold easel — the "mahi that earns its proof" idea
 * made physical (evidence, stacked and balanced).
 *
 * Client-only and self-contained: three.js is dynamically imported inside the
 * effect so it never touches the server bundle, and WebGL only runs after mount.
 * Falls back to a calm static surface when WebGL is unavailable or the visitor
 * prefers reduced motion. Floating kete chips are projected from 3D anchors.
 */

import { useEffect, useRef, useState } from "react";

type Chip = { en: string; reo: string; acc: string; x: number; y: number; z: number };

const CHIPS: Chip[] = [
  { en: "Freight & Customs", reo: "Pīkau", acc: "#3A7D6E", x: 1.15, y: -0.74, z: 0.2 },
  { en: "Hospitality", reo: "Manaaki", acc: "#B5533A", x: -1.15, y: -0.16, z: 0.2 },
  { en: "Construction", reo: "Waihanga", acc: "#5E7E62", x: 1.0, y: 0.5, z: 0.2 },
];

export function VesselHero() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
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
      items.forEach((m, i) => { m.position.y = ys[i]; m.userData.phase = i * 0.7; stack.add(m); });
      const shell = lens(0.62, 0.42, ceramic(CREAM));
      shell.position.set(0.02, 0.92, 0); shell.rotation.z = 0.18; shell.userData.phase = 4.9; stack.add(shell);
      const floaters = [...items, shell];

      // thin gold easel
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

      // contact shadow
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

      const anchors = CHIPS.map((c) => new THREE.Vector3(c.x, c.y, c.z));

      let mx = 0, my = 0, scrollY = 0;
      const onMove = (e: PointerEvent) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
      const onScroll = () => { scrollY = window.scrollY; };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("scroll", onScroll, { passive: true });
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
        if (!reduce) {
          stack.rotation.y = t * 0.18 + mx * 0.4;
          stack.rotation.x += ((-my * 0.12) - stack.rotation.x) * 0.05;
          stack.position.y = -scrollY * 0.0016;
          floaters.forEach((m) => { m.position.x = Math.sin(t * 0.6 + (m.userData.phase as number)) * 0.012; });
          glint.position.set(Math.cos(t * 0.7) * 5, 3, Math.sin(t * 0.7) * 5);
        }
        stack.updateMatrixWorld();
        const r = wrap.getBoundingClientRect();
        anchors.forEach((v, i) => {
          const p = v.clone().applyMatrix4(stack.matrixWorld).project(camera);
          const el = chipRefs.current[i];
          if (el) {
            el.style.left = ((p.x * 0.5 + 0.5) * r.width) + "px";
            el.style.top = ((-p.y * 0.5 + 0.5) * r.height) + "px";
            el.style.opacity = p.z < 1 ? "1" : "0";
          }
        });
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      stack.updateMatrixWorld(); tick();

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
      {!failed &&
        CHIPS.map((c, i) => (
          <div
            key={c.en}
            ref={(el) => { chipRefs.current[i] = el; }}
            className="pointer-events-none absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/60 bg-white/40 px-3.5 py-2 text-[12.5px] text-[#2e271f] shadow-[0_10px_34px_rgba(40,30,18,0.12)] backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: c.acc, boxShadow: `0 0 9px ${c.acc}` }} />
            <b className="font-medium">{c.en}</b>
            <small className="font-mono text-[10px] tracking-[0.04em] text-[color:var(--text-secondary)]">{c.reo}</small>
          </div>
        ))}
    </div>
  );
}
