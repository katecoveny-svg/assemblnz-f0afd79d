import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

/* ─────────────────────────────────────────────────────────
   GLASS MARBLE KORU — glossy glass marbles arranged along
   a logarithmic koru spiral, connected by glowing data
   lines with flashing data packets travelling between them.
   ───────────────────────────────────────────────────────── */

interface MarbleNode {
  position: THREE.Vector3;
  radius: number;
  color: string;
  index: number;
}

/* Build the marble positions along a logarithmic koru spiral */
function buildKoruMarbles(): MarbleNode[] {
  const nodes: MarbleNode[] = [];
  const count = 14;
  const turns = 2.2;
  const a = 0.32;
  const b = 0.26;
  const palette = ["#4AA5A8", "#7DD4D6", "#E8A948", "#B8A5D0", "#E8A090", "#7BA88C"];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const theta = t * turns * Math.PI * 2;
    const r = a * Math.exp(b * theta);
    const lift = Math.pow(t, 1.4) * 0.6 - 0.1;
    // Marble size: large bulb at base, taper down to fine tip
    const radius = Math.max(0.18, 0.85 - t * 0.7 + Math.pow(1 - t, 2) * 0.3);
    nodes.push({
      position: new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, lift),
      radius,
      color: palette[i % palette.length],
      index: i,
    });
  }
  // Reverse so the big bulb is at the centre / base
  return nodes.reverse();
}

/* Build a smooth curve through marble centres for data packets to travel along */
function buildConnectorCurve(nodes: MarbleNode[]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(nodes.map((n) => n.position.clone()), false, "catmullrom", 0.5);
}

