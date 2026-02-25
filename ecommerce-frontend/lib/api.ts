import axios from 'axios';

// API Gateway adresimizi merkeze alıyoruz
const api = axios.create({
  baseURL: 'http://localhost:4000/api', 
});

// 🛡️ INTERCEPTOR: Dışarı çıkan her isteği havada yakala ve bilet ekle!
api.interceptors.request.use(
  (config) => {
    // Next.js'in sunucu tarafında (SSR) patlamaması için window kontrolü yapıyoruz
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // Eğer token varsa, yola çıkmadan önce çantasına koy
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gelen cevaplarda (Response) 401 hatası yakalarsak otomatik çıkış yaptırma mantığını
// ileride buraya ekleyeceğiz. Şimdilik sadece gönderirken token ekliyoruz.

export default api;