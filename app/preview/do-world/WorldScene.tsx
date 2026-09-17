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

/**
 * Daylight / white-space grade (Kate 2026-09-17).
 * Paper + chalk field first. Deep plum + dusty rose are furniture/art accents only —
 * never a global fog, background, or room-filling lightformer wash.
 */
const FIELD = '#FFFDFB';
/** Soft paper harbour air — neutral, not plum / lavender haze. */
const FOG = '#F2F0EF';
/** Dusty rose — Identity glow + seating accents only (not cool violet). */
const ROSE = '#916A70';
const ROSE_WARM = '#c4a098';
const PLUM_BODY = '#240B21';
const CHALK = '#F5F1F2';
const PAPER = '#FFFDFB';
/** Soft natural key through the glazing — warm daylight, not rose-opal flood. */
const DAYLIGHT = '#FFF8EE';
const HARBOUR_SKY = '#D0DCE8';
const HARBOUR_HORIZON = '#EDE6DC';
/** Daytime CBD bounce — muted warm, not night neon. */
const HARBOUR_BOUNCE = '#E8C9A8';

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
          emissiveIntensity={0.85}
          roughness={0.32}
          metalness={0.28}
        />
      </mesh>
      <mesh position={[0.02, 0, 0.42]}>
        <sphereGeometry args={[0.13, 28, 18]} />
        <meshStandardMaterial
          color={ROSE}
          emissive={ROSE}
          emissiveIntensity={1.1}
          roughness={0.28}
          metalness={0.2}
        />
      </mesh>
      {/* Rose glow stays LOCAL to the Identity D — never a room wash. */}
      <pointLight position={[0.15, 0.1, 1.2]} color={ROSE} intensity={3.2} distance={4.2} decay={2} />
      <pointLight position={[-0.9, 0.5, 0.7]} color={ROSE_WARM} intensity={1.4} distance={3.2} decay={2} />
      <spotLight
        position={[0.5, 1.4, 2.4]}
        angle={0.42}
        penumbra={0.75}
        intensity={10}
        color={ROSE}
        distance={6.5}
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
        // Walls / ceiling — paper-chalk white space (kill baked plum plaster map).
        if (name.includes('plaster') || name.includes('plum plaster')) {
          if (material.map) {
            material.map = null;
          }
          material.color = new Color(CHALK);
          material.roughness = 0.86;
          material.envMapIntensity = 0.55;
          material.emissiveIntensity = 0;
        }
        // Floors — chalk limestone, not rose-tinted slab wash.
        else if (name.includes('limestone') || name.includes('rose limestone')) {
          if (material.map) {
            material.map = null;
          }
          material.color = new Color('#EFEAEA');
          material.roughness = 0.42;
          material.envMapIntensity = 0.85;
          material.emissiveIntensity = 0;
        }
        // Cove strips — warm daylight paper, not rose-opal flood.
        else if (name.includes('opal') || name.includes('rose light') || name.includes('daylight cove')) {
          if (material.map) {
            material.map = null;
          }
          material.color = new Color(PAPER);
          material.emissive = new Color(DAYLIGHT);
          material.emissiveIntensity = Math.min(Math.max(material.emissiveIntensity || 1, 0.8), 1.6);
          material.roughness = 0.35;
          material.envMapIntensity = 0.4;
        }
        // Waitematā water — cooler daylight sheen so harbour reads vs white interior.
        else if (
          name.includes('waitemata') ||
          name.includes('dusk water') ||
          name.includes('daylight water') ||
          (name.includes('harbour') && name.includes('water'))
        ) {
          if (material.map) {
            material.map = null;
          }
          material.color = new Color('#4A6574');
          material.metalness = Math.max(material.metalness, 0.52);
          material.roughness = Math.min(material.roughness, 0.18);
          material.envMapIntensity = 1.35;
          material.emissiveIntensity = 0;
        }
        // Thin glazing — reflective, not opaque purple wash.
        else if (name.includes('glazing') || name.includes('glass')) {
          material.transparent = true;
          material.opacity = 0.14;
          material.metalness = 0.18;
          material.roughness = 0.05;
          material.envMapIntensity = 1.6;
          material.depthWrite = false;
        }
        // CBD / volcanic / bridge silhouettes — daylight contrast (no night neon remap).
        else if (
          name.includes('auckland') ||
          name.includes('volcanic') ||
          name.includes('bridge') ||
          name.includes('city') ||
          name.includes('silhouette') ||
          name.includes('ferry')
        ) {
          const cityLight =
            name.includes('harbour city') ||
            name.includes('city light') ||
            name.includes('tower window') ||
            name.includes('ferry cabin') ||
            name.includes('beacon');
          if (cityLight) {
            // Soft daytime window bounce — readable, not dusk flood.
            material.emissive = new Color(HARBOUR_BOUNCE);
            material.emissiveIntensity = Math.min(material.emissiveIntensity * 0.22, 1.8);
            material.color = new Color('#D8C4A8');
          } else {
            material.color = new Color('#3A4550');
            material.envMapIntensity = 0.45;
            material.roughness = Math.min(Math.max(material.roughness, 0.85), 0.96);
            material.emissiveIntensity = 0;
          }
        }
        // Soften walnut / fabric; keep authored rose wool + plum felt as intentional accents.
        else if (name.includes('walnut')) {
          material.roughness = Math.min(material.roughness, 0.34);
          material.envMapIntensity = 1.0;
        } else if (name.includes('linen') || name.includes('wool') || name.includes('felt')) {
          material.roughness = Math.max(material.roughness, 0.82);
          material.envMapIntensity = 0.65;
          // Do not remap rose/plum furniture albedos — accents stay intentional.
        } else if (material.emissiveIntensity > 0.01) {
          // Any leftover cove/lamp emissives → warm paper, not rose flood.
          material.emissive = new Color(DAYLIGHT);
          material.emissiveIntensity = Math.min(material.emissiveIntensity * 0.35, 2.2);
        } else if (
          !name.includes('waitemata') &&
          !name.includes('glazing') &&
          !name.includes('glass') &&
          !name.includes('water')
        ) {
          material.envMapIntensity = Math.max(material.envMapIntensity || 0, 0.85);
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

function Daylight() {
  // Waitematā daylight: chalk paper interior against soft harbour sky — no plum dusk grade.
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
          float harbour=exp(-pow((d.x+0.55)*2.4,2.0))*exp(-pow(h*5.5,2.0));
          // Paper-white low band → chalk mid → soft harbour blue high.
          vec3 low=vec3(0.96,0.95,0.93);
          vec3 mid=vec3(0.82,0.87,0.92);
          vec3 high=vec3(0.58,0.72,0.86);
          vec3 sky=mix(low,mid,smoothstep(-0.18,0.22,h));
          sky=mix(sky,high,smoothstep(0.12,0.72,h));
          // Soft warm horizon — natural daylight, not rose-opal flood.
          sky+=vec3(0.08,0.06,0.03)*exp(-pow((h-0.02)*9.0,2.0));
          sky+=vec3(0.12,0.11,0.08)*harbour*0.18;
          // Thin waterline scatter.
          sky+=vec3(0.06,0.09,0.12)*exp(-pow((h+0.05)*16.0,2.0))*0.18;
          gl_FragColor=vec4(sky,1.0);
        }`}
      />
    </mesh>
  );
}

function Room({ onReady }: { onReady: (ready: boolean) => void }) {
  return (
    <>
      <Daylight />
      <Suspense fallback={null}>
        <Architecture onReady={onReady} />
        <Identity />
      </Suspense>
      <Environment resolution={256} frames={1} environmentIntensity={0.72}>
        {/* Waitematā window elevation — soft daylight bounce into the room. */}
        <Lightformer
          position={[-12, 4, -8]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[42, 12, 1]}
          color={DAYLIGHT}
          intensity={3.4}
        />
        <Lightformer
          position={[-10, 5, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[30, 10, 1]}
          color={HARBOUR_SKY}
          intensity={2.2}
        />
        <Lightformer
          position={[0, 9, -8]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[14, 48, 1]}
          color={PAPER}
          intensity={2.6}
        />
        <Lightformer
          position={[8, 3, -14]}
          rotation={[0, -Math.PI / 2.4, 0]}
          scale={[18, 6, 1]}
          color={HARBOUR_HORIZON}
          intensity={0.7}
        />
      </Environment>
      {/* Soft chalk sky vs warm paper ground — no plum hemisphere. */}
      <hemisphereLight args={['#EEF2F5', '#E8E4DF', 1.35]} />
      {/* Soft natural key from the glazing — warm daylight, not mulberry dusk. */}
      <directionalLight
        position={[-14, 9.5, -1]}
        intensity={3.35}
        color="#FFFAF2"
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-bias={-0.00015}
        shadow-normalBias={0.035}
      />
      {/* Soft cove washes along the walk — Find / DO / Show — paper warm, not rose. */}
      {[
        [2.8, 4.6, 0.2, 28],
        [3.2, 4.7, -14.5, 34],
        [3.0, 4.5, -27.5, 30],
      ].map(([x, y, z, intensity]) => (
        <pointLight
          key={z}
          position={[x, y, z]}
          intensity={intensity}
          color="#FFF2E6"
          distance={14}
          decay={2}
        />
      ))}
      {/* Soft exterior daylight scatter through the open glazing (not night city neon). */}
      {[
        [-16, 4.5, 2],
        [-18, 5.5, -10],
        [-17, 4.8, -22],
      ].map(([x, y, z]) => (
        <pointLight
          key={`harbour-${z}`}
          position={[x, y, z]}
          intensity={18}
          color={DAYLIGHT}
          distance={26}
          decay={2}
        />
      ))}
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
        toneMappingExposure: 1.32,
        outputColorSpace: SRGBColorSpace,
      }}
      onCreated={({ gl, invalidate }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.32;
        gl.outputColorSpace = SRGBColorSpace;
        // Ensure the canvas element exists and demand-mode paints after mount.
        invalidate();
      }}
    >
      <color attach="background" args={[FIELD]} />
      {/* Soft paper fog — harbour massing stays readable; no plum atmospheric wash. */}
      <fog attach="fog" args={[FOG, 72, 165]} />
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
