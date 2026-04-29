import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - To allow Next.js HMR across network
  allowedDevOrigins: ["192.168.2.105", "http://192.168.2.105"],
};

export default nextConfig;
