import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // يتجاوز أخطاء TypeScript أثناء البناء على Render
    ignoreBuildErrors: true,
  },
  eslint: {
    // يتجاوز أخطاء ESLint أثناء البناء
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;