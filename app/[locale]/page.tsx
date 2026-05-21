import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <section className="relative overflow-hidden border-b border-[rgba(157,140,125,0.14)] bg-[color:var(--assembl-paper)]">
      <div className="container grid min-h-[calc(100vh-72px)] items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(3.6rem,8vw,8rem)] font-light leading-[0.9] text-[color:var(--text-primary)]">
            {t("headline")}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[color:var(--text-secondary)]">
            {t("body")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/hapai" className="cta-primary inline-flex h-12 items-center px-7">
              {t("primaryCta")}
            </Link>
            <Link href="/kete" className="btn-secondary inline-flex h-12 items-center px-7">
              {t("secondaryCta")}
            </Link>
          </div>
        </div>
        <div className="relative min-h-[420px]">
          <video
            className="absolute inset-0 h-full w-full rounded-[8px] object-cover shadow-brand"
            autoPlay
            muted
            loop
            playsInline
            poster="/videos/vessel-canon-landscape-poster.jpg"
            aria-label="assembl evidence vessel in slow motion"
          >
            <source src="/videos/vessel-canon-landscape-720p.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
