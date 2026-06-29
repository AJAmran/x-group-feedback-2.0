import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Compiler & Build Optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`
          : 'http://localhost:5000/api/v1/:path*', // Proxy to Express backend
      },
    ];
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

