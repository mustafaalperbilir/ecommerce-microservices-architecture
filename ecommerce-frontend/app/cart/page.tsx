'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useCartStore, CartItem } from '@/store/cartStore'; 

export default function CartPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  // 🚀 YENİ: Sayfa adımlarını ve adres formunu tutan state'ler
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: ''
  });

  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleIncrease = (item: CartItem) => {
    addToCart({ 
      id: item.id, 
      name: item.name, 
      price: item.price, 
      image: item.image, 
      category: item.category 
    });
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity === 1) {
      removeFromCart(item.id);
    } else {
      decreaseQuantity(item.id);
    }
  };

  // 🚀 ADRES FORMUNU TAKİP EDEN FONKSİYON
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    // 🚀 GÜVENLİK: Eğer adres adımındaysak ve boş alan varsa durdur
    if (step === 'checkout' && (!addressForm.fullName || !addressForm.phone || !addressForm.address)) {
      setErrorMessage('Lütfen tüm teslimat bilgilerini eksiksiz doldurun! ⚠️');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 🚀 ADRES BİLGİLERİNİ ÇİVİLE: Önce sepeti, sonra adresi kaydediyoruz
      localStorage.setItem('pendingOrder', JSON.stringify({
        items: cart,
        totalAmount: totalAmount
      }));
      
      localStorage.setItem('shippingAddress', JSON.stringify(addressForm));

      const response = await axios.post('http://localhost:5003/api/payment/start', 
        { items: cart, total: totalAmount }, 
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data && response.data.paymentPageUrl) {
        window.location.href = response.data.paymentPageUrl;
      } 
      else if (response.data && response.data.checkoutFormContent) {
         const formContainer = document.getElementById('iyzico-form-container');
         if (formContainer) {
            formContainer.innerHTML = response.data.checkoutFormContent;
         } else {
            setErrorMessage('Form yüklenirken sistemsel bir arıza oluştu.');
         }
      } 
      else {
        setErrorMessage('Iyzico ödeme linki oluşturulamadı.');
      }

    } catch (error) {
      setErrorMessage('Ödeme başlatılamadı! Lütfen Docker servislerinin çalıştığından emin ol. ❌');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ÜST BAŞLIK VE ADIM GÖSTERGESİ */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {step === 'cart' ? 'Alışveriş Sepetim' : 'Teslimat Bilgileri'} 
            <span className="text-gray-400 text-xl font-normal ml-2">({cart.length} Çeşit Ürün)</span>
            </h1>
            
            <div className="flex items-center gap-2 text-sm font-bold">
                <span className={`${step === 'cart' ? 'text-blue-600' : 'text-gray-400'}`}>Sepet</span>
                <span className="text-gray-300">/</span>
                <span className={`${step === 'checkout' ? 'text-blue-600' : 'text-gray-400'}`}>Adres & Ödeme</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-4">
            {cart.length === 0 ? (
               <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
                 <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                   <span className="text-4xl">🛒</span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Sepetiniz şu an boş</h3>
                 <p className="text-gray-500 mb-6">Sepetinize ürün ekleyerek alışverişe başlayabilirsiniz.</p>
                 <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md">
                   Alışverişe Başla
                 </Link>
               </div>
            ) : (
              // 🚀 SOL TARAF DEĞİŞKEN ALAN: Sepet mi? Adres mi?
              step === 'cart' ? (
                cart.map((item) => {
                    const imgSrc = item.image;
                    const categoryText = item.category || 'Genel Ürün';
                    return (
                      <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 transition-all hover:shadow-md">
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-200 flex items-center justify-center">
                          {imgSrc ? (
                            <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">📦</span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row justify-between w-full">
                          <div className="mb-4 sm:mb-0">
                            <p className="text-sm text-gray-500 mb-1 capitalize">{categoryText}</p>
                            <h2 className="text-lg font-bold text-gray-800 line-clamp-2">{item.name}</h2>
                            <p className="text-blue-600 font-extrabold mt-2 text-xl">{item.price.toLocaleString('tr-TR')} ₺</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48">
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-1 shadow-inner">
                              <button onClick={() => handleDecrease(item)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-red-500 rounded-md transition-all font-bold text-lg">−</button>
                              <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                              <button onClick={() => handleIncrease(item)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-blue-500 rounded-md transition-all font-bold text-lg">+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                })
              ) : (
                /* 🚀 ADRES FORMU */
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-left-4 duration-300">
                    <button onClick={() => setStep('cart')} className="text-blue-600 font-bold mb-6 flex items-center gap-2 hover:underline">
                        ← Sepete Geri Dön
                    </button>
                    <h2 className="text-xl font-bold mb-6 text-gray-800">Kargo ve Teslimat Bilgileri</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-600 mb-2">Ad Soyad</label>
                            <input name="fullName" value={addressForm.fullName} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Teslim alacak kişinin adı" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Telefon</label>
                            <input name="phone" value={addressForm.phone} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="05XX XXX XX XX" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Şehir</label>
                            <input name="city" value={addressForm.city} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Örn: İstanbul" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-600 mb-2">Açık Adres</label>
                            <textarea name="address" value={addressForm.address} onChange={handleInputChange} rows={3} className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Mahalle, sokak, kapı no..." />
                        </div>
                    </div>
                </div>
              )
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6">Sipariş Özeti</h2>
              <div className="space-y-4 mb-6 text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Ara Toplam</span>
                  <span className="font-semibold text-gray-800">{totalAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kargo Ücreti</span>
                  {totalAmount > 0 ? (
                    <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md text-sm">Ücretsiz</span>
                  ) : (
                    <span className="font-semibold text-gray-800">0 ₺</span>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6 mb-8">
                <div className="flex justify-between items-center text-2xl font-black text-gray-900">
                  <span>Toplam</span>
                  <span className="text-blue-600">{totalAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <button 
                onClick={step === 'cart' ? () => setStep('checkout') : handlePayment} 
                disabled={isLoading || cart.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  isLoading || cart.length === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-xl'
                }`}
              >
                {isLoading ? '⏳ İşleniyor...' : (step === 'cart' ? 'Devam Et →' : '💳 Ödemeye Geç')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}