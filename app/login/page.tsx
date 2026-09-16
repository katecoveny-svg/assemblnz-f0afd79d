import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { safeReturnPath } from "@/lib/auth/redirect";
import { isDoReturn } from "@/lib/auth/redirect";
import type { CSSProperties } from "react";
import './login.css';

export const metadata: Metadata = {
  title: "sign in",
  description: "sign in to your assembl account.",
  robots: { index: false, follow: false },
};

// Keeps the auth form per-request; protected app routes handle redirects.
export const dynamic = "force-dynamic";

type SearchParams = { redirect?: string; sent?: string; error?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const redirectTo = safeReturnPath(sp.redirect);
  const forDo = isDoReturn(redirectTo);

  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return (
    <section
      data-do-sign-in={forDo || undefined}
      className="relative flex min-h-[calc(100vh-72px)] items-center justify-center bg-[color:var(--assembl-paper)] px-6 py-12"
      style={
        forDo
          ? ({
              "--assembl-gold": "#916A70",
              "--text-primary": "#240B21",
              "--text-secondary": "#654A4E",
            } as CSSProperties)
          : undefined
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(191, 163, 122, 0.10) 0%, transparent 60%)",
        }}
      />
      <div className="w-full max-w-md">
        <div className="glass-card p-8 sm:p-10">
          <div className="text-center">
            <h1
              className="font-display lowercase leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 500, fontSize: "clamp(2.25rem, 5vw, 3rem)" }}
            >
              sign in
              <span
                aria-hidden
                style={{ color: "var(--assembl-gold,#916A70)" }}
              >
                .
              </span>
            </h1>
            {forDo && (
              <p className="mt-4 text-sm leading-relaxed text-[#654A4E]">
                Keep your DO connections and voice allowance in your own assembl
                account.
              </p>
            )}
          </div>

          <div className="mt-8">
            {!envConfigured ? (
              <div className="rounded-[14px] border border-[rgba(172,88,56,0.30)] bg-[rgba(172,88,56,0.06)] p-5">
                <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--assembl-clay)]">
                  Configuration missing
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                  <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
                  and{" "}
                  <code className="font-mono">
                    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
                  </code>{" "}
                  are not set. Set them in the Vercel project env (and{" "}
                  <code className="font-mono">.env.local</code> for local dev) —
                  see <code className="font-mono">.env.local.example</code>.
                </p>
              </div>
            ) : (
              <LoginForm
                redirectTo={redirectTo}
                sent={sp.sent === "1"}
                errorMsg={typeof sp.error === "string" ? sp.error : null}
              />
            )}
          </div>
        </div>

        {forDo ? (
          <p className="mt-6 text-center text-sm text-[#654A4E]">
            New here? A magic link creates your account.{" "}
            <Link href="/legal/privacy" className="underline">
              Privacy
            </Link>
          </p>
        ) : (
          <p className="mt-6 text-center text-sm lowercase text-[color:var(--text-secondary)]">
            new here?{" "}
            <Link
              href="/pilot-sprint"
              className="font-medium text-[color:var(--text-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-gold)] focus-visible:ring-offset-2"
            >
              book a pilot →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
