'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { RoundedBox } from '@react-three/drei/core/RoundedBox';
import { useGLTF } from '@react-three/drei/core/Gltf';
import { Environment } from '@react-three/drei/core/Environment';
import { Lightformer } from '@react-three/drei/core/Lightformer';
import {
  ACESFilmicToneMapping,
  BackSide,
  CatmullRomCurve3,
  Color,
  ExtrudeGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Shape,
  SRGBColorSpace,
  Vector3,
  type Object3D,
} from 'three';

/** Brand field — deep plum / chalk / dusty rose. No purple D. */
const FIELD = '#240B21';
const FOG = '#2a1620';
/** Dusty rose — Identity glow + Spatial C accent (not cool violet). */
const ROSE = '#916A70';
const ROSE_WARM = '#c4a098';
const ROSE_DUST = '#916A70';
const PLUM_BODY = '#240B21';
const CHALK = '#F5F1F2';

/**
 * Map scroll progress to path parameter with chapter holds.
 * Hash landing on a chapter (≈0, ⅓, ⅔) should open on that room’s frame —
 * especially DO on the D sculpture — not on the previous transition.
 */
function chapterPath(t: number) {
  const frames = [0.16, 0.52, 0.88] as const;
  const x = MathUtils.clamp(t, 0, 1) * 2.999;
  const i = Math.min(2, Math.floor(x));
  const f = x - Math.floor(x);
  if (i >= 2) return frames[2];
  const from = frames[i];
  const to = frames[i + 1];
  const hold = 0.62;
  if (f < hold) return from;
  return from + MathUtils.smootherstep((f - hold) / (1 - hold), 0, 1) * (to - from);
}

function Identity() {
  const { size } = useThree();
  const compact = size.width < 600;
  // Shared DoMark contour as a solid extruded plaque (reliable vs tube CurvePath).
  const geometry = useMemo(() => {
    const shape = new Shape();
    // DoMark path in a 64×64 viewBox, centered and scaled to ~1 unit.
    const p = (x: number, y: number) => [(x - 32) / 28, (32 - y) / 28] as [number, number];
    const [x0, y0] = p(16, 12);
    shape.moveTo(x0, y0);
    shape.lineTo(...p(29, 12));
    shape.bezierCurveTo(...p(44, 12), ...p(52, 20), ...p(52, 32));
    shape.bezierCurveTo(...p(52, 44), ...p(44, 52), ...p(29, 52));
    shape.lineTo(...p(16, 52));
    shape.closePath();
    // Inner hole so the D reads as a contour, not a filled slab.
    const hole = new Shape();
    const h = (x: number, y: number) => [(x - 32) / 28, (32 - y) / 28] as [number, number];
    hole.moveTo(...h(22, 20));
    hole.lineTo(...h(29, 20));
    hole.bezierCurveTo(...h(38, 20), ...h(42, 24), ...h(42, 32));
    hole.bezierCurveTo(...h(42, 40), ...h(38, 44), ...h(29, 44));
    hole.lineTo(...h(22, 44));
    hole.closePath();
    shape.holes.push(hole);
    const geom = new ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.035,
      bevelSegments: 3,
      curveSegments: 24,
    });
    geom.center();
    return geom;
  }, []);

  return (
    <group
      // Hang above the workshop table, centered in the DO chapter frame.
      position={[compact ? 2.15 : 2.05, compact ? 3.35 : 2.55, compact ? -13.6 : -13.35]}
      scale={compact ? 1.15 : 1.45}
      rotation={[0.06, -0.38, 0]}
    >
      <RoundedBox args={[2.35, 2.35, 0.42]} radius={0.48} smoothness={6} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={PLUM_BODY}
          metalness={0.38}
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.14}
          reflectivity={0.5}
          envMapIntensity={0.9}
        />
      </RoundedBox>
      <mesh geometry={geometry} position={[0, 0, 0.28]} castShadow>
        <meshStandardMaterial
          color={CHALK}
          emissive={ROSE}
          emissiveIntensity={0.95}
          roughness={0.32}
          metalness={0.28}
        />
      </mesh>
      <mesh position={[0.02, 0, 0.42]}>
        <sphereGeometry args={[0.13, 28, 18]} />
        <meshStandardMaterial
          color={ROSE}
          emissive={ROSE}
          emissiveIntensity={1.25}
          roughness={0.28}
          metalness={0.2}
        />
      </mesh>
      {/* Soft dusty-rose presence — sculptural glow, not purple UI chrome. */}
      <pointLight position={[0.15, 0.1, 1.2]} color={ROSE} intensity={5.5} distance={6} decay={2} />
      <pointLight position={[-0.9, 0.5, 0.7]} color={ROSE_WARM} intensity={2.2} distance={4.5} decay={2} />
      <spotLight
        position={[0.5, 1.4, 2.4]}
        angle={0.5}
        penumbra={0.7}
        intensity={18}
        color={ROSE}
        distance={9}
        decay={2}
        castShadow={false}
      />
    </group>
  );
}

