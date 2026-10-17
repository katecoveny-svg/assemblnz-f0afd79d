'use client';

/**
 * assembl / living — live 3D preview
 * ----------------------------------
 * Real dimensions from the CAD manifest, scaled 100 mm → 1 unit. Renders on
 * demand only (frameloop="demand"), so motion happens when the customer
 * moves it and then settles. The composer is the editing surface; this is
 * the view across the room.
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';
import {
  COLOURWAY_SWATCHES,
  INTERFACE_SPEC,
  PANEL_CELLS,
  PANEL_GAP_MM,
  PANEL_SIZE_MM,
  partById,
  type SpaceDesign,
} from '@/lib/living';
import { cellOrigin, fieldSize } from './GridComposer';

const S = 1 / 100;
const PITCH = INTERFACE_SPEC.pitch_mm;
const PANEL_T = INTERFACE_SPEC.panel_thickness_mm;

type Props = { design: Pick<SpaceDesign, 'panels' | 'placements' | 'panelColour' | 'accentColour'> };

function Holes({ x0, y0, colour }: { x0: number; y0: number; colour: string }) {
  const positions = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let r = 0; r < PANEL_CELLS; r++) {
      for (let c = 0; c < PANEL_CELLS; c++) {
        out.push([(x0 + c * PITCH + PITCH / 2) * S, (y0 + r * PITCH + PITCH / 2) * S, 0]);
      }
    }
    return out;
  }, [x0, y0]);
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[(INTERFACE_SPEC.hole_mm / 2) * S, (INTERFACE_SPEC.hole_mm / 2) * S, (PANEL_T + 0.6) * S, 12]} />
          <meshStandardMaterial color={colour} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ design }: Props) {
  const { w, h } = fieldSize(design.panels);
  const panel = COLOURWAY_SWATCHES[design.panelColour];
  const accent = COLOURWAY_SWATCHES[design.accentColour];
  const holeColour = panel.ink === '#FFFDFB' ? '#1a0718' : '#d9d2d4';

  // svg mm (y down) → scene units (y up), centred on the field
  const toScene = (xmm: number, ymm: number): [number, number] => [(xmm - w / 2) * S, (h / 2 - ymm) * S];

  const panels: { x: number; y: number }[] = [];
  for (let pr = 0; pr < design.panels.rows; pr++) {
    for (let pc = 0; pc < design.panels.cols; pc++) {
      panels.push({ x: pc * (PANEL_SIZE_MM + PANEL_GAP_MM), y: pr * (PANEL_SIZE_MM + PANEL_GAP_MM) });
    }
  }

  return (
    <>
      <color attach="background" args={['#f5f1f2']} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.4} />
      <directionalLight position={[-3, 1, 2]} intensity={0.5} />
      {/* wall */}
      <mesh position={[0, 0, -(INTERFACE_SPEC.standoff_mm + PANEL_T) * S]}>
        <planeGeometry args={[(w + 400) * S, (h + 400) * S]} />
        <meshStandardMaterial color="#fffdfb" roughness={1} />
      </mesh>
      {panels.map((p, i) => {
        const [cx, cy] = toScene(p.x + PANEL_SIZE_MM / 2, p.y + PANEL_SIZE_MM / 2);
        return (
          <group key={i}>
            <mesh position={[cx, cy, 0]}>
              <boxGeometry args={[PANEL_SIZE_MM * S, PANEL_SIZE_MM * S, PANEL_T * S]} />
              <meshStandardMaterial color={panel.hex} roughness={0.85} />
            </mesh>
            <group position={[-(w / 2) * S, (h / 2) * S, 0]} scale={[1, -1, 1]}>
              <Holes x0={p.x} y0={p.y} colour={holeColour} />
            </group>
            {[[16, 16], [PANEL_SIZE_MM - 16, 16], [16, PANEL_SIZE_MM - 16], [PANEL_SIZE_MM - 16, PANEL_SIZE_MM - 16]].map(([sx, sy], k) => {
              const [bx, by] = toScene(p.x + sx, p.y + sy);
              return (
                <mesh key={k} position={[bx, by, -(PANEL_T / 2 + INTERFACE_SPEC.standoff_mm / 2) * S]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[7 * S, 7 * S, INTERFACE_SPEC.standoff_mm * S, 16]} />
                  <meshStandardMaterial color={panel.hex} roughness={0.85} />
                </mesh>
              );
            })}
          </group>
        );
      })}
      {design.placements.map((pl) => {
        const part = partById(pl.partId);
        if (!part?.footprint) return null;
        const { x, y } = cellOrigin(pl.col, pl.row);
        const fw = part.footprint.cols * PITCH;
        const fh = part.footprint.rows * PITCH;
        const [cx, cy] = toScene(x + fw / 2, y + fh / 2);
        const z0 = (PANEL_T / 2) * S;
        const mat = <meshStandardMaterial color={accent.hex} roughness={0.7} />;
        switch (part.kind) {
          case 'hook':
            return (
              <group key={pl.id} position={[cx, cy, z0]}>
                <mesh position={[0, 0, 0.015]}><boxGeometry args={[0.2, 0.44, 0.03]} />{mat}</mesh>
                <mesh position={[0, -0.195, 0.03 + 0.16]}><boxGeometry args={[0.08, 0.05, 0.32]} />{mat}</mesh>
                <mesh position={[0, -0.17, 0.33]}><boxGeometry args={[0.08, 0.1, 0.04]} />{mat}</mesh>
              </group>
            );
          case 'ledge':
            return (
              <group key={pl.id} position={[cx, cy, z0]}>
                <mesh position={[0, 0.075, 0.015]}><boxGeometry args={[0.96, 0.45, 0.03]} />{mat}</mesh>
                <mesh position={[0, -0.13, 0.33]}><boxGeometry args={[0.96, 0.04, 0.6]} />{mat}</mesh>
                <mesh position={[0, -0.08, 0.615]}><boxGeometry args={[0.96, 0.1, 0.03]} />{mat}</mesh>
              </group>
            );
          case 'cup':
            return (
              <group key={pl.id} position={[cx, cy, z0]}>
                <mesh position={[0, 0.12, 0.015]}><boxGeometry args={[0.3, 0.44, 0.03]} />{mat}</mesh>
                <mesh position={[0, 0, 0.03 + 0.23]}><cylinderGeometry args={[0.24, 0.24, 0.7, 32, 1, true]} /><meshStandardMaterial color={accent.hex} roughness={0.7} side={2} /></mesh>
                <mesh position={[0, -0.34, 0.26]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.24, 32]} />{mat}</mesh>
              </group>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

export default function Preview3D({ design }: Props) {
  const { w } = fieldSize(design.panels);
  const dist = Math.max(3.2, (w / 100) * 1.6);
  return (
    <div className="lv-preview3d" aria-label="3D preview of the panel layout">
      <Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ position: [dist * 0.55, dist * 0.35, dist], fov: 38 }}>
        <Scene design={design} />
        <OrbitControls enablePan={false} minDistance={1.8} maxDistance={10} maxPolarAngle={Math.PI / 2 + 0.2} />
      </Canvas>
    </div>
  );
}
