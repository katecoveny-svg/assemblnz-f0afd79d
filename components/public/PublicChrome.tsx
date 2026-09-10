"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { publicPageKind } from "./public-route-canon";
import "./public-craft.css";

const links = [
  { href: "/journeys", label: "Journeys" },
  { href: "/agents", label: "Agents" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/concept-studio", label: "Studio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function PublicHeader() {
  const path = usePathname();
  return <PublicHeaderMenu key={path} path={path} />;
}

function PublicHeaderMenu({ path }: { path: string | null }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header
      className="public-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className="public-brand">
        <Link href="/" aria-label="assembl home">
          assembl<span>·</span>
        </Link>
        <p>Mahi that earns its proof.</p>
      </div>
      <button
        className="public-menu-toggle"
        ref={toggle}
        aria-expanded={open}
        aria-controls="public-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close −" : "Menu +"}
      </button>
      <nav
        className="public-nav"
        id="public-nav"
        aria-label="Public pages"
        data-open={open}
      >
        {links.map((link) => (
          <Link
            href={link.href}
            key={link.href}
            aria-current={path === link.href ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link
          className="public-nav-contact"
          href="/contact"
          onClick={() => setOpen(false)}
        >
          Let’s talk <span aria-hidden>↗</span>
        </Link>
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-invite">
        <p className="public-label">One useful next step</p>
        <Link href="/contact">
          Bring us
          <br />
          <span>one real wait.</span>
          <b aria-hidden>↗</b>
        </Link>
      </div>
      <div className="public-footer-grid">
        <div className="public-footer-brand">
          <Link href="/" aria-label="assembl home">
            assembl<span>·</span>
          </Link>
          <p>
            Mahi that earns its proof.
            <br />
            Aotearoa New Zealand.
          </p>
        </div>
        <nav aria-label="Explore assembl">
          <p>Explore</p>
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Try and learn">
          <p>Try & learn</p>
          <Link href="/genome">Business Genome</Link>
          <Link href="/generative-studio">Generative Studio</Link>
          <Link href="/hapai">Free tools</Link>
          <Link href="/field-notes">Field notes</Link>
          <Link href="/faq">Questions</Link>
          <Link href="/pilots">Start a pilot</Link>
        </nav>
        <nav aria-label="Trust and contact">
          <p>Trust & contact</p>
          <Link href="/trust">Trust & evidence</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/disclaimer">Disclaimer</Link>
          <Link href="/contact">Contact Kate</Link>
          <a href="https://demo.assembl.co.nz/admin/login">
            Operator sign in ↗
          </a>
        </nav>
      </div>
      <div className="public-footer-base">
        <span>© {new Date().getFullYear()} assembl</span>
        <a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a>
        <span>Agents prepare. People decide.</span>
      </div>
    </footer>
  );
}

export function PublicSurface({ children }: { children: ReactNode }) {
  const kind = publicPageKind(usePathname());
  if (!kind) return children;
  return (
    <div
      className={`public-foundation${kind === "document" ? " public-document" : ""}`}
    >
      {children}
    </div>
  );
}
