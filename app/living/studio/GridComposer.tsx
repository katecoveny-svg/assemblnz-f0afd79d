'use client';

/**
 * assembl / living — the grid composer
 * ------------------------------------
 * An SVG drawn in millimetres. Panels, holes and accessories are placed at
 * their real dimensions on the 24 mm interface, so what the customer sees is
 * the same geometry the CAD exports. Click a cell to place the selected
 * accessory; click a part to select it.
 */

import {
  COLOURWAY_SWATCHES,
  INTERFACE_SPEC,
  PANEL_CELLS,
  PANEL_GAP_MM,
  PANEL_SIZE_MM,
  gridSize,
  partById,
  placementRect,
  type Placement,
  type SpaceDesign,
} from '@/lib/living';

type Props = {
  design: Pick<SpaceDesign, 'panels' | 'placements' | 'panelColour' | 'accentColour'>;
  interactive?: boolean;
  tool?: string | null;
  selected?: string | null;
  onCell?: (col: number, row: number) => void;
  onSelect?: (placementId: string) => void;
  className?: string;
  title?: string;
};

const PITCH = INTERFACE_SPEC.pitch_mm;

/** Millimetre origin of a grid cell, accounting for the gap between panels. */
export function cellOrigin(col: number, row: number): { x: number; y: number } {
  const pc = Math.floor(col / PANEL_CELLS);
  const pr = Math.floor(row / PANEL_CELLS);
  return {
    x: pc * (PANEL_SIZE_MM + PANEL_GAP_MM) + (col % PANEL_CELLS) * PITCH,
    y: pr * (PANEL_SIZE_MM + PANEL_GAP_MM) + (row % PANEL_CELLS) * PITCH,
  };
}

export function fieldSize(panels: SpaceDesign['panels']): { w: number; h: number } {
  return {
    w: panels.cols * PANEL_SIZE_MM + (panels.cols - 1) * PANEL_GAP_MM,
    h: panels.rows * PANEL_SIZE_MM + (panels.rows - 1) * PANEL_GAP_MM,
  };
}

function Glyph({ placement, accent, ink }: { placement: Placement; accent: string; ink: string }) {
  const part = partById(placement.partId);
  const rect = placementRect(placement);
  if (!part || !rect) return null;
  const { x, y } = cellOrigin(placement.col, placement.row);
  const w = part.footprint!.cols * PITCH;
  const h = part.footprint!.rows * PITCH;
  const stroke = 'rgba(36, 11, 33, 0.25)';
  switch (part.kind) {
    case 'hook':
      return (
        <>
          <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx={3} fill={accent} stroke={stroke} />
          <rect x={x + 8} y={y + h - 14} width={8} height={10} rx={1.5} fill={ink} opacity={0.55} />
        </>
      );
    case 'ledge':
      return (
        <>
          <rect x={x} y={y} width={w} height={h - 18} rx={3} fill={accent} opacity={0.75} stroke={stroke} />
          <rect x={x} y={y + h - 16} width={w} height={14} rx={2} fill={accent} stroke={stroke} />
        </>
      );
    case 'cup':
      return (
        <>
          <rect x={x} y={y + 1} width={w} height={h - 2} rx={9} fill={accent} stroke={stroke} />
          <ellipse cx={x + w / 2} cy={y + 8} rx={w / 2 - 3} ry={4.5} fill={ink} opacity={0.35} />
        </>
      );
    default:
      return <rect x={x} y={y} width={w} height={h} rx={3} fill={accent} stroke={stroke} />;
  }
}

export function GridComposer({ design, interactive = false, tool, selected, onCell, onSelect, className, title }: Props) {
  const { w, h } = fieldSize(design.panels);
  const { cols, rows } = gridSize(design);
  const panel = COLOURWAY_SWATCHES[design.panelColour];
  const accent = COLOURWAY_SWATCHES[design.accentColour];
  const darkPanel = panel.ink === '#FFFDFB';
  const hole = darkPanel ? 'rgba(255, 253, 251, 0.22)' : 'rgba(36, 11, 33, 0.26)';
  const pad = 12;

  const panels: { x: number; y: number }[] = [];
  for (let pr = 0; pr < design.panels.rows; pr++) {
    for (let pc = 0; pc < design.panels.cols; pc++) {
      panels.push({ x: pc * (PANEL_SIZE_MM + PANEL_GAP_MM), y: pr * (PANEL_SIZE_MM + PANEL_GAP_MM) });
    }
  }

  // Overlay only the empty cells so placed parts stay clickable while a tool is active.
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
      <svg viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`} role="img" aria-label={title ?? 'Panel layout'}>
        {panels.map((p, i) => (
          <g key={i}>
            <rect x={p.x} y={p.y} width={PANEL_SIZE_MM} height={PANEL_SIZE_MM} rx={8} fill={panel.hex} stroke="rgba(36, 11, 33, 0.18)" />
            {Array.from({ length: PANEL_CELLS * PANEL_CELLS }, (_, k) => {
              const c = k % PANEL_CELLS;
              const r = Math.floor(k / PANEL_CELLS);
              return <circle key={k} cx={p.x + c * PITCH + PITCH / 2} cy={p.y + r * PITCH + PITCH / 2} r={INTERFACE_SPEC.hole_mm / 2} fill={hole} />;
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
            aria-label={interactive ? `${partById(pl.partId)?.name ?? pl.partId} at column ${pl.col + 1}, row ${pl.row + 1}` : undefined}
          >
            <Glyph placement={pl} accent={accent.hex} ink={accent.ink} />
          </g>
        ))}
        {cells.map(({ col, row }) => {
          const { x, y } = cellOrigin(col, row);
          return (
            <rect
              key={`${col}-${row}`}
              className="lv-cell"
              x={x}
              y={y}
              width={PITCH}
              height={PITCH}
              onClick={() => onCell?.(col, row)}
              aria-label={`Place at column ${col + 1}, row ${row + 1}`}
            />
          );
        })}
      </svg>
    </div>
  );
}
