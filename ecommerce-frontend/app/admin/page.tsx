"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
// 🚀 YENİ İKON EKLENDİ: İade talepleri için RefreshCcw
import { TrendingUp, Package, ShoppingBag, AlertCircle, Loader2, ArrowLeft, Activity, RefreshCcw } from 'lucide-react';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
  returnRequests: number; // 🚀 YENİ: İade talepleri sayısı eklendi
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0, totalOrders: 0, totalProducts: 0, lowStockCount: 0, pendingOrders: 0, returnRequests: 0
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

      const [ordersRes, productsRes] = await Promise.all([
        axios.get('http://localhost:4000/api/orders', { headers }),
        axios.get('http://localhost:4000/api/products')
      ]);

      const orders = ordersRes.data;
      const products = productsRes.data;

      const totalRevenue = orders
        .filter((o: { status: string; totalAmount: number }) => o.status !== 'CANCELLED' && o.status !== 'FAILED')
        .reduce((sum: number, order: { status: string; totalAmount: number }) => sum + order.totalAmount, 0);
      
      const pendingOrders = orders.filter((o: { status: string }) => o.status === 'PENDING').length;
      
      // 🚀 YENİ: İptal/İade talebi olanları sayıyoruz (CANCEL_REQUESTED veya RETURN_REQUESTED)
      const returnRequests = orders.filter((o: { status: string }) => o.status === 'CANCEL_REQUESTED' || o.status === 'RETURN_REQUESTED').length;
      
      const lowStockCount = products.filter((p: { stock: number }) => p.stock > 0 && p.stock <= 10).length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        lowStockCount,
        pendingOrders,
        returnRequests // State'e ekledik
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <Activity className="mr-3 text-indigo-500" size={32} />
              Mağaza İstatistikleri
            </h1>
            <div className="flex items-center space-x-4 mt-4">
              <Link href="/admin" className="text-sm font-bold border-b-2 border-indigo-500 text-indigo-600 pb-1">
                📊 Ana Panel
              </Link>
              <Link href="/admin/products" className="text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors pb-1">
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
          // 🚀 EKRAN YERLEŞİMİ DEĞİŞTİ: 5 kart olduğu için daha esnek bir grid yapısı (xl:grid-cols-5) kullandık
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            
            {/* 1. KART: Toplam Kazanç */}
            <Link href="/admin/orders" className="block group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-green-200 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-green-300 h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Toplam Kazanç</p>
                    <h3 className="text-3xl font-black">{stats.totalRevenue.toLocaleString('tr-TR')} ₺</h3>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl transition-transform group-hover:scale-110"><TrendingUp size={24} /></div>
                </div>
              </div>
            </Link>

            {/* 2. KART: Toplam Sipariş */}
            <Link href="/admin/orders" className="block group">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-blue-300 h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Toplam Sipariş</p>
                    <h3 className="text-3xl font-black">{stats.totalOrders}</h3>
                    {stats.pendingOrders > 0 && <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded-lg">{stats.pendingOrders} adet onay bekliyor</p>}
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl transition-transform group-hover:scale-110"><ShoppingBag size={24} /></div>
                </div>
              </div>
            </Link>

            {/* 3. KART: Kayıtlı Ürünler */}
            <Link href="/admin/reports/products" className="block group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-200 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-orange-300 h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-orange-100 text-sm font-medium mb-1">Kayıtlı Ürünler</p>
                    <h3 className="text-3xl font-black">{stats.totalProducts}</h3>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl transition-transform group-hover:scale-110"><Package size={24} /></div>
                </div>
              </div>
            </Link>

            {/* 4. KART: İade ve İptal Talepleri (YENİ) */}
            <Link href="/admin/reports/returns" className="block group">
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg shadow-rose-200 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-rose-300 h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-rose-100 text-sm font-medium mb-1">İade/İptal Talebi</p>
                    <h3 className={`text-3xl font-black ${stats.returnRequests > 0 ? 'text-white' : 'text-rose-200'}`}>
                      {stats.returnRequests}
                    </h3>
                    <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded-lg">
                      Müşteri talepleri
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl transition-transform group-hover:scale-110">
                    <RefreshCcw size={24} />
                  </div>
                </div>
              </div>
            </Link>

            {/* 5. KART: Kritik Stok */}
            <Link href="/admin/reports/critical-stock" className="block group">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 hover:shadow-2xl hover:border-red-100 h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Kritik Stok (Son 10)</p>
                    <h3 className={`text-3xl font-black ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                      {stats.lowStockCount}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">Tükenmek üzere olan ürünler</p>
                  </div>
                  <div className={`${stats.lowStockCount > 0 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'} p-3 rounded-2xl transition-transform group-hover:scale-110`}>
                    <AlertCircle size={24} />
                  </div>
                </div>
              </div>
            </Link>

          </div>
        )}
      </div>
    </main>
  );
}