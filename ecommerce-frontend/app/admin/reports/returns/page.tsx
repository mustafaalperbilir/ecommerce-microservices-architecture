"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, RefreshCcw, Package, Loader2, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
}

export default function ReturnsReport() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.replace('/');
      return;
    }
    fetchReturnRequests();
  }, [isAuthenticated, user, router]);

  const fetchReturnRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allOrders = response.data;
      
      // 🚀 FİLTRE: Sadece İptal veya İade talebi olanları ayır
      const requests = allOrders.filter(
        (o: Order) => o.status === 'CANCEL_REQUESTED' || o.status === 'RETURN_REQUESTED'
      );
      
      // En acil (en yeni) olanlar en üstte görünsün diye tarihe göre sıralıyoruz
      requests.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(requests);
    } catch (error) {
      console.error("Talepler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-rose-500" size={40} /></div>;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Üst Kısım */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <RefreshCcw className="mr-3 text-rose-500" size={32} />
              İade ve İptal Talepleri
            </h1>
            <p className="text-gray-500 mt-2">Müşteriler tarafından gönderilen ve işlem bekleyen talepler.</p>
          </div>
          <Link href="/admin" className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <ArrowLeft size={16} className="mr-2" /> Panele Dön
          </Link>
        </div>

        {/* Liste Alanı */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Package className="text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-900">Harika Haber!</h3>
              <p className="text-gray-500">Şu an bekleyen hiçbir iptal veya iade talebi bulunmuyor.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-rose-50 transition-colors gap-4">
                  
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-xl mr-4 flex items-center justify-center border border-rose-200">
                      <RefreshCcw size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sipariş No</div>
                      <h3 className="text-lg font-black text-gray-900">#{order.id.substring(0, 8).toUpperCase()}</h3>
                      <p className="text-sm font-medium text-gray-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')} • {order.totalAmount} ₺</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end mr-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Talep Türü</span>
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm
                        ${order.status === 'CANCEL_REQUESTED' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}
                      `}>
                        {order.status === 'CANCEL_REQUESTED' ? 'İptal İsteniyor' : 'İade İsteniyor'}
                      </span>
                    </div>

                    {/* Talebi Yönetmek İçin Ana Sipariş Ekranına Yönlendiren Buton */}
                    <Link href="/admin/orders" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm" title="Siparişi Yönet">
                      <ExternalLink size={20} />
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}