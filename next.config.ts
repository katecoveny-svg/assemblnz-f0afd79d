import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub.hyperagent.com",
        pathname: "/api/published/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/c/:slug/embed',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/static-hapai/vessel-studio/:path*',
        destination: '/hapai/vessel-studio/:path*',
      },
      {
        source: '/static-hapai/caption-composer/:path*',
        destination: '/hapai/caption-composer/:path*',
      },
      {
        source: '/static-hapai/brief-generator/:path*',
        destination: '/hapai/brief-generator/:path*',
      },
      {
        source: '/static-hapai/og-card-generator/:path*',
        destination: '/hapai/og-card-generator/:path*',
      },
      {
        source: '/static-hapai/tagline-workshop/:path*',
        destination: '/hapai/tagline-workshop/:path*',
      },
      // Mana Receipts public keyring — canonical /.well-known/ path.
      // Implemented as an internal rewrite because Next.js App Router does
      // not love folder names that start with a dot.
      {
        source: '/.well-known/assembl-agent-keys.json',
        destination: '/well-known/assembl-agent-keys',
      },
    ];
  },
  async redirects() {
    return [
      // ── v2 site (2026-07-02): /pricing is canonical again. The marketplace
      // ladder page at /agents/pricing folded into it — 301 the old URL so
      // saved links, paywall CTAs and indexed pages land on the one ladder.
      { source: "/agents/pricing", destination: "/pricing", permanent: true },

      // Pre-pivot "Pick your crew" browser (kete taxonomy) retired in the
      // 2026-07-05 consolidation — the marketplace grid is the one shelf.
      { source: "/agents/pick", destination: "/agents", permanent: true },

      // Brand rename: "Dash by assembl" → "Assembling" (2 Jul 2026). The
      // ad-network microsite moved from /dash to /assembling; 301 the old paths
      // so saved links and any indexed pages don't 404. /beat (the pre-Dash
      // name, PR #424) now points straight at /assembling to avoid a 301 chain.
      // NOTE: /api/dash/* and the dash_* tables keep their names — external SDK
      // consumers and the deployed schema depend on them (rename is a separate
      // decision, see docs/assembling-rename-manual-steps.md).
      { source: "/beat", destination: "/assembling", permanent: true },
      { source: "/beat/:path*", destination: "/assembling/:path*", permanent: true },
      { source: "/dash", destination: "/assembling", permanent: true },
      { source: "/dash/:path*", destination: "/assembling/:path*", permanent: true },

      // ── Stale pre-pivot surfaces → the /agents marketplace (hidden 2026-06-23)
      // The marketplace replaces the old kete packs and the one-off vertical /
      // operator landing pages. Source files are KEPT (copy may be reused) but
      // unlinked from nav/footer + noindexed, and 301'd here so saved links and
      // any indexed pages land on the marketplace instead of 404ing.
      //
      // NOTE: the functional /toro deep links (route, school-survival) keep their
      // own destinations and are declared ABOVE the /toro catch-all so they win.
      { source: "/toro/route", destination: "/app/voyage/italy", permanent: false },
      { source: "/toro/route/:path*", destination: "/app/voyage/italy", permanent: false },
      { source: "/toro/school-survival", destination: "/hapai/9am-brief", permanent: false },
      { source: "/toro/school-survival/:path*", destination: "/hapai/9am-brief", permanent: false },
      { source: "/toro", destination: "/agents", permanent: true },
      { source: "/toroa", destination: "/agents", permanent: true },
      // /bundles has no index page — collections browse from the marketplace.
      { source: "/bundles", destination: "/agents", permanent: false },
      // Kete → Bundles (V4 marketplace cull, 2026-07-01). The old Kete vertical
      // landing pages fold into the new bundle front doors. Real /kete/*/tools/*
      // tool routes stay live via more-specific paths above/below.
      { source: "/kete/waihanga", destination: "/bundles/assembler", permanent: true },
      { source: "/kete/arataki", destination: "/bundles/forge", permanent: true },
      { source: "/kete/toro", destination: "/bundles/hearth", permanent: true },
      { source: "/kete/manaaki", destination: "/bundles/practice", permanent: true },
      { source: "/kete/auaha", destination: "/bundles/ensemble", permanent: true },
      { source: "/kete/hangarau", destination: "/bundles/counsel", permanent: true },
      { source: "/kete/pakihi", destination: "/bundles/assembler", permanent: true },
      { source: "/kete", destination: "/agents", permanent: true },
      { source: "/kete/:path*", destination: "/agents", permanent: true },

      // ── Agent slug renames (V4 marketplace cull, 2026-07-01)
      // Renamed survivors — 301 the old slug to its new home.
      { source: "/agents/care-scribe", destination: "/agents/quill", permanent: true },
      { source: "/agents/care-scribe/:path*", destination: "/agents/quill/:path*", permanent: true },
      { source: "/agents/voice-cs", destination: "/agents/front", permanent: true },
      { source: "/agents/voice-cs/:path*", destination: "/agents/front/:path*", permanent: true },
      { source: "/agents/power-watch", destination: "/agents/switch", permanent: true },
      { source: "/agents/power-watch/:path*", destination: "/agents/switch/:path*", permanent: true },
      { source: "/agents/inbox-triage", destination: "/agents/sweep", permanent: true },
      { source: "/agents/inbox-triage/:path*", destination: "/agents/sweep/:path*", permanent: true },
      { source: "/agents/tax-tidy", destination: "/agents/treasury", permanent: true },
      { source: "/agents/tax-tidy/:path*", destination: "/agents/treasury/:path*", permanent: true },
      { source: "/agents/hui-notes", destination: "/agents/hui", permanent: true },
      { source: "/agents/hui-notes/:path*", destination: "/agents/hui/:path*", permanent: true },
      { source: "/agents/9am-brief", destination: "/agents/dawn", permanent: true },
      { source: "/agents/9am-brief/:path*", destination: "/agents/dawn/:path*", permanent: true },
      { source: "/agents/care-captain", destination: "/agents/awhi", permanent: true },
      { source: "/agents/care-captain/:path*", destination: "/agents/awhi/:path*", permanent: true },
      { source: "/agents/roster-sorter", destination: "/agents/pipeline", permanent: true },
      { source: "/agents/roster-sorter/:path*", destination: "/agents/pipeline/:path*", permanent: true },
      { source: "/agents/meeting-records", destination: "/agents/hui", permanent: true },
      { source: "/agents/meeting-records/:path*", destination: "/agents/hui/:path*", permanent: true },

      // Killed → survivor / bundle lead.
      { source: "/agents/building-consent", destination: "/agents/whakaae", permanent: true },
      { source: "/agents/building-consent/:path*", destination: "/agents/whakaae/:path*", permanent: true },
      { source: "/agents/whanau-help", destination: "/agents/toro", permanent: true },
      { source: "/agents/whanau-help/:path*", destination: "/agents/toro/:path*", permanent: true },
      { source: "/agents/customs-entry", destination: "/agents/pikau", permanent: true },
      { source: "/agents/customs-entry/:path*", destination: "/agents/pikau/:path*", permanent: true },
      { source: "/agents/maritime-brief", destination: "/agents/tide-weather", permanent: true },
      { source: "/agents/maritime-brief/:path*", destination: "/agents/tide-weather/:path*", permanent: true },
      { source: "/agents/motor", destination: "/agents/arataki", permanent: true },
      { source: "/agents/motor/:path*", destination: "/agents/arataki/:path*", permanent: true },
      { source: "/agents/transit", destination: "/agents/arataki", permanent: true },
      { source: "/agents/transit/:path*", destination: "/agents/arataki/:path*", permanent: true },
      { source: "/agents/transit-freight", destination: "/agents/arataki", permanent: true },
      { source: "/agents/transit-freight/:path*", destination: "/agents/arataki/:path*", permanent: true },
      { source: "/industry-pack", destination: "/agents", permanent: true },
      { source: "/industry-pack/:path*", destination: "/agents", permanent: true },
      { source: "/insurance", destination: "/agents", permanent: true },
      { source: "/insurance/:path*", destination: "/agents", permanent: true },
      { source: "/platform", destination: "/agents", permanent: true },
      { source: "/platform/:path*", destination: "/agents", permanent: true },
      { source: "/outputs", destination: "/agents", permanent: true },
      { source: "/outputs/:path*", destination: "/agents", permanent: true },
      { source: "/tools/vessel", destination: "/agents", permanent: true },
      { source: "/tools/vessel/:path*", destination: "/agents", permanent: true },
      // NOTE: /operator/arataki/* is NO LONGER stale — Arataki is a live
      // marketplace agent (slug `arataki`) whose toolHref routes here after
      // install. The pages are auth-gated + noindexed, so they need no SEO
      // redirect. Re-adding a redirect here would dead-end the install flow.
      { source: "/privacy", destination: "/legal/privacy", permanent: true },
      { source: "/free-tools", destination: "/hapai", permanent: false },
      { source: "/free-tools/:path*", destination: "/hapai", permanent: false },
      { source: "/hapai/vessel-studio/vessel-studio.html", destination: "/hapai/vessel-studio", permanent: false },
      { source: "/hapai/vessel-studio/index.html", destination: "/hapai/vessel-studio", permanent: false },
      { source: "/hapai/caption-composer/caption-composer.html", destination: "/hapai/caption-composer", permanent: false },
      { source: "/hapai/caption-composer/index.html", destination: "/hapai/caption-composer", permanent: false },
      { source: "/hapai/brief-generator/brief-generator.html", destination: "/hapai/brief-generator", permanent: false },
      { source: "/hapai/brief-generator/index.html", destination: "/hapai/brief-generator", permanent: false },
      { source: "/hapai/og-card-generator/og-card-generator.html", destination: "/hapai/og-card-generator", permanent: false },
      { source: "/hapai/og-card-generator/index.html", destination: "/hapai/og-card-generator", permanent: false },
      { source: "/hapai/tagline-workshop/tagline-workshop.html", destination: "/hapai/tagline-workshop", permanent: false },
      { source: "/hapai/tagline-workshop/index.html", destination: "/hapai/tagline-workshop", permanent: false },
      { source: "/tools/vessel-studio/:path*", destination: "/hapai/vessel-studio/:path*", permanent: false },
      { source: "/tools/caption-composer/:path*", destination: "/hapai/caption-composer/:path*", permanent: false },
      { source: "/tools/brief-generator/:path*", destination: "/hapai/brief-generator/:path*", permanent: false },
      { source: "/book-a-pilot", destination: "/pilot-sprint", permanent: false },

      // Meeting tool unified at /hui (canonical). The old HAPAI meeting-recorder
      // and its underlying meeting-notes page were the same tool at two URLs —
      // both now 308 to /hui.
      { source: "/hapai/meeting-recorder", destination: "/hui", permanent: true },
      { source: "/hapai/meeting-recorder/:path*", destination: "/hui", permanent: true },
      { source: "/hapai/meeting-notes", destination: "/hui", permanent: true },
      { source: "/hapai/meeting-notes/:path*", destination: "/hui", permanent: true },

      // Energy calculator moved under the /hapai library for path consistency.
      { source: "/electrify", destination: "/hapai/electrify", permanent: true },
      { source: "/electrify/:path*", destination: "/hapai/electrify/:path*", permanent: true },

      // Admin & operations
      // /admin is now the marketplace-era operator hub served by this app
      // (app/admin/*, gated by ensureAdmin) — no longer proxied to the legacy
      // Vite app. /operator stays on legacy until it is migrated.
      { source: "/operator", destination: "https://app.assembl.co.nz/operator", permanent: false },
      { source: "/operator/:path((?!arataki).*)", destination: "https://app.assembl.co.nz/operator/:path*", permanent: false },
      { source: "/care/:path*", destination: "https://app.assembl.co.nz/care/:path*", permanent: false },

      // Chat & agents
      { source: "/chat", destination: "https://app.assembl.co.nz/chat", permanent: false },
      { source: "/chat/:path*", destination: "https://app.assembl.co.nz/chat/:path*", permanent: false },

      // Auth flows
      // /login lives on the apex (Next.js App Router, Supabase Auth on
      // assembl-prod). /signup remains on the legacy Vite app for now —
      // out of scope for this PR.
      { source: "/signup", destination: "https://app.assembl.co.nz/signup", permanent: false },
      { source: "/onboarding", destination: "https://app.assembl.co.nz/onboarding", permanent: false },
      { source: "/onboarding/:path*", destination: "https://app.assembl.co.nz/onboarding/:path*", permanent: false },

      // Other product surfaces
      { source: "/voyage/:path*", destination: "https://app.assembl.co.nz/voyage/:path*", permanent: false },
      { source: "/apps/:path*", destination: "https://app.assembl.co.nz/apps/:path*", permanent: false },
      { source: "/sample/:path*", destination: "https://app.assembl.co.nz/sample/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