function Architecture({ onReady }: { onReady: (ready: boolean) => void }) {
  const { scene } = useGLTF('/do/world/atelier.glb', '/do/office/draco/');
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object: Object3D) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const material = object.material;
      if (material instanceof MeshStandardMaterial) {
        // Keep authored albedo; warm cove emissives toward dusty rose, not violet.
        if (material.emissiveIntensity > 0.01) {
          material.emissive = new Color(ROSE_WARM);
          material.emissiveIntensity = Math.min(material.emissiveIntensity * 1.15, 6);
        }
        material.envMapIntensity = 0.9;
        material.needsUpdate = true;
      }
    });
    return clone;
  }, [scene]);

  const { invalidate } = useThree();
  useEffect(() => {
    onReady(true);
    // Demand frameloop: paint once the atelier + Identity commit together.
    invalidate();
    const id = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(id);
  }, [onReady, model, invalidate]);

  return <primitive object={model} />;
}

function Dusk() {
  // Harbour dusk: warm rose low horizon into deep plum — Spatial C, no purple leak.
  return (
    <mesh>
      <sphereGeometry args={[130, 32, 20]} />
      <shaderMaterial
        side={BackSide}
        vertexShader={`varying vec3 direction; void main(){direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
        fragmentShader={`varying vec3 direction; void main(){
          float h=normalize(direction).y;
          vec3 low=vec3(0.42,0.24,0.28);
          vec3 mid=vec3(0.22,0.12,0.16);
          vec3 high=vec3(0.10,0.05,0.09);
          vec3 sky=mix(low,mid,smoothstep(-0.12,0.18,h));
          sky=mix(sky,high,smoothstep(0.12,0.72,h));
          sky+=vec3(0.18,0.09,0.06)*exp(-pow((h-0.02)*11.0,2.0));
          gl_FragColor=vec4(sky,1.0);
        }`}
      />
    </mesh>
  );
}

function Room({ onReady }: { onReady: (ready: boolean) => void }) {
  return (
    <>
      <Dusk />
      <Suspense fallback={null}>
        <Architecture onReady={onReady} />
        <Identity />
      </Suspense>
      <Environment resolution={256} frames={1} environmentIntensity={0.48}>
        <Lightformer
          position={[-10, 5, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[30, 8, 1]}
          color={ROSE}
          intensity={1.7}
        />
        <Lightformer
          position={[0, 9, -8]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 48, 1]}
          color="#ffd4c4"
          intensity={1.9}
        />
        <Lightformer
          position={[8, 3, -14]}
          rotation={[0, -Math.PI / 2.4, 0]}
          scale={[18, 6, 1]}
          color={ROSE_DUST}
          intensity={0.9}
        />
      </Environment>
      <hemisphereLight args={['#e8c8d0', '#1a0e14', 0.95]} />
      <directionalLight
        position={[-11, 7.5, 1.5]}
        intensity={2.15}
        color="#e4b4a8"
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.00015}
        shadow-normalBias={0.035}
      />
      {/* Soft cove washes along the walk — Find / DO / Show. */}
      {[
        [2.8, 4.6, 0.2, 48],
        [3.2, 4.7, -14.5, 58],
        [3.0, 4.5, -27.5, 52],
      ].map(([x, y, z, intensity]) => (
        <pointLight
          key={z}
          position={[x, y, z]}
          intensity={intensity}
          color="#ffd0bc"
          distance={15}
          decay={2}
        />
      ))}
      <spotLight
        position={[-6.5, 4.2, -15]}
        angle={0.55}
        penumbra={0.7}
        intensity={28}
        color={ROSE}
        distance={22}
        decay={2}
      />
    </>
  );
}

function Journey({
  progress,
  paused,
  reduced,
}: {
  progress: RefObject<number>;
  paused: boolean;
  reduced: boolean;
}) {
  const current = useRef(0);
  const look = useRef(new Vector3());
  const { size, camera, invalidate } = useThree();
  const compact = size.width < 600;

  // Eye-level walkthrough (~1.7–1.9 m). DO dwell frames the D sculpture at z≈-15.
  const path = useMemo(
    () =>
      new CatmullRomCurve3(
        compact
          ? [
              new Vector3(2.4, 1.82, 10.2),
              new Vector3(-1.0, 1.78, 3.0),
              new Vector3(-0.2, 1.76, -1.0),
              new Vector3(-1.2, 1.78, -7.5),
              new Vector3(0.55, 1.76, -12.4),
              new Vector3(0.9, 1.78, -14.2),
              new Vector3(0.2, 1.74, -21.0),
              new Vector3(1.6, 1.7, -27.4),
            ]
          : [
              new Vector3(3.4, 1.88, 11.0),
              new Vector3(-2.0, 1.82, 3.8),
              new Vector3(-0.6, 1.78, -1.2),
              new Vector3(-2.0, 1.8, -7.6),
              new Vector3(0.6, 1.78, -12.2),
              new Vector3(1.1, 1.8, -14.0),
              new Vector3(-0.4, 1.76, -21.0),
              new Vector3(2.0, 1.7, -27.6),
            ],
        false,
        'catmullrom',
        0.16,
      ),
    [compact],
  );

  const gaze = useMemo(
    () =>
      new CatmullRomCurve3(
        compact
          ? [
              new Vector3(-3.2, 1.7, -2),
              new Vector3(2.2, 1.55, -3.5),
              new Vector3(2.2, 2.55, -13.2),
              new Vector3(2.15, 2.7, -13.5),
              new Vector3(3.0, 1.7, -24),
              new Vector3(3.1, 1.55, -30),
            ]
          : [
              new Vector3(-5.0, 1.75, -3),
              new Vector3(2.6, 1.55, -5),
              new Vector3(2.15, 2.45, -13.0),
              new Vector3(2.1, 2.6, -13.35),
              new Vector3(3.1, 1.65, -26),
              new Vector3(3.2, 1.5, -31.5),
            ],
        false,
        'catmullrom',
        0.2,
      ),
    [compact],
  );

  const target = useMemo(() => new Vector3(), []);

  useEffect(() => {
    // Reduced-motion still needs scroll redraws so chapter frames snap.
    const redraw = () => {
      if (!paused || reduced) invalidate();
    };
    addEventListener('scroll', redraw, { passive: true });
    invalidate();
    return () => removeEventListener('scroll', redraw);
  }, [paused, reduced, invalidate]);

  useFrame((_, delta) => {
    const desired = chapterPath(progress.current);
    if (paused && !reduced) {
      // User pause: freeze the current frame.
    } else if (reduced) {
      // Reduced motion: snap to the chapter frame, no glide.
      current.current = desired;
    } else {
      // Heavier lag = cinematic glide, not snap-to-scroll.
      const blend = 1 - Math.exp(-Math.min(delta, 0.05) * 2.35);
      current.current += (desired - current.current) * blend;
    }
    const t = current.current;
    path.getPoint(t, camera.position);
    gaze.getPoint(t, target);
    look.current.lerp(
      target,
      paused && !reduced ? 1 : reduced ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 3.2),
    );
    camera.lookAt(look.current);
    if ((!paused || reduced) && Math.abs(desired - current.current) > 0.00008) invalidate();
  });

  return null;
}

export default function WorldScene(props: {
  progress: RefObject<number>;
  paused: boolean;
  reduced?: boolean;
  onReady?: (ready: boolean) => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void useGLTF.preload('/do/world/atelier.glb', '/do/office/draco/');
  }, []);
  const markReady = (value: boolean) => {
    setReady(value);
    props.onReady?.(value);
  };

  return (
    <Canvas
      style={{ opacity: ready ? 1 : 0.001, transition: 'opacity 700ms ease' }}
      shadows
      frameloop="demand"
      camera={{ position: [3.4, 1.88, 11.0], fov: 48, near: 0.1, far: 180 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
        outputColorSpace: SRGBColorSpace,
      }}
      onCreated={({ gl, invalidate }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.outputColorSpace = SRGBColorSpace;
        // Ensure the canvas element exists and demand-mode paints after mount.
        invalidate();
      }}
    >
      <color attach="background" args={[FIELD]} />
      <fog attach="fog" args={[FOG, 28, 95]} />
      <Room onReady={markReady} />
      <Journey
        progress={props.progress}
        paused={props.paused}
        reduced={Boolean(props.reduced)}
      />
    </Canvas>
  );
}
