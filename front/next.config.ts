import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1234",
        pathname: "/uploads/**", // Autorise tout le contenu de la cale
      },
    ],
  },
};

export default nextConfig;
