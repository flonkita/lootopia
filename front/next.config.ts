import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1234",
        pathname: "/uploads/**",
      },
      // 🆕 Astuce : On ajoute aussi ton IP pour les images si tu charges tes avatars sur mobile !
      {
        protocol: "http",
        hostname: "10.111.0.225",
        port: "1234",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
