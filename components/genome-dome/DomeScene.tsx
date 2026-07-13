'use client';

import * as React from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei/core/Line';
import { useGLTF } from '@react-three/drei/core/Gltf';
import { useTexture } from '@react-three/drei/core/Texture';

/**
 * A shallow city dome inspired by the supplied City Domes reference.
 * It is intentionally architectural rather than blob-like: an upper glass
 * membrane, a miniature Auckland plate and clickable gold data nodes.
 * The approved GLB supplies the irregular liquid outline; the Auckland render
 * beneath it is keyed live so the source file remains untouched.
 */

const COLUMBIA = '#C5D7D9';
const MING = '#3F7373';
const GOLD = '#D4AF37';
const GOLD_SOFT = '#E8D9A5';

export type DomeSurface = { id: string; name: string };

type CityBlock = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  shade: number;
};

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function createCityBlocks(count = 92): CityBlock[] {
  const random = seededRandom(7319);
  return Array.from({ length: count }, () => {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 1.03;
    const centreLift = Math.pow(1 - radius / 1.08, 1.7);
    const rawZ = Math.sin(angle) * radius;
    const z = rawZ > 0.2 && rawZ < 0.56 ? (rawZ > 0.38 ? rawZ + 0.28 : rawZ - 0.3) : rawZ;
    return {
      x: Math.cos(angle) * radius,
      z,
      width: 0.035 + random() * 0.07,
      depth: 0.035 + random() * 0.07,
      height: 0.035 + random() * 0.15 + centreLift * (0.36 + random() * 0.48),
      shade: random(),
    };
  });
}

const BLOCKS = createCityBlocks();

