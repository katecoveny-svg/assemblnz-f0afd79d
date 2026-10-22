'use client';

/**
 * assembl my pod · my space · my ride · my day
 * --------------------------------------------
 * Pick and mix: drag parts from the tray into the product (or tap them), watch the real print files assemble in
 * 3D, and read the parts, cost, price and timeline as it changes. State lives in the page and in this browser
 * only; nothing is ordered, sent or stored anywhere else.
 */

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  CHARM_OPTIONS, DAYS, DAY_ITEMS, MAX_BOARDS, MODES, MOUNT_OPTIONS, PITCH, POD_SIZES, RIDE_KITS, ROWS, SPACE_PIECES, ZONES,
  canPlace, dayView, defaultDay, defaultPod, defaultRide, defaultSpace, firstFree, fits, insertOptions, lidOptions, partName, partsFor,
  pieceRect, podNeedsName, podView, prune, resizePod, rideView, spaceView, totals, wallCols,
  type BoardKind, type DayId, type DayState, type Mode, type PodSize, type PodState, type RideState, type SpaceState, type Zone,
} from '@/lib/living/builder';
import { COST_ASSUMPTIONS } from '@/lib/living/costing';
import { CAD_MANIFEST } from '@/lib/living/catalogue';
import { useDrag, type DragPayload } from './useDrag';

const AssemblyPreview3D = dynamic(() => import('../widget/[handle]/AssemblyPreview3D'), { ssr: false, loading: () => <p className="ab-wait">assembling the print files…</p> });

type State = { pod: PodState; space: SpaceState; ride: RideState; day: DayState };
type Colours = Record<Mode, { body: string; accent: string }>;
const STORE = 'assembl-builder-v1';

const DAYRALLY = CAD_MANIFEST.colours.dayrally;
const LIVING = CAD_MANIFEST.colours.living;
const paletteFor = (m: Mode) => (m === 'space' ? LIVING : DAYRALLY);
const hexOf = (m: Mode, id: string) => paletteFor(m).find((c) => c.id === id)?.hex ?? '#E8EAED';
const DEFAULT_COLOURS: Colours = { pod: { body: 'sky', accent: 'butter' }, space: { body: 'sage', accent: 'chalk' }, ride: { body: 'tomato', accent: 'ink' }, day: { body: 'lime', accent: 'cloud' } };
const POD_MM: Record<PodSize, [number, number, number]> = { mini: [108, 60, 30], standard: [144, 72, 34], tall: [144, 72, 52], long: [192, 72, 34], wide: [176, 100, 40] };

const PIECE_ART: Record<string, string> = {
  'grid-hook': 'hook-clay', 'grid-cup': 'cup-plum', 'grid-shelf-2': 'shelf-3-sage', 'grid-shelf-3': 'shelf-3-sage', 'grid-bin-2': 'bin-2-oat',
  'tk-pack-case-5': 'tackle-wall', 'tk-pack-case-7': 'tackle-wall', 'tk-pack-rail': 'tackle-wall', 'tk-reel-dock': 'tackle-wall',
  'pod-mini': 'pod-mini-butter-name', 'pod-standard': 'pod-standard-sky-waves', 'pod-long': 'pods-pens',
};
const MOUNT_ART: Record<string, string> = { 'tk-universal-saddle': 'tackle-universal' };

function Art({ name, alt = '' }: { name: string | null | undefined; alt?: string }) {
  if (!name) return <span className="ab-art ab-art-none" aria-hidden />;
  return <span className="ab-art"><Image src={`/living/alpha/${name}.png`} alt={alt} fill sizes="72px" /></span>;
}

function nzd(n: number) {
  return n.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: n % 1 ? 2 : 0 });
}

