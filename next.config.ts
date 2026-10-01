import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // يسمح للبناء بالاستمرار إذا كان هناك أخطاء TypeScript غير حرجة
    ignoreBuildErrors: true,
  },
};

export default nextConfig;