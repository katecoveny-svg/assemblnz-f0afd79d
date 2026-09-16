/**
 * Per-DO in-product task lists (v0).
 *
 * One board per DO / workstream. Persist in localStorage keyed by signed-in
 * owner id when available, otherwise `device`. Not Linear.app sync and not
 * Office/Builder durable jobs (`do_agents`) — those track execution receipts;
 * these lists track honest human TODOs on each DO surface.
 */

export const DO_TASKS_STORAGE_PREFIX = 'assembl:do:tasks:v1';
/** Legacy key from the short-lived misnamed experiment — read once for migration. */
const LEGACY_STORAGE_PREFIX = 'assembl:do:linda:v1';
export const DO_TASKS_VERSION = 1 as const;

export type DoTaskStatus = 'backlog' | 'todo' | 'doing' | 'blocked' | 'done';
export type DoTaskPriority = 'p0' | 'p1' | 'p2';

export type DoTask = {
  id: string;
  title: string;
  status: DoTaskStatus;
  priority: DoTaskPriority;
  notes: string;
  href?: string;
  createdAt: string;
  updatedAt: string;
};

export type DoTaskBoard = {
  id: string;
  title: string;
  glyph: string;
  /** Live DO surface for this workstream. */
  href: string;
  issues: DoTask[];
};

export type DoTaskStore = {
  version: typeof DO_TASKS_VERSION;
  boards: DoTaskBoard[];
  updatedAt: string;
};

export const DO_TASK_STATUS_ORDER: DoTaskStatus[] = [
  'doing',
  'todo',
  'blocked',
  'backlog',
  'done',
];

export const DO_TASK_STATUS_LABEL: Record<DoTaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  doing: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
};

export const DO_TASK_PRIORITY_LABEL: Record<DoTaskPriority, string> = {
  p0: 'P0',
  p1: 'P1',
  p2: 'P2',
};

const SEED_AT = '2026-09-16T08:00:00.000Z';

