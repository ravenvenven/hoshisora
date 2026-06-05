"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchForm from "./SearchForm";
import { supabase } from "../../../../lib/supabase"; // ⚠️ Pastikan path lib supabase ini sudah benar

export default function Header() {
  const [cartCount, setCartCount] = useState<number>(0);

  // 1. Fungsi mengambil jumlah produk berdasarkan user yang sedang login (Mematuhi RLS)
  const fetchCartCount = async () => {
    try {
      // Ambil user session aktif dari Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      
      // Jika user belum login, set keranjang ke 0
      if (!user) {
        setCartCount(0);
        return;
      }

      // Ambil data quantity dari tabel cart_items milik user ini
      const { data, error } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id); // Saringan ini wajib sejalan dengan aturan RLS

      if (error) throw error;

      if (data) {
        // Jumlahkan total quantity dari semua produk di dalam keranjang
        const total = data.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      }
    } catch (err) {
      console.error("Gagal mengambil data jumlah keranjang:", err);
    }
  };

  useEffect(() => {
    // Jalankan fungsi ambil data saat pertama kali komponen Header muncul
    fetchCartCount();

    // 2. Setup Realtime Listener: Angka berubah otomatis tiap kali ada isi tabel yang berubah (Tambah/Hapus/Update)
    const cartChannel = supabase
      .channel("realtime-cart-header")
      .on(
        "postgres_changes",
        { event: "*", pattern: "public", table: "cart_items" },
        () => {
          fetchCartCount(); // Panggil ulang database jika ada baris data masuk/keluar
        }
      )
      .subscribe();

    // Hapus channel realtime jika user pindah halaman agar memori bersih
    return () => {
      supabase.removeChannel(cartChannel);
    };
  }, []);

  return (
    <header className="bg-emerald-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-4">
          
          {/* 1. POJOK KIRI: Logo */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-base font-bold tracking-tight text-white sm:text-2xl border-none outline-none focus:ring-0"
            >
              Hoshisora
            </Link>
          </div>
          
          {/* 2. TENGAH: Tempat Pencarian */}
          <div className="flex-1 flex justify-center">
            <SearchForm />
          </div>

          {/* 3. POJOK KANAN: Tombol Keranjang Belanja */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/cart" className="relative p-2 text-white hover:text-emerald-200 transition-colors">
              <svg 
                className="w-6 h-6 sm:w-7 sm:h-7" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>

              {/* ✨ BADGE MERAH: Hanya merender komponen jika angka di atas 0 */}
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] sm:text-xs font-bold leading-none text-white bg-red-500 rounded-full transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}