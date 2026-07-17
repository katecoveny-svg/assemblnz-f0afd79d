"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, Mail } from "lucide-react";

type ToolLeadCaptureProps = {
  /** The SPARK tool slug this capture belongs to (must match the registry). */
  toolSlug: string;
  /** Optional snapshot of the user's current result, stored with the lead. */
  payload?: Record<string, unknown>;
  /** Heading shown above the field. */
  title?: string;
  /** Supporting line under the heading. */
  blurb?: string;
  /** Message shown after a successful submit. */
  successMessage?: string;
  /** Overrides the captured source (defaults to the current path). */
  source?: string;
  /** Visual theme — light sits on a pale card, dark sits on a pounamu panel. */
  tone?: "light" | "dark";
  className?: string;
};

type Status = "idle" | "saving" | "done" | "error";

export function ToolLeadCapture({
  toolSlug,
  payload,
  title = "Email me my result",
  blurb = "Optional. Leave an email and we’ll send a copy of this result. We never share it, and the tool works either way.",
  successMessage = "Saved. We’ll be in touch with your result.",
  source,
  tone = "light",
  className,
}: ToolLeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const dark = tone === "dark";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!value || status === "saving") return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setStatus("error");
      setMessage("Please enter a valid email.");
      return;
    }

    setStatus("saving");
    setMessage(null);
    try {
      const response = await fetch("/api/tool-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: value,
          toolSlug,
          payload: payload ?? {},
          consentMarketing: consent,
          source: source ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
        }),
      });
      if (!response.ok) {
        // Fail soft: the tool result is already on screen and stays usable.
        throw new Error("capture failed");
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("We couldn’t save that just now — your result is still here to copy.");
    }
  }

  if (status === "done") {
    return (
      <div
        className={[
          "flex items-center gap-3 rounded-[10px] border p-4 text-sm",
          dark
            ? "border-[#ffffff]/16 bg-[#ffffff]/10 text-[#ffffff]"
            : "border-[rgba(58,56,50,0.24)] bg-[#eef4f4] text-[#313c42]",
          className ?? "",
        ].join(" ")}
      >
        <Check className="h-5 w-5 shrink-0 text-[#313c42]" aria-hidden />
        <span>{successMessage}</span>
      </div>
    );
  }

  const labelColour = dark ? "text-[#b8964f]" : "text-[#313c42]";
  const bodyColour = dark ? "text-[#ffffff]/82" : "text-[#5A5550]";
  const inputClass = dark
    ? "h-11 w-full rounded-[10px] border border-[#ffffff]/20 bg-[#ffffff]/10 px-3 text-sm text-[#ffffff] placeholder:text-[#ffffff]/40 outline-none focus:border-[#b8964f]"
    : "h-11 w-full rounded-[10px] border border-[rgba(35,33,31,0.14)] bg-white px-3 text-sm text-[#313c42] outline-none focus:border-[#313c42]";

  return (
    <form
      onSubmit={submit}
      className={[
        "rounded-[10px] border p-4",
        dark
          ? "border-[#ffffff]/16 bg-[#ffffff]/8"
          : "border-[rgba(35,33,31,0.12)] bg-white/70",
        className ?? "",
      ].join(" ")}
    >
      <p className={["flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]", labelColour].join(" ")}>
        <Mail className="h-3.5 w-3.5" aria-hidden />
        {title}
      </p>
      <p className={["mt-2 text-xs leading-relaxed", bodyColour].join(" ")}>{blurb}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`tool-lead-${toolSlug}`}>
          Email address
        </label>
        <input
          id={`tool-lead-${toolSlug}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="you@business.co.nz"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#313c42] px-5 text-sm font-medium text-[#ffffff] transition hover:bg-[#313c42] disabled:cursor-wait disabled:opacity-60"
        >
          {status === "saving" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Send it to me
        </button>
      </div>
      <label className={["mt-3 flex items-start gap-2 text-[11px] leading-relaxed", bodyColour].join(" ")}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 shrink-0"
        />
        <span>Okay to send occasional assembl updates. Unsubscribe anytime.</span>
      </label>
      <p className={["mt-2 text-[11px] leading-relaxed", bodyColour].join(" ")}>
        Your email is collected only to send this result and, if you tick the box, occasional
        updates — held under the Privacy Act 2020.{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80">
          Privacy
        </Link>
        .
      </p>
      {message ? (
        <p className={["mt-2 text-xs", dark ? "text-[#F3C98B]" : "text-[#9A3412]"].join(" ")}>{message}</p>
      ) : null}
    </form>
  );
}
