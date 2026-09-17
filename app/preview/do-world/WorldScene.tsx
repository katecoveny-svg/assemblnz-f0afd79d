'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
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
/** Harbour dusk fog — clear enough for Waitematā massing; deep plum field. */
const FOG = '#1f1018';
/** Dusty rose — Identity glow + Spatial C accent (not cool violet). */
const ROSE = '#916A70';
const ROSE_WARM = '#c4a098';
const ROSE_DUST = '#916A70';
const PLUM_BODY = '#240B21';
const CHALK = '#F5F1F2';
/** Warm CBD window / harbour bounce — mulberry-adjacent, not grape chrome. */
const HARBOUR_GLOW = '#e8a878';

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
        const name = (material.name || object.name || '').toLowerCase();
        // Waitematā water — cooler metallic sheen so harbour reads vs plum fog.
        if (
          name.includes('waitemata') ||
          name.includes('dusk water') ||
          (name.includes('harbour') && name.includes('water'))
        ) {
          material.metalness = Math.max(material.metalness, 0.58);
          material.roughness = Math.min(material.roughness, 0.12);
          material.envMapIntensity = 1.45;
        }
        // Thin glazing — reflective, not opaque purple wash.
        if (name.includes('glazing') || name.includes('glass')) {
          material.transparent = true;
          material.opacity = 0.18;
          material.metalness = 0.2;
          material.roughness = 0.05;
          material.envMapIntensity = 1.8;
          material.depthWrite = false;
        }
        // CBD / volcanic / bridge silhouettes — contrast for ACES + fog.
        if (
          name.includes('auckland') ||
          name.includes('volcanic') ||
          name.includes('bridge') ||
          name.includes('city') ||
          name.includes('silhouette') ||
          name.includes('ferry')
        ) {
          material.envMapIntensity = 0.5;
          material.roughness = Math.min(Math.max(material.roughness, 0.85), 0.96);
        }
        // Keep authored albedo; warm cove + city emissives toward dusty rose / harbour gold.
        if (material.emissiveIntensity > 0.01) {
          const cityLight =
            name.includes('harbour city') ||
            name.includes('city light') ||
            name.includes('tower window') ||
            name.includes('ferry cabin') ||
            name.includes('beacon');
          material.emissive = new Color(cityLight ? HARBOUR_GLOW : ROSE_WARM);
          material.emissiveIntensity = Math.min(
            material.emissiveIntensity * (cityLight ? 1.5 : 1.15),
            cityLight ? 11 : 5.5,
          );
        }
        // Soften walnut / limestone / fabric for craft parity with ACES.
        if (name.includes('walnut') || name.includes('limestone')) {
          material.roughness = Math.min(material.roughness, name.includes('walnut') ? 0.34 : 0.38);
          material.envMapIntensity = 1.1;
        } else if (name.includes('linen') || name.includes('wool') || name.includes('felt')) {
          material.roughness = Math.max(material.roughness, 0.82);
          material.envMapIntensity = 0.7;
        } else if (
          !name.includes('waitemata') &&
          !name.includes('glazing') &&
          !name.includes('glass') &&
          !name.includes('water') &&
          !name.includes('auckland') &&
          !name.includes('volcanic') &&
          !name.includes('city') &&
          !name.includes('silhouette')
        ) {
          material.envMapIntensity = Math.max(material.envMapIntensity || 0, 0.95);
        }
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
  // Waitematā harbour dusk: warm rose-gold low horizon into deep plum — Spatial C, no grape wash.
  return (
    <mesh>
      <sphereGeometry args={[140, 48, 28]} />
      <shaderMaterial
        side={BackSide}
        vertexShader={`varying vec3 direction; void main(){direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
        fragmentShader={`varying vec3 direction; void main(){
          vec3 d=normalize(direction);
          float h=d.y;
          // Auckland-facing harbour glow sits on the −X window elevation.
          float harbour=exp(-pow((d.x+0.55)*2.4,2.0))*exp(-pow(h*6.0,2.0));
          vec3 low=vec3(0.38,0.22,0.26);
          vec3 mid=vec3(0.18,0.10,0.14);
          vec3 high=vec3(0.08,0.04,0.07);
          vec3 sky=mix(low,mid,smoothstep(-0.14,0.16,h));
          sky=mix(sky,high,smoothstep(0.10,0.68,h));
          // Horizon band — dusty rose into harbour gold.
          sky+=vec3(0.22,0.11,0.08)*exp(-pow((h-0.015)*10.0,2.0));
          sky+=vec3(0.28,0.14,0.08)*harbour*0.55;
          // Soft city light scatter above the waterline.
          sky+=vec3(0.16,0.08,0.06)*exp(-pow((h+0.04)*18.0,2.0))*0.35;
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
      <Environment resolution={256} frames={1} environmentIntensity={0.55}>
        {/* Waitematā window elevation — harbour bounce into the room. */}
        <Lightformer
          position={[-12, 4, -8]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[42, 10, 1]}
          color={HARBOUR_GLOW}
          intensity={2.4}
        />
        <Lightformer
          position={[-10, 5, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[30, 8, 1]}
          color={ROSE}
          intensity={1.5}
        />
        <Lightformer
          position={[0, 9, -8]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 48, 1]}
          color="#ffd4c4"
          intensity={1.85}
        />
        <Lightformer
          position={[8, 3, -14]}
          rotation={[0, -Math.PI / 2.4, 0]}
          scale={[18, 6, 1]}
          color={ROSE_DUST}
          intensity={0.85}
        />
      </Environment>
      <hemisphereLight args={['#e8c8d0', '#1a0e14', 0.9]} />
      {/* Late harbour sun — warm mulberry, raking through the glazing. */}
      <directionalLight
        position={[-14, 6.5, -2]}
        intensity={2.55}
        color="#f0b898"
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-bias={-0.00015}
        shadow-normalBias={0.035}
      />
      {/* Soft cove washes along the walk — Find / DO / Show. */}
      {[
        [2.8, 4.6, 0.2, 44],
        [3.2, 4.7, -14.5, 54],
        [3.0, 4.5, -27.5, 48],
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
      {/* Exterior city scatter visible through the open glazing. */}
      {[
        [-16, 3.2, 2],
        [-18, 4.0, -10],
        [-17, 3.5, -22],
      ].map(([x, y, z]) => (
        <pointLight
          key={`harbour-${z}`}
          position={[x, y, z]}
          intensity={36}
          color={HARBOUR_GLOW}
          distance={28}
          decay={2}
        />
      ))}
      <spotLight
        position={[-6.5, 4.2, -15]}
        angle={0.55}
        penumbra={0.7}
        intensity={26}
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

  // Eye-level walkthrough (~1.72–1.88 m). DO dwell frames the D sculpture at z≈-15.
  // Mobile path stays closer to centreline and slightly lower for 375 framing.
  const path = useMemo(
    () =>
      new CatmullRomCurve3(
        compact
          ? [
              new Vector3(2.1, 1.74, 9.6),
              new Vector3(-0.6, 1.72, 2.6),
              new Vector3(0.1, 1.7, -1.2),
              new Vector3(-0.8, 1.72, -7.2),
              new Vector3(0.7, 1.7, -12.2),
              new Vector3(1.0, 1.72, -14.0),
              new Vector3(0.35, 1.68, -20.6),
              new Vector3(1.4, 1.66, -27.0),
            ]
          : [
              new Vector3(3.2, 1.86, 10.6),
              new Vector3(-1.6, 1.82, 3.4),
              new Vector3(-0.4, 1.78, -1.0),
              new Vector3(-1.7, 1.8, -7.4),
              new Vector3(0.7, 1.78, -12.0),
              new Vector3(1.15, 1.8, -13.9),
              new Vector3(-0.2, 1.76, -20.8),
              new Vector3(1.9, 1.7, -27.4),
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
              // Find: harbour glazing, then DO sculpture, then salon.
              new Vector3(-6.0, 1.55, -1.2),
              new Vector3(-3.2, 1.48, -4.2),
              new Vector3(2.15, 2.5, -13.15),
              new Vector3(2.1, 2.65, -13.45),
              new Vector3(2.9, 1.6, -24),
              new Vector3(3.0, 1.5, -29.5),
            ]
          : [
              new Vector3(-8.0, 1.65, -1.8),
              new Vector3(-4.5, 1.5, -5.5),
              new Vector3(2.12, 2.42, -12.95),
              new Vector3(2.08, 2.58, -13.3),
              new Vector3(3.05, 1.62, -25.5),
              new Vector3(3.15, 1.48, -31.2),
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

function ContextHealth({ onLost }: { onLost: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onLost(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onLost]);
  return null;
}

export default function WorldScene(props: {
  progress: RefObject<number>;
  paused: boolean;
  reduced?: boolean;
  onReady?: (ready: boolean) => void;
  onFailure?: () => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void useGLTF.preload('/do/world/atelier.glb', '/do/office/draco/');
  }, []);
  const onReady = props.onReady;
  const onFailure = props.onFailure;
  const markReady = useCallback((value: boolean) => {
    setReady(value);
    onReady?.(value);
  }, [onReady]);
  const lost = useCallback(() => {
    markReady(false);
    onFailure?.();
  }, [markReady, onFailure]);

  return (
    <Canvas
      style={{ opacity: ready ? 1 : 0.001, transition: 'opacity 700ms ease' }}
      shadows
      frameloop="demand"
      camera={{ position: [3.2, 1.86, 10.6], fov: 46, near: 0.1, far: 180 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.02,
        outputColorSpace: SRGBColorSpace,
      }}
      onCreated={({ gl, invalidate }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.02;
        gl.outputColorSpace = SRGBColorSpace;
        // Ensure the canvas element exists and demand-mode paints after mount.
        invalidate();
      }}
    >
      <color attach="background" args={[FIELD]} />
      {/* Longer fog falloff so Waitematā massing remains legible past the glazing. */}
      <fog attach="fog" args={[FOG, 36, 110]} />
      <ContextHealth onLost={lost} />
      <Room onReady={markReady} />
      <Journey
        progress={props.progress}
        paused={props.paused}
        reduced={Boolean(props.reduced)}
      />
    </Canvas>
  );
}
