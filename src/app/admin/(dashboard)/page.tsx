'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalRevenue: 0,
    totalOrders: 0,
    expenses: 0,
    users: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [userActivities, setUserActivities] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Ambil data Orders (Pemasukan)
      const { data: orders } = await supabase.from('orders').select('total_price, created_at, customer_name, status');
      
      // 2. Ambil data Expenses (Pengeluaran)
      const { data: expensesData } = await supabase.from('expenses').select('amount');
      
      // 3. Ambil data Total User Terdaftar
      const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });

      // 4. 🔥 SINKRONISASI COCOK DENGAN TABEL cart_items KAMU
      // Melakukan JOIN ke tabel 'products' untuk mengambil data nama & harga asli produk
      const { data: cartData } = await supabase
        .from('cart_items') 
        .select(`
          created_at,
          user_id,
          quantity,
          products (
            title,
            price
          )
        `)
        .order('created_at', { ascending: false });

      // --- KALKULASI DATA ORDERS ---
      let totalRevenue = 0;
      let todayRevenue = 0;
      let totalOrders = 0;
      let orderActivities: any[] = [];

      if (orders) {
        totalOrders = orders.length;
        totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);
        
        const today = new Date().toISOString().split('T')[0];
        todayRevenue = orders
          .filter(order => order.created_at?.startsWith(today))
          .reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);

        orderActivities = orders.map(order => ({
          type: 'TRANSAKSI',
          customer_name: order.customer_name || 'User Terdaftar',
          details: `Membeli produk dengan total pembayaran`,
          value: Number(order.total_price) || 0,
          status: order.status,
          created_at: order.created_at
        }));

        const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentOrders(sortedOrders.slice(0, 5));

        const formattedData = orders.slice(-7).map(order => ({
          name: new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'short' }),
          pemasukan: Number(order.total_price) || 0
        }));
        setChartData(formattedData);
      }

      // --- FORMAT DATA KERANJANG (Membaca relasi join object) ---
      let cartActivities: any[] = [];
      if (cartData) {
        cartActivities = cartData.map((item: any) => {
          // Mengambil properti produk hasil dari join query supabase
          const productInfo = item.products; 
          const pTitle = productInfo?.title || 'Produk Misterius';
          const pPrice = Number(productInfo?.price) || 0;
          const qty = Number(item.quantity) || 1;

          // Potong UUID user_id agar tampilan log tabel tetap rapi dan tidak kepanjangan
          const shortUserId = item.user_id ? `User (${item.user_id.substring(0, 6)}...)` : 'Guest / Anon';

          return {
            type: 'KERANJANG',
            customer_name: shortUserId,
            details: `Memasukkan [${pTitle}] (Qty: ${qty}) ke keranjang`,
            value: pPrice * qty,
            status: 'di keranjang',
            created_at: item.created_at
          };
        });
      }

      // --- GABUNGKAN DAN URUTKAN AKTIVITAS TERBARU ---
      const combinedActivities = [...orderActivities, ...cartActivities]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10); 

      setUserActivities(combinedActivities);

      // --- KALKULASI DATA EXPENSES ---
      const totalExpenses = expensesData ? expensesData.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) : 0;

      setStats({
        todayRevenue,
        totalRevenue,
        totalOrders,
        expenses: totalExpenses,
        users: userCount || 0
      });

    } catch (error: any) {
      console.error("Gagal sinkronisasi data dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-white text-center">Memuat Data Dashboard Admin...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-white">
      
      {/* Kartu Ringkasan (Stat Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Pemasukan Hari Ini" value={`Rp ${stats.todayRevenue.toLocaleString('id-ID')}`} />
        <StatCard title="Total Pemasukan" value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`} />
        <StatCard title="Total Pengeluaran" value={`Rp ${stats.expenses.toLocaleString('id-ID')}`} />
        <StatCard title="Total Pelanggan" value={`${stats.users} User`} />
      </div>

      {/* Bagian Grafik Pendapatan */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-80">
        <h3 className="text-white font-semibold mb-4">Grafik Pemasukan (Transaksi Terakhir)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} labelStyle={{ color: '#fff' }} />
            <Line type="monotone" dataKey="pemasukan" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🛠️ LIVE MONITOR TABEL */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Live Log Monitor: Aktivitas & Keranjang Belanja User</h3>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium animate-pulse">
            Realtime Monitor
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800 text-slate-400">
              <tr>
                <th className="p-3">Nama / ID User</th>
                <th className="p-3">Aktivitas</th>
                <th className="p-3">Keterangan Tindakan</th>
                <th className="p-3">Estimasi Nilai</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {userActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-slate-500">Belum ada aktivitas terekam.</td>
                </tr>
              ) : (
                userActivities.map((activity, index) => (
                  <tr key={index} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-medium text-white">{activity.customer_name}</td>
                    
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                        activity.type === 'TRANSAKSI' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {activity.type}
                      </span>
                    </td>

                    <td className="p-3 text-slate-400 text-xs md:text-sm">{activity.details}</td>
                    
                    <td className={`p-3 font-mono ${activity.type === 'TRANSAKSI' ? 'text-emerald-400' : 'text-slate-400'}`}>
                      Rp {activity.value.toLocaleString('id-ID')}
                    </td>
                    
                    <td className="p-3 text-xs text-slate-500">
                      {new Date(activity.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </td>
                    
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                        activity.status === 'paid' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : activity.status === 'di keranjang'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-700/40 text-slate-400'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}