/**
 * Linda — Assembl DO Linear-style task boards (v0).
 *
 * Persistence is localStorage keyed by signed-in owner id when available,
 * otherwise `device`. This is intentionally not Linear.app sync and not
 * Office/Builder durable jobs (`do_agents`). Those systems track execution
 * receipts; Linda tracks honest human TODOs per DO workstream.
 */

export const LINDA_STORAGE_PREFIX = 'assembl:do:linda:v1';
export const LINDA_VERSION = 1 as const;

export type LindaStatus = 'backlog' | 'todo' | 'doing' | 'blocked' | 'done';
export type LindaPriority = 'p0' | 'p1' | 'p2';

export type LindaIssue = {
  id: string;
  title: string;
  status: LindaStatus;
  priority: LindaPriority;
  notes: string;
  href?: string;
  createdAt: string;
  updatedAt: string;
};

export type LindaBoard = {
  id: string;
  title: string;
  glyph: string;
  /** Live DO surface or related docs for this workstream. */
  href: string;
  issues: LindaIssue[];
};

export type LindaStore = {
  version: typeof LINDA_VERSION;
  boards: LindaBoard[];
  updatedAt: string;
};

export const LINDA_STATUS_ORDER: LindaStatus[] = [
  'doing',
  'todo',
  'blocked',
  'backlog',
  'done',
];

export const LINDA_STATUS_LABEL: Record<LindaStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  doing: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
};

export const LINDA_PRIORITY_LABEL: Record<LindaPriority, string> = {
  p0: 'P0',
  p1: 'P1',
  p2: 'P2',
};

const SEED_AT = '2026-09-16T08:00:00.000Z';

function issue(
  id: string,
  title: string,
  status: LindaStatus,
  priority: LindaPriority,
  notes: string,
  href?: string,
): LindaIssue {
  return {
    id,
    title,
    status,
    priority,
    notes,
    href,
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
  };
}

