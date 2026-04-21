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

const Ribbon = forwardRef<CurveHandle, RibbonProps>(function Ribbon(
  { amplitude, frequency, speed, phase, yOffset, color, thickness, segments = 96 },
  ref
) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(phase);

  // Build the curve once, then mutate points each frame
  const { curve, points } = useMemo(() => {
    const pts = Array.from({ length: segments + 1 }, (_, i) => {
      const x = (i / segments) * 12 - 6;
      return new THREE.Vector3(x, yOffset, 0);
    });
    const c = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    return { curve: c, points: pts };
  }, [segments, yOffset]);

  // Expose the live curve so FairyLights can sample positions along it
  useImperativeHandle(ref, () => ({ curve }), [curve]);

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, segments, thickness, 8, false),
    [curve, segments, thickness]
  );

  useFrame((_, dt) => {
    tRef.current += dt * speed;
    const t = tRef.current;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 12 - 6;
      const wave1 = Math.sin(x * frequency + t) * amplitude;
      const wave2 = Math.sin(x * frequency * 0.5 + t * 0.7) * amplitude * 0.4;
      const z = Math.cos(x * frequency * 0.7 + t * 0.6) * amplitude * 0.5;
      points[i].set(x, yOffset + wave1 + wave2, z);
    }
    curve.points = points;

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
});

/**
 * FairyLights — twinkly sparkles that ride along a ribbon's curve,
 * with per-particle pulse + slow drift along the path. Pure additive
 * points, very cheap.
 */
function FairyLights({
  curveRef,
  count = 28,
  color,
  driftSpeed = 0.06,
  size = 0.09,
}: {
  curveRef: React.RefObject<CurveHandle>;
  count?: number;
  color: string;
  driftSpeed?: number;
  size?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  // Per-particle phase, twinkle frequency, and base position along curve [0..1]
  const params = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      base: i / count,
      phase: Math.random() * Math.PI * 2,
      twinkleHz: 3.5 + Math.random() * 4.5, // 3.5–8 Hz — crisp fairy-light blink
      sizeJitter: 0.5 + Math.random() * 1.1,
      // Some stars stay dark longer between twinkles (rare bright pulses)
      sparkBias: Math.random() < 0.35 ? 4.0 : 1.4,
    }));
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const sizes = useMemo(() => new Float32Array(count), [count]);
  const opacities = useMemo(() => new Float32Array(count), [count]);
  const tRef = useRef(0);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));
    return g;
  }, [positions, sizes, opacities]);

  // Star sprite: tight bright core + tiny halo + faint cross diffraction spikes
  const sprite = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    // Soft halo
    const halo = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    halo.addColorStop(0, "rgba(255,255,255,0.9)");
    halo.addColorStop(0.18, "rgba(255,255,255,0.35)");
    halo.addColorStop(0.5, "rgba(255,255,255,0.06)");
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, 64, 64);
    // Tight bright core
    const core = ctx.createRadialGradient(32, 32, 0, 32, 32, 6);
    core.addColorStop(0, "rgba(255,255,255,1)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, 64, 64);
    // Diffraction spikes (subtle)
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 6); ctx.lineTo(32, 58);
    ctx.moveTo(6, 32); ctx.lineTo(58, 32);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame((_, dt) => {
    tRef.current += dt;
    const t = tRef.current;
    const curve = curveRef.current?.curve;
    if (!curve) return;

    const tmp = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const p = params[i];
      // Drift along the curve and wrap
      const u = (p.base + t * driftSpeed + p.phase * 0.05) % 1;
      curve.getPointAt(u < 0 ? u + 1 : u, tmp);
      positions[i * 3] = tmp.x;
      positions[i * 3 + 1] = tmp.y;
      positions[i * 3 + 2] = tmp.z;

      // Twinkle: rectified sine, smoothed
      const tw = 0.5 + 0.5 * Math.sin(t * p.twinkleHz + p.phase);
      opacities[i] = 0.25 + tw * 0.75;
      sizes[i] = size * p.sizeJitter * (0.7 + tw * 0.6);
    }

    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const sizeAttr = geometry.getAttribute("aSize") as THREE.BufferAttribute;
    const opAttr = geometry.getAttribute("aOpacity") as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    opAttr.needsUpdate = true;
  });

  // Use a ShaderMaterial so each particle has its own size + opacity
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uTexture: { value: sprite },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aOpacity;
        varying float vOpacity;
        uniform float uPixelRatio;
        void main() {
          vOpacity = aOpacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * 320.0 * uPixelRatio / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform sampler2D uTexture;
        varying float vOpacity;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(uColor, tex.a * vOpacity);
        }
      `,
    });
  }, [color, sprite]);

  return <points ref={pointsRef} geometry={geometry} material={material} />;
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
          <RibbonScene ribbons={ribbons} />
        </Canvas>
      </Suspense>
    </div>
  );
}

/** Scene wrapper — holds refs to each ribbon's curve so FairyLights can ride them. */
function RibbonScene({ ribbons }: { ribbons: RibbonProps[] }) {
  const refs = useRef<Array<React.RefObject<CurveHandle>>>(
    ribbons.map(() => ({ current: null } as React.RefObject<CurveHandle>))
  );
  if (refs.current.length !== ribbons.length) {
    refs.current = ribbons.map(
      () => ({ current: null } as React.RefObject<CurveHandle>)
    );
  }

  return (
    <>
      {ribbons.map((r, i) => (
        <Ribbon key={i} ref={refs.current[i]} {...r} />
      ))}
      {ribbons.map((r, i) => (
        <FairyLights
          key={`f-${i}`}
          curveRef={refs.current[i]}
          color={r.color}
          count={Math.round(22 + r.amplitude * 18)}
          driftSpeed={0.04 + r.speed * 0.3}
          size={Math.max(0.07, r.thickness * 3.2)}
        />
      ))}
    </>
  );
}
