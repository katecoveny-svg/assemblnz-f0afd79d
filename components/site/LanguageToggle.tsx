"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

function stripLocale(pathname: string) {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if (isLocale(maybeLocale)) return `/${rest.join("/")}` || "/";
  return pathname;
}

function hrefFor(locale: Locale, pathname: string) {
  const stripped = stripLocale(pathname);
  return stripped === "/" ? `/${locale}` : `/${locale}${stripped}`;
}

export function LanguageToggle() {
  const pathname = usePathname();
  const active = isLocale(pathname.split("/")[1]) ? (pathname.split("/")[1] as Locale) : "en";

  return (
    <div
      className="inline-flex items-center rounded-full border border-[rgba(35,33,31,0.14)] bg-white/45 p-1 text-[11px] animate-in fade-in zoom-in-95 duration-500"
      aria-label="Language"
    >
      {(["en", "mi"] as const).map((locale) => (
        <Link
          key={locale}
          href={hrefFor(locale, pathname)}
          aria-current={active === locale ? "page" : undefined}
          aria-label={locale === "en" ? "Switch to English" : "Huri ki te Reo Māori"}
          title={locale === "en" ? "English" : "Te Reo Māori"}
          className={cn(
            "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-3 py-1 font-mono uppercase tracking-[0.08em] transition focus-visible:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-pounamu)] focus-visible:outline-offset-2",
            active === locale
              ? "bg-[color:var(--assembl-pounamu)] text-[#FFF7EC]"
              : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
          )}
        >
          {locale === "en" ? "EN" : "MI"}
        </Link>
      ))}
    </div>
  );
}
