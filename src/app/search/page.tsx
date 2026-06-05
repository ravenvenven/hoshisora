"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "../../../lib/supabase"; // Menyesuaikan jalur lib supabase yang sama dengan page.tsx utama
import Link from "next/link";

interface Product {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearchResults() {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Mencari produk dari tabel Supabase berdasarkan kata kunci URL
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .ilike("name", `%${query}%`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setProducts(data);
      } catch (err: any) {
        console.error("--- DETAIL ERROR DATABASE SEARCH ---");
        console.error("Pesan:", err?.message);
        console.error("------------------------------------");
      } finally {
        setLoading(false);
      }
    }

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Katalog Produk Hasil Pencarian */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        <div className="mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-emerald-600 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

        {/* Judul Tampilan Mirip Halaman Utama */}
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl mb-6">
          Hasil Pencarian untuk: <span className="text-emerald-600">"{query}"</span>
        </h2>
        
        {/* Kontrol Kondisi Loading (Pulse Skeleton Mirip Halaman Utama) */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-gray-100 animate-pulse rounded-xl h-64 border border-gray-200"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Tampilan jika pencarian kosong */
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center text-sm text-gray-400">
            Waduh, produk dengan kata kunci "<span className="text-emerald-600 font-medium">{query}</span>" tidak ditemukan.
          </div>
        ) : (
          /* Grid Tampilan Produk: Desain Card Diadopsi Penuh dari Halaman Utama */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              
              <Link 
                href={`/product/${product.id}`} 
                key={product.id} 
                className="group bg-white border border-gray-100 rounded-xl overflow-hidden p-3 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between cursor-pointer"
              >
                {/* Gambar Produk */}
                <div className="aspect-square w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <span className="text-xs text-gray-300">No Image</span>
                  )}
                </div>

                {/* Detail Informasi */}
                <div className="mt-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-emerald-600 transition">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {product.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Harga & Status Tombol Detail */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-600">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <span className="bg-slate-100 group-hover:bg-slate-900 text-slate-800 group-hover:text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition duration-200">
                      Detail
                    </span>
                  </div>
                </div>
              </Link>

            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Komponen Utama pembungkus Suspense agar aman saat build Next.js
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-gray-400 animate-pulse">Memuat halaman pencarian...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}