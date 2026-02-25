"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Loader2, Mail, Lock, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. API Gateway üzerinden Auth servisine kayıt isteği fırlatıyoruz
      const response = await axios.post('http://localhost:4000/api/auth/register', {
        email,
        password
      });

      // 2. Başarılı olursa (201 Created), kullanıcıyı bilgilendirip login'e atıyoruz
      if (response.status === 201) {
        setSuccessMsg("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
        
        // 2 saniye bekletip (mesajı okuması için) login sayfasına yolluyoruz
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
      if (axios.isAxiosError(error) && error.response) {
        // Backend'den gelen özel bir hata mesajı varsa onu göster (örn: "Bu email zaten kayıtlı")
        setErrorMsg(error.response.data.error || "Kayıt işlemi başarısız oldu.");
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
          <h1 className="text-3xl font-black text-gray-900 mb-2">Aramıza Katıl 🚀</h1>
          <p className="text-gray-500">Yeni bir hesap oluşturarak alışverişe başla</p>
        </div>

        {/* Başarı Mesajı Kutusu */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold text-center">
            {successMsg}
          </div>
        )}

        {/* Hata Mesajı Kutusu */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
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
                minLength={6}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="En az 6 karakter"
              />
            </div>
          </div>

          {/* Kayıt Butonu */}
          <button
            type="submit"
            disabled={loading || !!successMsg}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all shadow-lg ${
              loading || successMsg
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
            }`}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
            <span>{loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}</span>
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Zaten bir hesabın var mı?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Giriş Yap
          </Link>
        </div>
      </div>
    </main>
  );
}