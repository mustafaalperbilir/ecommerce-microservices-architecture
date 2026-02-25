"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import Link from 'next/link';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  // Zustand store'dan login fonksiyonumuzu çekiyoruz
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('admin@ecommerce.com'); // Test için varsayılan dolu gelsin
  const [password, setPassword] = useState('supergizlisifre123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. API Gateway üzerinden Auth servisine giriş isteği fırlatıyoruz
      const response = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password
      });

      // 2. Başarılı olursa (200 OK), token ve user verisini alıyoruz
      if (response.status === 200) {
        const { token, user } = response.data;
        
        // 3. Zustand store'daki login fonksiyonunu çağırıp token'ı güvene alıyoruz
        login(token, user);
        
        // 4. Kullanıcıyı ana sayfaya (vitrine) yönlendiriyoruz
        router.push('/');
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrorMsg("E-posta veya şifre hatalı! Lütfen kontrol edin.");
      } else {
        setErrorMsg("Sunucuya ulaşılamadı. Docker ve API Gateway'in çalıştığından emin olun.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Hoş Geldin! 👋</h1>
          <p className="text-gray-500">Alışverişe başlamak için giriş yap</p>
        </div>

        {/* Hata Mesajı Kutusu */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* E-posta Alanı */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">E-posta Adresi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          {/* Şifre Alanı */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Şifre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Giriş Butonu */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all shadow-lg ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
            }`}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
            <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Hesabın yok mu?{' '}
          <Link href="/register" className="font-bold text-blue-600 hover:underline">
            Hemen Kayıt Ol
          </Link>
        </div>
      </div>
    </main>
  );
}