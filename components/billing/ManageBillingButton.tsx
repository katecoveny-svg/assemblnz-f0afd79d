"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

export function ManageBillingButton({ label = "Manage or cancel" }: { label?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? "Could not open the billing portal.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className="btn-ghost inline-flex h-11 items-center justify-center px-6 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <ExternalLink className="mr-2 h-4 w-4" aria-hidden />}
        {label}
      </button>
      {error ? <p className="mt-2 text-body-sm text-[#9A3412]">{error}</p> : null}
    </div>
  );
}
