'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@lib/supabase';
import Image from 'next/image';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);

  // 1. Ambil data banner dari database
  const fetchBanners = async () => {
    try {
      setLoadingFetch(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (err: any) {
      alert('Gagal mengambil data banner: ' + err.message);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // 2. Proses Tambah Banner (Upload Gambar + Simpan Data)
  const handleAddBanner = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Silakan pilih gambar banner terlebih dahulu!');

    try {
      setUploading(true);

      // A. Upload file gambar ke Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `hero-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // B. Ambil URL Publik Gambar yang berhasil di-upload
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);

      // C. Simpan data informasi banner ke Tabel Database
      const { error: insertError } = await supabase.from('banners').insert([
        {
          title: title,
          link_url: linkUrl,
          image_url: publicUrl,
          is_active: true
        }
      ]);

      if (insertError) throw insertError;

      alert('Banner baru berhasil ditambahkan!');
      
      // Reset Form & Refresh Data
      setTitle('');
      setLinkUrl('');
      setFile(null);
      fetchBanners();
    } catch (err: any) {
      alert('Gagal menambah banner: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. Fungsi Hapus Banner
  const handleDeleteBanner = async (id: string, imageUrl: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus banner ini?')) return;

    try {
      // A. Ambil nama file dari URL untuk menghapus filenya di Storage
      // Contoh URL: .../storage/v1/object/public/banners/hero-banners/namafile.png
      const pathSegments = imageUrl.split('/banners/');
      if (pathSegments.length > 1) {
        const storagePath = pathSegments[1];
        await supabase.storage.from('banners').remove([storagePath]);
      }

      // B. Hapus data dari database
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;

      alert('Banner berhasil dihapus!');
      fetchBanners(); // Refresh list
    } catch (err: any) {
      alert('Gagal menghapus banner: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-white bg-slate-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Banner Promosi</h1>
          <p className="text-slate-400 text-sm mt-1">Atur banner hero yang tampil di halaman beranda toko</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM TAMBAH BANNER */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit shadow-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>➕</span> Tambah Banner Baru
          </h2>
          <form onSubmit={handleAddBanner} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Nama / Judul Banner</label>
              <input
                type="text"
                required
                placeholder="Misal: Promo Ramadhan Diskon 50%"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Link Tujuan (Opsional)</label>
              <input
                type="text"
                placeholder="Misal: /product/uuid-produk-kamu"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition text-sm"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">File Gambar Banner</label>
              <input
                type="file"
                accept="image/*"
                required
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              />
              <p className="text-xs text-slate-500 mt-1">Disarankan rasio landscape (misal: 16:9 atau 3:1)</p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold p-3 rounded-xl transition duration-200 text-sm shadow-md shadow-emerald-900/10"
            >
              {uploading ? 'Mengunggah Banner...' : 'Simpan & Publikasikan'}
            </button>
          </form>
        </div>

        {/* DAFTAR BANNER AKTIF */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🖼️</span> Banner Terpasang ({banners.length})
          </h2>

          {loadingFetch ? (
            <div className="text-slate-400 text-sm animate-pulse">Memuat daftar banner...</div>
          ) : banners.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm">
              Belum ada banner yang diunggah. Silakan tambah di menu sebelah kiri.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center shadow-md">
                  <div className="relative w-full sm:w-48 h-28 bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 border border-slate-800">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h3 className="font-semibold text-white text-base">{banner.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-xs md:max-w-md">
                      🔗 Link: {banner.link_url || <span className="text-slate-600">Tidak ada link</span>}
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      Aktif
                    </span>
                  </div>
                  <div className="w-full sm:w-auto flex justify-end">
                    <button
                      onClick={() => handleDeleteBanner(banner.id, banner.image_url)}
                      className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 p-2.5 rounded-xl transition duration-150 text-sm w-full sm:w-auto flex justify-center items-center gap-2"
                      title="Hapus Banner"
                    >
                      🗑️ <span className="sm:hidden font-medium">Hapus Banner</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}