// ═══════════════════════════════════════════════════════════════
// ModuleErrorBoundary — catches "Failed to fetch dynamically imported
// module" / "Importing a module script failed" errors (typically caused by
// a stale Vite pre-bundle chunk after a new dep was added, or by a stale
// service-worker cache after a redeploy) and offers a one-tap recovery:
// unregister the SW, clear Cache Storage, then hard-reload.
// ═══════════════════════════════════════════════════════════════

import { Component, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface State {
  hasError: boolean;
  message: string;
  recovering: boolean;
}

const MODULE_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /ChunkLoadError/i,
  /Loading chunk \d+ failed/i,
];

export function isModuleImportError(message: string | undefined | null): boolean {
  if (!message) return false;
  return MODULE_ERROR_PATTERNS.some((re) => re.test(message));
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
    // Best-effort: continue to reload even if cache clearing fails.
  }
  // Bypass HTTP cache.
  window.location.reload();
}

export class ModuleErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: "", recovering: false };
  private windowHandlersBound = false;

  static getDerivedStateFromError(error: Error): Partial<State> | null {
    if (isModuleImportError(error?.message)) {
      return { hasError: true, message: error.message };
    }
    return null;
  }

  componentDidCatch(error: Error) {
    if (!isModuleImportError(error?.message)) {
      // Re-throw to let other boundaries / overlay handle it.
      throw error;
    }
  }

  componentDidMount() {
    if (this.windowHandlersBound) return;
    this.windowHandlersBound = true;
    window.addEventListener("error", this.onWindowError);
    window.addEventListener("unhandledrejection", this.onUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.onWindowError);
    window.removeEventListener("unhandledrejection", this.onUnhandledRejection);
  }

  private onWindowError = (e: ErrorEvent) => {
    const msg = e?.message ?? (e?.error as Error | undefined)?.message ?? "";
    if (isModuleImportError(msg)) {
      this.setState({ hasError: true, message: msg });
    }
  };

  private onUnhandledRejection = (e: PromiseRejectionEvent) => {
    const reason = e?.reason;
    const msg = typeof reason === "string" ? reason : reason?.message ?? "";
    if (isModuleImportError(msg)) {
      this.setState({ hasError: true, message: msg });
    }
  };

  private handleRecover = async () => {
    this.setState({ recovering: true });
    await clearCachesAndReload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F7F3EE]/95 backdrop-blur-xl p-6">
        <div className="max-w-md w-full bg-white/90 rounded-3xl border border-[rgba(142,129,119,0.14)] shadow-[0_8px_30px_rgba(111,97,88,0.08)] p-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#D9BC7A]/20 flex items-center justify-center">
            <RefreshCw size={20} className="text-[#9D8C7D]" />
          </div>
          <h2 className="font-display text-2xl text-[#9D8C7D] mb-2">
            A page asset is out of date
          </h2>
          <p className="font-body text-sm text-[#6F6158] mb-6">
            We've shipped an update since you last loaded the page. Clear the
            cached scripts and reload to pick up the latest version.
          </p>
          <button
            type="button"
            onClick={this.handleRecover}
            disabled={this.state.recovering}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#D9BC7A] hover:bg-[#C4A665] disabled:opacity-50 text-[#6F6158] px-5 py-2.5 font-body text-sm transition-colors"
          >
            <RefreshCw size={14} className={this.state.recovering ? "animate-spin" : ""} />
            {this.state.recovering ? "Clearing & reloading…" : "Clear cache & reload"}
          </button>
          <p className="font-mono text-[10px] text-[#9D8C7D] mt-4 break-all opacity-60">
            {this.state.message}
          </p>
        </div>
      </div>
    );
  }
}

export default ModuleErrorBoundary;
