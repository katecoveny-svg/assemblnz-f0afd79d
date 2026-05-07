import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub.hyperagent.com",
        pathname: "/api/published/**",
      },
    ],
  },
  async redirects() {
    return [
      // Existing: kete name correction (Tōroa → Tōro)
      { source: "/kete/toroa", destination: "/kete/toro", permanent: true },

      // ── Apex Next.js owns: /, /about, /contact, /pricing, /kete/[slug] ──
      // Everything below redirects to the legacy Vite SPA at app.assembl.co.nz.
      // 307 (temporary) — preserves option to migrate routes back to apex
      // post-demo without browser cache invalidation issues.

      // Bare-slug kete dashboards (legacy Vite, different from /kete/[slug] which is Next.js)
      { source: "/manaaki/:path*", destination: "https://app.assembl.co.nz/manaaki/:path*", permanent: false },
      { source: "/waihanga/:path*", destination: "https://app.assembl.co.nz/waihanga/:path*", permanent: false },
      { source: "/pikau/:path*", destination: "https://app.assembl.co.nz/pikau/:path*", permanent: false },
      { source: "/auaha/:path*", destination: "https://app.assembl.co.nz/auaha/:path*", permanent: false },
      { source: "/arataki/:path*", destination: "https://app.assembl.co.nz/arataki/:path*", permanent: false },
      { source: "/hoko/:path*", destination: "https://app.assembl.co.nz/hoko/:path*", permanent: false },
      { source: "/ako/:path*", destination: "https://app.assembl.co.nz/ako/:path*", permanent: false },

      // Tōroa legacy spelling (different from /kete/toroa, which redirects to /kete/toro above)
      { source: "/toroa", destination: "https://app.assembl.co.nz/toroa", permanent: false },
      { source: "/toroa/:path*", destination: "https://app.assembl.co.nz/toroa/:path*", permanent: false },

      // Tōro subpaths (NOT /kete/toro — that one stays on Next.js)
      { source: "/toro/:path*", destination: "https://app.assembl.co.nz/toro/:path*", permanent: false },

      // Admin & operations
      { source: "/admin", destination: "https://app.assembl.co.nz/admin", permanent: false },
      { source: "/admin/:path*", destination: "https://app.assembl.co.nz/admin/:path*", permanent: false },
      { source: "/operator/:path*", destination: "https://app.assembl.co.nz/operator/:path*", permanent: false },
      { source: "/care/:path*", destination: "https://app.assembl.co.nz/care/:path*", permanent: false },

      // Demos & embeds
      { source: "/demos/:path*", destination: "https://app.assembl.co.nz/demos/:path*", permanent: false },
      { source: "/embed", destination: "https://app.assembl.co.nz/embed", permanent: false },
      { source: "/embed/:path*", destination: "https://app.assembl.co.nz/embed/:path*", permanent: false },

      // Chat & agents
      { source: "/chat", destination: "https://app.assembl.co.nz/chat", permanent: false },
      { source: "/chat/:path*", destination: "https://app.assembl.co.nz/chat/:path*", permanent: false },
      { source: "/agents/:path*", destination: "https://app.assembl.co.nz/agents/:path*", permanent: false },

      // AAAIP audit dashboard
      { source: "/aaaip", destination: "https://app.assembl.co.nz/aaaip", permanent: false },
      { source: "/aaaip/:path*", destination: "https://app.assembl.co.nz/aaaip/:path*", permanent: false },

      // Auth flows
      { source: "/login", destination: "https://app.assembl.co.nz/login", permanent: false },
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
