"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import Link from 'next/link';
// 🚀 YENİ İKONLAR: Onay, Red ve Bilgi ikonlarını ekledik
import { ShoppingCart, Loader2, ArrowLeft, Package, CheckCircle2, XCircle, Info } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  cancelReason?: string; // 🚀 YENİ: Veritabanından gelen sebebi buraya ekledik
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchOrders();
    } else if (isMounted) {
      router.replace('/');
    }
  }, [isMounted, isAuthenticated, user, router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Siparişler çekilemedi:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:4000/api/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Durum güncellenemedi:", error);
      alert("Sipariş durumu güncellenirken bir hata oluştu.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isMounted || !isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Üst Başlık ve Navigasyon */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <ShoppingCart className="mr-3 text-orange-500" size={32} />
              Sipariş Yönetimi
            </h1>
            <div className="flex items-center space-x-4 mt-4">
              <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors pb-1">
                📊 Ana Panel
              </Link>
              <Link href="/admin/products" className="text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors pb-1">
                📦 Ürün Yönetimi
              </Link>
              <Link href="/admin/orders" className="text-sm font-bold border-b-2 border-orange-500 text-orange-600 pb-1">
                🛒 Sipariş Yönetimi
              </Link>
            </div>
          </div>
          <Link href="/" className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <ArrowLeft size={16} className="mr-2" /> Vitrine Dön
          </Link>
        </div>

        {/* Siparişler Tablosu */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Package className="mr-2 text-gray-400" size={20} />
              Tüm Siparişler ({orders.length})
            </h2>
          </div>
          
          {loadingData ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                    <th className="p-4 font-bold">SİPARİŞ & TARİH</th>
                    <th className="p-4 font-bold">MÜŞTERİ ID</th>
                    <th className="p-4 font-bold">TUTAR</th>
                    <th className="p-4 font-bold">DURUM</th>
                    <th className="p-4 font-bold text-right">İŞLEM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">#{order.id.substring(0, 8).toUpperCase()}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-500 font-mono">
                        {order.userId.substring(0, 8)}...
                      </td>
                      <td className="p-4 font-black text-gray-900 text-lg">
                        {order.totalAmount} ₺
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center
                          ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : ''}
                          ${order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' : ''}
                          ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : ''}
                          ${order.status === 'CANCEL_REQUESTED' ? 'bg-orange-100 text-orange-700 animate-pulse' : ''}
                          ${order.status === 'RETURN_REQUESTED' ? 'bg-indigo-100 text-indigo-700 animate-pulse' : ''}
                          ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                          ${order.status === 'RETURNED' ? 'bg-gray-200 text-gray-600' : ''}
                        `}>
                          {order.status === 'PENDING' && '⏳ Bekliyor'}
                          {order.status === 'PROCESSING' && '⚙️ Hazırlanıyor'}
                          {order.status === 'SHIPPED' && '🚚 Kargoda'}
                          {order.status === 'DELIVERED' && '✅ Teslim Edildi'}
                          {order.status === 'CANCEL_REQUESTED' && '⚠️ İptal Talebi'}
                          {order.status === 'RETURN_REQUESTED' && '🔄 İade Talebi'}
                          {order.status === 'CANCELLED' && '❌ İptal Edildi'}
                          {order.status === 'RETURNED' && '🔙 İade Edildi'}
                        </span>

                        {/* 🚀 TALEP SEBEBİNİ BURADA GÖSTERİYORUZ */}
{order.cancelReason && (
  <div className="mt-2 flex items-start bg-blue-50/50 p-2 rounded-lg border border-blue-100 max-w-[180px]">
    <Info size={14} className="text-blue-500 mr-2 shrink-0 mt-0.5" />
    {/* &quot; kullanarak tırnak hatasını giderdik */}
    <p className="text-[10px] text-blue-700 italic leading-tight">
      &quot;{order.cancelReason}&quot;
    </p>
  </div>
)}
                      </td>
                      <td className="p-4 text-right">
                        
                        {updatingId === order.id ? (
                          <Loader2 className="animate-spin text-orange-500 inline-block" size={24} />
                        ) : (
                          <div className="flex flex-col items-end space-y-2">
                            {/* 🚀 ONAY/RED BUTONLARI: Sadece TALEP varsa görünür */}
                            {order.status === 'CANCEL_REQUESTED' || order.status === 'RETURN_REQUESTED' ? (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleStatusChange(order.id, order.status === 'CANCEL_REQUESTED' ? 'CANCELLED' : 'RETURNED')}
                                  className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-lg transition-all"
                                  title="Talebi Onayla"
                                >
                                  <CheckCircle2 size={20} />
                                </button>
                                <button 
                                  onClick={() => handleStatusChange(order.id, order.status === 'CANCEL_REQUESTED' ? 'PENDING' : 'DELIVERED')}
                                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg transition-all"
                                  title="Talebi Reddet"
                                >
                                  <XCircle size={20} />
                                </button>
                              </div>
                            ) : (
                              /* NORMAL DURUMDA SENİN SELECT YAPIN ÇALIŞIR */
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED' || order.status === 'RETURNED'} 
                                className={`px-3 py-2 rounded-xl text-sm font-bold border outline-none transition-colors
                                  ${order.status === 'DELIVERED' || order.status === 'CANCELLED' || order.status === 'RETURNED'
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-70' 
                                    : 'bg-white border-gray-300 text-gray-700 hover:border-orange-400 cursor-pointer'}
                                `}
                              >
                                {order.status === 'PENDING' && <option value="PENDING">Bekliyor</option>}
                                {(order.status === 'PENDING' || order.status === 'PROCESSING') && <option value="PROCESSING">Hazırlanıyor</option>}
                                {(order.status === 'PENDING' || order.status === 'PROCESSING' || order.status === 'SHIPPED') && <option value="SHIPPED">Kargoya Verildi</option>}
                                <option value="DELIVERED">Teslim Edildi</option>
                                <option value="CANCELLED">İptal Edildi</option>
                              </select>
                            )}
                          </div>
                        )}

                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Henüz hiç sipariş bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}