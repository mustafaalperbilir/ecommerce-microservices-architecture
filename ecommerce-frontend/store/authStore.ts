import { create } from 'zustand';

// 1. ÇÖZÜM: Kullanıcı nesnesinin neye benzediğini kesin olarak tanımlıyoruz
export interface User {
  id: string;
  email?: string;
  role: string;
  // Eğer backend'den gelen başka veriler varsa (isim vb.) buraya ekleyebilirsin
}

interface AuthState {
  token: string | null;
  user: User | null; // 'any' yerine 'User' yazdık
  isAuthenticated: boolean;
  login: (token: string, user: User) => void; // 'any' yerine 'User' yazdık
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Sayfa ilk açıldığında localStorage'a bak, token varsa giriş yapmış say
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,

  // Giriş yapıldığında çalışacak fonksiyon
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  // Çıkış yapıldığında çalışacak fonksiyon
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));