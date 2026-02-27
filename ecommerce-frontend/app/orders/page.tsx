"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';

// TypeScript için veri tiplerimiz
interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🛡️ Güvenlik ve Veri Çekme
  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated || user?.role === 'ADMIN') {
        // Adminlerin veya giriş yapmamışların burada işi yok!
        router.push('/');
        return;
      }
      
      // Sadece token'ımız varsa veri çekmeye çalış
      const token = localStorage.getItem('token');
      if (token) {
        fetchMyOrders(token);
      } else {
        setLoading(true);
      }
    }
  }, [isMounted, isAuthenticated, user, router]);

  // 🚀 ÇÖZÜM: Artık userId'ye ihtiyacımız yok! Modern ve güvenli '/my-orders' rotasını kullanıyoruz.
  const fetchMyOrders = async (token: string) => {
    try {
      // 🛡️ İstek adresi tamamen güvenli rotamıza (my-orders) çevrildi
      const response = await axios.get('http://localhost:4000/api/orders/my-orders', {
        headers: {
          // Backend bu token'ı açıp senin kim olduğunu kendisi bulacak
          Authorization: `Bearer ${token}` 
        }
      });
      
      setOrders(response.data);
    } catch (error) {
      console.error("Siparişler çekilemedi:", error);
      
      // Eğer yetki hatası alırsak kullanıcıyı uyaralım
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        alert("Oturum süreniz dolmuş, lütfen tekrar giriş yapın.");
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Sipariş Durumlarını Türkçeye ve İkonlara Çeviren Zeki Fonksiyon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={16} className="mr-1.5" /> };
      case 'PROCESSING':
        return { text: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-700', icon: <Package size={16} className="mr-1.5" /> };
      case 'SHIPPED':
        return { text: 'Kargoya Verildi', color: 'bg-purple-100 text-purple-700', icon: <Truck size={16} className="mr-1.5" /> };
      case 'DELIVERED':
        return { text: 'Teslim Edildi', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={16} className="mr-1.5" /> };
      case 'CANCELLED':
        return { text: 'İptal Edildi', color: 'bg-red-100 text-red-700', icon: <XCircle size={16} className="mr-1.5" /> };
      default:
        return { text: 'Bilinmiyor', color: 'bg-gray-100 text-gray-700', icon: null };
    }
  };

  if (!isMounted || !isAuthenticated || user?.role === 'ADMIN') return null;

  return (
    <main className="min-h-[85vh] bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Başlık Alanı */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <Package className="mr-3 text-blue-600" size={32} />
              Siparişlerim
            </h1>
            <p className="text-gray-500 mt-2">Geçmiş siparişlerinizi ve kargo durumlarını buradan takip edebilirsiniz.</p>
          </div>
          <Link href="/" className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Alışverişe Dön
          </Link>
        </div>

        {/* İçerik Alanı */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Package size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Henüz hiç siparişin yok</h2>
            <p className="text-gray-500 mb-8 max-w-md">Sanki sepetin biraz boş kalmış gibi. Hemen vitrine dönüp harika ürünlerimizi keşfetmeye ne dersin?</p>
            <Link href="/" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Ürünleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const badge = getStatusBadge(order.status);
              const orderDate = new Date(order.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });
              const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  
                  {/* Sol Kısım: Sipariş Detayları */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-gray-500">Sipariş No:</span>
                      <span className="text-sm font-mono bg-gray-50 px-2 py-1 rounded text-gray-700 border border-gray-100">
                        #{order.id.split('-')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      Tarih: <span className="text-gray-800">{orderDate}</span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      İçerik: <span className="text-gray-800">{totalItems} adet ürün</span>
                    </div>
                  </div>

                  {/* Sağ Kısım: Durum ve Tutar */}
                  <div className="flex flex-col sm:items-end space-y-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                    <div className="text-2xl font-black text-gray-900">
                      {order.totalAmount} ₺
                    </div>
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${badge.color}`}>
                      {badge.icon}
                      {badge.text}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}