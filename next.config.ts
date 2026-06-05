import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**", 
      },
      // ✨ Tambahkan ini agar gambar dari database Supabase lu bisa dimuat pakai <Image> Next.js
      {
        protocol: "https",
        hostname: "*.supabase.co", // Tanda bintang (*) mengizinkan semua sub-domain Supabase
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;