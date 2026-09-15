import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.10",
    "192.168.1.*",
    "localhost",
    "127.0.0.1",
    "*.pinggy.net",
    "*.run.pinggy-free.link",
    "*.loca.lt",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
