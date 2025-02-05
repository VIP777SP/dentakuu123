import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3)$/,
      type: 'asset/resource'
    });
    return config;
  },
  // Vercel用の設定を追加
  output: 'standalone',
};

export default nextConfig;
