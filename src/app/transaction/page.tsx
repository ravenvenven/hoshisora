'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface Transaction {
  id: string;
  created_at: string;
  status: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  total_payment: number;
  tracking_number: string | null;
}

export default function TransactionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Semua');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = ['Semua', 'Menunggu Pembayaran', 'Diproses', 'Dikirim', 'Selesai'];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTransactions(data);
    } catch (error) {
      console.error('Gagal mengambil data dari Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel('realtime-transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions((prev) => [payload.new as Transaction, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTransactions((prev) =>
              prev.map((tx) => (tx.id === payload.new.id ? (payload.new as Transaction) : tx))
            );
          } else if (payload.eventType === 'DELETE') {
            setTransactions((prev) => prev.filter((tx) => tx.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredTransactions = activeTab === 'Semua' 
    ? transactions 
    : transactions.filter(t => t.status === activeTab);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Menunggu Pembayaran':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Diproses':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Dikirim':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Selesai':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const navMenus = [
    {
      label: "Beranda",
      path: "/",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "transaksi",
      path: "/transaction",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      label: "tutorial",
      path: "/tutorial",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label: "akun",
      path: "/profile",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-white text-slate-800 font-sans overflow-x-hidden pb-28 m-0 p-0">
      
      {/* Ambient Light Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* ⚡ AREA UTAMA (Full Width Center) */}
      <div className="w-full flex justify-center m-0 p-0 box-border">
        <main className="w-full max-w-4xl px-4 py-6 md:py-12 box-border">
          
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl font-black md:text-2xl tracking-tight text-slate-900">Riwayat Transaksi</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Riwayat pesanan anda</p>
          </div>

          {/* Tab Filter */}
          <div className="flex gap-1.5 border-b border-slate-200 overflow-x-auto pb-2 no-scrollbar mb-6 scroll-smooth">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs md:text-sm font-bold px-3.5 py-2.5 border-b-2 whitespace-nowrap transition duration-200 ${
                  activeTab === tab
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List Kartu Transaksi */}
          <div className="space-y-4 w-full">
            {loading ? (
              <div className="text-center py-16 text-xs font-bold text-slate-400 animate-pulse">
                loading.....
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                Tidak ada transaksi dalam kategori "{activeTab}".
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="w-full bg-white border border-slate-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition flex flex-col gap-4 box-border overflow-hidden"
                >
                  {/* Metadata & Status */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 gap-2">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs font-bold text-slate-700 tracking-wide truncate">{tx.id}</p>
                    </div>
                    <span className={`text-[10px] md:text-[11px] font-extrabold px-2.5 py-1 rounded-full border whitespace-nowrap flex-shrink-0 ${getStatusStyle(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>

                  {/* Detail Item */}
                  <div className="flex gap-3 md:gap-4 items-start min-w-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {tx.image_url ? (
                        <img src={tx.image_url} alt={tx.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No Pic</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 pr-1 tracking-wide truncate">{tx.product_name}</h4>
                      <p className="text-[11px] md:text-xs text-slate-500 mt-1 font-medium">
                        {tx.quantity} barang × Rp {tx.price.toLocaleString('id-ID')}
                      </p>
                      
                      {tx.tracking_number && (
                        <div className="mt-2 flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5 max-w-full overflow-hidden">
                          <span className="text-[9px] text-slate-400 font-bold uppercase flex-shrink-0">Resi:</span>
                          <span className="text-[9px] font-black text-emerald-600 tracking-wide select-all truncate">{tx.tracking_number}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total & Tombol Aksi */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex-shrink-0">
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Total Belanja</p>
                      <p className="text-xs md:text-sm font-black text-emerald-600">
                        Rp {tx.total_payment.toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
                      <button className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 sm:py-1.5 rounded-xl transition text-center">
                        Detail
                      </button>
                      
                      {tx.status === 'Menunggu Pembayaran' && (
                        <button className="text-[11px] font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-2 sm:py-1.5 rounded-xl transition shadow-sm shadow-amber-500/10 text-center">
                          Bayar
                        </button>
                      )}

                      {tx.status === 'Dikirim' && (
                        <button className="text-[11px] font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 sm:py-1.5 rounded-xl transition text-center">
                          Lacak
                        </button>
                      )}

                      {tx.status === 'Selesai' && (
                        <button className="text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-900 px-3 py-2 sm:py-1.5 rounded-xl transition text-center">
                          Ulasan
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

        </main>
      </div>

      {/* 🟢 NAVIGASI BAWAH UNIVERSAL (HIJAU EMERALD - Selalu Muncul di Semua Device) */}
      <div className="fixed bottom-0 left-0 right-0 bg-emerald-600 border-t border-emerald-500/30 px-4 py-3.5 z-50 shadow-[0_-4px_25px_rgba(16,185,129,0.15)]">
        <div className="flex justify-around items-center max-w-xl mx-auto">
          {navMenus.map((menu) => {
            const isCurrentPage = menu.path === "/transaction";
            return (
              <button
                key={menu.label}
                onClick={() => router.push(menu.path)}
                className="flex flex-col items-center justify-center transition gap-1.5 min-w-[72px] bg-transparent border-0 outline-none group"
              >
                {/* Icon: Jika aktif putih solid, jika tidak aktif putih pudar (opacity-60) */}
                <div className={`transition-all duration-200 transform ${
                  isCurrentPage 
                    ? "text-white scale-105" 
                    : "text-white/60 group-hover:text-white md:group-hover:scale-105"
                }`}>
                  {menu.icon}
                </div>
                {/* Teks Label */}
                <span className={`text-[10px] md:text-[11px] capitalize tracking-wide transition-colors duration-200 font-bold ${
                  isCurrentPage ? "text-white" : "text-white/60 group-hover:text-white"
                }`}>
                  {menu.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}