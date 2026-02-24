import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Truck, ShieldCheck } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';

// 1. DEĞİŞİKLİK: TypeScript'e params'ın artık bir Promise olduğunu söylüyoruz
export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  
  // 2. DEĞİŞİKLİK: params'ı await ile bekleyip id'yi öyle çıkarıyoruz
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
        <p className="text-gray-500 mb-8">{"Backend'de ID'ye göre getirme rotası (GET /:id) yazmamış olabiliriz."}</p>
        <Link href="/" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="mr-2" size={20} /> Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-8 font-medium">
          <ArrowLeft className="mr-2" size={20} /> Vitrine Geri Dön
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12 lg:grid lg:grid-cols-2 lg:gap-12">
            <div className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center mb-8 lg:mb-0">
              <span className="text-gray-400 font-medium">Görsel Alanı</span>
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">{product.description}</p>
              
              <div className="flex items-center space-x-4 mb-8">
                <span className="text-4xl font-black text-blue-600">{product.price} ₺</span>
                <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  Stokta {product.stock} adet var
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center text-gray-600 text-sm">
                  <Truck className="text-blue-500 mr-2" size={20} /> Ücretsiz Kargo
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <ShieldCheck className="text-green-500 mr-2" size={20} /> Orijinal Ürün
                </div>
              </div>

              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}