function task(
  id: string,
  title: string,
  status: DoTaskStatus,
  priority: DoTaskPriority,
  notes: string,
  href?: string,
): DoTask {
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

/**
 * Public demo seed boards — fictional product-demo tasks only.
 * Do not seed personal operator backlogs, private PR URLs or real household work.
 */
export const DO_TASK_SEED_BOARDS: DoTaskBoard[] = [
  {
    id: 'portable-widget',
    title: 'Portable widget',
    glyph: '✦',
    href: '/do/widget',
    issues: [
      task(
        'pw-ux',
        'Polish the portable companion mark and status badge',
        'doing',
        'p0',
        'Demo board: keep the D-mark and status chip readable on a small surface.',
        '/do/widget',
      ),
      task(
        'pw-meeting-auth',
        'Show meeting sign-in near the top of the companion',
        'todo',
        'p0',
        'Demo board: auth should be obvious before voice or prepare features.',
        '/do/meetings',
      ),
      task(
        'pw-chrome-cta',
        'Chrome extension download visible on portable UI',
        'done',
        'p1',
        'Demo board: download CTA points at the public extension path.',
        '/api/do/download?format=extension',
      ),
      task(
        'pw-mac-cta',
        'Mac companion download + working format=mac',
        'done',
        'p0',
        'Demo board: format=mac serves the public Mac companion zip.',
        '/api/do/download?format=mac',
      ),
    ],
  },
  {
    id: 'builder',
    title: 'Builder DO',
    glyph: '⌘',
    href: '/do/builder',
    issues: [
      task(
        'wl-pursuit',
        'Hand a Pursuit brief into Task DO Maker',
        'doing',
        'p0',
        'Demo board: accept a sample opportunity brief into a maker flow.',
        '/do/builder',
      ),
      task(
        'wl-partner',
        'Partner / white-label mode for Task DO Maker',
        'todo',
        'p1',
        'Demo board: partner-branded maker path without claiming live partner deployments.',
        '/do/builder',
      ),
      task(
        'wl-honesty',
        'Keep builder receipts honest (plan ≠ running agent)',
        'todo',
        'p1',
        'Demo board: saving a plan must not mint a fabricated success receipt.',
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
      task(
        'hf-share',
        'Polish public shareable Household Floor template',
        'doing',
        'p0',
        'Scrubbed public template should install cleanly and stay drafts-only for send.',
        '/do/household',
      ),
      task(
        'hf-browser-seat',
        'Browser seat path for school / council pages',
        'todo',
        'p0',
        'Extension capture with consent + session key. Never send, pay, book or submit forms.',
        '/do/household',
      ),
      task(
        'hf-evening-board',
        'Evening board run feels living (not inert Office job)',
        'todo',
        'p1',
        'Office holds plans; Household Floor is the living family DO.',
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
      task(
        'mt-signin',
        'Clear sign-in path for Meeting DO',
        'todo',
        'p0',
        'Demo: an obvious auth path helps before voice / prepare features that require a session.',
        '/do/meetings',
      ),
      task(
        'mt-voice-smoke',
        'Voice smoke path (mic → prepare / transcribe)',
        'todo',
        'p1',
        'Prove microphone consent → transcription/prepare without claiming automated attendance.',
        '/do/meetings',
      ),
    ],
  },
  {
    id: 'writing',
    title: 'Writing DO',
    glyph: '✦',
    href: '/do?task=rewrite&open=1',
    issues: [
      task(
        'wr-voice',
        'Keep rewrite drafts sounding like the person',
        'todo',
        'p1',
        'Polish without inventing claims; review before handoff.',
        '/do?task=rewrite&open=1',
      ),
      task(
        'wr-receipt',
        'Show preparation receipt after rewrite',
        'todo',
        'p2',
        'Evidence stays visible on the shared workspace.',
        '/do?task=rewrite&open=1',
      ),
    ],
  },
  {
    id: 'personal',
    title: 'Personal DO',
    glyph: '◎',
    href: '/do?task=plan&open=1',
    issues: [
      task(
        'pe-plan',
        'Turn chosen notes into an editable plan',
        'todo',
        'p1',
        'Plan skill only — no silent calendar or send actions.',
        '/do?task=plan&open=1',
      ),
      task(
        'pe-scope',
        'Keep personal context scoped (not one giant prompt)',
        'backlog',
        'p2',
        'Personal / work / client scopes stay separate.',
        '/do',
      ),
    ],
  },
  {
    id: 'connections-mcp',
    title: 'Connections / MCP',
    glyph: '⇄',
    href: '/do/connections',
    issues: [
      task(
        'cx-composio',
        'Demo connectors show honest missing-key status',
        'todo',
        'p0',
        'Demo: fail open with honest status when keys are missing.',
        '/do/connections',
      ),
      task(
        'cx-nz-live',
        'NZ Live pack key gaps surfaced honestly',
        'todo',
        'p1',
        'Show which NZ Live connectors need keys vs which are ready.',
        '/do/connections#mcp-gateway',
      ),
      task(
        'cx-gateway',
        'MCP gateway status readable from Connections',
        'doing',
        'p1',
        'Demo: gateway readiness should be visible without digging through docs alone.',
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
      task(
        'dl-chrome',
        'Chrome extension zip works',
        'done',
        'p1',
        'Confirmed: /api/do/download?format=extension returns a zip.',
        '/api/do/download?format=extension',
      ),
      task(
        'dl-mac-api',
        'Mac companion download API (format=mac)',
        'done',
        'p0',
        'format=mac / macos / mac-companion serve DO-mac-companion.zip of apps/do/macos.',
        '/api/do/download?format=mac',
      ),
      task(
        'dl-ctas',
        'Visible Chrome + Mac CTAs on /do and portable UI',
        'done',
        'p1',
        'Banner + dialog + Glow + side panel use Download Chrome DO / Download Mac DO.',
        '/do',
      ),
    ],
  },
  {
    id: 'office',
    title: 'DO Office',
    glyph: '☰',
    href: '/do/office',
    issues: [
      task(
        'of-per-do',
        'Keep a to-do panel on each major DO surface',
        'doing',
        'p0',
        'Household, Meetings, Builder, Office, companion — per-DO lists, not one named meta product.',
        '/do/office',
      ),
      task(
        'of-rollup',
        'Optional /do/tasks rollup across workstreams',
        'todo',
        'p1',
        'Useful overview only — primary UX stays on each DO page.',
        '/do/tasks',
      ),
      task(
        'of-durable',
        'Optional later: wire lists to do_agents / receipts',
        'backlog',
        'p2',
        'Only if persistence fits without conflating human TODOs with Builder execution jobs.',
        '/do/office',
      ),
    ],
  },
];

type LocalStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function doTasksStorageKey(ownerKey: string): string {
  const safe = ownerKey.replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 80) || 'device';
  return `${DO_TASKS_STORAGE_PREFIX}:${safe}`;
}

function legacyStorageKey(ownerKey: string): string {
  const safe = ownerKey.replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 80) || 'device';
  return `${LEGACY_STORAGE_PREFIX}:${safe}`;
}

/** Map legacy board ids from the short-lived experiment onto current ids. */
function normalizeBoardId(id: string): string {
  if (id === 'linda-meta') return 'office';
  if (id === 'white-label-maker') return 'builder';
  return id;
}

export function createSeedStore(now = new Date().toISOString()): DoTaskStore {
  return {
    version: DO_TASKS_VERSION,
    boards: structuredClone(DO_TASK_SEED_BOARDS),
    updatedAt: now,
  };
}

function isStatus(value: unknown): value is DoTaskStatus {
  return (
    value === 'backlog' ||
    value === 'todo' ||
    value === 'doing' ||
    value === 'blocked' ||
    value === 'done'
  );
}

function isPriority(value: unknown): value is DoTaskPriority {
  return value === 'p0' || value === 'p1' || value === 'p2';
}

function parseIssue(raw: unknown): DoTask | null {
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

function parseBoard(raw: unknown): DoTaskBoard | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== 'string' || typeof item.title !== 'string') return null;
  if (typeof item.glyph !== 'string' || typeof item.href !== 'string') return null;
  if (!Array.isArray(item.issues)) return null;
  const issues = item.issues
    .map(parseIssue)
    .filter((issueItem): issueItem is DoTask => Boolean(issueItem));
  const id = normalizeBoardId(item.id).slice(0, 80);
  const seed = DO_TASK_SEED_BOARDS.find((board) => board.id === id);
  return {
    id,
    title: (seed?.title ?? item.title).slice(0, 120),
    glyph: (seed?.glyph ?? item.glyph).slice(0, 8),
    href: (seed?.href ?? item.href).slice(0, 1_000),
    issues: issues.slice(0, 200),
  };
}

/** Merge seed boards the user has never seen into a saved store (additive only). */
export function mergeSeedBoards(store: DoTaskStore): DoTaskStore {
  const byId = new Map(store.boards.map((board) => [board.id, board]));
  let changed = false;
  for (const seed of DO_TASK_SEED_BOARDS) {
    if (!byId.has(seed.id)) {
      byId.set(seed.id, structuredClone(seed));
      changed = true;
    }
  }
  if (!changed) return store;
  const order = DO_TASK_SEED_BOARDS.map((board) => board.id);
  const boards = [
    ...order.map((id) => byId.get(id)!).filter(Boolean),
    ...[...byId.values()].filter((board) => !order.includes(board.id)),
  ];
  return { ...store, boards, updatedAt: new Date().toISOString() };
}

export function parseDoTaskStore(raw: unknown): DoTaskStore | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  if (value.version !== DO_TASKS_VERSION || !Array.isArray(value.boards)) return null;
  if (typeof value.updatedAt !== 'string') return null;
  const boards = value.boards
    .map(parseBoard)
    .filter((board): board is DoTaskBoard => Boolean(board))
    .slice(0, 40);
  if (!boards.length) return null;
  // Dedupe after legacy id remaps (e.g. linda-meta → office).
  const seen = new Set<string>();
  const deduped: DoTaskBoard[] = [];
  for (const board of boards) {
    if (seen.has(board.id)) continue;
    seen.add(board.id);
    deduped.push(board);
  }
  return mergeSeedBoards({ version: DO_TASKS_VERSION, boards: deduped, updatedAt: value.updatedAt });
}

