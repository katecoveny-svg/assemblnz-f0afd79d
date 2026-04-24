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
// In dev (import.meta.env.DEV) the fallback also dumps the diagnostics to
// console.group so you can copy them into a bug report.
// ═══════════════════════════════════════════════════════════════

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
}

export class ChatPanelBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
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

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { name, imports, title } = this.props;
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

        <button
          type="button"
          onClick={this.handleReload}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#D9BC7A] hover:bg-[#C4A665] text-[#6F6158] px-4 py-2 font-body text-sm transition-colors mb-4"
        >
          <RefreshCw size={14} />
          Reload page
        </button>

        <details className="rounded-2xl bg-[#F7F3EE]/60 border border-[rgba(142,129,119,0.10)] p-3">
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
                    <li key={i}>• {i}</li>
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
