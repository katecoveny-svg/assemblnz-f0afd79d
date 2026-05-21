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
      className="hidden items-center rounded-full border border-[rgba(35,33,31,0.14)] bg-white/45 p-1 text-[11px] md:inline-flex"
      aria-label="Language"
    >
      {(["en", "mi"] as const).map((locale) => (
        <Link
          key={locale}
          href={hrefFor(locale, pathname)}
          aria-current={active === locale ? "page" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 font-mono uppercase tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2",
            active === locale
              ? "bg-[color:var(--assembl-pounamu)] text-[#FAF7F2]"
              : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
          )}
        >
          {locale === "en" ? "EN" : "MI"}
        </Link>
      ))}
    </div>
  );
}
