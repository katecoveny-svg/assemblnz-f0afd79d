'use client';

/**
 * assembl / living — assembled 3D view of an AC-02 prototype
 * ----------------------------------------------------------
 * Loads the delivery's GLB (metres, nodes named `<part-id>__<n>`), recolours
 * each part by its role (body or accent) in the chosen filament colours and
 * renders on demand. Geometry is shown as delivered; nothing is rescaled
 * for manufacture here.
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { Box3, Color, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** The widget's scene unit is 100 mm; the GLB is in metres, so ×10. */
const M_TO_UNIT = 10;

type Props = { path: string; body: string; accent: string | null; accentParts: string[]; stage?: string };

function useAssembly(path: string): { group: Group; reach: number } | null {
  const [state, setState] = useState<{ path: string; group: Group; reach: number } | null>(null);
  useEffect(() => {
    let alive = true;
    new GLTFLoader().loadAsync(path).then((gltf) => {
      if (!alive) return;
      const g = gltf.scene;
      g.scale.setScalar(M_TO_UNIT);
      g.updateMatrixWorld(true);
      const box = new Box3().setFromObject(g);
      const size = box.getSize(new Vector3());
      const centre = box.getCenter(new Vector3());
      g.position.sub(centre);
      g.position.z -= 0; // keep the delivered pose; the view only centres it
      setState({ path, group: g, reach: Math.max(size.x, size.y, size.z) });
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [path]);
  return state?.path === path ? state : null;
}

function Assembly({ path, body, accent, accentParts }: Props) {
  const loaded = useAssembly(path);
  useEffect(() => {
    if (!loaded) return;
    loaded.group.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const partId = o.name.replace(/__\d+$/, '');
      const isAccent = accent && accentParts.includes(partId);
      o.material = new MeshStandardMaterial({ color: new Color(isAccent ? accent! : body), roughness: 0.78, metalness: 0 });
    });
  }, [loaded, body, accent, accentParts]);
  if (!loaded) return null;
  return <primitive object={loaded.group} rotation={[-Math.PI / 2.6, 0, 0]} />;
}

export default function GlbPreview3D(props: Props) {
  const reach = 2.2;
  return (
    <Canvas frameloop="demand" dpr={[1, 1.8]} camera={{ position: [reach * 0.9, reach * 0.8, reach * 1.6], fov: 32 }} gl={{ antialias: true }} style={{ width: '100%', height: '100%' }}>
      <color attach="background" args={[props.stage ?? '#f5f1f2']} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.5} />
      <directionalLight position={[-3, 1, 2]} intensity={0.5} />
      <Assembly {...props} />
      <OrbitControls enablePan={false} minDistance={0.6} maxDistance={12} />
    </Canvas>
  );
}
