// src/app/(shop)/components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Beranda",
      path: "/",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
   {
      label: "transaksi",
      path: "/transaction",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          {/* Icon Kuitansi/Nota Transaksi */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      label: "tutorial",
      path: "/tutorial",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          {/* Icon Buku Terbuka untuk Tutorial */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label: "Akun",
      path: "/profile",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    // bg-emerald-600: Mengunci background warna hijau segar disepanjang bar luar
    // w-full left-0 right-0: Menghapus batas ukuran luar agar menempel penuh 100% di monitor
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-emerald-600 border-t border-emerald-700 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-50">
      
      {/* 
        Area Konten Dalam Navigasi:
        - max-w-7xl mx-auto: Menjaga sebaran ikon agar tetap sejajar rapi dengan grid konten utama website Anda saat di monitor besar.
        - justify-between: Memaksa ikon menyebar ke kiri dan kanan sejauh mungkin (tidak mepet/kumpul di tengah).
        - px-8 sm:px-16 md:px-32: Jarak aman agar ikon terluar tidak menempel mentok ke pinggir layar monitor Anda.
      */}
      <div className="flex h-20 items-center justify-between max-w-7xl mx-auto px-8 sm:px-16 md:px-32">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.label}
              href={item.path}
              // max-w-[100px]: Memberikan ruang sentuh horizontal yang lebih lebar dan mantap untuk tiap tombol menu
              className="flex flex-col items-center justify-center w-full max-w-[100px] h-full gap-1.5 transition-all text-center"
            >
              {/* 
                Ikon Menu:
                - Jika Aktif: Berwarna putih solid bersinar (text-white) dan membesar sedikit.
                - Jika Tidak Aktif: Berwarna putih transparan lembut (text-emerald-100/70) agar kontrasnya seimbang.
              */}
              <div className={`transition-transform duration-200 ${isActive ? "scale-110 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]" : "text-emerald-100/70 hover:text-white"}`}>
                {item.icon}
              </div>
              
              {/* Teks Label Menu */}
              <span className={`text-[11px] sm:text-xs tracking-wide font-medium transition-colors duration-200 ${isActive ? "text-white font-bold" : "text-emerald-100/80"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}