function load(): { state: State; colours: Colours; name: string } | null {
  try {
    const raw = window.localStorage.getItem(STORE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AssemblBuilder({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [state, setState] = useState<State>({ pod: defaultPod('standard'), space: defaultSpace(), ride: defaultRide(), day: defaultDay('fish') });
  const [colours, setColours] = useState<Colours>(DEFAULT_COLOURS);
  const [name, setName] = useState('');
  const [zone, setZone] = useState<Zone>('bar');
  const [dayFocus, setDayFocus] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null);

  // restore a saved build once, after hydration
  useEffect(() => {
    const saved = load();
    if (!saved) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((s) => ({ ...s, ...saved.state, space: prune({ ...defaultSpace(), ...saved.state.space }) }));
      setColours((c) => ({ ...c, ...saved.colours }));
      setName(saved.name ?? '');
    } catch {
      /* a stale save is ignored */
    }
  }, []);

  const say = useCallback((text: string) => { setNote(text); window.setTimeout(() => setNote((n) => (n === text ? null : n)), 2600); }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    try { window.history.replaceState(null, '', `/living/assembl/${m}`); } catch { /* fine */ }
  };

  // ---------------- what a drop or a tap does ----------------
  const place = useCallback((p: DragPayload, target: HTMLElement | null, x: number, y: number) => {
    setState((s) => {
      switch (p.kind) {
        case 'size': return { ...s, pod: resizePod(s.pod, p.id as PodSize) };
        case 'lid': return { ...s, pod: { ...s.pod, lid: p.id } };
        case 'insert': return { ...s, pod: { ...s.pod, insert: p.id } };
        case 'mount': return { ...s, pod: { ...s.pod, mount: s.pod.mount === p.id && !target ? null : p.id } };
        case 'charm': return { ...s, pod: { ...s.pod, charm: s.pod.charm === p.id && !target ? null : p.id } };
        case 'board': {
          if (s.space.boards.length >= MAX_BOARDS) { say(`${MAX_BOARDS} boards is the widest wall here.`); return s; }
          return { ...s, space: { ...s.space, boards: [...s.space.boards, p.id as BoardKind] } };
        }
        case 'piece': {
          const svg = target?.closest('svg[data-wall]') as SVGSVGElement | null;
          if (p.uid && target?.dataset.drop === 'tray') return { ...s, space: { ...s.space, placed: s.space.placed.filter((q) => q.uid !== p.uid) } };
          let cell: [number, number] | null = null;
          if (svg) cell = cellAt(svg, x, y, s.space);
          if (!cell) cell = p.uid ? null : firstFree(s.space, p.id);
          if (!cell) { say('No room for that on this wall: add a board or move something.'); return s; }
          if (!canPlace(s.space, p.id, cell[0], cell[1], p.uid)) { say('That spot is taken or runs off the boards.'); return s; }
          const placed = p.uid
            ? s.space.placed.map((q) => (q.uid === p.uid ? { ...q, i: cell![0], j: cell![1] } : q))
            : [...s.space.placed, { uid: `${p.id}-${Date.now().toString(36)}`, piece: p.id, i: cell[0], j: cell[1] }];
          return { ...s, space: { ...s.space, placed } };
        }
        case 'ride': {
          const z = (target?.closest('[data-zone]') as HTMLElement | null)?.dataset.zone as Zone | undefined;
          const into = z && fits(p.id, z) ? z : !target ? ZONES.find((zz) => fits(p.id, zz.id) && !s.ride.zones[zz.id])?.id ?? ZONES.find((zz) => fits(p.id, zz.id))?.id : undefined;
          if (!into) { say(z ? `That does not fit the ${ZONES.find((q) => q.id === z)?.label}.` : 'Drop it on a glowing spot on the bike.'); return s; }
          setZone(into);
          return { ...s, ride: { zones: { ...s.ride.zones, [into]: p.id } } };
        }
        case 'day': {
          if (target && target.dataset.drop !== 'bag') return s;
          setDayFocus(p.id);
          return s.day.items.includes(p.id) ? s : { ...s, day: { ...s.day, items: [...s.day.items, p.id] } };
        }
        default: return s;
      }
    });
    setHover(null);
  }, [say]);

  const onDrop = useCallback((p: DragPayload, target: HTMLElement | null, x: number, y: number) => {
    if (!target) { if (p.uid) place(p, null, x, y); return; }
    place(p, target, x, y);
  }, [place]);
  const onClick = useCallback((p: DragPayload) => {
    if (p.kind === 'piece' && p.uid) return;
    place(p, null, 0, 0);
  }, [place]);
  const { drag, bind } = useDrag(onDrop, onClick);

  // the wall preview under a dragged piece
  useEffect(() => {
    if (!drag || drag.payload.kind !== 'piece') return;
    const svg = drag.target?.closest('svg[data-wall]') as SVGSVGElement | null;
    const c = svg ? cellAt(svg, drag.x, drag.y, state.space) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHover(c ? { i: c[0], j: c[1] } : null);
  }, [drag, state.space]);

  // ---------------- what it adds up to ----------------
  const lines = useMemo(() => {
    const merged = new Map<string, number>();
    for (const l of partsFor(mode, state)) merged.set(l.id, (merged.get(l.id) ?? 0) + l.qty);
    return [...merged].map(([id, qty]) => ({ id, qty }));
  }, [mode, state]);
  const t = useMemo(() => totals(lines), [lines]);

  const view = useMemo(() => {
    if (mode === 'pod') return podView(state.pod);
    if (mode === 'space') return spaceView(state.space);
    if (mode === 'ride') return rideView(state.ride, zone);
    const h = dayFocus && state.day.items.includes(dayFocus) ? dayFocus : state.day.items[0];
    return h ? dayView(h) : null;
  }, [mode, state, zone, dayFocus]);

  const dayHandle = dayFocus && state.day.items.includes(dayFocus) ? dayFocus : state.day.items[0];
  const dayArt = DAY_ITEMS.find((d) => d.handle === dayHandle)?.art ?? null;
  const c = colours[mode];
  const needsName = mode === 'pod' && podNeedsName(state.pod);

  const save = () => {
    try {
      window.localStorage.setItem(STORE, JSON.stringify({ state, colours, name }));
      say('Saved in this browser.');
    } catch {
      say('This browser would not save it.');
    }
  };
  const copy = async () => {
    const build = { mode, colours: c, name: needsName ? name : null, parts: lines, estimate: { grams: t.grams, printHours: t.printHours, costNzd: t.costNzd, priceNzd: t.priceNzd }, status: 'designed, not printed, not for sale' };
    try { await navigator.clipboard.writeText(JSON.stringify(build, null, 2)); say('Build copied.'); } catch { say('Copy is blocked here.'); }
  };
  const reset = () => {
    setState((s) => ({ ...s, [mode]: mode === 'pod' ? defaultPod('standard') : mode === 'space' ? defaultSpace() : mode === 'ride' ? defaultRide() : defaultDay(s.day.day) }));
    setName('');
  };

  return (
    <div className="ab" data-mode={mode} data-dragging={drag ? 'true' : undefined}>
      <div className="lv-wrap ab-head">
        <h1 className="ab-title">assembl <span>my</span></h1>
        <nav className="ab-modes" aria-label="What are you assembling?">
          {MODES.map((m) => (
            <button key={m.id} type="button" className="ab-mode" aria-pressed={mode === m.id} onClick={() => switchMode(m.id)}>
              <b>{m.id}</b>
              <small>{m.line}</small>
            </button>
          ))}
        </nav>
      </div>

      <div className="lv-wrap ab-grid">
        {/* ---------------- the tray ---------------- */}
        <aside className="ab-tray" data-drop="tray" aria-label="Parts">
          <p className="ab-hint">drag into the {mode === 'space' ? 'wall' : mode === 'ride' ? 'bike' : mode === 'day' ? 'day' : 'pod'}, or tap</p>
          {mode === 'pod' && (
            <>
              <TrayGroup title="size">
                {POD_SIZES.map((s) => <TrayItem key={s.id} bind={bind} p={{ kind: 'size', id: s.id, label: s.label, art: s.art }} on={state.pod.size === s.id} sub={s.mm} />)}
              </TrayGroup>
              <TrayGroup title="lid">
                {lidOptions(state.pod.size).map((o) => <TrayItem key={o.id} bind={bind} p={{ kind: 'lid', id: o.id, label: o.label }} on={state.pod.lid === o.id} />)}
              </TrayGroup>
              <TrayGroup title="insert">
                {insertOptions(state.pod.size).map((o) => <TrayItem key={o.id} bind={bind} p={{ kind: 'insert', id: o.id, label: o.label }} on={state.pod.insert === o.id} />)}
              </TrayGroup>
              <TrayGroup title="mount">
                {MOUNT_OPTIONS.map((m) => <TrayItem key={m.id} bind={bind} p={{ kind: 'mount', id: m.id, label: m.label, art: MOUNT_ART[m.id] ?? null }} on={state.pod.mount === m.id} sub={m.line} />)}
              </TrayGroup>
              <TrayGroup title="charm">
                {CHARM_OPTIONS.map((o) => <TrayItem key={o.id} bind={bind} p={{ kind: 'charm', id: o.id, label: o.label }} on={state.pod.charm === o.id} />)}
              </TrayGroup>
            </>
          )}
          {mode === 'space' && (
            <>
              <TrayGroup title="boards">
                <TrayItem bind={bind} p={{ kind: 'board', id: '4x4', label: 'board 4 × 4', art: 'board-4x4-chalk' }} sub="168 × 168 mm" />
                <TrayItem bind={bind} p={{ kind: 'board', id: '2x4', label: 'board 2 × 4', art: 'board-4x4-chalk' }} sub="84 × 168 mm" />
              </TrayGroup>
              {['shelf', 'hold', 'hang', 'pod', 'tackle'].map((g) => (
                <TrayGroup key={g} title={g === 'hold' ? 'cups and bins' : g === 'hang' ? 'hooks' : g === 'pod' ? 'pods' : g === 'shelf' ? 'shelves' : 'tackle'}>
                  {SPACE_PIECES.filter((p) => p.group === g).map((p) => <TrayItem key={p.id} bind={bind} p={{ kind: 'piece', id: p.id, label: p.name, art: PIECE_ART[p.id] ?? null }} sub={`${p.keys.length} key${p.keys.length > 1 ? 's' : ''}`} />)}
                </TrayGroup>
              ))}
            </>
          )}
          {mode === 'ride' && (
            <TrayGroup title="kit">
              {RIDE_KITS.map((k) => <TrayItem key={k.id} bind={bind} p={{ kind: 'ride', id: k.id, label: k.label, art: k.art }} sub={k.zones.map((z) => ZONES.find((q) => q.id === z)?.label).join(' · ')} />)}
            </TrayGroup>
          )}
          {mode === 'day' && (
            <TrayGroup title="things">
              {DAY_ITEMS.map((d) => <TrayItem key={d.handle} bind={bind} p={{ kind: 'day', id: d.handle, label: d.label, art: d.art }} on={state.day.items.includes(d.handle)} />)}
            </TrayGroup>
          )}
        </aside>

        {/* ---------------- where things go ---------------- */}
        <section className="ab-surface" aria-label="Your build">
          {mode === 'pod' && <PodSurface s={state.pod} body={hexOf('pod', c.body)} accent={hexOf('pod', c.accent)} dragging={drag?.payload.kind} />}
          {mode === 'space' && (
            <WallSurface
              s={state.space} body={hexOf('space', c.body)} accent={hexOf('space', c.accent)} bind={bind}
              hover={drag?.payload.kind === 'piece' && hover ? { ...hover, piece: drag.payload.id, uid: drag.payload.uid } : null}
              onRemoveBoard={(k) => setState((s) => ({ ...s, space: prune({ ...s.space, boards: s.space.boards.filter((_, n) => n !== k) }) }))}
              onRemove={(uid) => setState((s) => ({ ...s, space: { ...s.space, placed: s.space.placed.filter((q) => q.uid !== uid) } }))}
            />
          )}
          {mode === 'ride' && (
            <RideSurface s={state.ride} body={hexOf('ride', c.body)} active={zone} onPick={setZone} dragging={drag?.payload.kind === 'ride' ? drag.payload.id : null}
              onRemove={(z) => setState((s) => { const zones = { ...s.ride.zones }; delete zones[z]; return { ...s, ride: { zones } }; })} />
          )}
          {mode === 'day' && (
            <DaySurface s={state.day} focus={dayFocus} onFocus={setDayFocus}
              onDay={(d) => { setState((s) => ({ ...s, day: defaultDay(d) })); setDayFocus(null); }}
              onRemove={(h) => setState((s) => ({ ...s, day: { ...s.day, items: s.day.items.filter((x) => x !== h) } }))} />
          )}
          <p className="ab-note" role="status" aria-live="polite">{note ?? ''}</p>
        </section>

        {/* ---------------- the whole thing, and what it costs ---------------- */}
        <aside className="ab-result" aria-label="Assembled">
          <div className="ab-stage">
            {view && view.parts.length ? (
              <Suspense fallback={<p className="ab-wait">assembling the print files…</p>}>
                <AssemblyPreview3D key={`${mode}-${Math.round(view.reach / 30)}`} view={view} body={hexOf(mode, c.body)} accent={hexOf(mode, c.accent)} text={needsName ? name.trim() : ''} font={mode === 'space' ? null : 'var(--font-dayrally), Fredoka'} stage={mode === 'space' ? '#F5F1F2' : '#FBF6EC'} />
              </Suspense>
            ) : mode === 'day' && dayArt ? (
              <span className="ab-stage-art"><Image src={`/living/alpha/${dayArt}.png`} alt="" fill sizes="360px" /></span>
            ) : (
              <p className="ab-wait">{mode === 'ride' ? 'drop kit on the bike to see it built' : mode === 'day' ? 'pick a thing in the day to see it built' : 'nothing yet'}</p>
            )}
            <span className="ab-stage-tag">{view && view.parts.length ? 'real print files · drag to turn' : mode === 'day' && dayArt ? 'rendered from the print files' : ''}</span>
          </div>
          {mode === 'ride' && (
            <div className="ab-chips">
              {ZONES.filter((z) => state.ride.zones[z.id]).map((z) => <button key={z.id} type="button" className="lv-chip" aria-pressed={zone === z.id} onClick={() => setZone(z.id)}>{z.label}</button>)}
            </div>
          )}

          <div className="ab-colours">
            <Swatches label="colour" mode={mode} value={c.body} onPick={(id) => setColours((x) => ({ ...x, [mode]: { ...x[mode], body: id } }))} />
            <Swatches label={mode === 'space' ? 'boards' : 'accent'} mode={mode} value={c.accent} onPick={(id) => setColours((x) => ({ ...x, [mode]: { ...x[mode], accent: id } }))} />
          </div>
          {needsName && (
            <label className="ab-name">
              <span>name on the lid</span>
              <input value={name} maxLength={10} onChange={(e) => setName(e.target.value.replace(/[^A-Za-z0-9 .'&-]/g, ''))} placeholder="up to 10 letters" />
            </label>
          )}

          <dl className="ab-totals">
            <div className="ab-price"><dt>price</dt><dd>{t.priceNzd ? nzd(t.priceNzd) : '—'}<small>suggested</small></dd></div>
            <div><dt>at your door</dt><dd>{t.jobs ? `${t.days.door[0]}–${t.days.door[1]} days` : '—'}<small>{t.jobs ? `printed in ${t.days.print}, packed in 1` : ''}</small></dd></div>
            <div><dt>print</dt><dd>{t.printHours} h<small>{t.files} files · {t.jobs} jobs</small></dd></div>
            <div><dt>weight</dt><dd>{t.grams} g<small>cost {nzd(t.costNzd)}</small></dd></div>
          </dl>
          <details className="ab-parts">
            <summary>{t.files} print files</summary>
            <ul>{lines.map((l) => <li key={l.id}><span>{l.qty}×</span>{partName(l.id)}</li>)}</ul>
          </details>
          <div className="ab-actions">
            <button type="button" className="lv-btn" onClick={save}>save this build</button>
            <button type="button" className="lv-btn" data-variant="ghost" onClick={copy}>copy</button>
            <button type="button" className="lv-btn" data-variant="ghost" onClick={reset}>start again</button>
          </div>
          <p className="ab-honest">Estimate from the print files, not a quote. {COST_ASSUMPTIONS.printHoursPerDay} print hours a day, NZ Post {COST_ASSUMPTIONS.postDays[0]}–{COST_ASSUMPTIONS.postDays[1]} days. Designed and checked digitally; nothing printed, nothing for sale yet.{mode === 'pod' && <> <Link href={`/living/widget/${state.pod.size === 'wide' ? 'lab-emergency-pack' : `al-pod-${state.pod.size}`}`}>open in the widget</Link></>}</p>
        </aside>
      </div>

      {drag && (
        <div className="ab-ghost" style={{ transform: `translate(${drag.x + 12}px, ${drag.y + 12}px)` }} aria-hidden>
          <Art name={drag.payload.art} />
          <span>{drag.payload.label}</span>
        </div>
      )}
    </div>
  );
}

// =====================================================================================================
function cellAt(svg: SVGSVGElement, x: number, y: number, s: SpaceState): [number, number] | null {
  const r = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const mx = vb.x + ((x - r.left) / r.width) * vb.width;
  const my = vb.y + ((y - r.top) / r.height) * vb.height;
  const wy = ROWS * PITCH - my;
  const i = Math.floor(mx / PITCH), j = Math.floor(wy / PITCH);
  if (i < 0 || j < 0 || i >= wallCols(s.boards) || j >= ROWS) return null;
  return [i, j];
}

type Bind = ReturnType<typeof useDrag>['bind'];

function TrayGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ab-group">
      <h2>{title}</h2>
      <div className="ab-items">{children}</div>
    </div>
  );
}

function TrayItem({ p, bind, on, sub }: { p: DragPayload; bind: Bind; on?: boolean; sub?: string }) {
  return (
    <div role="button" tabIndex={0} className="ab-item" data-compact={p.art === undefined ? 'true' : undefined} aria-pressed={on} {...bind(p)}>
      {p.art !== undefined && <Art name={p.art} />}
      <span className="ab-item-text"><b>{p.label}</b>{sub && <small>{sub}</small>}</span>
    </div>
  );
}

function Swatches({ label, mode, value, onPick }: { label: string; mode: Mode; value: string; onPick: (id: string) => void }) {
  const list = paletteFor(mode);
  return (
    <div className="ab-swatches">
      <span>{label} <i>{list.find((x) => x.id === value)?.name}</i></span>
      <div>
        {list.map((x) => <button key={x.id} type="button" aria-label={x.name} aria-pressed={value === x.id} style={{ background: x.hex }} onClick={() => onPick(x.id)} />)}
      </div>
    </div>
  );
}

// ---------------- my pod: the exploded elevation, each layer a drop slot ----------------
function PodSurface({ s, body, accent, dragging }: { s: PodState; body: string; accent: string; dragging?: string }) {
  const [L, , H] = POD_MM[s.size];
  const k = 2.2, w = L * k, cx = 260;
  const lidY = 28, insY = lidY + 58, baseY = insY + 82, mountY = baseY + H * k + 40;
  const layer = (slot: string, y: number, h: number, fill: string, label: string, sub: string, dashed = false, ww = w) => (
    <g data-drop="pod" data-slot={slot} className="ab-layer" data-hot={dragging === slot ? 'true' : undefined}>
      <rect x={cx - ww / 2} y={y} width={ww} height={h} rx={Math.min(h / 2, 22)} fill={fill} stroke="rgba(36,11,33,0.25)" strokeDasharray={dashed ? '6 6' : undefined} />
      <text x={cx + w / 2 + 18} y={y + h / 2 - 4} className="ab-svg-label">{label}</text>
      <text x={cx + w / 2 + 18} y={y + h / 2 + 14} className="ab-svg-sub">{sub}</text>
    </g>
  );
  const lid = s.lid.split('-').slice(-1)[0];
  const insert = s.insert ? s.insert.split('-').slice(3).join(' ') : 'none';
  const mount = MOUNT_OPTIONS.find((m) => m.id === s.mount);
  const charm = CHARM_OPTIONS.find((c) => c.id === s.charm);
  return (
    <svg viewBox="0 0 680 440" className="ab-pod" data-drop="pod" role="img" aria-label={`A ${s.size} pod, ${lid} lid, ${insert} insert${mount ? `, on a ${mount.label}` : ''}`}>
      {layer('lid', lidY, 11 * k, body, `${lid} lid`, 'drop a lid here')}
      {layer('insert', insY, 25 * k, accent, `${insert} insert`, 'drop an insert here', false, w - 16)}
      {layer('size', baseY, H * k, body, `${s.size} pod`, `${POD_MM[s.size][0]} × ${POD_MM[s.size][1]} mm`)}
      {[-21, 21].map((x) => <circle key={x} cx={cx + x * k} cy={baseY + H * k + 8} r={9} fill="#2A2A2D" />)}
      {layer('mount', mountY, 26, mount ? accent : 'transparent', mount ? mount.label : 'no mount', mount ? mount.line : 'drop a mount here', !mount, w * 0.62)}
      <g data-drop="pod" data-slot="charm" className="ab-layer" data-hot={dragging === 'charm' ? 'true' : undefined}>
        <line x1={cx - w / 2 - 8} y1={baseY + 14} x2={cx - w / 2 - 34} y2={baseY + 52} stroke="rgba(36,11,33,0.35)" strokeWidth={2} />
        <circle cx={cx - w / 2 - 40} cy={baseY + 72} r={22} fill={charm ? accent : 'transparent'} stroke="rgba(36,11,33,0.3)" strokeDasharray={charm ? undefined : '5 5'} />
        <text x={cx - w / 2 - 40} y={baseY + 112} textAnchor="middle" className="ab-svg-sub">{charm ? charm.label : 'charm'}</text>
      </g>
      <text x={24} y={430} className="ab-svg-sub">exploded: lid, insert, pod and keys, mount. The 3D on the right is the real files, assembled.</text>
    </svg>
  );
}

// ---------------- my space: boards on the wall, pieces on cells ----------------
function WallSurface({ s, body, accent, bind, hover, onRemove, onRemoveBoard }: {
  s: SpaceState; body: string; accent: string; bind: Bind;
  hover: { i: number; j: number; piece: string; uid?: string } | null;
  onRemove: (uid: string) => void; onRemoveBoard: (k: number) => void;
}) {
  const cols = wallCols(s.boards);
  const W = cols * PITCH, H = ROWS * PITCH;
  const pad = 30;
  const fy = (y: number) => H - y;
  const widths = s.boards.map((b) => (b === '4x4' ? 4 : 2));
  const boards = widths.map((c, k) => ({ k, c, at: widths.slice(0, k).reduce((n, w) => n + w, 0) * PITCH }));
  const preview = hover ? pieceRect(hover.piece, hover.i, hover.j) : null;
  const ok = hover ? canPlace(s, hover.piece, hover.i, hover.j, hover.uid) : false;
  return (
    <div className="ab-wall-wrap">
      <svg viewBox={`${-pad} ${-pad - 50} ${W + 2 * pad} ${H + 2 * pad + 100}`} data-wall data-drop="wall" className="ab-wall" role="img" aria-label={`A wall of ${s.boards.length} boards with ${s.placed.length} pieces`}>
        <rect x={-pad} y={-pad - 50} width={W + 2 * pad} height={H + 2 * pad + 100} fill="transparent" />
        {boards.map(({ k, at, c }) => (
          <g key={k}>
            <rect x={at + 1} y={1} width={c * PITCH - 2} height={H - 2} rx={6} fill={accent} stroke="rgba(36,11,33,0.18)" />
            {Array.from({ length: c * ROWS }, (_, n) => (
              <rect key={n} x={at + (n % c + 0.5) * PITCH - 2} y={fy(((Math.floor(n / c)) + 0.5) * PITCH) - 5} width={4} height={10} rx={2} fill="rgba(36,11,33,0.28)" />
            ))}
          </g>
        ))}
        {s.placed.map((pl) => {
          const r = pieceRect(pl.piece, pl.i, pl.j);
          if (!r) return null;
          const piece = SPACE_PIECES.find((p) => p.id === pl.piece)!;
          return (
            <g key={pl.uid} className="ab-piece" {...bind({ kind: 'piece', id: pl.piece, uid: pl.uid, label: piece.name, art: PIECE_ART[pl.piece] ?? null })} tabIndex={0} role="button" aria-label={`${piece.name}: drag to move, drop on the tray to remove`}
              onDoubleClick={() => onRemove(pl.uid)} opacity={hover?.uid === pl.uid ? 0.35 : 1}>
              <rect x={r.x} y={fy(r.y + r.h)} width={r.w} height={r.h} rx={8} fill={body} stroke="rgba(36,11,33,0.3)" />
              <text x={r.x + r.w / 2} y={fy(r.y + r.h / 2) + 4} textAnchor="middle" className="ab-svg-piece">{piece.name.replace(', ', ' ')}</text>
            </g>
          );
        })}
        {preview && (
          <rect x={preview.x} y={fy(preview.y + preview.h)} width={preview.w} height={preview.h} rx={8} className="ab-preview" data-ok={ok ? 'true' : 'false'} />
        )}
      </svg>
      <div className="ab-board-row">
        {s.boards.map((b, k) => (
          <span key={k} className="ab-board-chip">board {b.replace('x', ' × ')}{s.boards.length > 1 && <button type="button" aria-label={`Remove board ${k + 1}`} onClick={() => onRemoveBoard(k)}>×</button>}</span>
        ))}
        <span className="ab-svg-sub">drag a placed piece to move it · double-click or drop it on the tray to take it off</span>
      </div>
    </div>
  );
}

// ---------------- my ride: zones on any bike ----------------
const ZONE_XY: Record<Zone, [number, number]> = { bar: [520, 92], stem: [470, 146], 'top-tube': [384, 166], 'down-tube': [404, 252], 'seat-post': [290, 124] };
/** where each zone's name and its kit's name sit: [dx, dy, anchor] */
const ZONE_LABEL: Record<Zone, [number, number, 'start' | 'middle' | 'end']> = { bar: [38, -2, 'start'], stem: [38, 18, 'start'], 'top-tube': [0, -40, 'middle'], 'down-tube': [-38, 10, 'end'], 'seat-post': [-38, -6, 'end'] };
function RideSurface({ s, body, active, onPick, dragging, onRemove }: { s: RideState; body: string; active: Zone; onPick: (z: Zone) => void; dragging: string | null; onRemove: (z: Zone) => void }) {
  return (
    <svg viewBox="0 0 680 440" className="ab-ride" role="img" aria-label="A bike with drop spots on the bar, stem, top tube, down tube and seat post">
      <g fill="none" stroke="#240B21" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={0.85}>
        <circle cx={160} cy={318} r={104} strokeWidth={10} opacity={0.5} />
        <circle cx={540} cy={318} r={104} strokeWidth={10} opacity={0.5} />
        <path d="M160 318 L330 322 L300 168 Z" />
        <path d="M300 168 L470 152 L330 322" />
        <path d="M470 152 L540 318" />
        <path d="M300 168 L288 112" />
        <path d="M262 108 L320 108" strokeWidth={10} />
        <path d="M470 152 L482 128 L510 124" />
        <path d="M500 100 L520 112 L508 132" strokeWidth={8} />
      </g>
      {ZONES.map((z) => {
        const [x, y] = ZONE_XY[z.id];
        const kit = RIDE_KITS.find((k) => k.id === s.zones[z.id]);
        const can = dragging ? fits(dragging, z.id) : false;
        return (
          <g key={z.id} data-drop="zone" data-zone={z.id} className="ab-zone" data-can={can ? 'true' : undefined} data-on={active === z.id ? 'true' : undefined} onClick={() => kit && onPick(z.id)}>
            <circle cx={x} cy={y} r={30} />
            {kit ? <rect x={x - 22} y={y - 14} width={44} height={28} rx={9} fill={body} /> : <text x={x} y={y + 5} textAnchor="middle" className="ab-svg-plus">+</text>}
            <text x={x + ZONE_LABEL[z.id][0]} y={y + ZONE_LABEL[z.id][1]} textAnchor={ZONE_LABEL[z.id][2]} className="ab-svg-label">{z.label}</text>
            {kit && <text x={x + ZONE_LABEL[z.id][0]} y={y + ZONE_LABEL[z.id][1] + 17} textAnchor={ZONE_LABEL[z.id][2]} className="ab-svg-sub">{kit.label}</text>}
            {kit && <text x={x + 20} y={y - 20} className="ab-svg-x" role="button" aria-label={`Remove from ${z.label}`} onClick={(e) => { e.stopPropagation(); onRemove(z.id); }}>×</text>}
          </g>
        );
      })}
      <text x={24} y={428} className="ab-svg-sub">any bike: the universal saddle seats tubes from 22 to 45 mm with a strap</text>
    </svg>
  );
}

// ---------------- my day: the day, then the things ----------------
function DaySurface({ s, focus, onFocus, onDay, onRemove }: { s: DayState; focus: string | null; onFocus: (h: string) => void; onDay: (d: DayId) => void; onRemove: (h: string) => void }) {
  const day = DAYS.find((d) => d.id === s.day)!;
  return (
    <div className="ab-day">
      <div className="ab-chips" role="group" aria-label="Which day">
        {DAYS.map((d) => <button key={d.id} type="button" className="lv-chip" aria-pressed={s.day === d.id} onClick={() => onDay(d.id)}>{d.label}</button>)}
      </div>
      <p className="ab-svg-sub">{day.line}</p>
      <div className="ab-bag" data-drop="bag">
        {s.items.length === 0 && <p className="ab-wait">drop things in the day</p>}
        {s.items.map((h) => {
          const item = DAY_ITEMS.find((d) => d.handle === h);
          if (!item) return null;
          return (
            <div key={h} className="ab-bag-item" data-on={focus === h ? 'true' : undefined}>
              <button type="button" className="ab-bag-pick" onClick={() => onFocus(h)}>
                <span className="ab-bag-art">{item.art ? <Image src={`/living/alpha/${item.art}.png`} alt="" fill sizes="160px" /> : null}</span>
                <b>{item.label}</b>
              </button>
              <button type="button" className="ab-bag-x" aria-label={`Take out ${item.label}`} onClick={() => onRemove(h)}>×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