export function readDoTaskStore(storage: LocalStorageLike, ownerKey: string): DoTaskStore {
  try {
    const key = doTasksStorageKey(ownerKey);
    let raw = storage.getItem(key);
    if (!raw) {
      const legacy = storage.getItem(legacyStorageKey(ownerKey));
      if (legacy) {
        raw = legacy;
        storage.setItem(key, legacy);
        storage.removeItem(legacyStorageKey(ownerKey));
      }
    }
    if (!raw || raw.length > 2_000_000) return createSeedStore();
    const parsed = parseDoTaskStore(JSON.parse(raw) as unknown);
    return parsed ?? createSeedStore();
  } catch {
    return createSeedStore();
  }
}

export function writeDoTaskStore(
  storage: LocalStorageLike,
  ownerKey: string,
  store: DoTaskStore,
): DoTaskStore {
  const next: DoTaskStore = {
    version: DO_TASKS_VERSION,
    boards: store.boards.slice(0, 40).map((board) => ({
      ...board,
      issues: board.issues.slice(0, 200),
    })),
    updatedAt: new Date().toISOString(),
  };
  storage.setItem(doTasksStorageKey(ownerKey), JSON.stringify(next));
  return next;
}

export function resetDoTaskStore(storage: LocalStorageLike, ownerKey: string): DoTaskStore {
  return writeDoTaskStore(storage, ownerKey, createSeedStore());
}

