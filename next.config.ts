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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub.hyperagent.com",
        pathname: "/api/published/**",
      },
    ],
  },
  async rewrites() {
    return [
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
      // Existing: kete name correction (Tōroa → Tōro). Keep this in Next.js;
      // public SPA paths are handled by middleware rewrites before auth.
      { source: "/kete/toroa", destination: "/kete/toro", permanent: true },

      // Admin & operations
      { source: "/admin", destination: "https://app.assembl.co.nz/admin", permanent: false },
      { source: "/admin/:path*", destination: "https://app.assembl.co.nz/admin/:path*", permanent: false },
      { source: "/operator/:path*", destination: "https://app.assembl.co.nz/operator/:path*", permanent: false },
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
