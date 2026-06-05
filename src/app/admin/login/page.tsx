'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    console.log("🚀 [1] handleLogin dimulai...");

    const userAgent = typeof window !== 'undefined' ? allocatorUserAgent() : 'Unknown';

    try {
      console.log("⏳ [2] Mencoba ketuk pintu Supabase Auth...", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      console.log("📦 [3] Respon dari Supabase diterima:", { data, error });

      if (error) {
        console.log("❌ [4A] Login gagal, mencoba mencatat log gagal...");
        try {
          await supabase.from('admin_login_logs').insert([
            { email: email, status: 'FAILED', user_agent: userAgent }
          ]);
          console.log("✏️ [5A] Log gagal berhasil dicatat.");
        } catch (logErr) { 
          console.error('Gagal mencatat log gagal:', logErr); 
        }
        throw error;
      }

      if (data?.user) {
        console.log("✅ [4B] Login berhasil! Mencoba mencatat log sukses...");
        
        // ⚠️ POTENSI MACET DISINI: Kita bungkus log sukses dengan sangat aman
        try {
          // Tambahkan timeout buatan agar proses insert tidak menggantung selamanya jika jaringan/RLS bermasalah
          await Promise.race([
            supabase.from('admin_login_logs').insert([
              { email: data.user.email, status: 'SUCCESS', user_agent: userAgent }
            ]),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout insert log')), 3000))
          ]);
          console.log("✏️ [5B] Log sukses berhasil dicatat.");
        } catch (logErr) {
          console.warn('⚠️ Log sukses dilewati karena:', logErr);
        }

        console.log("🔔 [6] Menampilkan alert...");
        alert('Login Admin Berhasil!');
        
        console.log("🔄 [7] Menjalankan window.location.replace...");
        // Gunakan cara paling brutal & instan untuk bypass semua masalah routing Next.js sementara waktu
        window.location.replace('/admin');
        return;
      }
      
    } catch (error: any) {
      console.error("💥 Detail Kendala Login:", error);
      setErrorMessage(error.message || 'Terjadi kesalahan saat login.');
    } finally {
      console.log("🏁 [8] Blok finally dieksekusi, loading dimatikan.");
      setLoading(false);
    }
  };
  // Fungsi pembantu untuk mengambil info browser info
  function allocatorUserAgent() {
    if (typeof window === 'undefined') return 'Server Side';
    if (navigator.userAgent.includes('Chrome')) return 'Google Chrome';
    if (navigator.userAgent.includes('Firefox')) return 'Mozilla Firefox';
    if (navigator.userAgent.includes('Safari')) return 'Apple Safari';
    return navigator.userAgent.substring(0, 50);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
        
        <div className="text-center mb-8">
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
            🔒 Admin Area
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3">hoshisora</h2>
          <p className="text-slate-400 text-sm mt-1">Masuk untuk mengelola produk & pesanan</p>
        </div>

        {errorMessage && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-sm text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Administrator
            </label>
            <input
              type="email"
              required
              placeholder="admin@email.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold p-3 rounded-xl transition duration-200 shadow-lg shadow-emerald-900/20"
          >
            {loading ? 'Memverifikasi Akun...' : 'Masuk Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}