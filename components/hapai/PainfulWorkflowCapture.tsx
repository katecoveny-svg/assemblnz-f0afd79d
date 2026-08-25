"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type SubmitState = "idle" | "loading" | "success" | "error";

export function PainfulWorkflowCapture() {
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("loading");
    setError("");

    const response = await fetch("/api/hapai/workflow-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        organisation: data.get("organisation"),
        workflow: data.get("workflow"),
        context: data.get("context"),
        sourcePath: window.location.pathname,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "That did not save. Please try again.");
      setState("error");
      return;
    }

    form.reset();
    setState("success");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-[#ffffff] shadow-[0_22px_70px_rgba(35,33,31,0.08)]"
    >
      <div className="grid gap-8 p-5 md:grid-cols-[0.86fr_1.14fr] md:p-7">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--assembl-pounamu)]">
            suggestions box
          </p>
          <h3 className="mt-4 font-display text-[clamp(2.6rem,5vw,4.8rem)] font-light leading-[0.92]">
            Tell us the task you stare at.
          </h3>
          <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-body)] md:text-base">
            The best SPARK tools start with one ordinary piece of work someone
            keeps avoiding: the spreadsheet, the follow-up, the proof pack, the
            weekly note, the form nobody wants to open.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)] md:text-base">
            Send the messy version. We&apos;ll look for a small tool that can give
            it the first shot.
          </p>
        </div>

        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              painful workflow
            </span>
            <textarea
              name="workflow"
              required
              rows={5}
              placeholder="e.g. Every Friday I copy notes from five emails into a client update, then forget who needs a follow-up..."
              className="min-h-[150px] rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white/70 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[color:var(--assembl-pounamu)]"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              what would done look like?
            </span>
            <textarea
              name="context"
              rows={3}
              placeholder="What should the tool produce, remind you of, file, summarise, or prepare for review?"
              className="rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white/70 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[color:var(--assembl-pounamu)]"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              name="name"
              placeholder="Name"
              className="rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-[color:var(--assembl-pounamu)]"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-[color:var(--assembl-pounamu)]"
            />
            <input
              name="organisation"
              placeholder="Organisation"
              className="rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-[color:var(--assembl-pounamu)]"
            />
          </div>
          <button
            type="submit"
            disabled={state === "loading"}
            className="mt-2 inline-flex h-12 w-fit items-center justify-center rounded-[8px] bg-[color:var(--assembl-pounamu)] px-6 font-mono text-[12px] uppercase tracking-[0.14em] text-[#ffffff] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(58,56,50,0.26)] disabled:cursor-wait disabled:opacity-70"
          >
            {state === "loading" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : state === "success" ? (
              <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
            ) : null}
            {state === "success" ? "Saved" : "Send the workflow"}
            {state === "idle" || state === "error" ? (
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            ) : null}
          </button>
          {state === "success" ? (
            <p className="text-sm leading-relaxed text-[color:var(--assembl-pounamu)]">
              Got it. We&apos;ll use this as a candidate for the next SPARK tool.
            </p>
          ) : null}
          {state === "error" ? (
            <p className="text-sm leading-relaxed text-[color:var(--assembl-amber)]">{error}</p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
