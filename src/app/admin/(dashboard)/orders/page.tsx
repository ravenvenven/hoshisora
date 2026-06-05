'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fungsi ambil data awal
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();

    // 2. Realtime Listener
    const channel = supabase
      .channel('realtime_orders')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'orders' }, 
        (payload) => {
          // Menambahkan order baru ke state tanpa refresh
          setOrders((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400">Sedang memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Daftar Pesanan</h1>
        <p className="text-slate-400">Kelola dan pantau semua pesanan masuk di sini.</p>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">Belum ada pesanan.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="text-white hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-medium">{order.customer_name || 'Anonymous'}</td>
                  <td className="p-4">Rp {Number(order.total_price).toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Komponen kecil untuk pewarnaan status
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-900/30 text-amber-400 border-amber-800',
    paid: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    shipped: 'bg-blue-900/30 text-blue-400 border-blue-800',
    delivered: 'bg-purple-900/30 text-purple-400 border-purple-800',
    cancelled: 'bg-rose-900/30 text-rose-400 border-rose-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || 'bg-slate-800'}`}>
      {status.toUpperCase()}
    </span>
  );
}