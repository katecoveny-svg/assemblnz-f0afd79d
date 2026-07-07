'use client';

import { useLayoutEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import {
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  type Material,
} from 'three';
import type { Phase } from './geometry';

/**
 * VillaModel — the REAL proposed 16C two-bed unit.
 *
 * This is Nick's actual building: villa-16a.glb is the Blender-built 16C model
 * (bmesh wall builder, first verified glb — 47 named elements: external + party
 * walls, gable roof, ridge, fascias, five windows, the entry + slider doors, the
 * north/south decks, the piles that pick up the 380 mm cross-fall). It is loaded
 * once and re-dressed across the four construction states by walking its named
 * nodes — so the ARC insight layer hovers over the genuine thing, not a stand-in.
 *
 *   consent       — the GA slab as paper on the ground; the envelope in ink line
 *   concept       — solid massing, charcoal, no openings
 *   construction  — timber framing read as wireframe, piles + subfloor solid
 *   complete       — clad cedar, charcoal roof, warm glazing, decks down
 */

const MODEL_URL = '/customers/toa/models/villa-16a.glb';

// brand palette — champagne / paper / ink, honey cedar, charcoal roof
const CLAD = '#c39a63';
const ROOF = '#39352f';
const CHARCOAL = '#41463f';
const CHARCOAL_LT = '#4c514a';
const TIMBER = '#c99f63';
const TIMBER_DARK = '#8a6a3d';
const GLASS = '#a7c1c5';
const GLOW = '#f3c887';
const PAPER = '#efe7d3';
const INK = '#26231f';
const DECK_C = '#a8814f';
const FLOOR = '#c9a877';

type Cat = 'ground' | 'shell' | 'internal' | 'ceiling' | 'glazing' | 'door' | 'deck';

function categorize(name: string): Cat {
  const n = name.toLowerCase();
  if (n.includes('pile') || n.includes('subframe') || n.includes('slab')) return 'ground';
  if (n.includes('wall_internal')) return 'internal';
  if (n.includes('window')) return 'glazing';
  if (n.includes('door')) return 'door';
  if (n.includes('deck')) return 'deck';
  if (n.includes('ceiling')) return 'ceiling';
  return 'shell'; // wall_external + roof_* + fallback
}

type Dress = { visible: boolean; mat?: Material };

const solid = (color: string, o: Partial<MeshStandardMaterial> = {}) =>
  new MeshStandardMaterial({ color, roughness: 0.85, ...o });
const wire = (color: string, opacity: number) =>
  new MeshStandardMaterial({ color, wireframe: true, transparent: true, opacity, roughness: 1 });

/** How each category is dressed in each phase. Fresh materials per switch. */
function dressFor(phase: Phase, cat: Cat): Dress {
  switch (phase) {
    case 'consent':
      switch (cat) {
        case 'ground':
          // only the slab, as paper laid on the ground
          return { visible: true, mat: new MeshStandardMaterial({ color: PAPER, roughness: 1 }) };
        case 'shell':
          return { visible: true, mat: wire(INK, 0.7) };
        case 'internal':
          return { visible: true, mat: wire(INK, 0.32) };
        case 'deck':
          return { visible: true, mat: wire(INK, 0.45) };
        default:
          return { visible: false };
      }
    case 'concept':
      switch (cat) {
        case 'ground':
          return { visible: true, mat: solid(CHARCOAL_LT, { roughness: 0.95 }) };
        case 'shell':
          return { visible: true, mat: solid(CHARCOAL, { roughness: 0.92 }) };
        case 'deck':
          return { visible: true, mat: solid(CHARCOAL_LT, { roughness: 0.95 }) };
        default:
          return { visible: false }; // no openings, no internals in massing
      }
    case 'construction':
      switch (cat) {
        case 'ground':
          return { visible: true, mat: solid('#9a7b4f', { roughness: 0.95 }) };
        case 'shell':
          return { visible: true, mat: wire(TIMBER, 0.92) };
        case 'internal':
          return { visible: true, mat: wire(TIMBER, 0.6) };
        case 'deck':
          return { visible: true, mat: solid(TIMBER, { roughness: 0.85 }) };
        default:
          return { visible: false }; // glazing/doors are still openings
      }
    case 'complete':
    default:
      switch (cat) {
        case 'ground':
          return { visible: true, mat: solid(FLOOR, { roughness: 0.8 }) };
        case 'shell':
          return { visible: true, mat: solid(CLAD, { roughness: 0.82 }) };
        case 'internal':
          return { visible: false }; // seen from outside; keep the read clean
        case 'ceiling':
          // dark underside so any peek through the glazing reads as shadow,
          // never as a bright open box
          return { visible: true, mat: solid('#2c2a26', { roughness: 1 }) };
        case 'glazing':
          return {
            visible: true,
            mat: new MeshStandardMaterial({
              color: GLASS,
              roughness: 0.08,
              metalness: 0.25,
              transparent: true,
              opacity: 0.82,
              emissive: GLOW,
              emissiveIntensity: 0.34,
            }),
          };
        case 'door':
          return { visible: true, mat: solid(TIMBER_DARK, { roughness: 0.7 }) };
        case 'deck':
          return { visible: true, mat: solid(DECK_C, { roughness: 0.85 }) };
      }
  }
}

// roof pieces should read as charcoal in the complete state, not cedar
function isRoof(name: string) {
  return name.toLowerCase().includes('roof');
}

export function VillaModel({ phase }: { phase: Phase }) {
  const { scene } = useGLTF(MODEL_URL);

  // clone once so we own the graph and can re-dress it without touching the cache
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o: Object3D) => {
      const m = o as Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  useLayoutEffect(() => {
    model.traverse((o: Object3D) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      const cat = categorize(m.name);
      const dress = dressFor(phase, cat);
      m.visible = dress.visible;
      if (dress.mat) {
        // roof stays charcoal even where 'shell' would otherwise clad it cedar
        if (phase === 'complete' && cat === 'shell' && isRoof(m.name)) {
          m.material = new MeshStandardMaterial({ color: ROOF, roughness: 0.9 });
        } else {
          m.material = dress.mat;
        }
        m.castShadow = dress.visible && !(dress.mat as MeshStandardMaterial).wireframe;
      }
    });
  }, [phase, model]);

  // recentre the building to the origin: local centre (5.4, 0, -3.0) -> (0,0,0)
  return (
    <group position={[-5.4, 0, 3.0]} dispose={null}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
