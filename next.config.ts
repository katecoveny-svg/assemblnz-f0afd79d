import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      {
        source: "/kete/toroa",
        destination: "/kete/toro",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
