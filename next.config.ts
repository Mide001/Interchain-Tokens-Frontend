import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dd.dexscreener.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
