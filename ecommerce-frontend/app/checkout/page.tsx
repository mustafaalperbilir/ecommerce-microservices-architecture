'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinueToPayment = () => {
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    // 🚀 ADRES BİLGİLERİNİ YEDEKLE
    localStorage.setItem('shippingAddress', JSON.stringify(formData));
    
    // Ödeme sayfasına (sepet sayfandaki handlePayment mantığına) yönlendir
    // Şimdilik kafa karışıklığı olmasın diye sepet sayfasına geri gönderip 
    // orada ödemeyi tetikletebiliriz ya da ödeme kodunu buraya taşıyabiliriz.
    router.push('/cart?step=payment');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Teslimat Bilgileri</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ad Soyad</label>
              <input 
                type="text" name="fullName" onChange={handleInputChange}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Örn: Ahmet Yılmaz" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Telefon Numarası</label>
              <input 
                type="tel" name="phone" onChange={handleInputChange}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="05xx xxx xx xx" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Şehir</label>
                <input 
                  type="text" name="city" onChange={handleInputChange}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Örn: İstanbul" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">İlçe</label>
                <input 
                  type="text" className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Örn: Beşiktaş" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tam Adres</label>
              <textarea 
                name="address" onChange={handleInputChange}
                rows={3}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Sokak, bina no, daire no..." 
              />
            </div>
          </div>

          <div className="mt-10 border-t pt-8">
            <div className="flex justify-between items-center mb-6 text-xl font-bold">
              <span>Toplam Tutar:</span>
              <span className="text-blue-600">{totalAmount.toLocaleString('tr-TR')} ₺</span>
            </div>

            <button 
              onClick={handleContinueToPayment}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg"
            >
              Ödemeye Geç 💳
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}