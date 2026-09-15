import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/demo",
        destination: "/contact",
        permanent: false,
      },
      {
        source: "/compare/all-competitors",
        destination: "/compare",
        permanent: false,
      },
      {
        source: "/compare/all",
        destination: "/compare",
        permanent: false,
      },
      {
        source: "/compare/hireko",
        destination: "/compare",
        permanent: false,
      },
      {
        source: "/compare/directory",
        destination: "/compare",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;