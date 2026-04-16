import React, { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

/* ── Koru spiral path ── */
function generateKoruPath(turns = 2.5, points = 200): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const angle = t * turns * Math.PI * 2;
    const r = 0.3 + t * 4.2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const z = Math.sin(t * Math.PI) * 0.8;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return pts;
}

/* ── Kete colours — 5 large accent spheres ── */
const KETE_COLORS = [
  { name: "MANAAKI", color: "#E8A090", index: 8 },
  { name: "WAIHANGA", color: "#E8A948", index: 18 },
  { name: "AUAHA", color: "#B8A5D0", index: 28 },
  { name: "ARATAKI", color: "#4AA5A8", index: 36 },
  { name: "PIKAU", color: "#7BA88C", index: 42 },
];
const KETE_INDICES = new Set(KETE_COLORS.map((k) => k.index));
function getKeteColor(i: number): string | null {
  return KETE_COLORS.find((c) => c.index === i)?.color || null;
}

/* ── Glass sphere ── */
function GlassSphere({ position, color, radius, phase, bobSpeed }: {
  position: THREE.Vector3; color: string; radius: number; phase: number; bobSpeed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position.y + Math.sin(clock.getElapsedTime() * bobSpeed + phase) * 0.06;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 48, 48]} />
      <MeshTransmissionMaterial
        transmission={0.94}
        roughness={0.03}
        thickness={0.5}
        chromaticAberration={0.06}
        color={color}
        envMapIntensity={1.8}
        backside
        ior={1.5}
        anisotropy={0.3}
      />
    </mesh>
  );
}

/* ── Thread between nodes ── */
function Thread({ start, end, phaseOffset }: {
  start: THREE.Vector3; end: THREE.Vector3; phaseOffset: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => {
    const mid = start.clone().lerp(end, 0.5);
    mid.z += 0.15;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return new THREE.TubeGeometry(curve, 16, 0.006, 6, false);
  }, [start, end]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const osc = 0.25 + Math.sin(clock.getElapsedTime() * 1.8 + phaseOffset) * 0.2;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = osc;
  });

  return (
    <mesh ref={ref} geometry={geom}>
      <meshBasicMaterial color="#7EEEF0" transparent opacity={0.3} toneMapped={false} />
    </mesh>
  );
}

/* ── Data pulse along thread ── */
function DataPulse({ start, end, delay }: {
  start: THREE.Vector3; end: THREE.Vector3; delay: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.getElapsedTime() * 2.2 + delay) % 2) / 2;
    ref.current.position.lerpVectors(start, end, t);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * Math.PI) * 0.7;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 12, 12]} />
      <meshBasicMaterial color="#7EEEF0" transparent opacity={0.8} toneMapped={false} />
    </mesh>
  );
}

/* ── Sparkle particle ── */
function Sparkle({ position, delay }: { position: THREE.Vector3; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pulse = Math.sin(t * 3 + delay) * 0.5 + 0.5;
    ref.current.scale.setScalar(pulse * 0.8 + 0.2);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.9;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} toneMapped={false} />
    </mesh>
  );
}