/* A single glossy glass marble */
function GlassMarble({ node }: { node: MarbleNode }) {
  const innerRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + node.index * 0.4;
    if (innerRef.current) {
      const m = innerRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 + 0.25 * Math.sin(t * 1.6);
      innerRef.current.scale.setScalar(0.55 + 0.04 * Math.sin(t * 2.2));
    }
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.18 + 0.12 * Math.sin(t * 1.2);
    }
  });

  return (
    <group position={node.position}>
      {/* Outer glass shell */}
      <mesh>
        <sphereGeometry args={[node.radius, 48, 48]} />
        <MeshTransmissionMaterial
          color="#F0FBFC"
          transmission={0.95}
          roughness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.01}
          ior={1.55}
          samples={10}
          distortion={0.25}
          temporalDistortion={0.08}
          envMapIntensity={4.5}
          chromaticAberration={0.08}
          thickness={node.radius * 1.4}
          attenuationColor={node.color}
          attenuationDistance={node.radius * 4}
        />
      </mesh>
      {/* Coloured luminous core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[node.radius * 0.6, 24, 24]} />
        <meshBasicMaterial color={node.color} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      {/* Hot white centre */}
      <mesh scale={0.25}>
        <sphereGeometry args={[node.radius, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      {/* Outer glow halo */}
      <mesh ref={haloRef} scale={1.45}>
        <sphereGeometry args={[node.radius, 20, 20]} />
        <meshBasicMaterial color={node.color} transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {/* Specular highlight (fake sun-glint) */}
      <mesh position={[-node.radius * 0.4, node.radius * 0.5, node.radius * 0.7]}>
        <sphereGeometry args={[node.radius * 0.18, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

/* Glowing connection line between two marbles */
function ConnectionLine({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const { geometry, position, quaternion, length } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    const geo = new THREE.CylinderGeometry(0.025, 0.025, len, 8, 1, true);
    return { geometry: geo, position: mid, quaternion: q, length: len };
  }, [from, to]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.35 + 0.25 * Math.sin(clock.elapsedTime * 2 + length);
  });

  return (
    <mesh ref={ref} geometry={geometry} position={position} quaternion={quaternion}>
      <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
    </mesh>
  );
}

/* Flashing data packet that travels along the koru curve */
function DataPacket({
  curve,
  color,
  speed,
  offset,
  size = 0.08,
}: {
  curve: THREE.CatmullRomCurve3;
  color: string;
  speed: number;
  offset: number;
  size?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const trailRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = ((clock.elapsedTime * speed + offset) % 1 + 1) % 1;
    const point = curve.getPointAt(t);
    if (ref.current) {
      ref.current.position.copy(point);
      const flash = 0.7 + 0.3 * Math.sin(clock.elapsedTime * 8 + offset * 10);
      ref.current.scale.setScalar(flash);
    }
    trailRefs.current.forEach((m, i) => {
      if (!m) return;
      const tt = ((t - (i + 1) * 0.012) + 1) % 1;
      const p = curve.getPointAt(tt);
      m.position.copy(p);
      const fade = 1 - (i + 1) / (trailRefs.current.length + 1);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.6 * fade;
      m.scale.setScalar(fade * 0.85);
    });
  });

  return (
    <>
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[size, 14, 14]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh>
          <sphereGeometry args={[size * 2.4, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.65} depthWrite={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[size * 5, 10, 10]} />
          <meshBasicMaterial color={color} transparent opacity={0.22} depthWrite={false} />
        </mesh>
      </group>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh key={`trail-${i}`} ref={(m) => { if (m) trailRefs.current[i] = m; }}>
          <sphereGeometry args={[size * 0.65, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

/* Containment glass orb — the world the koru lives inside */
function ContainmentSphere() {
  const ref = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = t * 0.04;
    }
    if (haloRef.current) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.1);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + pulse * 0.1;
      haloRef.current.scale.setScalar(1 + pulse * 0.04);
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[4.4, 96, 96]} />
        <MeshTransmissionMaterial
          color="#EAFCFD"
          transmission={0.99}
          roughness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.01}
          ior={1.45}
          samples={10}
          distortion={0.18}
          temporalDistortion={0.1}
          envMapIntensity={3.5}
          chromaticAberration={0.1}
          thickness={1.2}
          attenuationColor="#B8EAEC"
          attenuationDistance={6}
          backside
        />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[4.7, 48, 48]} />
        <meshBasicMaterial color="#7DD4D6" transparent opacity={0.16} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      {/* Specular highlights — make the orb feel like real glass */}
      <mesh position={[-1.6, 2.2, 2.5]}>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.55} />
      </mesh>
      <mesh position={[1.4, -2.4, 2.0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/* Saturn-style energy ring */
function OrbitalRing({
  radius,
  color,
  speed,
  rotation,
  opacity = 0.45,
}: {
  radius: number;
  color: string;
  speed: number;
  rotation: [number, number, number];
  opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = rotation[2] + clock.elapsedTime * speed;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = opacity * (0.7 + 0.3 * Math.sin(clock.elapsedTime * 1.3));
  });
  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, 0.012, 12, 160]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/* Orbiting kete-coloured nodes (each one represents a kete) */
function OrbitingNode({
  radius,
  speed,
  phase,
  tilt,
  color,
  size = 0.08,
  axis = "y",
}: {
  radius: number;
  speed: number;
  phase: number;
  tilt: number;
  color: string;
  size?: number;
  axis?: "x" | "y" | "z";
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + phase;
    let x = Math.cos(t) * radius;
    let y = Math.sin(t * 0.7) * radius * 0.3 + Math.sin(tilt) * radius * 0.2;
    let z = Math.sin(t) * radius;
    if (axis === "x") {
      [x, y, z] = [y, x, z];
    }
    if (axis === "z") {
      [x, y, z] = [z, y, x];
    }
    ref.current.position.set(x, y, z);
    const pulse = 0.7 + 0.3 * Math.sin(clock.elapsedTime * 3 + phase);
    ref.current.scale.setScalar(pulse);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[size, 14, 14]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 2.2, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * 4.5, 10, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ─── Main scene ─── */
function KoruScene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const marbles = useMemo(() => buildKoruMarbles(), []);
  const curve = useMemo(() => buildConnectorCurve(marbles), [marbles]);

  const orbitNodes = useMemo(
    () => [
      { radius: 4.4, speed: 0.35, phase: 0, tilt: 0.3, color: "#4AA5A8", axis: "y" as const, size: 0.09 },
      { radius: 4.4, speed: 0.28, phase: 1.2, tilt: -0.4, color: "#E8A948", axis: "y" as const, size: 0.1 },
      { radius: 4.4, speed: 0.42, phase: 2.4, tilt: 0.6, color: "#B8A5D0", axis: "y" as const, size: 0.08 },
      { radius: 4.4, speed: 0.31, phase: 3.6, tilt: -0.2, color: "#E8A090", axis: "y" as const, size: 0.09 },
      { radius: 4.4, speed: 0.38, phase: 4.8, tilt: 0.5, color: "#7BA88C", axis: "y" as const, size: 0.08 },
      { radius: 4.6, speed: 0.22, phase: 0.7, tilt: -0.6, color: "#7DD4D6", axis: "x" as const, size: 0.07 },
      { radius: 4.6, speed: 0.33, phase: 4.0, tilt: -0.3, color: "#7DD4D6", axis: "x" as const, size: 0.07 },
      { radius: 4.85, speed: 0.18, phase: 1.5, tilt: 0.2, color: "#E8A948", axis: "z" as const, size: 0.06 },
      { radius: 4.85, speed: 0.24, phase: 3.2, tilt: -0.5, color: "#B8A5D0", axis: "z" as const, size: 0.07 },
    ],
    [],
  );

  const packets = useMemo(
    () => [
      { color: "#4AA5A8", speed: 0.18, offset: 0.0, size: 0.09 },
      { color: "#E8A948", speed: 0.14, offset: 0.25, size: 0.08 },
      { color: "#B8A5D0", speed: 0.22, offset: 0.5, size: 0.08 },
      { color: "#FFFFFF", speed: 0.26, offset: 0.75, size: 0.07 },
      { color: "#7DD4D6", speed: 0.16, offset: 0.4, size: 0.09 },
      { color: "#E8A090", speed: 0.2, offset: 0.6, size: 0.08 },
    ],
    [],
  );

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += 0.0008;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.15, 0.03);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.15, 0.03);
  });

  return (
    <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.22}>
      <ContainmentSphere />

      <OrbitalRing radius={4.55} color="#7DD4D6" speed={0.12} rotation={[Math.PI / 2.2, 0, 0]} opacity={0.5} />
      <OrbitalRing radius={4.7} color="#E8A948" speed={-0.08} rotation={[Math.PI / 1.6, 0.4, 0]} opacity={0.38} />
      <OrbitalRing radius={4.9} color="#B8A5D0" speed={0.06} rotation={[Math.PI / 3, -0.5, 0]} opacity={0.32} />
      <OrbitalRing radius={5.15} color="#4AA5A8" speed={-0.04} rotation={[Math.PI / 2, Math.PI / 4, 0]} opacity={0.26} />

      {orbitNodes.map((n, i) => (
        <OrbitingNode key={`orb-${i}`} {...n} />
      ))}

      <group ref={groupRef} scale={1.5}>
        {marbles.slice(0, -1).map((m, i) => (
          <ConnectionLine key={`line-${i}`} from={m.position} to={marbles[i + 1].position} color={m.color} />
        ))}
        {marbles.map((m) => (
          <GlassMarble key={`marble-${m.index}`} node={m} />
        ))}
        {packets.map((p, i) => (
          <DataPacket key={`packet-${i}`} curve={curve} {...p} />
        ))}
      </group>
    </Float>
  );
}

