"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Package, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export default function CriticalStockReport() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.replace('/');
      return;
    }
    fetchCriticalStock();
  }, [isAuthenticated, user, router]);

  const fetchCriticalStock = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/products');
      const allProducts = response.data;
      
      // 🚀 FİLTRE: Stoğu 10 ve altında olan (ama 0'dan büyük olan) kritik ürünler
      const critical = allProducts.filter((p: Product) => p.stock > 0 && p.stock <= 10);
      
      // Stoğu en az olana göre sırala
      critical.sort((a: Product, b: Product) => a.stock - b.stock);
      setProducts(critical);
    } catch (error) {
      console.error("Kritik stok ürünleri çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-red-500" size={40} /></div>;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Üst Kısım */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <AlertCircle className="mr-3 text-red-500" size={32} />
              Kritik Stok Raporu
            </h1>
            <p className="text-gray-500 mt-2">Stoğu tükenmek üzere olan (10 adet ve altı) ürünlerin listesi.</p>
          </div>
          <Link href="/admin" className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <ArrowLeft size={16} className="mr-2" /> Panele Dön
          </Link>
        </div>

        {/* Liste Alanı */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Package className="text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-900">Harika!</h3>
              <p className="text-gray-500">Şu an kritik stok seviyesinde hiçbir ürününüz bulunmuyor.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {products.map((product) => (
                <div key={product.id} className="p-6 flex items-center justify-between hover:bg-red-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl mr-4 flex items-center justify-center overflow-hidden border border-gray-200">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="text-gray-400" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                      <p className="text-sm font-medium text-gray-500">{product.price} ₺</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Kalan Stok</span>
                    <span className="text-2xl font-black text-red-600 bg-red-100 px-4 py-1 rounded-xl">
                      {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}