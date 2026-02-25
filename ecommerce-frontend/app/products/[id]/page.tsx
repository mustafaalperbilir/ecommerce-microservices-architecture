import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Truck, ShieldCheck } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  let product = null;

  try {
    const response = await axios.get(`http://localhost:4000/api/products/${id}`);
    product = response.data;
  } catch (error) {
    console.error("Ürün detayı çekilemedi:", error);
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Ürün Bulunamadı 😕</h1>
        <p className="text-gray-500 mb-8">{"Backend'de ID'ye göre getirme rotası yazılmamış olabilir."}</p>
        <Link href="/" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="mr-2" size={20} /> Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-8 font-medium">
          <ArrowLeft className="mr-2" size={20} /> Vitrine Geri Dön
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12 lg:grid lg:grid-cols-2 lg:gap-12">
            
            {/* 🚀 1. DÜZELTME: Görseli tekrar dinamik hale getirdik */}
            <div className="bg-gray-50 rounded-2xl aspect-square flex items-center justify-center mb-8 lg:mb-0 overflow-hidden border border-gray-50">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <span className="text-gray-400 font-medium">Görsel Mevcut Değil</span>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{product.name}</h1>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed font-medium">{product.description}</p>
              
              <div className="flex items-center space-x-6 mb-8">
                <span className="text-4xl font-black text-blue-600">{product.price} ₺</span>
                
                {/* 🚀 2. DÜZELTME: Stok sayısını sildik, sadece durum gösteriyoruz */}
                {product.stock > 0 ? (
                  <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black flex items-center shadow-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                    STOKTA VAR
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs font-black flex items-center shadow-sm">
                    <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
                    TÜKENDİ
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex items-center text-gray-500 text-sm font-bold bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <Truck className="text-blue-500 mr-2" size={20} /> Ücretsiz Kargo
                </div>
                <div className="flex items-center text-gray-500 text-sm font-bold bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <ShieldCheck className="text-green-500 mr-2" size={20} /> Orijinal Ürün
                </div>
              </div>

              {/* Sepete Ekle Butonu */}
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}