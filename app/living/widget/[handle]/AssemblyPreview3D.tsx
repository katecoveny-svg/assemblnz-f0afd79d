'use client';

/**
 * assembl / living — the product assembled, live
 * ----------------------------------------------
 * Every part is its served print file, placed by the assembly matrix from lib/living/assemblies.json, tinted in
 * the chosen body and accent colours, with the customer's own name drawn at the lid's text area. When a view loads
 * or a choice changes, the parts fly in from their explode offsets and settle: motion that shows the thing going
 * together, nothing decorative. Renders on demand; drag to turn.
 */

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box3, CanvasTexture, Group, Matrix4, SRGBColorSpace, Vector3, type BufferGeometry } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import type { ResolvedView } from '@/lib/living/assembly';

const S = 1 / 100;
const cache = new Map<string, Promise<BufferGeometry>>();

function load(path: string): Promise<BufferGeometry> {
  let p = cache.get(path);
  if (!p) {
    p = new STLLoader().loadAsync(path).then((g) => {
      g.computeVertexNormals();
      g.computeBoundingBox();
      const b = g.boundingBox!;
      g.translate(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, -b.min.z);   // as the render harness and emit() frame it
      return g;
    });
    cache.set(path, p);
  }
  return p;
}

function useGeometries(paths: string[]): Map<string, BufferGeometry> {
  const [geos, setGeos] = useState<Map<string, BufferGeometry>>(new Map());
  const key = paths.join('|');
  useEffect(() => {
    let alive = true;
    Promise.all([...new Set(paths)].map((p) => load(p).then((g) => [p, g] as const))).then((pairs) => {
      if (alive) setGeos(new Map(pairs));
    }).catch(() => undefined);
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return geos;
}

function Lettering({ text, accent, w, h, matrix, font }: { text: string; accent: string; w: number; h: number; matrix: Matrix4; font: string | null }) {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  useEffect(() => {
    let alive = true;
    const family = font || '"Instrument Sans", system-ui, sans-serif';
    const weight = font ? 700 : 600;
    const draw = () => {
      if (!alive) return;
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = Math.max(64, Math.round((1024 * h) / w));
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = accent;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let size = c.height * 0.82;
      ctx.font = `${weight} ${size}px ${family}`;
      while (ctx.measureText(text).width > c.width * 0.92 && size > 8) { size -= 4; ctx.font = `${weight} ${size}px ${family}`; }
      ctx.fillText(text, c.width / 2, c.height / 2);
      const t = new CanvasTexture(c);
      t.colorSpace = SRGBColorSpace;
      setTexture(t);
    };
    if (font && typeof document !== 'undefined' && document.fonts?.load) document.fonts.load(`${weight} 32px ${family}`).then(draw, draw);
    else draw();
    return () => { alive = false; };
  }, [text, accent, w, h, font]);
  if (!texture) return null;
  return (
    <group matrixAutoUpdate={false} matrix={matrix}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  );
}

type Props = { view: ResolvedView; body: string; accent: string | null; text: string; font: string | null; stage?: string };

/** Each part eases from its explode offset to its place; `t` runs 0 → 1 after every change of view or parts. */
function Parts({ view, body, accent, text, font }: Props) {
  const geos = useGeometries(view.parts.map((p) => p.path));
  const t = useRef(0);
  const groups = useRef<(Group | null)[]>([]);
  const signature = view.name + '|' + view.parts.map((p) => p.partId).join(',');
  useEffect(() => { t.current = 0; }, [signature]);
  const matrices = useMemo(() => view.parts.map((p) => new Matrix4().fromArray(p.matrix)), [view]);
  const textMatrices = useMemo(() => view.texts.map((tx) => {
    const m = new Matrix4().fromArray(tx.matrix);
    const area = tx.area;
    const place = new Matrix4().makeTranslation(0, area.y ?? 0, area.z ?? 0);
    // the text area is in the assembled frame at the lid top: the matrix carries the lid; the area says where on it
    return place.multiply(new Matrix4().extractRotation(m).identity());
  }), [view]);
  useFrame((_, dt) => {
    if (t.current >= 1) return;
    t.current = Math.min(1, t.current + dt * 1.4);
    const e = 1 - Math.pow(1 - t.current, 3);
    view.parts.forEach((p, i) => {
      const g = groups.current[i];
      if (!g) return;
      const m = matrices[i].clone();
      const off = new Vector3(p.explode[0], p.explode[1], p.explode[2]).multiplyScalar(1 - e);
      m.setPosition(m.elements[12] + off.x, m.elements[13] + off.y, m.elements[14] + off.z);
      g.matrix.copy(m);
    });
  });
  const centre = useMemo(() => {
    const box = new Box3();
    view.parts.forEach((p, i) => {
      const g = geos.get(p.path);
      if (!g?.boundingBox) return;
      const b = g.boundingBox.clone().applyMatrix4(matrices[i]);
      box.union(b);
    });
    return box.isEmpty() ? new Vector3() : box.getCenter(new Vector3());
  }, [geos, matrices, view]);
  if (geos.size === 0) return null;
  return (
    <group rotation={[-Math.PI / 2.6, 0, 0]} scale={[S, S, S]} position={[0, 0, 0]}>
      <group position={[-centre.x, -centre.y, -centre.z]}>
        {view.parts.map((p, i) => {
          const g = geos.get(p.path);
          if (!g) return null;
          const colour = p.role === 'accent' ? (accent ?? '#E8EAED') : p.role === 'fixed' ? '#2A2A2D' : p.role === 'prop' ? '#E8EAED' : body;   // no accent chosen: the second-colour parts read as cloud, never black
          return (
            <group key={p.partId + i} ref={(el: Group | null) => { groups.current[i] = el; }} matrixAutoUpdate={false} matrix={matrices[i]}>
              <mesh geometry={g}>
                <meshStandardMaterial color={colour} roughness={0.78} metalness={0} />
              </mesh>
            </group>
          );
        })}
        {text && accent && view.texts.map((tx, i) => (
          <Lettering key={i} text={text} accent={accent} w={tx.area.w} h={tx.area.h} matrix={textMatrices[i]} font={font} />
        ))}
      </group>
    </group>
  );
}

export default function AssemblyPreview3D(props: Props) {
  const reach = props.view.reach * S;
  return (
    <Canvas frameloop="always" dpr={[1, 1.8]} camera={{ position: [reach * 0.75, reach * 0.65, reach * 1.35], fov: 32 }} gl={{ antialias: true }} style={{ width: '100%', height: '100%' }}>
      <color attach="background" args={[props.stage ?? '#f5f1f2']} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.5} />
      <directionalLight position={[-3, 1, 2]} intensity={0.5} />
      <Parts {...props} />
      <OrbitControls enablePan={false} minDistance={reach * 0.7} maxDistance={reach * 4} />
    </Canvas>
  );
}
