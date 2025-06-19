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
  webpack: (config) => {
    config.ignoreWarnings = [
      (warning: any) =>
        typeof warning.message === 'string' &&
        warning.message.includes('Critical dependency: require function is used in a way in which dependencies cannot be statically extracted'),
      (warning: any) =>
        typeof warning.message === 'string' &&
        warning.message.includes('Critical dependency: the request of a dependency is an expression'),
    ];
    return config;
  },
};

export default nextConfig;
