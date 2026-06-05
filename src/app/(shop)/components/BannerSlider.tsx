// src/app/(shop)/components/BannerSlider.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@lib/supabase"; // Sesuaikan path `@lib/supabase` dengan proyekmu

// Interface menyesuaikan kolom di tabel 'banners' Supabase
interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
}

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Inisialisasi Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  // 1. Ambil data banner aktif dari Supabase
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from("banners")
          .select("id, title, image_url, link_url")
          .eq("is_active", true) // Hanya tampilkan banner yang di-set aktif oleh admin
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBanners(data || []);
      } catch (err) {
        console.error("Gagal mengambil data banner utama:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  // Skeleton Loading saat data sedang diambil dari database
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="w-full h-[180px] sm:h-[280px] md:h-[380px] bg-slate-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  // Jika admin belum mengunggah banner sama sekali atau dinonaktifkan semua, slider tidak usah muncul
  if (banners.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative">
      
      {/* AREA SLIDER BANNER */}
      <div className="overflow-hidden rounded-2xl shadow-sm" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, index) => {
            // Logika pembungkus: Jika ada link_url pakai <Link>, jika kosong pakai <div> biasa
            const Wrapper = banner.link_url ? Link : "div";
            // PERBAIKAN: Menambahkan 'as any' agar TypeScript tidak error pada komponen <div>
            const wrapperProps = (banner.link_url ? { href: banner.link_url } : {}) as any;

            return (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
                <Wrapper {...wrapperProps} className="block w-full cursor-pointer">
                  {/* Batasan Tinggi Area Gambar */}
                  <div className="w-full h-[180px] sm:h-[280px] md:h-[380px] relative rounded-2xl overflow-hidden">
                    <Image
                      src={banner.image_url}
                      alt={banner.title}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, (max-w: 1200px) 80vw, 1200px"
                      className="object-cover"
                    />
                  </div>
                </Wrapper>
              </div>
            );
          })}
        </div>
      </div>

      {/* INDIKATOR TITIK (DOTS) */}
      {banners.length > 1 && (
        <div className="flex justify-center space-x-2 mt-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
              className={`h-2 transition-all rounded-full ${
                index === selectedIndex ? "w-6 bg-emerald-600" : "w-2 bg-gray-300"
              }`}
              aria-label={`Ke slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}