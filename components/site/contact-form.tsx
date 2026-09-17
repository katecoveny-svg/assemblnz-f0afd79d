"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

const INTEREST_OPTIONS = [
  { value: "pursuit", label: "Pursuit — find the opportunity" },
  { value: "do", label: "DO — do the work" },
  { value: "studio", label: "Studio — make it tangible" },
  { value: "system", label: "Pursuit, DO and Studio together" },
  { value: "something-else", label: "Something else" },
] as const;

export function ContactForm({ initialInterest = "" }: { initialInterest?: string }) {
  const [messageLength, setMessageLength] = useState(0);
  const [opened, setOpened] = useState(false);
  function openEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (key: string) => String(fields.get(key) || '').trim();
    const body = `Kia ora assembl,\n\n${value('message')}\n\nName: ${value('name')}\nReply email: ${value('email')}\nBusiness: ${value('business')}\nInterest: ${value('interest')}\nEnquiry: ${value('intent')}`;
    window.location.href = `mailto:assembl@assembl.co.nz?subject=${encodeURIComponent('assembl enquiry — ' + (value('interest') || 'Let’s talk'))}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  }
  return (
    <form onSubmit={openEmail} className="rounded-[18px] border border-[#240b21]/15 bg-[#F5F1F2] p-7 md:p-10">
      <div className="grid gap-5">
        <Field label="What's this about?" name="intent" required>
          <select
            id="intent"
            name="intent"
            defaultValue="team"
            className="form-input"
            required
            aria-required="true"
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

          <Field label="What are you interested in?" name="interest">
            <select id="interest" name="interest" defaultValue={initialInterest} className="form-input">
              <option value="">Not sure yet</option>
              {INTEREST_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="A few sentences about what you'd like to do" name="message" required>
          <textarea
            id="message"
            name="message"
            required
            aria-required="true"
            aria-describedby="message-counter"
            minLength={10}
            maxLength={4000}
            rows={5}
            onChange={(e) => setMessageLength(e.target.value.length)}
            className="form-input resize-y"
            placeholder="Tell us the job, the context you have and the result you need. What would make the next step useful?"
          />
          <div className="mt-2 flex justify-end">
            <span
              id="message-counter"
              className={cn(
                "font-mono text-[12px] uppercase tracking-[0.1em]",
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

        {opened && <p role="status">Your email app should open with a draft. Review it and press Send. If it did not open, email <a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a>. Your message remains here.</p>}

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Opens your email app · you press Send
          </p>
          <button
            type="submit"
            className="inline-flex h-12 items-center bg-[#240b21] px-7 text-sm text-white disabled:opacity-60"
          >
            Open email draft <Send className="ml-2 h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(37, 45, 49, 0.22);
          border-radius: 12px;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 14px;
          color: var(--text-primary);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .form-input:hover {
          border-color: rgba(37, 45, 49, 0.55);
        }
        .form-input:focus {
          outline: 2px solid var(--assembl-dusty-rose, #916a70);
          outline-offset: 2px;
          border-color: var(--assembl-dusty-rose, #916a70);
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
        className="mb-2 block text-sm text-[color:var(--text-secondary)]"
      >
        {label}
        {required && (
          <span className="ml-1 text-[color:var(--assembl-dusty-rose, #916a70)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
