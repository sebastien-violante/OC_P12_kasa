import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
      {
        source: "/auth/:path*",
        destination: "http://localhost:8000/auth/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-eu-west-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;