// src/app/categories/page.tsx
"use client";

import Link from "next/link";

export default function CategoriesPage() {
  // Data kategori riil e-commerce dengan konfigurasi gaya visual premium
  const categories = [
    {
      name: "Pakaian & Fashion",
      slug: "fashion",
      desc: "Kemeja, jaket, kaos kasual, dan tren gaya terkini",
      count: "142 Produk",
      bgColor: "bg-amber-50 border-amber-100",
      iconColor: "bg-amber-500 text-white",
      hoverColor: "hover:border-amber-400 hover:shadow-amber-100/50",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
    },
    {
      name: "Gadget & Elektronik",
      slug: "elektronik",
      desc: "Smartphone, TWS, audio, dan aksesoris daya premium",
      count: "120 Produk",
      bgColor: "bg-blue-50 border-blue-100",
      iconColor: "bg-blue-500 text-white",
      hoverColor: "hover:border-blue-400 hover:shadow-blue-100/50",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Kebutuhan Rumah Tangga",
      slug: "rumah-tangga",
      desc: "Alat masak, organizer wadah, dan dekorasi estetik",
      count: "76 Produk",
      bgColor: "bg-emerald-50 border-emerald-100",
      iconColor: "bg-emerald-500 text-white",
      hoverColor: "hover:border-emerald-400 hover:shadow-emerald-100/50",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Kecantikan & Skincare",
      slug: "kecantikan",
      desc: "Serum wajah, sunscreen, dan perawatan tubuh harian",
      count: "67 Produk",
      bgColor: "bg-rose-50 border-rose-100",
      iconColor: "bg-rose-500 text-white",
      hoverColor: "hover:border-rose-400 hover:shadow-rose-100/50",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    // bg-slate-50 dengan grid penengah vertikal-horizontal yang presisi
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen text-gray-900 flex flex-col items-center justify-center">
      
      {/* Container utama pembungkus konten agar proporsional di HP & Desktop */}
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-md border border-gray-200/60 p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            E-Commerce Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-2.5">
            Eksplorasi Kategori
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Pilih rumpun produk jualan untuk mempermudah pencarian Anda
          </p>
        </div>

        {/* List Menu Item Desain Premium */}
        <div className="space-y-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={`flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:scale-[1.01] hover:shadow-lg transition-all duration-300 group ${cat.hoverColor}`}
            >
              <div className="flex items-center gap-4">
                {/* Lingkaran Wadah Ikon */}
                <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 duration-300 ${cat.iconColor}`}>
                  {cat.icon}
                </div>

                {/* Informasi Judul & Deskripsi Kategori */}
                <div className="text-left space-y-0.5">
                  <span className="font-bold text-gray-800 text-sm sm:text-base block tracking-tight">
                    {cat.name}
                  </span>
                  <p className="text-xs text-gray-400 font-normal line-clamp-1 max-w-[180px] sm:max-w-[280px]">
                    {cat.desc}
                  </p>
                </div>
              </div>

              {/* Sisi Kanan: Badge Jumlah Barang + Tombol Panah Minimalis */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border tracking-wide ${cat.bgColor}`}>
                  {cat.count}
                </span>
                
                {/* Ikon Arrow Chevron Kanan */}
                <div className="w-7 h-7 bg-slate-50 group-hover:bg-gray-900 rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg 
                    className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}