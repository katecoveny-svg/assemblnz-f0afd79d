"use client";

import { useEffect, useState } from "react";
import { Check, Download, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallPwaButtonProps = {
  label?: string;
  compact?: boolean;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosBrowser() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function InstallPwaButton({ label = "Save to home screen", compact = false }: InstallPwaButtonProps) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [iosHint, setIosHint] = useState(() => isIosBrowser() && !isStandalone());

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setInstalled(true);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) {
      setIosHint(true);
      return;
    }
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setPromptEvent(null);
  }

  if (installed) {
    return (
      <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/60 bg-white/42 px-4 text-sm text-[#23211F] shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] backdrop-blur-md">
        <Check className="h-4 w-4" aria-hidden />
        Saved
      </span>
    );
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <button
        type="button"
        onClick={install}
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(232,239,233,0.58))] px-4 text-sm font-medium text-[#23211F] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_12px_30px_rgba(58,56,50,0.10)] transition hover:-translate-y-0.5 hover:border-[rgba(58,56,50,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3832] focus-visible:ring-offset-2"
      >
        {promptEvent ? <Download className="h-4 w-4" aria-hidden /> : <Smartphone className="h-4 w-4" aria-hidden />}
        {label}
      </button>
      {iosHint ? (
        <p className="max-w-xs text-xs leading-relaxed text-[#6B6661]">
          On iPhone or iPad, tap Share, then Add to Home Screen.
        </p>
      ) : null}
    </div>
  );
}
