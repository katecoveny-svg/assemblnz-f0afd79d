"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2, Sparkles, Stamp } from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";
import type { WishlistSpec } from "@/lib/tools/wishlist";

function useCountUp(target: number, run: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const duration = 700;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(t * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return value;
}

export function WishlistTool() {
  const [business, setBusiness] = useState("");
  const [wish, setWish] = useState("");
  const [spec, setSpec] = useState<WishlistSpec | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // Claim form (writes wishlist_requests).
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [claimStatus, setClaimStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [claimError, setClaimError] = useState<string | null>(null);

  async function submitClaim(event: React.FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!value || claimStatus === "saving" || !spec) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setClaimStatus("error");
      setClaimError("Please enter a valid email.");
      return;
    }
    setClaimStatus("saving");
    setClaimError(null);
    try {
      const response = await fetch("/api/wishlist/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, business: business.trim(), wish: wish.trim(), spec, consent }),
      });
      if (!response.ok) throw new Error("claim failed");
      setClaimStatus("done");
    } catch {
      setClaimStatus("error");
      setClaimError("We couldn’t save that just now — your spec is still here.");
    }
  }

  const hours = useCountUp(spec?.hoursPerWeek ?? 0, spec !== null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!business.trim() || !wish.trim() || status === "loading") return;
    setStatus("loading");
    setError(null);
    setSpec(null);
    try {
      const response = await fetch("/api/wishlist/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business: business.trim(), wish: wish.trim() }),
      });
      const data = (await response.json().catch(() => null)) as { spec?: WishlistSpec; error?: string } | null;
      if (!response.ok || !data?.spec) throw new Error(data?.error ?? "Could not draft a spec just now.");
      setSpec(data.spec);
      setStatus("idle");
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <HapaiToolShell
      kicker="HAPAI · the wishlist"
      title="The wishlist"
      description="Name one job you wish you could hand off. We’ll draft the spec for the specialist assembl would build you — tailored to your business, built on the right NZ law, draft-only."
      toolPath="/hapai/wishlist"
      shareTitle="The wishlist — a free assembl HAPAI tool"
      shareText="Name one job you wish you could hand off and get a tailored specialist spec."
      posture="Draft only. The spec is a starting point a named person reviews. Nothing the specialist drafts is ever lodged automatically — a licensed person lodges. Not legal, financial, or medical advice."
      highlights={[
        { title: "Tailored to you", body: "Describe your business and the job; the spec is drafted for that exact work.", icon: <Sparkles className="h-5 w-5" aria-hidden /> },
        { title: "Built on NZ law", body: "Names the relevant legislation, a tikanga check, and the Privacy Act 2020.", icon: <Stamp className="h-5 w-5" aria-hidden /> },
        { title: "Draft-only", body: "A named reviewer signs off; nothing auto-lodges to any government system.", icon: <ArrowRight className="h-5 w-5" aria-hidden /> },
      ]}
    >
      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ── FORM ─────────────────────────────────────────────── */}
        <form onSubmit={submit} className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/70 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#2B6B57]">Your wish</p>
          <label className="mt-4 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6661]">Your business</span>
            <input
              className="mt-1.5 h-11 w-full rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white px-3 text-sm outline-none focus:border-[#2B6B57]"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="e.g. a Tauranga cafe, a Pīkau freight broker, a Waikato sparky"
            />
          </label>
          <label className="mt-4 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6661]">One job you wish you could hand off</span>
            <textarea
              className="mt-1.5 min-h-[96px] w-full resize-none rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2B6B57]"
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="e.g. chasing allergen info from suppliers and keeping our menu matrix current"
            />
          </label>
          <button
            type="submit"
            disabled={status === "loading" || !business.trim() || !wish.trim()}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2B6B57] px-5 text-sm font-medium text-[#FAF7F2] transition hover:bg-[#103F35] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
            Draft my specialist spec
          </button>
          {error ? <p className="mt-3 text-xs text-[#9A3412]">{error}</p> : null}
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6661]">
            Draft only · reviewed by a named person · not legal advice
          </p>
        </form>

        {/* ── RESULT ───────────────────────────────────────────── */}
        <div ref={resultRef} className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/78 p-5">
          {!spec ? (
            <p className="text-sm leading-relaxed text-[#5A5550]">
              Tell us your business and one job you’d love off your plate. We’ll draft the spec for the
              specialist we’d build — the kete it lives in, what it drafts, the checks it runs, and the
              hours it could give back each week.
            </p>
          ) : (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border border-[rgba(43,107,87,0.24)] bg-[#E8EFE9] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#2B6B57]">
                  {spec.kete} kete
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(217,168,90,0.4)] bg-[#FBF3E2] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#8A5B10]">
                  <Stamp className="h-3 w-3" aria-hidden /> Sealed in an evidence pack
                </span>
              </div>

              <h2 className="mt-4 font-display text-3xl font-light italic leading-tight text-[#103F35]">
                {spec.specialistName}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#3D4250]">{spec.forLine}</p>

              <div className="mt-5 rounded-[12px] border border-[rgba(43,107,87,0.24)] bg-gradient-to-br from-[#FAF7F2] to-[#EDF3EE] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#2B6B57]">Hours back, each week</p>
                <p className="mt-1 font-display text-[clamp(2.4rem,5vw,3.4rem)] font-light leading-none text-[#103F35] tabular-nums">
                  {hours}<span className="ml-1 align-top text-base text-[#5A5550]">hrs</span>
                </p>
                <p className="mt-1 text-[11px] text-[#5A5550]">Conservative estimate for a small NZ business.</p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#2B6B57]">It would draft</p>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#3D4250]">
                    {spec.drafts.map((d) => (
                      <li key={d} className="flex gap-2"><span aria-hidden className="text-[#2B6B57]">·</span><span>{d}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#2B6B57]">Checks on every output</p>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#3D4250]">
                    {spec.checks.map((c) => (
                      <li key={c} className="flex gap-2"><span aria-hidden className="text-[#2B6B57]">✓</span><span>{c}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-5 text-[11px] leading-relaxed text-[#6B6661]">
                This is a draft a named person reviews before anything is used. Nothing the specialist
                drafts is lodged automatically to Customs, IRD, Companies Office, WorkSafe, MPI or the
                Privacy Commissioner — a licensed person lodges. Not legal, financial, or medical advice.
              </p>

              <div className="mt-5 rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white/70 p-4">
                {claimStatus === "done" ? (
                  <p className="flex items-center gap-2 text-sm text-[#103F35]">
                    <Check className="h-5 w-5 shrink-0 text-[#2B6B57]" aria-hidden />
                    Ka pai. We’ll be in touch with your spec.
                  </p>
                ) : (
                  <form onSubmit={submitClaim}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#2B6B57]">Claim this spec</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#5A5550]">
                      Leave an email and we’ll send this spec and what it would take to build it. Draft-only, no obligation.
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (claimStatus === "error") setClaimStatus("idle"); }}
                        placeholder="you@business.co.nz"
                        className="h-11 w-full rounded-[10px] border border-[rgba(35,33,31,0.14)] bg-white px-3 text-sm outline-none focus:border-[#2B6B57]"
                      />
                      <button
                        type="submit"
                        disabled={claimStatus === "saving"}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#2B6B57] px-5 text-sm font-medium text-[#FAF7F2] transition hover:bg-[#103F35] disabled:cursor-wait disabled:opacity-60"
                      >
                        {claimStatus === "saving" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                        Send it to me
                      </button>
                    </div>
                    <label className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-[#5A5550]">
                      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>Okay to send occasional assembl updates. Unsubscribe anytime.</span>
                    </label>
                    <p className="mt-2 text-[11px] leading-relaxed text-[#6B6661]">
                      Your email is used only to send this spec and, if ticked, occasional updates — held under the Privacy Act 2020.{" "}
                      <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80">Privacy</Link>.
                    </p>
                    {claimError ? <p className="mt-2 text-xs text-[#9A3412]">{claimError}</p> : null}
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </HapaiToolShell>
  );
}
