'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Header from "./(shop)/components/Header";
import BannerSlider from "./(shop)/components/BannerSlider";
import BottomNav from "./(shop)/components/BottomNav";
import Link from 'next/link'; 

interface Product {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  category?: string;
}

// Daftar kategori untuk tombol (bisa ditambah/kurang di sini)
const categories = [
  { name: "", label: "Semua" },
  { name: "netflix", label: "Netflix 🍿" },
  { name: "spotify", label: "Spotify 🎵" },
  { name: "capcut", label: "Capcut ✂️" },
  { name: "youtube", label: "Youtube 📺" },
  { name: "zoom", label: "Zoom 💻" },
  { name: "disney", label: "Disney 🏰" },
  { name: "iqiyi", label: "Iqiyi 🎞️" },
  { name: "viu", label: "Viu 🌏" },
  { name: "bstation", label: "Bstation 🎐" },
  { name: "youku", label: "Youku 🏮" },
  { name: "moviebox", label: "Moviebox 📦" },
  { name: "vidio", label: "Vidio 📽️" },
  { name: "hbo go", label: "HBO Go 🎬" },
  { name: "max", label: "Max 🔝" },
  { name: "wetv", label: "Wetv 🐉" },
  { name: "reelshort", label: "Reelshort 📱" },
  { name: "melolo", label: "Melolo 🎶" },
  { name: "canva", label: "Canva 🎨" },
  { name: "alight motion", label: "Alight Motion 🎥" },
  { name: "piscart", label: "Piscart 🖼️" },
  { name: "wink", label: "Wink ✨" },
  { name: "getcontact", label: "Getcontact 🛡️" },
  { name: "polar", label: "Polar ❄️" },
  { name: "fizzo", label: "Fizzo 📖" },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }); 

        if (error) throw error;
        if (data) {
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (err: any) {
        console.error('--- DETAIL ERROR DATABASE HOSHISORA ---');
        console.error('Pesan:', err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!keyword.trim()) {
      setFilteredProducts(products);
    } else {
      const hasilSaring = products.filter((product) =>
        product.name.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredProducts(hasilSaring);
    }
  }, [keyword, products]);

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      <div className="pt-2">
        <BannerSlider />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
            {keyword ? `Menampilkan: ${keyword}` : 'Produk Terlaris'}
          </h2>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button 
                key={cat.name}
                onClick={() => setKeyword(cat.name)} 
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition duration-200 whitespace-nowrap ${
                  keyword === cat.name 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-gray-100 animate-pulse rounded-xl h-64 border border-gray-200"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center text-sm text-gray-400">
            Waduh, produk dengan kata kunci "<span className="text-emerald-600 font-medium">{keyword}</span>" belum tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Link 
                href={`/product/${product.id}`} 
                key={product.id} 
                className="group bg-white border border-gray-100 rounded-xl overflow-hidden p-3 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between cursor-pointer"
              >
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
                <div className="mt-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-emerald-600 transition">
                      {product.name}
                    </h3>
                  </div>
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
      <BottomNav />
    </div>
  );
}