/** Honest open Assembl DO work as of 16 Sep 2026 — editable in Linda. */
export const LINDA_SEED_BOARDS: LindaBoard[] = [
  {
    id: 'portable-widget',
    title: 'Portable widget',
    glyph: '✦',
    href: '/do/widget',
    issues: [
      issue(
        'pw-ux',
        'Ship friendlier portable UX (D-mark, badge polish)',
        'doing',
        'p0',
        'PR #1302 — clearer D-mark identity, status badge, and companion chrome so the floating DO feels like the same object everywhere.',
        'https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1302',
      ),
      issue(
        'pw-meeting-auth',
        'Surface Meeting auth at the top level of the companion',
        'todo',
        'p0',
        'Meeting DO sign-in should be reachable without digging through nested panels. Part of PR #1302.',
        'https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1302',
      ),
      issue(
        'pw-chrome-cta',
        'Chrome extension download button visible on portable UI',
        'todo',
        'p1',
        'Chrome zip via /api/do/download?format=extension already works — make the CTA obvious on /do/widget and home downloads.',
        '/api/do/download?format=extension',
      ),
      issue(
        'pw-mac-cta',
        'Mac companion download button + working format=mac',
        'blocked',
        'p0',
        'Mac /api/do/download?format=mac currently returns 400 (only extension|embed are accepted). Need API + visible CTA on /do and portable UI.',
        '/api/do/download?format=mac',
      ),
    ],
  },
  {
    id: 'white-label-maker',
    title: 'White-label Task DO Maker',
    glyph: '◇',
    href: '/do/builder',
    issues: [
      issue(
        'wl-pursuit',
        'Pursuit handoff into Task DO Maker',
        'doing',
        'p0',
        'PR #1301 — accept an opportunity brief from Pursuit and open a white-label Task DO Maker flow in Studio.',
        'https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1301',
      ),
      issue(
        'wl-partner',
        'Partner / white-label mode for Task DO Maker',
        'todo',
        'p1',
        'Partner-branded maker path without claiming live partner deployments. Keep Assembl frame + approval boundaries.',
        'https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1301',
      ),
      issue(
        'wl-honesty',
        'Keep maker receipts honest (plan ≠ running agent)',
        'todo',
        'p1',
        'Same boundary as Builder/Office: saving a plan must not mint a fabricated success receipt.',
        '/do/builder',
      ),
    ],
  },
  {
    id: 'household-floor',
    title: 'Household Floor',
    glyph: '⌂',
    href: '/do/household',
    issues: [
      issue(
        'hf-share',
        'Polish public shareable Household Floor template',
        'doing',
        'p0',
        'Scrubbed public template should install cleanly, customise seats, and stay drafts-only for send.',
        '/do/household',
      ),
      issue(
        'hf-browser-seat',
        'Browser seat path for school / council pages',
        'todo',
        'p0',
        'Extension capture with consent + session key wiring. Never send, pay, book or submit forms.',
        '/do/household',
      ),
      issue(
        'hf-evening-board',
        'Evening board run feels living (not inert Office job)',
        'todo',
        'p1',
        'Make the distinction clear: Office holds plans; Household Floor is the living family DO.',
        '/do/household',
      ),
    ],
  },
  {
    id: 'meeting-do',
    title: 'Meeting DO',
    glyph: '◎',
    href: '/do/meetings',
    issues: [
      issue(
        'mt-signin',
        'Clear sign-in path for Meeting DO',
        'todo',
        'p0',
        'Operators need an obvious auth path before voice / prepare features that require a session.',
        '/do/meetings',
      ),
      issue(
        'mt-voice-smoke',
        'Voice smoke path (mic → prepare / transcribe)',
        'todo',
        'p1',
        'Prove microphone consent → transcription/prepare without claiming automated meeting attendance.',
        '/do/meetings',
      ),
    ],
  },
  {
    id: 'connections-mcp',
    title: 'Connections / MCP',
    glyph: '⇄',
    href: '/do/connections',
    issues: [
      issue(
        'cx-composio',
        'Composio / Zapier / Treg env keys wired for connectors',
        'todo',
        'p0',
        'Capability-based connections should fail open with honest status when env keys are missing — never invent connected success.',
        '/do/connections',
      ),
      issue(
        'cx-nz-live',
        'NZ Live pack key gaps surfaced honestly',
        'todo',
        'p1',
        'Show which NZ Live connectors need keys vs which are ready. Link MCP gateway status.',
        '/do/connections#mcp-gateway',
      ),
      issue(
        'cx-gateway',
        'MCP gateway status readable from Connections',
        'doing',
        'p1',
        'Operators should see gateway readiness without digging through docs alone.',
        '/do/connections#mcp-gateway',
      ),
    ],
  },
  {
    id: 'downloads',
    title: 'Downloads',
    glyph: '↓',
    href: '/do',
    issues: [
      issue(
        'dl-chrome',
        'Chrome extension zip works',
        'done',
        'p1',
        'Confirmed: /api/do/download?format=extension returns a zip. Keep CTAs visible on /do.',
        '/api/do/download?format=extension',
      ),
      issue(
        'dl-mac-api',
        'Mac companion download API (format=mac)',
        'blocked',
        'p0',
        'Currently 400 — route only accepts extension|embed. Add Mac package + Content-Disposition, then surface CTAs.',
        '/api/do/download?format=mac',
      ),
      issue(
        'dl-ctas',
        'Visible Chrome + Mac CTAs on /do and portable UI',
        'todo',
        'p1',
        'Home downloads dialog and /do/widget should both offer Chrome zip; Mac once the API exists.',
        '/do',
      ),
    ],
  },
  {
    id: 'linda-meta',
    title: 'DO task manager (Linda)',
    glyph: '☰',
    href: '/do/linda',
    issues: [
      issue(
        'li-v0',
        'Ship Linda v0 — boards per DO, localStorage persist',
        'doing',
        'p0',
        'Linear-inspired lists per workstream. Honest about device/owner local storage — not Linear.app sync.',
        '/do/linda',
      ),
      issue(
        'li-strip',
        'Embed Linda strip (next 3 todos) in widget / Office',
        'todo',
        'p1',
        'Compact “this DO’s next 3” strip for portable widget and Office.',
        '/do/linda',
      ),
      issue(
        'li-durable',
        'Optional later: wire boards to do_agents / receipts',
        'backlog',
        'p2',
        'Only if a persistence path fits without conflating human TODOs with Builder execution jobs. Keep receipts honest.',
        '/do/office',
      ),
    ],
  },
];

type LocalStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function lindaStorageKey(ownerKey: string): string {
  const safe = ownerKey.replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 80) || 'device';
  return `${LINDA_STORAGE_PREFIX}:${safe}`;
}

export function createSeedStore(now = new Date().toISOString()): LindaStore {
  return {
    version: LINDA_VERSION,
    boards: structuredClone(LINDA_SEED_BOARDS),
    updatedAt: now,
  };
}

function isStatus(value: unknown): value is LindaStatus {
  return (
    value === 'backlog' ||
    value === 'todo' ||
    value === 'doing' ||
    value === 'blocked' ||
    value === 'done'
  );
}

function isPriority(value: unknown): value is LindaPriority {
  return value === 'p0' || value === 'p1' || value === 'p2';
}

function parseIssue(raw: unknown): LindaIssue | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== 'string' || typeof item.title !== 'string') return null;
  if (!isStatus(item.status) || !isPriority(item.priority)) return null;
  if (typeof item.notes !== 'string') return null;
  if (typeof item.createdAt !== 'string' || typeof item.updatedAt !== 'string') return null;
  const href = typeof item.href === 'string' ? item.href : undefined;
  return {
    id: item.id.slice(0, 80),
    title: item.title.slice(0, 300),
    status: item.status,
    priority: item.priority,
    notes: item.notes.slice(0, 4_000),
    href: href?.slice(0, 1_000),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function parseBoard(raw: unknown): LindaBoard | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== 'string' || typeof item.title !== 'string') return null;
  if (typeof item.glyph !== 'string' || typeof item.href !== 'string') return null;
  if (!Array.isArray(item.issues)) return null;
  const issues = item.issues.map(parseIssue).filter((issueItem): issueItem is LindaIssue => Boolean(issueItem));
  return {
    id: item.id.slice(0, 80),
    title: item.title.slice(0, 120),
    glyph: item.glyph.slice(0, 8),
    href: item.href.slice(0, 1_000),
    issues: issues.slice(0, 200),
  };
}

/** Merge seed boards the user has never seen into a saved store (additive only). */
export function mergeSeedBoards(store: LindaStore): LindaStore {
  const byId = new Map(store.boards.map((board) => [board.id, board]));
  let changed = false;
  for (const seed of LINDA_SEED_BOARDS) {
    if (!byId.has(seed.id)) {
      byId.set(seed.id, structuredClone(seed));
      changed = true;
    }
  }
  if (!changed) return store;
  const order = LINDA_SEED_BOARDS.map((board) => board.id);
  const boards = [
    ...order.map((id) => byId.get(id)!).filter(Boolean),
    ...[...byId.values()].filter((board) => !order.includes(board.id)),
  ];
  return { ...store, boards, updatedAt: new Date().toISOString() };
}

export function parseLindaStore(raw: unknown): LindaStore | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  if (value.version !== LINDA_VERSION || !Array.isArray(value.boards)) return null;
  if (typeof value.updatedAt !== 'string') return null;
  const boards = value.boards
    .map(parseBoard)
    .filter((board): board is LindaBoard => Boolean(board))
    .slice(0, 40);
  if (!boards.length) return null;
  return mergeSeedBoards({ version: LINDA_VERSION, boards, updatedAt: value.updatedAt });
}

export function readLindaStore(storage: LocalStorageLike, ownerKey: string): LindaStore {
  try {
    const raw = storage.getItem(lindaStorageKey(ownerKey));
    if (!raw || raw.length > 2_000_000) return createSeedStore();
    const parsed = parseLindaStore(JSON.parse(raw) as unknown);
    return parsed ?? createSeedStore();
  } catch {
    return createSeedStore();
  }
}

