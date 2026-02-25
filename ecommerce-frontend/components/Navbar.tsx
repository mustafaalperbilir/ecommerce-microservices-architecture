"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, LogOut, User, ShieldAlert, Search } from 'lucide-react'; 
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; 

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const cart = useCartStore((state) => state.cart);
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout(); 
    router.push('/login'); 
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?q=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Sol Taraf: Logo */}
        <Link href="/" className="text-2xl font-black text-gray-900 tracking-tighter hover:opacity-80 transition-opacity">
          Tech<span className="text-blue-600">Store.</span>
        </Link>

        {/* 🔎 Orta Taraf: Arama Çubuğu */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <form onSubmit={handleSearch} className="w-full relative group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün, kategori veya marka ara..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-6 pr-12 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all shadow-inner"
            />
            <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-600 transition-colors">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Sağ Taraf: Menü Elemanları */}
        <div className="flex items-center space-x-6">
          
          {isMounted && (
            <>
              {/* 🛡️ ZEKİ KALKAN: Admin değilse (Misafir veya Müşteri ise) bu alanı göster */}
              {user?.role !== 'ADMIN' && (
                <div className="flex items-center space-x-4">
                  
                  {/* Sepet (Misafirler ve Müşteriler görebilir) */}
                  <Link href="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <ShoppingCart size={24} />
                    {cartItemCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Kimlik Kontrolü */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 border-l pl-6 border-gray-200">
                  
                  {/* Sadece statik yazı yerine tıklanabilir "Hesabım" Butonu */}
                  <Link href="/profile" className="font-bold text-gray-700 flex items-center space-x-1 hover:text-blue-600 transition-colors">
                    <User size={18} className="text-blue-600"/>
                    <span className="hidden sm:inline-block">Hesabım</span>
                  </Link>

                  {user?.role === 'ADMIN' && (
                    <Link href="/admin" className="flex items-center space-x-1 text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">
                      <ShieldAlert size={16} />
                      <span className="hidden sm:inline-block">Panel</span>
                    </Link>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline-block">Çıkış</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
                  <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                    Giriş Yap
                  </Link>
                  <Link href="/register" className="text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all">
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </nav>
  );
}