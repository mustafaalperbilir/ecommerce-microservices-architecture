"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import Link from 'next/link';
import { User, Package, RotateCcw, Loader2, ArrowLeft, LogOut, X, Send } from 'lucide-react';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: any[];
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 MODAL STATE'LERİ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [requestType, setRequestType] = useState<'CANCEL' | 'RETURN'>('CANCEL');
  const [submitting, setSubmitting] = useState(false);

  const fetchMyOrders = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Siparişler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setIsMounted(true);
    if (isMounted && !isAuthenticated) {
      router.replace('/login');
    } else if (isMounted && isAuthenticated) {
      fetchMyOrders();
    }
  }, [isMounted, isAuthenticated, router, fetchMyOrders]);

  // 🚀 İPTAL/İADE TALEBİNİ GÖNDERME FONKSİYONU
  const handleRequestSubmit = async () => {
    if (!selectedOrderId || !requestReason.trim()) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      // Backend'de CANCEL_REQUESTED veya RETURN_REQUESTED durumuna çekiyoruz
      const newStatus = requestType === 'CANCEL' ? 'CANCEL_REQUESTED' : 'RETURN_REQUESTED';
      
      await axios.put(`http://localhost:4000/api/orders/${selectedOrderId}/status`, 
        { 
          status: newStatus,
          cancelReason: requestReason // ✍️ Veritabanına eklediğimiz o yeni alan!
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsModalOpen(false);
      setRequestReason('');
      fetchMyOrders(); // Listeyi yenile
      alert("Talebiniz başarıyla yöneticiye iletildi. 🚀");
    } catch (error) {
      console.error("Talep hatası:", error);
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (orderId: string, type: 'CANCEL' | 'RETURN') => {
    setSelectedOrderId(orderId);
    setRequestType(type);
    setIsModalOpen(true);
  };

  if (!isMounted || !isAuthenticated || !user) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6 font-sans relative">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Üst Navigasyon */}
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <ArrowLeft size={16} className="mr-2" /> Vitrine Dön
          </Link>
          <button onClick={logout} className="flex items-center text-sm font-bold text-red-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-red-100 hover:bg-red-50">
            <LogOut size={16} className="mr-2" /> Çıkış
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sol Panel: Kullanıcı Bilgileri */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center sticky top-8">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-2xl">
                {user.email[0].toUpperCase()}
              </div>
              <h2 className="text-xl font-black text-gray-900">{user.email.split('@')[0]}</h2>
              <p className="text-gray-400 text-xs mb-6">{user.email}</p>
              <div className="text-left bg-gray-50 p-4 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sipariş Sayısı</p>
                <p className="text-2xl font-black text-blue-600">{orders.length}</p>
              </div>
            </div>
          </div>

          {/* Sağ Panel: Sipariş Listesi */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xl font-black text-gray-800 flex items-center">
              <Package className="mr-2 text-blue-500" size={24} /> Siparişlerim
            </h3>
            
            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div> : (
              orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Sipariş No</p>
                      <p className="font-bold text-gray-800 text-sm">#{order.id.substring(0,8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-gray-900">{order.totalAmount} ₺</p>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase
                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : ''}
                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : ''}
                        ${order.status === 'CANCEL_REQUESTED' ? 'bg-orange-100 text-orange-600' : ''}
                        ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : ''}
                        ${order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-600' : ''}
                      `}>
                        {order.status === 'PENDING' && 'Bekliyor'}
                        {order.status === 'DELIVERED' && 'Teslim Edildi'}
                        {order.status === 'CANCEL_REQUESTED' && 'İptal Bekleniyor'}
                        {order.status === 'CANCELLED' && 'İptal Edildi'}
                        {order.status === 'SHIPPED' && 'Kargoda'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                    
                    <div className="flex space-x-2">
                      {/* 🛡️ KRİTİK MANTIK: Sadece PENDING ise İptal Edilebilir */}
                      {order.status === 'PENDING' && (
                        <button 
                          onClick={() => openModal(order.id, 'CANCEL')}
                          className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors flex items-center"
                        >
                          <X size={14} className="mr-1" /> İptal Et
                        </button>
                      )}

                      {/* 🛡️ KRİTİK MANTIK: Sadece DELIVERED ise İade Edilebilir */}
                      {order.status === 'DELIVERED' && (
                        <button 
                          onClick={() => openModal(order.id, 'RETURN')}
                          className="text-xs font-bold text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-xl transition-colors flex items-center"
                        >
                          <RotateCcw size={14} className="mr-1" /> İade Et
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 🚀 EFSANE İPTAL/İADE MODAL (AÇILIR PENCERE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900">
                  {requestType === 'CANCEL' ? 'Siparişi İptal Et' : 'İade Talebi Oluştur'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <p className="text-gray-500 text-sm mb-6 font-medium">
                {requestType === 'CANCEL' 
                  ? 'Siparişi iptal etme nedeninizi lütfen belirtin. Talebiniz yönetici tarafından incelenecektir.' 
                  : 'Ürünü iade etme nedeninizi yazınız.'}
              </p>

              <textarea 
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Örn: Yanlış ürünü seçmişim, vazgeçtim..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none transition-all"
                autoFocus
              />

              <div className="mt-8 flex space-x-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleRequestSubmit}
                  disabled={submitting || !requestReason.trim()}
                  className={`flex-1 py-4 font-bold text-white rounded-2xl flex items-center justify-center space-x-2 shadow-lg
                    ${requestType === 'CANCEL' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}
                    ${(submitting || !requestReason.trim()) && 'opacity-50 cursor-not-allowed shadow-none'}
                  `}
                >
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  <span>{requestType === 'CANCEL' ? 'İptali Gönder' : 'İadeyi Gönder'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}