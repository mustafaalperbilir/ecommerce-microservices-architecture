"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Package, Loader2, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export default function ProductsReport() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.replace('/');
      return;
    }
    fetchProducts();
  }, [isAuthenticated, user, router]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/products');
      // İsteğe bağlı: Ürünleri ismine göre alfabetik sıralayalım
      const sortedProducts = response.data.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
      setProducts(sortedProducts);
    } catch (error) {
      console.error("Ürünler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Arama Filtresi: Kullanıcı yazarken listeyi anında daraltır
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Üst Kısım */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <Package className="mr-3 text-orange-500" size={32} />
              Kayıtlı Ürünler Raporu
            </h1>
            <p className="text-gray-500 mt-2">Mağazanızda yayında olan tüm ürünlerin genel dökümü.</p>
          </div>
          <Link href="/admin" className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <ArrowLeft size={16} className="mr-2" /> Panele Dön
          </Link>
        </div>

        {/* 🚀 Arama Çubuğu */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Ürün adı ile hızlıca ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all shadow-sm font-medium text-gray-700"
          />
        </div>

        {/* Liste Alanı */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Package className="text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-900">Ürün Bulunamadı</h3>
              <p className="text-gray-500">Arama kriterinize uygun veya mağazaya kayıtlı ürün yok.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-6 flex items-center justify-between hover:bg-orange-50 transition-colors">
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
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stok Durumu</span>
                    
                    {/* 🚀 Akıllı Stok Renklendirmesi */}
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm
                      ${product.stock > 10 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : ''}
                      ${product.stock > 0 && product.stock <= 10 ? 'bg-orange-100 text-orange-700 border border-orange-200' : ''}
                      ${product.stock === 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : ''}
                    `}>
                      {product.stock > 10 && `${product.stock} Adet`}
                      {product.stock > 0 && product.stock <= 10 && `Kritik (${product.stock})`}
                      {product.stock === 0 && 'Tükendi'}
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