/* ── Mouse-follow tilt ── */
function SceneController({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) {
  const target = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  const onMove = useCallback((e: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    target.current.y = ((e.clientX - rect.left) / rect.width - 0.5) * 0.18;
    target.current.x = -((e.clientY - rect.top) / rect.height - 0.5) * 0.18;
  }, [gl]);

  React.useEffect(() => {
    const el = gl.domElement;
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [gl, onMove]);

  useFrame(() => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    g.rotation.y += 0.002;
    g.rotation.x += (target.current.x - g.rotation.x) * 0.04;
    g.rotation.y += (target.current.y - (g.rotation.y % (Math.PI * 2))) * 0.015;
  });

  return null;
}

/* ── Main 3D scene ── */
function KoruScene() {
  const groupRef = useRef<THREE.Group>(null!);
  const spiralPoints = useMemo(() => generateKoruPath(2.5, 200), []);

  const spheres = useMemo(() => {
    const result: { position: THREE.Vector3; color: string; radius: number; phase: number; bobSpeed: number }[] = [];
    for (let i = 0; i < 44; i++) {
      const idx = Math.floor((i / 43) * (spiralPoints.length - 1));
      const pos = spiralPoints[idx].clone();
      const isKete = KETE_INDICES.has(i);
      const keteColor = getKeteColor(i);
      result.push({
        position: pos,
        color: keteColor || "#8AD4D6",
        radius: isKete ? 0.28 : 0.1,
        phase: Math.random() * Math.PI * 2,
        bobSpeed: 0.5 + Math.random() * 0.6,
      });
    }
    return result;
  }, [spiralPoints]);

  const threads = useMemo(() => {
    const r: { start: THREE.Vector3; end: THREE.Vector3; phase: number }[] = [];
    for (let i = 0; i < spheres.length - 1; i++) {
      r.push({ start: spheres[i].position, end: spheres[i + 1].position, phase: i * 0.4 });
    }
    for (let i = 0; i < spheres.length - 6; i += 3) {
      r.push({ start: spheres[i].position, end: spheres[Math.min(i + 6, spheres.length - 1)].position, phase: i * 0.2 });
    }
    return r;
  }, [spheres]);

  const pulses = useMemo(() => {
    return threads.filter((_, i) => i % 2 === 0).map((t, i) => ({
      start: t.start, end: t.end, delay: i * 0.5,
    }));
  }, [threads]);

  const sparkles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const t = i / 39;
      const angle = t * 2.5 * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      const rad = 0.5 + t * 4.5 + (Math.random() - 0.5) * 0.6;
      return {
        position: new THREE.Vector3(
          Math.cos(angle) * rad,
          Math.sin(angle) * rad,
          (Math.random() - 0.5) * 1.5
        ),
        delay: i * 0.3,
      };
    });
  }, []);

  return (
    <>
      <SceneController groupRef={groupRef} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[-5, 8, 5]} intensity={1.5} color="#FFF8F0" />
      <pointLight position={[4, -3, 5]} intensity={0.6} color="#4AA5A8" />
      <pointLight position={[-3, 4, -3]} intensity={0.3} color="#E8A948" />

      <group ref={groupRef} scale={1}>
        {spheres.map((s, i) => (
          <GlassSphere key={i} {...s} />
        ))}
        {threads.map((t, i) => (
          <Thread key={`t-${i}`} start={t.start} end={t.end} phaseOffset={t.phase} />
        ))}
        {pulses.map((p, i) => (
          <DataPulse key={`p-${i}`} {...p} />
        ))}
        {sparkles.map((s, i) => (
          <Sparkle key={`s-${i}`} {...s} />
        ))}
      </group>

      <Environment preset="city" />
    </>
  );
}

