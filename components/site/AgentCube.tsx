'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { HOME_AGENTS, type HomeAgent } from '@/lib/home/agent-roster';
import { drawAgentTile, drawBrandTile } from '@/lib/home/agent-mark';
import { askAgent } from '@/lib/home/agent-handoff';

/**
 * The agent cube — every agent assembl runs, on one object you can turn.
 *
 * Six faces of a 3×3 grid is 54 tiles and there are more agents than that, so
 * the cube does not quietly show a subset: a slot flips to an agent that is not
 * currently on the cube every couple of seconds, and the whole roster comes
 * round. Turning it is the fourth dimension the arrangement needs.
 *
 * Drag to turn it, let go and it drifts. Click a tile and that agent takes over
 * the phone above.
 *
 * It degrades rather than breaks. No WebGL, a machine that asks for reduced
 * motion, or a screen too small to turn something with a finger and a thumb all
 * get the same tiles as a flat gallery — same marks, same click, no canvas.
 */

const FACE = 3; // tiles per face edge
const SLOTS = FACE * FACE * 6; // 54
const TILE_PX = 320;
const CYCLE_MS = 2400;

type Slot = { mesh: THREE.Mesh; agent: HomeAgent | null };

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')),
    );
  } catch {
    return false;
  }
}

/** Where each slot sits on the cube, and which way it faces. */
function slotTransform(index: number): { pos: THREE.Vector3; rot: THREE.Euler } {
  const face = Math.floor(index / (FACE * FACE));
  const within = index % (FACE * FACE);
  const row = Math.floor(within / FACE);
  const col = within % FACE;
  const x = col - 1;
  const y = 1 - row;
  const d = 1.5;

  switch (face) {
    case 0:
      return { pos: new THREE.Vector3(x, y, d), rot: new THREE.Euler(0, 0, 0) };
    case 1:
      return { pos: new THREE.Vector3(-x, y, -d), rot: new THREE.Euler(0, Math.PI, 0) };
    case 2:
      return { pos: new THREE.Vector3(x, d, -y), rot: new THREE.Euler(-Math.PI / 2, 0, 0) };
    case 3:
      return { pos: new THREE.Vector3(x, -d, y), rot: new THREE.Euler(Math.PI / 2, 0, 0) };
    case 4:
      return { pos: new THREE.Vector3(-d, y, -x), rot: new THREE.Euler(0, -Math.PI / 2, 0) };
    default:
      return { pos: new THREE.Vector3(d, y, x), rot: new THREE.Euler(0, Math.PI / 2, 0) };
  }
}

