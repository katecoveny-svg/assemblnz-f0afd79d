"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, Send, CheckCircle2, Copy, Check, Home } from "lucide-react";
import { submitContact, type ContactState } from "@/app/contact/actions";
import { cn } from "@/lib/utils";
import { INDUSTRY_KETES } from "@/lib/kete";

const initialState: ContactState = { status: "idle" };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContact,
    initialState
  );
  const [messageLength, setMessageLength] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (state.status === "success") {
      navigator.clipboard.writeText(state.ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (state.status === "success") {
    return (
      <div className="glass-card-elevated p-8 md:p-12 text-center" role="status">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-assembl-pounamu/25 bg-assembl-pounamu/10">
          <CheckCircle2
            className="h-6 w-6 text-assembl-pounamu"
            aria-hidden
          />
        </div>
        <h2 className="mt-6 font-display text-3xl">Kia ora — we&apos;ll be in touch.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-[color:var(--text-body)]">
          We&apos;ve logged your enquiry and someone from the team will reply
          within one working day. Reference for your records:
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <p className="font-mono text-sm font-medium text-[color:var(--text-primary)]">
            {state.ref}
          </p>
          <button
            onClick={handleCopy}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(35,33,31,0.15)] bg-white/40 text-[color:var(--text-secondary)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)] focus-visible:-translate-y-0.5 focus-visible:border-[color:var(--text-primary)] focus-visible:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:translate-y-0"
            aria-label={copied ? "Reference copied" : "Copy reference to clipboard"}
            title={copied ? "Reference copied" : "Copy reference"}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[color:var(--assembl-pounamu)]" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="btn-ghost inline-flex h-11 items-center px-6 text-sm"
          >
            <Home className="mr-2 h-4 w-4" aria-hidden />
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="glass-card-elevated p-7 md:p-10">
      <div className="grid gap-5">
        <Field label="What's this about?" name="intent" required>
          <select
            id="intent"
            name="intent"
            defaultValue="trial"
            className="form-input"
            required
            aria-required="true"
            aria-invalid={state.status === "error"}
            aria-describedby={state.status === "error" ? "form-error" : undefined}
          >
            <option value="trial">Try an agent free</option>
            <option value="question">Ask a question</option>
            <option value="team">Talk to the team</option>
          </select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" name="name" required>
            <input
              id="name"
              type="text"
              name="name"
              required
              aria-required="true"
              aria-invalid={state.status === "error"}
              aria-describedby={state.status === "error" ? "form-error" : undefined}
              maxLength={120}
              autoComplete="name"
              className="form-input"
            />
          </Field>

          <Field label="Email" name="email" required>
            <input
              id="email"
              type="email"
              name="email"
              required
              aria-required="true"
              aria-invalid={state.status === "error"}
              aria-describedby={state.status === "error" ? "form-error" : undefined}
              autoComplete="email"
              className="form-input"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business (optional)" name="business">
            <input
              id="business"
              type="text"
              name="business"
              maxLength={160}
              autoComplete="organization"
              className="form-input"
            />
          </Field>

          <Field label="Which kete fits best?" name="kete">
            <select id="kete" name="kete" defaultValue="" className="form-input">
              <option value="">Not sure yet</option>
              {INDUSTRY_KETES.map((k) => (
                <option key={k.slug} value={k.slug}>
                  {k.name} — {k.industry}
                </option>
              ))}
              <option value="toro">Tōro — for families</option>
            </select>
          </Field>
        </div>

        <Field label="A few sentences about what you'd like to do" name="message" required>
          <textarea
            id="message"
            name="message"
            required
            aria-required="true"
            aria-invalid={state.status === "error"}
            aria-describedby={cn(
              "message-counter",
              state.status === "error" && "form-error"
            )}
            minLength={10}
            maxLength={4000}
            rows={5}
            onChange={(e) => setMessageLength(e.target.value.length)}
            className="form-input resize-y"
            placeholder="The workflows you're hoping to hand over, the compliance pain that drove you here, the size of your team — whatever helps us prep for the call."
          />
          <div className="mt-2 flex justify-end">
            <span
              id="message-counter"
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.1em]",
                messageLength > 3600
                  ? "text-destructive font-medium"
                  : "text-[color:var(--text-secondary)]"
              )}
              aria-hidden="true"
            >
              {messageLength} / 4000 characters
            </span>
            <span className="sr-only" aria-live="polite">
              {messageLength > 3600 ? `${messageLength} / 4000 characters` : ""}
            </span>
          </div>
        </Field>

        {state.status === "error" && (
          <p
            id="form-error"
            className="rounded-card border border-[rgba(180,90,90,0.3)] bg-[rgba(180,90,90,0.08)] p-3 text-sm text-[#7A3A3A]"
            role="alert"
          >
            {state.message}
          </p>
        )}

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            One working-day response · NZ-hosted intake
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Sending…
              </>
            ) : (
              <>
                Send
                <Send className="ml-2 h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(157, 140, 125, 0.25);
          border-radius: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: var(--text-primary);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .form-input:hover {
          border-color: rgba(157, 140, 125, 0.45);
        }
        .form-input:focus {
          outline: 2px solid var(--assembl-pounamu);
          outline-offset: 2px;
          border-color: var(--assembl-pounamu);
        }
        .form-input::placeholder {
          color: var(--text-secondary);
          opacity: 0.7;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  name,
  children,
  required,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="block">
      <label
        htmlFor={name}
        className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]"
      >
        {label}
        {required && (
          <span className="ml-1 text-[color:var(--assembl-pounamu)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
