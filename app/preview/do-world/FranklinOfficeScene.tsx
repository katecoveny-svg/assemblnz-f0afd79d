'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei/core/Gltf';
import { Environment } from '@react-three/drei/core/Environment';
import { Lightformer } from '@react-three/drei/core/Lightformer';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { ACESFilmicToneMapping, Mesh, PCFSoftShadowMap, PerspectiveCamera, SRGBColorSpace, Vector3 } from 'three';
import type { WorldSceneProps } from '@/components/site/assembl-the-work/WorldAtelierStage';
import { FRANKLIN_ASSETS, franklinView } from '@/lib/design/franklin-scene';
import { batchFranklinOffice } from '@/lib/design/franklin-batching';

/** Real Blender geometry, not a camera move applied to the poster. */
function Office({ progress, paused, onReady, onFailure }: WorldSceneProps) {
  const { scene } = useGLTF(FRANKLIN_ASSETS.model);
  const { camera, gl, invalidate, size } = useThree();
  const compact = size.width < 651;
  const position = useRef(new Vector3());
  const target = useRef(new Vector3());
  const look = useRef(new Vector3());
  const first = useRef(true);
  const announced = useRef(false);
  const readyFrame = useRef(0);
  const model = useMemo(() => batchFranklinOffice(scene), [scene]);
  const dogMeshes = Number(model.userData.franklinAuthoredMeshes);

  useEffect(() => () => {
    model.traverse(object => { if (object instanceof Mesh) object.geometry.dispose(); });
  }, [model]);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.dataset.scene = 'franklin-v1';
    canvas.dataset.franklinMeshes = String(dogMeshes);
    canvas.dataset.sceneBatches = String(model.children.length);
    const lost = (event: Event) => { event.preventDefault(); onReady?.(false); onFailure?.(); };
    canvas.addEventListener('webglcontextlost', lost);
    const wake = () => invalidate();
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    invalidate();
    return () => {
      cancelAnimationFrame(readyFrame.current);
      canvas.removeEventListener('webglcontextlost', lost);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
    };
  }, [gl, dogMeshes, model, invalidate, onReady, onFailure]);
  useEffect(() => { invalidate(); }, [paused, compact, invalidate]);

  useFrame((_, delta) => {
    if (paused && !first.current) return;
    const view = franklinView(progress.current ?? 0, compact);
    position.current.set(...view.position);
    target.current.set(...view.target);
    if (first.current) {
      camera.position.copy(position.current);
      look.current.copy(target.current);
      first.current = false;
    } else {
      const ease = 1 - Math.exp(-8 * Math.min(delta, .06));
      camera.position.lerp(position.current, ease);
      look.current.lerp(target.current, ease);
    }
    if (camera instanceof PerspectiveCamera && camera.fov !== view.fov) {
      camera.fov = view.fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(look.current);
    gl.domElement.dataset.cameraPosition = camera.position.toArray().map((v: number) => v.toFixed(3)).join(',');
    gl.domElement.dataset.cameraTarget = look.current.toArray().map((v: number) => v.toFixed(3)).join(',');
    if (!announced.current) {
      announced.current = true;
      readyFrame.current = requestAnimationFrame(() => {
        gl.domElement.dataset.franklinReady = 'true';
        onReady?.(true);
      });
      invalidate();
    }
    if (camera.position.distanceToSquared(position.current) + look.current.distanceToSquared(target.current) > .00001) invalidate();
  });
  return <primitive object={model} dispose={null} />;
}

export default function FranklinOfficeScene(props: WorldSceneProps) {
  return <Canvas
    frameloop="demand"
    dpr={[1, 1.25]}
    shadows={{ type: PCFSoftShadowMap }}
    camera={{ position: [-4.8, 1.93, 7.6], fov: 47, near: .06, far: 180 }}
    gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
    onCreated={({ gl }) => {
      gl.toneMapping = ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.05;
      gl.outputColorSpace = SRGBColorSpace;
    }}
    style={{ position: 'absolute', inset: 0 }}
  >
    <color attach="background" args={['#DCE2E4']} />
    <hemisphereLight args={['#F8F3EA', '#B5A48D', 1.55]} />
    <ambientLight intensity={.35} />
    <directionalLight position={[-3, 6, -8]} intensity={3.0} color="#FFF5E8" castShadow
      shadow-mapSize={[1024,1024]} shadow-camera-left={-10} shadow-camera-right={10}
      shadow-camera-top={10} shadow-camera-bottom={-10} shadow-camera-near={.1}
      shadow-camera-far={40} shadow-normalBias={.035} shadow-bias={-.0002} />
    <directionalLight position={[-5, 3, 5]} intensity={.7} color="#FFFDFB" />
    <Suspense fallback={null}>
      <Environment frames={1} resolution={128}>
        <Lightformer form="rect" intensity={1.3} color="#FFF8ED" scale={[14,5,1]} position={[0,3,-8]} />
        <Lightformer form="rect" intensity={.45} color="#E3EAF0" scale={[12,5,1]} position={[-7,3,0]} rotation={[0,Math.PI/2,0]} />
      </Environment>
      <Office {...props} />
    </Suspense>
  </Canvas>;
}
