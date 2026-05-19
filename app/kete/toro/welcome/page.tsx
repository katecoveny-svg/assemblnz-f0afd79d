import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TeReo } from "@/components/site/TeReo";

export const metadata = {
  title: "Tōro welcome — assembl",
  description: "Your Tōro Family plan is ready for onboarding.",
};

export default function ToroWelcomePage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-16 text-[color:var(--text-primary)] md:px-12 md:py-24">
      <section className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            Tōro · family plan
          </p>
          <h1 className="mt-5 font-display text-[clamp(3.4rem,9vw,6.8rem)] font-normal leading-[0.92]">
            Your <TeReo>Tōro</TeReo> onboarding is next.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[color:var(--text-body)]">
            Thanks for joining Tōro. We will confirm your whānau details, set up
            your inbound forwarding address, and help you forward the first
            school notice into your family plan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/kete/toro/fridge" className="cta-primary inline-flex h-12 items-center px-7">
              Try the kai planner
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link href="/kete/toro" className="btn-ghost inline-flex h-12 items-center px-7">
              Back to Tōro
            </Link>
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-white/45 bg-white/42 shadow-[0_34px_110px_rgba(35,33,31,0.16)] backdrop-blur-xl">
          <img
            src="/img/brand/toro-brand-square-bird.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 52%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#23211F]/36 via-transparent to-white/10" />
        </div>
      </section>
    </main>
  );
}