export function AgentCube() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [flat, setFlat] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState<HomeAgent | null>(null);

  // Decide once, on the client, whether this machine gets the cube at all.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia('(max-width: 760px)').matches;
    setFlat(reduced || small || !hasWebGL());
  }, []);

  const pick = useCallback((agent: HomeAgent) => {
    askAgent(agent.slug);
  }, []);

  useEffect(() => {
    if (flat !== false) return;
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    camera.position.set(4.6, 3.4, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.style.cursor = 'grab';

    const group = new THREE.Group();
    scene.add(group);

    // One shared geometry; a material and texture per slot so a tile can flip.
    const geometry = new THREE.PlaneGeometry(0.9, 0.9);
    const brandTexture = new THREE.CanvasTexture(drawBrandTile(TILE_PX));
    brandTexture.colorSpace = THREE.SRGBColorSpace;

    const slots: Slot[] = [];
    const textures: THREE.Texture[] = [brandTexture];
    const materials: THREE.MeshBasicMaterial[] = [];

    const textureFor = (agent: HomeAgent) => {
      const t = new THREE.CanvasTexture(drawAgentTile(agent, TILE_PX));
      t.colorSpace = THREE.SRGBColorSpace;
      textures.push(t);
      return t;
    };

    for (let i = 0; i < SLOTS; i++) {
      const agent = HOME_AGENTS[i] ?? null;
      const material = new THREE.MeshBasicMaterial({
        map: agent ? textureFor(agent) : brandTexture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      materials.push(material);
      const mesh = new THREE.Mesh(geometry, material);
      const { pos, rot } = slotTransform(i);
      mesh.position.copy(pos);
      mesh.rotation.copy(rot);
      mesh.userData.slot = i;
      group.add(mesh);
      slots.push({ mesh, agent });
    }

    // ── picking ──────────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(2, 2); // offscreen until the cursor arrives
    const raycast = (): Slot | null => {
      if (pointer.x > 1 || pointer.y > 1) return null;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(group.children, false);
      if (!hits.length) return null;
      const slot = (hits[0].object as THREE.Mesh).userData.slot as number;
      return slots[slot] ?? null;
    };

    // ── turning ──────────────────────────────────────────────────────────────
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velX = 0.0022;
    let velY = 0.0009;
    let downAt = 0;
    let downX = 0;
    let downY = 0;

    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      downAt = performance.now();
      lastX = downX = e.clientX;
      lastY = downY = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (!dragging) return;
      velY = (e.clientX - lastX) * 0.0045;
      velX = (e.clientY - lastY) * 0.0045;
      group.rotation.y += velY;
      group.rotation.x += velX;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = 'grab';
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      // A short press that barely moved is a click on whatever is under it.
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (performance.now() - downAt < 420 && moved < 6) {
        const hit = raycast();
        if (hit?.agent) pick(hit.agent);
      }
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', () => {
      pointer.set(2, 2);
      setHovered(null);
    });

    // ── the roster comes round ───────────────────────────────────────────────
    // Agents past slot 54 are not on the cube yet, so a slot swaps to one of
    // them on a timer. Nothing is hidden; it just takes a moment to arrive.
    let queue = HOME_AGENTS.slice(SLOTS);
    const cycle = window.setInterval(() => {
      if (!queue.length || dragging) return;
      const next = queue.shift();
      if (!next) return;
      const slotIndex = Math.floor(Math.random() * slots.length);
      const slot = slots[slotIndex];
      if (slot.agent) queue.push(slot.agent);
      const old = materials[slotIndex].map;
      materials[slotIndex].map = textureFor(next);
      materials[slotIndex].needsUpdate = true;
      if (old && old !== brandTexture) old.dispose();
      slot.agent = next;
    }, CYCLE_MS);

    // ── frame loop ───────────────────────────────────────────────────────────
    let raf = 0;
    let lastHoverSlot = -1;
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!dragging) {
        // Ease back to a slow drift after a throw.
        velY += (0.0022 - velY) * 0.02;
        velX += (0.0009 - velX) * 0.02;
        group.rotation.y += velY;
        group.rotation.x += velX;
        // Keep the cube from tumbling fully over — it should stay readable.
        group.rotation.x = Math.max(-0.55, Math.min(0.55, group.rotation.x));
      }

      const hit = dragging ? null : raycast();
      const slotIndex = hit ? (hit.mesh.userData.slot as number) : -1;
      if (slotIndex !== lastHoverSlot) {
        lastHoverSlot = slotIndex;
        setHovered(hit?.agent ?? null);
        el.style.cursor = hit?.agent ? 'pointer' : dragging ? 'grabbing' : 'grab';
      }
      slots.forEach((s, i) => {
        const want = i === slotIndex ? 1.08 : 1;
        s.mesh.scale.x += (want - s.mesh.scale.x) * 0.2;
        s.mesh.scale.y = s.mesh.scale.x;
      });

      renderer.render(scene, camera);
    };
    render();

    // ── sizing ───────────────────────────────────────────────────────────────
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w <= 0 || h <= 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      // Pull back on narrow panels so the cube never crops.
      const d = w / h < 1 ? 9.4 : 8.6;
      camera.position.setLength(d);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(cycle);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
      geometry.dispose();
      renderer.dispose();
      if (el.parentNode === mount) mount.removeChild(el);
    };
  }, [flat, pick]);

  if (flat === null) return <div className="aj-cube-stage" aria-hidden="true" />;

  if (flat) return <AgentGrid onPick={pick} />;

  return (
    <div className="aj-cube-wrap">
      <div className="aj-cube-stage" ref={mountRef} data-owns-pointer />
      <p className="aj-cube-hint" aria-live="polite">
        {hovered ? (
          <>
            <b>{hovered.name}</b> — {hovered.description}
          </>
        ) : (
          <>DRAG TO TURN · TAP AN AGENT TO TALK TO IT</>
        )}
      </p>
      {/* The cube is a canvas, so the roster is also listed for anyone who
          cannot use it — a screen reader, a keyboard, a stuck pointer. */}
      <ul className="sr-only">
        {HOME_AGENTS.map((a) => (
          <li key={a.slug}>
            <button type="button" onClick={() => pick(a)}>
              {a.name} — {a.description}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The same agents, flat, for anything that cannot or should not run the cube. */
function AgentGrid({ onPick }: { onPick: (a: HomeAgent) => void }) {
  const tiles = useMemo(() => HOME_AGENTS, []);
  return (
    <div className="aj-cube-wrap">
      <ul className="aj-cube-grid">
        {tiles.map((a) => (
          <li key={a.slug}>
            <button type="button" onClick={() => onPick(a)}>
              <span className="aj-cube-mark" data-glyph={a.slug} aria-hidden="true" />
              <strong>{a.name}</strong>
              <em>{a.categoryLabel}</em>
            </button>
          </li>
        ))}
      </ul>
      <p className="aj-cube-hint">TAP AN AGENT TO TALK TO IT</p>
    </div>
  );
}
