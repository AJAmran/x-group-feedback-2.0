import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Compiler & Build Optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  // Image & Asset Optimization
  images: {
    formats: ["image/webp", "image/avif"],
    // Use modern AVIF for better compression
  },

  // Tree-shaking and Performance
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "zod",
      "react-hook-form"
    ],
  },

  // Security & Best Practices
  poweredByHeader: false,
  compress: true,
  
  // Production Bundle Minimizer
  productionBrowserSourceMaps: false,
};

export default nextConfig;

