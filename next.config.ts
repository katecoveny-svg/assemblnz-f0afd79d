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
      // Existing: kete name correction (Tōroa → Tōro). Keep this in Next.js;
      // public SPA paths are handled by middleware rewrites before auth.
      { source: "/toro", destination: "/kete/toro", permanent: false },
      { source: "/toro/route", destination: "/hapai/voyage-italy", permanent: false },
      { source: "/toro/route/:path*", destination: "/hapai/voyage-italy", permanent: false },
      { source: "/toro/school-survival", destination: "/hapai/9am-brief", permanent: false },
      { source: "/toro/school-survival/:path*", destination: "/hapai/9am-brief", permanent: false },
      { source: "/toroa", destination: "/kete/toro", permanent: true },
      { source: "/kete/toroa", destination: "/kete/toro", permanent: true },
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

      // Admin & operations
      { source: "/admin", destination: "https://app.assembl.co.nz/admin", permanent: false },
      { source: "/admin/:path*", destination: "https://app.assembl.co.nz/admin/:path*", permanent: false },
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
