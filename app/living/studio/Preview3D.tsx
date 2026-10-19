'use client';

/**
 * assembl / living — live 3D preview
 * ----------------------------------
 * Real installed dimensions from the catalogue, scaled 100 mm → 1 unit, on
 * the TURN grid. Renders on demand only, so motion happens when the customer
 * moves it and then settles.
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BOARD_CELLS, INTERFACE_SPEC, PITCH_MM, colourHex, colourInk, productByHandle, type SpaceDesign } from '@/lib/living';
import { boards, cellOrigin, fieldSize } from './GridComposer';

const S = 1 / 100;
const T = INTERFACE_SPEC.board_thickness_mm;

type Props = { design: Pick<SpaceDesign, 'field' | 'placements' | 'boardColour' | 'accessoryColour'> };

/** width × height × depth (mm) of each accessory kind, installed. */
const DIMS: Record<string, [number, number, number]> = {
  hook: [26, 73, 52], cradle: [26, 73, 58], shelf: [76, 56, 90], bin: [76, 76, 50], cup: [40, 104, 43], garage: [118, 104, 46], plate: [168, 40, 6],
};

function Scene({ design }: Props) {
  const { w, h } = fieldSize(design.field);
  const board = colourHex(design.boardColour);
  const accent = colourHex(design.accessoryColour);
  const keyColour = colourInk(design.boardColour) === '#FFFDFB' ? '#141014' : '#cfc8c6';
  const toScene = (xmm: number, ymm: number): [number, number] => [(xmm - w / 2) * S, (h / 2 - ymm) * S];

  return (
    <>
      <color attach="background" args={['#f5f1f2']} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.4} />
      <directionalLight position={[-3, 1, 2]} intensity={0.5} />
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[(w + 400) * S, (h + 400) * S]} />
        <meshStandardMaterial color="#fffdfb" roughness={1} />
      </mesh>
      {boards(design.field).map((b, i) => {
        const [cx, cy] = toScene(b.x + b.w / 2, b.y + b.h / 2);
        return (
          <group key={i}>
            <mesh position={[cx, cy, (T / 2) * S]}>
              <boxGeometry args={[(b.w - 1) * S, (b.h - 1) * S, T * S]} />
              <meshStandardMaterial color={board} roughness={0.85} />
            </mesh>
            {Array.from({ length: b.cols * BOARD_CELLS }, (_, k) => {
              const c = k % b.cols;
              const r = Math.floor(k / b.cols);
              const [kx, ky] = toScene(b.x + c * PITCH_MM + PITCH_MM / 2, b.y + r * PITCH_MM + PITCH_MM / 2);
              return (
                <group key={k} position={[kx, ky, (T - 2) * S]}>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[(INTERFACE_SPEC.keyway_bore_mm / 2) * S, (INTERFACE_SPEC.keyway_bore_mm / 2) * S, 4 * S, 24]} />
                    <meshStandardMaterial color={keyColour} roughness={0.9} />
                  </mesh>
                  <mesh>
                    <boxGeometry args={[INTERFACE_SPEC.lug_slot_mm * S, 19.6 * S, 4 * S]} />
                    <meshStandardMaterial color={keyColour} roughness={0.9} />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}
      {design.placements.map((pl) => {
        const product = productByHandle(pl.handle);
        if (!product?.footprint) return null;
        const { x, y } = cellOrigin(pl.col, pl.row);
        const cellsW = product.footprint.cols * PITCH_MM;
        const [bw, bh, bd] = DIMS[product.kind] ?? [cellsW - 8, product.footprint.rows * PITCH_MM, 40];
        const width = product.kind === 'shelf' || product.kind === 'bin' ? cellsW - 4 : bw;
        const top = y + (product.kind === 'plate' ? 1 : -12);
        const [cx, cy] = toScene(x + cellsW / 2, top + bh / 2);
        const mat = <meshStandardMaterial color={accent} roughness={0.7} />;
        const z0 = T * S;
        switch (product.kind) {
          case 'hook':
          case 'cradle':
            return (
              <group key={pl.id} position={[cx, cy, z0]}>
                <mesh position={[0, 0, 0.025]}><boxGeometry args={[width * S, bh * S, 0.05]} />{mat}</mesh>
                <mesh position={[0, -(bh / 2 - 8) * S, (bd / 2) * S]}><boxGeometry args={[width * S, 0.1, bd * S]} />{mat}</mesh>
                <mesh position={[0, -(bh / 2 - 18) * S, (bd - 4) * S]}><boxGeometry args={[width * S, 0.2, 0.08]} />{mat}</mesh>
              </group>
            );
          case 'shelf':
            return (
              <group key={pl.id} position={[cx, cy, z0]}>
                <mesh position={[0, 0.1, 0.025]}><boxGeometry args={[width * S, (bh - 20) * S, 0.05]} />{mat}</mesh>
                <mesh position={[0, -(bh / 2 - 4) * S, (bd / 2) * S]}><boxGeometry args={[width * S, 0.05, bd * S]} />{mat}</mesh>
                <mesh position={[0, -(bh / 2 - 10) * S, (bd - 3) * S]}><boxGeometry args={[width * S, 0.14, 0.05]} />{mat}</mesh>
              </group>
            );
          case 'bin':
          case 'garage':
            return (
              <group key={pl.id} position={[cx, cy, z0 + (bd / 2) * S]}>
                <mesh><boxGeometry args={[width * S, bh * S, bd * S]} />{mat}</mesh>
                <mesh position={[0, 0.02, 0]}><boxGeometry args={[(width - 4) * S, (bh - 2) * S, (bd - 4) * S]} /><meshStandardMaterial color="#2a2a2d" roughness={1} /></mesh>
              </group>
            );
          case 'cup':
            return (
              <group key={pl.id} position={[cx, cy, z0]}>
                <mesh position={[0, 0.2, 0.025]}><boxGeometry args={[width * S, 0.6, 0.05]} />{mat}</mesh>
                <mesh position={[0, -0.15, (bd / 2) * S]}><boxGeometry args={[width * S, 0.72, bd * S]} />{mat}</mesh>
              </group>
            );
          case 'plate':
            return (
              <mesh key={pl.id} position={[cx, cy, z0 + (bd / 2) * S]}><boxGeometry args={[width * S, bh * S, bd * S]} />{mat}</mesh>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

export default function Preview3D({ design }: Props) {
  const { w } = fieldSize(design.field);
  const dist = Math.max(3.4, (w / 100) * 1.5);
  return (
    <div className="lv-preview3d" aria-label="3D preview of the board layout">
      <Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ position: [dist * 0.55, dist * 0.35, dist], fov: 38 }}>
        <Scene design={design} />
        <OrbitControls enablePan={false} minDistance={1.8} maxDistance={12} maxPolarAngle={Math.PI / 2 + 0.2} />
      </Canvas>
    </div>
  );
}
