// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  reactStrictMode: true,

  // tương đương vite server.proxy
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://10.14.80.150:3000/:path*",
  //     },
  //   ];
  // },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // sourcemap
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ['10.14.80.224'],

  // build output - Tắt standalone cho development
  output: "standalone", // Uncomment khi deploy production với Docker

  experimental: {
    optimizePackageImports: ["antd", "react-icons"],
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
