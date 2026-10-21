/**
 * assembl / living — assembled views
 * ----------------------------------
 * `assemblies.json` (from tools/living-cad/cad/assemblies.py) describes, per widget handle, one or more views: a list
 * of slots, each a print file placed in the assembled frame by a 4 × 4 matrix applied to the served STL, with a colour
 * role and an explode offset. A slot that names a prefix is filled by whichever of the widget's chosen parts starts
 * with it, so the lid and insert the customer picks are the ones on screen. The customer's own lettering is drawn at
 * a text slot; a sample name in a file is never shown.
 */

import raw from './assemblies.json';
import { printFile } from './catalogue';

export type SlotRole = 'body' | 'accent' | 'fixed' | 'prop';
export type TextArea = { w: number; h: number; z: number; y?: number };
export type Slot = { id?: string; prefix?: string; matrix: number[]; role: SlotRole; explode: number[]; text?: TextArea };
export type View = { name: string; slots: Slot[]; reach: number };
export type PlacedPart = { partId: string; path: string; matrix: number[]; role: SlotRole; explode: number[]; text?: TextArea };
export type ResolvedView = { name: string; reach: number; parts: PlacedPart[]; texts: { matrix: number[]; area: TextArea }[] };

const ASSEMBLIES = raw as { frame: string; handles: Record<string, { views: View[] }> };

export function hasAssembly(handle: string): boolean {
  return Boolean(ASSEMBLIES.handles[handle]);
}

/** Matches a prefix slot: `dr2-lid-standard-` takes any lid that is not an inlay; `dr2-lid-standard-*-inlay` takes the inlay. */
function matches(slot: Slot, id: string): boolean {
  if (slot.id) return slot.id === id;
  const p = slot.prefix!;
  if (p.endsWith('*-inlay')) return id.startsWith(p.slice(0, -7)) && id.endsWith('-inlay');
  return id.startsWith(p) && !id.endsWith('-inlay');
}

/** The sample-free file for a name part: `dr2-lid-standard-name` → `-plain`; `pk-lid-wide-card-name` → `pk-lid-wide-card`. */
function plainFor(id: string): string {
  for (const candidate of [id.replace(/-name$/, '-plain'), id.replace(/-name$/, '')]) {
    try {
      if (printFile(candidate).file) return candidate;
    } catch {
      /* not a print file */
    }
  }
  return id;
}

/**
 * The views for a handle, filled from the parts the widget chose. Fixed and prop slots are always placed; a prefix
 * slot is placed once per matching chosen part (so two keys are two placements). A text slot whose part is a name
 * inlay becomes a text area instead of a mesh.
 */
export function assemblyViews(handle: string, partIds: string[]): ResolvedView[] {
  const entry = ASSEMBLIES.handles[handle];
  if (!entry) return [];
  return entry.views.map((v) => {
    const parts: PlacedPart[] = [];
    const texts: { matrix: number[]; area: TextArea }[] = [];
    for (const s of v.slots) {
      const ids = s.id ? [s.id] : partIds.filter((id) => matches(s, id));
      for (const chosenId of [...new Set(ids)]) {
        const isName = /-name(-inlay|-pattern|-text)?$/.test(chosenId) || /-text$/.test(chosenId);
        if (s.text && isName && /-(inlay|pattern|text)$/.test(chosenId)) {
          texts.push({ matrix: s.matrix, area: s.text });
          continue;
        }
        // a name part's file carries a sample name: show the plain file for the body and draw the customer's own name
        const partId = isName ? plainFor(chosenId) : chosenId;
        const f = printFile(partId);
        if (!f.file) continue;
        parts.push({ partId, path: f.file.path, matrix: s.matrix, role: s.role, explode: s.explode, text: s.text });
      }
    }
    return { name: v.name, reach: v.reach, parts, texts };
  });
}
