'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    description: string;
  };
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (isMounted.current) setCartItems([]);
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            description
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      
      if (data && isMounted.current) {
        setCartItems(data as unknown as CartItem[]);
      }
    } catch (err) {
      console.error("Gagal mengambil isi keranjang:", err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchCartItems();
    return () => { isMounted.current = false; };
  }, []);

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const { error } = await supabase.from("cart_items").update({ quantity: newQty }).eq("id", id);
      if (error) throw error;
      setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    } catch (err) { console.error("Gagal update:", err); }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (err) { console.error("Gagal hapus:", err); }
  };

  const handleCheckout = () => {
    const phoneNumber = "6283126009232"; // GANTI dengan nomor WhatsApp Anda
    
    // Membuat pesan yang berisi daftar produk
    let message = "Halo, saya ingin memesan produk berikut:\n\n";
    
    cartItems.forEach((item) => {
      message += `* ${item.products.name} (${item.quantity}x) - Rp ${(item.products.price * item.quantity).toLocaleString('id-ID')}\n`;
    });
    
    message += `\n*Total Harga: Rp ${totalPrice.toLocaleString('id-ID')}*`;
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + ((item.products?.price || 0) * item.quantity), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Memuat keranjang...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-12 text-gray-800">
      <div className="max-w-4xl mx-auto px-4 pt-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-emerald-600 transition mb-6">
          ← Kembali Belanja
        </Link>

        <h1 className="text-2xl font-bold mb-6">Keranjang Anda ({totalItems})</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <span className="text-4xl mb-4 block">🛒</span>
            <p className="text-gray-500 text-sm">Keranjang belanja Anda masih kosong.</p>
            <Link href="/" className="mt-6 inline-block bg-emerald-600 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-emerald-700">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* List Produk */}
            <div className="md:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={item.products?.image_url || '/placeholder.jpg'} alt={item.products?.name} className="w-16 h-16 object-cover rounded-xl border" />
                    <div>
                      <h3 className="font-semibold text-sm">{item.products?.name}</h3>
                      <p className="text-emerald-600 font-bold text-xs mt-1">Rp {Number(item.products?.price || 0).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200">-</button>
                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200">+</button>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 ml-4"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Ringkasan (Sticky Desktop) */}
            <div className="hidden md:block bg-white border border-gray-100 rounded-2xl p-6 h-fit shadow-sm sticky top-6">
              <h2 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Ringkasan</h2>
              <div className="flex justify-between mb-4 text-sm"><span>Total Belanja</span><span className="font-black text-emerald-600">Rp {totalPrice.toLocaleString('id-ID')}</span></div>
             <button 
  onClick={handleCheckout} 
  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition"
>
  Checkout Sekarang
</button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Button (Fixed Bottom Mobile) */}
      {cartItems.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-500">Total Harga</span>
            <span className="font-black text-emerald-600">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
        <button 
  onClick={handleCheckout} 
  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition"
>
  Checkout Sekarang
</button>
        </div>
      )}
    </div>
  );
}