'use client';

/**
 * assembl / living — 3D view of a print file
 * ------------------------------------------
 * Loads the part's real v0.3 STL from the served pack, tints it in the chosen
 * colour and, for lettered parts, lays the customer's own text on the face as
 * a canvas texture (the STL's modelled lettering is never shown, since it is
 * not their name). Renders on demand only. Opt-in from the widget.
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { CanvasTexture, SRGBColorSpace, type BufferGeometry } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const S = 1 / 100;

type Props = { path: string; dims: { x: number; y: number; z: number }; body: string; accent: string | null; text: string; textSize: { x: number; y: number } | null; stage?: string; font?: string | null };

function Lettering({ text, accent, width, height, z, font }: { text: string; accent: string; width: number; height: number; z: number; font: string | null }) {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  useEffect(() => {
    let alive = true;
    const family = font || '"Instrument Sans", system-ui, sans-serif';
    const weight = font ? 700 : 600;
    const draw = () => {
      if (!alive) return;
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = Math.max(64, Math.round((1024 * height) / width));
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = accent;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let size = c.height * 0.82;
      ctx.font = `${weight} ${size}px ${family}`;
      while (ctx.measureText(text).width > c.width * 0.92 && size > 8) {
        size -= 4;
        ctx.font = `${weight} ${size}px ${family}`;
      }
      ctx.fillText(text, c.width / 2, c.height / 2);
      const t = new CanvasTexture(c);
      t.colorSpace = SRGBColorSpace;
      setTexture(t);
    };
    // Wait for the display face when one is named, so the slate never draws in a fallback.
    if (font && typeof document !== 'undefined' && document.fonts?.load) document.fonts.load(`${weight} 32px ${family}`).then(draw, draw);
    else draw();
    return () => { alive = false; };
  }, [text, accent, width, height, font]);
  if (!texture) return null;
  return (
    <mesh position={[0, 0, z + 0.2 * S]}>
      <planeGeometry args={[width * S, height * S]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

/** Fetches the STL once per path; the geometry is centred on x/y and sits on z = 0 like a print bed. */
function usePrintFile(path: string): BufferGeometry | null {
  const [geometry, setGeometry] = useState<{ path: string; geometry: BufferGeometry } | null>(null);
  useEffect(() => {
    let alive = true;
    new STLLoader().loadAsync(path).then((g) => {
      if (!alive) return;
      g.computeVertexNormals();
      g.computeBoundingBox();
      const b = g.boundingBox!;
      g.translate(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, -b.min.z);
      setGeometry({ path, geometry: g });
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [path]);
  return geometry?.path === path ? geometry.geometry : null;
}

function Part({ path, dims, body, accent, text, textSize, font }: Props) {
  const geometry = usePrintFile(path);
  if (!geometry) return null;
  const lettering = text && accent && textSize;
  return (
    <group rotation={[-Math.PI / 2.6, 0, 0]}>
      <mesh geometry={geometry} scale={[S, S, S]}>
        <meshStandardMaterial color={body} roughness={0.78} metalness={0} />
      </mesh>
      {lettering && <Lettering text={text} accent={accent} width={Math.min(textSize.x, dims.x * 0.9)} height={Math.min(textSize.y, dims.y * 0.9)} z={dims.z * S} font={font ?? null} />}
    </group>
  );
}

export default function PartPreview3D(props: Props) {
  const reach = Math.max(props.dims.x, props.dims.y, props.dims.z) * S;
  return (
    <Canvas frameloop="demand" dpr={[1, 1.8]} camera={{ position: [reach * 0.9, reach * 0.8, reach * 1.6], fov: 32 }} gl={{ antialias: true }} style={{ width: '100%', height: '100%' }}>
      <color attach="background" args={[props.stage ?? '#f5f1f2']} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.5} />
      <directionalLight position={[-3, 1, 2]} intensity={0.5} />
      <Part {...props} />
      <OrbitControls enablePan={false} minDistance={reach * 0.9} maxDistance={reach * 4} />
    </Canvas>
  );
}
