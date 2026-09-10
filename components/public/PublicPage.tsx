import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import "./public-craft.css";

export function PublicPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`public-page ${className}`}>{children}</div>;
}
export function PageHero({
  eyebrow,
  title,
  accent,
  body,
  image,
  imageAlt = "",
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  body: string;
  image?: "folio" | "tiles" | "receipt";
  imageAlt?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={`public-hero${compact ? " public-hero-compact" : ""}${image ? " public-hero-art" : ""}`}
    >
      {image && (
        <div className="public-hero-image">
          <Image
            src={`/brand/public-craft/${image}.webp`}
            alt={imageAlt}
            fill
            sizes="(max-width: 760px) 100vw, 85vw"
            priority
          />
        </div>
      )}
      <div className="public-hero-copy">
        <p className="public-label">{eyebrow}</p>
        <h1>
          {title}
          {accent && (
            <>
              <br />
              <em>{accent}</em>
            </>
          )}
        </h1>
        <p className="public-lede">{body}</p>
        {children && <div className="public-actions">{children}</div>}
      </div>
      <div className="public-hero-foot">
        <span>assembl / active customer journeys</span>
        <a href="#explore">
          Explore this page <span aria-hidden>↓</span>
        </a>
      </div>
    </section>
  );
}
export function TextLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      className={primary ? "public-button" : "public-text-link"}
      href={href}
    >
      {children}
      <span aria-hidden>↗</span>
    </Link>
  );
}
export function SectionHeading({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="public-section-heading">
      <div>
        <p className="public-label">{label}</p>
        <h2>{title}</h2>
      </div>
      {body && <p>{body}</p>}
    </div>
  );
}
export function DetailRows({
  rows,
}: {
  rows: { n: string; h: string; p: string; href?: string }[];
}) {
  return (
    <div className="public-detail-rows">
      {rows.map((row) => (
        <article key={row.n}>
          <span className="public-label">{row.n}</span>
          <h3>{row.h}</h3>
          <div>
            <p>{row.p}</p>
            {row.href && <TextLink href={row.href}>Explore</TextLink>}
          </div>
        </article>
      ))}
    </div>
  );
}
export function PageNote({ children }: { children: ReactNode }) {
  return <p className="public-note">{children}</p>;
}