/* ── Canvas-based animated mobile koru (uses 2D canvas, not WebGL) ── */
function MobileCanvasKoru() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const dots = useMemo(() => {
    const pts: { x: number; y: number; baseR: number; color: string; phase: number; isKete: boolean; name?: string }[] = [];
    for (let i = 0; i < 44; i++) {
      const t = i / 43;
      const angle = t * 2.5 * Math.PI * 2;
      const radius = 30 + t * 140;
      const x = 200 + Math.cos(angle) * radius;
      const y = 200 + Math.sin(angle) * radius;
      const kete = KETE_COLORS.find(k => k.index === i);
      pts.push({
        x, y,
        baseR: kete ? 9 : 4,
        color: kete?.color || "#8AD4D6",
        phase: i * 0.15,
        isKete: !!kete,
        name: kete?.name,
      });
    }
    return pts;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 2;
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);

    function draw(time: number) {
      const t = time / 1000;
      ctx!.clearRect(0, 0, 400, 400);

      // Background glow
      const bgGrad = ctx!.createRadialGradient(200, 200, 0, 200, 200, 190);
      const glowPulse = 0.1 + Math.sin(t * 0.8) * 0.05;
      bgGrad.addColorStop(0, `rgba(74, 165, 168, ${glowPulse})`);
      bgGrad.addColorStop(0.5, `rgba(232, 169, 72, ${glowPulse * 0.4})`);
      bgGrad.addColorStop(1, "transparent");
      ctx!.fillStyle = bgGrad;
      ctx!.fillRect(0, 0, 400, 400);

      // Connection lines
      for (let i = 0; i < dots.length - 1; i++) {
        const d = dots[i];
        const next = dots[i + 1];
        const lineAlpha = 0.1 + Math.sin(t * 1.5 + d.phase) * 0.12;
        ctx!.beginPath();
        ctx!.moveTo(d.x, d.y);
        ctx!.lineTo(next.x, next.y);
        ctx!.strokeStyle = `rgba(126, 238, 240, ${lineAlpha})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }

      // Cross-connections
      for (let i = 0; i < dots.length - 6; i += 4) {
        const d = dots[i];
        const far = dots[Math.min(i + 6, dots.length - 1)];
        const lineAlpha = 0.05 + Math.sin(t * 1.2 + i * 0.3) * 0.06;
        ctx!.beginPath();
        ctx!.moveTo(d.x, d.y);
        ctx!.lineTo(far.x, far.y);
        ctx!.strokeStyle = `rgba(126, 238, 240, ${lineAlpha})`;
        ctx!.lineWidth = 0.4;
        ctx!.stroke();
      }

      // Data pulses traveling along threads
      for (let p = 0; p < 8; p++) {
        const segIdx = (Math.floor(t * 3 + p * 5.5)) % (dots.length - 1);
        const frac = ((t * 3 + p * 5.5) % 1);
        const d = dots[segIdx];
        const next = dots[Math.min(segIdx + 1, dots.length - 1)];
        const px = d.x + (next.x - d.x) * frac;
        const py = d.y + (next.y - d.y) * frac;
        const pulseAlpha = Math.sin(frac * Math.PI) * 0.8;
        ctx!.beginPath();
        ctx!.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(126, 238, 240, ${pulseAlpha})`;
        ctx!.fill();
      }

      // Dots with glow
      for (const d of dots) {
        const pulse = Math.sin(t * 2 + d.phase) * 0.3 + 0.7;
        const r = d.baseR * (0.85 + pulse * 0.3);

        // Glow
        const glow = ctx!.createRadialGradient(d.x, d.y, 0, d.x, d.y, r * 3);
        glow.addColorStop(0, d.color + "40");
        glow.addColorStop(1, "transparent");
        ctx!.fillStyle = glow;
        ctx!.fillRect(d.x - r * 3, d.y - r * 3, r * 6, r * 6);

        // Core dot
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = d.color + (d.isKete ? "DD" : "AA");
        ctx!.fill();

        // Inner highlight
        ctx!.beginPath();
        ctx!.arc(d.x - r * 0.2, d.y - r * 0.3, r * 0.4, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(255,255,255,0.3)";
        ctx!.fill();
      }

      // Kete labels
      ctx!.textAlign = "center";
      ctx!.font = "600 7px 'Lato', sans-serif";
      for (const d of dots) {
        if (!d.name) continue;
        const labelAlpha = 0.4 + Math.sin(t * 1.5 + d.phase) * 0.4;
        ctx!.fillStyle = d.color + Math.round(labelAlpha * 255).toString(16).padStart(2, "0");
        ctx!.letterSpacing = "1px";
        ctx!.fillText(d.name, d.x, d.y - d.baseR - 6);
      }

      // Floating sparkles
      for (let i = 0; i < 20; i++) {
        const st = i / 19;
        const sAngle = st * 2.5 * Math.PI * 2 + t * 0.3 + i * 0.7;
        const sRad = 40 + st * 155 + Math.sin(t * 2 + i) * 8;
        const sx = 200 + Math.cos(sAngle) * sRad;
        const sy = 200 + Math.sin(sAngle) * sRad;
        const sparkAlpha = Math.sin(t * 3 + i * 0.5) * 0.4 + 0.3;
        if (sparkAlpha > 0) {
          ctx!.beginPath();
          ctx!.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255,255,255,${sparkAlpha})`;
          ctx!.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [dots]);

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", maxWidth: 380, maxHeight: 380 }}
      />
    </motion.div>
  );
}

/* ── Export ── */
export default function KoruDataNetwork({ isMobile = false }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <div className="w-full h-full" style={{ minHeight: 380 }}>
        <MobileCanvasKoru />
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ height: "80vh", minHeight: 600 }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <KoruScene />
      </Canvas>
    </div>
  );
}
