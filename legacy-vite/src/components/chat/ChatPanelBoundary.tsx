// ═══════════════════════════════════════════════════════════════
// ChatPanelBoundary — verbose diagnostics for chat panels
// ───────────────────────────────────────────────────────────────
// Wraps any chat panel (ToroTutorChat, HomeworkHelp, etc.) and instead of
// letting a single broken import nuke the whole page to a blank screen,
// renders a Mārama-styled fallback that lists:
//   • the panel name
//   • the captured error message + stack
//   • the import paths the panel declared (passed in via `imports`)
//   • a one-tap "Reload page" recovery
//
// When the failure looks like a Vite/module-import error (stale pre-bundle
// chunk, missing dep, broken alias) AND we're in dev mode, the fallback
// also surfaces a developer overlay with:
//   • the parsed failing module name (extracted from the error/stack)
//   • a "Clear cache & hard reload" button (unregisters SW + Cache Storage)
//   • a copy-paste hint for the dev-server fix (`rm -rf node_modules/.vite`)
// ═══════════════════════════════════════════════════════════════

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Terminal, Wrench } from "lucide-react";

interface Props {
  /** Human-readable panel name, e.g. "ToroTutorChat". */
  name: string;
  /** Import paths this panel relies on — listed in the fallback for triage. */
  imports?: string[];
  /** Optional friendlier label shown in the fallback header. */
  title?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
  stack?: string;
  recovering: boolean;
}

const MODULE_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /ChunkLoadError/i,
  /Loading chunk \d+ failed/i,
  /Cannot find module/i,
  /Failed to resolve module specifier/i,
];

function isModuleImportError(message: string | undefined | null): boolean {
  if (!message) return false;
  return MODULE_ERROR_PATTERNS.some((re) => re.test(message));
}

/**
 * Best-effort extraction of the failing module name/path from a module-load
 * error. Looks at the message, then the stack, then any `imports` declared
 * by the panel, in that order.
 */
function extractFailingModule(
  message: string,
  stack: string | undefined,
  declared: string[] | undefined,
): string | null {
  const haystack = `${message}\n${stack ?? ""}`;

  // Patterns Vite / browsers tend to use:
  //   "Failed to fetch dynamically imported module: https://…/foo.tsx"
  //   "Cannot find module '@/lib/mcpChat'"
  //   "Failed to resolve module specifier 'react-markdown'"
  const patterns: RegExp[] = [
    /imported module:?\s*([^\s"')]+)/i,
    /Cannot find module\s+['"]([^'"]+)['"]/i,
    /Failed to resolve module specifier\s+['"]([^'"]+)['"]/i,
    /Loading chunk\s+(\S+)\s+failed/i,
    /from\s+['"]([^'"]+)['"]/i,
  ];
  for (const re of patterns) {
    const m = haystack.match(re);
    if (m?.[1]) return m[1];
  }

  // Fall back: any declared import that appears verbatim in the message.
  if (declared) {
    const hit = declared.find((d) => haystack.includes(d));
    if (hit) return hit;
  }
  return null;
}

async function clearCachesAndReload() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // Best-effort; reload anyway.
  }
  window.location.reload();
}

