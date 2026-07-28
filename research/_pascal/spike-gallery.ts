/**
 * assembl spike — author the /build-an-agent gallery hall in Pascal's scene
 * engine, headlessly, then convert the building to plain three.js box specs
 * for the existing Showroom renderer.
 *
 * Run: bun spike-gallery.ts
 * Out: spike-scene.json (Pascal's own format, openable in their editor)
 *      showroom-building.json (flat wall boxes for our renderer)
 *
 * Plan coordinates: [x, y] where y maps 1:1 onto the Showroom's z axis.
 * Units are metres and match the Showroom's existing dimensions exactly
 * (side walls at x ±8.5, plinth line z 0…−43, dais z −52, door z ≈ −62).
 */

import { SceneBridge } from './src/bridge/scene-bridge'
import { createSceneOperations } from './src/operations/scene-operations'
import { WallNode } from '@pascal-app/core/schema'
import type { AnyNodeId } from '@pascal-app/core/schema'
import { writeFileSync } from 'node:fs'

const bridge = new SceneBridge()
const ops = createSceneOperations({ bridge })
ops.loadDefault()

const level = ops.findNodes({ type: 'level' })[0]
if (!level) throw new Error('no default level — loadDefault changed?')
const levelId = level.id as AnyNodeId

const H = 10 // wall height
const T = 0.4 // wall thickness

const wall = (start: [number, number], end: [number, number], height = H, thickness = T) => {
  const node = WallNode.parse({ start, end, height, thickness })
  return ops.createNode(node, levelId)
}

/* ── the hall ─────────────────────────────────────────────────────────── */
// long side walls, entry end at y=+6 (behind the camera's start) to y=−58
wall([-8.5, 6], [-8.5, -58])
wall([8.5, 6], [8.5, -58])

// entry end: two stubs leaving a 5m opening centred on the walk
wall([-8.5, 6], [-2.5, 6])
wall([2.5, 6], [8.5, 6])

// the apse behind the dais: splayed walls narrowing to the doorway wall
wall([-8.5, -58], [-3.4, -66])
wall([8.5, -58], [3.4, -66])
// doorway wall with the portal gap (the glow lives in the gap)
wall([-3.4, -66], [-1.9, -66])
wall([1.9, -66], [3.4, -66])

// pilaster pairs at each bay boundary — the room's rhythm.
// bays sit between plinths (plinths at y 0, −8.6 … −43).
const bayBoundaries = [-4.3, -12.9, -21.5, -30.1, -38.7]
for (const y of bayBoundaries) {
  wall([-8.5, y], [-7.6, y], H, 0.35) // left pilaster, jutting 0.9m into the room
  wall([8.5, y], [7.6, y], H, 0.35) // right pilaster
}

/* ── validate + export Pascal's own format ────────────────────────────── */
const validation = ops.validateScene()
const graph = ops.exportSceneGraph()
writeFileSync('spike-scene.json', JSON.stringify(graph, null, 2))

/* ── convert: wall nodes → three.js box specs for the Showroom ────────── */
type Box = { cx: number; cy: number; cz: number; len: number; h: number; t: number; rotY: number }
const boxes: Box[] = []
for (const node of Object.values(graph.nodes)) {
  const n = node as {
    type: string
    start?: [number, number]
    end?: [number, number]
    height?: number
    thickness?: number
  }
  if (n.type !== 'wall' || !n.start || !n.end) continue
  const [x1, y1] = n.start
  const [x2, y2] = n.end
  const len = Math.hypot(x2 - x1, y2 - y1)
  const h = n.height ?? H
  const t = n.thickness ?? T
  boxes.push({
    cx: (x1 + x2) / 2,
    cy: h / 2,
    cz: (y1 + y2) / 2, // plan y == three z
    len,
    h,
    t,
    // three.js BoxGeometry laid along X, rotated about Y; plan angle → -rotY
    rotY: -Math.atan2(y2 - y1, x2 - x1),
  })
}
writeFileSync('showroom-building.json', JSON.stringify(boxes, null, 2))

console.log(
  JSON.stringify(
    {
      nodes: Object.keys(graph.nodes).length,
      walls: boxes.length,
      validation: validation ?? 'n/a',
    },
    null,
    2,
  ),
)
