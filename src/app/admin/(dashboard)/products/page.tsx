'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
}

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Form Input (Tambah / Edit)
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: '',
    category: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // 1. Ambil Data Produk dari Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error: any) {
      alert('Gagal mengambil data produk: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Simpan Produk (Tambah Baru atau Update yang Sudah Ada)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentId) {
        // Logika Update / Edit Produk
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            stock: Number(formData.stock),
            image_url: formData.image_url,
            category: formData.category
          })
          .eq('id', currentId);

        if (error) throw error;
        alert('Produk berhasil diperbarui!');
      } else {
        // Logika Tambah Produk Baru
        const { error } = await supabase
          .from('products')
          .insert([
            {
              name: formData.name,
              description: formData.description,
              price: Number(formData.price),
              stock: Number(formData.stock),
              image_url: formData.image_url,
              category: formData.category
            }
          ]);

        if (error) throw error;
        alert('Produk baru berhasil ditambahkan!');
      }

      // Reset Form & Refresh Data
      resetForm();
      fetchProducts();
    } catch (error: any) {
      alert('Aksi gagal dilakukan: ' + error.message);
    }
  };

  // 3. Hapus Produk
  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        alert('Produk berhasil dihapus!');
        fetchProducts();
      } catch (error: any) {
        alert('Gagal menghapus produk: ' + error.message);
      }
    }
  };

  // 4. Set Data ke Form untuk diedit
  const handleEditClick = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id || null);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      category: product.category
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', description: '', price: 0, stock: 0, image_url: '', category: '' });
  };

  return (
    <div className="p-6 space-y-6 bg-slate-955 min-h-screen text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kelola Produk Toko</h1>
        {isEditing && (
          <button onClick={resetForm} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-sm">
            Batal Edit / Tambah Baru
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM INPUT PRODUK */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit">
          <h3 className="text-lg font-semibold mb-4 text-emerald-400">
            {isEditing ? 'ℹ️ Edit Produk' : '➕ Tambah Produk Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nama Produk</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Jumlah Stok</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Kategori</label>
              <input
                type="text"
                placeholder="E.g., Elektronik, Pakaian"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">URL Gambar Produk</label>
              <input
                type="text"
                placeholder="https://example.com/gambar.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Deskripsi Produk</label>
              <textarea
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-xl transition duration-200"
            >
              {isEditing ? 'Simpan Perubahan' : 'Masukkan ke Toko'}
            </button>
          </form>
        </div>

        {/* TABEL DAFTAR PRODUK */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Katalog Produk Toko</h3>
          {loading ? (
            <div className="text-slate-400 text-center py-10">Memuat Katalog Produk...</div>
          ) : products.length === 0 ? (
            <div className="text-slate-500 text-center py-10">Belum ada produk terdaftar di database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">Info Produk</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Stok</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/40">
                      <td className="p-3 flex items-center space-x-3">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                        )}
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400">{product.category || '-'}</td>
                      <td className="p-3 text-emerald-400 font-semibold">Rp {product.price.toLocaleString('id-ID')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          product.stock > 5 ? 'bg-slate-800 text-slate-300' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {product.stock} pcs
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="bg-sky-500/20 text-sky-400 hover:bg-sky-500/40 px-2.5 py-1 rounded text-xs transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => product.id && handleDelete(product.id)}
                            className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 px-2.5 py-1 rounded text-xs transition"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}