function AucklandPlate() {
  const texture = useTexture('/brand/genome/assembl-topdown-pale-dome.png');
  const material = React.useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { map: { value: texture } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      varying vec2 vUv;
      void main() {
        vec4 colour = texture2D(map, vUv);
        float magenta = step(0.88, colour.r) * step(0.80, colour.b) * (1.0 - step(0.28, colour.g));
        if (magenta > 0.5) discard;
        gl_FragColor = vec4(colour.rgb, colour.a * 0.82);
      }
    `,
  }), [texture]);

  React.useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.252, 0]} renderOrder={1}>
      <planeGeometry args={[2.44, 2.44]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function CityBlocks() {
  const mesh = React.useRef<THREE.InstancedMesh>(null);

  React.useLayoutEffect(() => {
    const target = mesh.current;
    if (!target) return;
    const matrix = new THREE.Matrix4();
    const colour = new THREE.Color();
    for (let index = 0; index < BLOCKS.length; index += 1) {
      const block = BLOCKS[index];
      matrix.compose(
        new THREE.Vector3(block.x, -0.255 + block.height / 2, block.z),
        new THREE.Quaternion(),
        new THREE.Vector3(block.width, block.height, block.depth),
      );
      target.setMatrixAt(index, matrix);
      colour.set(block.shade > 0.78 ? '#ffffff' : block.shade > 0.42 ? '#edf3f2' : '#dce8e7');
      target.setColorAt(index, colour);
    }
    target.instanceMatrix.needsUpdate = true;
    if (target.instanceColor) target.instanceColor.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, BLOCKS.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#e4eeee" toneMapped={false} />
    </instancedMesh>
  );
}

function RoadRings() {
  const circles = React.useMemo(
    () => [0.36, 0.68, 0.98].map((radius) => Array.from({ length: 72 }, (_, index) => {
      const angle = (index / 71) * Math.PI * 2;
      return [Math.cos(angle) * radius, -0.268, Math.sin(angle) * radius] as [number, number, number];
    })),
    [],
  );
  return <>{circles.map((points, index) => <Line key={index} points={points} color={COLUMBIA} transparent opacity={0.48} lineWidth={0.7} />)}</>;
}

function AucklandContext() {
  const harbour = React.useMemo(() => [
    [-1.16, -0.264, 0.48], [-0.82, -0.264, 0.38], [-0.42, -0.264, 0.43],
    [0, -0.264, 0.34], [0.42, -0.264, 0.39], [0.82, -0.264, 0.31], [1.13, -0.264, 0.39],
  ] as [number, number, number][], []);
  const bridge = React.useMemo(() => Array.from({ length: 28 }, (_, index) => {
    const t = index / 27;
    const x = -0.68 + t * 1.36;
    return [x, -0.19 + Math.sin(t * Math.PI) * 0.1, 0.43] as [number, number, number];
  }), []);

  return (
    <>
      <Line points={harbour} color="#d6e8ec" transparent opacity={0.92} lineWidth={18} />
      <Line points={bridge} color="#ffffff" transparent opacity={0.96} lineWidth={2.2} />
      <group position={[-0.08, -0.24, -0.02]}>
        <mesh position={[0, 0.31, 0]}>
          <cylinderGeometry args={[0.022, 0.033, 0.62, 20]} />
          <meshStandardMaterial color="#f8faf9" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.56, 0]}>
          <cylinderGeometry args={[0.072, 0.09, 0.07, 24]} />
          <meshStandardMaterial color={COLUMBIA} emissive="#f7faf9" emissiveIntensity={0.22} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <cylinderGeometry args={[0.007, 0.015, 0.37, 12]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD_SOFT} emissiveIntensity={0.65} />
        </mesh>
        <mesh position={[0, 0.96, 0]}>
          <sphereGeometry args={[0.018, 14, 14]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}

function ActivityLights() {
  const lights = React.useMemo(() => {
    const random = seededRandom(9841);
    return Array.from({ length: 22 }, (_, index) => {
      const angle = random() * Math.PI * 2;
      const radius = 0.18 + Math.sqrt(random()) * 0.89;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: 0.05 + random() * 0.24,
        phase: index * 0.47,
      };
    });
  }, []);

  return <>{lights.map((light, index) => <ActivityLight key={index} {...light} />)}</>;
}

function ActivityLight({ x, z, height, phase }: { x: number; z: number; height: number; phase: number }) {
  const material = React.useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (material.current) material.current.emissiveIntensity = 1.7 + Math.sin(clock.getElapsedTime() * 1.8 + phase) * 0.7;
  });
  return (
    <mesh position={[x, -0.24 + height / 2, z]}>
      <boxGeometry args={[0.014, height, 0.014]} />
      <meshStandardMaterial ref={material} color={GOLD} emissive={GOLD_SOFT} emissiveIntensity={2} toneMapped={false} />
    </mesh>
  );
}

const HUB: [number, number, number] = [0, -0.08, 0];

function nodePosition(index: number, total: number): [number, number, number] {
  const angle = index * 2.399963;
  const radius = 0.26 + (index / Math.max(1, total - 1)) * 0.74;
  return [Math.cos(angle) * radius, -0.11 + (index % 3) * 0.035, Math.sin(angle) * radius];
}

function GenomeNode({
  position,
  index,
  surface,
  onSelect,
  onHover,
}: {
  position: [number, number, number];
  index: number;
  surface?: DomeSurface;
  onSelect?: (surface: DomeSurface) => void;
  onHover?: (surface: DomeSurface | null) => void;
}) {
  const node = React.useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const scale = 1 + Math.sin(clock.getElapsedTime() * 2.1 + index * 0.9) * 0.18;
    node.current?.scale.setScalar(scale);
  });

  return (
    <group position={position}>
      <mesh ref={node}>
        <sphereGeometry args={[surface ? 0.036 : 0.02, 16, 16]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD_SOFT} emissiveIntensity={1.25} roughness={0.22} metalness={0.58} toneMapped={false} />
      </mesh>
      {surface ? (
        <mesh
          onClick={(event: { stopPropagation: () => void }) => {
            event.stopPropagation();
            onSelect?.(surface);
          }}
          onPointerOver={(event: { stopPropagation: () => void }) => {
            event.stopPropagation();
            document.body.style.cursor = 'pointer';
            onHover?.(surface);
          }}
          onPointerOut={() => {
            document.body.style.cursor = '';
            onHover?.(null);
          }}
        >
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function GlassShell() {
  const dome = React.useRef<THREE.Mesh>(null);
  const { scene } = useGLTF('/3d/assembl_topdown_blob.glb');
  const geometry = React.useMemo(() => {
    const source = scene.getObjectByName('AssemblTopDown_Blob');
    return source instanceof THREE.Mesh
      ? source.geometry.clone()
      : new THREE.SphereGeometry(1.34, 72, 36);
  }, [scene]);

  React.useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (!dome.current) return;
    const breath = 0.76 + Math.sin(clock.getElapsedTime() * 0.55) * 0.009;
    dome.current.scale.y = breath;
  });

  return (
    <>
      <mesh ref={dome} geometry={geometry} position={[0, 0.12, 0]} scale={[1, 0.76, 1]} renderOrder={4}>
        <meshStandardMaterial
          color="#eaf3f3"
          emissive="#f5fbfa"
          emissiveIntensity={0.28}
          roughness={0.16}
          metalness={0}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, -0.268, 0]} renderOrder={5}>
        <torusGeometry args={[1.34, 0.025, 16, 128]} />
        <meshPhysicalMaterial color={COLUMBIA} transmission={0.96} thickness={0.45} roughness={0.07} transparent opacity={0.48} />
      </mesh>
    </>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = React.useRef<THREE.Group>(null);
  const rotation = React.useRef(0);
  useFrame((state, delta) => {
    const target = group.current;
    if (!target) return;
    rotation.current += delta * 0.018;
    target.rotation.x = THREE.MathUtils.lerp(target.rotation.x, -state.pointer.y * 0.085, 0.055);
    target.rotation.y = THREE.MathUtils.lerp(target.rotation.y, rotation.current + state.pointer.x * 0.11, 0.055);
    target.position.y = 0.14 + Math.sin(state.clock.getElapsedTime() * 0.55) * 0.028;
  });
  return <group ref={group} scale={1.48}>{children}</group>;
}

function CityDome({
  surfaces,
  onSelect,
  onHover,
}: {
  surfaces: DomeSurface[];
  onSelect?: (surface: DomeSurface) => void;
  onHover?: (surface: DomeSurface | null) => void;
}) {
  const total = Math.max(15, surfaces.length + 5);
  const nodes = React.useMemo(() => Array.from({ length: total }, (_, index) => ({
    position: nodePosition(index, total),
    surface: index < surfaces.length ? surfaces[index] : undefined,
  })), [surfaces, total]);

  return (
    <Rig>
      <mesh position={[0, -0.305, 0]} receiveShadow>
        <cylinderGeometry args={[1.27, 1.2, 0.07, 96]} />
        <meshPhysicalMaterial color="#e8f1f2" emissive="#f7faf9" emissiveIntensity={0.12} roughness={0.38} metalness={0.02} clearcoat={0.4} />
      </mesh>
      <AucklandPlate />
      <RoadRings />
      <AucklandContext />
      <CityBlocks />
      <ActivityLights />
      {nodes.map((node, index) => (
        <React.Fragment key={node.surface?.id ?? `decorative-${index}`}>
          <Line points={[HUB, node.position]} color={GOLD} transparent opacity={0.2} lineWidth={0.65} />
          <GenomeNode position={node.position} index={index} surface={node.surface} onSelect={onSelect} onHover={onHover} />
        </React.Fragment>
      ))}
      <mesh position={HUB}>
        <sphereGeometry args={[0.05, 18, 18]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD_SOFT} emissiveIntensity={1.3} toneMapped={false} />
      </mesh>
      <GlassShell />
    </Rig>
  );
}

useGLTF.preload('/3d/assembl_topdown_blob.glb');
useTexture.preload('/brand/genome/assembl-topdown-pale-dome.png');

export default function DomeScene({
  surfaces,
  onSelect,
  onHover,
}: {
  surfaces: DomeSurface[];
  onSelect?: (surface: DomeSurface) => void;
  onHover?: (surface: DomeSurface | null) => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 1.03, 3.32], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={2.15} />
      <hemisphereLight color="#ffffff" groundColor="#dfe9e6" intensity={1.25} />
      <directionalLight position={[3, 5, 4]} intensity={2.8} color="#ffffff" castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={1.1} color={COLUMBIA} />
      <pointLight position={[0, 0.3, 1.6]} intensity={0.5} color={GOLD_SOFT} />
      <CityDome surfaces={surfaces} onSelect={onSelect} onHover={onHover} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.38, 0]} receiveShadow>
        <planeGeometry args={[7, 7]} />
        <shadowMaterial color={MING} transparent opacity={0.09} />
      </mesh>
    </Canvas>
  );
}