export function writeLindaStore(
  storage: LocalStorageLike,
  ownerKey: string,
  store: LindaStore,
): LindaStore {
  const next: LindaStore = {
    version: LINDA_VERSION,
    boards: store.boards.slice(0, 40).map((board) => ({
      ...board,
      issues: board.issues.slice(0, 200),
    })),
    updatedAt: new Date().toISOString(),
  };
  storage.setItem(lindaStorageKey(ownerKey), JSON.stringify(next));
  return next;
}

export function resetLindaStore(storage: LocalStorageLike, ownerKey: string): LindaStore {
  const next = createSeedStore();
  return writeLindaStore(storage, ownerKey, next);
}

export function openIssues(issues: LindaIssue[]): LindaIssue[] {
  return issues
    .filter((item) => item.status !== 'done')
    .sort((a, b) => {
      const priority = a.priority.localeCompare(b.priority);
      if (priority !== 0) return priority;
      const status =
        LINDA_STATUS_ORDER.indexOf(a.status) - LINDA_STATUS_ORDER.indexOf(b.status);
      if (status !== 0) return status;
      return a.updatedAt.localeCompare(b.updatedAt);
    });
}

/** Next N open todos for a board — used by the compact Linda strip. */
export function nextOpenTodos(board: LindaBoard | undefined, limit = 3): LindaIssue[] {
  if (!board) return [];
  return openIssues(board.issues).slice(0, Math.max(0, limit));
}

export function findBoard(store: LindaStore, boardId: string): LindaBoard | undefined {
  return store.boards.find((board) => board.id === boardId);
}

export function updateIssue(
  store: LindaStore,
  boardId: string,
  issueId: string,
  patch: Partial<Pick<LindaIssue, 'title' | 'status' | 'priority' | 'notes' | 'href'>>,
  now = new Date().toISOString(),
): LindaStore {
  return {
    ...store,
    updatedAt: now,
    boards: store.boards.map((board) => {
      if (board.id !== boardId) return board;
      return {
        ...board,
        issues: board.issues.map((item) =>
          item.id === issueId ? { ...item, ...patch, updatedAt: now } : item,
        ),
      };
    }),
  };
}

export function addIssue(
  store: LindaStore,
  boardId: string,
  input: { title: string; priority?: LindaPriority; notes?: string; href?: string },
  now = new Date().toISOString(),
): LindaStore {
  const title = input.title.trim().slice(0, 300);
  if (!title) return store;
  const issueItem: LindaIssue = {
    id: `local-${now.replace(/\W/g, '').slice(0, 18)}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    status: 'todo',
    priority: input.priority ?? 'p2',
    notes: (input.notes ?? '').slice(0, 4_000),
    href: input.href?.slice(0, 1_000),
    createdAt: now,
    updatedAt: now,
  };
  return {
    ...store,
    updatedAt: now,
    boards: store.boards.map((board) =>
      board.id === boardId ? { ...board, issues: [issueItem, ...board.issues] } : board,
    ),
  };
}

export function groupIssuesByStatus(issues: LindaIssue[]): Array<{
  status: LindaStatus;
  label: string;
  issues: LindaIssue[];
}> {
  return LINDA_STATUS_ORDER.map((status) => ({
    status,
    label: LINDA_STATUS_LABEL[status],
    issues: issues
      .filter((item) => item.status === status)
      .sort((a, b) => a.priority.localeCompare(b.priority) || a.title.localeCompare(b.title)),
  })).filter((group) => group.issues.length > 0 || statusOpenGroup(group.status));
}

function statusOpenGroup(status: LindaStatus): boolean {
  return status === 'todo' || status === 'doing' || status === 'blocked';
}

export async function resolveLindaOwnerKey(): Promise<{ ownerKey: string; signedIn: boolean }> {
  try {
    if (
      typeof process !== 'undefined' &&
      (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    ) {
      return { ownerKey: 'device', signedIn: false };
    }
    const { createClient } = await import('@/lib/supabase/client');
    const { data } = await createClient().auth.getUser();
    const user = data.user;
    if (user && !user.is_anonymous) {
      return { ownerKey: user.id, signedIn: true };
    }
  } catch {
    // Missing env or auth — device-scoped store is the honest fallback.
  }
  return { ownerKey: 'device', signedIn: false };
}
