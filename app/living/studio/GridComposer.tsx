'use client';

/**
 * assembl / living — the grid composer
 * ------------------------------------
 * An SVG drawn in millimetres on the assembl TURN grid: 42 mm pitch, 168 mm
 * boards (84 mm half boards) butted edge to edge so the grid runs on across
 * them, a Ø13 keyway with vertical lug slots in every cell. Accessories are
 * drawn at their real installed size from the catalogue, so what the
 * customer sees is the geometry the print files carry.
 */

import { BOARD_CELLS, BOARD_MM, INTERFACE_SPEC, PITCH_MM, colourHex, colourInk, gridSize, placementRect, productByHandle, type Field, type Placement, type SpaceDesign } from '@/lib/living';

type Props = {
  design: Pick<SpaceDesign, 'field' | 'placements' | 'boardColour' | 'accessoryColour'> & { name?: string };
  interactive?: boolean;
  tool?: string | null;
  selected?: string | null;
  onCell?: (col: number, row: number) => void;
  onSelect?: (placementId: string) => void;
  className?: string;
  title?: string;
};

export function cellOrigin(col: number, row: number): { x: number; y: number } {
  return { x: col * PITCH_MM, y: row * PITCH_MM };
}

export function fieldSize(field: Field): { w: number; h: number } {
  return { w: field.columns.reduce((s, c) => s + c, 0) * PITCH_MM, h: field.rows * BOARD_MM };
}

/** Boards in the field, in mm. */
export function boards(field: Field): { x: number; y: number; w: number; h: number; cols: number }[] {
  const out: { x: number; y: number; w: number; h: number; cols: number }[] = [];
  for (let r = 0; r < field.rows; r++) {
    let x = 0;
    for (const c of field.columns) {
      out.push({ x, y: r * BOARD_MM, w: c * PITCH_MM, h: BOARD_MM, cols: c });
      x += c * PITCH_MM;
    }
  }
  return out;
}

/** Installed width × height (mm) of each accessory kind, from the catalogue sizes, for drawing. */
const DRAW: Record<string, { w: number; h: number; dy?: number }> = {
  hook: { w: 26, h: 73, dy: -16 },
  cradle: { w: 26, h: 73, dy: -16 },
  shelf: { w: 0, h: 56, dy: -16 },
  bin: { w: 0, h: 76, dy: -16 },
  cup: { w: 40, h: 104, dy: -16 },
  garage: { w: 118, h: 104, dy: -16 },
  plate: { w: 168, h: 40, dy: 1 },
};

function Glyph({ placement, accent, ink, name }: { placement: Placement; accent: string; ink: string; name?: string }) {
  const product = productByHandle(placement.handle);
  const rect = placementRect(placement);
  if (!product?.footprint || !rect) return null;
  const { x, y } = cellOrigin(placement.col, placement.row);
  const cellsW = product.footprint.cols * PITCH_MM;
  const spec = DRAW[product.kind] ?? { w: cellsW, h: product.footprint.rows * PITCH_MM };
  const w = spec.w || cellsW - 8;
  const cx = x + cellsW / 2;
  const top = y + (spec.dy ?? 0) + 4;
  const stroke = 'rgba(36, 11, 33, 0.28)';
  switch (product.kind) {
    case 'hook':
    case 'cradle':
      return (
        <>
          <rect x={cx - w / 2} y={top} width={w} height={spec.h} rx={5} fill={accent} stroke={stroke} />
          {product.kind === 'hook' ? (
            <rect x={cx - 5} y={top + spec.h - 20} width={10} height={14} rx={2} fill={ink} opacity={0.5} />
          ) : (
            <circle cx={cx} cy={top + spec.h - 20} r={9} fill="none" stroke={ink} strokeWidth={3} opacity={0.55} />
          )}
        </>
      );
    case 'shelf':
      return (
        <>
          <rect x={x + 2} y={top} width={cellsW - 4} height={32} rx={4} fill={accent} opacity={0.7} stroke={stroke} />
          <rect x={x + 2} y={top + 36} width={cellsW - 4} height={16} rx={3} fill={accent} stroke={stroke} />
        </>
      );
    case 'bin':
      return (
        <>
          <rect x={x + 2} y={top} width={cellsW - 4} height={spec.h} rx={7} fill={accent} stroke={stroke} />
          <rect x={x + 6} y={top + 6} width={cellsW - 12} height={10} rx={3} fill={ink} opacity={0.3} />
        </>
      );
    case 'cup':
      return (
        <>
          <rect x={cx - w / 2} y={top} width={w} height={spec.h} rx={9} fill={accent} stroke={stroke} />
          <ellipse cx={cx} cy={top + 32} rx={w / 2 - 4} ry={5} fill={ink} opacity={0.3} />
        </>
      );
    case 'garage':
      return (
        <>
          <rect x={cx - w / 2} y={top} width={w} height={spec.h} rx={7} fill={accent} stroke={stroke} />
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={cx - w / 2 + 10 + i * 9.8} y1={top + 30} x2={cx - w / 2 + 10 + i * 9.8} y2={top + spec.h - 8} stroke={ink} strokeWidth={1.2} opacity={0.35} />
          ))}
        </>
      );
    case 'plate':
      return (
        <>
          <rect x={cx - w / 2} y={y + 1} width={w} height={spec.h} rx={10} fill={accent} stroke={stroke} />
          <text x={cx} y={y + 27} textAnchor="middle" fontSize={17} fontWeight={600} fontFamily="var(--font-body), 'Instrument Sans', sans-serif" fill={ink} letterSpacing={1}>
            {name ?? 'NAME'}
          </text>
        </>
      );
    default:
      return <rect x={x} y={y} width={cellsW} height={product.footprint.rows * PITCH_MM} rx={3} fill={accent} stroke={stroke} />;
  }
}

