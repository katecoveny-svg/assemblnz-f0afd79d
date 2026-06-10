"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { SELF_SERVE_TIERS, SELF_SERVE_POSTURE, type PaidTier } from "@/lib/billing/tiers";

export function SelfServePlans() {
  const [pending, setPending] = useState<PaidTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(tier: PaidTier) {
    setPending(tier);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
        return;
      }
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? "Could not start checkout right now.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(null);
    }
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SELF_SERVE_TIERS.map((tier) => (
          <article
            key={tier.id}
            className="flex flex-col rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-8"
          >
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
              Self-serve · no sales call
            </p>
            <h3 className="mt-5 font-display text-display-md font-light">{tier.name}</h3>
            <p className="mt-6 font-display text-display-md font-light">
              NZ${tier.monthlyNzd}
              <span className="text-body-md text-[color:var(--text-secondary)]"> / month</span>
            </p>
            <p className="mt-4 text-body-md text-[color:var(--text-body)]">{tier.summary}</p>
            <ul className="mt-6 space-y-2 text-body-md text-[color:var(--text-body)]">
              {tier.includes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => subscribe(tier.id)}
              disabled={pending !== null}
              className="cta-primary mt-auto inline-flex h-12 items-center justify-center px-6 disabled:cursor-wait disabled:opacity-70"
            >
              {pending === tier.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Start {tier.name}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </button>
          </article>
        ))}
      </div>

      <p className="mt-5 flex items-start gap-2 text-body-sm text-[color:var(--text-secondary)]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
        {SELF_SERVE_POSTURE} Self-serve does not include the done-for-you Pilot Sprint or human-review service.
      </p>
      {error ? <p className="mt-3 text-body-sm text-[#9A3412]">{error}</p> : null}
    </div>
  );
}
