import { useRef, useMemo, Suspense, forwardRef, useImperativeHandle } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Shared curve handle — Ribbon exposes its live curve so FairyLights
 * can ride along the same flowing path.
 */
type CurveHandle = { curve: THREE.CatmullRomCurve3 };

/**
 * DataRibbons — soft luminous aurora threads of pounamu + sea-glass light
 * that drift horizontally through the page (8–12s cycles).
 * Atmospheric, never UI. Sits behind content at low opacity.
 *
 * One ribbon system per major section.
 */

interface RibbonProps {
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  yOffset: number;
  color: string;
  thickness: number;
  segments?: number;
}

function Ribbon({
  amplitude,
  frequency,
  speed,
  phase,
  yOffset,
  color,
  thickness,
  segments = 96,
}: RibbonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(phase);

  // Build the curve once, then mutate points each frame
  const { curve, points } = useMemo(() => {
    const pts = Array.from({ length: segments + 1 }, (_, i) => {
      const x = (i / segments) * 12 - 6; // -6 to 6 across screen
      return new THREE.Vector3(x, yOffset, 0);
    });
    const c = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    return { curve: c, points: pts };
  }, [segments, yOffset]);

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, segments, thickness, 8, false),
    [curve, segments, thickness]
  );

  useFrame((_, dt) => {
    tRef.current += dt * speed;
    const t = tRef.current;

    // Mutate curve points to create a flowing aurora wave
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 12 - 6;
      const wave1 = Math.sin(x * frequency + t) * amplitude;
      const wave2 = Math.sin(x * frequency * 0.5 + t * 0.7) * amplitude * 0.4;
      const z = Math.cos(x * frequency * 0.7 + t * 0.6) * amplitude * 0.5;
      points[i].set(x, yOffset + wave1 + wave2, z);
    }
    curve.points = points;

    // Rebuild geometry attribute (cheap for low segment counts)
    const newGeo = new THREE.TubeGeometry(curve, segments, thickness, 8, false);
    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = newGeo;
    }
  });

  return (
    <mesh ref={meshRef} geometry={tubeGeometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

interface DataRibbonsProps {
  /** "subtle" (1 ribbon, low amp) | "soft" (2 ribbons) | "rich" (3 ribbons, hero) */
  intensity?: "subtle" | "soft" | "rich";
  /** Tint of the dominant ribbon */
  tone?: "pounamu" | "seaglass" | "mixed";
  className?: string;
  style?: React.CSSProperties;
  height?: number;
  opacity?: number;
}

const POUNAMU = "#1F4D47";
const SEAGLASS = "#C4D6D2";
const POUNAMU_GLOW = "#3A8077";

export default function DataRibbons({
  intensity = "soft",
  tone = "mixed",
  className = "",
  style,
  height = 360,
  opacity = 0.7,
}: DataRibbonsProps) {
  const ribbons = useMemo(() => {
    const base: RibbonProps[] = [];

    const pounamuColor = tone === "seaglass" ? SEAGLASS : POUNAMU_GLOW;
    const seaglassColor = tone === "pounamu" ? POUNAMU : SEAGLASS;

    if (intensity === "subtle") {
      base.push({
        amplitude: 0.4,
        frequency: 0.6,
        speed: 0.18,
        phase: 0,
        yOffset: 0,
        color: pounamuColor,
        thickness: 0.025,
      });
    } else if (intensity === "soft") {
      base.push(
        {
          amplitude: 0.55,
          frequency: 0.55,
          speed: 0.16,
          phase: 0,
          yOffset: 0.25,
          color: pounamuColor,
          thickness: 0.028,
        },
        {
          amplitude: 0.45,
          frequency: 0.7,
          speed: 0.13,
          phase: 1.6,
          yOffset: -0.35,
          color: seaglassColor,
          thickness: 0.022,
        }
      );
    } else {
      // rich (hero)
      base.push(
        {
          amplitude: 0.7,
          frequency: 0.5,
          speed: 0.18,
          phase: 0,
          yOffset: 0.4,
          color: pounamuColor,
          thickness: 0.03,
        },
        {
          amplitude: 0.55,
          frequency: 0.65,
          speed: 0.14,
          phase: 1.2,
          yOffset: -0.1,
          color: seaglassColor,
          thickness: 0.024,
        },
        {
          amplitude: 0.4,
          frequency: 0.85,
          speed: 0.11,
          phase: 2.8,
          yOffset: -0.5,
          color: pounamuColor,
          thickness: 0.02,
        }
      );
    }
    return base;
  }, [intensity, tone]);

  return (
    <div
      className={`pointer-events-none ${className}`}
      style={{
        width: "100%",
        height,
        opacity,
        position: "relative",
        ...style,
      }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, premultipliedAlpha: true }}
          style={{ background: "transparent" }}
        >
          {ribbons.map((r, i) => (
            <Ribbon key={i} {...r} />
          ))}
        </Canvas>
      </Suspense>
    </div>
  );
}
