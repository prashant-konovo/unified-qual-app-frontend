import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://a6e1211d45bda4b32b51f6b2d278bce7-2c5abb46dc88fb21.elb.us-east-2.amazonaws.com"}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
