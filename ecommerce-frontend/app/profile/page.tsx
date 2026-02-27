"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import Link from 'next/link';
// 🚀 Modal için 'X' ikonunu ekledik
import { ArrowLeft, LogOut, Package, ShieldCheck, KeyRound, AlertCircle, User, X } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface OrderItem {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passStatus, setPassStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 MODAL DURUM YÖNETİMİ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<{ id: string, action: 'CANCEL' | 'RETURN' } | null>(null);
  const [reason, setReason] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const currentUser = user as unknown as UserProfile | null;
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchMyOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.warn("Sipariş servisi henüz güncellenmemiş (404).");
        } else {
          console.error("Siparişler çekilemedi:", error);
        }
      }
    };

    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isAdmin) {
      fetchMyOrders();
    }
  }, [isMounted, isAuthenticated, isAdmin, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus({ type: '', message: '' });

    if (passwordData.new !== passwordData.confirm) {
      return setPassStatus({ type: 'error', message: 'Yeni şifreler birbiriyle eşleşmiyor!' });
    }

    if (passwordData.current === passwordData.new) {
      return setPassStatus({ type: 'error', message: 'Yeni şifreniz, mevcut şifrenizle tamamen aynı olamaz!' });
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put('http://localhost:4000/api/auth/change-password', {
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPassStatus({ type: 'success', message: response.data.message });
      setPasswordData({ current: '', new: '', confirm: '' }); 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setPassStatus({ 
          type: 'error', 
          message: error.response?.data?.message || 'Şifre güncellenirken bir hata oluştu.' 
        });
      } else {
        setPassStatus({ type: 'error', message: 'Beklenmeyen bir hata oluştu.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 REVİZE: Artık direkt istek atmıyor, sadece modalı açıyor
  const handleRequestAction = (orderId: string, action: 'CANCEL' | 'RETURN') => {
    setActiveOrder({ id: orderId, action });
    setReason('');
    setIsModalOpen(true);
  };

  // 🚀 YENİ: Formu gönderen asıl fonksiyon
  const handleSubmitRequest = async () => {
    if (!activeOrder) return;
    if (reason.trim().length < 5) {
      alert("Lütfen en az 5 karakterden oluşan geçerli bir neden yazın.");
      return;
    }

    try {
      setIsRequesting(true);
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:4000/api/orders/${activeOrder.id}/request-action`, 
        { action: activeOrder.action, reason: reason }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const response = await axios.get('http://localhost:4000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      
      setIsModalOpen(false);
      alert(`Talebiniz başarıyla iletildi.`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "İşlem sırasında bir hata oluştu.");
      }
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isMounted || !isAuthenticated || !currentUser) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Üst Navigasyon */}
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <ArrowLeft size={16} className="mr-2" /> Vitrine Dön
          </Link>
          
          <button onClick={handleLogout} className="flex items-center text-sm font-bold text-red-500 hover:text-red-700 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-red-100 hover:bg-red-50">
            <LogOut size={16} className="mr-2" /> Çıkış Yap
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* SOL PANEL: KULLANICI BİLGİLERİ */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <User className="text-gray-400 mr-3" size={28} />
              <h2 className="text-2xl font-black text-gray-900">Profil Özeti</h2>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center sticky top-8">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-black mb-6 shadow-inner">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '👤'}
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-1">
                {currentUser.name || (isAdmin ? 'Yetkili Kullanıcı' : 'Değerli Müşterimiz')}
              </h2>
              <p className="text-gray-500 font-medium mb-8">
                {currentUser.email || 'email@gizli.com'}
              </p>

              <div className="w-full bg-gray-50 rounded-2xl p-6 border border-gray-100">
                {isAdmin ? (
                  <div className="flex flex-col items-center">
                    <ShieldCheck size={32} className="text-emerald-500 mb-2" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Yetki Seviyesi</span>
                    <span className="text-lg font-black text-emerald-600">Sistem Yöneticisi</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Package size={32} className="text-blue-500 mb-2" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sipariş Sayısı</span>
                    <span className="text-3xl font-black text-blue-600">{orders.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SAĞ PANEL: İÇERİK */}
          <div className="lg:col-span-2">
            {isAdmin ? (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <ShieldCheck className="text-gray-400 mr-3" size={28} />
                  <h2 className="text-2xl font-black text-gray-900">Güvenlik ve Hesap</h2>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-50 rounded-xl mr-4">
                      <KeyRound className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Şifre Değiştir</h3>
                      <p className="text-sm text-gray-500">Güvenliğiniz için şifrenizi düzenli yenileyin.</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {passStatus.message && (
                      <div className={`p-4 rounded-xl text-sm font-bold ${passStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {passStatus.message}
                      </div>
                    )}
                    <input type="password" required value={passwordData.current} onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} placeholder="Mevcut Şifre" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                    <input type="password" required minLength={6} value={passwordData.new} onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} placeholder="Yeni Şifre" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                    <input type="password" required value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} placeholder="Şifreyi Doğrula" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                    <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                      {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-6">
                  <Package className="text-blue-500 mr-3" size={28} />
                  <h2 className="text-2xl font-black text-gray-900">Siparişlerim</h2>
                </div>

                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                      <AlertCircle className="text-gray-300 mb-4" size={48} />
                      <p className="text-gray-500 font-medium">Henüz hiç siparişiniz bulunmuyor.</p>
                    </div>
                  ) : (
                    orders.map((order: OrderItem) => (
                      <div key={order.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Sipariş No</div>
                          <div className="font-black text-gray-900">#{order.id.substring(0, 8).toUpperCase()}</div>
                          <div className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
                        </div>
                        
                        <div className="flex flex-col md:items-end">
                          <div className="text-xl font-black text-gray-900 mb-2">{order.totalAmount} ₺</div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                              ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                              ${order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : ''}
                              ${order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' : ''}
                              ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : ''}
                              ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                              ${order.status === 'RETURNED' ? 'bg-gray-200 text-gray-600' : ''}
                              ${order.status === 'CANCEL_REQUESTED' ? 'bg-orange-100 text-orange-700 border border-orange-200' : ''}
                              ${order.status === 'RETURN_REQUESTED' ? 'bg-rose-100 text-rose-700 border border-rose-200' : ''}
                            `}>
                              {order.status === 'PENDING' && 'Bekliyor'}
                              {order.status === 'PROCESSING' && 'Hazırlanıyor'}
                              {order.status === 'SHIPPED' && 'Kargoda'}
                              {order.status === 'DELIVERED' && 'Teslim Edildi'}
                              {order.status === 'CANCELLED' && 'İptal Edildi'}
                              {order.status === 'RETURNED' && 'İade Edildi'}
                              {order.status === 'CANCEL_REQUESTED' && 'İptal Talebi Alındı'}
                              {order.status === 'RETURN_REQUESTED' && 'İade Talebi Alındı'}
                            </span>

                            {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                              <button 
                                onClick={() => handleRequestAction(order.id, 'CANCEL')}
                                className="text-[10px] font-bold text-orange-600 hover:text-orange-800 underline transition-colors"
                              >
                                İptal Talebi Oluştur
                              </button>
                            )}

                            {order.status === 'DELIVERED' && (
                              <button 
                                onClick={() => handleRequestAction(order.id, 'RETURN')}
                                className="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline transition-colors"
                              >
                                İade Talebi Oluştur
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🚀 YENİ: TASARIMA UYGUN MODERN FORM MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 relative scale-in-center">
            
            {/* Kapatma Butonu */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className={`p-4 rounded-3xl mb-4 ${activeOrder?.action === 'CANCEL' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'}`}>
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                {activeOrder?.action === 'CANCEL' ? 'İptal Talebi' : 'İade Talebi'}
              </h3>
              <p className="text-gray-500 mt-2 font-medium leading-relaxed">
                İşleminize devam edebilmemiz için lütfen bir neden belirtin.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Nedeniniz</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Örn: Ürünü yanlışlıkla aldım, iade etmek istiyorum..."
                className="w-full h-32 px-5 py-4 rounded-3xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none font-medium text-gray-700"
              />
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleSubmitRequest}
                  disabled={isRequesting}
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all
                    ${isRequesting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                >
                  {isRequesting ? 'İletiliyor...' : 'Talebi İlet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}