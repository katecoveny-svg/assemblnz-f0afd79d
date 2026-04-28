import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogIn, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * ChatSignInPrompt — non-blocking, optional sign-in nudge.
 *
 * Shown only to guests who already have at least one message in the thread.
 * Explains that the chat is currently saved locally and that signing in keeps
 * it across devices. Renders nothing for signed-in users.
 *
 * Dismissals are remembered per-agent in localStorage so we don't pester the
 * user, but they reappear on a different agent / different device.
 */
export default function ChatSignInPrompt({
  agentId,
  hasMessages,
  className = "",
}: {
  agentId: string | undefined;
  hasMessages: boolean;
  className?: string;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const dismissKey = agentId ? `assembl_signin_prompt_dismissed:${agentId}` : null;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissKey) return;
    try {
      setDismissed(window.localStorage.getItem(dismissKey) === "1");
    } catch {
      // private mode — keep visible
    }
  }, [dismissKey]);

  if (loading || user || !hasMessages || dismissed || !agentId) return null;

  const onDismiss = () => {
    setDismissed(true);
    if (dismissKey) {
      try { window.localStorage.setItem(dismissKey, "1"); } catch { /* ignore */ }
    }
  };

  // Round-trip back to where the user was after auth.
  const redirect = encodeURIComponent(location.pathname + location.search);

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${className}`}
      style={{
        background: "rgba(247,243,238,0.85)",
        border: "1px solid rgba(142,129,119,0.18)",
        color: "#6F6158",
        backdropFilter: "blur(8px)",
      }}
      role="status"
    >
      <LogIn className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 leading-snug">
        <p className="font-medium" style={{ color: "#6F6158" }}>
          Saving this chat to your device
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#9D8C7D" }}>
          Sign in to keep your conversation across devices and resume it any time.
        </p>
        <div className="mt-2 flex gap-3 text-xs">
          <Link
            to={`/login?redirect=${redirect}`}
            className="font-medium underline underline-offset-2"
            style={{ color: "#6F6158" }}
          >
            Sign in
          </Link>
          <Link
            to={`/signup?redirect=${redirect}`}
            className="font-medium underline underline-offset-2"
            style={{ color: "#9D8C7D" }}
          >
            Create account
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss sign-in prompt"
        className="shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
