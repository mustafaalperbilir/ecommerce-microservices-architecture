"use client";

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore'; // 1. YENİ EKLENDİ: Kullanıcı bilgisi için
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 2. YENİ EKLENDİ: Yönlendirme için

export default function CartPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, getTotalPrice } = useCartStore();
  const { user } = useAuthStore(); // Kullanıcı verisini çekiyoruz
  const [loading, setLoading] = useState(false); 
  const router = useRouter(); // Yönlendirme motorunu başlatıyoruz

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const token = localStorage.getItem('token');

    // Güvenliği artırdık: Hem token hem de user.id olmak zorunda
    if (!token || !user?.id) {
      alert("Güvenlik Uyarısı: Sipariş verebilmek için lütfen önce giriş yapın!");
      return; 
    }

    setLoading(true);
    try {
      // 🛠️ ASIL ÇÖZÜM BURADA: Backend'in beklediği o eksiksiz 3'lü paketi hazırladık!
      const orderData = {
        userId: user.id,               // KİM sipariş veriyor?
        totalAmount: getTotalPrice(),  // TOPLAM ne kadar tuttu?
        items: cart.map(item => ({     // İÇİNDE hangi ürünler var?
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await axios.post('http://localhost:4000/api/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      });

      if (response.status === 201) {
        alert("Siparişiniz başarıyla alındı! ✅");
        router.push('/orders'); // Başarılıysa doğrudan Siparişlerim sayfasına uçur!
      }
      
    } catch (error) {
      console.error("Sipariş hatası:", error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
         alert("Oturumunuzun süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın! 🔐");
      } else {
         alert("Sipariş oluşturulamadı! ❌\nLütfen Docker servislerinin ve API Gateway'in çalıştığından emin ol.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Sepetin şu an boş 🛒</h2>
        <Link href="/" className="text-blue-600 hover:underline flex items-center">
          <ArrowLeft size={18} className="mr-2" /> Alışverişe Devam Et
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-black text-gray-900 mb-10">Alışveriş Sepetim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Ürün Listesi */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                <p className="text-blue-600 font-black">{item.price} ₺</p>
              </div>

              {/* Miktar Kontrolü */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => decreaseQuantity(item.id)} 
                    className="p-1 hover:bg-white rounded-md transition-colors"
                    disabled={loading}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-700">{item.quantity}</span>
                  <button 
                    onClick={() => addToCart(item)} 
                    className="p-1 hover:bg-white rounded-md transition-colors"
                    disabled={loading}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sipariş Özeti */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 h-fit sticky top-28">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Sipariş Özeti</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-600">
              <span>Ara Toplam</span>
              <span>{getTotalPrice()} ₺</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Kargo</span>
              <span className="text-green-600">Ücretsiz</span>
            </div>
            <div className="border-t pt-4 flex justify-between text-2xl font-black text-gray-900">
              <span>Toplam</span>
              <span>{getTotalPrice()} ₺</span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200'
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <CreditCard size={20} />
            )}
            <span>{loading ? 'İşleniyor...' : 'Siparişi Tamamla'}</span>
          </button>
        </div>
      </div>
    </main>
  );
}