import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.16.0.2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ncqrrmpmyacygsajjtwf.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
