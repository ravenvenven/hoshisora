"use client";

import { useState, KeyboardEvent } from "react";

export default function SearchForm() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fungsi mendeteksi saat tombol Enter ditekan pada keyboard
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!searchQuery.trim()) return;

      console.log("Mencari produk:", searchQuery);
      
      // Mengarahkan ke rute halaman search bawaan
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleButtonClick = () => {
    if (!searchQuery.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
  };

  return (
    <div className="w-full max-w-[140px] sm:max-w-xs md:max-w-md relative flex items-center">
      <input
        type="text"
        placeholder="Cari..."
        className="w-full block p-1.5 sm:p-2 pl-4 pr-10 text-[11px] sm:text-sm text-gray-900 border border-transparent rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button 
        type="button" 
        onClick={handleButtonClick}
        className="absolute right-2 p-1 text-gray-400 hover:text-emerald-600 transition-colors"
        title="Klik untuk mencari"
      >
        <svg 
          className="w-4 h-4 sm:w-5 sm:h-5" 
          fill="none" 
          viewBox="0 0 20 20"
        >
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </button>
    </div>
  );
}