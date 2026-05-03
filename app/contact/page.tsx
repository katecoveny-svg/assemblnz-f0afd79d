import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Clock, MapPin } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a demo, start a 14-day trial, or ask us a question. NZ-hosted intake. One working-day response.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(201, 216, 208, 0.22) 0%, transparent 55%), radial-gradient(ellipse at 80% 60%, rgba(217, 188, 122, 0.16) 0%, transparent 50%)",
          }}
        />
        <div className="container py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-gold inline-flex">Get in touch</span>
            <h1 className="mt-6 font-display text-5xl md:text-6xl">
              <span className="text-[color:var(--text-primary)]">
                Tell us what you'd like
              </span>
              <br />
              <span className="text-gradient-hero">to hand over.</span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--text-body)]">
              Demo bookings, trial sign-ups, and "is this even right for us?"
              questions all land in the same inbox. We reply within one working
              day, NZ time.
            </p>
          </div>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="relative">
        <div className="container pb-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[2fr_1fr]">
            <ContactForm />

            <aside className="space-y-6">
              <ContactCard
                icon={Mail}
                title="Email"
                lines={[
                  <Link
                    key="email"
                    href="mailto:assembl@assembl.co.nz"
                    className="text-[color:var(--text-primary)] underline-offset-4 hover:underline"
                  >
                    assembl@assembl.co.nz
                  </Link>,
                  "We read every message ourselves.",
                ]}
              />
              <ContactCard
                icon={Clock}
                title="Response time"
                lines={[
                  "One working day, NZ time.",
                  "Mon–Fri, 9am–5pm. Pacific public holidays observed.",
                ]}
              />
              <ContactCard
                icon={MapPin}
                title="Where we are"
                lines={[
                  "Aotearoa New Zealand.",
                  "Customer data hosted in NZ-resident regions by default.",
                ]}
              />

              <div className="glass-card p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  Already a customer?
                </p>
                <p className="mt-3 text-sm text-[color:var(--text-body)]">
                  Use the in-app support channel inside your kete. It routes
                  straight to the team that knows your account.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  lines: React.ReactNode[];
}) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{
            background: "rgba(217, 188, 122, 0.12)",
            border: "1px solid rgba(217, 188, 122, 0.25)",
          }}
        >
          <Icon
            className="h-4 w-4 text-[color:var(--assembl-soft-gold)]"
            aria-hidden
          />
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            {title}
          </p>
          <div className="mt-2 space-y-1 text-sm text-[color:var(--text-body)]">
            {lines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
