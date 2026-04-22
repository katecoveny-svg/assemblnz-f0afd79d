import { Helmet } from "react-helmet-async";
import { Download, Sparkles, Copy } from "lucide-react";
import { useState } from "react";
import { INDUSTRY_KETE_LIST, HERO_KETE_IMAGE } from "@/assets/brand/kete";

/**
 * Assembl Brand Guidelines v1.0 — interactive single source of truth.
 * Replaces the previous iframe-based design system page.
 */
export default function DesignSystem() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1400);
  };

  const core = [
    { name: "Mist",          hex: "#F7F3EE", role: "Primary canvas" },
    { name: "Cloud",         hex: "#EEE7DE", role: "Secondary surface" },
    { name: "Sand",          hex: "#D8C8B4", role: "Accent surface" },
    { name: "Taupe",         hex: "#9D8C7D", role: "Brand colour" },
    { name: "Twilight Taupe",hex: "#6F6158", role: "Text primary" },
    { name: "Sage Mist",     hex: "#C9D8D0", role: "Calm accent" },
    { name: "Soft Gold",     hex: "#D9BC7A", role: "Sparkle only" },
  ];

  return (
    <>
      <Helmet>
        <title>Assembl Brand Guidelines v1.0 — Single Source of Truth</title>
        <meta
          name="description"
          content="Assembl visual identity: Mist/Taupe palette, Cormorant Garamond, Inter, IBM Plex Mono, eight industry kete accents, and downloadable brand assets."
        />
      </Helmet>

      <main className="min-h-screen" style={{ backgroundColor: "#F7F3EE" }}>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 80% 0%, rgba(238,231,222,0.7) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 100%, rgba(201,216,208,0.5) 0%, transparent 65%)",
            }}
          />
          <div className="relative max-w-6xl mx-auto px-6 sm:px-10 pt-28 pb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="font-mono text-[11px] tracking-[0.32em] uppercase text-assembl-text-secondary mb-6">
                  Brand Guidelines · v1.0 · 2026-04-22
                </p>
                <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-assembl-taupe-deep mb-6">
                  A quiet, premium identity{" "}
                  <em className="text-assembl-taupe">shaped for Aotearoa.</em>
                </h1>
                <p className="text-lg leading-relaxed text-assembl-text-body max-w-xl mb-10">
                  Calm, premium, human, and quietly magical. This page is the single
                  source of truth — palette, typography, kete imagery, and downloadable
                  source assets all live here.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/brand/Assembl_Brand_Guidelines.pdf"
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-pill text-sm font-medium transition-colors"
                    style={{ backgroundColor: "#9D8C7D", color: "#F7F3EE" }}
                  >
                    <Download className="w-4 h-4" />
                    Download brand book (PDF)
                  </a>
                  <a
                    href="#palette"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-pill text-sm font-medium transition-colors border"
                    style={{
                      borderColor: "#D8C8B4",
                      color: "#6F6158",
                      backgroundColor: "rgba(255,255,255,0.6)",
                    }}
                  >
                    Open palette
                  </a>
                </div>
              </div>
              <div className="relative aspect-square max-w-md mx-auto">
                <div
                  className="absolute inset-0 rounded-card overflow-hidden"
                  style={{ boxShadow: "0 8px 30px rgba(111,97,88,0.12)" }}
                >
                  <img
                    src={HERO_KETE_IMAGE}
                    alt="Assembl signature feather kete photographed against Aotearoa landscape"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Sparkles
                  className="absolute -top-3 -right-3 w-8 h-8"
                  style={{ color: "#D9BC7A" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Palette */}
        <section id="palette" className="py-24 px-6 sm:px-10 bg-white/40">
          <div className="max-w-6xl mx-auto">
            <p className="font-mono text-[11px] tracking-[0.32em] uppercase text-assembl-text-secondary mb-3">
              01 · Core palette
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-assembl-taupe-deep mb-12">
              Seven neutrals. One sparkle.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {core.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => copy(c.hex, c.hex)}
                  className="text-left rounded-card overflow-hidden border transition-transform hover:-translate-y-1"
                  style={{
                    borderColor: "rgba(142,129,119,0.14)",
                    boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <div className="aspect-square" style={{ backgroundColor: c.hex }} />
                  <div className="p-4">
                    <div className="font-display text-xl text-assembl-taupe-deep">{c.name}</div>
                    <div className="text-xs text-assembl-text-secondary mb-2">{c.role}</div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-assembl-text-secondary">
                      {copied === c.hex ? "Copied" : c.hex}
                      <Copy className="w-3 h-3 opacity-60" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Industry kete grid */}
        <section className="py-24 px-6 sm:px-10">
          <div className="max-w-6xl mx-auto">
            <p className="font-mono text-[11px] tracking-[0.32em] uppercase text-assembl-text-secondary mb-3">
              02 · Industry kete
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-assembl-taupe-deep mb-4">
              Eight ketes. Eight whispers of colour.
            </h2>
            <p className="text-assembl-text-body max-w-2xl mb-12">
              Each industry kete carries a single accent — never a fill. Switching workspaces
              swaps the accent + kete portrait, never the layout.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {INDUSTRY_KETE_LIST.map((k) => (
                <article
                  key={k.code}
                  className="rounded-card overflow-hidden border bg-white"
                  style={{
                    borderColor: "rgba(142,129,119,0.14)",
                    boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
                  }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={k.image}
                      alt={`${k.industry} kete — ${k.accentName} accent`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div
                      aria-hidden
                      className="absolute bottom-3 right-3 w-3 h-3 rounded-full ring-2 ring-white"
                      style={{ backgroundColor: k.accentHex }}
                    />
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-assembl-text-secondary mb-1">
                      {k.code}
                    </div>
                    <div className="font-display text-2xl text-assembl-taupe-deep mb-1">
                      {k.industry}
                    </div>
                    <div className="text-xs text-assembl-text-secondary mb-3">
                      {k.accentName}
                    </div>
                    <button
                      onClick={() => copy(k.accentHex, k.code)}
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] text-assembl-text-secondary hover:text-assembl-taupe-deep"
                    >
                      {copied === k.code ? "Copied" : k.accentHex}
                      <Copy className="w-3 h-3 opacity-60" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="py-24 px-6 sm:px-10 bg-white/40">
          <div className="max-w-6xl mx-auto">
            <p className="font-mono text-[11px] tracking-[0.32em] uppercase text-assembl-text-secondary mb-3">
              03 · Typography
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-assembl-taupe-deep mb-12">
              A serif that breathes. A sans that supports.
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div
                className="p-8 rounded-card border bg-white"
                style={{
                  borderColor: "rgba(142,129,119,0.14)",
                  boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
                }}
              >
                <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-assembl-text-secondary mb-4">
                  Display
                </div>
                <div className="font-display text-5xl leading-tight text-assembl-taupe-deep mb-3">
                  Aa <em className="text-assembl-taupe">Bb</em>
                </div>
                <div className="text-sm text-assembl-text-body">Cormorant Garamond</div>
                <div className="text-xs text-assembl-text-secondary mt-1">300 · 400 · italic</div>
              </div>
              <div
                className="p-8 rounded-card border bg-white"
                style={{
                  borderColor: "rgba(142,129,119,0.14)",
                  boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
                }}
              >
                <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-assembl-text-secondary mb-4">
                  Body / UI
                </div>
                <div className="text-5xl leading-tight text-assembl-taupe-deep mb-3" style={{ fontFamily: "Inter" }}>
                  Aa Bb
                </div>
                <div className="text-sm text-assembl-text-body">Inter</div>
                <div className="text-xs text-assembl-text-secondary mt-1">400 · 500 · 600</div>
              </div>
              <div
                className="p-8 rounded-card border bg-white"
                style={{
                  borderColor: "rgba(142,129,119,0.14)",
                  boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
                }}
              >
                <div className="font-mono text-[11px] tracking-[0.32em] uppercase text-assembl-text-secondary mb-4">
                  Metadata
                </div>
                <div className="font-mono text-4xl leading-tight text-assembl-taupe-deep mb-3">
                  Aa Bb
                </div>
                <div className="text-sm text-assembl-text-body">IBM Plex Mono</div>
                <div className="text-xs text-assembl-text-secondary mt-1">400 · 500</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA copy + buttons */}
        <section className="py-24 px-6 sm:px-10">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
              <p className="font-mono text-[11px] tracking-[0.32em] uppercase text-assembl-text-secondary mb-3">
                04 · CTA voice
              </p>
              <h2 className="font-display text-4xl text-assembl-taupe-deep mb-6">
                Calm verbs, never urgent.
              </h2>
              <ul className="space-y-3 text-assembl-text-body">
                <li>· See what a quiet day looks like</li>
                <li>· Request access</li>
                <li>· Open pack</li>
                <li>· View activity</li>
              </ul>
            </div>
            <div className="flex flex-col gap-4 justify-center">
              <button
                className="px-6 py-3 rounded-pill text-sm font-medium self-start"
                style={{ backgroundColor: "#9D8C7D", color: "#F7F3EE" }}
              >
                Primary — Open pack
              </button>
              <button
                className="px-6 py-3 rounded-pill text-sm font-medium self-start border"
                style={{ borderColor: "#D8C8B4", color: "#6F6158", backgroundColor: "transparent" }}
              >
                Secondary — Request access
              </button>
            </div>
          </div>
        </section>

        {/* Downloads */}
        <section className="py-24 px-6 sm:px-10 bg-white/40">
          <div className="max-w-6xl mx-auto">
            <p className="font-mono text-[11px] tracking-[0.32em] uppercase text-assembl-text-secondary mb-3">
              05 · Downloads
            </p>
            <h2 className="font-display text-4xl text-assembl-taupe-deep mb-10">
              Source assets.
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="/brand/Assembl_Brand_Guidelines.pdf"
                download
                className="flex items-center justify-between p-5 rounded-card border bg-white hover:-translate-y-0.5 transition-transform"
                style={{
                  borderColor: "rgba(142,129,119,0.14)",
                  boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
                }}
              >
                <div>
                  <div className="font-display text-xl text-assembl-taupe-deep">Brand Book</div>
                  <div className="text-xs text-assembl-text-secondary">PDF · v1.0</div>
                </div>
                <Download className="w-5 h-5 text-assembl-taupe" />
              </a>
              <a
                href="/brand/kete-overview.jpg"
                download
                className="flex items-center justify-between p-5 rounded-card border bg-white hover:-translate-y-0.5 transition-transform"
                style={{
                  borderColor: "rgba(142,129,119,0.14)",
                  boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
                }}
              >
                <div>
                  <div className="font-display text-xl text-assembl-taupe-deep">Kete overview</div>
                  <div className="text-xs text-assembl-text-secondary">JPG · all 8 industry tints</div>
                </div>
                <Download className="w-5 h-5 text-assembl-taupe" />
              </a>
              <div
                className="p-5 rounded-card border bg-white"
                style={{
                  borderColor: "rgba(142,129,119,0.14)",
                  boxShadow: "0 8px 30px rgba(111,97,88,0.08)",
                }}
              >
                <div className="font-display text-xl text-assembl-taupe-deep mb-1">Fonts</div>
                <div className="text-xs text-assembl-text-secondary mb-3">Loaded from Google Fonts</div>
                <ul className="font-mono text-[11px] text-assembl-text-secondary space-y-1">
                  <li>Cormorant Garamond</li>
                  <li>Inter</li>
                  <li>IBM Plex Mono</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
