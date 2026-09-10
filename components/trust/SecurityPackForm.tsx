"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "ok" | "error";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-[color:var(--assembl-cloud)] bg-white px-3.5 py-2.5 text-[15px] text-[color:var(--text-primary)] placeholder:text-[color:var(--assembl-sand)] focus-visible:border-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--assembl-paper)]";

const labelClass =
  "block font-mono text-xs uppercase tracking-[0.14em] text-[color:var(--text-secondary)]";

export function SecurityPackForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [useLength, setUseLength] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      org: String(data.get("org") ?? "").trim(),
      role: String(data.get("role") ?? "").trim(),
      intendedUse: String(data.get("intendedUse") ?? "").trim(),
      ndaSigned: data.get("ndaSigned") === "on",
    };

    try {
      const res = await fetch("/api/trust-pack-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "ok") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu-paper)] p-6 text-[color:var(--text-primary)]"
      >
        <p className="font-display text-2xl font-light">Request received.</p>
        <p className="mt-2 text-[15px] leading-7 text-[color:var(--text-secondary)]">
          Our security team will review and reply from security@assembl.co.nz. If your
          request is urgent, email us directly and reference your organisation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="tc-name" className={labelClass}>
          Name <span className="text-[color:var(--assembl-pounamu)]" aria-hidden="true">*</span>
        </label>
        <input
          id="tc-name"
          name="name"
          type="text"
          required
          aria-required="true"
          autoComplete="name"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="tc-org" className={labelClass}>
            Organisation <span className="text-[color:var(--assembl-pounamu)]" aria-hidden="true">*</span>
          </label>
          <input
            id="tc-org"
            name="org"
            type="text"
            required
            aria-required="true"
            autoComplete="organization"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="tc-role" className={labelClass}>
            Role <span className="text-[color:var(--assembl-pounamu)]" aria-hidden="true">*</span>
          </label>
          <input
            id="tc-role"
            name="role"
            type="text"
            required
            aria-required="true"
            autoComplete="organization-title"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="tc-use" className={labelClass}>
          How you&rsquo;ll use the pack <span className="text-[color:var(--assembl-pounamu)]" aria-hidden="true">*</span>
        </label>
        <textarea
          id="tc-use"
          name="intendedUse"
          required
          aria-required="true"
          aria-describedby="use-counter"
          maxLength={1000}
          rows={3}
          onChange={(e) => setUseLength(e.target.value.length)}
          placeholder="e.g. Vendor security review for a procurement process."
          className={`${inputClass} resize-y`}
        />
        <div className="mt-1.5 flex justify-end">
          <span
            id="use-counter"
            className={`font-mono text-[10px] uppercase tracking-[0.1em] ${
              useLength > 900
                ? "font-medium text-[#B4452F]"
                : "text-[color:var(--text-secondary)]"
            }`}
            aria-hidden="true"
          >
            {useLength} / 1000 characters
          </span>
          <span className="sr-only" aria-live="polite">
            {useLength > 900 ? `${useLength} / 1000 characters` : ""}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="tc-nda"
          name="ndaSigned"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-[color:var(--assembl-cloud)] text-[color:var(--assembl-pounamu)] focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)]"
        />
        <label htmlFor="tc-nda" className="text-[15px] leading-6 text-[color:var(--text-primary)]">
          An NDA is already in place between our organisations.{" "}
          <span className="text-[color:var(--text-secondary)]">
            (Optional — we can send one with the pack if not.)
          </span>
        </label>
      </div>

      {status === "error" && error ? (
        <p role="alert" className="text-sm text-[#B4452F]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-full bg-[color:var(--assembl-pounamu)] px-7 py-3 text-sm font-medium text-white transition-all hover:bg-[color:var(--assembl-pounamu-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--assembl-paper)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Request the security pack"}
      </button>
    </form>
  );
}