export function GridComposer({ design, interactive = false, tool, selected, onCell, onSelect, className, title }: Props) {
  const { w, h } = fieldSize(design.field);
  const { cols, rows } = gridSize(design);
  const board = colourHex(design.boardColour);
  const boardInk = colourInk(design.boardColour);
  const accent = colourHex(design.accessoryColour);
  const accentInk = colourInk(design.accessoryColour);
  const dark = boardInk === '#FFFDFB';
  const keyway = dark ? 'rgba(255, 253, 251, 0.28)' : 'rgba(36, 11, 33, 0.3)';
  const pad = 14;
  const bore = INTERFACE_SPEC.keyway_bore_mm / 2;

  const cells: { col: number; row: number }[] = [];
  if (interactive && tool) {
    const occupied = new Set<string>();
    for (const pl of design.placements) {
      const rect = placementRect(pl);
      if (!rect) continue;
      for (let r = rect.r0; r <= rect.r1; r++) for (let c = rect.c0; c <= rect.c1; c++) occupied.add(`${c}:${r}`);
    }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!occupied.has(`${c}:${r}`)) cells.push({ col: c, row: r });
  }

  return (
    <div className={['lv-composer', className].filter(Boolean).join(' ')}>
      <svg viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`} role="img" aria-label={title ?? 'Board layout'}>
        {boards(design.field).map((b, i) => (
          <g key={i}>
            <rect x={b.x + 0.5} y={b.y + 0.5} width={b.w - 1} height={b.h - 1} rx={6} fill={board} stroke="rgba(36, 11, 33, 0.22)" />
            {Array.from({ length: b.cols * BOARD_CELLS }, (_, k) => {
              const c = k % b.cols;
              const r = Math.floor(k / b.cols);
              const kx = b.x + c * PITCH_MM + PITCH_MM / 2;
              const ky = b.y + r * PITCH_MM + PITCH_MM / 2;
              return (
                <g key={k}>
                  <circle cx={kx} cy={ky} r={bore} fill={keyway} />
                  <rect x={kx - INTERFACE_SPEC.lug_slot_mm / 2} y={ky - 9.8} width={INTERFACE_SPEC.lug_slot_mm} height={19.6} rx={2} fill={keyway} />
                </g>
              );
            })}
          </g>
        ))}
        {design.placements.map((pl) => (
          <g
            key={pl.id}
            className="lv-part"
            data-selected={selected === pl.id ? 'true' : 'false'}
            onClick={interactive ? () => onSelect?.(pl.id) : undefined}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(pl.id); } } : undefined}
            aria-label={interactive ? `${productByHandle(pl.handle)?.title ?? pl.handle} at column ${pl.col + 1}, row ${pl.row + 1}` : undefined}
          >
            <Glyph placement={pl} accent={accent} ink={accentInk} name={design.name} />
          </g>
        ))}
        {cells.map(({ col, row }) => {
          const { x, y } = cellOrigin(col, row);
          return <rect key={`${col}-${row}`} className="lv-cell" x={x} y={y} width={PITCH_MM} height={PITCH_MM} onClick={() => onCell?.(col, row)} aria-label={`Place at column ${col + 1}, row ${row + 1}`} />;
        })}
      </svg>
    </div>
  );
}
