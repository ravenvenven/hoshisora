// src/app/components/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // State untuk buka/tutup menu di HP

  // Daftar menu nyata untuk Panel Admin Toko Online
  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Kelola Banner",
      path: "/admin/banners",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Kelola Produk",
      path: "/admin/products",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: "Pesanan Masuk",
      path: "/admin/orders",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* 1. TOMBOL HAMBURGER UNTUK LAYAR HP (Muncul hanya di HP) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-slate-900 text-white shadow-md focus:outline-none"
        >
          {isOpen ? (
            // Ikon Silang (Close)
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Ikon Garis Tiga (Hamburger)
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* BACKDROP GELAP DI HP (Klik di luar menu untuk menutup) */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 2. SIDEBAR UTAMA */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 p-5 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header/Logo Sidebar */}
        <div className="mb-8 mt-12 lg:mt-0 border-b border-slate-800 pb-5">
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
            Hoshi Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">hoshisora - Control Panel</p>
        </div>

        {/* Menu Navigasi List */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.label}
                href={item.path}
                onClick={() => setIsOpen(false)} // Otomatis tutup di HP setelah klik menu
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-900/30"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="absolute bottom-5 left-5 right-5">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
          >
            &larr; Lihat Toko Depan
          </Link>
        </div>
      </aside>
    </>
  );
}