/* ─── Hero ─── */
const GlassKoruHero = () => {
  const isMobile = useIsMobile();
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanvasReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
        {/* Left: text */}
        <div className="relative z-10 lg:col-span-2 text-left">
          <div
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full mb-7"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "0 8px 24px rgba(74,165,168,0.12)",
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: "#4AA5A8" }} />
            <span
              className="text-[10px] tracking-[3px] uppercase"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#334155",
                fontWeight: 600,
              }}
            >
              Now onboarding NZ businesses
            </span>
          </div>

          <h1
            className="font-sans text-6xl text-left text-secondary-foreground"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              fontSize: isMobile ? "2.2rem" : "3.6rem",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#0F172A",
            }}
          >
            The intelligent operating
            <br />
            system for
            <br />
            NZ business
          </h1>

          <p
            className="mt-6 max-w-[420px] text-[15px] sm:text-[17px] leading-[1.75]"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              color: "#4B5563",
            }}
          >
            Specialist workflows that reduce admin, surface risk earlier, and
            keep your people in control.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/how-it-works"
              className="group inline-flex items-center gap-3 px-8 py-4 text-[13px] font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(145deg, #55BFC1, #4AA5A8)",
                color: "#FFFFFF",
                boxShadow:
                  "0 6px 24px rgba(74,165,168,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              Start here{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/demos"
              className="group inline-flex items-center gap-3 px-8 py-4 text-[13px] font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(74,165,168,0.25)",
                color: "#4AA5A8",
                fontFamily: "'Lato', sans-serif",
                boxShadow:
                  "4px 4px 10px rgba(166,166,180,0.3), -4px -4px 10px rgba(255,255,255,0.9)",
              }}
            >
              Run live demo{" "}
              <ArrowRight
                size={14}
                className="opacity-60 group-hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
        </div>

        {/* Right: 3D Koru */}
        <div
          className="relative lg:col-span-3 w-full"
          style={{ height: isMobile ? "380px" : "680px" }}
        >
          {canvasReady && (
            <Canvas
              camera={{ position: [0, 0, 11], fov: 48 }}
              gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
              style={{ background: "transparent" }}
              dpr={[1, 2]}
            >
              <Environment preset="studio" environmentIntensity={1.0} />

              <ambientLight intensity={1.4} color="#F8F6F0" />
              <directionalLight position={[8, 8, 5]} intensity={2.4} color="#FFFFFF" />
              <directionalLight position={[-5, 3, 8]} intensity={1.2} color="#D4F0F0" />
              <directionalLight position={[3, -3, 6]} intensity={0.8} color="#FFFBE8" />
              <pointLight position={[0, 0, 6]} intensity={1.6} color="#FFFFFF" />
              <pointLight position={[-3, 2, 4]} intensity={1.2} color="#7DD4D6" distance={14} />
              <pointLight position={[3, -2, 4]} intensity={1.0} color="#E8A948" distance={14} />

              <Suspense fallback={null}>
                <KoruScene />
              </Suspense>
            </Canvas>
          )}

          {/* Vibrant radial aura behind the orb */}
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 50% 45%, rgba(74,165,168,0.32) 0%, rgba(125,212,214,0.2) 22%, rgba(232,169,72,0.12) 48%, rgba(184,165,208,0.08) 65%, transparent 78%)",
              filter: "blur(10px)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none -z-10 animate-pulse"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(125,212,214,0.28) 0%, transparent 55%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.18) 0%, transparent 18%)",
              mixBlendMode: "screen",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default GlassKoruHero;
