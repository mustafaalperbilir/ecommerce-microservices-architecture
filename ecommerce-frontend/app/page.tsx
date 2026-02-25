"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Gateway'e ulaşılamadı:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Öne Çıkan Ürünler
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <p className="text-gray-500 text-lg">Şu an vitrinde ürün yok...</p>
          ) : (
            products.map((product: Product) => {
              // 🚀 KART İÇERİĞİ (Tekrar etmemek için bir değişkene aldık)
              const CardContent = (
                <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300
                  ${!isAdmin ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer group' : 'cursor-default opacity-95'}
                `}>
                  
                  {/* GÖRSEL ALANI */}
                  <div className="aspect-square w-full bg-gray-50 relative overflow-hidden border-b border-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className={`w-full h-full object-cover transition-transform duration-500 ${!isAdmin && 'group-hover:scale-110'}`} 
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <ImageIcon size={40} className="mb-2 opacity-50" />
                        <span className="text-xs font-medium">Görsel Yok</span>
                      </div>
                    )}
                  </div>

                  {/* METİN ALANI */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className={`text-xl font-bold text-gray-800 mb-2 truncate transition-colors ${!isAdmin && 'group-hover:text-blue-600'}`}>
                      {product.name}
                    </h2>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xl font-black text-gray-900">{product.price} ₺</span>
                      
                      {product.stock > 0 ? (
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter shadow-sm
                          ${isAdmin ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-600'}
                        `}>
                          {isAdmin ? `📦 ${product.stock} Adet` : 'Stokta Var'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg uppercase tracking-tighter">
                          Tükendi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );

              // 🚀 KRİTİK KARAR: Admin ise sadece içeriği göster, değilse Link ile sarmala
              return isAdmin ? (
                <div key={product.id}>{CardContent}</div>
              ) : (
                <Link href={`/products/${product.id}`} key={product.id} className="block h-full">
                  {CardContent}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}