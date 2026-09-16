"use client";

import { Suspense, useEffect, useMemo, useRef, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { useGLTF } from "@react-three/drei/core/Gltf";
import { Html } from "@react-three/drei/web/Html";
import { Mesh, Vector3, type Object3D } from "three";
import type { OfficeCounts, OfficeView } from "./DoOfficeSpatial";
import styles from "./spatial.module.css";

const views: Record<
  OfficeView,
  { camera: [number, number, number]; target: [number, number, number] }
> = {
  overview: { camera: [14, 13, 19], target: [0, 0.4, -1.3] },
  review: { camera: [-9, 5, 9], target: [-5.7, 0.7, -0.5] },
  builder: { camera: [1, 4, 8], target: [0, 1, -1] },
  proof: { camera: [10, 5, 9], target: [5.7, 0.7, -0.5] },
};
function Camera({ view }: { view: OfficeView }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const moving = useRef(false);
  const reduced = useRef(false);
  const { camera, invalidate } = useThree();
  const destination = useRef(new Vector3());
  const target = useRef(new Vector3());
  useEffect(() => {
    destination.current.set(...views[view].camera);
    target.current.set(...views[view].target);
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    moving.current = true;
    invalidate();
  }, [view, invalidate]);
  useFrame((_, delta) => {
    if (!moving.current || !controls.current) return;
    const amount = reduced.current ? 1 : 1 - Math.exp(-delta * 5);
    camera.position.lerp(destination.current, amount);
    controls.current.target.lerp(target.current, amount);
    controls.current.update();
    moving.current =
      camera.position.distanceTo(destination.current) > 0.02 ||
      controls.current.target.distanceTo(target.current) > 0.02;
    if (moving.current) invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={6}
      maxDistance={42}
      minPolarAngle={0.3}
      maxPolarAngle={1.43}
      target={[0, 0.4, -1.3]}
      onStart={() => {
        moving.current = false;
      }}
    />
  );
}
function Studio(counts: OfficeCounts) {
  const { scene } = useGLTF(
    "/do/office/harbour-studio.glb",
    "/do/office/draco/",
  );
  const studio = useMemo(() => {
    const copy = scene.clone();
    copy.traverse((object: Object3D) => {
      if (
        object.name === "Harbour_water" ||
        object.name === "Imagined_harbour_horizon"
      )
        object.visible = false;
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return copy;
  }, [scene]);
  return (
    <>
      <primitive object={studio} />
      {[
        {
          x: -5.7,
          title: "Needs you",
          value: counts.needsYou,
          id: "needs_you",
        },
        { x: 0, title: "Working", value: counts.working, id: "working" },
        { x: 5.7, title: "Done", value: counts.done, id: "done" },
      ].map((zone) => (
        <Html
          key={zone.id}
          position={[zone.x, 2.65, -2.2]}
          center
          distanceFactor={22}
          zIndexRange={[10, 0]}
        >
          <a className={styles.marker} href={`#board-${zone.id}`}>
            {zone.title}
            <strong>{zone.value}</strong>
          </a>
        </Html>
      ))}
    </>
  );
}
export default function OfficeScene({
  view,
  ...counts
}: OfficeCounts & { view: OfficeView }) {
  return (
    <div className={styles.canvas}>
      <Canvas
        shadows
        camera={{ position: [14, 13, 19], fov: 35, near: 0.1, far: 150 }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ antialias: true, alpha: false }}
        fallback={
          <p>
            Use the studio image and task links below; WebGL is unavailable.
          </p>
        }
      >
        <color attach="background" args={["#211322"]} />
        <fog attach="fog" args={["#211322", 37, 90]} />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.59, 0]}
          receiveShadow
        >
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial
            color="#354250"
            roughness={0.45}
            metalness={0.15}
          />
        </mesh>
        <hemisphereLight args={["#e6dce9", "#715858", 2.6]} />
        <directionalLight
          position={[-10, 12, -6]}
          intensity={3.5}
          color="#ffd5b8"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-camera-far={50}
          shadow-normalBias={0.025}
        />
        <directionalLight
          position={[3, 12, 9]}
          intensity={2.2}
          color="#bba8dc"
        />
        <Suspense fallback={null}>
          <Studio {...counts} />
        </Suspense>
        <Camera view={view} />
      </Canvas>
    </div>
  );
}
