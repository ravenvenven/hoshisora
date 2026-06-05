'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { createBrowserClient } from '@supabase/ssr';

// --- Konfigurasi Supabase ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams(); 
  const router = useRouter(); 
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const productId = params?.id as string; 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fungsi Tambahan: WhatsApp Checkout ---
  const handleWhatsAppCheckout = async () => {
    if (!product) return;
    
    // Ganti nomor ini dengan nomor WhatsApp tujuan Anda
    const phoneNumber = "6283126009232"; 
    const message = `Halo, saya ingin memesan produk:%0A*${product.name}*%0AHarga: Rp ${product.price.toLocaleString('id-ID')}%0A%0AMohon konfirmasi pesanannya. Terima kasih!`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const fetchData = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (productData) setProduct(productData);

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      if (reviewsData) setReviews(reviewsData);

    } catch (err) {
      console.error('Gagal memuat detail produk atau ulasan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim() || !productId) return;

    try {
      setSubmittingReview(true);
      const { error } = await supabase
        .from('product_reviews')
        .insert([
          {
            product_id: productId,
            user_name: newReviewName,
            rating: newReviewRating,
            comment: newReviewComment
          }
        ]);

      if (error) throw error;

      setNewReviewName('');
      setNewReviewComment('');
      setNewReviewRating(5);
      await fetchData(); 
    } catch (err) {
      console.error('Gagal mengirim ulasan:', err);
      alert('Gagal mengirim ulasan, silakan coba lagi.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async (redirectToCart = false) => {
    if (!productId) return;
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      let currentUser = user;
      if (!currentUser) {
        const { data: { session } } = await supabase.auth.getSession();
        currentUser = session?.user || null;
      }

      if (!currentUser) {
        alert("Waduh, kamu harus login terlebih dahulu untuk belanja!");
        router.push('/profile');
        return;
      }

       const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", currentUser.id)
        .eq("product_id", productId)
        .maybeSingle();

        if (checkError) throw checkError;

        if (existingItem) {
          const { error: updateError } = await supabase
            .from("cart_items")
            .update({ quantity: existingItem.quantity + 1 })
            .eq("id", existingItem.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from("cart_items")
            .insert({
              user_id: currentUser.id,
              product_id: productId,
              quantity: 1
            });
          if (insertError) throw insertError;
        }

        if (redirectToCart) {
          router.push("/cart");
        } else {
          alert("Berhasil dimasukkan ke keranjang belanjaanmu! 🎉");
        }
      } catch (err: any) {
        console.error("Gagal memproses keranjang:", err.message);
        alert(`Terjadi kesalahan: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-400 text-sm">
        <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
        Memuat detail produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-rose-500 font-medium text-sm">
        Produk tidak ditemukan!
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-12">
      <main className="max-w-4xl mx-auto px-4 pt-6 md:pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
            <button 
              onClick={() => router.back()} 
              className="absolute top-4 left-4 z-10 bg-white/70 backdrop-blur-md text-gray-800 p-2.5 rounded-full shadow-md hover:bg-white transition duration-200 flex items-center justify-center border border-white/40"
              title="Kembali"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
            ) : (
              <span className="text-gray-300 text-xs">No Image</span>
            )}
          </div>

          <div className="flex flex-col justify-between py-2">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">{product.name}</h1>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < Math.round(Number(averageRating)) ? '★' : '☆'}</span>
                  ))}
                </div>
                <p className="text-xs font-bold text-gray-500">
                  {averageRating} <span className="text-gray-300">({reviews.length} ulasan)</span>
                </p>
              </div>
              <p className="text-xl font-black text-emerald-600 mt-3">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <div className="border-t border-gray-100 mt-5 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Deskripsi Produk</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                  {product.description || 'Tidak ada deskripsi untuk produk ini.'}
                </p>
              </div>
            </div>
          </div> 
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:relative md:bottom-auto md:left-auto md:right-auto md:bg-transparent md:border-t-0 md:p-0 md:mt-8 z-20">
          <div className="max-w-4xl mx-auto flex gap-3">
            <button 
              onClick={handleWhatsAppCheckout}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3.5 rounded-xl transition duration-200 flex items-center justify-center border border-slate-200/50 shadow-sm disabled:opacity-50" 
              title="Hubungi Penjual"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501c1.153-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </button>

            <button 
              onClick={() => handleAddToCart(false)}
              disabled={isSubmitting}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3.5 rounded-xl transition duration-200 flex items-center justify-center border border-slate-200/50 shadow-sm disabled:opacity-50" 
              title="Tambah ke Keranjang"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-3-11.25h.008v.008h-.008V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </button>

            <button 
              onClick={() => handleAddToCart(true)}
              disabled={isSubmitting}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold p-3.5 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
            >
              {isSubmitting ? "Memproses..." : "Beli Sekarang"}
            </button>
          </div>
        </div>

        <hr className="my-10 border-gray-100" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-base font-extrabold text-gray-900 mb-4">Tulis Ulasan Anda</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-3.5 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama</label>
                <input 
                  type="text" required value={newReviewName} onChange={(e) => setNewReviewName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-slate-800 text-gray-800" 
                  placeholder="Contoh: hoshi"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rating Bintang</label>
                <div className="flex gap-1 text-xl cursor-pointer text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} type="button" onClick={() => setNewReviewRating(star)}
                      className="hover:scale-110 transition-transform bg-transparent border-0 outline-none"
                    >
                      {star <= newReviewRating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Komentar</label>
                <textarea 
                  required rows={3} value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-slate-800 text-gray-800 resize-none" 
                  placeholder="Berikan ulasan mengenai produk ini..."
                />
              </div>

              <button 
                type="submit" disabled={submittingReview}
                className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-gray-300 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition duration-200 border-0 outline-none"
              >
                {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </form>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-base font-extrabold text-gray-900 mb-4">Ulasan Pengguna ({reviews.length})</h2>
            
            {reviews.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                Belum ada ulasan untuk produk ini. Jadilah yang pertama!
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{review.user_name}</h4>
                        <div className="flex text-amber-400 text-xs mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-gray-50/50 p-2 rounded-lg">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}