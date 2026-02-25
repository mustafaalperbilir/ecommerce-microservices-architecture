"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { 
  TrendingUp, Package, ShoppingBag, AlertCircle, 
  Loader2, ArrowLeft, Activity 
} from 'lucide-react';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    setIsMounted(true);
    if (isMounted && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.replace('/');
    } else if (isMounted) {
      fetchDashboardData();
    }
  }, [isMounted, isAuthenticated, user, router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Promise.all ile iki servise aynı anda (paralel) istek atıyoruz!
      const [ordersRes, productsRes] = await Promise.all([
        axios.get('http://localhost:4000/api/orders', { headers }),
        axios.get('http://localhost:4000/api/products')
      ]);

      const orders = ordersRes.data;
      const products = productsRes.data;

      // İstatistikleri Hesaplama Mantığı
     // İstatistikleri Hesaplama Mantığı
      // 🚀 GERÇEK TİCARİ KAZANÇ HESAPLAMA MANTIĞI (DÜZELTİLDİ)
      const totalRevenue = orders
        .filter((o: { status: string; totalAmount: number }) => 
          // Sadece iptal edilenleri ve ödemesi patlayanları çıkar, gerisini kasaya ekle!
          o.status !== 'CANCELLED' && o.status !== 'FAILED'
        )
        .reduce((sum: number, order: { status: string; totalAmount: number }) => sum + order.totalAmount, 0);
      
      const pendingOrders = orders.filter((o: { status: string }) => o.status === 'PENDING').length;
      
      const lowStockCount = products.filter((p: { stock: number }) => p.stock > 0 && p.stock <= 10).length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        lowStockCount,
        pendingOrders
      });

    } catch (error) {
      console.error("İstatistikler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted || user?.role !== 'ADMIN') return null;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Üst Başlık ve Navigasyon */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <Activity className="mr-3 text-indigo-500" size={32} />
              Mağaza İstatistikleri
            </h1>
            <div className="flex items-center space-x-4 mt-4">
              <Link href="/admin/dashboard" className="text-sm font-bold border-b-2 border-indigo-500 text-indigo-600 pb-1">
                📊 İstatistikler
              </Link>
              <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors pb-1">
                📦 Ürün Yönetimi
              </Link>
              <Link href="/admin/orders" className="text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors pb-1">
                🛒 Sipariş Yönetimi
              </Link>
            </div>
          </div>
          <Link href="/" className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <ArrowLeft size={16} className="mr-2" /> Vitrine Dön
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Ciro Kartı */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-green-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Toplam Kazanç</p>
                  <h3 className="text-3xl font-black">{stats.totalRevenue.toLocaleString('tr-TR')} ₺</h3>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl"><TrendingUp size={24} /></div>
              </div>
            </div>

            {/* Sipariş Kartı */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Toplam Sipariş</p>
                  <h3 className="text-3xl font-black">{stats.totalOrders}</h3>
                  {stats.pendingOrders > 0 && (
                    <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded-lg">
                      {stats.pendingOrders} adet onay bekliyor
                    </p>
                  )}
                </div>
                <div className="bg-white/20 p-3 rounded-2xl"><ShoppingBag size={24} /></div>
              </div>
            </div>

            {/* Ürün Kartı */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Kayıtlı Ürünler</p>
                  <h3 className="text-3xl font-black">{stats.totalProducts}</h3>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl"><Package size={24} /></div>
              </div>
            </div>

            {/* Kritik Stok Kartı */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Kritik Stok (Son 10)</p>
                  <h3 className={`text-3xl font-black ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {stats.lowStockCount}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2">Tükenmek üzere olan ürünler</p>
                </div>
                <div className={`${stats.lowStockCount > 0 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'} p-3 rounded-2xl`}>
                  <AlertCircle size={24} />
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}