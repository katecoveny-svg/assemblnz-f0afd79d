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
  CubicBezierCurve3,
  CurvePath,
  LineCurve3,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
  type Object3D,
} from 'three';

/** Spatial C field — deep plum, not cool violet. */
const FIELD = '#241018';
const FOG = '#2a1620';
const ROSE = '#d7abc8';
const ROSE_WARM = '#e8b4a8';
const ROSE_DUST = '#916A70';
const PLUM_BODY = '#2a0f22';

/**
 * Hold framing on Find / DO / Show, then ease between rooms.
 * Scroll thirds map to the three chapter anchors.
 */
function chapterPath(t: number) {
  const x = MathUtils.clamp(t, 0, 1);
  if (x < 1 / 3) {
    const u = x * 3;
    return MathUtils.smootherstep(u, 0, 1) * 0.28;
  }
  if (x < 2 / 3) {
    const u = (x - 1 / 3) * 3;
    return 0.28 + MathUtils.smootherstep(u, 0, 1) * 0.36;
  }
  const u = (x - 2 / 3) * 3;
  return 0.64 + MathUtils.smootherstep(u, 0, 1) * 0.36;
}

function Identity() {
  const { size } = useThree();
  const compact = size.width < 600;
  // Shared DoMark contour, lifted into a physical object (not a billboard).
  const outline = useMemo(() => {
    const point = (x: number, y: number) => new Vector3((x - 32) / 32, (32 - y) / 32, 0);
    const curve = new CurvePath<Vector3>();
    curve.add(new LineCurve3(point(16, 12), point(29, 12)));
    curve.add(new CubicBezierCurve3(point(29, 12), point(44, 12), point(52, 20), point(52, 32)));
    curve.add(new CubicBezierCurve3(point(52, 32), point(52, 44), point(44, 52), point(29, 52)));
    curve.add(new LineCurve3(point(29, 52), point(16, 52)));
    curve.add(new LineCurve3(point(16, 52), point(16, 12)));
    return curve;
  }, []);

  return (
    <group
      position={[compact ? 4.35 : 3.55, compact ? 4.05 : 2.72, -15]}
      scale={compact ? 0.82 : 1.08}
      rotation={[0.04, -0.28, 0]}
    >
      <RoundedBox args={[2.15, 2.15, 0.58]} radius={0.44} smoothness={6} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={PLUM_BODY}
          metalness={0.42}
          roughness={0.22}
          clearcoat={1}
          clearcoatRoughness={0.12}
          reflectivity={0.55}
          envMapIntensity={0.85}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.36]} castShadow>
        <tubeGeometry args={[outline, 120, 7.2 / 64, 12, true]} />
        <meshStandardMaterial
          color={ROSE}
          emissive={ROSE}
          emissiveIntensity={0.85}
          roughness={0.28}
          metalness={0.35}
        />
      </mesh>
      <mesh position={[-2 / 32, 0, 0.37]}>
        <sphereGeometry args={[6.2 / 32, 28, 18]} />
        <meshStandardMaterial
          color={ROSE}
          emissive={ROSE}
          emissiveIntensity={1.05}
          roughness={0.22}
          metalness={0.2}
        />
      </mesh>
      {/* Soft rose presence — sculptural glow, not UI chrome. */}
      <pointLight position={[0.15, 0.1, 1.1]} color={ROSE} intensity={4.2} distance={4.5} decay={2} />
      <pointLight position={[-0.8, 0.4, 0.6]} color={ROSE_WARM} intensity={1.8} distance={3.5} decay={2} />
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
        // Keep authored albedo; warm cove emissives toward rose, not violet.
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

  useEffect(() => {
    onReady(true);
  }, [onReady, model]);

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
}: {
  progress: RefObject<number>;
  paused: boolean;
}) {
  const current = useRef(0);
  const look = useRef(new Vector3());
  const { size, camera, invalidate } = useThree();
  const compact = size.width < 600;

  // Eye-level walkthrough (~1.7–1.9 m). Slight lateral weave; rooms at z≈0 / -15 / -28.
  const path = useMemo(
    () =>
      new CatmullRomCurve3(
        compact
          ? [
              new Vector3(2.6, 1.82, 10.5),
              new Vector3(-1.1, 1.78, 3.2),
              new Vector3(-0.35, 1.76, -1.2),
              new Vector3(-1.4, 1.78, -8.5),
              new Vector3(0.15, 1.74, -13.2),
              new Vector3(-0.4, 1.76, -20.5),
              new Vector3(1.1, 1.72, -25.2),
              new Vector3(1.85, 1.7, -27.8),
            ]
          : [
              new Vector3(3.6, 1.88, 11.2),
              new Vector3(-2.2, 1.82, 4.0),
              new Vector3(-0.8, 1.78, -1.4),
              new Vector3(-2.4, 1.8, -8.2),
              new Vector3(0.35, 1.76, -13.0),
              new Vector3(-0.9, 1.78, -20.0),
              new Vector3(1.4, 1.72, -25.0),
              new Vector3(2.2, 1.7, -28.0),
            ],
        false,
        'catmullrom',
        0.18,
      ),
    [compact],
  );

  const gaze = useMemo(
    () =>
      new CatmullRomCurve3(
        compact
          ? [
              new Vector3(-3.5, 1.7, -2),
              new Vector3(2.4, 1.55, -4),
              new Vector3(3.2, 2.5, -15),
              new Vector3(3.6, 2.8, -15.2),
              new Vector3(3.0, 1.7, -24),
              new Vector3(3.1, 1.55, -30),
            ]
          : [
              new Vector3(-5.2, 1.75, -3),
              new Vector3(2.8, 1.55, -5.5),
              new Vector3(3.4, 2.35, -14.5),
              new Vector3(3.7, 2.55, -15.2),
              new Vector3(3.1, 1.65, -26),
              new Vector3(3.2, 1.5, -31.5),
            ],
        false,
        'catmullrom',
        0.22,
      ),
    [compact],
  );

  const target = useMemo(() => new Vector3(), []);

  useEffect(() => {
    const redraw = () => {
      if (!paused) invalidate();
    };
    addEventListener('scroll', redraw, { passive: true });
    invalidate();
    return () => removeEventListener('scroll', redraw);
  }, [paused, invalidate]);

  useFrame((_, delta) => {
    const desired = chapterPath(progress.current);
    if (!paused) {
      // Heavier lag = cinematic glide, not snap-to-scroll.
      const blend = 1 - Math.exp(-Math.min(delta, 0.05) * 2.35);
      current.current += (desired - current.current) * blend;
    }
    const t = current.current;
    path.getPoint(t, camera.position);
    gaze.getPoint(t, target);
    // Soft look-ahead so the gaze settles a beat after the body.
    look.current.lerp(target, paused ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 3.2));
    camera.lookAt(look.current);
    if (!paused && Math.abs(desired - current.current) > 0.00008) invalidate();
  });

  return null;
}

export default function WorldScene(props: {
  progress: RefObject<number>;
  paused: boolean;
  onReady?: (ready: boolean) => void;
}) {
  const [ready, setReady] = useState(false);
  const markReady = (value: boolean) => {
    setReady(value);
    props.onReady?.(value);
  };

  return (
    <Canvas
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 700ms ease' }}
      shadows
      frameloop="demand"
      camera={{ position: [3.6, 1.88, 11.2], fov: 48, near: 0.1, far: 180 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
        outputColorSpace: SRGBColorSpace,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.outputColorSpace = SRGBColorSpace;
      }}
    >
      <color attach="background" args={[FIELD]} />
      <fog attach="fog" args={[FOG, 28, 95]} />
      <Room onReady={markReady} />
      <Journey progress={props.progress} paused={props.paused} />
    </Canvas>
  );
}

useGLTF.preload('/do/world/atelier.glb', '/do/office/draco/');