export class ChatPanelBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "", recovering: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      message: error?.message ?? "Unknown chat panel error",
      stack: error?.stack,
    };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.group(`[ChatPanelBoundary] ${this.props.name} crashed`);
      // eslint-disable-next-line no-console
      console.error("Error:", error);
      if (this.props.imports?.length) {
        // eslint-disable-next-line no-console
        console.info("Declared imports:", this.props.imports);
      }
      if (info?.componentStack) {
        // eslint-disable-next-line no-console
        console.info("Component stack:", info.componentStack);
      }
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  private handleReload = () => window.location.reload();

  private handleClearAndReload = async () => {
    this.setState({ recovering: true });
    await clearCachesAndReload();
  };

  private renderDevOverlay(failingModule: string | null) {
    return (
      <div className="mt-4 rounded-2xl border border-[#D9BC7A]/40 bg-[#FFF8EC] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Wrench size={14} className="text-[#9D8C7D]" />
          <p className="font-body text-xs uppercase tracking-wider text-[#9D8C7D]">
            Developer overlay — module import failed
          </p>
        </div>

        {failingModule ? (
          <p className="font-body text-sm text-[#3D4250] mb-3">
            Couldn't load module:{" "}
            <span className="font-mono text-[12px] bg-white/80 rounded px-1.5 py-0.5 border border-[rgba(142,129,119,0.14)] break-all">
              {failingModule}
            </span>
          </p>
        ) : (
          <p className="font-body text-sm text-[#3D4250] mb-3">
            A dynamic import failed but the failing module name couldn't be
            parsed from the error. Check the console for the original error.
          </p>
        )}

        <p className="font-body text-xs text-[#6F6158] mb-3">
          This is almost always a stale Vite pre-bundle cache (after a new
          dependency was added or upgraded). Clear the browser caches first;
          if it still fails, clear the dev-server cache.
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={this.handleClearAndReload}
            disabled={this.state.recovering}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#D9BC7A] hover:bg-[#C4A665] disabled:opacity-50 text-[#6F6158] px-4 py-2 font-body text-sm transition-colors"
          >
            <RefreshCw size={14} className={this.state.recovering ? "animate-spin" : ""} />
            {this.state.recovering ? "Clearing & reloading…" : "Clear cache & hard reload"}
          </button>
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/80 hover:bg-white border border-[rgba(142,129,119,0.14)] text-[#6F6158] px-4 py-2 font-body text-sm transition-colors"
          >
            <RefreshCw size={14} />
            Reload only
          </button>
        </div>

        <div className="rounded-xl bg-white/80 border border-[rgba(142,129,119,0.10)] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Terminal size={12} className="text-[#9D8C7D]" />
            <p className="font-body text-[11px] uppercase tracking-wider text-[#9D8C7D]">
              Dev-server fix
            </p>
          </div>
          <pre className="font-mono text-[11px] text-[#3D4250] whitespace-pre-wrap">
            rm -rf node_modules/.vite && npm run dev
          </pre>
        </div>
      </div>
    );
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { name, imports, title } = this.props;
    const isModuleErr = isModuleImportError(this.state.message);
    const failingModule = isModuleErr
      ? extractFailingModule(this.state.message, this.state.stack, imports)
      : null;

    return (
      <div
        role="alert"
        className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[#D9BC7A]/40 shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-[#D9BC7A]" />
          <h3 className="font-display text-xl text-[#9D8C7D]">
            {title ?? "Chat panel unavailable"}
          </h3>
        </div>
        <p className="font-body text-sm text-[#6F6158] mb-4">
          The <span className="font-mono text-xs">{name}</span> panel failed to
          load. The rest of the page is fine — you can keep working and try
          reloading this panel.
        </p>

        {!isModuleErr && (
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] px-4 py-2 font-body text-sm transition-colors mb-4"
          >
            <RefreshCw size={14} />
            Reload page
          </button>
        )}

        {/* Dev-only overlay for stale-chunk / missing-module failures. */}
        {isModuleErr && import.meta.env.DEV && this.renderDevOverlay(failingModule)}

        <details className="rounded-2xl bg-[#F7F3EE]/60 border border-[rgba(142,129,119,0.10)] p-3 mt-4">
          <summary className="font-body text-xs text-[#6F6158] cursor-pointer">
            Diagnostics
          </summary>
          <div className="mt-3 space-y-3">
            <div>
              <p className="font-body text-[11px] uppercase tracking-wider text-[#9D8C7D] mb-1">
                Error
              </p>
              <p className="font-mono text-[11px] text-[#3D4250] break-words">
                {this.state.message}
              </p>
            </div>
            {imports && imports.length > 0 && (
              <div>
                <p className="font-body text-[11px] uppercase tracking-wider text-[#9D8C7D] mb-1">
                  Imports declared
                </p>
                <ul className="font-mono text-[11px] text-[#3D4250] space-y-0.5">
                  {imports.map((i) => (
                    <li key={i}>
                      • {i}
                      {failingModule === i && (
                        <span className="ml-2 text-[10px] text-[#D9BC7A]">← failing</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {this.state.stack && (
              <div>
                <p className="font-body text-[11px] uppercase tracking-wider text-[#9D8C7D] mb-1">
                  Stack
                </p>
                <pre className="font-mono text-[10px] text-[#6F6158] whitespace-pre-wrap break-all max-h-48 overflow-auto">
                  {this.state.stack}
                </pre>
              </div>
            )}
          </div>
        </details>
      </div>
    );
  }
}

export default ChatPanelBoundary;