export function openIssues(issues: DoTask[]): DoTask[] {
  return issues
    .filter((item) => item.status !== 'done')
    .sort((a, b) => {
      const priority = a.priority.localeCompare(b.priority);
      if (priority !== 0) return priority;
      const status =
        DO_TASK_STATUS_ORDER.indexOf(a.status) - DO_TASK_STATUS_ORDER.indexOf(b.status);
      if (status !== 0) return status;
      return a.updatedAt.localeCompare(b.updatedAt);
    });
}

export function nextOpenTodos(board: DoTaskBoard | undefined, limit = 3): DoTask[] {
  if (!board) return [];
  return openIssues(board.issues).slice(0, Math.max(0, limit));
}

export function findBoard(store: DoTaskStore, boardId: string): DoTaskBoard | undefined {
  return store.boards.find((board) => board.id === normalizeBoardId(boardId));
}

export function updateIssue(
  store: DoTaskStore,
  boardId: string,
  issueId: string,
  patch: Partial<Pick<DoTask, 'title' | 'status' | 'priority' | 'notes' | 'href'>>,
  now = new Date().toISOString(),
): DoTaskStore {
  const id = normalizeBoardId(boardId);
  return {
    ...store,
    updatedAt: now,
    boards: store.boards.map((board) => {
      if (board.id !== id) return board;
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
  store: DoTaskStore,
  boardId: string,
  input: { title: string; priority?: DoTaskPriority; notes?: string; href?: string },
  now = new Date().toISOString(),
): DoTaskStore {
  const title = input.title.trim().slice(0, 300);
  if (!title) return store;
  const id = normalizeBoardId(boardId);
  const issueItem: DoTask = {
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
      board.id === id ? { ...board, issues: [issueItem, ...board.issues] } : board,
    ),
  };
}

export function groupIssuesByStatus(issues: DoTask[]): Array<{
  status: DoTaskStatus;
  label: string;
  issues: DoTask[];
}> {
  return DO_TASK_STATUS_ORDER.map((status) => ({
    status,
    label: DO_TASK_STATUS_LABEL[status],
    issues: issues
      .filter((item) => item.status === status)
      .sort((a, b) => a.priority.localeCompare(b.priority) || a.title.localeCompare(b.title)),
  })).filter((group) => group.issues.length > 0 || statusOpenGroup(group.status));
}

function statusOpenGroup(status: DoTaskStatus): boolean {
  return status === 'todo' || status === 'doing' || status === 'blocked';
}

export async function resolveDoTaskOwnerKey(): Promise<{ ownerKey: string; signedIn: boolean }> {
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
