// src/app/(shop)/components/BannerSlider.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@lib/supabase";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string; // Tanda '?' sangat penting di sini
}

// Komponen bantu untuk merender gambar (Fixed Structure)
function BannerImage({ banner, index }: { banner: Banner; index: number }) {
  return (
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
  );
}

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from("banners")
          .select("id, title, image_url, link_url")
          .eq("is_active", true)
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

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="w-full h-[180px] sm:h-[280px] md:h-[380px] bg-slate-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative">
      <div className="overflow-hidden rounded-2xl shadow-sm" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, index) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
              {/* LOGIKA EKSPLISIT: Tanpa variabel Wrapper/wrapperProps */}
              {banner.link_url ? (
                <Link href={banner.link_url} className="block w-full cursor-pointer">
                  <BannerImage banner={banner} index={index} />
                </Link>
              ) : (
                <div className="block w-full">
                  <BannerImage banner={banner} index={index} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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