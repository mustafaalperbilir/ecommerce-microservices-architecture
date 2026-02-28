'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { useCartStore } from '@/store/cartStore';

export default function PaymentSuccessPage() {
  const [orderInfo, setOrderInfo] = useState({
    orderNumber: 'Yükleniyor...',
    date: 'Yükleniyor...'
  });
  const [isProcessing, setIsProcessing] = useState(true);

  const clearCart = useCartStore((state) => state.clearCart);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

   // 1. Önce fonksiyonun dışında şu basit tipi tanımlayalım (Hata almamak için)
interface LocalItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const saveOrderToDatabase = async () => {
  try {
    // 1. Yedeklenen sepeti ve YENİ yedeklenen adres bilgilerini okuyoruz
    const pendingOrderData = localStorage.getItem('pendingOrder');
    const shippingAddressData = localStorage.getItem('shippingAddress'); // 👈 ADRESİ ÇEKTİK
    
    if (!pendingOrderData) {
      setIsProcessing(false);
      return;
    }

    const { items, totalAmount } = JSON.parse(pendingOrderData) as { items: LocalItem[], totalAmount: number };
    
    // Adres verisini güvenlice parse ediyoruz (boş olma ihtimaline karşı önlem)
    const shipping = shippingAddressData ? JSON.parse(shippingAddressData) : {};

    // Prisma'nın beklediği format (id -> productId)
    const formattedItems = items.map((item: LocalItem) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    let userId = '1';
    let token = '';

    const authData = localStorage.getItem('auth-storage') || localStorage.getItem('user');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        userId = parsed?.state?.user?.id || parsed?.id || '1';
        token = parsed?.state?.token || parsed?.token || localStorage.getItem('token') || '';
      } catch (e) {
        console.error("Kimlik verisi okunurken hata:", e);
      }
    }

    // 🚀 BÜYÜK FİNAL: Hem siparişi hem de adresi Backend'e paketliyoruz!
    const response = await axios.post('http://localhost:4000/api/orders', {
      userId,
      items: formattedItems,
      totalAmount,
      // 👇 İŞTE BEKLENEN ADRES BİLGİLERİ!
      fullName: shipping.fullName, 
      phone: shipping.phone,       
      city: shipping.city,         
      address: shipping.address    
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("✅ Sipariş ve Adres Veritabanına Çakıldı:", response.data);

    const dbOrderId = (response.data.order?.id as string) || '';
    const shortOrderId = dbOrderId 
      ? dbOrderId.substring(dbOrderId.length - 6).toUpperCase() 
      : Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    setOrderInfo({
      orderNumber: 'TS-' + shortOrderId,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    });

    // 🧹 TEMİZLİK VAKTİ: Hem sepet yedeğini hem de adres yedeğini siliyoruz
    localStorage.removeItem('pendingOrder');
    localStorage.removeItem('shippingAddress'); 
    if (clearCart) clearCart();

  } catch (err) {
    const error = err as AxiosError<{ error?: string; message?: string }>;
    console.error("❌ Sipariş Kayıt Hatası:", error.response?.data || error.message);

    setOrderInfo({
      orderNumber: 'ERR-' + Math.floor(Math.random() * 100000).toString(),
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    });
  } finally {
    setIsProcessing(false);
  }
};

    saveOrderToDatabase();
  }, [clearCart]); 

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 transform transition-all hover:scale-[1.01]">
        
        {isProcessing ? (
          <div className="text-center py-10">
             <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
             <h2 className="text-2xl font-bold text-gray-800">Siparişiniz İşleniyor...</h2>
             <p className="text-gray-500 mt-2">Lütfen sayfayı kapatmayın, siparişiniz kaydediliyor.</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Ödemeniz Başarılı!
              </h2>
              <p className="mt-3 text-lg text-gray-500">
                Siparişiniz başarıyla alındı ve veritabanına kaydedildi. Bizi tercih ettiğiniz için teşekkür ederiz.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Sipariş Detayları</h3>
              <dl className="space-y-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500">Sipariş Numarası:</dt>
                  <dd className="font-bold text-gray-900 text-lg">{orderInfo.orderNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500">Tarih:</dt>
                  <dd className="font-semibold text-gray-900">{orderInfo.date}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500">Ödeme Yöntemi:</dt>
                  <dd className="font-semibold text-gray-900">Kredi Kartı (Iyzico)</dd>
                </div>
              </dl>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 text-sm text-blue-700">
                  <p>Siparişinizin durumunu <strong>Siparişlerim</strong> bölümünden anlık olarak takip edebilirsiniz.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="w-full sm:w-1/2 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                Ana Sayfaya Dön
              </Link>
              <Link href="/profile" className="w-full sm:w-1/2 flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Siparişlerime Git
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}