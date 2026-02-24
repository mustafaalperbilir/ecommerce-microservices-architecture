"use client"; // Zustand tarayıcıda çalıştığı için bu şart!

import Link from 'next/link';
import { ShoppingCart, Search, User, Menu } from 'lucide-react';
import { useCartStore } from '@/store/cartStore'; // Hafızayı çağırdık

export default function Navbar() {
  // Hafızadan toplam ürün sayısını çekiyoruz
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900">
              Tech<span className="text-blue-600">Store</span>.
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl mx-12">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Ürün, kategori veya marka ara..."
                className="w-full bg-gray-50 text-gray-900 rounded-full pl-6 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 transition-all"
              />
              <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-gray-600 hover:text-blue-600 transition-colors hidden sm:block">
              <User size={24} />
            </button>
            <Link href="/cart" className="text-gray-600 hover:text-blue-600 transition-colors relative">
              <ShoppingCart size={24} />
              {/* RAKAM BURADA CANLANIYOR */}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="md:hidden text-gray-600">
              <Menu size={24} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}