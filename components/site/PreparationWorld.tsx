"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { VisitChoice } from "@/lib/copy/prepared-visit";
import type { Mesh, MeshStandardMaterial } from "three";

export default function PreparationWorld({
  stage,
  choice,
  paused,
  cinematic = false,
}: {
  stage: number;
  choice: VisitChoice | null;
  paused: boolean;
  cinematic?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const current = useRef({ stage, choice, paused });
  const [unavailable, setUnavailable] = useState(false);
  const [angle, setAngle] = useState(0);
  const view = useRef(0);
  useEffect(() => {
    current.current = { stage, choice, paused };
  }, [stage, choice, paused]);
  useEffect(() => {
    view.current = angle;
  }, [angle]);
  useEffect(() => {
    let cancelled = false,
      dispose = () => {};
    async function mount() {
      try {
        const T = await import("three");
        const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
        if (cancelled || !host.current) return;
        const el = host.current;
        const renderer = new T.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(
          Math.min(devicePixelRatio, innerWidth < 700 ? 1 : 1.5),
        );
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        el.appendChild(renderer.domElement);
        renderer.domElement.setAttribute(
          "aria-label",
          "Original 3D preparation folio",
        );
        const scene = new T.Scene();
        const environment = new RoomEnvironment();
        const pmrem = new T.PMREMGenerator(renderer);
        const envMap = pmrem.fromScene(environment);
        scene.environment = envMap.texture;
        environment.dispose();
        pmrem.dispose();
        scene.background = new T.Color("#f5f1f2");
        const camera = new T.PerspectiveCamera(
          34,
          el.clientWidth / el.clientHeight,
          0.1,
          50,
        );
        camera.position.set(5, 6.3, 6);
        camera.lookAt(0, 0, 0);
        scene.add(new T.HemisphereLight("#fffdfb", "#916a70", 3));
        const light = new T.DirectionalLight("#fff7ed", 4);
        light.position.set(-3, 7, 2);
        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);
        scene.add(light);
        const fill = new T.DirectionalLight("#e0d3dd", 1.4);
        fill.position.set(5, 3, -5);
        scene.add(fill);
        const material = (color: string, metalness = 0, roughness = 0.6) =>
          new T.MeshStandardMaterial({ color, metalness, roughness });
        const paper = material("#fffdfb"),
          plum = material("#240b21"),
          rose = material("#916a70", 0.65, 0.28),
          nickel = material("#c6c7c9", 0.95, 0.18);
        function plate(
          w: number,
          h: number,
          depth: number,
          radius: number,
          m: MeshStandardMaterial,
        ) {
          const sh = new T.Shape();
          const x = -w / 2,
            y = -h / 2,
            r = radius;
          sh.moveTo(x + r, y);
          sh.lineTo(x + w - r, y);
          sh.quadraticCurveTo(x + w, y, x + w, y + r);
          sh.lineTo(x + w, y + h - r);
          sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          sh.lineTo(x + r, y + h);
          sh.quadraticCurveTo(x, y + h, x, y + h - r);
          sh.lineTo(x, y + r);
          sh.quadraticCurveTo(x, y, x + r, y);
          const mesh = new T.Mesh(
            new T.ExtrudeGeometry(sh, {
              depth,
              bevelEnabled: true,
              bevelSize: 0.012,
              bevelThickness: 0.012,
              bevelSegments: 2,
              steps: 1,
            }),
            m,
          );
          mesh.rotation.x = -Math.PI / 2;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);
          return mesh;
        }
        const table = new T.Mesh(
          new T.BoxGeometry(16, 0.2, 13),
          material("#eee7eb"),
        );
        table.position.y = -0.2;
        table.receiveShadow = true;
        scene.add(table);
        const folio = plate(2.65, 3.4, 0.05, 0.08, plum);
        folio.position.set(0.7, 0.02, 0);
        const pages: Mesh[] = [];
        for (let i = 0; i < 4; i++) {
          const p = plate(2.4, 3.05, 0.015, 0.02, paper);
          p.position.set(-2.4 + i * 0.8, 0.12 + i * 0.12, i % 2 ? -0.7 : 0.6);
          pages.push(p);
        }
        const phone = plate(0.82, 1.65, 0.09, 0.12, rose);
        phone.position.set(-2, 0.1, 0.8);
        phone.rotation.z = -0.2;
        const screen = plate(0.71, 1.42, 0.008, 0.08, plum);
        screen.position.copy(phone.position);
        screen.position.y += 0.11;
        screen.rotation.z = -0.2;
        const clip = plate(0.48, 0.1, 0.03, 0.04, nickel);
        clip.position.set(0.7, 0.4, -1.48);
        const receiptCanvas = document.createElement("canvas");
        receiptCanvas.width = 512;
        receiptCanvas.height = 640;
        const ctx = receiptCanvas.getContext("2d");
        const texture = new T.CanvasTexture(receiptCanvas);
        texture.colorSpace = T.SRGBColorSpace;
        const receiptMaterial = new T.MeshStandardMaterial({
          map: texture,
          roughness: 0.9,
        });
        const receipt = new T.Mesh(
          new T.PlaneGeometry(2.22, 2.77),
          receiptMaterial,
        );
        receipt.rotation.x = -Math.PI / 2;
        receipt.position.set(0.7, 0.73, 0.05);
        scene.add(receipt);
        let drawn = "";
        function updateReceipt() {
          const key = `${current.current.stage}-${current.current.choice}`;
          if (key === drawn || !ctx) return;
          drawn = key;
          ctx.fillStyle = "#fffdfb";
          ctx.fillRect(0, 0, 512, 640);
          ctx.fillStyle = "#240b21";
          ctx.font = "36px sans-serif";
          ctx.fillText("assembl", 42, 72);
          ctx.font = "17px monospace";
          ctx.fillText("SAMPLE VISIT BRIEF", 42, 135);
          ctx.fillStyle = "#916a70";
          ctx.fillRect(42, 160, 428, 4);
          ctx.fillStyle = "#240b21";
          ctx.font = "28px sans-serif";
          const labels =
            current.current.choice === "mobility"
              ? ["transport question", "prepared for review"]
              : current.current.choice === "clarity"
                ? ["explain the work", "before approval"]
                : current.current.choice === "pickup"
                  ? ["collection steps", "ready to discuss"]
                  : ["ordinary checklist", "ready to discuss"];
          labels.forEach((s, i) => ctx.fillText(s, 42, 220 + i * 40));
          ctx.font = "18px sans-serif";
          [
            "sample service adviser",
            "one-time use",
            "no booking or message sent",
          ].forEach((s, i) => ctx.fillText(s, 42, 360 + i * 36));
          ctx.fillStyle = "#240b21";
          ctx.fillRect(42, 520, 428, 65);
          ctx.fillStyle = "#fffdfb";
          ctx.font = "22px sans-serif";
          ctx.fillText(
            current.current.stage === 3
              ? "reviewed locally"
              : "prepared, not submitted",
            63,
            561,
          );
          texture.needsUpdate = true;
        }
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        let scroll = 0,
          visible = true;
        const onScroll = () => {
          const rect = el.getBoundingClientRect();
          scroll = Math.max(
            0,
            Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)),
          );
          visible = rect.bottom > 0 && rect.top < innerHeight;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        const resize = new ResizeObserver(() => {
          camera.aspect = el.clientWidth / el.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(el.clientWidth, el.clientHeight);
        });
        resize.observe(el);
        let raf = 0,
          progress = 0;
        function render() {
          raf = requestAnimationFrame(render);
          if (!visible) return;
          const target = reduced ? 1 : current.current.stage / 3;
          progress = current.current.paused
            ? target
            : progress + (target - progress) * 0.06;
          pages.forEach((p, i) => {
            const looseX = -2.3 + i * 0.7,
              looseZ = i % 2 ? -0.7 : 0.6;
            p.position.set(
              T.MathUtils.lerp(looseX, 0.7, progress),
              0.13 + i * 0.1 + (cinematic ? (1 - progress) * (0.8 + i * 0.45) : 0),
              T.MathUtils.lerp(looseZ, 0.05, progress),
            );
            p.rotation.z = (1 - progress) * (i - 1.5) * 0.18;
          });
          receipt.visible = progress > 0.5;
          receipt.position.y = 0.13 + 3 * 0.1 + 0.025;
          clip.position.y = 0.5;
          const a =
            (reduced || current.current.paused ? 0 : scroll * 0.2) +
            view.current * 0.3;
          if (cinematic) {
            const sweep = progress * 1.1 - 0.5;
            camera.position.set(7 * Math.sin(sweep), 4.6 - progress * 1.7, 7 * Math.cos(sweep));
            camera.lookAt(-0.1, 0.7, 0);
            camera.setViewOffset(el.clientWidth, el.clientHeight, -el.clientWidth * 0.22, 0, el.clientWidth, el.clientHeight);
          } else {
            camera.position.set(5 * Math.cos(a), 6.3, 6 + Math.sin(a));
            camera.lookAt(0, 0.2, 0);
          }
          updateReceipt();
          renderer.render(scene, camera);
        }
        render();
        dispose = () => {
          cancelAnimationFrame(raf);
          resize.disconnect();
          window.removeEventListener("scroll", onScroll);
          scene.traverse((obj) => {
            if (obj instanceof T.Mesh) {
              obj.geometry.dispose();
              (Array.isArray(obj.material)
                ? obj.material
                : [obj.material]
              ).forEach((m) => m.dispose());
            }
          });
          envMap.dispose();
          texture.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        setUnavailable(true);
      }
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          mount();
        }
      },
      { rootMargin: "180px" },
    );
    if (host.current) observer.observe(host.current);
    return () => {
      cancelled = true;
      observer.disconnect();
      dispose();
    };
  }, [cinematic]);
  return (
    <>
      <div className="aw-canvas" ref={host}>
        {unavailable && (
          <div className="aw-still">
            <Image
              src="/images/assembl-preparation-world.webp"
              alt="Preparation studio still view"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
            <span>still view / 3D is unavailable in this browser</span>
          </div>
        )}
      </div>
      {!cinematic && <div className="aw-view-controls" aria-label="View the preparation table">
        {["overview", "the folio", "the handoff"].map((text, i) => (
          <button
            key={text}
            disabled={unavailable}
            aria-pressed={angle === i}
            onClick={() => setAngle(i)}
          >
            {text}
          </button>
        ))}
      </div>}
    </>
  );
}
